/**
 * Rate limiter for API calls
 */

type RateLimitConfig = {
  maxRequests: number // Maximum requests allowed
  interval: number // Time interval in milliseconds
  queueEnabled: boolean // Whether to queue requests that exceed the limit
}

type RequestRecord = {
  timestamp: number
}

type RateLimiterState = {
  requests: RequestRecord[]
  queue: Array<() => Promise<any>>
  processing: boolean
}

// Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 10,
  interval: 1000, // 1 second
  queueEnabled: true,
}

// Store rate limiter state for different endpoints
const limiters: Record<string, RateLimiterState> = {}

/**
 * Initialize a rate limiter for an endpoint
 */
export function initRateLimiter(endpoint: string, config: Partial<RateLimitConfig> = {}): void {
  if (!limiters[endpoint]) {
    limiters[endpoint] = {
      requests: [],
      queue: [],
      processing: false,
    }
  }
}

/**
 * Check if a request would exceed the rate limit
 */
export function wouldExceedRateLimit(endpoint: string, config: Partial<RateLimitConfig> = {}): boolean {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }

  if (!limiters[endpoint]) {
    initRateLimiter(endpoint)
  }

  const now = Date.now()
  const state = limiters[endpoint]

  // Remove requests outside the time window
  state.requests = state.requests.filter((req) => now - req.timestamp < fullConfig.interval)

  return state.requests.length >= fullConfig.maxRequests
}

/**
 * Process the queue for an endpoint
 */
async function processQueue(endpoint: string, config: Partial<RateLimitConfig> = {}): Promise<void> {
  const state = limiters[endpoint]

  if (state.processing || state.queue.length === 0) {
    return
  }

  state.processing = true

  while (state.queue.length > 0) {
    if (wouldExceedRateLimit(endpoint, config)) {
      // Wait for the rate limit to reset
      await new Promise((resolve) => setTimeout(resolve, DEFAULT_CONFIG.interval))
      continue
    }

    const request = state.queue.shift()
    if (request) {
      try {
        state.requests.push({ timestamp: Date.now() })
        await request()
      } catch (error) {
        console.error(`Error processing queued request for ${endpoint}:`, error)
      }
    }
  }

  state.processing = false
}

/**
 * Execute a function with rate limiting
 */
export async function withRateLimit<T>(
  endpoint: string,
  fn: () => Promise<T>,
  config: Partial<RateLimitConfig> = {},
): Promise<T> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }

  if (!limiters[endpoint]) {
    initRateLimiter(endpoint)
  }

  const state = limiters[endpoint]

  // If we would exceed the rate limit
  if (wouldExceedRateLimit(endpoint, config)) {
    if (fullConfig.queueEnabled) {
      // Queue the request
      return new Promise((resolve, reject) => {
        state.queue.push(async () => {
          try {
            const result = await fn()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })

        // Start processing the queue if not already processing
        processQueue(endpoint, config)
      })
    } else {
      // Throw an error if queueing is disabled
      throw new Error(`Rate limit exceeded for ${endpoint}`)
    }
  }

  // Add the current request to the list
  state.requests.push({ timestamp: Date.now() })

  // Execute the function
  return await fn()
}

