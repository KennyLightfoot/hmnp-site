/**
 * Advanced Caching Strategies
 * 
 * Implements multiple caching layers for optimal performance:
 * - Memory cache for frequently accessed data
 * - Browser cache for static resources
 * - API response cache with TTL
 * - Database query result cache
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  onEvict?: (key: string, value: any) => void;
}

/**
 * Advanced Memory Cache with LRU eviction
 */
export class AdvancedMemoryCache {
  private cache = new Map<string, CacheEntry<any>>();
  private accessOrder: string[] = [];
  private readonly maxSize: number;
  private readonly defaultTTL: number;
  private readonly onEvict?: (key: string, value: any) => void;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000;
    this.defaultTTL = options.ttl || 5 * 60 * 1000; // 5 minutes default
    this.onEvict = options.onEvict;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0,
    };

    // Remove if exists to update position
    if (this.cache.has(key)) {
      this.remove(key);
    }

    // Add to cache
    this.cache.set(key, entry);
    this.accessOrder.push(key);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      this.evictOldest();
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.remove(key);
      return null;
    }

    // Update access order (LRU)
    entry.hits++;
    this.updateAccessOrder(key);

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.remove(key);
      return false;
    }

    return true;
  }

  remove(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry && this.onEvict) {
      this.onEvict(key, entry.data);
    }

    this.accessOrder = this.accessOrder.filter(k => k !== key);
    return this.cache.delete(key);
  }

  clear(): void {
    if (this.onEvict) {
      for (const [key, entry] of this.cache) {
        this.onEvict(key, entry.data);
      }
    }
    this.cache.clear();
    this.accessOrder = [];
  }

  size(): number {
    return this.cache.size;
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const expired = entries.filter(entry => 
      Date.now() - entry.timestamp > entry.ttl
    ).length;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits,
      expired,
      memoryUsage: this.getMemoryUsage(),
    };
  }

  private updateAccessOrder(key: string): void {
    this.accessOrder = this.accessOrder.filter(k => k !== key);
    this.accessOrder.push(key);
  }

  private evictOldest(): void {
    if (this.accessOrder.length === 0) return;

    const oldestKey = this.accessOrder[0];
    this.remove(oldestKey);
  }

  private getMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0;
    for (const [key, entry] of this.cache) {
      size += key.length * 2; // String character size
      size += JSON.stringify(entry.data).length * 2; // Data size estimation
      size += 64; // Entry overhead
    }
    return size;
  }
}

/**
 * API Response Cache with intelligent invalidation
 */
export class APIResponseCache {
  private cache: AdvancedMemoryCache;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(options: CacheOptions = {}) {
    this.cache = new AdvancedMemoryCache({
      ...options,
      ttl: options.ttl || 2 * 60 * 1000, // 2 minutes for API responses
    });
  }

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; tags?: string[] } = {}
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get<T>(key);
    if (cached) {
      return cached;
    }

    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Make new request
    const requestPromise = fetcher().then((data) => {
      this.cache.set(key, data, options.ttl);
      this.pendingRequests.delete(key);
      return data;
    }).catch((error) => {
      this.pendingRequests.delete(key);
      throw error;
    });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  invalidate(key: string): void {
    this.cache.remove(key);
    this.pendingRequests.delete(key);
  }

  invalidateByPattern(pattern: RegExp): void {
    const keysToRemove: string[] = [];
    
    // Collect keys that match pattern
    for (const key of this.cache['cache'].keys()) {
      if (pattern.test(key)) {
        keysToRemove.push(key);
      }
    }

    // Remove matched keys
    keysToRemove.forEach(key => this.invalidate(key));
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }
}

/**
 * Browser Storage Cache (localStorage/sessionStorage)
 */
export class BrowserStorageCache {
  private storage: Storage;
  private prefix: string;

  constructor(type: 'local' | 'session' = 'local', prefix = 'hmnp_cache_') {
    this.storage = type === 'local' ? localStorage : sessionStorage;
    this.prefix = prefix;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const entry = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || 0, // 0 means no expiration
    };

    try {
      this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to set browser cache:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(this.prefix + key);
      if (!item) return null;

      const entry = JSON.parse(item);
      
      // Check expiration
      if (entry.ttl > 0 && Date.now() - entry.timestamp > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data as T;
    } catch (error) {
      console.warn('Failed to get browser cache:', error);
      return null;
    }
  }

  remove(key: string): void {
    try {
      this.storage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to remove browser cache:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear browser cache:', error);
    }
  }
}

/**
 * Multi-layer cache system
 */
export class MultiLayerCache {
  private memoryCache: AdvancedMemoryCache;
  private apiCache: APIResponseCache;
  private browserCache: BrowserStorageCache;

