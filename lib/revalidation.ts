"use server"

import { revalidatePath as nextRevalidatePath, revalidateTag } from "next/cache"
import { kv } from "@vercel/kv"
import { REVALIDATE_TOKEN } from "@/lib/constants"
import { getAllCacheKeys as getCacheKeys, clearCacheEntry } from "@/lib/cache-utils"

// Re-export the required functions
export const revalidatePath = nextRevalidatePath
export const getAllCacheKeys = getCacheKeys

// Function to revalidate a specific cache key
export async function revalidateCacheKey(key: string) {
  try {
    // Delete the specific key from KV store
    await kv.del(key)
    return { success: true, message: `Cache key ${key} revalidated successfully` }
  } catch (error) {
    console.error("Error revalidating cache key:", error)
    return { success: false, message: `Failed to revalidate cache key: ${error}` }
  }
}

// Function to clear all cache
export async function clearAllCache() {
  try {
    // Get all keys with the cache: prefix
    const keys = await kv.keys("cache:*")

    if (keys.length === 0) {
      return { success: true, message: "No cache keys found to clear" }
    }

    // Delete all keys
    await kv.del(...keys)

    // Also revalidate the entire site
    revalidatePath("/", "layout")

    return {
      success: true,
      message: `Cleared ${keys.length} cache keys successfully`,
    }
  } catch (error) {
    console.error("Error clearing all cache:", error)
    return { success: false, message: `Failed to clear cache: ${error}` }
  }
}

// Function to revalidate a specific path
export async function revalidatePage(path: string) {
  try {
    revalidatePath(path)
    return { success: true, message: `Path ${path} revalidated successfully` }
  } catch (error) {
    console.error("Error revalidating path:", error)
    return { success: false, message: `Failed to revalidate path: ${error}` }
  }
}

// Server actions for the admin UI
export async function revalidatePathAction(path: string) {
  try {
    revalidatePath(path)
    return { success: true, message: `Path ${path} revalidated successfully` }
  } catch (error) {
    console.error("Error revalidating path:", error)
    return { success: false, message: `Failed to revalidate path: ${error}` }
  }
}

export async function revalidateTagAction(tag: string) {
  try {
    revalidateTag(tag)
    return { success: true, message: `Tag ${tag} revalidated successfully` }
  } catch (error) {
    console.error("Error revalidating tag:", error)
    return { success: false, message: `Failed to revalidate tag: ${error}` }
  }
}

export async function clearCacheEntryAction(key: string) {
  return clearCacheEntry(key)
}

export async function clearAllCacheAction() {
  return clearAllCache()
}

// API route handler for revalidation
export async function handleRevalidation(token: string, type: "path" | "cache" | "all" | "tag", target?: string) {
  // Validate token
  if (token !== REVALIDATE_TOKEN) {
    return { success: false, message: "Invalid token" }
  }

  try {
    if (type === "path" && target) {
      // Revalidate specific path
      revalidatePath(target)
      return { success: true, message: `Path ${target} revalidated successfully` }
    } else if (type === "tag" && target) {
      // Revalidate specific tag
      revalidateTag(target)
      return { success: true, message: `Tag ${target} revalidated successfully` }
    } else if (type === "cache" && target) {
      // Revalidate specific cache key
      return await revalidateCacheKey(target)
    } else if (type === "all") {
      // Clear all cache
      return await clearAllCache()
    } else {
      return { success: false, message: "Invalid revalidation type or missing target" }
    }
  } catch (error) {
    console.error("Error during revalidation:", error)
    return { success: false, message: `Revalidation failed: ${error}` }
  }
}

