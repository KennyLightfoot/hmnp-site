'use client';

/**
 * 🚀 PERFORMANCE MONITORING DASHBOARD
 * Houston Mobile Notary Pros
 * 
 * Real-time performance metrics, bundle analysis, and optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Zap, 
  Clock, 
  Database, 
  Network, 
  HardDrive,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';

// ============================================================================
// PERFORMANCE METRICS INTERFACES
// ============================================================================

interface PerformanceMetrics {
  timestamp: number;
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  bundleSize: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface BundleAnalysis {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  largestChunks: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  optimizationOpportunities: string[];
}

interface PerformanceRecommendations {
  critical: string[];
  important: string[];
  niceToHave: string[];
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries[entries.length - 1];
        setMetrics(prev => prev ? { ...prev, firstContentfulPaint: fcp.startTime } : null);
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcp = entries[entries.length - 1];
        setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lcp.startTime } : null);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cls = 0;
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += (entry as any).value;
          }
        }
        setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: cls } : null);
      }).observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => prev ? { ...prev, firstInputDelay: entry.processingStart - entry.startTime } : null);
          break;
        }
      }).observe({ entryTypes: ['first-input'] });
    }

    // Monitor page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      setMetrics(prev => prev ? { ...prev, pageLoadTime: loadTime } : null);
    });
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  return { metrics, isMonitoring, startMonitoring, stopMonitoring };
}

// ============================================================================
// BUNDLE ANALYSIS UTILITIES
// ============================================================================

function analyzeBundleSize(): BundleAnalysis {
  // This would typically come from webpack-bundle-analyzer or similar
  const mockAnalysis: BundleAnalysis = {
    totalSize: 2.3 * 1024 * 1024, // 2.3MB
    jsSize: 1.8 * 1024 * 1024, // 1.8MB
    cssSize: 200 * 1024, // 200KB
    imageSize: 300 * 1024, // 300KB
    largestChunks: [
      { name: 'vendors-c33dac99885f313b.js', size: 2.25 * 1024 * 1024, percentage: 85 },
      { name: 'common-72f872475e98b0e2.js', size: 55.3 * 1024, percentage: 2 },
      { name: 'other shared chunks', size: 2.11 * 1024, percentage: 0.1 }
    ],
    optimizationOpportunities: [
      'Split vendor bundle into smaller chunks',
      'Implement code splitting for routes',
      'Optimize image loading with next/image',
      'Remove unused dependencies'
    ]
  };

  return mockAnalysis;
}

// ============================================================================
// PERFORMANCE RECOMMENDATIONS
// ============================================================================

function generateRecommendations(metrics: PerformanceMetrics | null, bundleAnalysis: BundleAnalysis): PerformanceRecommendations {
  const recommendations: PerformanceRecommendations = {
    critical: [],
    important: [],
    niceToHave: []
  };

  if (!metrics) return recommendations;

  // Critical issues
  if (metrics.pageLoadTime > 3000) {
    recommendations.critical.push('Page load time exceeds 3 seconds - implement code splitting');
  }

  if (metrics.largestContentfulPaint > 2500) {
    recommendations.critical.push('LCP is too slow - optimize critical rendering path');
  }

  if (metrics.cumulativeLayoutShift > 0.1) {
    recommendations.critical.push('CLS is too high - fix layout shifts');
  }

  if (bundleAnalysis.totalSize > 2 * 1024 * 1024) {
    recommendations.critical.push('Bundle size exceeds 2MB - implement aggressive code splitting');
  }

  // Important optimizations
  if (metrics.firstContentfulPaint > 1800) {
    recommendations.important.push('FCP can be improved - optimize server-side rendering');
  }

  if (metrics.firstInputDelay > 100) {
    recommendations.important.push('FID is high - reduce JavaScript execution time');
  }

  if (bundleAnalysis.jsSize > 1.5 * 1024 * 1024) {
    recommendations.important.push('JavaScript bundle is large - implement tree shaking');
  }

  // Nice to have
  recommendations.niceToHave.push('Implement service worker for caching');
  recommendations.niceToHave.push('Add preload hints for critical resources');
  recommendations.niceToHave.push('Optimize font loading with font-display: swap');

  return recommendations;
}

// ============================================================================
// MAIN PERFORMANCE DASHBOARD COMPONENT
// ============================================================================

export default function PerformanceDashboard() {
  const { metrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformanceMonitoring();
  const [bundleAnalysis] = useState(analyzeBundleSize());
  const [recommendations] = useState(generateRecommendations(metrics, bundleAnalysis));

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, []);

  const getPerformanceScore = () => {
    if (!metrics) return 0;
    
    let score = 100;
    
    // Deduct points for poor performance
    if (metrics.pageLoadTime > 3000) score -= 20;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 15;
    if (metrics.firstInputDelay > 100) score -= 10;
    if (bundleAnalysis.totalSize > 2 * 1024 * 1024) score -= 15;
    
    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();
  const scoreColor = performanceScore >= 90 ? 'text-green-600' : 
                    performanceScore >= 70 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time performance monitoring and optimization insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={isMonitoring ? 'default' : 'secondary'}>
            {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
          </Badge>
          <Button onClick={isMonitoring ? stopMonitoring : startMonitoring} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop' : 'Start'} Monitoring
          </Button>
        </div>
      </div>

      {/* Performance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Overall Performance Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className={`text-4xl font-bold ${scoreColor}`}>
              {performanceScore}/100
            </div>
            <div className="flex-1">
              <Progress value={performanceScore} className="h-3" />
              <p className="text-sm text-gray-600 mt-2">
                {performanceScore >= 90 ? 'Excellent performance' :
                 performanceScore >= 70 ? 'Good performance with room for improvement' :
                 'Performance needs immediate attention'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Page Load Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.pageLoadTime ? `${(metrics.pageLoadTime / 1000).toFixed(2)}s` : '--'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.pageLoadTime && metrics.pageLoadTime > 3000 ? 
                <span className="text-red-600">Too slow</span> : 
                <span className="text-green-600">Good</span>
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Largest Contentful Paint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.largestContentfulPaint ? `${(metrics.largestContentfulPaint / 1000).toFixed(2)}s` : '--'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.largestContentfulPaint && metrics.largestContentfulPaint > 2500 ? 
                <span className="text-red-600">Needs improvement</span> : 
                <span className="text-green-600">Good</span>
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cumulative Layout Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.cumulativeLayoutShift ? metrics.cumulativeLayoutShift.toFixed(3) : '--'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.cumulativeLayoutShift && metrics.cumulativeLayoutShift > 0.1 ? 
                <span className="text-red-600">Too high</span> : 
                <span className="text-green-600">Good</span>
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">First Input Delay</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.firstInputDelay ? `${metrics.firstInputDelay.toFixed(0)}ms` : '--'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {metrics?.firstInputDelay && metrics.firstInputDelay > 100 ? 
                <span className="text-red-600">Too slow</span> : 
                <span className="text-green-600">Good</span>
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bundle Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Bundle Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Bundle Size</span>
              <span className="text-sm font-bold">{(bundleAnalysis.totalSize / 1024 / 1024).toFixed(1)}MB</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">JavaScript</span>
                <span className="text-sm">{(bundleAnalysis.jsSize / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CSS</span>
                <span className="text-sm">{(bundleAnalysis.cssSize / 1024).toFixed(0)}KB</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Images</span>
                <span className="text-sm">{(bundleAnalysis.imageSize / 1024).toFixed(0)}KB</span>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Largest Chunks</h4>
              <div className="space-y-1">
                {bundleAnalysis.largestChunks.map((chunk, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span className="truncate flex-1">{chunk.name}</span>
                    <span className="ml-2">{(chunk.size / 1024 / 1024).toFixed(1)}MB ({chunk.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.critical.length > 0 && (
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Critical Issues</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {recommendations.critical.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-red-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {recommendations.important.length > 0 && (
          <Card className="border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <TrendingUp className="h-5 w-5" />
                <span>Important</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {recommendations.important.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-yellow-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {recommendations.niceToHave.length > 0 && (
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span>Nice to Have</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {recommendations.niceToHave.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 