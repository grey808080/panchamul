import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 1. Refresh Supabase session and handle auth for protected routes (like /admin)
  const supabaseResponse = await updateSession(request);
  
  // If updateSession redirected (e.g. from /admin to /admin/login or /), return that redirect
  if (supabaseResponse.status !== 200 && supabaseResponse.headers.has('location')) {
    return supabaseResponse;
  }

  // 2. Skip i18n routing for /admin, /api, _next, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.') // like favicon.ico
  ) {
    return supabaseResponse;
  }

  // 3. Handle i18n routing for public pages
  // Next-intl middleware creates its own response, but we need to merge cookies from supabaseResponse
  const intlResponse = handleI18nRouting(request);
  
  // Merge the cookies set by Supabase into the intlResponse
  supabaseResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === 'set-cookie') {
      intlResponse.headers.append('set-cookie', value);
    }
  });

  return intlResponse;
}

export const config = {
  // Match only internationalized pathnames, API routes, and admin
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ]
};
