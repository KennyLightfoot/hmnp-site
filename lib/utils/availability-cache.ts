/**
 * Global availability cache to prevent multiple components from requesting the same data
 */

interface CachedAvailability {
  data: any;
  timestamp: number;
  expires: number;
}

class AvailabilityCache {
  private cache = new Map<string, CachedAvailability>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes
  private readonly CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Clean up expired entries periodically
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
    }
    return null;
  }

  set(key: string, data: any): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + this.TTL
    });
  }

  has(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? Date.now() < cached.expires : false;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now >= cached.expires) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const availabilityCache = new AvailabilityCache();

/**
 * Cached availability fetcher that checks global cache first
 */
export async function fetchAvailabilityCached(
  serviceId: string,
  date: string,
  timezone = 'America/Chicago'
): Promise<any> {
  const cacheKey = `availability-${serviceId}-${date}-${timezone}`;
  
  // Check global cache first
  const cached = availabilityCache.get(cacheKey);
  if (cached) {
    console.log(`📦 Cache hit for ${date}`);
    return cached;
  }

  // If not in cache, fetch and cache the result
  console.log(`🌐 Fetching availability for ${date}`);
  const { fetchAvailabilityDeduped } = await import('@/lib/utils/request-deduplicator');
  const result = await fetchAvailabilityDeduped(serviceId, date, timezone);
  
  // Cache the result
  availabilityCache.set(cacheKey, result);
  
  return result;
} 