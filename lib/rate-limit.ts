import type { NextRequest } from "next/server"

// Simple in-memory store for rate limiting
const ipRequests: Record<string, { count: number; timestamp: number }> = {}

/**
 * Rate limiter function
 * @param req The Next.js request
 * @param limit Maximum number of requests allowed
 * @param timeWindow Time window in seconds
 * @returns Boolean indicating if the request should be allowed
 */
export async function rateLimit(
  req: NextRequest,
  limit = 5,
  timeWindow = 60,
): Promise<{ success: boolean; message?: string }> {
  // Get IP address from request
  const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
  const now = Date.now()

  // Clean up old entries
  Object.keys(ipRequests).forEach((key) => {
    if (now - ipRequests[key].timestamp > timeWindow * 1000) {
      delete ipRequests[key]
    }
  })

  // Check if IP exists in store
  if (!ipRequests[ip]) {
    ipRequests[ip] = { count: 1, timestamp: now }
    return { success: true }
  }

  // Check if within rate limit
  if (ipRequests[ip].count >= limit) {
    return {
      success: false,
      message: `Too many requests. Please try again after ${Math.ceil((ipRequests[ip].timestamp + timeWindow * 1000 - now) / 1000)} seconds.`,
    }
  }

  // Increment request count
  ipRequests[ip].count++
  return { success: true }
}
