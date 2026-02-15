/**
 * Advanced Performance Monitoring and Analytics
 * 
 * Provides comprehensive performance tracking, user analytics,
 * and business metrics for optimization insights.
 */

import React from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface UserInteraction {
  event: string;
  element?: string;
  page: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
}

interface BusinessMetric {
  type: 'booking_started' | 'booking_completed' | 'service_viewed' | 'faq_viewed' | 'error_occurred';
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Performance Monitor Class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private interactions: UserInteraction[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private sessionId: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializePerformanceObservers();
    this.setupErrorTracking();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers
   */
  private initializePerformanceObservers(): void {
    if (typeof window === 'undefined') return;

    // Core Web Vitals
    this.observeWebVitals();
    
    // Navigation timing
    this.observeNavigationTiming();
    
    // Resource timing
    this.observeResourceTiming();
    
    // Layout shifts
    this.observeLayoutShifts();
    
    // Long tasks
    this.observeLongTasks();
  }

  /**
   * Observe Core Web Vitals
   */
  private observeWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          this.recordMetric({
            name: 'LCP',
            value: lastEntry.startTime,
            timestamp: Date.now(),
            metadata: { element: (lastEntry as any).element?.tagName }
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            timestamp: Date.now(),
            metadata: { eventType: entry.name }
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        this.recordMetric({
          name: 'CLS',
          value: clsScore,
          timestamp: Date.now()
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigationTiming(): void {
    if (typeof window === 'undefined' || !window.performance) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // Time to First Byte (TTFB)
          this.recordMetric({
            name: 'TTFB',
            value: navigation.responseStart - navigation.fetchStart,
            timestamp: Date.now()
          });

          // DOM Content Loaded
          this.recordMetric({
            name: 'DCL',
            value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            timestamp: Date.now()
          });

          // Load Complete
          this.recordMetric({
            name: 'Load',
            value: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: Date.now()
          });

          // DNS Lookup
          this.recordMetric({
            name: 'DNS',
            value: navigation.domainLookupEnd - navigation.domainLookupStart,
            timestamp: Date.now()
          });
        }
      }, 100);
    });
  }

