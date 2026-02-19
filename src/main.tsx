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

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
