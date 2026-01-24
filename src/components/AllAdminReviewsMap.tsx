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
import { Star, MapPin, RefreshCw, Loader2, AlertCircle, Layers, Maximize2, Minimize2, Camera, BookOpen } from 'lucide-react';
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
  type?: 'review' | 'stock-media' | 'story'; // To distinguish between reviews, stock media, and stories
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
const createCustomIcon = (rating: number, precision?: number, upgraded?: boolean, gpsCorreected?: boolean, type?: 'review' | 'stock-media' | 'story') => {
  // Different colors for different types
  const color = type === 'stock-media' ? '#3b82f6' 
    : type === 'story' ? '#8b5cf6' 
    : rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;
  const isScenicSpot = type === 'stock-media';
  const isStory = type === 'story';

  let strokeColor = color;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isStory) {
    // Stories get a book icon
    strokeColor = '#8b5cf6';
    strokeWidth = '2';
    strokeDasharray = 'none';
    indicator = `<circle cx="20" cy="8" r="4" fill="#8b5cf6"/><text x="20" y="11" text-anchor="middle" font-family="Arial" font-size="7" font-weight="bold" fill="white">📖</text>`;
  } else if (isScenicSpot) {
    // Scenic spots (stock media) get a camera icon
    strokeColor = '#3b82f6';
    strokeWidth = '2';
    strokeDasharray = 'none';
    indicator = `<circle cx="20" cy="8" r="4" fill="#3b82f6"/><text x="20" y="11" text-anchor="middle" font-family="Arial" font-size="7" font-weight="bold" fill="white">📷</text>`;
  } else if (isGpsCorrected) {
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

// Component to handle map navigation
function MapController({ targetLocation }: { targetLocation: MapLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (targetLocation) {
      map.setView(targetLocation.coordinates, targetLocation.zoom, {
        animate: true,
        duration: 1.5,
      });
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
      icon={createCustomIcon(review.rating, review.precision, review.upgraded, review.gpsCorreected, review.type)}
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

export function AllAdminReviewsMap() {
  const { mapProvider } = useMapProvider();
  const [targetLocation, setTargetLocation] = useState<MapLocation | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('World View');

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
    const upgradedLocations = applyPrecisionUpgrades(locations, upgrades);

    console.log(`✅ Final admin locations with upgrades: ${upgradedLocations.length}`);

    // Track counts for logging
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
      
      console.log(`✅ Total locations: ${upgradedLocations.length} (${allReviews.length} reviews + ${addedCount} stock media + ${storyCount} stories)`);
    }

    return {
      reviewLocations: upgradedLocations,
      totalReviews: allReviews.length,
      reviewsWithoutLocation: withoutLocation,
    };
  }, [data, stockMediaProducts, stories]);

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

  // Use world center for homepage view
  const centerLat = 20; // World center latitude
  const centerLng = 0;  // World center longitude

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
            <CardHeader className="pb-3 px-3 md:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base md:text-lg">All Admin Review Locations</CardTitle>
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
                    onClick={() => setShowControls(!showControls)}
                    className="h-8 px-2 md:px-3 flex-1 sm:flex-none"
                  >
                    {showControls ? (
                      <>
                        <Minimize2 className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Hide Navigation</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 md:mr-2" />
                        <span className="hidden md:inline">Show Navigation</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                    className="h-8 px-2 md:px-3 flex-1 sm:flex-none"
                  >
                    <RefreshCw className={`w-4 h-4 md:mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden md:inline">Refresh</span>
                  </Button>
                </div>
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
          <div className="p-3 md:p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                  <strong>{reviewLocations.length}</strong> admin review{reviewLocations.length !== 1 ? 's' : ''} with locations
                  <span className="text-xs text-gray-500 ml-1">
                    ({totalReviews} total)
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {isFetchingNextPage && (
                  <span className="text-blue-600 font-medium flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </span>
                )}
                {reviewLocations.filter(r => r.upgraded).length > 0 && (
                  <span className="text-blue-600 font-medium">
                    {reviewLocations.filter(r => r.upgraded).length} upgraded
                  </span>
                )}
              </div>
            </div>

            {reviewsWithoutLocation.length > 0 && (
              <div className="mb-3 p-2 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {reviewsWithoutLocation.length} review{reviewsWithoutLocation.length !== 1 ? 's' : ''} without location
                  </span>
                </div>
                <div className="text-xs text-yellow-700 dark:text-yellow-300">
                  No GPS coordinates available
                </div>
              </div>
            )}

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
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-3.5 md:w-4 md:h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[8px] md:text-xs font-bold flex-shrink-0">5</div>
                  <span className="hidden sm:inline">Clustered</span>
                  <span className="sm:hidden">Clus</span>
                </div>
              </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>


    </div>
  );
}