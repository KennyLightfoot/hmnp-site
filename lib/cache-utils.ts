import { kv } from "@vercel/kv"

// Registry to keep track of all cache keys used in the application
const CACHE_REGISTRY_KEY = "cache:registry"

// Function to register a cache key in the registry
export async function registerCacheKey(key: string): Promise<void> {
  try {
    const cacheKey = `cache:${key}`
    // Get the current registry
    const registry = (await kv.smembers(CACHE_REGISTRY_KEY)) as string[]

    // Add the key to the registry if it doesn't exist
    if (!registry.includes(cacheKey)) {
      await kv.sadd(CACHE_REGISTRY_KEY, cacheKey)
    }
  } catch (error) {
    console.error(`Error registering cache key ${key}:`, error)
  }
}

// Function to fetch data with caching
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600000, // Default TTL: 1 hour in milliseconds
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

// Function to invalidate a specific cache key
export async function invalidateCache(key: string): Promise<void> {
  const cacheKey = `cache:${key}`
  try {
    await kv.del(cacheKey)
  } catch (error) {
    console.error(`Error invalidating cache key ${cacheKey}:`, error)
  }
}

// Function to clear a specific cache entry
export async function clearCacheEntry(key: string): Promise<{ success: boolean; message: string }> {
  const cacheKey = `cache:${key}`
  try {
    await kv.del(cacheKey)
    return { success: true, message: `Cache entry ${key} cleared successfully` }
  } catch (error) {
    console.error(`Error clearing cache entry ${cacheKey}:`, error)
    return { success: false, message: `Failed to clear cache entry: ${error}` }
  }
}

// Function to get all cache keys
export async function getAllCacheKeys(): Promise<string[]> {
  try {
    // First try to get from the registry
    const registryKeys = (await kv.smembers(CACHE_REGISTRY_KEY)) as string[]

    if (registryKeys.length > 0) {
      return registryKeys
    }

    // Fallback to scanning all keys with the cache: prefix
    return await kv.keys("cache:*")
  } catch (error) {
    console.error("Error getting all cache keys:", error)
    return []
  }
}

// Function to clear all cache
export async function clearAllCache(): Promise<number> {
  try {
    const keys = await getAllCacheKeys()
    if (keys.length === 0) return 0

    // Delete all cache keys
    await kv.del(...keys)

    // Also clear the registry
    await kv.del(CACHE_REGISTRY_KEY)

    return keys.length
  } catch (error) {
    console.error("Error clearing all cache:", error)
    return 0
  }
}

