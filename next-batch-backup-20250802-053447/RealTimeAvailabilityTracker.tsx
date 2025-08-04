'use client';

/**
 * Real-Time Availability Tracker
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Features:
 * - Live availability updates
 * - Demand tracking in real-time
 * - Popular slot indicators
 * - Urgency notifications
 * - WebSocket integration for live updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  TrendingUp, 
  Users, 
  Zap, 
  Star, 
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvailabilityMetrics {
  totalSlots: number;
  availableSlots: number;
  bookedSlots: number;
  popularSlots: number;
  urgentSlots: number;
  recommendedSlots: number;
  demandBreakdown: {
    low: number;
    medium: number;
    high: number;
  };
  lastUpdated: string;
  nextUpdate: string;
}

interface RealTimeAvailabilityTrackerProps {
  serviceType: string;
  date: string;
  metrics?: AvailabilityMetrics;
  isConnected?: boolean;
  onRefresh?: () => void;
  className?: string;
  showDetails?: boolean;
}

export default function RealTimeAvailabilityTracker({
  serviceType,
  date,
  metrics,
  isConnected = false,
  onRefresh,
  className = '',
  showDetails = true
}: RealTimeAvailabilityTrackerProps) {
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Calculate utilization percentage
  const utilizationPercentage = metrics 
    ? Math.round((metrics.bookedSlots / metrics.totalSlots) * 100)
    : 0;

  // Get demand level based on utilization
  const getDemandLevel = () => {
    if (utilizationPercentage < 30) return 'low';
    if (utilizationPercentage < 70) return 'medium';
    return 'high';
  };

  const demandLevel = getDemandLevel();

  // Get demand color
  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date());
    onRefresh?.();
  }, [onRefresh]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, handleRefresh]);

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get connection status
  const getConnectionStatus = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        color: 'text-green-600',
        text: 'Live Updates Active'
      };
    }
    return {
      icon: WifiOff,
      color: 'text-gray-500',
      text: 'Manual Updates Only'
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <Card className={cn('border-l-4 border-l-blue-500', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Live Availability</CardTitle>
            <Badge 
              variant="outline" 
              className={cn('text-xs', getDemandColor(demandLevel))}
            >
              {demandLevel.toUpperCase()} DEMAND
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <connectionStatus.icon className={cn('h-4 w-4', connectionStatus.color)} />
            <span className="text-xs text-gray-600">{connectionStatus.text}</span>
            <button
              onClick={handleRefresh}
              className="p-1 hover:bg-gray-100 rounded"
              title="Refresh availability"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
        
        <CardDescription>
          Real-time availability for {serviceType} on {new Date(date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Utilization Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilization</span>
            <span className="font-medium">{utilizationPercentage}%</span>
          </div>
          <Progress 
            value={utilizationPercentage} 
            className={cn(
              'h-2',
              demandLevel === 'high' && 'bg-red-100',
              demandLevel === 'medium' && 'bg-orange-100',
              demandLevel === 'low' && 'bg-green-100'
            )}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{metrics?.availableSlots || 0} available</span>
            <span>{metrics?.bookedSlots || 0} booked</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">
              {metrics?.availableSlots || 0}
            </div>
            <div className="text-xs text-green-700">Available</div>
          </div>
          
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">
              {metrics?.popularSlots || 0}
            </div>
            <div className="text-xs text-blue-700">Popular</div>
          </div>
          
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">
              {metrics?.urgentSlots || 0}
            </div>
            <div className="text-xs text-orange-700">Urgent</div>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {metrics?.recommendedSlots || 0}
            </div>
            <div className="text-xs text-purple-700">Best</div>
          </div>
        </div>

        {/* Demand Breakdown */}
        {showDetails && metrics && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Demand Breakdown</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <div className="text-sm font-bold text-green-700">
                  {metrics.demandBreakdown.low}
                </div>
                <div className="text-xs text-green-600">Low</div>
              </div>
              
              <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                <div className="text-sm font-bold text-orange-700">
                  {metrics.demandBreakdown.medium}
                </div>
                <div className="text-xs text-orange-600">Medium</div>
              </div>
              
              <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                <div className="text-sm font-bold text-red-700">
                  {metrics.demandBreakdown.high}
                </div>
                <div className="text-xs text-red-600">High</div>
              </div>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {demandLevel === 'high' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              High demand detected! Book quickly to secure your preferred time.
            </AlertDescription>
          </Alert>
        )}

        {metrics?.urgentSlots && metrics.urgentSlots > 0 && (
          <Alert className="border-orange-200 bg-orange-50">
            <Zap className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {metrics.urgentSlots} urgent time slots available for immediate booking.
            </AlertDescription>
          </Alert>
        )}

        {metrics?.recommendedSlots && metrics.recommendedSlots > 0 && (
          <Alert className="border-green-200 bg-green-50">
            <Star className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {metrics.recommendedSlots} recommended time slots available - great availability and timing!
            </AlertDescription>
          </Alert>
        )}

        {/* Last Updated */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Last updated: {formatTime(lastRefresh.toISOString())}
          {isConnected && (
            <span className="ml-2">
              • Next update: {formatTime(new Date(Date.now() + 30000).toISOString())}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 