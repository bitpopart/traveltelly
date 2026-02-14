import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { useCheckIns } from '@/hooks/useCheckIns';
import { genUserName } from '@/lib/genUserName';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { MapPin } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

// Fix for Leaflet default markers in bundled applications
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CheckInLocation {
  id: string;
  lat: number;
  lng: number;
  location: string;
  description: string;
  authorPubkey: string;
  createdAt: number;
  images: string[];
}

function decodeGeohash(geohashStr: string): { lat: number; lng: number } {
  try {
    const decoded = geohash.decode(geohashStr);
    return {
      lat: decoded.latitude,
      lng: decoded.longitude,
    };
  } catch (error) {
    console.error('Error decoding geohash:', geohashStr, error);
    throw error;
  }
}

// Create custom marker icon with user profile photo
function createCheckInMarkerIcon(profileImage?: string): L.DivIcon {
  const iconHtml = profileImage
    ? `
      <div style="position: relative; width: 40px; height: 40px;">
        <img 
          src="${profileImage}" 
          style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ffcc00; object-fit: cover; background: white;"
          alt="Profile"
        />
        <div style="position: absolute; bottom: -5px; right: -5px; background: #ffcc00; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `
    : `
      <div style="position: relative; width: 40px; height: 40px;">
        <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid #ffcc00; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
          ?
        </div>
        <div style="position: absolute; bottom: -5px; right: -5px; background: #ffcc00; border-radius: 50%; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-checkin-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

function CheckInMarker({ checkIn }: { checkIn: CheckInLocation }) {
  const author = useAuthor(checkIn.authorPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(checkIn.authorPubkey);
  const profileImage = metadata?.picture;

  const markerIcon = createCheckInMarkerIcon(profileImage);
  
  return (
    <Marker
      position={[checkIn.lat, checkIn.lng]}
      icon={markerIcon}
    >
      <Popup className="checkin-popup" maxWidth={300}>
        <div className="p-2">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(checkIn.createdAt * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="mb-2">
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3 text-blue-600" />
              <p className="font-medium text-sm">{checkIn.location}</p>
            </div>
            {checkIn.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {checkIn.description}
              </p>
            )}
          </div>

          {checkIn.images.length > 0 && (
            <div className="grid grid-cols-3 gap-1 mb-2">
              {checkIn.images.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-16 object-cover rounded"
                />
              ))}
            </div>
          )}

          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-xs">
            Check-in
          </Badge>
        </div>
      </Popup>
    </Marker>
  );
}

export function CheckInsMap() {
  const { data: checkIns, isLoading, error } = useCheckIns();
  const { currentProvider } = useMapProvider();
  const tileConfig = getTileLayerConfig(currentProvider);

  const checkInLocations = useMemo((): CheckInLocation[] => {
    if (!checkIns) return [];

    return checkIns
      .map((event: NostrEvent) => {
        try {
          const geohashTag = event.tags.find(([name]) => name === 'g')?.[1];
          const location = event.tags.find(([name]) => name === 'location')?.[1];
          
          if (!geohashTag || !location) return null;

          const coords = decodeGeohash(geohashTag);
          const images = event.tags
            .filter(([name]) => name === 'image')
            .map(([, url]) => url);

          return {
            id: event.id,
            lat: coords.lat,
            lng: coords.lng,
            location,
            description: event.content,
            authorPubkey: event.pubkey,
            createdAt: event.created_at,
            images,
          };
        } catch (error) {
          console.error('Error processing check-in:', error);
          return null;
        }
      })
      .filter((loc): loc is CheckInLocation => loc !== null);
  }, [checkIns]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <Skeleton className="w-full h-[400px] rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            Failed to load check-ins. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (checkInLocations.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No check-ins yet. Be the first to share your location!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="w-full h-full"
            scrollWheelZoom={false}
          >
            <TileLayer {...tileConfig} />
            {checkInLocations.map((checkIn) => (
              <CheckInMarker key={checkIn.id} checkIn={checkIn} />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
