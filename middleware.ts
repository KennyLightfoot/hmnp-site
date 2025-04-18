import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Base CSP directives
  let cspDirectives = {
    'default-src': "'self'",
    'script-src': `'self' 'nonce-${nonce}' 'sha256-HugGj5oR7f2UGBbrPIOJua5vPpKBIJj8354Z6gsKoUQ=' 'sha256-8aOPPWyRtx1KihwZszeJRDJg0nrAFqi04JPFG9eQUek=' 'sha256-OBTN3RiyCV4Bq7dFqZ5a2pAXjnCcCYeTJMO2I/LYKeo=' 'sha256-j52TX6Fb3NUO2bmvjon49I8tpCGwn0R+ovIp8x2RBNk=' 'sha256-mybKB6E84PBV3jfqjxoTLfch7bQz+ftmC3t/Qf9Hc7Y=' 'sha256-s3MA+Y+irjqktkWpxmrlHLM1yXuLXj9f5XdG0fW9W3k=' 'sha256-LTK2nxgRZWhSIAsTmeFsyUfzld7VK6xUG2gV7+GwE3Y=' 'sha256-AOncNHcBkLDoOXJJ7mYdLdBp54fH6nWRTBXh/O6P32I=' 'sha256-vxlp+Qmk93njFqSirNuY8MhsR3Qru0z+3AzIFQb1AVo=' 'sha256-g+p4mnZ6pSKlyH9nMQsc839rxNaLuUX7R8KnPZMGSRc=' https://va.vercel-scripts.com https://vercel.live`,
    'style-src': `'self' 'unsafe-inline'`,
    'img-src': "'self' blob: data:",
    'font-src': "'self'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    'frame-src': "https://vercel.live",
    'block-all-mixed-content': "",
    'upgrade-insecure-requests': "",
  };

  // Relax CSP in development for libraries that use inline styles/eval
  if (isDevelopment) {
    console.log("Middleware: Applying relaxed CSP for development");
    cspDirectives['script-src'] += ` 'unsafe-eval'`; // Allow eval in dev
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