/**
 * Utility functions for monitoring and improving performance
 */

/**
 * Reports Web Vitals metrics
 * @param metric The web vital metric to report
 */
export function reportWebVitals(metric: any) {
  // In a production environment, you would send this to your analytics service
  if (process.env.NODE_ENV !== "production") {
    console.log(metric)
  }

  // Example implementation for sending to an analytics endpoint
  // const body = JSON.stringify(metric)
  // const url = 'https://example.com/analytics'
  // navigator.sendBeacon && navigator.sendBeacon(url, body)
}

/**
 * Debounces a function to improve performance
 * @param fn The function to debounce
 * @param delay The delay in milliseconds
 * @returns A debounced function
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

/**
 * Throttles a function to improve performance
 * @param fn The function to throttle
 * @param limit The time limit in milliseconds
 * @returns A throttled function
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

