/**
 * API Fallback Utility
 *
 * This utility provides functions to handle API requests with fallback mechanisms,
 * making your application more resilient to API failures.
 */

/**
 * Configuration options for API requests
 */
export interface ApiRequestOptions extends RequestInit {
  /** Number of retry attempts for failed requests */
  retries?: number
  /** Delay between retries in milliseconds */
  retryDelay?: number
  /** Whether to use exponential backoff for retries */
  exponentialBackoff?: boolean
  /** Custom error handler */
  onError?: (error: Error) => void
}

/**
 * Default configuration for API requests
 */
const defaultOptions: ApiRequestOptions = {
  retries: 2,
  retryDelay: 1000,
  exponentialBackoff: true,
  headers: {
    "Content-Type": "application/json",
  },
}

/**
 * Fetches data from an API endpoint with fallback support
 *
 * @param endpoint The API endpoint to fetch from
 * @param fallbackData Data to return if the API request fails
 * @param options Optional fetch options and retry configuration
 * @returns The API response data or fallback data if the request fails
 *
 * @example
 * // Basic usage
 * const data = await apiFallback('/api/users', []);
 *
 * @example
 * // With custom options
 * const data = await apiFallback('/api/users', [], {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   retries: 3,
 * });
 */
export async function apiFallback<T>(endpoint: string, fallbackData: T, options?: ApiRequestOptions): Promise<T> {
  const config = { ...defaultOptions, ...options }
  const {
    retries = defaultOptions.retries,
    retryDelay = defaultOptions.retryDelay,
    exponentialBackoff = defaultOptions.exponentialBackoff,
    onError,
    ...fetchOptions
  } = config

  let lastError: Error | null = null
  let attempt = 0

  while (attempt <= retries!) {
    try {
      const response = await fetch(endpoint, {
        ...fetchOptions,
        headers: {
          ...defaultOptions.headers,
          ...fetchOptions.headers,
        },
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Log the error
      console.error(`API request failed (attempt ${attempt + 1}/${retries! + 1}):`, lastError)

      // Call custom error handler if provided
      if (onError) {
        onError(lastError)
      }

      // If we've used all retry attempts, break out of the loop
      if (attempt >= retries!) {
        break
      }

      // Wait before retrying
      const delay = exponentialBackoff ? retryDelay! * Math.pow(2, attempt) : retryDelay!

      await new Promise((resolve) => setTimeout(resolve, delay))
      attempt++
    }
  }

  // If we get here, all attempts failed
  console.warn(`All ${retries! + 1} API request attempts failed. Using fallback data.`)
  return fallbackData
}

/**
 * Result of a form submission
 */
export interface FormSubmissionResult<T = any> {
  /** Whether the submission was successful */
  success: boolean
  /** Message to display to the user */
  message: string
  /** Data returned from the API */
  data?: T
  /** Error object if the submission failed */
  error?: Error
}

/**
 * Submits form data to an API endpoint with error handling
 *
 * @param endpoint The API endpoint to submit to
 * @param data The form data to submit
 * @param options Optional fetch options and retry configuration
 * @returns Object containing success status, message, and optional data
 *
 * @example
 * // With FormData
 * const formData = new FormData(formElement);
 * const result = await safeFormSubmit('/api/contact', formData);
 *
 * @example
 * // With JSON data
 * const result = await safeFormSubmit('/api/contact', { name: 'John', email: 'john@example.com' });
 */
export async function safeFormSubmit<T = any>(
  endpoint: string,
  data: FormData | Record<string, any>,
  options?: ApiRequestOptions,
): Promise<FormSubmissionResult<T>> {
  const config = { ...defaultOptions, ...options }
  const {
    retries = defaultOptions.retries,
    retryDelay = defaultOptions.retryDelay,
    exponentialBackoff = defaultOptions.exponentialBackoff,
    onError,
    ...fetchOptions
  } = config

  const isFormData = data instanceof FormData
  let attempt = 0

  while (attempt <= retries!) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        ...fetchOptions,
        headers: isFormData
          ? { ...fetchOptions.headers }
          : {
              "Content-Type": "application/json",
              ...fetchOptions.headers,
            },
        body: isFormData ? data : JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: result.message || `Error: ${response.status} ${response.statusText}`,
          error: new Error(result.message || `Error: ${response.status} ${response.statusText}`),
        }
      }

      return {
        success: true,
        message: result.message || "Operation completed successfully",
        data: result.data,
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error))

      // Log the error
      console.error(`Form submission failed (attempt ${attempt + 1}/${retries! + 1}):`, errorObj)

      // Call custom error handler if provided
      if (onError) {
        onError(errorObj)
      }

      // If we've used all retry attempts, break out of the loop
      if (attempt >= retries!) {
        return {
          success: false,
          message: "An unexpected error occurred. Please try again later.",
          error: errorObj,
        }
      }

      // Wait before retrying
      const delay = exponentialBackoff ? retryDelay! * Math.pow(2, attempt) : retryDelay!

      await new Promise((resolve) => setTimeout(resolve, delay))
      attempt++
    }
  }

  // This should never be reached due to the return in the catch block
  return {
    success: false,
    message: "An unexpected error occurred. Please try again later.",
  }
}

/**
 * Fetches data with a timeout
 *
 * @param endpoint The API endpoint to fetch from
 * @param fallbackData Data to return if the API request fails or times out
 * @param timeoutMs Timeout in milliseconds
 * @param options Optional fetch options
 * @returns The API response data or fallback data if the request fails or times out
 *
 * @example
 * // With a 3-second timeout
 * const data = await fetchWithTimeout('/api/slow-endpoint', defaultData, 3000);
 */
export async function fetchWithTimeout<T>(
  endpoint: string,
  fallbackData: T,
  timeoutMs = 5000,
  options?: RequestInit,
): Promise<T> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch(endpoint, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.error(`API request timed out after ${timeoutMs}ms:`, endpoint)
      return fallbackData
    }

    console.error("API request failed:", error)
    return fallbackData
  }
}

/**
 * Creates a cached version of an API fetch function
 *
 * @param fetchFn The function that fetches data
 * @param cacheKey A unique key for the cache
 * @param expiryMs Cache expiry time in milliseconds
 * @returns A function that returns cached data if available, or fetches new data
 *
 * @example
 * const getCachedUsers = createCachedFetch(
 *   () => fetch('/api/users').then(res => res.json()),
 *   'users',
 *   60000 // 1 minute
 * );
 *
 * // This will use cached data if available and not expired
 * const users = await getCachedUsers();
 */
export function createCachedFetch<T>(fetchFn: () => Promise<T>, cacheKey: string, expiryMs = 60000): () => Promise<T> {
  let cachedData: T | null = null
  let cacheTime = 0

  return async () => {
    const now = Date.now()

    // If we have cached data and it's not expired, return it
    if (cachedData && now - cacheTime < expiryMs) {
      return cachedData
    }

    try {
      // Fetch fresh data
      const data = await fetchFn()

      // Update cache
      cachedData = data
      cacheTime = now

      return data
    } catch (error) {
      console.error(`Error fetching data for cache key "${cacheKey}":`, error)

      // If we have stale cached data, return it rather than failing
      if (cachedData) {
        console.warn(`Returning stale cached data for "${cacheKey}"`)
        return cachedData
      }

      throw error
    }
  }
}
