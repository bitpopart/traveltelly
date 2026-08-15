import { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useSeoMeta } from '@unhead/react';
import { Navigation } from "@/components/Navigation";
import { LocationContentGrid } from "@/components/LocationContentGrid";
import { MapPin, Globe } from "lucide-react";
import { Link } from "react-router-dom";

// List of known routes that should NOT be treated as locations
const RESERVED_ROUTES = [
  'debug', 'safe', 'minimal', 'nomap', 'simple', 'full',
  'stories', 'story', 'reviews', 'review', 'trips', 'trip',
  'create-review', 'dashboard', 'settings', 'admin', 'admin-test',
  'admin-debug', 'admin-simple', 'admin-basic', 'remove-reviews',
  'hide-reviews', 'route-test', 'photo-upload-demo', 'gps-correction-demo',
  'marketplace', 'media', 'download', 'category-test', 'stock-media-permissions',
  'media-management', 'map-marker-editor', 'events', 'search-test',
  'simple-map-demo', 'what-is-nostr', 'category-migration',
  'home', 'telly-map', 'world-map', 'telly-map.html'
];

export function LocationPage() {
  const { location } = useParams<{ location: string }>();
  const navigate = useNavigate();

  // Route tag chips that live inside the embedded world map iframe:
  // clicking "📍 Friesland" posts tellymap:nav {path:'/friesland'}
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin && e.origin !== window.location.origin && e.origin !== 'null') return;
      if (!e.data || e.data.type !== 'tellymap:nav' || typeof e.data.path !== 'string') return;
      const { path } = e.data;
      try {
        e.source?.postMessage?.({ type: 'tellymap:nav-ack', path }, { targetOrigin: window.location.origin });
      } catch { /* ignored */ }
      navigate(path);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  // Decode URL-encoded location (e.g., "New%20York" -> "New York")
  const decodedLocation = location ? decodeURIComponent(location) : '';
  const rawLocation = decodedLocation;
  const safeLocation = rawLocation.replace(/<[^>]*>/g, '').slice(0, 60);

  // Format location: convert hyphens to spaces and capitalize
  const formattedLocation = rawLocation
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useSeoMeta({
    title: `${safeLocation || 'Travel'} — TravelTelly world map view`,
    description: `Explore ${safeLocation || 'Travel'} on the TravelTelly world map: photos, reviews, stories and trips.`,
  });

  // Check if this is a reserved route
  if (!location || RESERVED_ROUTES.includes(location.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      <div className="container mx-auto px-2 md:px-4 pt-3 md:pt-6 pb-10">
        <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-6 h-6 md:w-7 md:h-7 text-orange-500" />
              {formattedLocation}
            </h1>
            <Link
              to="/telly-map"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Globe className="w-4 h-4" />
              Full world map
            </Link>
          </div>

          {/* World map view focused on this city/country */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md" style={{ height: 'min(62vh, 640px)' }}>
            <iframe
              src={`/telly-map.html?focus=${encodeURIComponent(formattedLocation)}`}
              title={`${formattedLocation} on the TravelTelly world map`}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allow="geolocation"
            />
          </div>

          {/* Content for this location */}
          <LocationContentGrid locationTag={formattedLocation} />
        </div>
      </div>
    </div>
  );
}
