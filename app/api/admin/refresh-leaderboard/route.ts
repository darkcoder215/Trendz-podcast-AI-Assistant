import { NextResponse } from 'next/server';
import { supabaseService } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Cron-triggered endpoint. Vercel cron sends a `Authorization: Bearer <CRON_SECRET>`
 * header if configured; we'll accept that OR a logged-in admin.
 */
export async function GET(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get('authorization');
  if (cronSecret && header === `Bearer ${cronSecret}`) {
    const { error } = await supabaseService().rpc('fn_refresh_leaderboard');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, via: 'cron' });
  }
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}
