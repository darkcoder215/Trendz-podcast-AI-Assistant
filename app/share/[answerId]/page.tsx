import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { supabaseService } from '@/lib/supabase/service';
import { Nav } from '@/components/Nav';
import { Footer } from '@/components/Footer';
import { SharePanel } from '@/components/share/SharePanel';
import { timestampedYouTubeUrl } from '@/lib/youtube';

export const dynamic = 'force-dynamic';

export default async function SharePage({
  params,
}: {
  params: Promise<{ answerId: string }>;
}) {
  const { answerId } = await params;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: answer } = await supabase
    .from('answers')
    .select('id, user_id, text_ar, created_at')
    .eq('id', answerId)
    .maybeSingle();
  if (!answer || answer.user_id !== user.id) notFound();

  // Ownership verified above. chunks is no longer publicly readable, so the
  // embedded fetch is done via the service-role client.
  const { data: citationRows } = await supabaseService()
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

  const ytUrl = first?.episode?.youtube_id ? timestampedYouTubeUrl(first.episode.youtube_id, first.start_sec) : '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <Nav />
      <div style={{ paddingTop: 110 }}>
        <SharePanel
          answerId={answerId}
          guestName={first?.episode?.guest_name_ar ?? 'الضيف'}
          episodeNum={first?.episode?.num ?? null}
          episodeTitle={first?.episode?.title_ar ?? null}
          youtubeUrl={ytUrl}
        />
      </div>
      <Footer />
    </div>
  );
}
