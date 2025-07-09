/**
 * Transparent Pricing Cache System
 * Phase 4 Week 3: Performance Optimization
 * 
 * This module provides intelligent caching for pricing calculations
 * to improve response times and reduce API load.
 */

import { Redis } from 'ioredis';
import crypto from 'crypto';

// ============================================================================
// 🚀 CACHE CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  // Cache TTL (Time To Live) in seconds
  pricing_calculation: 300, // 5 minutes for pricing calculations
  travel_distance: 3600,   // 1 hour for travel distance calculations
  service_area: 7200,      // 2 hours for service area validations
  business_rules: 1800,    // 30 minutes for business rules
  
  // Cache prefixes
  prefixes: {
    pricing: 'pricing:transparent:',
    travel: 'travel:distance:',
    area: 'service:area:',
    rules: 'business:rules:'
  }
} as const;

// ============================================================================
// 📊 CACHE INTERFACE
// ============================================================================

export interface PricingCacheEntry {
  result: any;
  timestamp: number;
  requestHash: string;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  avgResponseTime: number;
}

// ============================================================================
// 🔧 PRICING CACHE SERVICE
// ============================================================================

export class PricingCacheService {
  private static redis: Redis | null = null;
  private static stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    totalResponseTime: 0
  };

  /**
   * Initialize Redis connection (if available)
   */
  static async initialize(): Promise<boolean> {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL);
        await this.redis.ping();
        console.log('✅ Pricing cache initialized with Redis');
        return true;
      } else {
        console.log('ℹ️ No Redis URL found, using in-memory cache fallback');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Redis connection failed, using in-memory cache:', error);
      this.redis = null;
      return false;
    }
  }

  /**
   * Generate cache key for pricing request
   */
  static generateCacheKey(request: any, prefix: string = CACHE_CONFIG.prefixes.pricing): string {
    // Create deterministic hash from request parameters
    const relevantParams = {
      serviceType: request.serviceType,
      documentCount: request.documentCount || 1,
      signerCount: request.signerCount || 1,
      address: request.address,
      customerType: request.customerType || 'new',
      // Round scheduledDateTime to nearest hour for caching efficiency
      scheduledHour: request.scheduledDateTime ? 
        new Date(request.scheduledDateTime).toISOString().slice(0, 13) : null
    };

    const hashInput = JSON.stringify(relevantParams);
    const hash = crypto.createHash('md5').update(hashInput).digest('hex');
    
    return `${prefix}${hash}`;
  }

  /**
   * Get cached pricing result
   */
  static async getCachedPricing(request: any): Promise<any | null> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      const cacheKey = this.generateCacheKey(request);
      let cachedData: string | null = null;

      if (this.redis) {
        cachedData = await this.redis.get(cacheKey);
      } else {
        // Fallback to in-memory cache (basic implementation)
        cachedData = this.getFromMemoryCache(cacheKey);
      }

      if (cachedData) {
        const entry: PricingCacheEntry = JSON.parse(cachedData);
        
        // Check if cache entry is still valid
        const age = Date.now() - entry.timestamp;
        if (age < entry.ttl * 1000) {
          this.stats.hits++;
          this.stats.totalResponseTime += Date.now() - startTime;
          
          console.log(`🎯 Cache HIT for pricing request (${age}ms old)`);
          return entry.result;
        } else {
          // Cache expired, remove it
          await this.invalidateCacheKey(cacheKey);
        }
      }

      this.stats.misses++;
      this.stats.totalResponseTime += Date.now() - startTime;
      console.log(`💫 Cache MISS for pricing request`);
      return null;

    } catch (error) {
      console.warn('⚠️ Cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Cache pricing result
   */
  static async cachePricingResult(request: any, result: any): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const ttl = CACHE_CONFIG.pricing_calculation;
      
      const cacheEntry: PricingCacheEntry = {
        result,
        timestamp: Date.now(),
        requestHash: cacheKey,
        ttl
      };

      const serializedData = JSON.stringify(cacheEntry);

      if (this.redis) {
        await this.redis.setex(cacheKey, ttl, serializedData);
      } else {
        // Fallback to in-memory cache
        this.setInMemoryCache(cacheKey, serializedData, ttl);
      }

      console.log(`💾 Cached pricing result for ${ttl}s`);

    } catch (error) {
      console.warn('⚠️ Cache storage error:', error);
    }
  }

  /**
   * Cache travel distance calculation
   */
  static async cacheTravelDistance(address: string, distance: number, zone: string): Promise<void> {
    try {
      const cacheKey = `${CACHE_CONFIG.prefixes.travel}${crypto.createHash('md5').update(address.toLowerCase()).digest('hex')}`;
      const ttl = CACHE_CONFIG.travel_distance;
      
      const data = {
        distance,
        zone,
        timestamp: Date.now()
      };

      if (this.redis) {
        await this.redis.setex(cacheKey, ttl, JSON.stringify(data));
      } else {
        this.setInMemoryCache(cacheKey, JSON.stringify(data), ttl);
      }

      console.log(`🗺️ Cached travel distance for ${address}: ${distance} miles`);

    } catch (error) {
      console.warn('⚠️ Travel distance cache error:', error);
    }
  }

  /**
   * Get cached travel distance
   */
  static async getCachedTravelDistance(address: string): Promise<{ distance: number; zone: string } | null> {
    try {
      const cacheKey = `${CACHE_CONFIG.prefixes.travel}${crypto.createHash('md5').update(address.toLowerCase()).digest('hex')}`;
      
      let cachedData: string | null = null;
      if (this.redis) {
        cachedData = await this.redis.get(cacheKey);
      } else {
        cachedData = this.getFromMemoryCache(cacheKey);
      }

      if (cachedData) {
        const data = JSON.parse(cachedData);
        const age = Date.now() - data.timestamp;
        
        if (age < CACHE_CONFIG.travel_distance * 1000) {
          console.log(`🎯 Cache HIT for travel distance: ${address}`);
          return { distance: data.distance, zone: data.zone };
        }
      }

      return null;

    } catch (error) {
      console.warn('⚠️ Travel distance cache retrieval error:', error);
      return null;
    }
  }

  /**
   * Invalidate specific cache key
   */
  static async invalidateCacheKey(key: string): Promise<void> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        this.deleteFromMemoryCache(key);
      }
    } catch (error) {
      console.warn('⚠️ Cache invalidation error:', error);
    }
  }

  /**
   * Invalidate all pricing cache
   */
  static async invalidateAllPricingCache(): Promise<void> {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(`${CACHE_CONFIG.prefixes.pricing}*`);
        if (keys.length > 0) {
          await this.redis.del(...keys);
          console.log(`🧹 Invalidated ${keys.length} pricing cache entries`);
        }
      } else {
        this.clearMemoryCache();
        console.log(`🧹 Cleared in-memory pricing cache`);
      }
    } catch (error) {
      console.warn('⚠️ Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    const hitRate = this.stats.totalRequests > 0 ? 
      (this.stats.hits / this.stats.totalRequests) * 100 : 0;
    
    const avgResponseTime = this.stats.totalRequests > 0 ? 
      this.stats.totalResponseTime / this.stats.totalRequests : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      totalRequests: this.stats.totalRequests,
      avgResponseTime: Math.round(avgResponseTime * 100) / 100
    };
  }

  /**
   * Reset cache statistics
   */
  static resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      totalResponseTime: 0
    };
  }

  // ========================================================================
  // 💾 IN-MEMORY CACHE FALLBACK
  // ========================================================================

  private static memoryCache = new Map<string, { data: string; expiry: number }>();

  private static getFromMemoryCache(key: string): string | null {
    const entry = this.memoryCache.get(key);
    if (entry && Date.now() < entry.expiry) {
      return entry.data;
    } else if (entry) {
      this.memoryCache.delete(key);
    }
    return null;
  }

  private static setInMemoryCache(key: string, data: string, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.memoryCache.set(key, { data, expiry });

    // Clean up expired entries periodically
    if (Math.random() < 0.1) { // 10% chance on each set
      this.cleanupMemoryCache();
    }
  }

  private static deleteFromMemoryCache(key: string): void {
    this.memoryCache.delete(key);
  }

  private static clearMemoryCache(): void {
    this.memoryCache.clear();
  }

  private static cleanupMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache.entries()) {
      if (now >= entry.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// ============================================================================
// 🎯 CACHE DECORATOR
// ============================================================================

/**
 * Decorator for caching pricing calculations
 */
export function withPricingCache(ttlSeconds: number = CACHE_CONFIG.pricing_calculation) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const request = args[0];
      
      // Try to get from cache first
      const cachedResult = await PricingCacheService.getCachedPricing(request);
      if (cachedResult) {
        return cachedResult;
      }

      // Execute original method
      const result = await method.apply(this, args);

      // Cache the result
      await PricingCacheService.cachePricingResult(request, result);

      return result;
    };
  };
}

export default PricingCacheService; 