import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Import Leaflet CSS for maps
import 'leaflet/dist/leaflet.css';

// Import Inter Variable font
import '@fontsource-variable/inter';

// Import nostr-login CSS (dynamically to avoid build issues)
if (typeof window !== 'undefined') {
  import('nostr-login/dist/style.css').catch(err => {
    console.warn('Could not load nostr-login styles:', err);
  });
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
