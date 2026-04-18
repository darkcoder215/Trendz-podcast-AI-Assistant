import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/settings/login');

  const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', user.id).maybeSingle();
  if (!profile || profile.role !== 'admin') {
    redirect('/settings/login?err=not_admin');
  }

  const { data: episodes } = await supabase
    .from('episodes')
    .select('id, num, title_ar, guest_name_ar, youtube_url, guest_photo_url, created_at')
    .order('num', { ascending: false });

  return <AdminDashboard episodes={episodes ?? []} adminEmail={profile.email ?? user.email ?? ''} />;
}
