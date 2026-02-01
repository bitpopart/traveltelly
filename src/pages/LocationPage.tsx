import { useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Index from './Index';

// List of known routes that should NOT be treated as locations
const RESERVED_ROUTES = [
  'debug', 'safe', 'minimal', 'nomap', 'simple', 'full',
  'stories', 'story', 'reviews', 'review', 'trips', 'trip',
  'create-review', 'dashboard', 'settings', 'admin', 'admin-test',
  'admin-debug', 'admin-simple', 'admin-basic', 'remove-reviews',
  'hide-reviews', 'route-test', 'photo-upload-demo', 'gps-correction-demo',
  'marketplace', 'media', 'download', 'category-test', 'stock-media-permissions',
  'media-management', 'map-marker-editor', 'events', 'search-test',
  'simple-map-demo', 'what-is-nostr', 'category-migration'
];

export function LocationPage() {
  const { location } = useParams<{ location: string }>();

  // Check if this is a reserved route
  if (!location || RESERVED_ROUTES.includes(location.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // Decode URL-encoded location (e.g., "New%20York" -> "New York")
  const decodedLocation = decodeURIComponent(location);

  // Format location: convert hyphens to spaces and capitalize
  const formattedLocation = decodedLocation
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return <Index initialLocation={formattedLocation} />;
}

