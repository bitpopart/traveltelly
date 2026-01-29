import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { useAdminReviews } from '@/hooks/useAdminReviews';
import { genUserName } from '@/lib/genUserName';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { createReviewMarkerIcon } from '@/lib/markerIcons';
import { Star, MapPin, RefreshCw, Loader2, Plus, AlertCircle } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import { upgradeMultipleReviews, applyPrecisionUpgrades, getUpgradeStats } from '@/lib/precisionMigration';

// Fix for Leaflet default markers in bundled applications
import L, { Icon } from 'leaflet';
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

// Note: Marker icon creation moved to @/lib/markerIcons for reusability

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
          icon={createReviewMarkerIcon(review.rating, review.precision, review.upgraded, review.gpsCorreected, review.category)}
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
            Reviewed by {displayName} (Admin)
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

export function AdminReviewsMap() {
  const { mapProvider } = useMapProvider();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useAdminReviews();

  // Process all admin reviews from all pages into map locations
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

    console.log(`📊 Admin Reviews Summary:`, {
      totalReviews: allReviews.length,
      withLocation: locations.length,
      withoutLocation: withoutLocation.length,
    });

    // Apply precision upgrades to admin reviews
    const upgrades = upgradeMultipleReviews(allReviews, 50, 8);
    const upgradeStats = getUpgradeStats(upgrades);

    console.log(`🔧 Admin Precision upgrade stats:`, upgradeStats);

    // Apply upgrades to location data
    const upgradedLocations = applyPrecisionUpgrades(locations, upgrades);

    console.log(`✅ Final admin locations with upgrades: ${upgradedLocations.length}`);

    return {
      reviewLocations: upgradedLocations,
      totalReviews: allReviews.length,
      reviewsWithoutLocation: withoutLocation,
    };
  }, [data]);

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

  // Use world center for homepage view
  const centerLat = 20; // World center latitude
  const centerLng = 0;  // World center longitude

  const tileConfig = getTileLayerConfig(mapProvider);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Admin Review Locations</CardTitle>
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
              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={(cluster) => {
                  const count = cluster.getChildCount();

                  return new Icon({
                    iconUrl: `data:image/svg+xml;base64,${btoa(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="20" fill="#ff6b35" stroke="#fff" stroke-width="2"/>
                        <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">${count}</text>
                      </svg>
                    `)}`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                  });
                }}
                maxClusterRadius={50}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
              >
                {reviewLocations.map((review) => (
                  <ReviewMarker key={review.id} review={review} />
                ))}
              </MarkerClusterGroup>
            </MapContainer>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {reviewLocations.length} admin review{reviewLocations.length !== 1 ? 's' : ''} with locations
                  <span className="text-xs text-gray-500 ml-1">
                    ({totalReviews} total admin reviews)
                  </span>
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

            {reviewsWithoutLocation.length > 0 && (
              <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {reviewsWithoutLocation.length} admin review{reviewsWithoutLocation.length !== 1 ? 's' : ''} without location data
                  </span>
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  These reviews don't have GPS coordinates and won't appear on the map.
                </div>
              </div>
            )}

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
                Load More Admin Reviews
              </>
            )}
          </Button>
        </div>
      )}

      {!hasNextPage && totalReviews > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          All admin reviews loaded ({totalReviews} total)
        </div>
      )}
    </div>
  );
}