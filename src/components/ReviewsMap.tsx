import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { genUserName } from '@/lib/genUserName';
import { Star, MapPin, RefreshCw } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import type { NostrEvent } from '@nostrify/nostrify';
import { upgradeMultipleReviews, applyPrecisionUpgrades, getUpgradeStats } from '@/lib/precisionMigration';
import { identifyLowPrecisionMarkers } from '@/lib/photoGpsCorrection';

// Fix for Leaflet default markers in bundled applications
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map tile layer configurations
const getTileLayerConfig = (provider: 'openstreetmap' | 'satellite') => {
  switch (provider) {
    case 'openstreetmap':
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      };
    case 'satellite':
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
      };
    default:
      return {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      };
  }
};

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

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
}

function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];

  return !!(d && title && rating && category);
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

    const result = {
      lat: decoded.latitude,
      lng: decoded.longitude,
      precision,
      accuracy,
    };

    console.log(`🗺️ Decoding geohash: ${geohashStr} (precision ${precision}, ${accuracy}) → lat=${result.lat}, lng=${result.lng}`);
    return result;
  } catch (error) {
    console.error('Error decoding geohash:', geohashStr, error);
    throw error;
  }
}

// Custom marker icon with precision indicator
const createCustomIcon = (rating: number, precision?: number, upgraded?: boolean, gpsCorreected?: boolean) => {
  const color = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = color;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    // GPS corrected reviews get a green indicator with camera icon
    strokeColor = '#10b981';
    strokeWidth = '2';
    strokeDasharray = 'none';
    indicator = `<circle cx="20" cy="8" r="3" fill="#10b981"/><text x="20" y="11" text-anchor="middle" font-family="Arial" font-size="6" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    // Upgraded reviews get a blue indicator
    strokeColor = '#3b82f6';
    strokeWidth = '2';
    strokeDasharray = 'none';
    indicator = `<circle cx="20" cy="8" r="3" fill="#3b82f6"/><text x="20" y="11" text-anchor="middle" font-family="Arial" font-size="8" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    // Low precision reviews get a red dashed border
    strokeColor = '#ff6b6b';
    strokeWidth = '2';
    strokeDasharray = '3,2';
    indicator = `<circle cx="20" cy="8" r="3" fill="#ff6b6b"/>`;
  }

  const svgString = `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z"
              fill="${color}"
              stroke="${strokeColor}"
              stroke-width="${strokeWidth}"
              stroke-dasharray="${strokeDasharray}"/>
        <circle cx="12.5" cy="12.5" r="8" fill="white"/>
        <text x="12.5" y="17" text-anchor="middle" font-family="Arial" font-size="10" font-weight="bold" fill="${color}">${rating}</text>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  } catch (error) {
    console.error('Error creating custom icon:', error);
    // Fallback to a simple colored marker
    const fallbackSvg = `<svg width="25" height="41" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/></svg>`;
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(fallbackSvg)}`,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }
};

