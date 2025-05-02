import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

// https://nextjs.org/docs/app/building-your-application/configuring-content-security-policy
export async function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Base CSP directives
  let cspDirectives = {
    'default-src': "'self'",
    // TEMPORARILY ADDING 'unsafe-inline' to diagnose visibility issue.
    // Relying on nonce + allowing Vercel scripts. Inline scripts without nonce still an issue.
    'script-src': `'self' 'unsafe-inline' 'nonce-${nonce}' https://va.vercel-scripts.com https://vercel.live`,
    // Added https://vercel.live based on Vercel docs
    'style-src': `'self' 'unsafe-inline' https://vercel.live`,
    // Added https://vercel.live and https://vercel.com based on Vercel docs
    'img-src': "'self' blob: data: https://vercel.live https://vercel.com",
    // Added https://vercel.live and https://assets.vercel.com based on Vercel docs
    'font-src': "'self' https://vercel.live https://assets.vercel.com",
    // Added wss://ws-us3.pusher.com based on Vercel docs
    'connect-src': "'self' https://vercel.live wss://vercel.live https://vitals.vercel-insights.com wss://ws-us3.pusher.com",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    // Matches Vercel docs
    'frame-src': "https://vercel.live",
    'block-all-mixed-content': "",
    'upgrade-insecure-requests': "",
  };

  // Relax CSP in development for libraries that use inline styles/eval
  if (isDevelopment) {
    console.log("Middleware: Applying relaxed CSP for development");
    // Restore development settings
    cspDirectives['script-src'] += ` 'unsafe-eval'`; 
    cspDirectives['style-src'] += ` 'unsafe-inline'`; // Keep allowing inline styles in dev
  }

  // Construct the header string
  const cspHeader = Object.entries(cspDirectives)
    .map(([key, value]) => `${key}${value ? ' ' + value : ''}`)
    .join('; ');

  const contentSecurityPolicyHeaderValue = cspHeader;

  const requestHeaders = new Headers(request.headers)
  // Pass nonce to server components
  requestHeaders.set('x-nonce', nonce)
  // Set CSP header on the request (needed for server components)
  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )

  // Create response and attach request headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // RBAC redirect logic (after headers set)
  const { pathname } = request.nextUrl
  const protectedRoutes = ["/portal"]
  if (protectedRoutes.some((p) => pathname.startsWith(p))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Also set CSP header on the response (needed for client components)
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue
  )
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY') // Change to 'SAMEORIGIN' if you need to frame pages
  // response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload') // Enable HSTS carefully after testing HTTPS

  return response
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}