/**
 * PWA Manager - Mobile PWA Features and Offline Capability
 * Houston Mobile Notary Pros - Phase 2
 * 
 * Manages PWA installation, offline functionality, and mobile-specific features
 */

import { logger } from '../logger';
import { getErrorMessage } from '@/lib/utils/error-utils';

export interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface OfflineBookingData {
  id: string;
  serviceType: string;
  scheduledDateTime: string;
  customerInfo: any;
  location: any;
  pricing: any;
  status: 'pending_sync' | 'synced' | 'failed';
  createdAt: string;
  lastSyncAttempt?: string;
}

export interface PWAFeatures {
  installPrompt: boolean;
  pushNotifications: boolean;
  backgroundSync: boolean;
  offlineCapability: boolean;
  webShare: boolean;
  cameraAccess: boolean;
  locationAccess: boolean;
  fullscreen: boolean;
}

/**
 * PWA Manager Class
 */
export class PWAManager {
  private installPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private offlineQueue: OfflineBookingData[] = [];

  constructor() {
    this.initializePWA();
    this.setupEventListeners();
  }

  /**
   * Initialize PWA functionality
   */
  private async initializePWA(): Promise<void> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        // Handle service worker updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });

        logger.info('Service Worker registered successfully');
      }

      // Initialize offline storage
      await this.initializeOfflineStorage();

      // Setup event listeners
      this.setupEventListeners();

      // Check for pending offline data
      await this.checkOfflineQueue();

    } catch (error: any) {
      logger.error('PWA initialization failed', { error: getErrorMessage(error) });
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // Install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as any;
      this.showInstallBanner();
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.handleAppInstalled();
    });

    // Visibility change (for background sync)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData();
      }
    });
  }

  /**
   * Check PWA feature support
   */
  getPWAFeatures(): PWAFeatures {
    return {
      installPrompt: !!this.installPrompt,
      pushNotifications: 'PushManager' in window && 'Notification' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      offlineCapability: 'serviceWorker' in navigator && 'caches' in window,
      webShare: 'share' in navigator,
      cameraAccess: 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
      locationAccess: 'geolocation' in navigator,
      fullscreen: 'requestFullscreen' in document.documentElement
    };
  }

  /**
   * Install PWA
   */
  async installPWA(): Promise<{ success: boolean; outcome?: string }> {
    if (!this.installPrompt) {
      return { success: false };
    }

    try {
      await this.installPrompt.prompt();
      const choice = await this.installPrompt.userChoice;
      
      logger.info('PWA install prompt result', { outcome: choice.outcome });
      
      return { 
        success: choice.outcome === 'accepted',
        outcome: choice.outcome 
      };
    } catch (error: any) {
      logger.error('PWA installation failed', { error: getErrorMessage(error) });
      return { success: false };
    }
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      await this.subscribeToPushNotifications();
    }

    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  private async subscribeToPushNotifications(): Promise<void> {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured');
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent,
          platform: navigator.platform
        })
      });

      logger.info('Push notification subscription created');
    } catch (error: any) {
      logger.error('Push notification subscription failed', { error: getErrorMessage(error) });
      throw error;
    }
  }

  /**
   * Store booking data offline
   */
  async storeOfflineBooking(bookingData: Omit<OfflineBookingData, 'id' | 'status' | 'createdAt'>): Promise<string> {
    const offlineBooking: OfflineBookingData = {
      ...bookingData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending_sync',
      createdAt: new Date().toISOString()
    };

    // Store in IndexedDB via service worker
    if (this.swRegistration) {
      const messageChannel = new MessageChannel();
      
      return new Promise((resolve, reject) => {
        messageChannel.port1.onmessage = (event) => {
          if (event.data.success) {
            this.offlineQueue.push(offlineBooking);
            this.notifyOfflineBookingStored(offlineBooking);
            resolve(offlineBooking.id);
          } else {
            reject(new Error(event.data.error));
          }
        };

        this.swRegistration!.active?.postMessage({
          type: 'STORE_OFFLINE_BOOKING',
          data: offlineBooking
        }, [messageChannel.port2]);
      });
    }

    throw new Error('Service Worker not available');
  }

  /**
   * Get offline bookings
   */
  async getOfflineBookings(): Promise<OfflineBookingData[]> {
    if (!this.swRegistration) {
      return [];
    }

    const messageChannel = new MessageChannel();
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.bookings || []);
        } else {
          resolve([]);
        }
      };

      this.swRegistration!.active?.postMessage({
        type: 'GET_OFFLINE_BOOKINGS'
      }, [messageChannel.port2]);
    });
  }

  /**
   * Sync offline data when online
   */
  async syncOfflineData(): Promise<{ success: boolean; synced: number; failed: number }> {
    if (!this.isOnline || !this.swRegistration) {
      return { success: false, synced: 0, failed: 0 };
    }

    const messageChannel = new MessageChannel();
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        const result = event.data;
        
        if (result.success) {
          this.notifyOfflineDataSynced(result.synced);
          logger.info('Offline data synced', result);
        }
        
        resolve({
          success: result.success,
          synced: result.synced || 0,
          failed: (result.total || 0) - (result.synced || 0)
        });
      };

      this.swRegistration!.active?.postMessage({
        type: 'SYNC_OFFLINE_BOOKINGS'
      }, [messageChannel.port2]);
    });
  }

  /**
   * Share content using Web Share API
   */
  async shareContent(data: { title: string; text: string; url?: string; files?: File[] }): Promise<boolean> {
    if (!('share' in navigator)) {
      // Fallback to clipboard
      try {
        if ('clipboard' in navigator) {
          await (navigator as any).clipboard.writeText(data.url || data.text);
          this.showToast('Link copied to clipboard');
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    try {
      await navigator.share(data);
      return true;
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        logger.error('Web Share failed', { error: getErrorMessage(error) });
      }
      return false;
    }
  }

  /**
   * Get user location
   */
  async getUserLocation(): Promise<{ latitude: number; longitude: number; accuracy: number }> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Location error: ${getErrorMessage(error)}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Take photo using camera
   */
  async takePhoto(): Promise<File> {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });

    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    await new Promise(resolve => video.onloadedmetadata = resolve);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(video, 0, 0);

    // Stop the stream
    stream.getTracks().forEach(track => track.stop());

    return new Promise(resolve => {
      canvas.toBlob((blob) => {
        const file = new File([blob!], `document_${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.8);
    });
  }

  /**
   * Toggle fullscreen mode
   */
  async toggleFullscreen(): Promise<boolean> {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return false;
      } else {
        await document.documentElement.requestFullscreen();
        return true;
      }
    } catch (error) {
      logger.error('Fullscreen toggle failed', { error });
      return false;
    }
  }

  /**
   * Add to home screen banner
   */
  private showInstallBanner(): void {
    // This would show a custom install banner
    // Implementation depends on your UI framework
    this.showToast('Install HMNP app for the best experience!', {
      action: 'Install',
      callback: () => this.installPWA()
    });
  }

  /**
   * Handle app installation
   */
  private handleAppInstalled(): void {
    this.installPrompt = null;
    this.showToast('App installed successfully!');
    
    // Track installation
    fetch('/api/analytics/pwa-install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform
      })
    }).catch(() => {}); // Silent fail
  }

  /**
   * Handle online/offline status changes
   */
  private handleOnlineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      this.showToast('Back online - syncing data...', { duration: 2000 });
      setTimeout(() => this.syncOfflineData(), 1000);
    } else {
      this.showToast('You are offline - data will sync when connection returns', { duration: 3000 });
    }
  }

  /**
   * Handle service worker updates
   */
  private handleServiceWorkerUpdate(): void {
    this.showToast('App update available', {
      action: 'Reload',
      callback: () => window.location.reload()
    });
  }

  /**
   * Initialize offline storage
   */
  private async initializeOfflineStorage(): Promise<void> {
    // The actual storage is handled by the service worker
    // This just ensures the connection is working
    try {
      await this.getOfflineBookings();
      logger.info('Offline storage initialized');
    } catch (error) {
      logger.error('Offline storage initialization failed', { error });
    }
  }

  /**
   * Check for pending offline data
   */
  private async checkOfflineQueue(): Promise<void> {
    const offlineBookings = await this.getOfflineBookings();
    this.offlineQueue = offlineBookings;

    if (offlineBookings.length > 0 && this.isOnline) {
      this.showToast(`${offlineBookings.length} offline booking(s) waiting to sync`, {
        action: 'Sync Now',
        callback: () => this.syncOfflineData()
      });
    }
  }

  /**
   * Notify user of offline booking stored
   */
  private notifyOfflineBookingStored(booking: OfflineBookingData): void {
    this.showToast('Booking saved offline - will sync when online');
    
    // Register for background sync
    if (this.swRegistration && 'sync' in this.swRegistration) {
      (this.swRegistration as any).sync.register('background-sync-bookings').catch(() => {});
    }
  }

  /**
   * Notify user of successful sync
   */
  private notifyOfflineDataSynced(count: number): void {
    if (count > 0) {
      this.showToast(`${count} booking(s) synced successfully!`);
    }
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, options?: { 
    duration?: number; 
    action?: string; 
    callback?: () => void 
  }): void {
    // This would integrate with your toast notification system
    console.log('[PWA Toast]', message, options);
    
    // You can implement this with your preferred toast library
    // or create a custom toast component
  }

  /**
   * Convert VAPID key for push subscription
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Get connection status
   */
  isAppOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get offline queue status
   */
  getOfflineQueueStatus(): { count: number; pendingSync: number } {
    const pendingSync = this.offlineQueue.filter(b => b.status === 'pending_sync').length;
    return {
      count: this.offlineQueue.length,
      pendingSync
    };
  }
}

// Singleton instance
export const pwaManager = new PWAManager();