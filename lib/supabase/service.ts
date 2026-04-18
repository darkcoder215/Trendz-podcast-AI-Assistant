import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from '../env';

/**
 * Service-role client. Bypasses RLS entirely. ONLY use from server code that
 * has already validated the caller (e.g. verified admin, or trusted RPC glue).
 * Never import this from a "use client" file.
 */
export function supabaseService() {
  return createClient(env.SUPABASE_URL(), env.SUPABASE_SERVICE_ROLE_KEY(), {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Madrasa-Context': 'service' } },
  });
}
