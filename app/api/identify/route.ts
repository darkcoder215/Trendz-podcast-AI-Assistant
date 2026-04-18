import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { identifyRequestSchema } from '@/lib/schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  let payload;
  try {
    payload = identifyRequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'invalid_payload' }, { status: 400 });
  }

  const { error } = await supabase.rpc('fn_identify', {
    p_name: payload.name,
    p_email: payload.email,
  });
  if (error) return NextResponse.json({ error: 'identify_failed', details: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ captured: false });

  const { data } = await supabase
    .from('profiles')
    .select('name, email, captured_at, questions_asked')
    .eq('id', user.id)
    .maybeSingle();
  return NextResponse.json({
    captured: !!data?.captured_at,
    name: data?.name ?? null,
    email: data?.email ?? null,
    questionsAsked: data?.questions_asked ?? 0,
    quotaLeft: Math.max(0, 10 - (data?.questions_asked ?? 0)),
  });
}
