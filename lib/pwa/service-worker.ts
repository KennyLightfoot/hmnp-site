/**
 * PWA Service Worker Registration and Management
 * Handles offline functionality for the enhanced booking system
 */

export interface OfflineBooking {
  id?: number;
  offlineId: string;
  serviceId: string;
  numberOfSigners: number;
  numberOfDocuments: number;
  appointmentStartTime: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressZip: string;
  locationType: string;
  pricingBreakdown?: any;
  calculatedDistance?: number;
  travelFee?: number;
  timestamp: string;
  status: 'pending_sync' | 'synced' | 'sync_failed';
}

export interface PricingCache {
  key: string;
  pricing: any;
  timestamp: string;
  expiresAt: string;
}

export class PWAManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private syncQueue: OfflineBooking[] = [];

  constructor() {
    this.setupOnlineStatusListeners();
  }

  /**
   * Register service worker and set up PWA functionality
   */
  async registerServiceWorker(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('[PWA] Service Worker not supported');
      return false;
    }

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('[PWA] Service Worker registered successfully:', this.registration.scope);

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.showUpdateNotification();
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event);
      });

      // Check for updates periodically
      setInterval(() => {
        this.registration?.update();
      }, 30 * 60 * 1000); // Check every 30 minutes

      return true;

    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return false;
    }
  }

  /**
   * Store booking data offline when network is unavailable
   */
  async storeOfflineBooking(bookingData: Omit<OfflineBooking, 'timestamp' | 'status' | 'offlineId'>): Promise<boolean> {
    try {
      if (!this.registration) {
        throw new Error('Service Worker not registered');
      }

      const result = await this.sendMessageToServiceWorker({
        type: 'STORE_OFFLINE_BOOKING',
        data: bookingData
      });

      if (result.success) {
        console.log('[PWA] Booking stored offline successfully');
        this.showOfflineNotification();
        return true;
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('[PWA] Failed to store offline booking:', error);
      return false;
    }
  }

  /**
   * Get all offline bookings
   */
  async getOfflineBookings(): Promise<OfflineBooking[]> {
    try {
      if (!this.registration) {
        return [];
      }

      const result = await this.sendMessageToServiceWorker({
        type: 'GET_OFFLINE_BOOKINGS'
      });

      return result.success ? result.bookings : [];

    } catch (error) {
      console.error('[PWA] Failed to get offline bookings:', error);
      return [];
    }
  }

  /**
   * Sync offline bookings when back online
   */
  async syncOfflineBookings(): Promise<{ success: boolean; synced: number; total: number }> {
    try {
      if (!this.registration) {
        throw new Error('Service Worker not registered');
      }

      const result = await this.sendMessageToServiceWorker({
        type: 'SYNC_OFFLINE_BOOKINGS'
      });

      if (result.success) {
        console.log(`[PWA] Synced ${result.synced}/${result.total} offline bookings`);
        
        if (result.synced > 0) {
          this.showSyncSuccessNotification(result.synced);
        }
        
        return {
          success: true,
          synced: result.synced,
          total: result.total
        };
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('[PWA] Failed to sync offline bookings:', error);
      return { success: false, synced: 0, total: 0 };
    }
  }

  /**
   * Cache pricing calculation for offline use
   */
  async cachePricingCalculation(key: string, pricing: any): Promise<void> {
    try {
      if (!this.registration) return;

      await this.sendMessageToServiceWorker({
        type: 'CACHE_PRICING',
        data: { key, pricing }
      });

    } catch (error) {
      console.error('[PWA] Failed to cache pricing:', error);
    }
  }

  /**
   * Get cached pricing calculation
   */
  async getCachedPricing(key: string): Promise<any | null> {
    try {
      if (!this.registration) return null;

      const result = await this.sendMessageToServiceWorker({
        type: 'GET_CACHED_PRICING',
        data: { key }
      });

      return result.success ? result.pricing : null;

    } catch (error) {
      console.error('[PWA] Failed to get cached pricing:', error);
      return null;
    }
  }

  /**
   * Check if app is running offline
   */
  isOffline(): boolean {
    return !this.isOnline;
  }

  /**
   * Get app installation prompt
   */
  async getInstallPrompt(): Promise<BeforeInstallPromptEvent | null> {
    return new Promise((resolve) => {
      window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        resolve(event as BeforeInstallPromptEvent);
      }, { once: true });

      // Resolve with null if no prompt in 5 seconds
      setTimeout(() => resolve(null), 5000);
    });
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission !== 'granted') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  /**
   * Show local notification
   */
  async showNotification(title: string, options: NotificationOptions = {}): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted' && this.registration) {
      await this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        vibrate: [100, 50, 100],
        ...options
      });
    }
  }

  /**
   * Private: Send message to service worker
   */
  private async sendMessageToServiceWorker(message: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.registration || !navigator.serviceWorker.controller) {
        reject(new Error('Service Worker not available'));
        return;
      }

      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }

  /**
   * Private: Setup online/offline status listeners
   */
  private setupOnlineStatusListeners(): void {
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });
  }

  /**
   * Private: Handle online status changes
   */
  private async handleOnlineStatusChange(isOnline: boolean): void {
    if (isOnline) {
      // Try to sync offline bookings
      setTimeout(() => {
        this.syncOfflineBookings();
      }, 1000); // Wait 1 second for connection to stabilize
    }
  }

  /**
   * Private: Handle messages from service worker
   */
  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;

    switch (type) {
      case 'SW_ACTIVATED':
        console.log(`[PWA] Service Worker activated (v${data?.version})`);
        break;
        
      case 'OFFLINE_BOOKING_STORED':
        console.log('[PWA] Offline booking stored');
        break;
        
      case 'SYNC_COMPLETE':
        console.log('[PWA] Background sync completed');
        break;
    }
  }

  /**
   * Private: Show update notification
   */
  private showUpdateNotification(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('App Update Available', {
        body: 'A new version of the app is available. Please refresh to update.',
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg'
      });
    }
  }

  /**
   * Private: Show offline notification
   */
  private showOfflineNotification(): void {
    this.showNotification('Booking Saved Offline', {
      body: 'Your booking has been saved and will be submitted when you\'re back online.',
      tag: 'offline-booking'
    });
  }

  /**
   * Private: Show sync success notification
   */
  private showSyncSuccessNotification(count: number): void {
    this.showNotification('Bookings Synced', {
      body: `${count} offline booking(s) have been successfully submitted.`,
      tag: 'sync-success'
    });
  }
}

// Global PWA Manager instance
export const pwaManager = new PWAManager();

// Auto-register service worker
if (typeof window !== 'undefined') {
  pwaManager.registerServiceWorker().then((success) => {
    if (success) {
      console.log('[PWA] PWA functionality enabled');
    } else {
      console.log('[PWA] PWA functionality unavailable');
    }
  });
}

// Types for better TypeScript support
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}