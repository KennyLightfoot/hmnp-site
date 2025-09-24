/**
 * DEPRECATION NOTICE (2025-08)
 *
 * This module remains for select auth flows only. For all Next.js route handlers,
 * prefer the standardized middleware in `lib/security/rate-limiting.ts`:
 *   - withRateLimit(limitType, endpoint)
 *   - or use withComprehensiveSecurity(SecurityLevels.*)
 *
 * Migration example:
 *   export const POST = withRateLimit('auth_login', 'auth_login')(async (req) => { ... })
 */
import { redis } from '@/lib/redis';
import { headers } from 'next/headers';

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
  blocked: boolean;
}

export interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

export class RateLimitService {
  private static readonly DEFAULT_CONFIGS = {
    // Auth endpoints
    login: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    register: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    passwordReset: { maxAttempts: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour
    twoFactor: { maxAttempts: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
    
    // API endpoints
    booking: { maxAttempts: 10, windowMs: 60 * 60 * 1000 }, // 10 bookings per hour
    contact: { maxAttempts: 5, windowMs: 60 * 60 * 1000 }, // 5 contacts per hour
    
    // Brute force protection
    bruteForce: { 
      maxAttempts: 10, 
      windowMs: 60 * 60 * 1000, 
      blockDurationMs: 24 * 60 * 60 * 1000 // 24 hour block
    }
  };

  /**
   * Check rate limit for an endpoint
   */
  static async checkLimit(
    identifier: string,
    endpoint: keyof typeof RateLimitService.DEFAULT_CONFIGS,
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const config = customConfig || this.DEFAULT_CONFIGS[endpoint];
    const key = `rate_limit:${endpoint}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    try {
      // Clean old entries and get current count
      await (redis as any).zremrangebyscore(key, 0, windowStart);
      const currentCount = await (redis as any).zcard(key);

      // Check if blocked (for brute force protection)
      if ((config as any).blockDurationMs) {
        const blockKey = `blocked:${endpoint}:${identifier}`;
        const isBlocked = await redis.get(blockKey);
        
        if (isBlocked) {
          const ttl = await redis.ttl(blockKey);
          return {
            success: false,
            remaining: 0,
            resetTime: now + (ttl * 1000),
            blocked: true
          };
        }
      }

      // Check rate limit
      if (currentCount >= config.maxAttempts) {
        // If brute force protection enabled, block the identifier
        if ((config as any).blockDurationMs) {
          const blockKey = `blocked:${endpoint}:${identifier}`;
          await redis.setex(blockKey, Math.floor((config as any).blockDurationMs / 1000), '1');
        }

        const oldestEntry = await (redis as any).zrange(key, 0, 0, 'WITHSCORES');
        const resetTime = oldestEntry.length > 0 ? 
          parseInt(oldestEntry[1] as string) + config.windowMs : 
          now + config.windowMs;

        return {
          success: false,
          remaining: 0,
          resetTime,
          blocked: false
        };
      }

      // Add current attempt
      await (redis as any).zadd(key, now, `${now}_${Math.random()}`);
      await redis.expire(key, Math.floor(config.windowMs / 1000));

      return {
        success: true,
        remaining: config.maxAttempts - currentCount - 1,
        resetTime: now + config.windowMs,
        blocked: false
      };

    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow request if Redis is down
      return {
        success: true,
        remaining: config.maxAttempts - 1,
        resetTime: now + config.windowMs,
        blocked: false
      };
    }
  }

  /**
   * Get client identifier (IP + User-Agent hash)
   */
  static async getClientIdentifier(): Promise<string> {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 
               headersList.get('x-real-ip') || 
               'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';
    
    // Simple hash of IP + User-Agent for identifier
    const identifier = Buffer.from(`${ip}:${userAgent}`).toString('base64');
    return identifier.substring(0, 32); // Limit length
  }

  /**
   * Check rate limit for current request
   */
  static async checkCurrentRequest(
    endpoint: keyof typeof RateLimitService.DEFAULT_CONFIGS,
    customConfig?: RateLimitConfig
  ): Promise<RateLimitResult> {
    const identifier = await this.getClientIdentifier();
    return this.checkLimit(identifier, endpoint, customConfig);
  }

  /**
   * Reset rate limit for identifier
   */
  static async resetLimit(
    identifier: string,
    endpoint: keyof typeof RateLimitService.DEFAULT_CONFIGS
  ): Promise<void> {
    const key = `rate_limit:${endpoint}:${identifier}`;
    const blockKey = `blocked:${endpoint}:${identifier}`;
    
    await redis.del(key);
    await redis.del(blockKey);
  }

  /**
   * Get rate limit status
   */
  static async getStatus(
    identifier: string,
    endpoint: keyof typeof RateLimitService.DEFAULT_CONFIGS
  ): Promise<{ count: number; blocked: boolean; resetTime: number }> {
    const config = this.DEFAULT_CONFIGS[endpoint];
    const key = `rate_limit:${endpoint}:${identifier}`;
    const blockKey = `blocked:${endpoint}:${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean old entries
    await (redis as any).zremrangebyscore(key, 0, windowStart);
    const count = await (redis as any).zcard(key);
    const blocked = await redis.exists(blockKey) === true;
    
    const oldestEntry = await (redis as any).zrange(key, 0, 0, 'WITHSCORES');
    const resetTime = oldestEntry.length > 0 ? 
      parseInt(oldestEntry[1] as string) + config.windowMs : 
      now + config.windowMs;

    return { count, blocked, resetTime };
  }
} 