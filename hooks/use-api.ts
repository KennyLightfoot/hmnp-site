"use client"

import { useState, useEffect, useCallback } from "react"
import { apiFallback, type ApiRequestOptions } from "@/lib/api-fallback"

interface UseApiOptions<T> extends ApiRequestOptions {
  /** Whether to fetch data immediately */
  immediate?: boolean
  /** Initial data to use before the first fetch */
  initialData?: T
  /** Dependencies array for refetching (similar to useEffect dependencies) */
  deps?: any[]
}

interface UseApiResult<T> {
  /** The fetched data */
  data: T
  /** Whether the data is currently being loaded */
  loading: boolean
  /** Error object if the fetch failed */
  error: Error | null
  /** Function to manually trigger a fetch */
  fetch: () => Promise<T>
  /** Function to reset the state */
  reset: () => void
}

/**
 * Hook for fetching data from an API with fallback support
 *
 * @param endpoint The API endpoint to fetch from
 * @param fallbackData Data to return if the API request fails
 * @param options Optional fetch options and configuration
 * @returns Object containing data, loading state, error, and fetch function
 *
 * @example
 * // Basic usage
 * const { data, loading, error } = useApi('/api/users', []);
 *
 * @example
 * // With manual fetching
 * const { data, loading, error, fetch } = useApi('/api/users', [], { immediate: false });
 *
 * // Later, trigger the fetch manually
 * const handleFetch = () => {
 *   fetch().then(data => {
 *     console.log('Fetched data:', data);
 *   });
 * };
 */
export function useApi<T>(endpoint: string, fallbackData: T, options?: UseApiOptions<T>): UseApiResult<T> {
  const { immediate = true, initialData = fallbackData, deps = [], ...apiOptions } = options || {}

  const [data, setData] = useState<T>(initialData)
  const [loading, setLoading] = useState<boolean>(immediate)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (): Promise<T> => {
    setLoading(true)
    setError(null)

    try {
      const result = await apiFallback<T>(endpoint, fallbackData, {
        ...apiOptions,
        onError: (err) => {
          setError(err)
          if (apiOptions.onError) {
            apiOptions.onError(err)
          }
        },
      })

      setData(result)
      return result
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err))
      setError(errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [endpoint, ...deps])

  const reset = useCallback(() => {
    setData(initialData)
    setLoading(false)
    setError(null)
  }, [initialData])

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [fetchData, immediate])

  return { data, loading, error, fetch: fetchData, reset }
}
