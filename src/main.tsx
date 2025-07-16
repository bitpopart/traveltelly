import { createRoot } from 'react-dom/client';

// Import polyfills first
import './lib/polyfills.ts';

import _App from './App.tsx';
import _AppMinimal from './AppMinimal.tsx';
import AppProgressive from './AppProgressive.tsx';
import './index.css';

// Import Leaflet CSS for maps
import 'leaflet/dist/leaflet.css';

// Import Inter Variable font
import '@fontsource-variable/inter';

createRoot(document.getElementById("root")!).render(<AppProgressive />);
