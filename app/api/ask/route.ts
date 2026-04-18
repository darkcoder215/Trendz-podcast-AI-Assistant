import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { askRequestSchema } from '@/lib/schemas';
import { embedOne, chatCompletion } from '@/lib/openrouter';
import { buildPrompt, extractCitationMarkers, type RetrievedChunk } from '@/lib/prompt';
import { checkNetworkQuota } from '@/lib/rateLimit';
import { timestampedYouTubeUrl, fmtTimestamp } from '@/lib/youtube';
import { env } from '@/lib/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // ---- 1. Auth ----
  const userClient = await supabaseServer();
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  }

  // ---- 2. Validate input ----
  let payload: { text: string; episodeFilter: string[] };
  try {
    const json = await req.json();
    const parsed = askRequestSchema.parse(json);
    payload = { text: parsed.text.trim(), episodeFilter: parsed.episodeFilter ?? [] };
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  // ---- 3. Network-wide rate limit (IP + UA + day) ----
  const netLimit = await checkNetworkQuota(req);
  if (!netLimit.ok) {
    return NextResponse.json({ error: 'rate_limited', reason: netLimit.reason }, { status: 429 });
  }

  // ---- 4. Per-user quota + insert question atomically ----
  const { data: questionId, error: askErr } = await userClient.rpc('fn_ask', {
    q: payload.text,
    ep_filter: payload.episodeFilter,
  });
  if (askErr) {
    const msg = askErr.message ?? '';
    if (msg.includes('quota_exceeded')) {
      return NextResponse.json(
        { error: 'quota_exceeded', reason: 'لقد بلغتَ الحدّ الأقصى من الأسئلة (١٠). شكراً لاستخدام المساعد.' },
        { status: 429 },
      );
    }
    return NextResponse.json({ error: 'ask_failed', details: msg }, { status: 500 });
  }

  // ---- 5. Embed the question ----
  let qvec: number[];
  try {
    qvec = await embedOne(payload.text);
  } catch (e) {
    return NextResponse.json({ error: 'embedding_failed', details: String(e) }, { status: 502 });
  }

  // ---- 6. Vector search ----
  // pgvector expects a string literal like '[0.1,0.2,...]'; PostgREST converts
  // JSON arrays to this format automatically but we stringify defensively.
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
    start_sec: Number(r.start_sec),
    speaker: (r.speaker_ar as string) || null,
    content: String(r.content_ar),
  }));

  if (chunks.length === 0) {
    const answerText = 'بحثت في أرشيف الحلقات ولم أجد مقاطع مرتبطة بسؤالك. جرّب صياغةً مختلفة أو اختر من الأسئلة الشائعة.';
    const { data: ansId } = await userClient.rpc('fn_save_answer', {
      p_question_id: questionId,
      p_text: answerText,
      p_model: env.CHAT_MODEL(),
      p_chunk_ids: [],
    });
    return NextResponse.json({ answerId: ansId, text: answerText, citations: [] });
  }

  // ---- 7. Generate answer ----
  let answerText: string;
  let modelUsed: string;
  try {
    const completion = await chatCompletion({
      messages: buildPrompt(payload.text, chunks),
      temperature: 0.15,
      maxTokens: 1200,
    });
    answerText = completion.text;
    modelUsed = completion.model;
  } catch (e) {
    return NextResponse.json({ error: 'llm_failed', details: String(e) }, { status: 502 });
  }

  // ---- 8. Map [ep:NUM@MM:SS] markers back to chunk IDs we gave the model ----
  const markers = extractCitationMarkers(answerText);
  const usedChunkIds: string[] = [];
  const usedChunks: RetrievedChunk[] = [];
  const seen = new Set<string>();
  for (const m of markers) {
    const c = chunks.find((ch) => ch.episode_num === m.episodeNum && Math.abs(ch.start_sec - m.startSec) <= 60);
    if (c && !seen.has(c.id)) {
      usedChunkIds.push(c.id);
      usedChunks.push(c);
      seen.add(c.id);
    }
  }
  // Fallback: if the model didn't emit any markers, use top-3 retrieved.
  if (usedChunks.length === 0) {
    for (const c of chunks.slice(0, 3)) {
      usedChunkIds.push(c.id);
      usedChunks.push(c);
    }
  }

  // ---- 9. Persist answer + citations ----
  const { data: answerId, error: saveErr } = await userClient.rpc('fn_save_answer', {
    p_question_id: questionId,
    p_text: answerText,
    p_model: modelUsed,
    p_chunk_ids: usedChunkIds,
  });
  if (saveErr) {
    return NextResponse.json({ error: 'save_failed', details: saveErr.message }, { status: 500 });
  }

  // ---- 10. Refresh leaderboard fire-and-forget (service role so it doesn't
  //           block on RLS or the user's request lifecycle). ----
  void Promise.resolve(supabaseService().rpc('fn_refresh_leaderboard')).then(
    (r) => {
      if (r.error) console.error('[ask] leaderboard refresh failed', r.error);
    },
    (err) => console.error('[ask] leaderboard refresh threw', err),
  );

  // ---- 11. Shape response ----
  const citations = usedChunks.map((c) => {
    // We need the youtube_id too; lookup from the original search rows.
    const row = (rows ?? []).find((r: Record<string, unknown>) => String(r.id) === c.id) as
      | Record<string, unknown>
      | undefined;
    const youtubeId = row ? String(row.youtube_id) : '';
    return {
      chunkId: c.id,
      episodeId: c.episode_id,
      episodeNum: c.episode_num,
      episodeTitle: c.episode_title,
      guestName: c.guest_name,
      speaker: c.speaker,
      startSec: c.start_sec,
      timestamp: fmtTimestamp(c.start_sec),
      youtubeUrl: youtubeId ? timestampedYouTubeUrl(youtubeId, c.start_sec) : '',
      quoteAr: c.content.length > 320 ? `${c.content.slice(0, 320)}…` : c.content,
    };
  });

  return NextResponse.json({
    answerId,
    text: answerText,
    citations,
    networkRemaining: netLimit.remaining,
  });
}
