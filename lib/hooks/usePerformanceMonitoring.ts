import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

interface PerformanceMonitoringOptions {
  trackRender?: boolean;
  trackUserInteractions?: boolean;
  trackNetworkRequests?: boolean;
  sampleRate?: number;
}

export function usePerformanceMonitoring(
  componentName: string,
  options: PerformanceMonitoringOptions = {}
) {
  const {
    trackRender = true,
    trackUserInteractions = true,
    trackNetworkRequests = false,
    sampleRate = 1.0
  } = options;

  const renderStartTime = useRef<number>(0);
  const interactionStartTimes = useRef<Map<string, number>>(new Map());
  const metricsBuffer = useRef<PerformanceMetric[]>([]);

  // Utility to check if we should sample this measurement
  const shouldSample = useCallback(() => {
    return Math.random() < sampleRate;
  }, [sampleRate]);

  // Send metrics to analytics service
  const sendMetrics = useCallback(async (metrics: PerformanceMetric[]) => {
    if (metrics.length === 0) return;

    try {
      // Send to analytics service (Google Analytics, custom endpoint, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        metrics.forEach(metric => {
          (window as any).gtag('event', 'performance_metric', {
            custom_parameter_1: componentName,
            custom_parameter_2: metric.name,
            value: metric.value,
            ...metric.context
          });
        });
      }

      // Send to custom analytics endpoint
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          component: componentName,
          metrics: metrics
        })
      }).catch(error => {
        logger.warn('Failed to send performance metrics', 'PERFORMANCE_MONITORING', { error: error instanceof Error ? error.message : String(error) });
      });

    } catch (error) {
      logger.warn('Failed to track performance metrics', 'PERFORMANCE_MONITORING', { error: error instanceof Error ? error.message : String(error) });
    }
  }, [componentName]);

  // Flush metrics buffer
  const flushMetrics = useCallback(() => {
    if (metricsBuffer.current.length > 0) {
      sendMetrics([...metricsBuffer.current]);
      metricsBuffer.current = [];
    }
  }, [sendMetrics]);

  // Record a performance metric
  const recordMetric = useCallback((name: string, value: number, context?: Record<string, any>) => {
    if (!shouldSample()) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    metricsBuffer.current.push(metric);

    // Flush if buffer is full
    if (metricsBuffer.current.length >= 10) {
      flushMetrics();
    }
  }, [shouldSample, flushMetrics]);

  // Track render performance
  useEffect(() => {
    if (!trackRender) return;

    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      recordMetric('render_time', renderTime, {
        component: componentName,
        type: 'render'
      });
    };
  });

  // Track component mount/unmount
  useEffect(() => {
    const mountTime = performance.now();
    recordMetric('component_mount', mountTime, {
      component: componentName,
      type: 'lifecycle'
    });

    return () => {
      const unmountTime = performance.now();
      recordMetric('component_unmount', unmountTime, {
        component: componentName,
        type: 'lifecycle'
      });
      
      // Flush remaining metrics on unmount
      flushMetrics();
    };
  }, [componentName, recordMetric, flushMetrics]);

  // Track Web Vitals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        recordMetric('lcp', entry.startTime, {
          component: componentName,
          type: 'web_vital'
        });
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        recordMetric('fid', entry.processingStart - entry.startTime, {
          component: componentName,
          type: 'web_vital'
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          recordMetric('cls', entry.value, {
            component: componentName,
            type: 'web_vital'
          });
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });

  }, [componentName, recordMetric]);

  // Manual interaction tracking
  const trackInteraction = useCallback((interactionName: string, data?: Record<string, any>) => {
    if (!trackUserInteractions) return;

    const startTime = performance.now();
    interactionStartTimes.current.set(interactionName, startTime);

    return {
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        recordMetric('user_interaction', duration, {
          component: componentName,
          interaction: interactionName,
          type: 'interaction',
          ...data
        });
        interactionStartTimes.current.delete(interactionName);
      }
    };
  }, [trackUserInteractions, componentName, recordMetric]);

  // Network request tracking
  const trackNetworkRequest = useCallback((url: string, method: string = 'GET') => {
    if (!trackNetworkRequests) return;

    const startTime = performance.now();

    return {
      success: (responseSize?: number) => {
        const duration = performance.now() - startTime;
        recordMetric('network_request', duration, {
          component: componentName,
          url,
          method,
          status: 'success',
          responseSize,
          type: 'network'
        });
      },
      error: (error: string) => {
        const duration = performance.now() - startTime;
        recordMetric('network_request', duration, {
          component: componentName,
          url,
          method,
          status: 'error',
          error,
          type: 'network'
        });
      }
    };
  }, [trackNetworkRequests, componentName, recordMetric]);

  // Mark significant events
  const markEvent = useCallback((eventName: string, data?: Record<string, any>) => {
    const timestamp = performance.now();
    recordMetric('event', timestamp, {
      component: componentName,
      event: eventName,
      type: 'event',
      ...data
    });

    // Also create a performance mark for DevTools
    if (typeof window !== 'undefined' && window.performance?.mark) {
      window.performance.mark(`${componentName}_${eventName}`);
    }
  }, [componentName, recordMetric]);

  // Flush metrics on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [flushMetrics]);

  return {
    trackInteraction,
    trackNetworkRequest,
    markEvent,
    recordMetric,
    flushMetrics
  };
}

// Utility hook for measuring async operations
export function useAsyncPerformance(operationName: string) {
  const measureAsync = useCallback(async <T>(
    asyncOperation: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await asyncOperation();
      const duration = performance.now() - startTime;
      
      // Track successful operation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'async_operation', {
          operation_name: operationName,
          duration: Math.round(duration),
          status: 'success',
          ...context
        });
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track failed operation
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'async_operation', {
          operation_name: operationName,
          duration: Math.round(duration),
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          ...context
        });
      }
      
      throw error;
    }
  }, [operationName]);

  return { measureAsync };
}