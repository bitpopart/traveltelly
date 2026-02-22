import { useState, useEffect, useCallback } from 'react';
import {
  isServiceWorkerSupported,
  getServiceWorkerVersion,
  clearAllCaches,
  isStandalone,
  isOnline,
  onConnectivityChange,
  getCacheStats,
  formatBytes,
} from '@/lib/serviceWorker';

export interface ServiceWorkerState {
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
}

export interface ServiceWorkerActions {
  checkForUpdates: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshCacheStats: () => Promise<void>;
}

/**
 * Hook for interacting with the Service Worker
 */
export function useServiceWorker(): ServiceWorkerState & ServiceWorkerActions {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: isServiceWorkerSupported(),
    isRegistered: false,
    isUpdateAvailable: false,
    version: null,
    isStandalone: isStandalone(),
    isOnline: isOnline(),
    cacheStats: null,
  });

  // Check if service worker is registered
  useEffect(() => {
    if (!state.isSupported) return;

    navigator.serviceWorker.ready.then(() => {
      setState(prev => ({ ...prev, isRegistered: true }));
    });
  }, [state.isSupported]);

  // Get service worker version
  useEffect(() => {
    if (!state.isRegistered) return;

    getServiceWorkerVersion().then(version => {
      setState(prev => ({ ...prev, version }));
    });
  }, [state.isRegistered]);

  // Listen for connectivity changes
  useEffect(() => {
    const cleanup = onConnectivityChange((online) => {
      setState(prev => ({ ...prev, isOnline: online }));
    });

    return cleanup;
  }, []);

  // Check for updates
  const checkForUpdates = useCallback(async () => {
    if (!state.isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }, [state.isSupported]);

  // Clear cache
  const clearCache = useCallback(async () => {
    try {
      await clearAllCaches();
      setState(prev => ({ ...prev, cacheStats: null }));
      
      // Refresh cache stats after clearing
      setTimeout(async () => {
        const stats = await getCacheStats();
        setState(prev => ({
          ...prev,
          cacheStats: {
            cacheCount: stats.cacheCount,
            totalSize: stats.totalSize,
            formattedSize: formatBytes(stats.totalSize),
          },
        }));
      }, 1000);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }, []);

  // Refresh cache stats
  const refreshCacheStats = useCallback(async () => {
    try {
      const stats = await getCacheStats();
      setState(prev => ({
        ...prev,
        cacheStats: {
          cacheCount: stats.cacheCount,
          totalSize: stats.totalSize,
          formattedSize: formatBytes(stats.totalSize),
        },
      }));
    } catch (error) {
      console.error('Failed to get cache stats:', error);
    }
  }, []);

  // Load cache stats on mount
  useEffect(() => {
    refreshCacheStats();
  }, [refreshCacheStats]);

  return {
    ...state,
    checkForUpdates,
    clearCache,
    refreshCacheStats,
  };
}
