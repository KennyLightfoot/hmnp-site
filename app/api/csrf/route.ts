import { NextResponse } from "next/server"
import { generateCSRFToken, storeCSRFToken } from "@/lib/csrf"

export async function GET() {
  // Generate a new CSRF token
  const csrfToken = generateCSRFToken()

  // Create response with the token
  const response = NextResponse.json({
    success: true,
    csrfToken,
  })

  // Set the token in a cookie
  response.headers.set("Set-Cookie", storeCSRFToken(csrfToken))

  return response
}
