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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If the env isn't configured yet (e.g. misconfigured Vercel deployment),
  // don't take the whole site down — pass the request through. Routes that
  // strictly need Supabase will fail loudly with their own 500; public pages
  // keep rendering.
  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[middleware] Supabase env vars missing — skipping session refresh');
    }
    return res;
  }

  try {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            res.cookies.set(name, value, options);
          });
        },
      },
    });

    // Touch the session so refresh tokens rotate.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // For public routes, silently create an anonymous session if none.
    // Skip for admin / API / static paths to avoid creating sessions on scraper hits.
    const { pathname } = req.nextUrl;
    const isPublicUi =
      pathname === '/' || pathname === '/ask' || pathname === '/leaderboard' || pathname.startsWith('/share/');

    if (!user && isPublicUi) {
      await supabase.auth.signInAnonymously().catch(() => undefined);
    }
  } catch (err) {
    // Never crash the middleware — it runs on every request. Log and continue.
    console.error('[middleware] supabase error', err);
  }

  return res;
}

export const config = {
  // Run on everything except static assets and image optimizer.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\..*).*)'],
};
