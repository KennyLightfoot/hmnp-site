/**
 * Google Maps Distance Helper with Redis Caching
 * Houston Mobile Notary Pros
 * 
 * Provides cached distance calculations to reduce Google Maps API calls
 * and improve performance for frequently requested locations.
 */

import { redis } from '@/lib/redis';
import { logger } from '@/lib/logger';
import { SERVICE_AREA_CONFIG, calculateTravelFee } from '@/lib/config/maps';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface CachedDistanceResult {
  distance: {
    miles: number;
    kilometers: number;
    text: string;
  };
  duration: {
    minutes: number;
    seconds: number;
    text: string;
  };
  travelFee: number;
  isWithinServiceArea: boolean;
  calculatedAt: string;
  source: 'google_maps' | 'cache';
  cacheHit: boolean;
}

export interface DistanceCalculationOptions {
  serviceType?: string;
  forceFresh?: boolean;
  cacheOnly?: boolean;
  customTTL?: number;
}

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  hitRate: number;
  apiCallsSaved: number;
  totalCacheSize: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_CONFIG = {
  // TTL values can be overridden via environment variables so ops can tune cache
  DEFAULT_TTL: Number(process.env.DISTANCE_CACHE_DEFAULT_TTL ?? 24 * 60 * 60), // 24-hour fallback
  EXTENDED_TTL: Number(process.env.DISTANCE_CACHE_EXTENDED_TTL ?? 7 * 24 * 60 * 60), // 7-day fallback
  SHORT_TTL: 60 * 60, // 1 hour for error responses
  
  // Cache key prefixes
  DISTANCE_PREFIX: 'distance:',
  STATS_PREFIX: 'distance_stats:',
  POPULAR_PREFIX: 'popular_locations:',
  
  // Cache management
  MAX_CACHE_SIZE: 10000, // Maximum number of cached entries
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour cleanup interval
  POPULAR_THRESHOLD: 5, // Requests needed to be considered "popular"
};

const BASE_LOCATION = {
  address: '1200 N Amburn Rd, Texas City, TX 77591',
  coordinates: { lat: 29.4052, lng: -94.9355 }
};

// ============================================================================
// DISTANCE HELPER CLASS
// ============================================================================

