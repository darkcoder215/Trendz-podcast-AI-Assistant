import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { invalidateAppSettings } from '@/lib/appSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: 'not_authenticated' }, { status: 401 }), user: null };
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (profile?.role !== 'admin') {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }), user: null };
  }
  return { error: null, user };
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const { data, error: dbErr } = await supabaseService()
    .from('app_settings')
    .select('chat_model, embed_model, updated_at')
    .eq('id', 1)
    .maybeSingle();
  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  return NextResponse.json({ settings: data ?? null });
}

const updateSchema = z.object({
  chatModel: z.string().min(3).max(120).regex(/^[a-z0-9._\-/:]+$/i),
  embedModel: z.string().min(3).max(120).regex(/^[a-z0-9._\-/:]+$/i),
});

export async function PUT(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  let payload: z.infer<typeof updateSchema>;
  try {
    payload = updateSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'invalid_payload', details: String(e) }, { status: 400 });
  }

  const { data, error: dbErr } = await supabaseService()
    .from('app_settings')
    .update({
      chat_model: payload.chatModel,
      embed_model: payload.embedModel,
      updated_by: user!.id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select('chat_model, embed_model, updated_at')
    .single();

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });
  invalidateAppSettings();
  return NextResponse.json({ settings: data });
}
