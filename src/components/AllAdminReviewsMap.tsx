import { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { useAllAdminReviews } from '@/hooks/useAdminReviews';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { genUserName } from '@/lib/genUserName';
import { MapNavigationControls, type MapLocation } from '@/components/MapNavigationControls';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { Star, RefreshCw, Layers, Maximize2, Minimize2, Camera, BookOpen, Globe } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import { upgradeMultipleReviews, applyPrecisionUpgrades, getUpgradeStats } from '@/lib/precisionMigration';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub for stories
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

// Fix for Leaflet default markers in bundled applications
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map tile layer configurations moved to @/lib/mapConfig

interface ReviewLocation {
  id: string;
  lat: number;
  lng: number;
  title: string;
  rating: number;
  category: string;
  authorPubkey: string;
  naddr: string;
  image?: string;
  precision?: number;
  accuracy?: string;
  upgraded?: boolean;
  gpsCorreected?: boolean;
  correctionConfidence?: number;
  type?: 'review' | 'stock-media' | 'story' | 'check-in'; // To distinguish between reviews, stock media, stories, and check-ins
}

function decodeGeohash(geohashStr: string): { lat: number; lng: number; precision: number; accuracy: string } {
  try {
    const decoded = geohash.decode(geohashStr);
    const precision = geohashStr.length;

    // Calculate approximate accuracy based on precision
    const accuracyMap: Record<number, string> = {
      1: "±2500 km",
      2: "±630 km",
      3: "±78 km",
      4: "±20 km",
      5: "±2.4 km",
      6: "±610 m",
      7: "±76 m",
      8: "±19 m",
      9: "±2.4 m",
      10: "±60 cm",
    };

    const accuracy = accuracyMap[precision] || "Unknown";

    return {
      lat: decoded.latitude,
      lng: decoded.longitude,
      precision,
      accuracy,
    };
  } catch (error) {
    console.error('Error decoding geohash:', geohashStr, error);
    throw error;
  }
}

// Custom marker icon with precision indicator
const createCustomIcon = (rating: number, precision?: number, upgraded?: boolean, gpsCorreected?: boolean, type?: 'review' | 'stock-media' | 'story', category?: string) => {
  // For cafe category, use special cafe marker with coffee cup icon (handles both 'cafe' and 'café')
  const normalizedCategory = category?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isCafe = normalizedCategory === 'cafe' && type === 'review';
  const isRestaurant = normalizedCategory === 'restaurant' && type === 'review';
  console.log('🔍 AllAdmin marker check:', { category, normalizedCategory, type, isCafe, isRestaurant });
  if (isCafe) {
    console.log('☕ Creating cafe marker (AllAdmin) for rating:', rating);
    return createCafeMarkerForAdmin(rating, precision, upgraded, gpsCorreected);
  }
  if (isRestaurant) {
    console.log('🍽️ Creating restaurant marker (AllAdmin) for rating:', rating);
    return createRestaurantMarkerForAdmin(rating, precision, upgraded, gpsCorreected);
  }
  
  // For stock media, use red camera marker with yellow star
  if (type === 'stock-media') {
    const svgString = `<svg viewBox="0 0 72.61 100.72" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path fill="#ce1313" d="M36.31,0C15.67,0,0,18.32,0,37.04c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67C72.61,18.32,56.94,0,36.31,0Z"/>
        <path fill="#fff" d="M56.57,18.4H16.54c-1.84,0-3.33,1.49-3.33,3.33v26.65c0,1.84,1.5,3.33,3.33,3.33h40.04c1.84,0,3.33-1.49,3.33-3.33v-26.65c0-1.84-1.49-3.33-3.33-3.33ZM30.12,47.69c-6.97,0-12.63-5.65-12.63-12.63s5.65-12.63,12.63-12.63,12.63,5.65,12.63,12.63-5.65,12.63-12.63,12.63ZM54.83,25.48h-4.05c-1.21,0-2.19-.98-2.19-2.18s.98-2.19,2.19-2.19h4.05c1.2,0,2.19.98,2.19,2.19s-.98,2.18-2.19,2.18Z"/>
        <rect fill="#fff" x="17.89" y="13.86" width="9.58" height="3.48"/>
        <path fill="#fff" d="M36.01,35.06c0,3.33-2.7,6.03-6.02,6.03s-6.02-2.69-6.02-6.03,2.69-6.02,6.02-6.02,6.02,2.7,6.02,6.02Z"/>
        <path fill="#fc0" d="M42.54,65.41c-.15-.11-.35-.12-.52-.02l-4.25,2.55s-.03.02-.04.03c-.04.03-.1.06-.1.08-.24-.57-1.64-5.81-2.49-9.03-.06-.21-.24-.35-.46-.35-.22,0-.4.15-.45.36l-3.92,16.92c-.03.16-.11.69.27.96.27.19.62.16,1.03-.1l3.53-2.2,2.76,8.6c.06.19.24.33.45.33h.02c.21,0,.39-.16.44-.37l3.91-17.27c.04-.18-.03-.37-.18-.48Z"/>
      </g>
    </svg>`.replace(/\s+/g, ' ').trim();
    
    try {
      return new Icon({
        iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
        iconSize: [40, 55],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55],
      });
    } catch (error) {
      console.error('Error creating stock media icon:', error);
      return new Icon({
        iconUrl: '/stock-media-marker-new.svg',
        iconSize: [40, 55],
        iconAnchor: [20, 55],
        popupAnchor: [0, -55],
      });
    }
  }
  
  // Use blue color for review/story marker base (matching other map components)
  const mainColor = '#27b0ff';
  
  // Different colors for rating text based on type
  const ratingColor = type === 'story' ? '#8b5cf6' 
    : type === 'check-in' ? '#10b981'
    : rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;
  const isStory = type === 'story';

  // Use blue color for marker base (matching other map components)
  const markerBaseColor = '#27b0ff';
  
  let strokeColor = markerBaseColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (type === 'check-in') {
    // Check-ins get a green pin icon
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="10" fill="#10b981"/><text x="60" y="27" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="white">📍</text>`;
  } else if (isStory) {
    // Stories get a book icon
    strokeColor = '#8b5cf6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="10" fill="#8b5cf6"/><text x="60" y="27" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="white">📖</text>`;
  } else if (isGpsCorrected) {
    // GPS corrected reviews get a green indicator with camera icon
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    // Upgraded reviews get a blue indicator
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    // Low precision reviews get a red dashed border
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  // Use the custom review marker shape with star (only for reviews, not stories/stock media/check-ins) and shadow
  const starElement = type === 'review' || !type 
    ? `<path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="#fc0"/>`
    : '';
  
  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${markerBaseColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          ${starElement}
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating custom icon:', error);
    // Fallback to marker with optional star and shadow
    const fallbackSvg = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dx="0" dy="2"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#shadow)"><circle cx="36.31" cy="49.53" r="19.75" fill="white"/><path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04Z" fill="${markerBaseColor}"/>${starElement}</g></svg>`;
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(fallbackSvg)}`,
      iconSize: [42, 62],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }
};

// Cafe marker function for AllAdminReviewsMap
function createCafeMarkerForAdmin(
  rating: number,
  precision?: number,
  upgraded?: boolean,
  gpsCorreected?: boolean
): Icon {
  const mainColor = '#27b0ff';
  const starColor = '#fc0';
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${mainColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          <path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/>
          <g>
            <path fill="white" d="M29.3,73.99h15.13c3.34.19,5.26,4.02,3.47,6.87-.86,1.37-2.49,2.21-4.11,2.16-.02.3.02.62,0,.91-.08,1.21-.95,2.2-2.17,2.31h-10.18c-.92-.03-2.15-1.17-2.15-2.09v-10.17ZM43.8,81.14c1.08.12,2.2-.36,2.71-1.35.58-1.12.29-2.61-.67-3.42-.58-.49-1.31-.55-2.03-.53v5.3Z"/>
            <path fill="white" d="M45.78,90.43h-18.66c-.72,0-1.31-.59-1.31-1.31s.59-1.31,1.31-1.31h18.66c.72,0,1.31.59,1.31,1.31s-.59,1.31-1.31,1.31Z"/>
          </g>
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating cafe marker:', error);
    return new Icon({
      iconUrl: '/cafe-marker.svg',
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  }
}

// Create restaurant marker with fork and knife icon
function createRestaurantMarkerForAdmin(
  rating: number,
  precision?: number,
  upgraded?: boolean,
  gpsCorreected?: boolean
): Icon {
  const mainColor = '#27b0ff';
  const starColor = '#fc0';
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${mainColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          <path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/>
          <g>
            <path fill="white" d="M31.47,71.58v6.26l-.28.15-.64-.45-.16-5.82c-.03-.42-.49-.38-.8-.32-.11.23-.14.47-.16.72-.13,1.8-.16,5.04,0,6.81.08.88.88,1.49,1.51,2.02l.12.29c-.01,1.72-.05,3.45-.13,5.17-.14,3.01-.58,6.13-.68,9.11-.05,1.3-.2,2.82,1.49,3,1.93.21,1.95-1.5,1.91-2.88-.05-1.53-.33-3.21-.41-4.76-.17-3.13-.26-6.26-.42-9.39.1-.79,1.77-1.6,1.78-2.85.02-2.07.02-4.46-.13-6.54-.05-.74-.27-1.08-.94-.52l-.15,6.08-.76.36c-.45-.41-.08-1.05-.06-1.55.03-.8.12-4.22-.08-4.71-.1-.24-.2-.38-.45-.47l-.56.28ZM41.63,72.1c-1.86-1.9-3.57-.11-4.33,1.76-.87,2.14-1.04,5.03.84,6.69.25.22.87.42.94.7l-.8,15.89c.27,1.57,2.46,1.86,3.25.52.51-.86.07-2.75.02-3.79-.2-4.22-.37-8.44-.64-12.66,3.23-1.51,2.9-6.91.72-9.13Z"/>
          </g>
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating restaurant marker:', error);
    return new Icon({
      iconUrl: '/restaurant-marker.svg',
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  }
}

// Component to handle map navigation
function MapController({ targetLocation }: { targetLocation: MapLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation && targetLocation.coordinates && targetLocation.coordinates.length === 2) {
      const [lat, lng] = targetLocation.coordinates;
      if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
        map.setView(targetLocation.coordinates, targetLocation.zoom, {
          animate: true,
          duration: 1.5,
        });
      }
    }
  }, [map, targetLocation]);

  return null;
}

function ReviewMarker({ review }: { review: ReviewLocation }) {
  const navigate = useNavigate();
  const author = useAuthor(review.authorPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(review.authorPubkey);
  
  const isScenicSpot = review.type === 'stock-media';
  const isStory = review.type === 'story';

  const categoryEmojis: Record<string, string> = {
    'grocery-store': '🛒',
    'clothing-store': '👕',
    'electronics-store': '📱',
    'convenience-store': '🏪',
    'restaurant': '🍽️',
    'cafe': '☕',
    'fast-food': '🍔',
    'bar-pub': '🍺',
    'hotel': '🏨',
    'motel': '🏨',
    'hostel': '🏠',
    'landmarks': '🏛️',
    'bank': '🏦',
    'salon-spa': '💅',
    'car-repair': '🔧',
    'laundry': '🧺',
    'hospital': '🏥',
    'clinic': '🏥',
    'pharmacy': '💊',
    'dentist': '🦷',
    'park': '🌳',
    'beach': '🏖️',
    'playground': '🛝',
    'hiking-trail': '🥾',
    'cycling-trail': '🚴',
    'museum': '🏛️',
    'movie-theater': '🎬',
    'zoo': '🦁',
    'music-venue': '🎵',
    'school': '🏫',
    'library': '📚',
    'post-office': '📮',
    'police-station': '👮',
    'gas-station': '⛽',
    'bus-stop': '🚌',
    'train-station': '🚂',
    'parking-lot': '🅿️',
    'church': '⛪',
    'mosque': '🕌',
    'temple': '🛕',
    'synagogue': '✡️',
    'shrine': '⛩️'
  };

  return (
    <Marker
      position={[review.lat, review.lng]}
      icon={createCustomIcon(review.rating, review.precision, review.upgraded, review.gpsCorreected, review.type, review.category)}
    >
      <Popup maxWidth={250} minWidth={200}>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {isStory ? '📖' : isScenicSpot ? '📸' : (categoryEmojis[review.category] || '📍')}
            </span>
            <h3 className="font-bold text-sm">{review.title}</h3>
          </div>

          {!isScenicSpot && !isStory && (
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-xs text-gray-600 ml-1">({review.rating}/5)</span>
            </div>
          )}

          <p className="text-xs text-gray-600 mb-2">
            {isStory ? `Travel Story by ${displayName}` : isScenicSpot ? `Scenic Spot by ${displayName}` : `Reviewed by ${displayName} (Traveltelly Admin)`}
          </p>

          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {review.category.replace('-', ' ')}
            </Badge>
            {isStory && (
              <Badge variant="default" className="text-xs bg-purple-500">
                📖 Travel Article
              </Badge>
            )}
            {isScenicSpot && (
              <Badge variant="default" className="text-xs bg-blue-500">
                📷 Stock Media Available
              </Badge>
            )}
            {review.gpsCorreected && !isScenicSpot && !isStory && (
              <Badge variant="default" className="text-xs bg-green-500">
                📷 GPS Corrected ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && review.upgraded && !isScenicSpot && !isStory && (
              <Badge variant="default" className="text-xs bg-blue-500">
                ↑ Upgraded ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && !review.upgraded && review.precision && review.precision <= 5 && !isScenicSpot && !isStory && (
              <Badge variant="destructive" className="text-xs">
                Low precision ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && !review.upgraded && review.precision && review.precision > 5 && !isScenicSpot && !isStory && (
              <Badge variant="secondary" className="text-xs">
                {review.accuracy}
              </Badge>
            )}
          </div>

          {review.image && (
            <img
              src={review.image}
              alt={review.title}
              className="w-full h-20 object-cover rounded mb-2"
            />
          )}

          <Button
            size="sm"
            className="w-full text-xs"
            onClick={() => navigate(
              isStory ? `/stories` : isScenicSpot ? `/media/preview/${review.naddr}` : `/review/${review.naddr}`
            )}
          >
            {isStory ? 'Read Story' : isScenicSpot ? 'View Media' : 'View Details'}
          </Button>
        </div>
      </Popup>
    </Marker>
  );
}

// Hook to fetch stories (NIP-23 articles)
function useStories() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['traveltelly-stories-map', ADMIN_HEX],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([
        {
          kinds: [30023], // NIP-23 Long-form content
          authors: [ADMIN_HEX], // Only from Traveltelly admin
          limit: 50,
        }
      ], { signal });
      return events;
    },
  });
}

// Hook to fetch check-ins (kind 30026)
function useCheckIns() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['check-ins-map'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([
        {
          kinds: [30026], // Check-ins
          limit: 200,
        }
      ], { signal });
      return events;
    },
  });
}

interface AllAdminReviewsMapProps {
  zoomToLocation?: string;
  onLocationChange?: (location: string) => void;
  showTitle?: boolean;
}

export function AllAdminReviewsMap({ zoomToLocation, onLocationChange, showTitle = true }: AllAdminReviewsMapProps = {}) {
  const { mapProvider } = useMapProvider();
  const [targetLocation, setTargetLocation] = useState<MapLocation | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('World View');
  const [initialCenter, setInitialCenter] = useState<[number, number]>([20, 0]);
  const [initialZoom, setInitialZoom] = useState(2);

  // Detect user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('📍 User location detected:', latitude, longitude);
          setInitialCenter([latitude, longitude]);
          setInitialZoom(5); // Zoom to region level
          setCurrentLocation('Your Region');
        },
        (error) => {
          console.log('ℹ️ Geolocation not available, using world view:', error.message);
          // Keep default world view
        },
        { timeout: 5000, maximumAge: 600000 } // 5s timeout, cache for 10 minutes
      );
    }
  }, []);

  // Handle zoom to location when tag is selected
  useEffect(() => {
    if (zoomToLocation) {
      // Geocode the location
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(zoomToLocation)}&limit=1`)
        .then(response => response.json())
        .then(data => {
          if (data && data.length > 0) {
            const result = data[0];
            const lat = parseFloat(result.lat);
            const lng = parseFloat(result.lon);
            
            setTargetLocation({
              coordinates: [lat, lng],
              zoom: 6, // Country/city level zoom
              label: zoomToLocation,
            });
            setCurrentLocation(zoomToLocation);
            
            if (onLocationChange) {
              onLocationChange(zoomToLocation);
            }
          }
        })
        .catch(error => {
          console.error('Error geocoding location:', error);
        });
    } else {
      // Reset to world view
      setTargetLocation(null);
      setCurrentLocation('World View');
    }
  }, [zoomToLocation, onLocationChange]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useAllAdminReviews();
  
  // Also fetch stock media for scenic spots
  const { data: stockMediaProducts } = useMarketplaceProducts();
  
  // Fetch stories (NIP-23 articles)
  const { data: stories } = useStories();
  
  // Fetch check-ins (kind 30026)
  const { data: checkIns } = useCheckIns();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing map data...');
      refetch();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  // Auto-load all pages
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      console.log('🔄 Auto-loading next page of admin reviews...');
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Process all admin reviews and stock media into map locations
  const { reviewLocations, totalReviews, reviewsWithoutLocation } = useMemo(() => {
    if (!data?.pages) return { reviewLocations: [], totalReviews: 0, reviewsWithoutLocation: [] };

    const allReviews = data.pages.flatMap(page => page.reviews);
    const locations: ReviewLocation[] = [];
    const withoutLocation: Array<{
      id: string;
      title: string;
      created: string;
      error?: string;
    }> = [];

    console.log(`🔍 Processing ${allReviews.length} total admin reviews for map display`);

    for (const review of allReviews) {
      const geohash = review.tags.find(([name]) => name === 'g')?.[1];
      const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';

      if (!geohash) {
        withoutLocation.push({
          id: review.id.slice(0, 8),
          title,
          created: new Date(review.created_at * 1000).toLocaleDateString(),
        });
        continue;
      }

      try {
        const coordinates = decodeGeohash(geohash);

        // Validate coordinates are reasonable
        if (coordinates.lat < -90 || coordinates.lat > 90 ||
            coordinates.lng < -180 || coordinates.lng > 180) {
          console.warn('Invalid coordinates for review:', review.id, coordinates);
          withoutLocation.push({
            id: review.id.slice(0, 8),
            title,
            created: new Date(review.created_at * 1000).toLocaleDateString(),
            error: 'Invalid coordinates',
          });
          continue;
        }

        const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
        const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
        const image = review.tags.find(([name]) => name === 'image')?.[1];

        const naddr = nip19.naddrEncode({
          identifier: review.tags.find(([name]) => name === 'd')?.[1] || '',
          pubkey: review.pubkey,
          kind: 34879,
        });

        locations.push({
          id: review.id,
          lat: coordinates.lat,
          lng: coordinates.lng,
          title,
          rating,
          category,
          authorPubkey: review.pubkey,
          naddr,
          image,
          precision: coordinates.precision,
          accuracy: coordinates.accuracy,
          type: 'review',
        });
      } catch (error) {
        console.error('Error decoding geohash for review:', review.id, error);
        withoutLocation.push({
          id: review.id.slice(0, 8),
          title,
          created: new Date(review.created_at * 1000).toLocaleDateString(),
          error: 'Invalid geohash',
        });
      }
    }

    console.log(`📊 Final Admin Reviews Summary:`, {
      totalReviews: allReviews.length,
      withLocation: locations.length,
      withoutLocation: withoutLocation.length,
      pagesLoaded: data.pages.length,
    });

    // Apply precision upgrades to admin reviews
    const upgrades = upgradeMultipleReviews(allReviews, 100, 8);
    const upgradeStats = getUpgradeStats(upgrades);

    console.log(`🔧 Admin Precision upgrade stats:`, upgradeStats);

    // Apply upgrades to location data
    const upgradedLocations: ReviewLocation[] = applyPrecisionUpgrades(locations, upgrades);

    console.log(`✅ Final admin locations with upgrades: ${upgradedLocations.length}`);

    // Track counts for content types on map
    let stockMediaCount = 0;
    let storyCount = 0;

    // Add stock media as scenic spots
    if (stockMediaProducts) {
      console.log(`📸 Processing ${stockMediaProducts.length} stock media products for map`);
      for (const product of stockMediaProducts) {
        // Check for geohash tag
        const geohashTag = product.event.tags.find(([name]) => name === 'g')?.[1];
        
        console.log(`📸 Stock media "${product.title}":`, {
          hasGeohash: !!geohashTag,
          geohash: geohashTag,
          allTags: product.event.tags,
        });
        
        if (geohashTag) {
          try {
            const coordinates = decodeGeohash(geohashTag);
            
            // Validate coordinates
            if (coordinates.lat >= -90 && coordinates.lat <= 90 &&
                coordinates.lng >= -180 && coordinates.lng <= 180) {
              
              const naddr = nip19.naddrEncode({
                identifier: product.id,
                pubkey: product.seller.pubkey,
                kind: 30402,
              });
              
              upgradedLocations.push({
                id: product.event.id,
                lat: coordinates.lat,
                lng: coordinates.lng,
                title: product.title,
                rating: 5, // Stock media gets 5 stars as scenic spots
                category: '📸 Scenic Spot',
                authorPubkey: product.seller.pubkey,
                naddr,
                image: product.images[0],
                precision: coordinates.precision,
                accuracy: coordinates.accuracy,
                type: 'stock-media',
              });
              
              stockMediaCount++;
              console.log(`✅ Added stock media to map: ${product.title} at [${coordinates.lat}, ${coordinates.lng}]`);
            }
          } catch (error) {
            console.error('❌ Error decoding stock media geohash:', product.id, error);
          }
        } else {
          console.log(`⚠️ Stock media "${product.title}" has no geohash tag - won't appear on map`);
        }
      }
      
      console.log(`✅ After stock media: ${upgradedLocations.length} total locations`);
    }

    // Add stories (NIP-23 articles) as story spots
    if (stories) {
      console.log(`📖 Processing ${stories.length} stories for map`);
      for (const story of stories) {
        // Check for geohash tag
        const geohashTag = story.tags.find(([name]) => name === 'g')?.[1];
        const title = story.tags.find(([name]) => name === 'title')?.[1];
        const image = story.tags.find(([name]) => name === 'image')?.[1];
        const d = story.tags.find(([name]) => name === 'd')?.[1];
        
        console.log(`📖 Story "${title}":`, {
          hasGeohash: !!geohashTag,
          geohash: geohashTag,
          hasTitle: !!title,
          hasIdentifier: !!d,
        });
        
        if (geohashTag && title && d) {
          try {
            const coordinates = decodeGeohash(geohashTag);
            
            // Validate coordinates
            if (coordinates.lat >= -90 && coordinates.lat <= 90 &&
                coordinates.lng >= -180 && coordinates.lng <= 180) {
              
              const naddr = nip19.naddrEncode({
                identifier: d,
                pubkey: story.pubkey,
                kind: 30023,
              });
              
              upgradedLocations.push({
                id: story.id,
                lat: coordinates.lat,
                lng: coordinates.lng,
                title,
                rating: 5, // Stories get 5 stars as featured content
                category: '📖 Story',
                authorPubkey: story.pubkey,
                naddr,
                image,
                precision: coordinates.precision,
                accuracy: coordinates.accuracy,
                type: 'story',
              });
              
              storyCount++;
              console.log(`✅ Added story to map: ${title} at [${coordinates.lat}, ${coordinates.lng}]`);
            }
          } catch (error) {
            console.error('❌ Error decoding story geohash:', story.id, error);
          }
        } else {
          console.log(`⚠️ Story "${title || 'untitled'}" has no geohash tag - won't appear on map`);
        }
      }
      
      console.log(`✅ Total locations: ${upgradedLocations.length} (${allReviews.length} reviews + ${stockMediaCount} stock media + ${storyCount} stories)`);
    }

    // Add check-ins (kind 30026)
    let checkInCount = 0;
    if (checkIns) {
      console.log(`📍 Processing ${checkIns.length} check-ins for map`);
      for (const checkIn of checkIns) {
        // Check for geohash tag
        const geohashTag = checkIn.tags.find(([name]) => name === 'g')?.[1];
        const location = checkIn.tags.find(([name]) => name === 'location')?.[1];
        const d = checkIn.tags.find(([name]) => name === 'd')?.[1];
        const image = checkIn.tags.find(([name]) => name === 'image')?.[1];
        
        console.log(`📍 Check-in "${location}":`, {
          hasGeohash: !!geohashTag,
          geohash: geohashTag,
          hasLocation: !!location,
          hasIdentifier: !!d,
        });
        
        if (geohashTag && location && d) {
          try {
            const coordinates = decodeGeohash(geohashTag);
            
            // Validate coordinates
            if (coordinates.lat >= -90 && coordinates.lat <= 90 &&
                coordinates.lng >= -180 && coordinates.lng <= 180) {
              
              const naddr = nip19.naddrEncode({
                identifier: d,
                pubkey: checkIn.pubkey,
                kind: 30026,
              });
              
              upgradedLocations.push({
                id: checkIn.id,
                lat: coordinates.lat,
                lng: coordinates.lng,
                title: location,
                rating: 5, // Check-ins get 5 stars
                category: '📍 Check-in',
                authorPubkey: checkIn.pubkey,
                naddr,
                image,
                precision: coordinates.precision,
                accuracy: coordinates.accuracy,
                type: 'check-in',
              });
              
              checkInCount++;
              console.log(`✅ Added check-in to map: ${location} at [${coordinates.lat}, ${coordinates.lng}]`);
            }
          } catch (error) {
            console.error('❌ Error decoding check-in geohash:', checkIn.id, error);
          }
        } else {
          console.log(`⚠️ Check-in "${location || 'untitled'}" has no geohash tag - won't appear on map`);
        }
      }
      
      console.log(`✅ Total locations: ${upgradedLocations.length} (${allReviews.length} reviews + ${stockMediaCount} stock media + ${storyCount} stories + ${checkInCount} check-ins)`);
    }

    // Remove duplicate markers at the same location, prioritizing reviews over stock media
    // Group by coordinates (rounded to avoid floating point issues)
    const locationGroups = new Map<string, ReviewLocation[]>();
    
    for (const location of upgradedLocations) {
      // Round to 5 decimal places (~1 meter precision) to group nearby items
      const key = `${location.lat.toFixed(5)},${location.lng.toFixed(5)}`;
      
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key)!.push(location);
    }
    
    // For each location group, keep only the highest priority item
    // Priority order: review > story > check-in > stock-media
    const deduplicatedLocations: ReviewLocation[] = [];
    
    for (const [key, group] of locationGroups.entries()) {
      if (group.length === 1) {
        deduplicatedLocations.push(group[0]);
      } else {
        // Find the highest priority item
        const review = group.find(item => item.type === 'review');
        const story = group.find(item => item.type === 'story');
        const checkIn = group.find(item => item.type === 'check-in');
        const stockMedia = group.find(item => item.type === 'stock-media');
        
        // Prioritize: review > story > check-in > stock-media
        const selectedItem = review || story || checkIn || stockMedia || group[0];
        deduplicatedLocations.push(selectedItem);
        
        console.log(`🗺️ Deduplicated location ${key}:`, {
          total: group.length,
          types: group.map(g => g.type),
          selected: selectedItem.type,
          title: selectedItem.title,
        });
      }
    }
    
    console.log(`✅ After deduplication: ${deduplicatedLocations.length} unique locations (removed ${upgradedLocations.length - deduplicatedLocations.length} duplicates)`);

    return {
      reviewLocations: deduplicatedLocations,
      totalReviews: allReviews.length,
      reviewsWithoutLocation: withoutLocation,
    };
  }, [data, stockMediaProducts, stories, checkIns]);

  const handleLocationSelect = (location: MapLocation) => {
    setTargetLocation(location);
    setCurrentLocation(location.name);
  };

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              Failed to load admin review locations. Please try again.
            </p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Skeleton className="w-full h-96 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const tileConfig = getTileLayerConfig(mapProvider);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Navigation Controls */}
        {showControls && (
          <div className="lg:col-span-1">
            <MapNavigationControls
              onLocationSelect={handleLocationSelect}
              className="lg:sticky lg:top-4"
            />
          </div>
        )}

        {/* Map */}
        <div className={showControls ? "lg:col-span-3" : "lg:col-span-4"}>
          <Card>
            {showTitle && (
              <CardHeader className="pb-3 px-3 md:px-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base md:text-lg">Review Locations</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <Layers className="w-3 h-3 mr-1" />
                      Clustered
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {currentLocation}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLocationSelect({ name: "World View", coordinates: [20, 0], zoom: 2, emoji: "🌍" })}
                      className="h-8 px-3 flex-1 sm:flex-none"
                    >
                      <Globe className="w-4 h-4 mr-2" />
                      <span className="hidden md:inline">World View</span>
                      <span className="md:hidden">🌍</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            )}
            {!showTitle && (
              <div className="p-3 md:p-4 border-b flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleLocationSelect({ name: "World View", coordinates: [20, 0], zoom: 2, emoji: "🌍" })}
                  className="h-8 px-3"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">World View</span>
                  <span className="md:hidden">🌍</span>
                </Button>
              </div>
            )}
            <CardContent className="p-0">
              <div className="h-[60vh] md:h-96 w-full rounded-lg overflow-hidden touch-pan-x touch-pan-y">
                <MapContainer
                  center={initialCenter}
                  zoom={initialZoom}
                  minZoom={2}
                  maxZoom={18}
                  maxBounds={[[-90, -180], [90, 180]]}
                  maxBoundsViscosity={1.0}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                  zoomControl={true}
                  touchZoom={true}
                  doubleClickZoom={true}
                  scrollWheelZoom={true}
                  dragging={true}
                >
                  <TileLayer
                    attribution={tileConfig.attribution}
                    url={tileConfig.url}
                    maxZoom={tileConfig.maxZoom}
                  />
                  <MapController targetLocation={targetLocation} />
                  <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();
                  let color = '#ff6b35';

                  if (count >= 100) {
                    color = '#e74c3c';
                  } else if (count >= 10) {
                    color = '#f39c12';
                  }

                  return new Icon({
                    iconUrl: `data:image/svg+xml;base64,${btoa(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="${color}" stroke="#fff" stroke-width="3"/>
                        <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">${count}</text>
                      </svg>
                    `)}`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                  });
                }}
                maxClusterRadius={60}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                removeOutsideVisibleBounds={true}
                animate={true}
              >
                {reviewLocations.map((review) => (
                  <ReviewMarker key={review.id} review={review} />
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>


    </div>
  );
}