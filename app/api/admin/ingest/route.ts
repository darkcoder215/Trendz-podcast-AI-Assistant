import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { adminIngestSchema } from '@/lib/schemas';
import { parseTranscript, packChunks } from '@/lib/chunker';
import { embed } from '@/lib/openrouter';
import { getAppSettings } from '@/lib/appSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // give embeddings room to breathe on Vercel

async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return null;
}

export async function POST(req: Request) {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let payload;
  try {
    payload = adminIngestSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'invalid_payload', details: String(e) }, { status: 400 });
  }

  const svc = supabaseService();

  const { data: ep, error: epErr } = await svc
    .from('episodes')
    .select('id, num')
    .eq('id', payload.episodeId)
    .maybeSingle();
  if (epErr || !ep) return NextResponse.json({ error: 'episode_not_found' }, { status: 404 });

  const segments = parseTranscript(payload.transcriptRaw);
  if (segments.length === 0) {
    return NextResponse.json({ error: 'no_segments_parsed' }, { status: 400 });
  }

  const chunks = packChunks(segments, 400, 40);
  if (chunks.length === 0) {
    return NextResponse.json({ error: 'no_chunks_produced' }, { status: 400 });
  }

  // Embed in batches of 96 (OpenAI default limit).
  const { embedModel } = await getAppSettings();
  const vectors: number[][] = [];
  for (let i = 0; i < chunks.length; i += 96) {
    const batch = chunks.slice(i, i + 96).map((c) => c.content);
    try {
      const vecs = await embed(batch, embedModel);
      vectors.push(...vecs);
    } catch (e) {
      return NextResponse.json({ error: 'embed_failed', details: String(e) }, { status: 502 });
    }
  }

  if (vectors.length !== chunks.length) {
    return NextResponse.json({ error: 'embed_size_mismatch' }, { status: 502 });
  }

  // Replace existing chunks for this episode, then bulk-insert new ones.
  await svc.from('chunks').delete().eq('episode_id', payload.episodeId);

  const rows = chunks.map((c, idx) => ({
    episode_id: payload.episodeId,
    chunk_index: idx,
    content_ar: c.content,
    speaker_ar: c.speaker,
    start_sec: c.startSec,
    end_sec: c.endSec,
    embedding: `[${vectors[idx].join(',')}]`,
    token_count: c.tokenCount,
  }));

  const { error: insertErr } = await svc.from('chunks').insert(rows);
  if (insertErr) {
    return NextResponse.json({ error: 'insert_failed', details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    chunkCount: chunks.length,
    episodeNum: ep.num,
    sampleFirst: chunks[0]?.content.slice(0, 120),
  });
}
