import { ImageResponse } from 'next/og';
import { supabaseServer } from '@/lib/supabase/server';
import { fmtTimestamp, timestampedYouTubeUrl } from '@/lib/youtube';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function loadFont(path: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`font fetch failed: ${path}`);
  return res.arrayBuffer();
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ answerId: string }> },
) {
  const { answerId } = await params;

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { data: answer, error: aErr } = await supabase
    .from('answers')
    .select('id, text_ar, user_id, created_at')
    .eq('id', answerId)
    .maybeSingle();
  if (aErr || !answer) return new Response('not_found', { status: 404 });
  if (answer.user_id !== user.id) return new Response('forbidden', { status: 403 });

  const { data: citationRows } = await supabase
    .from('citations')
    .select('rank, chunk:chunk_id ( id, content_ar, start_sec, episode:episode_id ( num, title_ar, guest_name_ar, youtube_id ) )')
    .eq('answer_id', answerId)
    .order('rank', { ascending: true })
    .limit(1);

  const first = citationRows?.[0]?.chunk as
    | {
        id: string;
        content_ar: string;
        start_sec: number;
        episode: { num: number; title_ar: string; guest_name_ar: string; youtube_id: string };
      }
    | undefined;

  const quote = first
    ? first.content_ar.length > 240
      ? `${first.content_ar.slice(0, 240)}…`
      : first.content_ar
    : answer.text_ar.slice(0, 200);
  const epNum = first?.episode?.num ?? '—';
  const guest = first?.episode?.guest_name_ar ?? 'ضيف الحلقة';
  const title = first?.episode?.title_ar ?? '';
  const link = first?.episode?.youtube_id
    ? timestampedYouTubeUrl(first.episode.youtube_id, first.start_sec)
    : '';
  const ts = first ? fmtTimestamp(first.start_sec) : '';

  const [regular, bold] = await Promise.all([
    loadFont('/fonts/IBMPlexSansArabic-Regular.ttf'),
    loadFont('/fonts/IBMPlexSansArabic-Bold.ttf'),
  ]);

  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #273773 0%, #0b1230 55%, #f96e46 140%)',
          color: '#ffffff',
          padding: 72,
          fontFamily: 'IBMPlexArabic',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 64,
            left: 64,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <div style={{ width: 72, height: 72, borderRadius: 18, background: '#8bd8bd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="44" height="44" viewBox="0 0 48 48">
              <rect x="6" y="24" width="6" height="18" fill="#0b1230" />
              <rect x="15" y="18" width="6" height="24" fill="#0b1230" />
              <rect x="24" y="10" width="6" height="32" fill="#0b1230" />
              <rect x="33" y="4" width="6" height="38" fill="#0b1230" />
              <circle cx="9" cy="20" r="3" fill="#0b1230" />
              <circle cx="36" cy="44" r="3" fill="#0b1230" />
            </svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Madrasa AI</div>
            <div style={{ fontSize: 18, opacity: 0.75 }}>اسأل البودكاست · احصل على الإجابة</div>
          </div>
        </div>

        <div
          style={{
            marginTop: 180,
            fontSize: 22,
            letterSpacing: 3,
            color: '#efc846',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          مقطع من حلقة {epNum} — {guest}
        </div>

        <div
          style={{
            marginTop: 30,
            fontSize: 54,
            fontWeight: 700,
            lineHeight: 1.3,
            color: '#ffffff',
          }}
        >
          «{quote}»
        </div>

        {title && (
          <div style={{ marginTop: 26, fontSize: 26, opacity: 0.8 }}>
            {title}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            borderTop: '3px solid rgba(255,255,255,0.25)',
            paddingTop: 30,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 20, opacity: 0.7 }}>المصدر</div>
            <div style={{ fontSize: 26, fontWeight: 700 }}>
              {ts ? `الحلقة ${epNum} · ${ts}` : `الحلقة ${epNum}`}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 20, opacity: 0.7 }}>افتح على</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#8bd8bd', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {link || 'madrasa.trendz.app'}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        { name: 'IBMPlexArabic', data: regular, style: 'normal', weight: 400 },
        { name: 'IBMPlexArabic', data: bold, style: 'normal', weight: 700 },
      ],
    },
  );
}
