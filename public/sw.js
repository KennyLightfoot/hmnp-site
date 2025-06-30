/**
 * Fixed Service Worker for Houston Mobile Notary Pros
 * Addresses POST request caching issues and external resource failures
 */

const CACHE_VERSION = 'v3.1.0-fixed';
const STATIC_CACHE_NAME = `hmnp-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE_NAME = `hmnp-dynamic-${CACHE_VERSION}`;

// Essential static assets to cache
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/favicon.ico',
  '/logo.png',
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing fixed service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching essential assets');
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

  // CRITICAL FIX: Never cache POST requests
  if (request.method === 'POST') {
    event.respondWith(fetch(request));
    return;
  }

  // CRITICAL FIX: Don't cache external domains that may fail
  if (url.origin !== location.origin) {
    event.respondWith(fetch(request));
    return;
  }

  // API requests - network first, no caching for dynamic data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Only return cached response for GET requests to safe endpoints
        if (request.method === 'GET' && 
            (url.pathname === '/api/services' || url.pathname === '/api/availability')) {
          return caches.match(request);
        }
        throw new Error('Network request failed');
      })
    );
    return;
  }

  // Navigation requests (HTML pages) - network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(DYNAMIC_CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline');
          });
        })
    );
    return;
  }

  // Static assets - cache first
  if (isStaticAsset(request)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.ok) {
            const cache = caches.open(STATIC_CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // Default: just fetch without caching
  event.respondWith(fetch(request));
});

function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/_next/static/');
}

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating fixed service worker...');
  
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
      console.log('[SW] Fixed service worker activated successfully');
    })
  );
});

// Simplified message handling
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});