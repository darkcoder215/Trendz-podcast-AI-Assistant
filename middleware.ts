import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refresh the Supabase session cookie on every request and bootstrap an
 * anonymous session for first-time visitors so the Ask flow is usable
 * without login. Admin-gated routes are additionally checked by the
 * /settings layout.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Touch the session so refresh tokens rotate.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // For public routes, silently create an anonymous session if none.
  // Skip for admin / API / static paths to avoid creating sessions on scraper hits.
  const { pathname } = req.nextUrl;
  const isPublicUi = pathname === '/' || pathname === '/ask' || pathname === '/leaderboard' || pathname.startsWith('/share/');

  if (!user && isPublicUi) {
    await supabase.auth.signInAnonymously().catch(() => undefined);
  }

  return res;
}

export const config = {
  // Run on everything except static assets and image optimizer.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\..*).*)'],
};
