import 'server-only';
import { createHash } from 'crypto';
import { supabaseService } from './supabase/service';

/**
 * Derive a stable, non-reversible bucket key for (IP + coarse UA + UTC date).
 * We don't store IP anywhere — just its SHA-256 with a server-side salt.
 */
function bucketKey(ip: string, userAgent: string): string {
  const ua = userAgent.slice(0, 200);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const salt = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 16) ?? 'madrasa';
  return createHash('sha256').update(`${salt}|${ip}|${ua}|${today}`).digest('hex');
}

export function getClientIp(req: Request): string {
  const h = req.headers;
  const xf = h.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim();
  const real = h.get('x-real-ip');
  if (real) return real;
  return '0.0.0.0';
}

const DAILY_NETWORK_MAX = 30;

/**
 * Returns `{ ok: true }` when within the per-network quota, else `{ ok: false }`
 * with an Arabic reason message. Persists counts in `rate_buckets` via the
 * service role so the ledger is never exposed via RLS.
 */
export async function checkNetworkQuota(req: Request): Promise<
  { ok: true; remaining: number } | { ok: false; reason: string }
> {
  const ip = getClientIp(req);
  const ua = req.headers.get('user-agent') ?? '';
  const key = bucketKey(ip, ua);
  const svc = supabaseService();

  const { data, error } = await svc
    .from('rate_buckets')
    .select('count')
    .eq('key', key)
    .maybeSingle();

  if (error) {
    // Fail-open but log — we don't want to DoS the app if the ledger is flaky.
    console.error('[rateLimit] select failed', error);
    return { ok: true, remaining: DAILY_NETWORK_MAX };
  }

  const current = data?.count ?? 0;
  if (current >= DAILY_NETWORK_MAX) {
    return { ok: false, reason: 'لقد بلغتَ الحد اليومي من الأسئلة من هذه الشبكة.' };
  }

  const next = current + 1;
  const { error: upErr } = await svc
    .from('rate_buckets')
    .upsert({ key, count: next, window_start: new Date().toISOString() }, { onConflict: 'key' });

  if (upErr) {
    console.error('[rateLimit] upsert failed', upErr);
    return { ok: true, remaining: DAILY_NETWORK_MAX - next };
  }
  return { ok: true, remaining: DAILY_NETWORK_MAX - next };
}
