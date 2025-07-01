/**
 * Service Worker for Houston Mobile Notary Pros PWA
 * Implements offline capability for booking forms and caching strategies
 * SOP_ENHANCED.md PWA Requirements
 */

const CACHE_NAME = 'hmnp-booking-v2.0.0';
const OFFLINE_CACHE = 'hmnp-offline-v2.0.0';
const API_CACHE = 'hmnp-api-v2.0.0';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/booking',
  '/booking/enhanced',
  '/manifest.json',
  '/favicon.ico',
  // Core booking functionality
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/booking.js',
  '/_next/static/chunks/pages/booking/enhanced.js',
  // Essential CSS
  '/_next/static/css/app.css',
  // Fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
];

// API endpoints to cache for offline functionality
const API_CACHE_PATTERNS = [
  '/api/services',
  '/api/health',
  '/api/session'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.filter(asset => !asset.startsWith('http')));
      }),
      
      // Cache Google Fonts separately
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          STATIC_ASSETS
            .filter(asset => asset.startsWith('http'))
            .map(url => {
              return fetch(url, { mode: 'no-cors' })
                .then(response => cache.put(url, response))
                .catch(err => console.log('[SW] Failed to cache external asset:', url));
            })
        );
      }),
      
      // Initialize offline storage
      initializeOfflineStorage()
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Force activation
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker v2.0.0');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              !cacheName.includes('v2.0.0') && 
              (cacheName.startsWith('hmnp-') || cacheName.startsWith('workbox-'))
            )
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activation complete');
      
      // Notify all clients about the update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_ACTIVATED',
            version: '2.0.0'
          });
        });
      });
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Google Maps API - Cache First
  if (url.hostname === 'maps.googleapis.com' || url.hostname === 'maps.gstatic.com') {
    event.respondWith(handleMapsRequest(request));
    return;
  }
  
  // External resources (fonts, CDN) - Cache First
  if (url.origin !== location.origin) {
    event.respondWith(handleExternalRequest(request));
    return;
  }
  
  // App shell and static assets - Cache First with network fallback
  event.respondWith(handleStaticRequest(request));
});

// Network First strategy for API requests
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Always try network first for fresh data
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Network failed for API request:', url.pathname);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Serving cached API response:', url.pathname);
      
      // Add offline header
      const headers = new Headers(cachedResponse.headers);
      headers.set('X-Served-By', 'ServiceWorker-Cache');
      headers.set('X-Cache-Date', new Date().toISOString());
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: headers
      });
    }
    
    // Return offline fallback for specific endpoints
    return handleOfflineApiResponse(url.pathname);
  }
}

// Cache First strategy for Maps API
async function handleMapsRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] Maps API request failed:', request.url);
    // Return a basic offline response for maps
    return new Response(JSON.stringify({
      status: 'OFFLINE',
      error: 'Maps functionality unavailable offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Cache First strategy for external resources
async function handleExternalRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request, { mode: 'no-cors' });
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[SW] External resource failed:', request.url);
    return new Response('', { status: 404 });
  }
}

