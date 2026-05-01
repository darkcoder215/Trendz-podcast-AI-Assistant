import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Refresh the Supabase session cookie on every request and bootstrap an
 * anonymous session for first-time visitors so the Ask flow is usable
 * without login. Wrapped in a top-level try/catch so a transient Supabase
 * error never tanks the whole request with a Vercel
 * MIDDLEWARE_INVOCATION_FAILED 500.
 */
export async function middleware(req: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Env not configured (misconfigured env in Vercel, etc) — keep serving.
    if (!url || !anonKey) {
      return NextResponse.next();
    }

    // Canonical Next 15 + @supabase/ssr pattern: the response is rebuilt on
    // every cookie write so the rest of the request pipeline sees the
    // refreshed session.
    let response = NextResponse.next({ request: req });

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (list: CookieToSet[]) => {
          list.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          list.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // Touch the session so refresh tokens rotate.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // For public routes, silently create an anonymous session if none.
    // Skip for admin / API / static paths to avoid sessions on scraper hits.
    if (!user) {
      const { pathname } = req.nextUrl;
      const isPublicUi =
        pathname === '/' ||
        pathname === '/ask' ||
        pathname === '/leaderboard' ||
        pathname.startsWith('/share/');
      if (isPublicUi) {
        await supabase.auth.signInAnonymously().catch(() => undefined);
      }
    }

    return response;
  } catch (err) {
    // Never crash the middleware — it runs on every request. Log and pass
    // the request through; the page or API route will fail loudly if it
    // genuinely needs Supabase and Supabase is unreachable.
    console.error('[middleware] failed', err);
    return NextResponse.next();
  }
}

export const config = {
  // Run on everything except static assets and image optimizer.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\..*).*)'],
};