function ReviewMarker({ review }: { review: ReviewLocation }) {
  const navigate = useNavigate();
  const author = useAuthor(review.authorPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(review.authorPubkey);

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
      icon={createCustomIcon(review.rating, review.precision, review.upgraded, review.gpsCorreected)}
    >
      <Popup className="review-popup" maxWidth={300}>
        <div className="p-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryEmojis[review.category] || '📍'}</span>
            <h3 className="font-bold text-sm">{review.title}</h3>
          </div>

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

          <p className="text-xs text-gray-600 mb-2">
            Reviewed by {displayName}
          </p>

          <div className="flex gap-2 mb-3 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {review.category.replace('-', ' ')}
            </Badge>
            {review.gpsCorreected && (
              <Badge variant="default" className="text-xs bg-green-500">
                📷 GPS Corrected ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && review.upgraded && (
              <Badge variant="default" className="text-xs bg-blue-500">
                ↑ Upgraded ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && !review.upgraded && review.precision && review.precision <= 5 && (
              <Badge variant="destructive" className="text-xs">
                Low precision ({review.accuracy})
              </Badge>
            )}
            {!review.gpsCorreected && !review.upgraded && review.precision && review.precision > 5 && (
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
            onClick={() => navigate(`/review/${review.naddr}`)}
          >
            View Review
          </Button>
        </div>
      </Popup>
    </Marker>
  );
}

export function ReviewsMap() {
  const { nostr } = useNostr();
  const { mapProvider } = useMapProvider();
  const queryClient = useQueryClient();

  const { data: reviewLocations, isLoading, error } = useQuery({
    queryKey: ['review-locations', 'v2'], // Updated query key to force refresh
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([{ kinds: [34879], limit: 100 }], { signal });

      const validReviews = events.filter(validateReviewEvent);
      const locations: ReviewLocation[] = [];

      for (const review of validReviews) {
        const geohash = review.tags.find(([name]) => name === 'g')?.[1];
        if (!geohash) continue;

        try {
          const coordinates = decodeGeohash(geohash);
          console.log('Decoded geohash:', geohash, '→', coordinates);

          // Validate coordinates are reasonable
          if (coordinates.lat < -90 || coordinates.lat > 90 ||
              coordinates.lng < -180 || coordinates.lng > 180) {
            console.warn('Invalid coordinates for review:', review.id, coordinates);
            continue;
          }

          const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
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
          });
        } catch (error) {
          console.error('Error decoding geohash for review:', review.id, error);
        }
      }

      console.log(`📊 Original locations found: ${locations.length}`);

      // Apply precision upgrades to the first 15 low-precision reviews
      const upgrades = upgradeMultipleReviews(validReviews, 15, 8);
      const upgradeStats = getUpgradeStats(upgrades);

      console.log(`🔧 Precision upgrade stats:`, upgradeStats);

      // Apply upgrades to location data
      const upgradedLocations = applyPrecisionUpgrades(locations, upgrades);

      // Apply GPS corrections from photos for remaining low-precision markers
      // Note: GPS correction is disabled in map loading to prevent performance issues
      // Use the GPS Correction Manager for manual corrections
      try {
        const lowPrecisionMarkers = identifyLowPrecisionMarkers(validReviews, 6);
        console.log(`🔍 Found ${lowPrecisionMarkers.length} low precision markers`);
        console.log(`📸 ${lowPrecisionMarkers.filter(m => m.hasPhotos).length} have photos available for GPS correction`);

        // GPS correction is intentionally disabled here to avoid blocking map loading
        // Users can use the GPS Correction Manager for manual processing
      } catch (error) {
        console.warn('GPS marker identification failed:', error);
      }

      console.log(`✅ Final locations with upgrades: ${upgradedLocations.length}`);
      console.log(`📈 Upgraded locations: ${upgradedLocations.filter(l => l.upgraded).length}`);
      console.log(`📸 GPS corrected locations: ${upgradedLocations.filter(l => l.gpsCorreected).length}`);

      return upgradedLocations;
    },
  });

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              Failed to load review locations. Please try again.
            </p>
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

  if (!reviewLocations || reviewLocations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              No reviews with locations found yet. Be the first to add a review with GPS coordinates!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Use world center for homepage view
  const centerLat = 20; // World center latitude
  const centerLng = 0;  // World center longitude

  const tileConfig = getTileLayerConfig(mapProvider);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['review-locations'] });
  };

  return (
    <Card>
      <CardHeader className="pb-3 px-3 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <CardTitle className="text-base md:text-lg">Review Locations</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 px-2 md:px-3 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[60vh] md:h-96 w-full rounded-lg overflow-hidden touch-pan-x touch-pan-y">
          <MapContainer
            center={[centerLat, centerLng]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
            zoomControl={true}
            touchZoom={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            dragging={true}
            tap={true}
          >
            <TileLayer
              attribution={tileConfig.attribution}
              url={tileConfig.url}
            />
            {reviewLocations.map((review) => (
              <ReviewMarker key={review.id} review={review} />
            ))}
          </MapContainer>
        </div>
        <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                {reviewLocations.length} review{reviewLocations.length !== 1 ? 's' : ''} with locations
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {reviewLocations.filter(r => r.upgraded).length > 0 && (
                <span className="text-blue-600 font-medium">
                  {reviewLocations.filter(r => r.upgraded).length} upgraded
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs text-gray-500 flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                <span>4-5★</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
                <span>3★</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                <span>1-2★</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-blue-500 rounded-full bg-blue-100 flex-shrink-0"></div>
                <span className="hidden sm:inline">Upgraded</span>
                <span className="sm:hidden">Upg</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 border-2 border-red-400 border-dashed rounded-full flex-shrink-0"></div>
                <span className="hidden sm:inline">Low precision</span>
                <span className="sm:hidden">Low</span>
              </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}