export class DistanceHelper {
  private static instance: DistanceHelper;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private stats: CacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    hitRate: 0,
    apiCallsSaved: 0,
    totalCacheSize: 0
  };

  private constructor() {
    this.startCleanupTimer();
  }

  static getInstance(): DistanceHelper {
    if (!DistanceHelper.instance) {
      DistanceHelper.instance = new DistanceHelper();
    }
    return DistanceHelper.instance;
  }

  /**
   * Calculate distance with caching
   */
  async calculateDistance(
    destination: string,
    options: DistanceCalculationOptions = {}
  ): Promise<CachedDistanceResult> {
    const {
      serviceType = 'STANDARD_NOTARY',
      forceFresh = false,
      cacheOnly = false,
      customTTL
    } = options;

    this.stats.totalRequests++;
    
    const cacheKey = this.generateCacheKey(destination, serviceType);
    
    try {
      // Check cache first (unless forceFresh is true)
      if (!forceFresh) {
        const cachedResult = await this.getCachedDistance(cacheKey);
        if (cachedResult) {
          this.stats.cacheHits++;
          this.updateHitRate();
          
          // Track popular locations
          await this.trackPopularLocation(destination);
          
          return {
            ...cachedResult,
            source: 'cache',
            cacheHit: true
          };
        }
      }

      // Return null if cache-only mode and no cache hit
      if (cacheOnly) {
        throw new Error('Cache-only mode: No cached result available');
      }

      this.stats.cacheMisses++;
      this.updateHitRate();

      // Calculate fresh distance using Google Maps API
      const freshResult = await this.calculateFreshDistance(destination, serviceType);
      
      // Cache the result
      const ttl = customTTL ?? await this.determineTTL(destination);
      await this.cacheDistance(cacheKey, freshResult, ttl);
      
      // Track popular locations
      await this.trackPopularLocation(destination);
      
      return {
        ...freshResult,
        source: 'google_maps',
        cacheHit: false
      };

    } catch (error) {
      logger.error('Distance calculation failed', error as Error, {
        destination,
        serviceType,
        options
      });
      
      // Try to return stale cache data as fallback
      const staleResult = await this.getStaleCache(cacheKey);
      if (staleResult) {
        logger.warn('Returning stale cache data due to API failure', {
          destination,
          cacheAge: Date.now() - new Date(staleResult.calculatedAt).getTime()
        });
        
        return {
          ...staleResult,
          source: 'cache',
          cacheHit: true
        };
      }
      
      throw error;
    }
  }

  /**
   * Calculate fresh distance using Google Maps API
   */
  private async calculateFreshDistance(
    destination: string,
    serviceType: string
  ): Promise<Omit<CachedDistanceResult, 'source' | 'cacheHit'>> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const url = new URL('https://maps.googleapis.com/maps/api/distancematrix/json');
    url.searchParams.set('origins', BASE_LOCATION.address);
    url.searchParams.set('destinations', destination);
    url.searchParams.set('units', 'imperial');
    url.searchParams.set('mode', 'driving');
    url.searchParams.set('avoid', 'tolls');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API status: ${data.status}`);
    }

    const element = data.rows[0]?.elements[0];
    if (!element || element.status !== 'OK') {
      throw new Error(`No route found to destination: ${destination}`);
    }

    // Extract distance and duration
    const distanceMeters = element.distance.value;
    const durationSeconds = element.duration.value;
    
    const miles = distanceMeters * 0.000621371; // Convert meters to miles
    const kilometers = distanceMeters / 1000;
    const minutes = Math.round(durationSeconds / 60);
    
    // Calculate travel fee
    const travelFee = calculateTravelFee(miles, serviceType);
    const isWithinServiceArea = miles <= SERVICE_AREA_CONFIG.RADII.MAXIMUM;

    return {
      distance: {
        miles: Math.round(miles * 10) / 10, // Round to 1 decimal place
        kilometers: Math.round(kilometers * 10) / 10,
        text: element.distance.text
      },
      duration: {
        minutes,
        seconds: durationSeconds,
        text: element.duration.text
      },
      travelFee,
      isWithinServiceArea,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Get cached distance result
   */
  private async getCachedDistance(cacheKey: string): Promise<CachedDistanceResult | null> {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const result = JSON.parse(cached) as CachedDistanceResult;
        
        // Validate cache entry
        if (this.isValidCacheEntry(result)) {
          return result;
        } else {
          // Remove invalid cache entry
          await redis.del(cacheKey);
        }
      }
      return null;
    } catch (error) {
      logger.error('Cache read error', error as Error, { cacheKey });
      return null;
    }
  }

  /**
   * Cache distance result
   */
  private async cacheDistance(
    cacheKey: string,
    result: Omit<CachedDistanceResult, 'source' | 'cacheHit'>,
    ttl: number
  ): Promise<void> {
    try {
      const cacheData: CachedDistanceResult = {
        ...result,
        source: 'google_maps',
        cacheHit: false
      };
      
      await redis.set(cacheKey, JSON.stringify(cacheData), ttl);
      
      // Update cache size stats
      await this.updateCacheStats();
      
      logger.info('Distance cached successfully', {
        cacheKey,
        ttl,
        miles: result.distance.miles
      });
      
    } catch (error) {
      logger.error('Cache write error', error as Error, { cacheKey });
    }
  }

  /**
   * Generate cache key for destination and service type
   */
  private generateCacheKey(destination: string, serviceType: string): string {
    // Normalize destination for consistent caching
    const normalizedDestination = destination.toLowerCase().trim();
    return `${CACHE_CONFIG.DISTANCE_PREFIX}${normalizedDestination}:${serviceType}`;
  }

  /**
   * Determine TTL based on location popularity and other factors
   */
  private async determineTTL(destination: string): Promise<number> {
    try {
      // Check if location is popular
      const popularKey = `${CACHE_CONFIG.POPULAR_PREFIX}${destination.toLowerCase()}`;
      const requestCount = await redis.get(popularKey);
      
      if (requestCount && parseInt(requestCount) >= CACHE_CONFIG.POPULAR_THRESHOLD) {
        return CACHE_CONFIG.EXTENDED_TTL; // 7 days for popular locations
      }
      
      return CACHE_CONFIG.DEFAULT_TTL; // 24 hours for regular locations
    } catch (error) {
      logger.error('TTL determination error', error as Error);
      return CACHE_CONFIG.DEFAULT_TTL;
    }
  }

  /**
   * Track popular locations for optimized caching
   */
  private async trackPopularLocation(destination: string): Promise<void> {
    try {
      const popularKey = `${CACHE_CONFIG.POPULAR_PREFIX}${destination.toLowerCase()}`;
      await redis.incr(popularKey);
      await redis.expire(popularKey, 30 * 24 * 60 * 60); // 30 days
    } catch (error) {
      logger.error('Popular location tracking error', error as Error);
    }
  }

  /**
   * Get stale cache data as fallback
   */
  private async getStaleCache(cacheKey: string): Promise<CachedDistanceResult | null> {
    try {
      // Look for stale cache with extended key
      const staleKey = `${cacheKey}:stale`;
      const staleData = await redis.get(staleKey);
      
      if (staleData) {
        return JSON.parse(staleData) as CachedDistanceResult;
      }
      
      return null;
    } catch (error) {
      logger.error('Stale cache read error', error as Error);
      return null;
    }
  }

  /**
   * Validate cache entry structure
   */
  private isValidCacheEntry(entry: any): entry is CachedDistanceResult {
    return (
      entry &&
      typeof entry === 'object' &&
      entry.distance &&
      typeof entry.distance.miles === 'number' &&
      entry.duration &&
      typeof entry.duration.minutes === 'number' &&
      typeof entry.travelFee === 'number' &&
      typeof entry.isWithinServiceArea === 'boolean' &&
      entry.calculatedAt &&
      new Date(entry.calculatedAt).getTime() > 0
    );
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.cacheHits / this.stats.totalRequests) * 100 
      : 0;
    this.stats.apiCallsSaved = this.stats.cacheHits;
  }

  /**
   * Update cache size statistics
   */
  private async updateCacheStats(): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_CONFIG.DISTANCE_PREFIX}*`);
      this.stats.totalCacheSize = keys.length;
    } catch (error) {
      logger.error('Cache stats update error', error as Error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.updateCacheStats();
    return { ...this.stats };
  }

  /**
   * Clear all cached distances
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_CONFIG.DISTANCE_PREFIX}*`);
      if (keys.length > 0) {
        await redis.del(...(keys as string[]));
      }
      
      // Reset stats
      this.stats = {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        hitRate: 0,
        apiCallsSaved: 0,
        totalCacheSize: 0
      };
      
      logger.info('Distance cache cleared', { keysDeleted: keys.length });
    } catch (error) {
      logger.error('Cache clear error', error as Error);
      throw error;
    }
  }

  /**
   * Cleanup expired cache entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    try {
      const keys = await redis.keys(`${CACHE_CONFIG.DISTANCE_PREFIX}*`);
      let cleanedCount = 0;
      
      for (const key of keys) {
        const ttl = await redis.ttl(key);
        if (ttl === -1) { // Key exists but has no TTL
          await redis.expire(key, CACHE_CONFIG.DEFAULT_TTL);
        } else if (ttl === -2) { // Key doesn't exist
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        logger.info('Cache cleanup completed', { cleanedCount });
      }
      
    } catch (error) {
      logger.error('Cache cleanup error', error as Error);
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredEntries();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Warm up cache with common locations
   */
  async warmUpCache(commonLocations: string[]): Promise<void> {
    logger.info('Starting cache warm-up', { locationCount: commonLocations.length });
    
    const promises = commonLocations.map(location => 
      this.calculateDistance(location, { serviceType: 'STANDARD_NOTARY' })
        .catch(error => {
          logger.warn('Cache warm-up failed for location', error as Error, { location });
        })
    );
    
    await Promise.allSettled(promises);
    logger.info('Cache warm-up completed');
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Calculate distance with caching (convenience function)
 */
export async function calculateDistanceWithCache(
  destination: string,
  options?: DistanceCalculationOptions
): Promise<CachedDistanceResult> {
  const helper = DistanceHelper.getInstance();
  return helper.calculateDistance(destination, options);
}

/**
 * Get distance cache statistics
 */
export async function getDistanceCacheStats(): Promise<CacheStats> {
  const helper = DistanceHelper.getInstance();
  return helper.getStats();
}

/**
 * Clear distance cache
 */
export async function clearDistanceCache(): Promise<void> {
  const helper = DistanceHelper.getInstance();
  await helper.clearCache();
}

/**
 * Warm up cache with Houston area ZIP codes
 */
export async function warmUpHoustonCache(): Promise<void> {
  const commonHoustonLocations = [
    '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008',
    '77009', '77010', '77011', '77012', '77013', '77014', '77015', '77016',
    '77017', '77018', '77019', '77020', '77021', '77022', '77023', '77024',
    '77025', '77026', '77027', '77028', '77029', '77030', '77031', '77032',
    '77033', '77034', '77035', '77036', '77037', '77038', '77039', '77040',
    '77041', '77042', '77043', '77044', '77045', '77046', '77047', '77048',
    '77049', '77050', '77051', '77052', '77053', '77054', '77055', '77056',
    '77057', '77058', '77059', '77060', '77061', '77062', '77063', '77064',
    '77065', '77066', '77067', '77068', '77069', '77070', '77071', '77072',
    '77073', '77074', '77075', '77076', '77077', '77078', '77079', '77080',
    '77081', '77082', '77083', '77084', '77085', '77086', '77087', '77088',
    '77089', '77090', '77091', '77092', '77093', '77094', '77095', '77096',
    '77097', '77098', '77099', '77201', '77202', '77203', '77204', '77205',
    '77206', '77207', '77208', '77209', '77210', '77212', '77213', '77215',
    '77216', '77217', '77218', '77219', '77220', '77221', '77222', '77223',
    '77224', '77225', '77226', '77227', '77228', '77229', '77230', '77231',
    '77233', '77234', '77235', '77236', '77237', '77238', '77240', '77241',
    '77242', '77243', '77244', '77245', '77248', '77249', '77250', '77251',
    '77252', '77253', '77254', '77255', '77256', '77257', '77258', '77259',
    '77260', '77261', '77262', '77263', '77265', '77266', '77267', '77268',
    '77269', '77270', '77271', '77272', '77273', '77274', '77275', '77276',
    '77277', '77278', '77279', '77280', '77281', '77282', '77284', '77285',
    '77286', '77287', '77288', '77289', '77290', '77291', '77292', '77293',
    '77294', '77296', '77297', '77298', '77299'
  ];

  const helper = DistanceHelper.getInstance();
  await helper.warmUpCache(commonHoustonLocations);
}

// Export singleton instance
export const distanceHelper = DistanceHelper.getInstance();

// Cleanup on process exit
process.on('SIGINT', () => {
  distanceHelper.stopCleanupTimer();
});

process.on('SIGTERM', () => {
  distanceHelper.stopCleanupTimer();
}); 