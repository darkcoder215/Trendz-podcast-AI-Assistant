import 'server-only';
import { supabaseService } from './supabase/service';
import { env } from './env';

export type AppSettings = { chatModel: string; embedModel: string };

let cache: { value: AppSettings; expiresAt: number } | null = null;
const TTL_MS = 30_000;

export async function getAppSettings(): Promise<AppSettings> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.value;

  const { data } = await supabaseService()
    .from('app_settings')
    .select('chat_model, embed_model')
    .eq('id', 1)
    .maybeSingle();

  const value: AppSettings = {
    chatModel: data?.chat_model || env.CHAT_MODEL(),
    embedModel: data?.embed_model || env.EMBED_MODEL(),
  };
  cache = { value, expiresAt: now + TTL_MS };
  return value;
}

export function invalidateAppSettings() {
  cache = null;
}
