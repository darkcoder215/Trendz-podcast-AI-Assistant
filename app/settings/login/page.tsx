import { supabaseServer } from '@/lib/supabase/server';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'admin') redirect('/settings');
  }

  return <AdminLogin initialError={err === 'not_admin' ? 'هذا الحساب ليس مديراً.' : null} />;
}
