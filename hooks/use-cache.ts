"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface UseCacheOptions {
  onSuccess?: (message: string) => void
  onError?: (message: string) => void
}

export function useCache(options: UseCacheOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const clearCache = async (key?: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          clearAll: !key,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to clear cache")
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the current page to show updated data
        router.refresh()

        if (options.onSuccess) {
          options.onSuccess(data.message)
        }
      } else {
        throw new Error(data.message || "Failed to clear cache")
      }
    } catch (error) {
      console.error("Error clearing cache:", error)

      if (options.onError) {
        options.onError(error instanceof Error ? error.message : "Failed to clear cache")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const revalidatePath = async (path: string) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path }),
      })

      if (!response.ok) {
        throw new Error("Failed to revalidate path")
      }

      const data = await response.json()

      if (data.success) {
        // Refresh the current page to show updated data
        router.refresh()

        if (options.onSuccess) {
          options.onSuccess(data.message)
        }
      } else {
        throw new Error(data.message || "Failed to revalidate path")
      }
    } catch (error) {
      console.error("Error revalidating path:", error)

      if (options.onError) {
        options.onError(error instanceof Error ? error.message : "Failed to revalidate path")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
    clearCache,
    revalidatePath,
    isLoading,
  }
}

