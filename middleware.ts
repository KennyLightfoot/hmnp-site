import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
export function middleware(request: NextRequest) {
  // const nonce = Buffer.from(crypto.randomUUID()).toString('base64') // Remove nonce generation
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Base CSP directives - Relying on 'unsafe-inline' for now, nonce removed
  let cspDirectives = {
    'default-src': "'self'",
    // Nonce removed, keep unsafe-inline
    'script-src': `'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live`,
    // Nonce removed, keep unsafe-inline
    'style-src': `'self' 'unsafe-inline'`,
    'img-src': "'self' blob: data:",
    'font-src': "'self'",
    'connect-src': "'self' https://va.vercel-scripts.com https://vercel.live wss:",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    // Allow framing self and vercel.live
    'frame-src': "'self' https://vercel.live",
    'block-all-mixed-content': "",
    'upgrade-insecure-requests': "",
  };

  // Relax CSP in development
  if (isDevelopment) {
    console.log("Middleware: Applying relaxed CSP for development");
    if (!cspDirectives['script-src'].includes('unsafe-eval')) {
      cspDirectives['script-src'] += ` 'unsafe-eval'`;
    }
    // 'unsafe-inline' is already present in the base config now
  }

  // Construct the header string
  const cspHeader = Object.entries(cspDirectives)
    .map(([key, value]) => `${key}${value ? ' ' + value : ''}`)
    .join('; ');

  const contentSecurityPolicyHeaderValue = cspHeader;

  const requestHeaders = new Headers(request.headers)
  // Pass nonce to server components - Removed nonce, so remove this header
  // requestHeaders.set('x-nonce', nonce)
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