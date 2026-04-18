import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { adminEpisodeSchema } from '@/lib/schemas';
import { parseYouTubeId } from '@/lib/youtube';

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

export async function POST(req: Request) {
  const { error, user } = await requireAdmin();
  if (error) return error;

  let payload;
  try {
    payload = adminEpisodeSchema.parse(await req.json());
  } catch (e) {
    return NextResponse.json({ error: 'invalid_payload', details: String(e) }, { status: 400 });
  }

  const ytId = parseYouTubeId(payload.youtubeUrl);
  if (!ytId) return NextResponse.json({ error: 'invalid_youtube_url' }, { status: 400 });

  const svc = supabaseService();
  const { data, error: insertErr } = await svc
    .from('episodes')
    .insert({
      num: payload.num,
      title_ar: payload.titleAr,
      guest_name_ar: payload.guestNameAr,
      guest_role_ar: payload.guestRoleAr ?? null,
      guest_photo_url: payload.guestPhotoUrl ?? null,
      youtube_url: payload.youtubeUrl,
      youtube_id: ytId,
      duration_sec: payload.durationSec ?? null,
      published_at: payload.publishedAt ?? null,
      topics_ar: payload.topicsAr ?? [],
      summary_ar: payload.summaryAr ?? null,
      uploaded_by: user!.id,
    })
    .select()
    .single();

  if (insertErr) {
    return NextResponse.json({ error: 'insert_failed', details: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ episode: data });
}
