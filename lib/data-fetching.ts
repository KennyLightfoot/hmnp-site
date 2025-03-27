import { fetchWithCache } from "@/lib/server-cache"
import { registerCacheKey } from "@/lib/cache-utils"

// Default TTL values (in milliseconds)
const DEFAULT_TTL = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
}

/**
 * Wrapper for fetchWithCache that includes registration of the cache key
 */
export async function fetchData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number
    description?: string
  } = {},
): Promise<T> {
  // Register the cache key with description for better tracking
  registerCacheKey(key, options.description)

  // Use the provided TTL or default to MEDIUM
  const ttl = options.ttl ?? DEFAULT_TTL.MEDIUM

  return fetchWithCache(key, fetchFn, ttl)
}

/**
 * Helper to create a cache key with a namespace and optional parameters
 */
export function createCacheKey(namespace: string, params?: Record<string, any>): string {
  if (!params) {
    return namespace
  }

  // Sort keys to ensure consistent cache keys regardless of object property order
  const sortedKeys = Object.keys(params).sort()
  const paramString = sortedKeys
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${key}:${JSON.stringify(params[key])}`)
    .join(",")

  return paramString ? `${namespace}:${paramString}` : namespace
}

/**
 * Export TTL constants for use in data fetching functions
 */
export { DEFAULT_TTL }

