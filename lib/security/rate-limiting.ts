/**
 * Advanced Rate Limiting System
 * Protects against abuse while allowing legitimate traffic
 * Implements multiple rate limiting strategies
 */

import { NextRequest, NextResponse } from 'next/server';
import { RateLimitError } from '@/lib/monitoring/api-error-handler';
import { redis } from '@/lib/redis';

// In-memory store for development or when Redis is unavailable
const rateLimitStore = new Map<string, { count: number; resetTime: number; firstRequest: number }>();

// Rate limit configurations for different endpoints
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function envBool(name: string, fallback = false): boolean {
  const v = (process.env[name] || '').toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

function getRateLimitConfig(limitType: keyof typeof RATE_LIMITS_BASE) {
  // Global disable switch (use cautiously; for previews/testing only)
  if (envBool('RATE_LIMIT_DISABLE_ALL', false)) {
    return { windowMs: 60_000, maxRequests: Number.MAX_SAFE_INTEGER, message: 'Rate limit disabled' };
  }

  // Start with base
  const base = RATE_LIMITS_BASE[limitType];

  // Per-type overrides (window and max)
  if (limitType === 'booking_create') {
    if (envBool('RATE_LIMIT_BOOKING_CREATE_DISABLED', false)) {
      return { ...base, windowMs: base.windowMs, maxRequests: Number.MAX_SAFE_INTEGER };
    }
    const windowMs = envInt('RATE_LIMIT_BOOKING_CREATE_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_BOOKING_CREATE_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  if (limitType === 'api_general') {
    const windowMs = envInt('RATE_LIMIT_API_GENERAL_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_API_GENERAL_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  if (limitType === 'public') {
    const windowMs = envInt('RATE_LIMIT_PUBLIC_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_PUBLIC_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  if (limitType === 'payment_create') {
    const windowMs = envInt('RATE_LIMIT_PAYMENT_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_PAYMENT_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  if (limitType === 'auth_login') {
    const windowMs = envInt('RATE_LIMIT_AUTH_LOGIN_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_AUTH_LOGIN_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  if (limitType === 'admin') {
    const windowMs = envInt('RATE_LIMIT_ADMIN_WINDOW_MS', base.windowMs);
    const maxRequests = envInt('RATE_LIMIT_ADMIN_MAX_REQUESTS', base.maxRequests);
    return { ...base, windowMs, maxRequests };
  }

  return base;
}

const RATE_LIMITS_BASE = {
  // Booking endpoints - critical business operations
  booking_create: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 booking attempts per 15 minutes per IP
    message: 'Too many booking attempts. Please try again in 15 minutes.',
  },
  
  // Authentication endpoints
  auth_login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // 10 login attempts per 15 minutes
    message: 'Too many login attempts. Please try again in 15 minutes.',
  },
  
  // Payment endpoints
  payment_create: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 payment attempts per 5 minutes
    message: 'Too many payment attempts. Please try again in 5 minutes.',
  },
  
  // General API endpoints
  api_general: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'Too many requests. Please slow down.',
  },
  
  // Public endpoints (more restrictive)
  public: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: 'Too many requests. Please slow down.',
  },
  
  // Admin endpoints (less restrictive but monitored)
  admin: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'Admin rate limit exceeded.',
  },
} as const;

export const RATE_LIMITS = new Proxy(RATE_LIMITS_BASE, {
  get(target, prop: keyof typeof RATE_LIMITS_BASE) {
    return getRateLimitConfig(prop);
  }
});

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session/auth
  const userId = request.headers.get('x-user-id');
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIP || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Create rate limit key
 */
function createRateLimitKey(
  clientId: string,
  limitType: RateLimitType,
  endpoint?: string
): string {
  return `ratelimit:${limitType}:${clientId}:${endpoint || 'default'}`;
}

/**
 * Check rate limit for a request
 */
export async function checkRateLimit(
  request: NextRequest,
  limitType: RateLimitType,
  endpoint?: string
): Promise<{
  allowed: boolean;
  resetTime: number;
  remaining: number;
  total: number;
}> {
  const config = RATE_LIMITS[limitType];
  const clientId = getClientIdentifier(request);
  const key = createRateLimitKey(clientId, limitType, endpoint);
  const now = Date.now();

  // Prefer Redis in production if available
  const useRedis = process.env.NODE_ENV === 'production' && (redis as any)?.isAvailable?.();

  if (useRedis) {
    try {
      // Use INCR + EXPIRE strategy for simplicity
      const ttlSeconds = Math.ceil(config.windowMs / 1000);
      // Increment
      const count = await (redis as any).incr(key);
      if (count === 1) {
        await (redis as any).expire(key, ttlSeconds);
      }
      const allowed = count <= config.maxRequests;
      const resetTime = now + config.windowMs;
      return {
        allowed,
        resetTime,
        remaining: Math.max(0, config.maxRequests - count),
        total: config.maxRequests,
      };
    } catch {
      // Fallback to memory on Redis failure
    }
  }

  // Memory fallback
  cleanupExpiredEntries();
  let data = rateLimitStore.get(key);
  if (!data || now > data.resetTime) {
    data = { count: 0, resetTime: now + config.windowMs, firstRequest: now };
  }
  const allowed = data.count < config.maxRequests;
  if (allowed) {
    data.count++;
    rateLimitStore.set(key, data);
  }
  return {
    allowed,
    resetTime: data.resetTime,
    remaining: Math.max(0, config.maxRequests - data.count),
    total: config.maxRequests,
  };
}

/**
 * Rate limiting middleware
 */
