/**
 * Advanced Service Worker for Houston Mobile Notary Pros
 * Phase 3: Enhanced offline capabilities and performance optimization
 */

const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE_NAME = `hmnp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `hmnp-dynamic-${CACHE_VERSION}`;
const API_CACHE_NAME = `hmnp-api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  // Core pages
  '/booking',
  '/services',
  '/faq',
  '/contact',
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  /^\/api\/services$/,
  /^\/api\/booking-settings$/,
  /^\/api\/business-settings$/,
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /^\/api\/bookings/,
  /^\/api\/availability/,
  /^\/api\/webhooks/,
  /^\/admin/,
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Phase 3 service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Service worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

/**
 * Fetch event - implement advanced caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }

  // Static assets (JS, CSS, images)
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(handleDefault(request));
});

/**
 * Handle API requests with different strategies
 */
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  
  // Network-first for critical API endpoints
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return handleNetworkFirst(request, API_CACHE_NAME);
  }
  
  // Cache-first for cacheable API endpoints
  if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return handleCacheFirst(request, API_CACHE_NAME, { ttl: 5 * 60 * 1000 }); // 5 minutes
  }
  
  // Default: network only for sensitive endpoints
  return handleNetworkOnly(request);
}

/**
 * Handle static assets (cache-first strategy)
 */
async function handleStaticAsset(request) {
  return handleCacheFirst(request, STATIC_CACHE_NAME, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
}

/**
 * Handle navigation requests
 */
async function handleNavigation(request) {
  const url = new URL(request.url);
  
  // Network-first for admin and booking pages
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    return handleNetworkFirst(request, DYNAMIC_CACHE_NAME);
  }
  
  // Cache-first for static pages
  return handleStaleWhileRevalidate(request, DYNAMIC_CACHE_NAME);
}

/**
 * Default handler
 */
async function handleDefault(request) {
  return handleNetworkFirst(request, DYNAMIC_CACHE_NAME);
}

/**
 * Network-first strategy
 */
async function handleNetworkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request.clone());
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

/**
 * Cache-first strategy with TTL
 */
async function handleCacheFirst(request, cacheName, options = {}) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Not in cache, fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

/**
 * Stale-while-revalidate strategy
 */
async function handleStaleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkFetch = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If no cache, wait for network
  return networkFetch;
}

/**
 * Network-only strategy
 */
async function handleNetworkOnly(request) {
  return fetch(request);
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/_next/static/');
}

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Phase 3 service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('hmnp-') && 
                !cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Service worker activated successfully');
    })
  );
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  console.log('Push event received:', event)
  
  let notificationData = {
    title: 'Houston Mobile Notary Pros',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'hmnp-notification',
    renotify: true,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/action-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ],
    data: {
      url: '/dashboard'
    }
  }

  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = { ...notificationData, ...pushData }
    } catch (error) {
      console.error('Error parsing push data:', error)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Notification click event
self.addEventListener('notificationclick', event => {
  console.log('Notification click received:', event)
  
  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync tasks
      syncOfflineActions()
    )
  }
})

// Handle background sync
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or similar storage
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove successful action from offline storage
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to sync action:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Placeholder functions for offline action storage
async function getOfflineActions() {
  // Implementation would use IndexedDB or similar
  return []
}

async function removeOfflineAction(id) {
  // Implementation would remove from IndexedDB or similar
  console.log('Removing offline action:', id)
}

// Message handling for communication with the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
}) 