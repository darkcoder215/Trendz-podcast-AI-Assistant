import { supabaseServer } from '@/lib/supabase/server';
import { Nav } from '@/components/Nav';
import { AskClient } from '@/components/ask/AskClient';

export const dynamic = 'force-dynamic';

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; ep?: string }>;
}) {
  const { q, ep } = await searchParams;
  const supabase = await supabaseServer();

  const { data: episodes } = await supabase
    .from('episodes')
    .select('id, num, title_ar, guest_name_ar, youtube_id, duration_sec')
    .order('num', { ascending: false });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let quotaLeft = 10;
  let captured = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('questions_asked, captured_at')
      .eq('id', user.id)
      .maybeSingle();
    quotaLeft = Math.max(0, 10 - (profile?.questions_asked ?? 0));
    captured = !!profile?.captured_at;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <Nav active="ask" quotaLeft={quotaLeft} />
      <AskClient
        initialQuery={q ?? ''}
        initialEpisodeId={ep ?? null}
        episodes={episodes ?? []}
        initialQuotaLeft={quotaLeft}
        initialCaptured={captured}
      />
    </div>
  );
}