  /**
   * Observe resource timing
   */
  private observeResourceTiming(): void {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Track slow resources
          if (entry.duration > 1000) { // Resources taking more than 1 second
            this.recordMetric({
              name: 'SlowResource',
              value: entry.duration,
              timestamp: Date.now(),
              metadata: {
                name: entry.name,
                type: (entry as any).initiatorType
              }
            });
          }
        });
      }).observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Observe layout shifts
   */
  private observeLayoutShifts(): void {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.value > 0.1) { // Significant layout shift
            this.recordMetric({
              name: 'LayoutShift',
              value: entry.value,
              timestamp: Date.now(),
              metadata: {
                hadRecentInput: entry.hadRecentInput,
                sources: entry.sources?.map((s: any) => s.node?.tagName).filter(Boolean)
              }
            });
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Observe long tasks
   */
  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric({
            name: 'LongTask',
            value: entry.duration,
            timestamp: Date.now(),
            metadata: {
              startTime: entry.startTime
            }
          });
        });
      }).observe({ entryTypes: ['longtask'] });
    }
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking(): void {
    if (typeof window === 'undefined') return;

    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.recordBusinessMetric({
        type: 'error_occurred',
        value: 1,
        timestamp: Date.now(),
        metadata: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });

    // Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.recordBusinessMetric({
        type: 'error_occurred',
        value: 1,
        timestamp: Date.now(),
        metadata: {
          type: 'unhandled_promise_rejection',
          reason: event.reason?.toString()
        }
      });
    });
  }

  /**
   * Record performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[PERF] ${metric.name}: ${metric.value.toFixed(2)}ms`, metric.metadata);
    }

    // Send to analytics service
    this.sendToAnalytics('performance', metric);
  }

  /**
   * Record user interaction
   */
  recordInteraction(interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>): void {
    if (!this.isEnabled) return;

    const fullInteraction: UserInteraction = {
      ...interaction,
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.interactions.push(fullInteraction);
    this.sendToAnalytics('interaction', fullInteraction);
  }

  /**
   * Record business metric
   */
  recordBusinessMetric(metric: BusinessMetric): void {
    if (!this.isEnabled) return;

    this.businessMetrics.push(metric);
    this.sendToAnalytics('business', metric);
  }

  /**
   * Track booking funnel
   */
  trackBookingFunnel(step: 'started' | 'service_selected' | 'time_selected' | 'info_entered' | 'completed', metadata?: any): void {
    this.recordBusinessMetric({
      type: 'booking_started',
      value: 1,
      timestamp: Date.now(),
      metadata: { step, ...metadata }
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, metadata?: any): void {
    this.recordInteraction({
      event: 'page_view',
      page,
      metadata
    });

    // Track page load performance
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.recordMetric({
          name: 'PageLoadTime',
          value: navigation.loadEventEnd - navigation.fetchStart,
          timestamp: Date.now(),
          metadata: { page }
        });
      }
    }
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, renderTime: number): void {
    this.recordMetric({
      name: 'ComponentRender',
      value: renderTime,
      timestamp: Date.now(),
      metadata: { componentName }
    });
  }

  /**
   * Track API call performance
   */
  trackAPICall(endpoint: string, duration: number, status: number, metadata?: any): void {
    this.recordMetric({
      name: 'APICall',
      value: duration,
      timestamp: Date.now(),
      metadata: {
        endpoint,
        status,
        success: status >= 200 && status < 300,
        ...metadata
      }
    });
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): any {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 5 * 60 * 1000); // Last 5 minutes

    const summary = {
      totalMetrics: recentMetrics.length,
      averageLoadTime: this.getAverageMetric(recentMetrics, 'PageLoadTime'),
      averageLCP: this.getAverageMetric(recentMetrics, 'LCP'),
      averageFID: this.getAverageMetric(recentMetrics, 'FID'),
      totalCLS: this.getTotalMetric(recentMetrics, 'CLS'),
      longTasks: recentMetrics.filter(m => m.name === 'LongTask').length,
      errors: this.businessMetrics.filter(m => m.type === 'error_occurred' && now - m.timestamp < 5 * 60 * 1000).length
    };

    return summary;
  }

  /**
   * Send data to analytics service
   */
  private sendToAnalytics(type: string, data: any): void {
    // Send to Google Analytics 4 if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', type, data);
    }

    // Send to custom analytics endpoint
    if (typeof window !== 'undefined') {
      // Batch and send periodically to avoid too many requests
      this.batchAndSendAnalytics(type, data);
    }
  }

  /**
   * Batch analytics data and send periodically
   */
  private batchAndSendAnalytics(type: string, data: any): void {
    // Implementation would batch data and send every few seconds
    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ANALYTICS] ${type}:`, data);
    }
  }

  /**
   * Helper methods
   */
  private getAverageMetric(metrics: PerformanceMetric[], name: string): number {
    const filtered = metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    return filtered.reduce((sum, m) => sum + m.value, 0) / filtered.length;
  }

  private getTotalMetric(metrics: PerformanceMetric[], name: string): number {
    return metrics.filter(m => m.name === name).reduce((sum, m) => sum + m.value, 0);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Clear collected data
   */
  clearData(): void {
    this.metrics = [];
    this.interactions = [];
    this.businessMetrics = [];
  }
}

/**
 * React Hook for performance monitoring
 */
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();

  const trackRender = (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      monitor.trackComponentRender(componentName, endTime - startTime);
    };
  };

  const trackInteraction = (event: string, element?: string, metadata?: any) => {
    monitor.recordInteraction({
      event,
      element,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      metadata
    });
  };

  const trackBookingStep = (step: string, metadata?: any) => {
    monitor.trackBookingFunnel(step as any, metadata);
  };

  const trackAPICall = (endpoint: string, duration: number, status: number) => {
    monitor.trackAPICall(endpoint, duration, status);
  };

  return {
    trackRender,
    trackInteraction,
    trackBookingStep,
    trackAPICall,
    getPerformanceSummary: () => monitor.getPerformanceSummary(),
  };
}

/**
 * Higher-order component for automatic performance tracking
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name;
  
  const TrackedComponent = (props: P) => {
    const { trackRender } = usePerformanceMonitor();
    
    React.useEffect(() => {
      const cleanup = trackRender(displayName);
      return cleanup;
    }, []);

    return React.createElement(WrappedComponent, props);
  };

  TrackedComponent.displayName = `withPerformanceTracking(${displayName})`;
  
  return TrackedComponent;
}

// Global performance monitor instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  performanceMonitor.trackPageView(window.location.pathname);
}

export default performanceMonitor;