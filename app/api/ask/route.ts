import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { askRequestSchema } from '@/lib/schemas';
import { embedOne, chatCompletion } from '@/lib/openrouter';
import {
  buildPrompt,
  parseLLMAnswer,
  matchCitation,
  type RetrievedChunk,
} from '@/lib/prompt';
import { checkNetworkQuota } from '@/lib/rateLimit';
import { timestampedYouTubeUrl, fmtTimestamp } from '@/lib/youtube';
import { screenQuestion } from '@/lib/guardrails';
import { getAppSettings } from '@/lib/appSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEADERBOARD_REFRESH_MS = 60_000;
let lastLeaderboardRefresh = 0;
function maybeRefreshLeaderboard() {
  const now = Date.now();
  if (now - lastLeaderboardRefresh < LEADERBOARD_REFRESH_MS) return;
  lastLeaderboardRefresh = now;
  void Promise.resolve(supabaseService().rpc('fn_refresh_leaderboard')).then(
    (r) => {
      if (r.error) console.error('[ask] leaderboard refresh failed', r.error);
    },
    (err) => console.error('[ask] leaderboard refresh threw', err),
  );
}

export async function POST(req: Request) {
  // ---- 1. Auth ----
  const userClient = await supabaseServer();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  // ---- 2. Validate input shape ----
  let payload: { text: string; episodeFilter: string[] };
  try {
    const json = await req.json();
    const parsed = askRequestSchema.parse(json);
    payload = { text: parsed.text.trim(), episodeFilter: parsed.episodeFilter ?? [] };
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // ---- 3. Guardrail pre-filter (injection / hate / sexual / abuse / obfuscation) ----
  const guard = screenQuestion(payload.text);
  if (!guard.ok) {
    return NextResponse.json(
      { error: 'refused', code: guard.code, reason: guard.reasonAr },
      { status: 400 },
    );
  }
  const cleaned = guard.cleaned;

  // ---- 4. Network-wide daily rate limit (before we spend $ on embeddings) ----
  const netLimit = await checkNetworkQuota(req);
  if (!netLimit.ok) {
    return NextResponse.json({ error: 'rate_limited', reason: netLimit.reason }, { status: 429 });
  }

  // ---- 5. Per-user 10-question quota + insert the question row atomically ----
  const { data: questionId, error: askErr } = await userClient.rpc('fn_ask', {
    q: cleaned,
    ep_filter: payload.episodeFilter,
  });
  if (askErr) {
    const msg = askErr.message ?? '';
    if (msg.includes('quota_exceeded')) {
      return NextResponse.json(
        {
          error: 'quota_exceeded',
          reason: 'لقد بلغتَ الحدّ الأقصى من الأسئلة (١٠). شكراً لاستخدام المساعد.',
        },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: 'ask_failed', details: msg }, { status: 500 });
  }

  // ---- 6. Embed the question ----
  const settings = await getAppSettings();
  let qvec: number[];
  try {
    qvec = await embedOne(cleaned, settings.embedModel);
  } catch (e) {
    return NextResponse.json({ error: 'embedding_failed', details: String(e) }, { status: 502 });
  }

  // ---- 7. Vector search ----
  const qvecLiteral = `[${qvec.join(',')}]`;
  const { data: rows, error: searchErr } = await userClient.rpc('fn_vector_search', {
    qvec: qvecLiteral,
    ep_filter: payload.episodeFilter,
    k: 8,
  });
  if (searchErr) {
    return NextResponse.json({ error: 'search_failed', details: searchErr.message }, { status: 500 });
  }

  const chunks: RetrievedChunk[] = (rows ?? []).map((r: Record<string, unknown>) => ({
    id: String(r.id),
    episode_id: String(r.episode_id),
    episode_num: Number(r.episode_num),
    episode_title: String(r.episode_title),
    guest_name: String(r.guest_name),
    youtube_id: String(r.youtube_id),
    start_sec: Number(r.start_sec),
    end_sec: Number(r.end_sec),
    // Speaker label comes from the episode's guest record (denormalized
    // onto the chunk at ingest time), so the UI never falls back to the
    // colon-prefix heuristic.
    speaker: (r.speaker_ar as string) || String(r.guest_name) || null,
    content: String(r.content_ar),
  }));

  if (chunks.length === 0) {
    const answerText =
      'بحثت في أرشيف الحلقات ولم أجد مقاطع مرتبطة بسؤالك. جرّب صياغةً مختلفة أو اختر من الأسئلة الشائعة.';
    const { data: ansId } = await supabaseService().rpc('fn_save_answer', {
      p_user_id: user.id,
      p_question_id: questionId,
      p_text: answerText,
      p_model: settings.chatModel,
      p_chunk_ids: [],
    });
    return NextResponse.json({
      answerId: ansId,
      status: 'refused',
      refusalReason: 'لا توجد مقاطع ذات صلة.',
      text: answerText,
      citations: [],
    });
  }

  // ---- 8. LLM call (JSON mode) ----
  let rawLLM: string;
  let modelUsed: string;
  try {
    const completion = await chatCompletion({
      messages: buildPrompt(cleaned, chunks),
      temperature: 0.1,
      maxTokens: 1400,
      jsonMode: true,
      model: settings.chatModel,
    });
    rawLLM = completion.text;
    modelUsed = completion.model;
  } catch (e) {
    return NextResponse.json({ error: 'llm_failed', details: String(e) }, { status: 502 });
  }

  const parsed = parseLLMAnswer(rawLLM);

  // ---- 9. Handle refusal branch ----
  if (parsed.status === 'refused') {
    const refusalText =
      parsed.refusal_reason_ar?.trim() ||
      'لا أستطيع الإجابة على هذا السؤال. رجاءً اطرح سؤالاً عن محتوى الحلقات.';
    const { data: ansId, error: saveErr } = await supabaseService().rpc('fn_save_answer', {
      p_user_id: user.id,
      p_question_id: questionId,
      p_text: refusalText,
      p_model: modelUsed,
      p_chunk_ids: [],
    });
    if (saveErr) {
      return NextResponse.json({ error: 'save_failed', details: saveErr.message }, { status: 500 });
    }
    return NextResponse.json({
      answerId: ansId,
      status: 'refused',
      refusalReason: refusalText,
      text: refusalText,
      citations: [],
    });
  }

  // ---- 10. Match LLM citations back to actual chunks + validate highlights ----
  const usedIds: string[] = [];
  const seen = new Set<string>();
  const shaped: {
    chunkId: string;
    episodeId: string;
    episodeNum: number;
    episodeTitle: string;
    guestName: string;
    speaker: string | null;
    startSec: number;
    endSec: number;
    timestamp: string;
    timestampEnd: string;
    youtubeUrl: string;
    quoteAr: string;
    highlightAr: string | null;
  }[] = [];

  for (const cite of parsed.citations) {
    const m = matchCitation(cite, chunks);
    if (!m) continue;
    if (seen.has(m.chunk.id)) continue;
    seen.add(m.chunk.id);
    usedIds.push(m.chunk.id);
    shaped.push({
      chunkId: m.chunk.id,
      episodeId: m.chunk.episode_id,
      episodeNum: m.chunk.episode_num,
      episodeTitle: m.chunk.episode_title,
      guestName: m.chunk.guest_name,
      speaker: m.chunk.speaker || m.chunk.guest_name,
      startSec: m.chunk.start_sec,
      endSec: m.chunk.end_sec,
      timestamp: fmtTimestamp(m.chunk.start_sec),
      timestampEnd: fmtTimestamp(m.chunk.end_sec),
      youtubeUrl: m.chunk.youtube_id ? timestampedYouTubeUrl(m.chunk.youtube_id, m.chunk.start_sec) : '',
      quoteAr: m.chunk.content.length > 360 ? `${m.chunk.content.slice(0, 360)}…` : m.chunk.content,
      highlightAr: m.highlight,
    });
  }

  // Fallback: if the model emitted no valid citations, attach top-3 retrieved
  // (no highlights — we never invent them).
  if (shaped.length === 0) {
    for (const c of chunks.slice(0, 3)) {
      usedIds.push(c.id);
      shaped.push({
        chunkId: c.id,
        episodeId: c.episode_id,
        episodeNum: c.episode_num,
        episodeTitle: c.episode_title,
        guestName: c.guest_name,
        speaker: c.speaker || c.guest_name,
        startSec: c.start_sec,
        endSec: c.end_sec,
        timestamp: fmtTimestamp(c.start_sec),
        timestampEnd: fmtTimestamp(c.end_sec),
        youtubeUrl: c.youtube_id ? timestampedYouTubeUrl(c.youtube_id, c.start_sec) : '',
        quoteAr: c.content.length > 360 ? `${c.content.slice(0, 360)}…` : c.content,
        highlightAr: null,
      });
    }
  }

  // ---- 11. Persist answer + citations (service-role; fn_save_answer is no
  //          longer callable from PostgREST so the leaderboard can't be
  //          gamed by direct RPC with arbitrary chunk_ids). ----
  const { data: answerId, error: saveErr } = await supabaseService().rpc('fn_save_answer', {
    p_user_id: user.id,
    p_question_id: questionId,
    p_text: parsed.answer_ar,
    p_model: modelUsed,
    p_chunk_ids: usedIds,
  });
  if (saveErr) {
    return NextResponse.json({ error: 'save_failed', details: saveErr.message }, { status: 500 });
  }

  // Fire-and-forget leaderboard refresh, throttled to once per minute per
  // serverless instance. The daily Vercel cron is the source of truth; this
  // just keeps the leaderboard fresh during bursts without hammering the MV.
  maybeRefreshLeaderboard();

  return NextResponse.json({
    answerId,
    status: 'answered',
    text: parsed.answer_ar,
    citations: shaped,
    networkRemaining: netLimit.remaining,
  });
}
