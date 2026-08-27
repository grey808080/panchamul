import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip i18n rewriting for routes that live outside [locale] —
  // admin, api, and auth have their own handlers and must not be mangled.
  const isNonLocaleRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/auth');

  // 1. Run next-intl only for locale-aware routes.
  const response = isNonLocaleRoute
    ? NextResponse.next()
    : handleI18nRouting(request);

  // 2. Only run Supabase auth checks for admin routes.
  //    This avoids making network calls to Supabase on every public request.
  if (!pathname.startsWith('/admin')) {
    return response;
  }

  // Allow the login page through without an auth check.
  if (pathname === '/admin/login') {
    return response;
  }

  // 3. Create the Supabase client and verify the session.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Wrap in try-catch: a network failure calling Supabase should redirect to
  // login rather than throw an unhandled error and crash the middleware.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // fetch failed (offline / bad env var) — treat as unauthenticated
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (!user) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify admin flag on the profile
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    // If the profile check fails, deny access rather than grant it
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}