// Cache First strategy for static assets
async function handleStaticRequest(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('[SW] Static request failed:', request.url);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Offline - Houston Mobile Notary Pros</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, sans-serif; text-align: center; padding: 50px; }
            .offline-icon { font-size: 64px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="offline-icon">📱</div>
          <h1>You're offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button onclick="window.location.reload()">Retry</button>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

// Handle offline API responses with fallback data
function handleOfflineApiResponse(pathname) {
  switch (pathname) {
    case '/api/services':
      return new Response(JSON.stringify({
        success: true,
        offline: true,
        services: {
          all: [
            {
              id: 'offline-standard',
              name: 'Standard Mobile Notary',
              description: 'General notary services at your location (Offline Mode)',
              basePrice: 75,
              duration: 90,
              serviceType: 'STANDARD_NOTARY',
              requiresDeposit: true,
              depositAmount: 25
            },
            {
              id: 'offline-extended',
              name: 'Extended Hours Notary',
              description: 'After-hours notary services (Offline Mode)',
              basePrice: 100,
              duration: 90,
              serviceType: 'EXTENDED_HOURS_NOTARY',
              requiresDeposit: true,
              depositAmount: 25
            },
            {
              id: 'offline-loan',
              name: 'Loan Signing Specialist',
              description: 'Real estate loan document signing (Offline Mode)',
              basePrice: 150,
              duration: 180,
              serviceType: 'LOAN_SIGNING_SPECIALIST',
              requiresDeposit: true,
              depositAmount: 25
            }
          ]
        },
        meta: {
          totalServices: 3,
          serviceTypes: ['STANDARD_NOTARY', 'EXTENDED_HOURS_NOTARY', 'LOAN_SIGNING_SPECIALIST']
        }
      }), {
        headers: { 
          'Content-Type': 'application/json',
          'X-Served-By': 'ServiceWorker-Offline',
          'X-Offline-Mode': 'true'
        }
      });
      
    case '/api/health':
      return new Response(JSON.stringify({
        status: 'offline',
        offline: true,
        services: {
          database: { status: 'offline' },
          redis: { status: 'offline' }
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
      
    default:
      return new Response(JSON.stringify({
        success: false,
        offline: true,
        error: 'This feature requires an internet connection'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
  }
}

// Initialize offline storage for form data
async function initializeOfflineStorage() {
  // Open IndexedDB for offline form storage
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('HMNPOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for offline booking submissions
      if (!db.objectStoreNames.contains('offlineBookings')) {
        const bookingStore = db.createObjectStore('offlineBookings', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        bookingStore.createIndex('timestamp', 'timestamp', { unique: false });
        bookingStore.createIndex('status', 'status', { unique: false });
      }
      
      // Store for cached pricing calculations
      if (!db.objectStoreNames.contains('pricingCache')) {
        const pricingStore = db.createObjectStore('pricingCache', { 
          keyPath: 'key' 
        });
        pricingStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'STORE_OFFLINE_BOOKING':
      storeOfflineBooking(data).then(() => {
        event.ports[0].postMessage({ success: true });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'GET_OFFLINE_BOOKINGS':
      getOfflineBookings().then(bookings => {
        event.ports[0].postMessage({ success: true, bookings });
      }).catch(error => {
        event.ports[0].postMessage({ success: false, error: error.message });
      });
      break;
      
    case 'SYNC_OFFLINE_BOOKINGS':
      syncOfflineBookings().then(result => {
        event.ports[0].postMessage(result);
      });
      break;
      
    case 'CACHE_PRICING':
      cachePricingCalculation(data).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    case 'GET_CACHED_PRICING':
      getCachedPricing(data.key).then(pricing => {
        event.ports[0].postMessage({ success: true, pricing });
      });
      break;
  }
});

// Store booking data offline
async function storeOfflineBooking(bookingData) {
  const db = await initializeOfflineStorage();
  const transaction = db.transaction(['offlineBookings'], 'readwrite');
  const store = transaction.objectStore('offlineBookings');
  
  const offlineBooking = {
    ...bookingData,
    timestamp: new Date().toISOString(),
    status: 'pending_sync',
    offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  
  return store.add(offlineBooking);
}

// Get all offline bookings
async function getOfflineBookings() {
  const db = await initializeOfflineStorage();
  const transaction = db.transaction(['offlineBookings'], 'readonly');
  const store = transaction.objectStore('offlineBookings');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Sync offline bookings when back online
async function syncOfflineBookings() {
  try {
    const bookings = await getOfflineBookings();
    const pendingBookings = bookings.filter(b => b.status === 'pending_sync');
    
    if (pendingBookings.length === 0) {
      return { success: true, synced: 0 };
    }
    
    const syncResults = await Promise.allSettled(
      pendingBookings.map(async (booking) => {
        try {
          const response = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
          });
          
          if (response.ok) {
            // Mark as synced
            await updateOfflineBookingStatus(booking.id, 'synced');
            return { success: true, bookingId: booking.offlineId };
          } else {
            await updateOfflineBookingStatus(booking.id, 'sync_failed');
            return { success: false, error: 'Server error' };
          }
        } catch (error) {
          await updateOfflineBookingStatus(booking.id, 'sync_failed');
          return { success: false, error: error.message };
        }
      })
    );
    
    const successful = syncResults.filter(r => r.value?.success).length;
    
    return {
      success: true,
      synced: successful,
      total: pendingBookings.length,
      results: syncResults
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Update offline booking status
async function updateOfflineBookingStatus(bookingId, status) {
  const db = await initializeOfflineStorage();
  const transaction = db.transaction(['offlineBookings'], 'readwrite');
  const store = transaction.objectStore('offlineBookings');
  
  const booking = await store.get(bookingId);
  if (booking) {
    booking.status = status;
    booking.lastSync = new Date().toISOString();
    await store.put(booking);
  }
}

// Cache pricing calculations
async function cachePricingCalculation(data) {
  const db = await initializeOfflineStorage();
  const transaction = db.transaction(['pricingCache'], 'readwrite');
  const store = transaction.objectStore('pricingCache');
  
  const cacheEntry = {
    key: data.key,
    pricing: data.pricing,
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  };
  
  return store.put(cacheEntry);
}

// Get cached pricing
async function getCachedPricing(key) {
  const db = await initializeOfflineStorage();
  const transaction = db.transaction(['pricingCache'], 'readonly');
  const store = transaction.objectStore('pricingCache');
  
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => {
      const result = request.result;
      if (result && new Date(result.expiresAt) > new Date()) {
        resolve(result.pricing);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-bookings') {
    console.log('[SW] Background sync triggered for bookings');
    event.waitUntil(syncOfflineBookings());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

console.log('[SW] Service Worker v2.0.0 loaded successfully');