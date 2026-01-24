import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import App from './App.tsx';
import './index.css';

// Import Leaflet CSS for maps
import 'leaflet/dist/leaflet.css';

// Import nostr-login CSS
import 'nostr-login/dist/style.css';

// Import Inter Variable font
import '@fontsource-variable/inter';

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
