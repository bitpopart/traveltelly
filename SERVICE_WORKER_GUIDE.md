# TravelTelly Service Worker Guide

## Overview

TravelTelly includes a sophisticated Service Worker that provides **offline functionality**, **smart caching**, and **PWA capabilities** for an app-like experience on web and mobile.

---

## Features

### ✅ Offline Support
- App works even without internet connection
- Essential files cached on first visit
- Automatic fallback to cached content when offline

### ✅ Smart Caching Strategies
- **Network-First**: HTML pages (fresh content when online)
- **Cache-First**: CSS/JS files (instant loading)
- **Stale-While-Revalidate**: Default strategy (fast + fresh)
- **Image Caching**: Limited cache size to save storage
- **Network-Only**: API requests and Nostr relays

### ✅ Automatic Updates
- Checks for new version every hour
- Prompts user when update available
- Seamless update process

### ✅ Push Notifications
- Support for web push notifications
- Future: notify users of new content, zaps, comments

### ✅ Background Sync
- Queue posts when offline
- Automatically sync when back online
- Future: sync queued Nostr events

---

## Service Worker Version

**Current Version:** `2.0.0`

Cache names:
- `traveltelly-v2.0.0` - App shell and static assets
- `traveltelly-runtime-v2.0.0` - Dynamic pages (max 100 items)
- `traveltelly-images-v2.0.0` - Images (max 50 items)

---

## Caching Strategies Explained

### Network-First (HTML Pages)
```
User Request → Try Network → Success: Cache + Return
                           → Fail: Return Cached or Offline Page
```

**Used for:**
- Navigation requests
- HTML pages
- User-facing content

**Why:** Ensures users always get fresh content when online, but can still access pages offline.

### Cache-First (Static Assets)
```
User Request → Check Cache → Found: Return Immediately
                           → Not Found: Fetch from Network + Cache
```

**Used for:**
- CSS files
- JavaScript bundles
- Fonts

**Why:** These files rarely change, so serving from cache is faster and more efficient.

### Stale-While-Revalidate (Default)
```
User Request → Return Cached (if available)
            → Fetch from Network in Background
            → Update Cache with Fresh Version
```

**Used for:**
- Most other requests
- Non-critical resources

**Why:** Provides instant response from cache while ensuring fresh content is ready for next request.

### Image Caching (Limited Size)
```
User Request → Check Cache → Found: Return
                           → Not Found: Fetch + Cache (up to 50 images)
```

**Used for:**
- Image files (jpg, png, webp, svg, etc.)

**Why:** Images can be large, so we limit cache size to avoid filling device storage.

### Network-Only (APIs)
```
User Request → Always Fetch from Network
```

