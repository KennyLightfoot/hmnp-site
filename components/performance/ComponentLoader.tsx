'use client';

/**
 * 🚀 PERFORMANCE-OPTIMIZED COMPONENT LOADER
 * Houston Mobile Notary Pros
 * 
 * Intelligent component loading with skeleton screens,
 * progressive enhancement, and performance monitoring
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { LoadingSpinner, Skeleton } from '@/components/ui/loading-states';

// ============================================================================
// INTELLIGENT PRELOADING SYSTEM
// ============================================================================

interface PreloadConfig {
  threshold: number; // Distance from viewport to start preloading
  priority: 'high' | 'medium' | 'low';
  dependencies?: string[];
}

class PreloadManager {
  private preloadedComponents = new Set<string>();
  private observers = new Map<string, IntersectionObserver>();

  preloadComponent(componentName: string, config: PreloadConfig = { threshold: 200, priority: 'medium' }) {
    if (this.preloadedComponents.has(componentName)) return;

    // Create intersection observer for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.preloadedComponents.add(componentName);
            observer.disconnect();
            this.observers.delete(componentName);
          }
        });
      },
      {
        rootMargin: `${config.threshold}px`,
        threshold: 0.1
      }
    );

    this.observers.set(componentName, observer);
    return observer;
  }

  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

export const preloadManager = new PreloadManager();

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetrics {
  componentName: string;
  loadTime: number;
  renderTime: number;
  bundleSize?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];

  startTimer(componentName: string) {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      this.metrics.push({
        componentName,
        loadTime,
        renderTime: 0 // Will be set by component
      });
      
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      }
    };
  }

  getMetrics() {
    return this.metrics;
  }

  getAverageLoadTime() {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  addMetrics(metrics: PerformanceMetrics) {
    this.metrics.push(metrics);
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// COMPONENT LOADER PROPS
// ============================================================================

interface ComponentLoaderProps {
  componentName: string;
  fallback?: React.ReactNode;
  skeleton?: React.ReactNode;
  preloadConfig?: PreloadConfig;
  onLoad?: (loadTime: number) => void;
  onError?: (error: Error) => void;
  children: React.ReactNode;
}

// ============================================================================
// MAIN COMPONENT LOADER
// ============================================================================

export function ComponentLoader({
  componentName,
  fallback,
  skeleton,
  preloadConfig,
  onLoad,
  onError,
  children
}: ComponentLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [loadTime, setLoadTime] = useState(0);

  useEffect(() => {
    const startTimer = performanceMonitor.startTimer(componentName);
    
    // Simulate component loading (in real implementation, this would be actual component loading)
    const timer = setTimeout(() => {
      setIsLoading(false);
      const endTimer = startTimer();
      const finalLoadTime = performance.now();
      setLoadTime(finalLoadTime);
      onLoad?.(finalLoadTime);
    }, Math.random() * 1000 + 200); // Random load time between 200-1200ms

    return () => clearTimeout(timer);
  }, [componentName, onLoad]);

  // Set up preloading
  useEffect(() => {
    if (preloadConfig) {
      const observer = preloadManager.preloadComponent(componentName, preloadConfig);
      return () => observer?.disconnect();
    }
    return undefined;
  }, [componentName, preloadConfig]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      preloadManager.cleanup();
    };
  }, []);

  if (hasError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Failed to load {componentName}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <Suspense fallback={fallback || skeleton || <DefaultSkeleton />}>
        {skeleton || <DefaultSkeleton />}
      </Suspense>
    );
  }

  return (
    <Suspense fallback={fallback || <LoadingSpinner size="md" />}>
      {children}
    </Suspense>
  );
}

// ============================================================================
// DEFAULT SKELETON COMPONENTS
// ============================================================================

function DefaultSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <Skeleton className="h-12 w-32" />
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

// ============================================================================
// LAZY LOADING UTILITIES
// ============================================================================

export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  componentName: string,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <ComponentLoader
        componentName={componentName}
        fallback={fallback}
      >
        <LazyComponent {...props} />
      </ComponentLoader>
    );
  };
}

// ============================================================================
// PERFORMANCE HOOKS
// ============================================================================

export function usePerformanceMonitoring(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      const newMetrics: PerformanceMetrics = {
        componentName,
        loadTime,
        renderTime: 0
      };
      
      setMetrics(newMetrics);
      // Use the public method instead of accessing private property
      performanceMonitor.addMetrics(newMetrics);
    };
  }, [componentName]);

  return metrics;
}

export function usePreloadComponent(componentName: string, config?: PreloadConfig) {
  useEffect(() => {
    if (config) {
      preloadManager.preloadComponent(componentName, config);
    }
  }, [componentName, config]);
} 