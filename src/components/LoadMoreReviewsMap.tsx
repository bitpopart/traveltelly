import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { useInfiniteReviews } from '@/hooks/useInfiniteReviews';
import { genUserName } from '@/lib/genUserName';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { Star, MapPin, RefreshCw, Loader2, Plus } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import { upgradeMultipleReviews, applyPrecisionUpgrades, getUpgradeStats } from '@/lib/precisionMigration';

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
  // Use brand green color for all markers
  const mainColor = '#b2d235';
  const starColor = '#fc0'; // Yellow star
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
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

  // Use the custom review marker shape with star and shadow
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
    // Fallback to review marker with star and shadow
    const fallbackSvg = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dx="0" dy="2" result="offsetblur"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#shadow)"><circle cx="36.31" cy="49.53" r="19.75" fill="white"/><path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04Z" fill="${mainColor}"/><path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/></g></svg>`;
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(fallbackSvg)}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
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

export function LoadMoreReviewsMap() {
  const { mapProvider } = useMapProvider();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteReviews();

  // Debug: Log all reviews to see what we're getting
  console.log('🔍 LoadMoreReviewsMap Debug:', {
    totalPages: data?.pages?.length || 0,
    totalReviews: data?.pages?.reduce((total, page) => total + page.reviews.length, 0) || 0,
    reviewsWithGeohash: data?.pages?.flatMap(page => page.reviews).filter(r => r.tags.find(([name]) => name === 'g')).length || 0,
  });

  // Process all reviews from all pages into map locations
  const reviewLocations = useMemo(() => {
    if (!data?.pages) return [];

    const allReviews = data.pages.flatMap(page => page.reviews);
    const locations: ReviewLocation[] = [];

    for (const review of allReviews) {
      const geohash = review.tags.find(([name]) => name === 'g')?.[1];
      if (!geohash) continue;

      try {
        const coordinates = decodeGeohash(geohash);

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
    const upgrades = upgradeMultipleReviews(allReviews, 15, 8);
    const upgradeStats = getUpgradeStats(upgrades);

    console.log(`🔧 Precision upgrade stats:`, upgradeStats);

    // Apply upgrades to location data
    const upgradedLocations = applyPrecisionUpgrades(locations, upgrades);

    console.log(`✅ Final locations with upgrades: ${upgradedLocations.length}`);
    console.log(`📈 Upgraded locations: ${upgradedLocations.filter(l => l.upgraded).length}`);
    console.log(`📸 GPS corrected locations: ${upgradedLocations.filter(l => l.gpsCorreected).length}`);

    return upgradedLocations;
  }, [data]);

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-muted-foreground">
              Failed to load review locations. Please try again.
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

  const totalReviews = data?.pages.reduce((total, page) => total + page.reviews.length, 0) || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Review Locations</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8 px-3"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[centerLat, centerLng]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution={tileConfig.attribution}
                url={tileConfig.url}
                maxZoom={tileConfig.maxZoom}
              />
              {reviewLocations.map((review) => (
                <ReviewMarker key={review.id} review={review} />
              ))}
            </MapContainer>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {reviewLocations.length} review{reviewLocations.length !== 1 ? 's' : ''} with locations
                  {totalReviews > reviewLocations.length && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({totalReviews} total loaded)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {reviewLocations.filter(r => r.upgraded).length > 0 && (
                  <span className="text-blue-600 font-medium">
                    {reviewLocations.filter(r => r.upgraded).length} upgraded to high precision
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>4-5 stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>3 stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>1-2 stars</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 rounded-full bg-blue-100"></div>
                  <span>Upgraded precision</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-red-400 border-dashed rounded-full"></div>
                  <span>Low precision</span>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="min-w-40"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Load More Reviews
              </>
            )}
          </Button>
        </div>
      )}

      {!hasNextPage && totalReviews > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          All reviews loaded ({totalReviews} total)
        </div>
      )}
    </div>
  );
}