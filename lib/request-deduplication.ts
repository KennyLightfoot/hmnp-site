/**
 * EMERGENCY: Request Deduplication System
 * 
 * Prevents identical requests from being made simultaneously,
 * which can cause request storms and exponential traffic growth.
 */

import { logger } from '@/lib/logger';

interface PendingRequest {
  promise: Promise<Response>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest>();
  private readonly CACHE_DURATION = 5000; // 5 seconds
  private readonly MAX_CONCURRENT = 3; // Max 3 identical requests

  /**
   * Generate a unique key for the request
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    const headers = options?.headers ? JSON.stringify(options.headers) : '';
    return `${method}:${url}:${body}:${headers}`;
  }

  /**
   * Clean up expired requests
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.CACHE_DURATION) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Check if we have too many concurrent requests
   */
  private checkConcurrentLimit(baseUrl: string): boolean {
    const concurrentCount = Array.from(this.pendingRequests.keys())
      .filter(key => key.includes(baseUrl))
      .length;
    
    return concurrentCount < this.MAX_CONCURRENT;
  }

  /**
   * Deduplicated fetch function
   */
  async fetch(url: string, options?: RequestInit): Promise<Response> {
    this.cleanup();

    const key = this.generateKey(url, options);
    const baseUrl = new URL(url).pathname;

    // Check concurrent request limit
    if (!this.checkConcurrentLimit(baseUrl)) {
      logger.warn(`Too many concurrent requests to ${baseUrl}, blocking request`, 'REQUEST_DEDUPLICATION');
      throw new Error(`Too many concurrent requests to ${baseUrl}`);
    }

    // If we already have this exact request pending, return the existing promise
    const existing = this.pendingRequests.get(key);
    if (existing) {
      logger.info(`Deduplicating request: ${url}`, 'REQUEST_DEDUPLICATION');
      return existing.promise.then(response => response.clone());
    }

    // Create new request
    logger.info(`Making new request: ${url}`, 'REQUEST_DEDUPLICATION');
    const promise = fetch(url, options);
    
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    // Clean up when request completes
    promise.finally(() => {
      // Add small delay before cleanup to allow cloning
      setTimeout(() => {
        this.pendingRequests.delete(key);
      }, 100);
    });

    return promise;
  }

  /**
   * Get stats about pending requests
   */
  getStats(): { pendingCount: number; keys: string[] } {
    return {
      pendingCount: this.pendingRequests.size,
      keys: Array.from(this.pendingRequests.keys())
    };
  }

  /**
   * Clear all pending requests (emergency reset)
   */
  clear(): void {
    logger.warn('Emergency clearing all pending requests', 'REQUEST_DEDUPLICATION');
    this.pendingRequests.clear();
  }
}

// Global instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Drop-in replacement for fetch with deduplication
 */
export async function deduplicatedFetch(url: string, options?: RequestInit): Promise<Response> {
  return requestDeduplicator.fetch(url, options);
}

/**
 * React hook for making deduplicated API calls
 */
export function useDedupFetch() {
  return {
    fetch: deduplicatedFetch,
    getStats: () => requestDeduplicator.getStats(),
    clear: () => requestDeduplicator.clear()
  };
}

// Global error handler for request storms
if (typeof window !== 'undefined') {
  // Monitor for request storms
  let requestCount = 0;
  const resetInterval = 60000; // 1 minute
  const maxRequestsPerMinute = 200;

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    requestCount++;
    
    if (requestCount > maxRequestsPerMinute) {
      logger.error('REQUEST STORM DETECTED - blocking excessive requests', 'REQUEST_DEDUPLICATION');
      return Promise.reject(new Error('Request storm detected - too many requests'));
    }
    
    return originalFetch.apply(this, args);
  };

  // Reset counter every minute
  setInterval(() => {
    if (requestCount > 100) {
      logger.warn(`High request volume: ${requestCount} requests in last minute`, 'REQUEST_DEDUPLICATION');
    }
    requestCount = 0;
  }, resetInterval);
}

export default requestDeduplicator;