**Used for:**
- API endpoints (`/api/*`)
- Nostr relay connections (wss://)
- Real-time data

**Why:** These must always be fresh and can't work offline anyway.

---

## Files

### `/public/sw.js`
The main Service Worker file with all caching logic.

**Key Functions:**
- `install` - Cache essential files on first install
- `activate` - Clean up old caches
- `fetch` - Handle all network requests with smart caching
- `sync` - Background sync for offline posts
- `push` - Handle push notifications
- `message` - Respond to messages from main app

### `/src/lib/serviceWorker.ts`
Utility functions for interacting with Service Worker from React.

**Exported Functions:**
- `isServiceWorkerSupported()` - Check browser support
- `getServiceWorkerRegistration()` - Get registration
- `getServiceWorkerVersion()` - Get current version
- `clearAllCaches()` - Clear all cached data
- `getCacheStats()` - Get cache size and count
- `isStandalone()` - Check if installed as PWA
- `isOnline()` - Check internet connectivity
- `onConnectivityChange()` - Listen for online/offline events

### `/src/hooks/useServiceWorker.ts`
React hook for Service Worker state and actions.

**Returns:**
```typescript
{
  // State
  isSupported: boolean;
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  version: string | null;
  isStandalone: boolean;
  isOnline: boolean;
  cacheStats: {
    cacheCount: number;
    totalSize: number;
    formattedSize: string;
  } | null;
  
  // Actions
  checkForUpdates: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshCacheStats: () => Promise<void>;
}
```

### `/src/components/PWAStatus.tsx`
Admin UI component showing Service Worker status.

**Features:**
- Connection status (online/offline)
- Service Worker registration status
- Current version
- Installation status (standalone/browser)
- Cache statistics
- Clear cache button
- Check for updates button

---

## Using the Service Worker

### In React Components

```typescript
import { useServiceWorker } from '@/hooks/useServiceWorker';

function MyComponent() {
  const { isOnline, cacheStats, clearCache } = useServiceWorker();
  
  return (
    <div>
      {isOnline ? 'Online' : 'Offline (using cached content)'}
      <button onClick={clearCache}>Clear Cache</button>
    </div>
  );
}
```

### Direct API

```typescript
import { 
  isOnline, 
  clearAllCaches,
  getCacheStats 
} from '@/lib/serviceWorker';

// Check if online
if (!isOnline()) {
  alert('You are offline. Some features may not work.');
}

// Clear all caches
await clearAllCaches();

// Get cache info
const stats = await getCacheStats();
console.log('Total cache size:', stats.totalSize);
```

---

## Viewing Service Worker in Browser

### Chrome DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in sidebar
4. See registration status, update, unregister

**Cache Storage:**
1. Application tab → **Cache Storage**
2. Expand cache names
3. See cached files
4. Right-click to delete

### Firefox DevTools

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. See registration and update status

### Testing Offline

**Chrome:**
1. DevTools → Application → Service Workers
2. Check **Offline** checkbox
3. Reload page - should work offline

**Firefox:**
1. DevTools → Network tab
2. Click **Offline** in toolbar
3. Reload page

---

## Updating the Service Worker

### Automatic Updates

The Service Worker checks for updates:
- On page load
- Every 60 minutes while app is open
- When you navigate to a new page

When an update is found:
1. New Service Worker downloads in background
2. User sees update prompt
3. If accepted, new version activates
4. Page reloads with new version

### Manual Updates

**For Developers:**

1. **Update version in `/public/sw.js`:**
   ```javascript
   const CACHE_VERSION = '2.1.0'; // Increment this
   ```

2. **Deploy changes**

3. **Users get update automatically** on next visit

**For Users:**

1. Go to Admin Panel → App Builder → PWA Status tab
2. Click "Check for Updates"
3. If update available, reload to apply

### Force Update

```typescript
// Force service worker to update
navigator.serviceWorker.ready.then(registration => {
  registration.update();
});

// Skip waiting and activate immediately
navigator.serviceWorker.controller?.postMessage({
  type: 'SKIP_WAITING'
});
```

---

## Cache Management

### Cache Limits

To prevent filling device storage:
- **Images:** Max 50 cached images
- **Pages:** Max 100 cached pages
- **Old caches:** Automatically deleted on version update

### Clear Cache

**Via UI:**
1. Admin Panel → App Builder → PWA Status
2. Click "Clear Cache"
3. Confirm action

**Via Code:**
```typescript
import { clearAllCaches } from '@/lib/serviceWorker';

await clearAllCaches();
```

**Via DevTools:**
1. Application tab → Cache Storage
2. Right-click cache name → Delete

### Check Cache Size

**Via UI:**
1. Admin Panel → App Builder → PWA Status
2. See "Cache Storage" card

**Via Code:**
```typescript
import { getCacheStats, formatBytes } from '@/lib/serviceWorker';

const stats = await getCacheStats();
console.log('Cache count:', stats.cacheCount);
console.log('Total size:', formatBytes(stats.totalSize));
```

---

## Troubleshooting

### Service Worker Not Registering

**Problem:** Service Worker fails to register

**Solutions:**
1. Check browser console for errors
2. Ensure site is served over HTTPS (required)
3. Check `/sw.js` file is accessible
4. Clear browser cache and hard reload (Ctrl+Shift+R)

### Updates Not Applied

**Problem:** New version not showing

**Solutions:**
1. Close all tabs with the app
2. Open new tab - should install new version
3. Or click "Check for Updates" in PWA Status
4. Hard reload (Ctrl+Shift+R)

### Cache Too Large

**Problem:** Cache taking too much storage

**Solutions:**
1. Clear cache via PWA Status page
2. Reduce `MAX_IMAGE_CACHE_SIZE` in `/public/sw.js`
3. Reduce `MAX_RUNTIME_CACHE_SIZE` in `/public/sw.js`

### Offline Mode Not Working

**Problem:** App doesn't work offline

**Solutions:**
1. Check Service Worker is registered (DevTools)
2. Ensure you visited pages while online first (so they're cached)
3. Check console for errors
4. Clear cache and revisit pages while online

### Old Content Showing

**Problem:** Seeing outdated content

**Solutions:**
1. Clear cache (PWA Status page)
2. Check for updates
3. Hard reload (Ctrl+Shift+R)
4. Close all tabs and reopen

---

## Testing

### Test Offline Mode

1. Visit site while online
2. Navigate to a few pages
3. Open DevTools → Application → Service Workers
4. Check "Offline" checkbox
5. Navigate around - should work from cache
6. Uncheck "Offline" - should fetch fresh content

### Test Updates

1. Make change to Service Worker version
2. Deploy to server
3. Open app in browser
4. Should see update prompt
5. Accept update
6. Verify new version loaded

### Test Cache Size Limits

1. Visit many images (more than 50)
2. Check Cache Storage in DevTools
3. Should see oldest images removed
4. Only 50 most recent images cached

---

## Advanced Features

### Background Sync (Coming Soon)

Queue posts when offline, sync when online:

```typescript
// Queue a post
await queuePostForSync({
  kind: 1,
  content: "My offline post",
  tags: []
});

// Service Worker automatically syncs when online
```

### Push Notifications (Coming Soon)

Receive notifications for new content:

```typescript
import { subscribeToPushNotifications } from '@/lib/serviceWorker';

const subscription = await subscribeToPushNotifications(VAPID_PUBLIC_KEY);
// Send subscription to server
```

### Periodic Background Sync (Future)

Automatically fetch fresh content in background:

```typescript
// Service Worker periodically updates content
// Even when app is closed (requires permission)
```

---

## Best Practices

### For Developers

1. **Increment version** when updating Service Worker
2. **Test offline** before deploying
3. **Keep caches small** to save user storage
4. **Cache strategically** - not everything needs caching
5. **Handle errors** gracefully when offline

### For Users

1. **Visit pages while online** so they're cached for offline use
2. **Clear cache occasionally** if storage is an issue
3. **Update when prompted** to get latest features
4. **Report issues** if offline mode not working

---

## Browser Support

### ✅ Fully Supported
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+
- Opera 27+

### ⚠️ Partial Support
- Safari iOS 11.3+ (some limitations)
- Samsung Internet 4+

### ❌ Not Supported
- Internet Explorer (all versions)
- Opera Mini

**Check support:** https://caniuse.com/serviceworkers

---

## Resources

### Documentation
- **MDN Service Workers:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- **Google PWA Guide:** https://web.dev/progressive-web-apps/
- **Workbox (advanced):** https://developers.google.com/web/tools/workbox

### Tools
- **Lighthouse:** Chrome DevTools → Lighthouse tab
- **PWA Builder:** https://www.pwabuilder.com
- **Service Worker Toolbox:** https://github.com/GoogleChromeLabs/sw-toolbox

### Testing
- **Chrome DevTools:** Application → Service Workers
- **Firefox DevTools:** Application → Service Workers
- **Safari Web Inspector:** Storage → Service Workers

---

## Support

For issues or questions:

1. Check PWA Status in App Builder
2. Review browser console for errors
3. Clear cache and retry
4. Contact admin via TravelTelly help bot

---

**Your app now works offline!** 🚀📱✈️
