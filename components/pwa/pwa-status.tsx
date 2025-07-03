/**
 * PWA Status Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Shows PWA status, offline indicators, and install prompts
 */

'use client';

import { useState, useEffect } from 'react';
import { usePWA } from './pwa-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Bell, 
  Sync, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  X
} from 'lucide-react';

export function PWAStatus() {
  const { 
    isSupported, 
    isOnline, 
    isInstalled, 
    features,
    installPWA,
    requestNotificationPermission,
    syncOfflineData,
    offlineQueueStatus
  } = usePWA();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Show install prompt if PWA is supported but not installed
    if (isSupported && !isInstalled && features.installPrompt) {
      setShowInstallPrompt(true);
    }
  }, [isSupported, isInstalled, features.installPrompt]);

  useEffect(() => {
    // Show offline alert when going offline
    if (!isOnline) {
      setShowOfflineAlert(true);
    } else {
      setShowOfflineAlert(false);
    }
  }, [isOnline]);

  const handleInstallPWA = async () => {
    try {
      const result = await installPWA();
      if (result.success) {
        setShowInstallPrompt(false);
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        // Success handled by PWA manager
      }
    } catch (error) {
      console.error('Notification permission failed:', error);
    }
  };

  const handleSyncOfflineData = async () => {
    if (syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    try {
      const result = await syncOfflineData();
      if (result.success) {
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
      } else {
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 3000);
      }
    } catch (error) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center space-x-1">
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </Badge>
        
        {isInstalled && (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Smartphone className="h-3 w-3" />
            <span>PWA</span>
          </Badge>
        )}
      </div>

      {/* Offline Alert */}
      {showOfflineAlert && (
        <Alert className="bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            You're offline. Bookings will be saved locally and synced when you reconnect.
            {offlineQueueStatus.pendingSync > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm">
                  {offlineQueueStatus.pendingSync} booking(s) waiting to sync
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncOfflineData}
                  disabled={syncStatus === 'syncing'}
                  className="h-6 px-2 text-xs"
                >
                  {syncStatus === 'syncing' ? (
                    <>
                      <Sync className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </>
                  ) : syncStatus === 'success' ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Synced
                    </>
                  ) : (
                    <>
                      <Sync className="h-3 w-3 mr-1" />
                      Sync Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Install PWA Prompt */}
      {showInstallPrompt && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Install HMNP App
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  Get faster access with offline booking capability
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={handleInstallPWA}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInstallPrompt(false)}
                  >
                    Later
                  </Button>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInstallPrompt(false)}
                className="p-1 h-6 w-6 text-blue-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enable Notifications Prompt */}
      {features.pushNotifications && !isInstalled && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  Enable Notifications
                </h3>
                <p className="text-sm text-green-800 mb-3">
                  Get notified about booking updates and reminders
                </p>
                <Button
                  size="sm"
                  onClick={handleEnableNotifications}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Enable
                </Button>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {}} // This would hide the prompt
                className="p-1 h-6 w-6 text-green-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}