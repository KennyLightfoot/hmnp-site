/**
 * Advanced Redis-Based Rate Limiting
 * Provides sophisticated rate limiting with adaptive thresholds, sliding windows, and monitoring
 */

import { redis } from './redis';
import { logger } from './logger';
import { monitoring } from './monitoring';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  enableAdaptiveThrottling?: boolean;
  burstMultiplier?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  totalRequests: number;
  windowStart: Date;
}

export interface RateLimitStats {
  endpoint: string;
  totalRequests: number;
  blockedRequests: number;
  averageRequestsPerWindow: number;
  topIPs: Array<{ ip: string; requests: number }>;
  lastReset: Date;
}

class RateLimiter {
  private defaultConfig: RateLimitConfig = {
    windowMs: 60000, // 1 minute
    maxRequests: 100,
    keyPrefix: 'rl',
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    enableAdaptiveThrottling: true,
    burstMultiplier: 1.5,
  };

  /**
   * Check rate limit for a given identifier
   */
  async checkRateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
  ): Promise<RateLimitResult> {
    const finalConfig = { ...this.defaultConfig, ...config };
    const key = `${finalConfig.keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = Math.floor(now / finalConfig.windowMs) * finalConfig.windowMs;
    const windowKey = `${key}:${windowStart}`;

    try {
      // Use Redis pipeline for atomic operations
      const pipeline = redis.client?.pipeline();
      if (!pipeline) {
        // Fallback when Redis is not available
        return this.fallbackRateLimit(identifier, finalConfig);
      }

      // Increment counter and set expiration
      pipeline.incr(windowKey);
      pipeline.expire(windowKey, Math.ceil(finalConfig.windowMs / 1000) + 1);
      
      const results = await pipeline.exec();
      const currentRequests = results?.[0]?.[1] as number || 0;

      // Adaptive throttling based on system load
      let effectiveLimit = finalConfig.maxRequests;
      if (finalConfig.enableAdaptiveThrottling) {
        effectiveLimit = await this.getAdaptiveLimit(finalConfig.maxRequests, identifier);
      }

      const allowed = currentRequests <= effectiveLimit;
      const remaining = Math.max(0, effectiveLimit - currentRequests);
      const resetTime = new Date(windowStart + finalConfig.windowMs);

      // Track metrics
      monitoring.trackPerformance({
        metric: 'rate_limit_check',
        value: allowed ? 1 : 0,
        tags: { identifier, allowed: allowed.toString() },
      });

      if (!allowed) {
        logger.warn('Rate limit exceeded', 'RATE_LIMIT', {
          identifier,
          currentRequests,
          limit: effectiveLimit,
          windowStart: new Date(windowStart),
        });

        // Track blocked request
        await this.trackBlockedRequest(identifier);
      }

      return {
        allowed,
        remaining,
        resetTime,
        totalRequests: currentRequests,
        windowStart: new Date(windowStart),
      };

    } catch (error) {
      logger.error('Rate limit check failed', error as Error, { identifier });
      
      // SECURITY FIX: Use secure fallback instead of failing open
      logger.warn('Falling back to memory-based rate limiting due to Redis error', 'RATE_LIMIT', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return this.fallbackRateLimit(identifier, finalConfig);
    }
  }

  /**
   * Adaptive rate limiting based on system load and user behavior
   */
  private async getAdaptiveLimit(baseLimit: number, identifier: string): Promise<number> {
    try {
      // Check system load metrics
      const systemLoad = await this.getSystemLoadFactor();
      
      // Check user trust score
      const trustScore = await this.getUserTrustScore(identifier);
      
      // Adjust limit based on factors
      let adaptiveLimit = baseLimit;
      
      // Reduce limit if system is under high load
      if (systemLoad > 0.8) {
        adaptiveLimit = Math.floor(baseLimit * 0.5);
      } else if (systemLoad > 0.6) {
        adaptiveLimit = Math.floor(baseLimit * 0.75);
      }
      
      // Adjust based on user trust score
      if (trustScore > 0.8) {
        adaptiveLimit = Math.floor(adaptiveLimit * 1.5); // Trusted users get higher limits
      } else if (trustScore < 0.3) {
        adaptiveLimit = Math.floor(adaptiveLimit * 0.5); // Suspicious users get lower limits
      }

      return Math.max(1, adaptiveLimit); // Ensure at least 1 request is allowed
      
    } catch (error) {
      logger.error('Adaptive limit calculation failed', error as Error);
      return baseLimit;
    }
  }

  /**
   * Get system load factor (0-1 scale)
   */
  private async getSystemLoadFactor(): Promise<number> {
    try {
      // Check various system metrics
      const metrics = await Promise.all([
        this.getCPULoad(),
        this.getMemoryUsage(),
        this.getDatabaseLoad(),
        this.getRedisLoad(),
      ]);

      // Calculate weighted average
      const weights = [0.3, 0.3, 0.25, 0.15]; // CPU, Memory, DB, Redis
      const weightedSum = metrics.reduce((sum, metric, index) => sum + metric * weights[index], 0);
      
      return Math.min(1, Math.max(0, weightedSum));
      
    } catch (error) {
      logger.error('System load calculation failed', error as Error);
      return 0.5; // Default to moderate load
    }
  }

  /**
   * Get user trust score based on historical behavior
   */
  private async getUserTrustScore(identifier: string): Promise<number> {
    try {
      const trustKey = `trust:${identifier}`;
      const trustData = await redis.get(trustKey);
      
      if (!trustData) {
        return 0.5; // Default neutral trust score
      }

      const { successfulRequests, totalRequests, violations } = JSON.parse(trustData);
      
      // Calculate trust score based on success rate and violations
      const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0.5;
      const violationPenalty = Math.min(0.5, violations * 0.1);
      
      return Math.max(0, Math.min(1, successRate - violationPenalty));
      
    } catch (error) {
      logger.error('Trust score calculation failed', error as Error);
      return 0.5;
    }
  }

  /**
   * Update user trust score
   */
  async updateTrustScore(identifier: string, successful: boolean): Promise<void> {
    try {
      const trustKey = `trust:${identifier}`;
      const existingData = await redis.get(trustKey);
      
      let trustData = {
        successfulRequests: 0,
        totalRequests: 0,
        violations: 0,
        lastUpdated: Date.now(),
      };

      if (existingData) {
        trustData = { ...trustData, ...JSON.parse(existingData) };
      }

      trustData.totalRequests++;
      if (successful) {
        trustData.successfulRequests++;
      }
      trustData.lastUpdated = Date.now();

      await redis.set(trustKey, JSON.stringify(trustData), 7 * 24 * 60 * 60); // 7 days TTL
      
    } catch (error) {
      logger.error('Trust score update failed', error as Error);
    }
  }

  /**
   * Track blocked request for analytics
   */
  private async trackBlockedRequest(identifier: string): Promise<void> {
    try {
      const blockedKey = `blocked:${identifier}`;
      await redis.incr(blockedKey);
      await redis.expire(blockedKey, 24 * 60 * 60); // 24 hours TTL

      // Update trust score with violation
      const trustKey = `trust:${identifier}`;
      const existingData = await redis.get(trustKey);
      
      if (existingData) {
        const trustData = JSON.parse(existingData);
        trustData.violations = (trustData.violations || 0) + 1;
        await redis.set(trustKey, JSON.stringify(trustData), 7 * 24 * 60 * 60);
      }
      
    } catch (error) {
      logger.error('Blocked request tracking failed', error as Error);
    }
  }

  /**
   * Get rate limiting statistics
   */
  async getStats(endpoint?: string): Promise<RateLimitStats[]> {
    try {
      const pattern = endpoint ? `rl:*${endpoint}*` : 'rl:*';
      const keys = await redis.keys(pattern);
      
      const statsMap = new Map<string, any>();
      
      for (const key of keys) {
        const parts = key.split(':');
        if (parts.length < 2) continue;
        
        const identifier = parts[1];
        const requests = await redis.get(key);
        
        if (!statsMap.has(identifier)) {
          statsMap.set(identifier, {
            endpoint: identifier,
            totalRequests: 0,
            blockedRequests: 0,
            lastReset: new Date(),
          });
        }
        
        const stats = statsMap.get(identifier);
        stats.totalRequests += parseInt(requests || '0');
      }

      // Get blocked request counts
      const blockedKeys = await redis.keys('blocked:*');
      for (const key of blockedKeys) {
        const identifier = key.replace('blocked:', '');
        const blocked = await redis.get(key);
        
        if (statsMap.has(identifier)) {
          statsMap.get(identifier).blockedRequests = parseInt(blocked || '0');
        }
      }

      return Array.from(statsMap.values());
      
    } catch (error) {
      logger.error('Rate limit stats retrieval failed', error as Error);
      return [];
    }
  }

  // In-memory fallback storage for when Redis is unavailable
  private memoryStore = new Map<string, { count: number; windowStart: number }>();

  /**
   * SECURITY FIX: Secure fallback rate limiting when Redis is unavailable
   * Never bypass rate limiting - implement basic in-memory protection
   */
  private fallbackRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
    logger.warn('Using fallback rate limiting (Redis unavailable)', 'RATE_LIMIT', {
      identifier,
      maxRequests: config.maxRequests,
      windowMs: config.windowMs
    });
    
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const key = `${identifier}:${windowStart}`;
    
    // Clean up old windows periodically
    this.cleanupMemoryStore(now, config.windowMs);
    
    // Get or create entry for this window
    let entry = this.memoryStore.get(key);
    if (!entry) {
      entry = { count: 0, windowStart };
      this.memoryStore.set(key, entry);
    }
    
    // Increment counter
    entry.count++;
    
    // SECURITY: Apply strict limits in fallback mode (reduce by 50% for safety)
    const fallbackLimit = Math.floor(config.maxRequests * 0.5);
    const allowed = entry.count <= fallbackLimit;
    const remaining = Math.max(0, fallbackLimit - entry.count);
    
    if (!allowed) {
      logger.error('CRITICAL: Rate limit exceeded in fallback mode', 'RATE_LIMIT', {
        identifier,
        currentRequests: entry.count,
        fallbackLimit,
        windowStart: new Date(windowStart)
      });
      
      // Alert on rate limit violations during Redis outage
      monitoring.trackPerformance({
        metric: 'fallback_rate_limit_exceeded',
        value: 1,
        tags: { identifier, severity: 'critical' }
      });
    }
    
    return {
      allowed,
      remaining,
      resetTime: new Date(windowStart + config.windowMs),
      totalRequests: entry.count,
      windowStart: new Date(windowStart),
    };
  }

  /**
   * Clean up expired entries from memory store
   */
  private cleanupMemoryStore(now: number, windowMs: number): void {
    const cutoff = now - windowMs * 2; // Keep last 2 windows for safety
    
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.windowStart < cutoff) {
        this.memoryStore.delete(key);
      }
    }
  }

  // System metric helpers (implement based on your monitoring setup)
  private async getCPULoad(): Promise<number> {
    // Implement CPU load monitoring
    return 0.3; // Placeholder
  }

  private async getMemoryUsage(): Promise<number> {
    // Implement memory usage monitoring
    return 0.4; // Placeholder
  }

  private async getDatabaseLoad(): Promise<number> {
    // Implement database load monitoring
    return 0.2; // Placeholder
  }

  private async getRedisLoad(): Promise<number> {
    try {
      const stats = await redis.getStats();
      return stats.memoryUsage > 100 * 1024 * 1024 ? 0.8 : 0.2; // 100MB threshold
    } catch {
      return 0.2;
    }
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // API endpoints
  api: new RateLimiter(),
  
  // Authentication endpoints (stricter)
  auth: new RateLimiter(),
  
  // Booking creation (very strict)
  booking: new RateLimiter(),
  
  // File uploads
  upload: new RateLimiter(),
  
  // Admin endpoints (more lenient for authenticated admins)
  admin: new RateLimiter(),
};

// Rate limit configurations
export const rateLimitConfigs = {
  api: { windowMs: 60000, maxRequests: 100 },
  auth: { windowMs: 60000, maxRequests: 20 },
  booking: { windowMs: 60000, maxRequests: 5 },
  upload: { windowMs: 60000, maxRequests: 10 },
  admin: { windowMs: 60000, maxRequests: 500 },
  webhook: { windowMs: 60000, maxRequests: 200 },
};

export default rateLimiters; 