const CACHE_NAME = "hmnp-v1"
const urlsToCache = ["/", "/booking", "/ron", "/manifest.json", "/icons/icon-192x192.png", "/icons/icon-512x512.png"]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Handle background sync for offline booking attempts
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync())
  }
})

function doBackgroundSync() {
  // Handle offline booking submissions when connection is restored
  return new Promise((resolve) => {
    // Implementation would sync with your booking API
    resolve()
  })
}
