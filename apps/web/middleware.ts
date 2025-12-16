import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Basic Locale Handling (Placeholder for next-intl)
  // In a real app, this would detect 'ar' vs 'en' and rewrite the URL.

  // 2. Role-Based Access Control (RBAC)
  // Mock Logic: Check if path starts with /dashboard/specialist and if user has role.
  // Real implementation uses supabase.auth.getSession()

  const path = request.nextUrl.pathname;

  // Mock: If user tries to access specialist without auth (simulation)
  // if (path.startsWith('/dashboard/specialist')) {
  //   const token = request.cookies.get('sb-access-token');
  //   if (!token) {
  //     return NextResponse.redirect(new URL('/login', request.url));
  //   }
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/child/:path*', '/admin/:path*'],
};
