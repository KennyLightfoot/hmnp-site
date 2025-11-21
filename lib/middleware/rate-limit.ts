import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string // Custom key generator
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store (for production, use Redis)
const store: RateLimitStore = {}

function getKey(request: NextRequest, config: RateLimitConfig): string {
  if (config.keyGenerator) {
    return config.keyGenerator(request)
  }

  // Default: use IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown'
  return `rate-limit:${ip}`
}

function cleanupExpiredEntries() {
  const now = Date.now()
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}

export function createRateLimiter(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    cleanupExpiredEntries()

    const key = getKey(request, config)
    const now = Date.now()
    const windowMs = config.windowMs

    // Get or create entry
    let entry = store[key]
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + windowMs,
      }
      store[key] = entry
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      logger.warn('Rate limit exceeded', {
        key,
        count: entry.count,
        maxRequests: config.maxRequests,
        path: request.nextUrl.pathname,
      })

      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${Math.floor(windowMs / 1000)} seconds.`,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
          },
        }
      )
    }

    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString())
    response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())

    return null // Continue with request
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // Strict rate limiter for job offer acceptance (prevent abuse)
  jobOfferAccept: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5, // 5 accepts per minute
    keyGenerator: async (request) => {
      // Use user ID if available, otherwise IP
      const session = await import('next-auth').then((m) => m.getServerSession(await import('@/lib/auth').then((m) => m.authOptions)))
      if (session?.user?.id) {
        return `rate-limit:job-offer:${session.user.id}`
      }
      return getKey(request, { windowMs: 60000, maxRequests: 5 })
    },
  }),

  // Moderate rate limiter for general API endpoints
  api: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  }),

  // Lenient rate limiter for public endpoints
  public: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  }),
}

