/**
 * 🚀 Performance Monitoring for Next.js 15
 * Houston Mobile Notary Pros
 * 
 * Modern performance tracking with Core Web Vitals,
 * custom metrics, and real-time monitoring
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

interface CoreWebVitals {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Initialize Core Web Vitals tracking
    this.setupCoreWebVitals();
    
    // Setup performance observers
    this.setupPerformanceObservers();
    
    // Track page load metrics
    this.trackPageLoadMetrics();
  }

  private setupCoreWebVitals() {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue, 'score');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers.push(lcpObserver, fidObserver, clsObserver);
    }
  }

  private setupPerformanceObservers() {
    // Navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'navigation') {
            this.recordMetric('TTFB', entry.responseStart - entry.requestStart, 'ms');
            this.recordMetric('DOMContentLoaded', entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart, 'ms');
            this.recordMetric('LoadComplete', entry.loadEventEnd - entry.loadEventStart, 'ms');
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);
    }
  }

  private trackPageLoadMetrics() {
    if (typeof window !== 'undefined') {
      // FCP (First Contentful Paint)
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          this.recordMetric('FCP', firstEntry.startTime, 'ms');
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      }

      // Track when page becomes interactive
      window.addEventListener('load', () => {
        setTimeout(() => {
          this.recordMetric('TimeToInteractive', performance.now(), 'ms');
        }, 0);
      });
    }
  }

  private recordMetric(name: string, value: number, unit: string) {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    };

    this.metrics.push(metric);
    this.sendMetric(metric);
  }

  private async sendMetric(metric: PerformanceMetric) {
    try {
      // Send to analytics service
      if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metric),
        });
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('📊 Performance Metric:', metric);
      }
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // Public API
  public startTimer(name: string) {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(`${name}_Duration`, duration, 'ms');
      return duration;
    };
  }

  public recordCustomMetric(name: string, value: number, unit: string = 'ms') {
    this.recordMetric(name, value, unit);
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getCoreWebVitals(): Partial<CoreWebVitals> {
    const vitals: Partial<CoreWebVitals> = {};
    
    this.metrics.forEach(metric => {
      if (metric.name in vitals) {
        (vitals as any)[metric.name] = metric.value;
      }
    });

    return vitals;
  }

  public disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components
export function usePerformanceMonitoring() {
  const startTimer = (name: string) => performanceMonitor.startTimer(name);
  const recordMetric = (name: string, value: number, unit?: string) => 
    performanceMonitor.recordCustomMetric(name, value, unit);

  return { startTimer, recordMetric };
}

// Utility for measuring component render times
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const WrappedComponent = (props: P) => {
    const { startTimer } = usePerformanceMonitoring();
    
    React.useEffect(() => {
      const endTimer = startTimer(`${componentName}_Mount`);
      return () => endTimer();
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceTracking(${componentName})`;
  return WrappedComponent;
}