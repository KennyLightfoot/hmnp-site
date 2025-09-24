/**
 * Real-time Slot Availability Indicator
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Shows live slot availability with viewer counts and conflict warnings
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getClientWebSocketManager } from '@/lib/realtime/client-websocket';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

interface SlotAvailabilityIndicatorProps {
  datetime: string;
  serviceType: string;
  isSelected?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
  className?: string;
}

export function SlotAvailabilityIndicator({
  datetime,
  serviceType,
  isSelected = false,
  onAvailabilityChange,
  className = ''
}: SlotAvailabilityIndicatorProps) {
  const [available, setAvailable] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [hasConflict, setHasConflict] = useState(false);
  const [wsManager] = useState(() => getClientWebSocketManager());

  useEffect(() => {
    // Set up WebSocket event handlers
    wsManager.setEventHandlers({
      onConnected: () => {
        setIsConnected(true);
      },
      onDisconnected: () => {
        setIsConnected(false);
      },
      onSlotAvailable: (update) => {
        if (update.datetime === datetime && update.serviceType === serviceType) {
          setAvailable(true);
          setViewerCount(update.viewerCount);
          setHasConflict(false);
          onAvailabilityChange?.(true);
        }
      },
      onSlotUnavailable: (update) => {
        if (update.datetime === datetime && update.serviceType === serviceType) {
          setAvailable(false);
          setViewerCount(update.viewerCount);
          onAvailabilityChange?.(false);
        }
      },
      onSlotViewingCount: (update) => {
        if (update.datetime === datetime && update.serviceType === serviceType) {
          setViewerCount(update.viewerCount);
        }
      },
      onReservationConflict: (data) => {
        if (data.datetime === datetime && data.serviceType === serviceType) {
          setHasConflict(true);
          setTimeout(() => setHasConflict(false), 5000); // Clear conflict after 5 seconds
        }
      },
      onError: (error) => {
        console.error('WebSocket error:', error);
      }
    });

    // Connect to WebSocket
    wsManager.connect();
    wsManager.subscribeToSlotUpdates();

    // Start viewing this slot if selected
    if (isSelected) {
      wsManager.startViewingSlot(datetime, serviceType);
    }

    // Cleanup on unmount
    return () => {
      if (isSelected) {
        wsManager.stopViewingSlot(datetime, serviceType);
      }
    };
  }, [datetime, serviceType, isSelected, wsManager, onAvailabilityChange]);

  // Update viewing status when selection changes
  useEffect(() => {
    if (isSelected) {
      wsManager.startViewingSlot(datetime, serviceType);
    } else {
      wsManager.stopViewingSlot(datetime, serviceType);
    }
  }, [isSelected, datetime, serviceType, wsManager]);

  const getStatusColor = () => {
    if (hasConflict) return 'destructive';
    if (!available) return 'secondary';
    if (viewerCount > 3) return 'default';
    return 'default';
  };

  const getStatusText = () => {
    if (hasConflict) return 'Conflict!';
    if (!available) return 'Unavailable';
    if (viewerCount > 3) return 'High Demand';
    return 'Available';
  };

  const getStatusIcon = () => {
    if (hasConflict) return <AlertTriangle className="h-3 w-3" />;
    if (!available) return <Clock className="h-3 w-3" />;
    if (viewerCount > 0) return <Users className="h-3 w-3" />;
    return null;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        {isConnected ? (
          <Wifi className="h-3 w-3 text-green-500" />
        ) : (
          <WifiOff className="h-3 w-3 text-red-500" />
        )}
      </div>

      {/* Availability Status */}
      <Badge variant={getStatusColor()} className="flex items-center gap-1">
        {getStatusIcon()}
        <span className="text-xs">{getStatusText()}</span>
      </Badge>

      {/* Viewer Count */}
      {viewerCount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="h-3 w-3" />
          <span className="text-xs">{viewerCount}</span>
        </Badge>
      )}

      {/* Conflict Warning */}
      {hasConflict && (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span className="text-xs">Someone else is booking this slot!</span>
        </Badge>
      )}
    </div>
  );
}

export default SlotAvailabilityIndicator;