  constructor() {
    this.memoryCache = new AdvancedMemoryCache({
      maxSize: 500,
      ttl: 5 * 60 * 1000, // 5 minutes
    });

    this.apiCache = new APIResponseCache({
      maxSize: 200,
      ttl: 2 * 60 * 1000, // 2 minutes
    });

    this.browserCache = new BrowserStorageCache('local');
  }

  // Memory cache methods
  setMemory<T>(key: string, value: T, ttl?: number): void {
    this.memoryCache.set(key, value, ttl);
  }

  getMemory<T>(key: string): T | null {
    return this.memoryCache.get<T>(key);
  }

  // API cache methods
  async getAPI<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number }
  ): Promise<T> {
    return this.apiCache.get(key, fetcher, options);
  }

  // Browser cache methods
  setBrowser<T>(key: string, value: T, ttl?: number): void {
    this.browserCache.set(key, value, ttl);
  }

  getBrowser<T>(key: string): T | null {
    return this.browserCache.get<T>(key);
  }

  // Multi-layer get with fallback
  async getMultiLayer<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      memoryTTL?: number;
      apiTTL?: number;
      browserTTL?: number;
      persistToBrowser?: boolean;
    } = {}
  ): Promise<T> {
    // Try memory cache first
    let data = this.getMemory<T>(key);
    if (data) return data;

    // Try browser cache
    data = this.getBrowser<T>(key);
    if (data) {
      // Store in memory for faster access
      this.setMemory(key, data, options.memoryTTL);
      return data;
    }

    // Fetch from API
    data = await this.getAPI(key, fetcher, { ttl: options.apiTTL });

    // Store in memory
    this.setMemory(key, data, options.memoryTTL);

    // Optionally persist to browser
    if (options.persistToBrowser) {
      this.setBrowser(key, data, options.browserTTL);
    }

    return data;
  }

  // Cache invalidation
  invalidate(key: string): void {
    this.memoryCache.remove(key);
    this.apiCache.invalidate(key);
    this.browserCache.remove(key);
  }

  invalidatePattern(pattern: RegExp): void {
    this.apiCache.invalidateByPattern(pattern);
    // Note: Memory and browser cache pattern invalidation would need implementation
  }

  // Cache statistics
  getStats() {
    return {
      memory: this.memoryCache.getStats(),
      api: {
        size: this.apiCache['cache'].size(),
      },
      browser: {
        // Browser cache stats would need implementation
      },
    };
  }

  // Cleanup expired entries
  cleanup(): void {
    // Memory cache cleanup is automatic
    // Browser cache cleanup
    this.browserCache.clear();
  }
}

// Global cache instances
export const memoryCache = new AdvancedMemoryCache();
export const apiCache = new APIResponseCache();
export const browserCache = new BrowserStorageCache();
export const multiLayerCache = new MultiLayerCache();

// Cache utilities for specific use cases
export const BookingCache = {
  // Services cache
  services: {
    key: 'booking:services',
    ttl: 10 * 60 * 1000, // 10 minutes
    
    async get() {
      return multiLayerCache.getMultiLayer(
        this.key,
        () => fetch('/api/services').then(r => r.json()),
        {
          memoryTTL: this.ttl,
          apiTTL: this.ttl,
          browserTTL: 30 * 60 * 1000, // 30 minutes in browser
          persistToBrowser: true,
        }
      );
    },

    invalidate() {
      multiLayerCache.invalidate(this.key);
    }
  },

  // Availability cache
  availability: {
    getKey: (serviceId: string, date: string) => `booking:availability:${serviceId}:${date}`,
    ttl: 1 * 60 * 1000, // 1 minute (availability changes frequently)
    
    async get(serviceId: string, date: string) {
      const key = this.getKey(serviceId, date);
      return apiCache.get(
        key,
        () => fetch(`/api/availability-compatible?serviceId=${serviceId}&date=${date}`).then(r => r.json()),
        { ttl: this.ttl }
      );
    },

    invalidate(serviceId: string, date: string) {
      const key = this.getKey(serviceId, date);
      apiCache.invalidate(key);
    },

    invalidateAll() {
      apiCache.invalidateByPattern(/^booking:availability:/);
    }
  },

  // Business settings cache
  settings: {
    key: 'booking:settings',
    ttl: 30 * 60 * 1000, // 30 minutes
    
    async get() {
      return multiLayerCache.getMultiLayer(
        this.key,
        () => fetch('/api/booking-settings').then(r => r.json()),
        {
          memoryTTL: this.ttl,
          apiTTL: this.ttl,
          browserTTL: 60 * 60 * 1000, // 1 hour in browser
          persistToBrowser: true,
        }
      );
    },

    invalidate() {
      multiLayerCache.invalidate(this.key);
    }
  },
};

export default {
  AdvancedMemoryCache,
  APIResponseCache,
  BrowserStorageCache,
  MultiLayerCache,
  memoryCache,
  apiCache,
  browserCache,
  multiLayerCache,
  BookingCache,
};