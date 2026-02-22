import { createRoot } from 'react-dom/client';

// Disable console logs IMMEDIATELY (before any other imports) to prevent performance issues
// Only keep console.error and console.warn for critical issues
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

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.warn('TravelTelly: Service Worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('TravelTelly: Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
