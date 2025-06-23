/**
 * Intelligent Caching System
 * Provides multi-layered caching with automatic invalidation, cache warming, and performance optimization
 */

import { redis } from './redis';
import { logger } from './logger';
import { monitoring } from './comprehensive-monitoring';

export interface CacheConfig {
  ttl: number; // Time to live in seconds
  tags?: string[]; // Tags for cache invalidation
  compression?: boolean; // Enable compression for large values
  serialize?: boolean; // Custom serialization
  warmOnMiss?: boolean; // Warm cache on cache miss
  priority?: 'low' | 'medium' | 'high'; // Cache priority for eviction
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalKeys: number;
  memoryUsage: number;
  averageGetTime: number;
  averageSetTime: number;
}

export interface CacheKey {
  key: string;
  tags: string[];
  ttl: number;
  size: number;
  lastAccessed: Date;
  accessCount: number;
}

class IntelligentCache {
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    getTimes: [] as number[],
    setTimes: [] as number[],
  };

  private cacheWarming = new Map<string, () => Promise<any>>();
  private compressionThreshold = 1024; // 1KB

  constructor() {
    this.initializeCacheManagement();
  }

  /**
   * Initialize cache management tasks
   */
  private initializeCacheManagement() {
    // Cache statistics collection every 5 minutes
    setInterval(async () => {
      await this.collectCacheStats();
    }, 5 * 60 * 1000);

    // Cache cleanup every hour
    setInterval(async () => {
      await this.performCacheCleanup();
    }, 60 * 60 * 1000);

    // Cache warming every 30 minutes
    setInterval(async () => {
      await this.performCacheWarming();
    }, 30 * 60 * 1000);

    logger.info('Intelligent caching system initialized');
  }

  /**
   * Get value from cache with intelligent fallback
   */
  async get<T>(
    key: string,
    fallback?: () => Promise<T>,
    config: Partial<CacheConfig> = {}
  ): Promise<T | null> {
    const startTime = Date.now();
    
    try {
      // Try to get from cache
      const cachedValue = await this.getFromCache(key);
      
      if (cachedValue !== null) {
        this.stats.hits++;
        this.recordGetTime(Date.now() - startTime);
        await this.updateAccessStats(key);
        
        monitoring.trackRedisOperation('get_hit', Date.now() - startTime);
        return this.deserializeValue(cachedValue);
      }

      // Cache miss
      this.stats.misses++;
      monitoring.trackRedisOperation('get_miss', Date.now() - startTime);

      // Use fallback if provided
      if (fallback) {
        const value = await fallback();
        
        // Cache the result
        await this.set(key, value, config);
        
        // Warm related cache if configured
        if (config.warmOnMiss) {
          await this.warmRelatedCache(key);
        }
        
        return value;
      }

      return null;

    } catch (error) {
      logger.error('Cache get operation failed', error as Error, { key });
      
      // Try fallback on cache error
      if (fallback) {
        try {
          return await fallback();
        } catch (fallbackError) {
          logger.error('Cache fallback failed', fallbackError as Error, { key });
        }
      }
      
      return null;
    }
  }

  /**
   * Set value in cache with intelligent optimization
   */
  async set<T>(
    key: string,
    value: T,
    config: Partial<CacheConfig> = {}
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const finalConfig: CacheConfig = {
        ttl: 3600, // 1 hour default
        compression: false,
        serialize: true,
        warmOnMiss: false,
        priority: 'medium',
        ...config,
      };

      // Serialize value
      let serializedValue = this.serializeValue(value);
      
      // Compress if value is large
      if (finalConfig.compression || serializedValue.length > this.compressionThreshold) {
        serializedValue = await this.compressValue(serializedValue);
      }

      // Store in Redis
      const success = await redis.set(key, serializedValue, finalConfig.ttl);
      
      if (success) {
        this.stats.sets++;
        this.recordSetTime(Date.now() - startTime);
        
        // Store metadata
        await this.storeCacheMetadata(key, finalConfig, serializedValue.length);
        
        monitoring.trackRedisOperation('set', Date.now() - startTime);
      }

      return success;

    } catch (error) {
      logger.error('Cache set operation failed', error as Error, { key });
      return false;
    }
  }

  /**
   * Delete from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      const success = await redis.del(key);
      if (success) {
        this.stats.deletes++;
        await this.deleteCacheMetadata(key);
      }
      return success;
    } catch (error) {
      logger.error('Cache delete operation failed', error as Error, { key });
      return false;
    }
  }

  /**
   * Invalidate cache by tags
   */
  async invalidateByTags(tags: string[]): Promise<number> {
    let invalidatedCount = 0;
    
    try {
      for (const tag of tags) {
        const tagKey = `tag:${tag}`;
        const keys = await redis.keys(`${tagKey}:*`);
        
        for (const key of keys) {
          const originalKey = key.replace(`${tagKey}:`, '');
          const deleted = await this.delete(originalKey);
          if (deleted) invalidatedCount++;
        }
      }

      logger.info('Cache invalidated by tags', 'CACHE', { tags, count: invalidatedCount });
      return invalidatedCount;

    } catch (error) {
      logger.error('Cache tag invalidation failed', error as Error, { tags });
      return 0;
    }
  }

  /**
   * Warm cache with provided data loader
   */
  async warm(key: string, loader: () => Promise<any>, config?: Partial<CacheConfig>): Promise<void> {
    try {
      // Check if already cached
      const exists = await redis.exists(key);
      if (exists) return;

      // Load and cache data
      const data = await loader();
      await this.set(key, data, config);
      
      logger.info('Cache warmed', 'CACHE', { key });

    } catch (error) {
      logger.error('Cache warming failed', error as Error, { key });
    }
  }

  /**
   * Register cache warming function
   */
  registerWarming(pattern: string, loader: () => Promise<any>): void {
    this.cacheWarming.set(pattern, loader);
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      const redisStats = await redis.getStats();
      const avgGetTime = this.stats.getTimes.length > 0 
        ? this.stats.getTimes.reduce((a, b) => a + b, 0) / this.stats.getTimes.length 
        : 0;
      const avgSetTime = this.stats.setTimes.length > 0
        ? this.stats.setTimes.reduce((a, b) => a + b, 0) / this.stats.setTimes.length
        : 0;

      return {
        hits: this.stats.hits,
        misses: this.stats.misses,
        hitRate: this.stats.hits + this.stats.misses > 0 
          ? this.stats.hits / (this.stats.hits + this.stats.misses) 
          : 0,
        totalKeys: redisStats.keyCount,
        memoryUsage: redisStats.memoryUsage,
        averageGetTime: avgGetTime,
        averageSetTime: avgSetTime,
      };

    } catch (error) {
      logger.error('Cache stats retrieval failed', error as Error);
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalKeys: 0,
        memoryUsage: 0,
        averageGetTime: 0,
        averageSetTime: 0,
      };
    }
  }

  /**
   * Get hot keys (most accessed)
   */
  async getHotKeys(limit = 10): Promise<CacheKey[]> {
    try {
      const metadataKeys = await redis.keys('meta:*');
      const hotKeys: CacheKey[] = [];

      for (const metaKey of metadataKeys) {
        const metadata = await redis.get(metaKey);
        if (metadata) {
          const data = JSON.parse(metadata);
          hotKeys.push({
            key: metaKey.replace('meta:', ''),
            tags: data.tags || [],
            ttl: data.ttl || 0,
            size: data.size || 0,
            lastAccessed: new Date(data.lastAccessed || Date.now()),
            accessCount: data.accessCount || 0,
          });
        }
      }

      return hotKeys
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, limit);

    } catch (error) {
      logger.error('Hot keys retrieval failed', error as Error);
      return [];
    }
  }

  // Private helper methods

  private async getFromCache(key: string): Promise<string | null> {
    return await redis.get(key);
  }

  private serializeValue<T>(value: T): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      logger.error('Value serialization failed', error as Error);
      return String(value);
    }
  }

  private deserializeValue<T>(value: string): T {
    try {
      return JSON.parse(value);
    } catch (error) {
      // Return as string if JSON parsing fails
      return value as unknown as T;
    }
  }

  private async compressValue(value: string): Promise<string> {
    // Implement compression (e.g., using zlib)
    // For now, just return the original value
    return value;
  }

  private async storeCacheMetadata(key: string, config: CacheConfig, size: number): Promise<void> {
    try {
      const metadata = {
        ttl: config.ttl,
        tags: config.tags || [],
        size,
        createdAt: Date.now(),
        lastAccessed: Date.now(),
        accessCount: 1,
        priority: config.priority,
      };

      await redis.set(`meta:${key}`, JSON.stringify(metadata), config.ttl);

      // Store tag mappings
      if (config.tags) {
        for (const tag of config.tags) {
          await redis.set(`tag:${tag}:${key}`, '1', config.ttl);
        }
      }

    } catch (error) {
      logger.error('Cache metadata storage failed', error as Error, { key });
    }
  }

  private async deleteCacheMetadata(key: string): Promise<void> {
    try {
      // Get metadata to find tags
      const metadata = await redis.get(`meta:${key}`);
      if (metadata) {
        const data = JSON.parse(metadata);
        
        // Delete tag mappings
        if (data.tags) {
          for (const tag of data.tags) {
            await redis.del(`tag:${tag}:${key}`);
          }
        }
      }

      // Delete metadata
      await redis.del(`meta:${key}`);

    } catch (error) {
      logger.error('Cache metadata deletion failed', error as Error, { key });
    }
  }

  private async updateAccessStats(key: string): Promise<void> {
    try {
      const metaKey = `meta:${key}`;
      const metadata = await redis.get(metaKey);
      
      if (metadata) {
        const data = JSON.parse(metadata);
        data.lastAccessed = Date.now();
        data.accessCount = (data.accessCount || 0) + 1;
        
        await redis.set(metaKey, JSON.stringify(data), data.ttl);
      }

    } catch (error) {
      logger.error('Access stats update failed', error as Error, { key });
    }
  }

  private async warmRelatedCache(key: string): Promise<void> {
    // Implement related cache warming logic
    // This could be based on key patterns or relationships
  }

  private async collectCacheStats(): Promise<void> {
    try {
      const stats = await this.getStats();
      
      monitoring.trackRedisOperation('cache_hit_rate', stats.hitRate * 100);
      monitoring.trackRedisOperation('cache_memory_usage', stats.memoryUsage);
      
      logger.info('Cache statistics collected', 'CACHE', stats);

    } catch (error) {
      logger.error('Cache stats collection failed', error as Error);
    }
  }

  private async performCacheCleanup(): Promise<void> {
    try {
      // Clean up expired metadata
      const metadataKeys = await redis.keys('meta:*');
      let cleanedCount = 0;

      for (const metaKey of metadataKeys) {
        const key = metaKey.replace('meta:', '');
        const exists = await redis.exists(key);
        
        if (!exists) {
          await this.deleteCacheMetadata(key);
          cleanedCount++;
        }
      }

      logger.info('Cache cleanup completed', 'CACHE', { cleanedCount });

    } catch (error) {
      logger.error('Cache cleanup failed', error as Error);
    }
  }

  private async performCacheWarming(): Promise<void> {
    try {
      let warmedCount = 0;

      for (const [pattern, loader] of this.cacheWarming.entries()) {
        try {
          await this.warm(pattern, loader);
          warmedCount++;
        } catch (error) {
          logger.error('Cache warming failed for pattern', error as Error, { pattern });
        }
      }

      logger.info('Cache warming completed', 'CACHE', { warmedCount });

    } catch (error) {
      logger.error('Cache warming failed', error as Error);
    }
  }

  private recordGetTime(time: number): void {
    this.stats.getTimes.push(time);
    if (this.stats.getTimes.length > 1000) {
      this.stats.getTimes.shift();
    }
  }

  private recordSetTime(time: number): void {
    this.stats.setTimes.push(time);
    if (this.stats.setTimes.length > 1000) {
      this.stats.setTimes.shift();
    }
  }
}

// Pre-configured cache instances for different use cases
export const caches = {
  // General application cache
  app: new IntelligentCache(),
  
  // Session cache (shorter TTL)
  session: new IntelligentCache(),
  
  // API response cache
  api: new IntelligentCache(),
  
  // Database query cache
  database: new IntelligentCache(),
  
  // Static content cache (longer TTL)
  static: new IntelligentCache(),
};

// Cache configurations for different data types
export const cacheConfigs = {
  services: { ttl: 3600, tags: ['services'], priority: 'high' as const },
  availability: { ttl: 300, tags: ['availability'], priority: 'medium' as const },
  user: { ttl: 1800, tags: ['users'], priority: 'medium' as const },
  booking: { ttl: 600, tags: ['bookings'], priority: 'high' as const },
  session: { ttl: 1800, tags: ['sessions'], priority: 'high' as const },
  pricing: { ttl: 7200, tags: ['pricing'], priority: 'medium' as const },
  static: { ttl: 86400, tags: ['static'], priority: 'low' as const },
};

export default caches; 