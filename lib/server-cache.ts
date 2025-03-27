import { kv } from "@vercel/kv"
import { CACHE_TTL } from "@/lib/constants"
import {
  registerCacheKey as registerCacheKeyUtil,
  getAllCacheKeys as getAllCacheKeysUtil,
  clearAllCache as clearAllCacheUtil,
  invalidateCache as invalidateCacheUtil,
} from "@/lib/cache-utils"

// Re-export functions from cache-utils
export const registerCacheKey = registerCacheKeyUtil
export const getAllCacheKeys = getAllCacheKeysUtil
export const clearAllCache = clearAllCacheUtil
export const invalidateCache = invalidateCacheUtil

// Function to fetch data with caching
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CACHE_TTL.MEDIUM,
): Promise<T> {
  // Prefix all cache keys
  const cacheKey = `cache:${key}`

  try {
    // Register this cache key
    await registerCacheKey(key)

    // Try to get from cache first
    const cached = await kv.get(cacheKey)

    if (cached !== null) {
      return cached as T
    }

    // If not in cache, fetch fresh data
    const data = await fetcher()

    // Store in cache with TTL
    await kv.set(cacheKey, data, { ex: Math.floor(ttl / 1000) }) // Convert ms to seconds for Redis

    return data
  } catch (error) {
    console.error(`Cache error for key ${cacheKey}:`, error)
    // If cache fails, fall back to direct fetch
    return fetcher()
  }
}

