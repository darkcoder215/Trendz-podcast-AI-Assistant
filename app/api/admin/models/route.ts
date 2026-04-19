import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type OpenRouterModel = {
  id: string;
  name?: string;
  context_length?: number;
};

// Embedding models aren't returned by OpenRouter's /models endpoint.
// We curate a list of compatible options, and flag dimension to help
// the admin pick one that matches the schema's vector(1536) column.
const EMBED_MODELS: { id: string; name: string; dim: number; provider: 'openai' | 'google' }[] = [
  { id: 'openai/text-embedding-3-small', name: 'OpenAI text-embedding-3-small', dim: 1536, provider: 'openai' },
  { id: 'openai/text-embedding-3-large', name: 'OpenAI text-embedding-3-large', dim: 3072, provider: 'openai' },
  { id: 'openai/text-embedding-ada-002', name: 'OpenAI text-embedding-ada-002', dim: 1536, provider: 'openai' },
  { id: 'google/text-embedding-004', name: 'Google text-embedding-004', dim: 768, provider: 'google' },
];

let chatCache: { value: OpenRouterModel[]; expiresAt: number } | null = null;
const CHAT_TTL_MS = 5 * 60_000;

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

export async function GET() {
  const unauth = await requireAdmin();
  if (unauth) return unauth;

  let chat: OpenRouterModel[] = [];
  const now = Date.now();
  if (chatCache && chatCache.expiresAt > now) {
    chat = chatCache.value;
  } else {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', { cache: 'no-store' });
      if (res.ok) {
        const j = (await res.json()) as { data: OpenRouterModel[] };
        chat = (j.data ?? [])
          .filter((m) => m.id.startsWith('openai/') || m.id.startsWith('google/'))
          .map((m) => ({ id: m.id, name: m.name, context_length: m.context_length }))
          .sort((a, b) => a.id.localeCompare(b.id));
        chatCache = { value: chat, expiresAt: now + CHAT_TTL_MS };
      }
    } catch (e) {
      console.error('[admin/models] OpenRouter fetch failed', e);
    }
  }

  return NextResponse.json({ chat, embed: EMBED_MODELS });
}
