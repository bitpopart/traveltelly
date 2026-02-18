import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthor } from '@/hooks/useAuthor';
import { useMapProvider } from '@/hooks/useMapProvider';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { MapPin, Globe, Loader2, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import * as geohash from 'ngeohash';
import type { NostrEvent } from '@nostrify/nostrify';
import type { GeoJsonObject } from 'geojson';

// Fix for Leaflet default markers
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

interface MyWorldMapProps {
  userPubkey: string;
  checkIns?: NostrEvent[];
  visitedCountriesEvent?: NostrEvent | null;
}

// List of countries with ISO codes
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PT', name: 'Portugal' },
  { code: 'GR', name: 'Greece' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'RO', name: 'Romania' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IS', name: 'Iceland' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'CO', name: 'Colombia' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panama' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'CU', name: 'Cuba' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'IN', name: 'India' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'LA', name: 'Laos' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'MO', name: 'Macau' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'KE', name: 'Kenya' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'UG', name: 'Uganda' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'RU', name: 'Russia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'OM', name: 'Oman' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'BY', name: 'Belarus' },
  { code: 'MD', name: 'Moldova' },
  { code: 'GE', name: 'Georgia' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AZ', name: 'Azerbaijan' },
].sort((a, b) => a.name.localeCompare(b.name));

function decodeGeohash(geohashStr: string): { lat: number; lng: number } {
  try {
    const decoded = geohash.decode(geohashStr);
    return { lat: decoded.latitude, lng: decoded.longitude };
  } catch (error) {
    console.error('Error decoding geohash:', geohashStr, error);
    throw error;
  }
}

function createCheckInMarkerIcon(profileImage?: string): L.DivIcon {
  const iconHtml = profileImage
    ? `
      <div style="position: relative; width: 32px; height: 32px;">
        <img 
          src="${profileImage}" 
          style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ffcc00; object-fit: cover; background: white;"
          alt="Profile"
        />
      </div>
    `
    : `
      <div style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid #ffcc00; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
        ?
      </div>
    `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-checkin-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

function CheckInMarker({ checkIn, userPubkey }: { checkIn: CheckInLocation; userPubkey: string }) {
  const author = useAuthor(userPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(userPubkey);
  const profileImage = metadata?.picture;
  const markerIcon = createCheckInMarkerIcon(profileImage);
  
  return (
    <Marker position={[checkIn.lat, checkIn.lng]} icon={markerIcon}>
      <Popup maxWidth={250}>
        <div className="p-1">
          <div className="flex items-center gap-2 mb-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-xs">{displayName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(checkIn.createdAt * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-1">
            <MapPin className="w-3 h-3 text-blue-600" />
            <p className="font-medium text-xs">{checkIn.location}</p>
          </div>
          {checkIn.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {checkIn.description}
            </p>
          )}
          {checkIn.images.length > 0 && (
            <div className="grid grid-cols-3 gap-1">
              {checkIn.images.slice(0, 3).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-12 object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

export function MyWorldMap({ userPubkey, checkIns, visitedCountriesEvent }: MyWorldMapProps) {
  const { currentProvider } = useMapProvider();
  const tileConfig = getTileLayerConfig(currentProvider);
  const { mutate: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();

  // Parse visited countries from event
  const savedVisitedCountries = useMemo(() => {
    if (!visitedCountriesEvent) return [];
    const countries = visitedCountriesEvent.tags
      .filter(([name]) => name === 'country')
      .map(([, code]) => code);
    return countries;
  }, [visitedCountriesEvent]);

  const [visitedCountries, setVisitedCountries] = useState<string[]>(savedVisitedCountries);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setVisitedCountries(savedVisitedCountries);
  }, [savedVisitedCountries]);

  // Parse check-ins into locations
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

  const latestCheckIn = checkInLocations[0];

  const toggleCountry = (countryCode: string) => {
    setVisitedCountries((prev) => {
      const newCountries = prev.includes(countryCode)
        ? prev.filter((c) => c !== countryCode)
        : [...prev, countryCode];
      setHasChanges(true);
      return newCountries;
    });
  };

  const handleSaveCountries = () => {
    const tags = visitedCountries.map((code) => ['country', code]);
    
    publishEvent(
      {
        kind: 30078,
        content: '',
        tags: [
          ['d', 'visited-countries'],
          ...tags,
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Countries saved',
            description: `${visitedCountries.length} countries saved`,
          });
          setHasChanges(false);
        },
        onError: (error) => {
          toast({
            title: 'Failed to save',
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Simple GeoJSON for visited countries (simplified world map)
  const countryGeoJSON: GeoJsonObject | null = useMemo(() => {
    if (visitedCountries.length === 0) return null;
    
    // This is a placeholder - in a real implementation, you'd load actual GeoJSON country boundaries
    // For simplicity, we'll just show markers for visited countries
    return null;
  }, [visitedCountries]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full h-[500px] rounded-lg overflow-hidden">
            <MapContainer
              center={latestCheckIn ? [latestCheckIn.lat, latestCheckIn.lng] : [20, 0]}
              zoom={latestCheckIn ? 4 : 2}
              className="w-full h-full"
              scrollWheelZoom={true}
            >
              <TileLayer {...tileConfig} />
              
              {/* Show check-ins */}
              {checkInLocations.map((checkIn) => (
                <CheckInMarker
                  key={checkIn.id}
                  checkIn={checkIn}
                  userPubkey={userPubkey}
                />
              ))}

              {/* Current location marker (latest check-in) */}
              {latestCheckIn && (
                <Marker
                  position={[latestCheckIn.lat, latestCheckIn.lng]}
                  icon={L.divIcon({
                    html: `
                      <div style="position: relative;">
                        <div style="width: 24px; height: 24px; border-radius: 50%; background: #10b981; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>
                      </div>
                    `,
                    className: 'current-location-marker',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="font-semibold text-sm text-green-600">📍 Current Location</p>
                      <p className="text-xs mt-1">{latestCheckIn.location}</p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {countryGeoJSON && (
                <GeoJSON
                  data={countryGeoJSON}
                  style={{
                    fillColor: '#ffcc00',
                    fillOpacity: 0.3,
                    color: '#f97316',
                    weight: 2,
                  }}
                />
              )}
            </MapContainer>

            {/* Overlay CSS for pulse animation */}
            <style>{`
              @keyframes pulse {
                0%, 100% {
                  opacity: 1;
                  transform: scale(1);
                }
                50% {
                  opacity: 0.6;
                  transform: scale(1.1);
                }
              }
            `}</style>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">
            <MapPin className="w-4 h-4 mr-2" />
            Check-ins ({checkInLocations.length})
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Globe className="w-4 h-4 mr-2" />
            Visited ({visitedCountries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="mt-4">
          <Card>
            <CardContent className="p-4">
              {checkInLocations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">No check-ins yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {latestCheckIn && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border-2 border-green-500">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                        <p className="font-semibold text-sm text-green-700 dark:text-green-300">
                          Current Location
                        </p>
                      </div>
                      <p className="text-sm font-medium">{latestCheckIn.location}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(latestCheckIn.createdAt * 1000), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                  
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2 pr-4">
                      {checkInLocations.slice(latestCheckIn ? 1 : 0).map((checkIn) => (
                        <div
                          key={checkIn.id}
                          className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{checkIn.location}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(checkIn.createdAt * 1000), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="countries" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Select the countries you've visited
                  </p>
                  {hasChanges && (
                    <Button
                      size="sm"
                      onClick={handleSaveCountries}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-2 gap-2 pr-4">
                    {COUNTRIES.map((country) => {
                      const isVisited = visitedCountries.includes(country.code);
                      return (
                        <Button
                          key={country.code}
                          variant={isVisited ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleCountry(country.code)}
                          className="justify-start text-left"
                          style={
                            isVisited
                              ? { backgroundColor: '#ffcc00', color: '#000' }
                              : undefined
                          }
                        >
                          {isVisited && <Check className="w-4 h-4 mr-2" />}
                          {country.name}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>

                {visitedCountries.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100"
                      >
                        {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'} visited
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
