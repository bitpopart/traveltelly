import { createRoot } from 'react-dom/client';

// Disable verbose console logs in production to avoid performance overhead
const noop = () => {};
console.log = noop;
console.debug = noop;
console.info = noop;

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Import Leaflet CSS for maps
import 'leaflet/dist/leaflet.css';

// Import Inter Variable font
import '@fontsource-variable/inter';

// ─── Service Worker Registration ─────────────────────────────────────────────
//
// Strategy:
//  • Register after the page has loaded so the SW doesn't compete with
//    first-paint resources.
//  • When a new SW is found, broadcast a custom event so the UpdateBanner
//    component can show a non-blocking "update available" bar instead of
//    blocking the user with window.confirm().
//  • controllerchange triggers an automatic reload ONLY when the user has
//    explicitly clicked "Update" in the banner (SKIP_WAITING was sent).

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        // Periodically check for a new service worker (every hour)
        setInterval(() => registration.update(), 60 * 60 * 1000);

        // Listen for a waiting SW (new version downloaded)
        const notifyUpdate = (worker: ServiceWorker) => {
          worker.addEventListener('statechange', () => {
            if (
              worker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Dispatch a DOM event – the UpdateBanner component listens for this
              window.dispatchEvent(
                new CustomEvent('sw:update-available', { detail: { worker } })
              );
            }
          });
        };

        // Handle SW already waiting when page loads
        if (registration.waiting) {
          notifyUpdate(registration.waiting);
        }

        // Handle new SW found after page load
        registration.addEventListener('updatefound', () => {
          if (registration.installing) {
            notifyUpdate(registration.installing);
          }
        });
      })
      .catch((err) => {
        console.error('[SW] Registration failed:', err);
      });

    // When the active SW changes (after SKIP_WAITING), reload once
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
