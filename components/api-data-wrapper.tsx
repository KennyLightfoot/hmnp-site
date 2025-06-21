"use client"

import { type ReactNode, useState, useEffect } from "react"

interface ApiDataWrapperProps<T> {
  /** Function to fetch data */
  fetchFn: () => Promise<T>
  /** Data to use if the fetch fails */
  fallbackData: T
  /** Function to render the data */
  children: (data: T) => ReactNode
  /** Loading component to show while fetching */
  loadingComponent?: ReactNode
  /** Error component to show if the fetch fails */
  errorComponent?: (error: Error, retry: () => void) => ReactNode
  /** Whether to fetch data on mount */
  fetchOnMount?: boolean
}

/**
 * Component that wraps API data fetching with loading and error states
 *
 * @example
 * <ApiDataWrapper
 *   fetchFn={() => fetch('/api/users').then(res => res.json())}
 *   fallbackData={[]}
 * >
 *   {(users) => (
 *     <ul>
 *       {users.map(user => (
 *         <li key={user.id}>{user.name}</li>
 *       ))}
 *     </ul>
 *   )}
 * </ApiDataWrapper>
 */
export function ApiDataWrapper<T>({
  fetchFn,
  fallbackData,
  children,
  loadingComponent = <DefaultLoading />,
  errorComponent = DefaultError,
  fetchOnMount = true,
}: ApiDataWrapperProps<T>) {
  const [data, setData] = useState<T>(fallbackData)
  const [loading, setLoading] = useState<boolean>(fetchOnMount)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err : new Error(String(err)))
      setData(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchData()
    }
  }, [fetchOnMount])

  if (loading) {
    return <>{loadingComponent}</>
  }

  if (error) {
    return <>{errorComponent(error, fetchData)}</>
  }

  return <>{children(data)}</>
}

function DefaultLoading() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#002147]"></div>
    </div>
  )
}

function DefaultError(error: Error, retry: () => void) {
  return (
    <div className="p-4 border border-red-300 bg-red-50 rounded-md">
      <p className="text-red-700 mb-2">Error loading data: {error.message}</p>
      <button
        onClick={retry}
        className="px-3 py-1 bg-[#002147] text-white rounded-md hover:bg-[#003167] transition-colors"
      >
        Try Again
      </button>
    </div>
  )
}
