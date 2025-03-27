import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Allow all auth-related routes to pass through
  if (path.startsWith("/api/auth") || path.startsWith("/auth")) {
    return NextResponse.next()
  }

  // Check if the path is for admin routes
  if (path.startsWith("/admin")) {
    // In a real app, you would check for authentication here
    // For now, we'll just allow access to admin routes
    // You could implement a check like this:
    // const token = request.cookies.get('auth-token')?.value
    // if (!token) {
    //   return NextResponse.redirect(new URL('/login', request.url))
    // }
  }

  // Continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/revalidate",
    "/api/cache",
    "/api/auth/:path*",
    "/auth/:path*"
  ],
}

