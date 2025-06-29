"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye
} from 'lucide-react';
import { performanceMonitor, usePerformanceMonitor } from '@/lib/analytics/performance-monitor';

interface PerformanceData {
  totalMetrics: number;
  averageLoadTime: number;
  averageLCP: number;
  averageFID: number;
  totalCLS: number;
  longTasks: number;
  errors: number;
}

/**
 * Performance Dashboard Component
 * 
 * Displays real-time performance metrics and analytics
 * for monitoring application health and user experience.
 */
export function PerformanceDashboard() {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { getPerformanceSummary } = usePerformanceMonitor();

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = typeof window !== 'undefined' && 
                   window.location.pathname.includes('/admin');
    
    setIsVisible(isDev || isAdmin);

    if (isDev || isAdmin) {
      // Update performance data every 5 seconds
      const interval = setInterval(() => {
        const summary = getPerformanceSummary();
        setPerformanceData(summary);
      }, 5000);

      // Initial load
      const summary = getPerformanceSummary();
      setPerformanceData(summary);

      return () => clearInterval(interval);
    }
  }, [getPerformanceSummary]);

  if (!isVisible || !performanceData) {
    return null;
  }

  // Helper functions for thresholds and scoring
  const getScoreColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (value <= thresholds.poor) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getProgressValue = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Real-time performance metrics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Core Web Vitals */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Core Web Vitals
            </h4>

            {/* Largest Contentful Paint */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(performanceData.averageLCP, { good: 2500, poor: 4000 })}
                <span className="text-sm">LCP</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getScoreColor(performanceData.averageLCP, { good: 2500, poor: 4000 })}`}>
                  {performanceData.averageLCP.toFixed(0)}ms
                </div>
                <Progress 
                  value={getProgressValue(performanceData.averageLCP, 4000)} 
                  className="w-16 h-1 mt-1"
                />
              </div>
            </div>

            {/* First Input Delay */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(performanceData.averageFID, { good: 100, poor: 300 })}
                <span className="text-sm">FID</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getScoreColor(performanceData.averageFID, { good: 100, poor: 300 })}`}>
                  {performanceData.averageFID.toFixed(0)}ms
                </div>
                <Progress 
                  value={getProgressValue(performanceData.averageFID, 300)} 
                  className="w-16 h-1 mt-1"
                />
              </div>
            </div>

            {/* Cumulative Layout Shift */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getScoreIcon(performanceData.totalCLS, { good: 0.1, poor: 0.25 })}
                <span className="text-sm">CLS</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getScoreColor(performanceData.totalCLS, { good: 0.1, poor: 0.25 })}`}>
                  {performanceData.totalCLS.toFixed(3)}
                </div>
                <Progress 
                  value={getProgressValue(performanceData.totalCLS, 0.25)} 
                  className="w-16 h-1 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3 border-t pt-3">
            <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Performance
            </h4>

            {/* Page Load Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Load Time</span>
              </div>
              <div className="text-sm font-medium">
                {performanceData.averageLoadTime.toFixed(0)}ms
              </div>
            </div>

            {/* Long Tasks */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm">Long Tasks</span>
              </div>
              <div className="text-sm font-medium">
                {performanceData.longTasks}
              </div>
            </div>

            {/* Errors */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Errors</span>
              </div>
              <div className="text-sm font-medium">
                {performanceData.errors}
              </div>
            </div>
          </div>

          {/* Overall Health */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Health</span>
              <OverallHealthBadge data={performanceData} />
            </div>
          </div>

          {/* Alerts */}
          {(performanceData.errors > 0 || performanceData.longTasks > 5) && (
            <Alert className="mt-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {performanceData.errors > 0 && `${performanceData.errors} errors detected. `}
                {performanceData.longTasks > 5 && `${performanceData.longTasks} long tasks may affect performance.`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Overall Health Badge Component
 */
function OverallHealthBadge({ data }: { data: PerformanceData }) {
  // Calculate overall health score
  const lcpScore = data.averageLCP <= 2500 ? 100 : data.averageLCP <= 4000 ? 50 : 0;
  const fidScore = data.averageFID <= 100 ? 100 : data.averageFID <= 300 ? 50 : 0;
  const clsScore = data.totalCLS <= 0.1 ? 100 : data.totalCLS <= 0.25 ? 50 : 0;
  const errorScore = data.errors === 0 ? 100 : data.errors <= 2 ? 50 : 0;
  
  const overallScore = (lcpScore + fidScore + clsScore + errorScore) / 4;

  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500', icon: CheckCircle };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-500', icon: TrendingUp };
    if (score >= 40) return { label: 'Fair', color: 'bg-yellow-500', icon: TrendingDown };
    return { label: 'Poor', color: 'bg-red-500', icon: AlertTriangle };
  };

  const health = getHealthStatus(overallScore);
  const HealthIcon = health.icon;

  return (
    <Badge className={`${health.color} text-white text-xs`}>
      <HealthIcon className="h-3 w-3 mr-1" />
      {health.label}
    </Badge>
  );
}

/**
 * Lightweight Performance Indicator (always visible)
 */
export function PerformanceIndicator() {
  const [health, setHealth] = useState<'good' | 'fair' | 'poor'>('good');
  const { getPerformanceSummary } = usePerformanceMonitor();

  useEffect(() => {
    const interval = setInterval(() => {
      const summary = getPerformanceSummary();
      
      // Simple health calculation
      const hasErrors = summary.errors > 0;
      const hasSlowLoad = summary.averageLoadTime > 3000;
      const hasLongTasks = summary.longTasks > 3;
      
      if (hasErrors || (hasSlowLoad && hasLongTasks)) {
        setHealth('poor');
      } else if (hasSlowLoad || hasLongTasks) {
        setHealth('fair');
      } else {
        setHealth('good');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [getPerformanceSummary]);

  const healthConfig = {
    good: { color: 'bg-green-500', label: 'Performance: Good' },
    fair: { color: 'bg-yellow-500', label: 'Performance: Fair' },
    poor: { color: 'bg-red-500', label: 'Performance: Poor' }
  };

  const config = healthConfig[health];

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className={`w-3 h-3 rounded-full ${config.color} opacity-75`} title={config.label} />
    </div>
  );
}

export default PerformanceDashboard;