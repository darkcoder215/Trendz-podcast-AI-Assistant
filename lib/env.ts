// Server-only env access. Accessing process.env from the client would be
// compiled away by Next.js, but this module is explicitly imported only
// from server components / route handlers.
import 'server-only';

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) throw new Error(`Missing env var: ${name}`);
  return v;
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.length > 0 ? v : fallback;
}

export const env = {
  SUPABASE_URL: () => required('NEXT_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: () => required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  OPENROUTER_API_KEY: () => required('OPENROUTER_API_KEY'),
  OPENROUTER_SITE_URL: () => optional('OPENROUTER_SITE_URL', 'https://madrasa.trendz.app'),
  OPENROUTER_APP_NAME: () => optional('OPENROUTER_APP_NAME', 'Madrasa AI'),
  CHAT_MODEL: () => optional('OPENROUTER_CHAT_MODEL', 'anthropic/claude-sonnet-4.6'),
  EMBED_MODEL: () => optional('OPENROUTER_EMBED_MODEL', 'openai/text-embedding-3-small'),
  SITE_URL: () => optional('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000'),
};
