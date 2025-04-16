import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next()

  // Add security headers
  const headers = response.headers

  // Prevent clickjacking attacks
  headers.set("X-Frame-Options", "DENY")

  // Help prevent XSS attacks
  headers.set("X-Content-Type-Options", "nosniff")
  headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer policy
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Content Security Policy - adjust as needed
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com; connect-src 'self' https://maps.googleapis.com; font-src 'self'; frame-src 'self';",
  )

  return response
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    // Apply to all routes except for static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
}
