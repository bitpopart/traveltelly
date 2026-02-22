/**
 * Service Worker Utilities
 * Helper functions for interacting with the Service Worker
 */

/**
 * Check if service workers are supported
 */
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

/**
 * Get the current service worker registration
 */
export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!isServiceWorkerSupported()) {
    return null;
  }
  
  try {
    return await navigator.serviceWorker.ready;
  } catch (error) {
    console.error('Failed to get service worker registration:', error);
    return null;
  }
}

/**
 * Get the service worker version
 */
export async function getServiceWorkerVersion(): Promise<string | null> {
  const registration = await getServiceWorkerRegistration();
  
  if (!registration || !registration.active) {
    return null;
  }
  
  return new Promise((resolve) => {
    const messageChannel = new MessageChannel();
    
    messageChannel.port1.onmessage = (event) => {
      resolve(event.data.version || null);
    };
    
    registration.active.postMessage(
      { type: 'GET_VERSION' },
      [messageChannel.port2]
    );
    
    // Timeout after 1 second
    setTimeout(() => resolve(null), 1000);
  });
}

/**
 * Clear all caches
 */
export async function clearAllCaches(): Promise<void> {
  const registration = await getServiceWorkerRegistration();
  
  if (registration && registration.active) {
    registration.active.postMessage({ type: 'CLEAR_CACHE' });
  }
  
  // Also clear caches directly
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
}

/**
 * Queue a post for background sync (when offline)
 */
export async function queuePostForSync(postData: unknown): Promise<void> {
  if (!isServiceWorkerSupported()) {
    throw new Error('Service Worker not supported');
  }
  
  // Store in IndexedDB for later sync
  // This is a placeholder - actual implementation would use IndexedDB
  console.log('Queuing post for background sync:', postData);
  
  // Register sync event
  const registration = await getServiceWorkerRegistration();
  if (registration && 'sync' in registration) {
    await registration.sync.register('sync-posts');
  }
}

/**
 * Request permission for push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(
  vapidPublicKey: string
): Promise<PushSubscription | null> {
  const permission = await requestNotificationPermission();
  
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }
  
  const registration = await getServiceWorkerRegistration();
  
  if (!registration) {
    throw new Error('Service Worker not registered');
  }
  
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
    
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  const registration = await getServiceWorkerRegistration();
  
  if (!registration) {
    return false;
  }
  
  const subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) {
    return false;
  }
  
  return await subscription.unsubscribe();
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

/**
 * Check if the app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  // Check if running as PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check iOS standalone mode
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  return false;
}

/**
 * Check if app can be installed (install prompt available)
 */
export function canInstallPWA(): boolean {
  return 'BeforeInstallPromptEvent' in window;
}

/**
 * Show PWA install prompt (must be triggered by user gesture)
 */
export async function showInstallPrompt(): Promise<boolean> {
  // This requires storing the beforeinstallprompt event
  // See implementation in a React component/hook
  return false;
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  cacheCount: number;
  totalSize: number;
  caches: Array<{ name: string; size: number }>;
}> {
  if (!('caches' in window)) {
    return { cacheCount: 0, totalSize: 0, caches: [] };
  }
  
  const cacheNames = await caches.keys();
  const cacheStats = await Promise.all(
    cacheNames.map(async (name) => {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      
      // Estimate size (this is approximate)
      let size = 0;
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          size += blob.size;
        }
      }
      
      return { name, size };
    })
  );
  
  const totalSize = cacheStats.reduce((sum, cache) => sum + cache.size, 0);
  
  return {
    cacheCount: cacheNames.length,
    totalSize,
    caches: cacheStats
  };
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if user is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Listen for online/offline events
 */
export function onConnectivityChange(
  callback: (online: boolean) => void
): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
