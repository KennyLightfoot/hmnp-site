/**
 * PWA Provider Component
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Provides PWA functionality throughout the application
 */

'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { pwaManager, PWAFeatures, OfflineBookingData } from '@/lib/pwa/pwa-manager';

interface PWAContextType {
  isSupported: boolean;
  isOnline: boolean;
  isInstalled: boolean;
  features: PWAFeatures;
  installPWA: () => Promise<{ success: boolean; outcome?: string }>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  storeOfflineBooking: (data: Omit<OfflineBookingData, 'id' | 'status' | 'createdAt'>) => Promise<string>;
  getOfflineBookings: () => Promise<OfflineBookingData[]>;
  syncOfflineData: () => Promise<{ success: boolean; synced: number; failed: number }>;
  shareContent: (data: { title: string; text: string; url?: string }) => Promise<boolean>;
  getUserLocation: () => Promise<{ latitude: number; longitude: number; accuracy: number }>;
  offlineQueueStatus: { count: number; pendingSync: number };
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [isSupported, setIsSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [features, setFeatures] = useState<PWAFeatures>({
    installPrompt: false,
    pushNotifications: false,
    backgroundSync: false,
    offlineCapability: false,
    webShare: false,
    cameraAccess: false,
    locationAccess: false,
    fullscreen: false
  });
  const [offlineQueueStatus, setOfflineQueueStatus] = useState({ count: 0, pendingSync: 0 });

  useEffect(() => {
    // Check if PWA is supported
    if (typeof window !== 'undefined') {
      setIsSupported('serviceWorker' in navigator);
      setIsOnline(navigator.onLine);
      setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);
      
      // Update features
      setFeatures(pwaManager.getPWAFeatures());
      
      // Update offline queue status
      setOfflineQueueStatus(pwaManager.getOfflineQueueStatus());
      
      // Listen for online/offline events
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Listen for app install events
      const handleAppInstalled = () => setIsInstalled(true);
      window.addEventListener('appinstalled', handleAppInstalled);
      
      // Periodically update offline queue status
      const interval = setInterval(() => {
        setOfflineQueueStatus(pwaManager.getOfflineQueueStatus());
      }, 5000);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('appinstalled', handleAppInstalled);
        clearInterval(interval);
      };
    }
    return undefined;
  }, []);

  const contextValue: PWAContextType = {
    isSupported,
    isOnline,
    isInstalled,
    features,
    installPWA: () => pwaManager.installPWA(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    storeOfflineBooking: (data) => pwaManager.storeOfflineBooking(data),
    getOfflineBookings: () => pwaManager.getOfflineBookings(),
    syncOfflineData: () => pwaManager.syncOfflineData(),
    shareContent: (data) => pwaManager.shareContent(data),
    getUserLocation: () => pwaManager.getUserLocation(),
    offlineQueueStatus
  };

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}