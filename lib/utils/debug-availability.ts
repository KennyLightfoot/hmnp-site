/**
 * Debug utility for availability requests
 * Helps identify which components are making requests and causing issues
 */

interface DebugInfo {
  component: string;
  timestamp: number;
  requestKey: string;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  error?: string;
}

class AvailabilityDebugger {
  private requests = new Map<string, DebugInfo>();
  private isEnabled = process.env.NODE_ENV === 'development';

  logRequest(component: string, requestKey: string) {
    if (!this.isEnabled) return;
    
    const info: DebugInfo = {
      component,
      timestamp: Date.now(),
      requestKey,
      status: 'pending'
    };
    
    this.requests.set(requestKey, info);
    console.log(`🔍 [${component}] Starting request: ${requestKey}`);
  }

  logSuccess(requestKey: string, duration: number) {
    if (!this.isEnabled) return;
    
    const info = this.requests.get(requestKey);
    if (info) {
      info.status = 'success';
      info.duration = duration;
      console.log(`✅ [${info.component}] Request completed: ${requestKey} (${duration}ms)`);
    }
  }

  logError(requestKey: string, error: string, duration: number) {
    if (!this.isEnabled) return;
    
    const info = this.requests.get(requestKey);
    if (info) {
      info.status = 'error';
      info.error = error;
      info.duration = duration;
      console.error(`❌ [${info.component}] Request failed: ${requestKey} (${duration}ms) - ${error}`);
    }
  }

  getStats() {
    const stats = {
      total: this.requests.size,
      pending: 0,
      success: 0,
      error: 0,
      byComponent: new Map<string, { total: number; success: number; error: number }>()
    };

    for (const [key, info] of this.requests.entries()) {
      stats[info.status]++;
      
      const componentStats = stats.byComponent.get(info.component) || { total: 0, success: 0, error: 0 };
      componentStats.total++;
      if (info.status === 'success') componentStats.success++;
      if (info.status === 'error') componentStats.error++;
      stats.byComponent.set(info.component, componentStats);
    }

    return stats;
  }

  clear() {
    this.requests.clear();
  }
}

export const availabilityDebugger = new AvailabilityDebugger();

/**
 * Debug wrapper for availability requests
 */
export function debugAvailabilityRequest<T>(
  component: string,
  requestKey: string,
  requestFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  availabilityDebugger.logRequest(component, requestKey);
  
  return requestFn()
    .then(result => {
      const duration = Date.now() - startTime;
      availabilityDebugger.logSuccess(requestKey, duration);
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      availabilityDebugger.logError(requestKey, error.message, duration);
      throw error;
    });
}

export default availabilityDebugger; 