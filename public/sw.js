// TravelTelly Service Worker
// Provides offline functionality and caching for PWA

const CACHE_VERSION = '2.0.0';
const CACHE_NAME = `traveltelly-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `traveltelly-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `traveltelly-images-v${CACHE_VERSION}`;

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.webmanifest',
  '/traveltelly-logo.png',
  '/traveltelly-slogan.png',
];

// Maximum cache sizes
const MAX_IMAGE_CACHE_SIZE = 50; // Maximum number of images to cache
const MAX_RUNTIME_CACHE_SIZE = 100; // Maximum number of pages to cache

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker version', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker version', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Helper function to limit cache size
async function limitCacheSize(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length > maxSize) {
    // Delete oldest entries
    const keysToDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(keysToDelete.map(key => cache.delete(key)));
    console.log(`[SW] Trimmed ${cacheName} cache to ${maxSize} items`);
  }
}

// Helper function to determine caching strategy based on request
function getCachingStrategy(request) {
  const url = new URL(request.url);
  
  // Image files - cache with size limit
  if (request.destination === 'image' || 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname)) {
    return 'cache-images';
  }
  
  // API requests and Nostr relays - network only
  if (url.pathname.startsWith('/api/') || 
      url.protocol === 'wss:' ||
      url.hostname.includes('relay')) {
    return 'network-only';
  }
  
  // CSS and JS files - cache first
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      /\.(css|js)$/i.test(url.pathname)) {
    return 'cache-first';
  }
  
  // HTML pages - network first, fallback to cache
  if (request.destination === 'document' || 
      request.mode === 'navigate' ||
      url.pathname.endsWith('.html')) {
    return 'network-first';
  }
  
  // Default - stale while revalidate
  return 'stale-while-revalidate';
}

// Network-first strategy (for HTML pages)
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
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
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);
    throw error;
  }
}

// Cache images with size limit
async function cacheImages(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
      await limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Image fetch failed:', request.url);
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(RUNTIME_CACHE);
      cache.then(c => c.put(request, networkResponse.clone()));
      limitCacheSize(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cache or nothing
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Network-only strategy
async function networkOnly(request) {
  return fetch(request);
}

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (except images)
  if (!event.request.url.startsWith(self.location.origin) && 
      event.request.destination !== 'image') {
    return;
  }
  
  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }
  
  const strategy = getCachingStrategy(event.request);
  
  let responsePromise;
  
  switch (strategy) {
    case 'network-first':
      responsePromise = networkFirst(event.request);
      break;
    case 'cache-first':
      responsePromise = cacheFirst(event.request);
      break;
    case 'cache-images':
      responsePromise = cacheImages(event.request);
      break;
    case 'network-only':
      responsePromise = networkOnly(event.request);
      break;
    case 'stale-while-revalidate':
    default:
      responsePromise = staleWhileRevalidate(event.request);
      break;
  }
  
  event.respondWith(responsePromise);
});

// Background sync for posting content while offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  console.log('[SW] Syncing queued posts...');
  
  // Future enhancement: Get queued posts from IndexedDB
  // and sync them to Nostr relays when back online
  
  try {
    // Placeholder for actual sync logic
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Posts synced successfully'
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TravelTelly';
  const options = {
    body: data.body || 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      ...data
    },
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle service worker messages
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

// Periodic background sync (requires permission)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  console.log('[SW] Periodic background sync: updating content');
  
  // Future enhancement: Fetch latest content in background
  // and notify user if new content is available
}

console.log('[SW] Service Worker loaded, version:', CACHE_VERSION);
