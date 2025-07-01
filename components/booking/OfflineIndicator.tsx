"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi, CloudOff, Cloud, Sync } from 'lucide-react';

interface OfflineIndicatorProps {
  showAlert?: boolean;
  position?: 'top' | 'bottom';
}

export function OfflineIndicator({ showAlert = true, position = 'top' }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online && !showOfflineMessage) {
        setShowOfflineMessage(true);
      }
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineMessage]);

  if (!showAlert) {
    return (
      <Badge 
        variant={isOnline ? "default" : "secondary"} 
        className={`flex items-center gap-1 ${isOnline ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>
    );
  }

  if (!isOnline) {
    return (
      <div className={`fixed left-0 right-0 z-50 px-4 ${position === 'top' ? 'top-4' : 'bottom-4'}`}>
        <Alert className="max-w-md mx-auto bg-orange-50 border-orange-200">
          <CloudOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>You're offline.</strong> Your booking will be saved and submitted when you reconnect.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
}

interface SyncStatusBadgeProps {
  status: 'syncing' | 'synced' | 'failed' | 'pending';
  count?: number;
}

export function SyncStatusBadge({ status, count }: SyncStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'syncing':
        return {
          icon: <Sync className="h-3 w-3 animate-spin" />,
          text: 'Syncing...',
          className: 'bg-blue-100 text-blue-800'
        };
      case 'synced':
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: count ? `${count} synced` : 'Synced',
          className: 'bg-green-100 text-green-800'
        };
      case 'failed':
        return {
          icon: <CloudOff className="h-3 w-3" />,
          text: 'Sync failed',
          className: 'bg-red-100 text-red-800'
        };
      case 'pending':
        return {
          icon: <CloudOff className="h-3 w-3" />,
          text: count ? `${count} pending` : 'Pending sync',
          className: 'bg-orange-100 text-orange-800'
        };
      default:
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: 'Unknown',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge className={`flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.text}
    </Badge>
  );
}

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      
      // Check connection type if available
      const connection = (navigator as any).connection;
      if (connection) {
        setConnectionType(connection.effectiveType || connection.type || 'unknown');
      }
    };

    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600" />
          <span>Online</span>
          {connectionType !== 'unknown' && (
            <span className="text-xs text-gray-500">({connectionType})</span>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-orange-600" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}