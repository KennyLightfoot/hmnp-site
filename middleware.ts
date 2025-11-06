/**
 * Next.js Middleware (Simplified for Phase 3 Setup)
 * Basic middleware while we set up the new infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCSPHeader } from '@/lib/security/headers';
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // RBAC redirect logic for protected routes
  const protectedRoutes = ["/portal", "/admin"];
  if (protectedRoutes.some((p) => pathname.startsWith(p))) {
    // Optional IP allowlist for /admin
    if (pathname.startsWith('/admin')) {
      const allowlist = (process.env.ADMIN_IP_ALLOWLIST || '').split(',').map(s => s.trim()).filter(Boolean)
      if (allowlist.length > 0) {
        const xff = request.headers.get('x-forwarded-for') || ''
        const ip = (xff.split(',')[0] || '').trim() || request.headers.get('x-real-ip') || ''
        if (!ip || !allowlist.includes(ip)) {
          return new NextResponse('Forbidden', { status: 403 })
        }
      }
    }
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Basic security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', getCSPHeader(process.env.NODE_ENV === 'development'));

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};