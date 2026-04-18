import { Nav } from '@/components/Nav';

export const dynamic = 'force-dynamic';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  // Access control is enforced by individual pages (settings/page.tsx and
  // settings/login/page.tsx) so the login route can render unauthenticated.
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)' }}>
      <Nav />
      <div style={{ paddingTop: 96 }}>{children}</div>
    </div>
  );
}
