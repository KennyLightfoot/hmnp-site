/**
 * Request Deduplicator - Prevents multiple simultaneous API requests
 * Solves ERR_INSUFFICIENT_RESOURCES by batching/deduplicating requests
 */

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

class RequestDeduplicator {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private readonly TTL = 30000; // 30 seconds
  private readonly MAX_CONCURRENT = 5; // Max 5 concurrent requests

  /**
   * Deduplicate requests by key with aggressive throttling
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Clean expired requests
    this.cleanup();

    // Check if request already pending
    const existing = this.pendingRequests.get(key);
    if (existing) {
      console.log(`🔄 Deduplicating request: ${key}`);
      return existing.promise;
    }

    // Throttle if too many concurrent requests
    if (this.pendingRequests.size >= this.MAX_CONCURRENT) {
      console.warn(`⚠️ Too many concurrent requests (${this.pendingRequests.size}), throttling: ${key}`);
      // Wait a bit before allowing new requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Create new request
    console.log(`🚀 New request: ${key} (${this.pendingRequests.size + 1} concurrent)`);
    const promise = requestFn().finally(() => {
      // Clean up when request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    return promise;
  }

  /**
   * Clean expired requests
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.TTL) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      pendingCount: this.pendingRequests.size,
      keys: Array.from(this.pendingRequests.keys())
    };
  }
}

// Global instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Helper for availability requests
 */
export async function fetchAvailabilityDeduped(
  serviceId: string,
  date: string,
  timezone = 'America/Chicago'
): Promise<any> {
  const key = `availability-${serviceId}-${date}-${timezone}`;
  
  return requestDeduplicator.dedupe(key, async () => {
    const params = new URLSearchParams({
      serviceId,
      date,
      timezone
    });
    
    const response = await fetch(`/api/availability?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
}

export default requestDeduplicator;