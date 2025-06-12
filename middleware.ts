import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from "next-auth/jwt"

// https://nextjs.org/docs/app/building-your-application/configuring-content-security-policy
export async function middleware(request: NextRequest) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  let cspDirectives: Record<string, string>;
  let nonce: string | undefined;

  if (isDevelopment) {
    console.log("Middleware: Applying relaxed CSP for development");
    // In development, allow unsafe-inline and unsafe-eval without nonces
    cspDirectives = {
      'default-src': "'self'",
      'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vercel.live https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://snap.licdn.com",
      'style-src': "'self' 'unsafe-inline' https://vercel.live",
      'img-src': "'self' blob: data: https://vercel.live https://vercel.com https://www.facebook.com",
      'font-src': "'self' https://vercel.live https://assets.vercel.com",
      'connect-src': "'self' https://vercel.live wss://vercel.live https://vitals.vercel-insights.com wss://ws-us3.pusher.com https://houstonmobilenotarypros.com https://houston-notary-docs.s3.us-east-1.amazonaws.com https://api.stripe.com https://checkout.stripe.com",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self' https://checkout.stripe.com",
      'frame-ancestors': "'none'",
      'frame-src': "https://vercel.live https://js.stripe.com https://hooks.stripe.com",
      'child-src': "https://js.stripe.com",
      'worker-src': "'self' blob:",
    };
  } else {
    // Production CSP with nonces
    nonce = Buffer.from(crypto.randomUUID()).toString('base64')
    cspDirectives = {
      'default-src': "'self'",
      'script-src': `'self' 'nonce-${nonce}' 'strict-dynamic' https://va.vercel-scripts.com https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com https://snap.licdn.com`,
      'style-src': `'self' 'nonce-${nonce}'`,
      'img-src': "'self' blob: data: https://vercel.com https://www.facebook.com",
      'font-src': "'self' https://assets.vercel.com",
      'connect-src': "'self' https://vitals.vercel-insights.com wss://ws-us3.pusher.com https://houstonmobilenotarypros.com https://houston-notary-docs.s3.us-east-1.amazonaws.com https://api.stripe.com https://checkout.stripe.com",
      'object-src': "'none'",
      'base-uri': "'self'",
      'form-action': "'self' https://checkout.stripe.com",
      'frame-ancestors': "'none'",
      'frame-src': "https://js.stripe.com https://hooks.stripe.com",
      'child-src': "https://js.stripe.com",
      'worker-src': "'self' blob:",
      'block-all-mixed-content': "",
      'upgrade-insecure-requests': "",
    };
  }

  // Construct the header string
  const cspHeader = Object.entries(cspDirectives)
    .map(([key, value]) => `${key}${value ? ' ' + value : ''}`)
    .join('; ');

  const contentSecurityPolicyHeaderValue = cspHeader;

  const requestHeaders = new Headers(request.headers)
  
  // Pass nonce to server components only in production
  if (nonce) {
    requestHeaders.set('x-nonce', nonce)
  }
  
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