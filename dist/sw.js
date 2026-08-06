// TravelTelly Service Worker
// Provides offline functionality, smart caching, push notifications, and background sync

const CACHE_VERSION = '3.0.0';
const CACHE_NAME = `traveltelly-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `traveltelly-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `traveltelly-images-v${CACHE_VERSION}`;

// Assets to cache immediately on install (app shell)
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

// Maximum cache sizes to prevent unbounded storage growth
const MAX_IMAGE_CACHE_SIZE = 60;
const MAX_RUNTIME_CACHE_SIZE = 100;

// Trusted external image CDNs to cache
const TRUSTED_IMAGE_DOMAINS = [
  'nostr.build',
  'image.nostr.build',
  'i.nostr.build',
  'void.cat',
  'satellite.earth',
  'blossom.primal.net',
  'blossom.ditto.pub',
  'primal.net',
  'nostrcheck.me',
  'cdn.satellite.earth',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        // Don't block install if a pre-cache asset is temporarily unavailable
        console.error('[SW] Precache error (non-fatal):', err);
        return self.skipWaiting();
      })
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const validCaches = new Set([CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE]);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => !validCaches.has(name))
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Trim cache to at most `maxSize` entries, removing oldest first.
 */
async function trimCache(cacheName, maxSize) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxSize) {
    const toDelete = keys.slice(0, keys.length - maxSize);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  }
}

/**
 * Decide which caching strategy to apply.
 */
function getStrategy(request) {
  const url = new URL(request.url);

  // Never intercept WebSocket / non-http
  if (url.protocol === 'wss:' || url.protocol === 'ws:') return 'skip';
  if (url.protocol === 'chrome-extension:') return 'skip';

  // API endpoints – always fresh
  if (url.pathname.startsWith('/api/')) return 'network-only';

  // JS / CSS bundles built with content hashes – safe to cache forever
  if (/\.(js|css)(\?.*)?$/.test(url.pathname) && request.destination !== 'document') {
    return 'cache-first';
  }

  // Images (same-origin or trusted CDN)
  const isTrustedImage =
    TRUSTED_IMAGE_DOMAINS.some((d) => url.hostname.includes(d)) ||
    /\.(jpg|jpeg|png|gif|webp|svg|avif)(\?.*)?$/i.test(url.pathname);
  if (isTrustedImage || request.destination === 'image') return 'cache-images';

  // HTML / navigation – network first so fresh content loads, fallback to shell
  if (request.mode === 'navigate' || request.destination === 'document') {
    return 'network-first';
  }

  // Fonts, manifests, other same-origin assets
  if (url.origin === self.location.origin) return 'stale-while-revalidate';

  // Everything else cross-origin: don't intercept
  return 'skip';
}

// ─── Strategies ───────────────────────────────────────────────────────────────

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
      trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // SPA fallback: return the app shell for any navigation miss
    if (request.mode === 'navigate') {
      const shell = await caches.match('/index.html');
      if (shell) return shell;
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function cacheImages(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request, { mode: 'cors', credentials: 'omit' });
    if (response && response.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, response.clone());
      trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
    }
    return response;
  } catch {
    // Image failed offline – return nothing (browser shows broken img gracefully)
    return new Response('', { status: 408, statusText: 'Image Unavailable Offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);

  // Kick off network fetch regardless (revalidate in background)
  const networkFetch = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
        trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
      }
      return response;
    })
    .catch(() => cached); // If network fails, the already-resolved cached value is used

  // Return cached immediately if available, otherwise wait for network
  return cached ?? networkFetch;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const strategy = getStrategy(event.request);
  if (strategy === 'skip' || strategy === 'network-only') return;

  switch (strategy) {
    case 'network-first':
      event.respondWith(networkFirst(event.request));
      break;
    case 'cache-first':
      event.respondWith(cacheFirst(event.request));
      break;
    case 'cache-images':
      event.respondWith(cacheImages(event.request));
      break;
    case 'stale-while-revalidate':
    default:
      event.respondWith(staleWhileRevalidate(event.request));
      break;
  }
});

// ─── Background Sync ──────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncQueuedPosts());
  }
});

async function syncQueuedPosts() {
  // Notify all open tabs that sync completed
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((client) =>
    client.postMessage({ type: 'SYNC_COMPLETE', message: 'Queued posts synced' })
  );
}

// ─── Push Notifications ───────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'TravelTelly';
  const options = {
    body: data.body || 'You have a new update',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'traveltelly-default',
    data: { url: data.url || '/', ...data },
    requireInteraction: false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing tab if already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(urlToOpen);
      })
  );
});

// ─── Periodic Background Sync ─────────────────────────────────────────────────

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-content') {
    event.waitUntil(refreshAppShell());
  }
});

async function refreshAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.allSettled(
    PRECACHE_URLS.map((url) =>
      fetch(url).then((res) => { if (res.ok) cache.put(url, res); })
    )
  );
}

// ─── Message Handling ─────────────────────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (!event.data) return;

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
      );
      break;

    case 'GET_VERSION':
      if (event.ports[0]) {
        event.ports[0].postMessage({ version: CACHE_VERSION });
      }
      break;
  }
});
