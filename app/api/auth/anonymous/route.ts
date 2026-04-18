import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Explicit endpoint to ensure an anonymous session exists. Middleware also
 * bootstraps one for public UI routes, but pages can call this on mount
 * as a defensive fallback (useful when JS-heavy pages are prefetched).
 */
export async function POST() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return NextResponse.json({ userId: user.id, created: false });

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ userId: data.user?.id, created: true });
}