export function withRateLimit(limitType: RateLimitType, endpoint?: string) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
      const result = await checkRateLimit(request, limitType, endpoint);
      
      // Add rate limit headers to response
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', result.total.toString());
      headers.set('X-RateLimit-Remaining', result.remaining.toString());
      headers.set('X-RateLimit-Reset', result.resetTime.toString());
      
      if (!result.allowed) {
        const config = RATE_LIMITS[limitType];
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        
        headers.set('Retry-After', retryAfter.toString());
        
        // Log rate limit exceeded
        console.warn('[RATE_LIMIT] Limit exceeded:', {
          limitType,
          endpoint,
          clientId: getClientIdentifier(request),
          resetTime: new Date(result.resetTime).toISOString(),
        });
        
        throw new RateLimitError(result.resetTime);
      }
      
      // Call original handler
      const response = await handler(request, ...args);
      
      // Add rate limit headers to successful response
      headers.forEach((value, key) => {
        response.headers.set(key, value);
      });
      
      return response;
    };
  };
}

/**
 * Adaptive rate limiting based on system load
 */
export function adaptiveRateLimit(
  request: NextRequest,
  baseLimit: RateLimitType,
  systemLoad: number = 0.5 // 0-1, where 1 is maximum load
): {
  allowed: boolean;
  resetTime: number;
  remaining: number;
  total: number;
} {
  const config = RATE_LIMITS[baseLimit];
  
  // Reduce limits based on system load
  const adjustedMaxRequests = Math.floor(
    config.maxRequests * (1 - systemLoad * 0.5)
  );
  
  // Create a modified config
  const adaptedConfig = {
    ...config,
    maxRequests: Math.max(1, adjustedMaxRequests), // At least 1 request allowed
  };
  
  // Use the same logic but with adapted limits
  const clientId = getClientIdentifier(request);
  const key = createRateLimitKey(clientId, baseLimit, 'adaptive');
  const now = Date.now();
  
  let data = rateLimitStore.get(key);
  if (!data || now > data.resetTime) {
    data = {
      count: 0,
      resetTime: now + adaptedConfig.windowMs,
      firstRequest: now,
    };
  }
  
  const allowed = data.count < adaptedConfig.maxRequests;
  
  if (allowed) {
    data.count++;
    rateLimitStore.set(key, data);
  }
  
  return {
    allowed,
    resetTime: data.resetTime,
    remaining: Math.max(0, adaptedConfig.maxRequests - data.count),
    total: adaptedConfig.maxRequests,
  };
}

/**
 * Burst protection - allows short bursts but enforces stricter long-term limits
 */
export async function checkBurstProtection(
  request: NextRequest,
  shortWindow: { windowMs: number; maxRequests: number },
  longWindow: { windowMs: number; maxRequests: number }
): Promise<{ allowed: boolean; reason?: string }> {
  const clientId = getClientIdentifier(request);
  
  // Check short window (burst)
  const shortResult = await checkRateLimit(request, 'api_general', 'burst_short');
  if (!shortResult.allowed) {
    return { allowed: false, reason: 'Short-term burst limit exceeded' };
  }
  
  // Check long window (sustained)
  const longResult = await checkRateLimit(request, 'api_general', 'burst_long');
  if (!longResult.allowed) {
    return { allowed: false, reason: 'Long-term rate limit exceeded' };
  }
  
  return { allowed: true };
}

/**
 * IP-based blocking for abuse detection
 */
const blockedIPs = new Set<string>();
const suspiciousActivity = new Map<string, { count: number; lastActivity: number }>();

export function checkIPRestrictions(request: NextRequest): {
  allowed: boolean;
  reason?: string;
} {
  const clientId = getClientIdentifier(request);
  const ip = clientId.startsWith('ip:') ? clientId.slice(3) : 'unknown';
  
  // Check if IP is blocked
  if (blockedIPs.has(ip)) {
    return { allowed: false, reason: 'IP address blocked' };
  }
  
  // Check for suspicious activity patterns
  const activity = suspiciousActivity.get(ip);
  const now = Date.now();
  
  if (activity) {
    // Reset counter if last activity was more than 1 hour ago
    if (now - activity.lastActivity > 60 * 60 * 1000) {
      suspiciousActivity.delete(ip);
    } else if (activity.count > 1000) { // Very high activity
      blockedIPs.add(ip);
      console.warn('[SECURITY] IP blocked for suspicious activity:', ip);
      return { allowed: false, reason: 'Suspicious activity detected' };
    }
  }
  
  // Update activity counter
  suspiciousActivity.set(ip, {
    count: (activity?.count || 0) + 1,
    lastActivity: now,
  });
  
  return { allowed: true };
}

/**
 * Whitelist important IPs (admin, monitoring services, etc.)
 */
const whitelistedIPs = new Set([
  '127.0.0.1',
  '::1',
  // Add your admin IPs, monitoring service IPs, etc.
]);

export function isWhitelistedIP(request: NextRequest): boolean {
  const clientId = getClientIdentifier(request);
  const ip = clientId.startsWith('ip:') ? clientId.slice(3) : 'unknown';
  return whitelistedIPs.has(ip);
}

/**
 * Clean up expired entries from memory store
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
  
  // Also cleanup suspicious activity older than 24 hours
  for (const [ip, activity] of suspiciousActivity.entries()) {
    if (now - activity.lastActivity > 24 * 60 * 60 * 1000) {
      suspiciousActivity.delete(ip);
    }
  }
}

/**
 * Get rate limit statistics for monitoring
 */
export function getRateLimitStats(): {
  totalKeys: number;
  activeClients: number;
  blockedIPs: number;
  suspiciousActivity: number;
} {
  cleanupExpiredEntries();
  
  return {
    totalKeys: rateLimitStore.size,
    activeClients: new Set(
      Array.from(rateLimitStore.keys()).map(key => key.split(':')[2])
    ).size,
    blockedIPs: blockedIPs.size,
    suspiciousActivity: suspiciousActivity.size,
  };
}