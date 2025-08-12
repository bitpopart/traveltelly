import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, Navigation, MapPin } from 'lucide-react';
import { useEffect } from 'react';

// Fix for Leaflet default markers
import L from 'leaflet';
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapLocation {
  name: string;
  coordinates: [number, number];
  zoom: number;
  emoji?: string;
  description?: string;
}

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

// Sample locations for demonstration
const SAMPLE_LOCATIONS: MapLocation[] = [
  { name: "New York", coordinates: [40.7128, -74.0060], zoom: 10, emoji: "🗽", description: "The Big Apple" },
  { name: "London", coordinates: [51.5074, -0.1278], zoom: 10, emoji: "🏰", description: "Capital of England" },
  { name: "Tokyo", coordinates: [35.6762, 139.6503], zoom: 10, emoji: "🗼", description: "Japanese capital" },
  { name: "Sydney", coordinates: [-33.8688, 151.2093], zoom: 10, emoji: "🏙️", description: "Harbour City" },
  { name: "Paris", coordinates: [48.8566, 2.3522], zoom: 11, emoji: "🗼", description: "City of Light" },
  { name: "World View", coordinates: [20, 0], zoom: 2, emoji: "🌍", description: "Global overview" },
];

export function SimpleMapDemo() {
  const [targetLocation, setTargetLocation] = useState<MapLocation | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('World View');

  const handleLocationSelect = (location: MapLocation) => {
    setTargetLocation(location);
    setCurrentLocation(location.name);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Interactive Map with Country Navigation</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Click any button to navigate to different locations on OpenStreetMap
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              Currently viewing: {currentLocation}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg">Quick Navigation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {SAMPLE_LOCATIONS.map((location) => (
              <Button
                key={location.name}
                variant="outline"
                size="sm"
                onClick={() => handleLocationSelect(location)}
                className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <span className="text-lg">{location.emoji}</span>
                <span className="text-xs font-medium">{location.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <CardTitle className="text-lg">OpenStreetMap</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 w-full rounded-lg overflow-hidden">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController targetLocation={targetLocation} />
              
              {/* Sample markers for demonstration */}
              {SAMPLE_LOCATIONS.filter(loc => loc.name !== 'World View').map((location) => (
                <Marker key={location.name} position={location.coordinates}>
                  <Popup>
                    <div className="text-center">
                      <div className="text-lg mb-1">{location.emoji}</div>
                      <div className="font-semibold">{location.name}</div>
                      <div className="text-sm text-gray-600">{location.description}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {SAMPLE_LOCATIONS.length - 1} sample locations shown
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Click navigation buttons to explore different regions
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Navigation className="w-8 h-8 text-blue-600 mx-auto" />
              <h3 className="font-semibold">Instant Navigation</h3>
              <p className="text-sm text-muted-foreground">
                Jump to any location with smooth animated transitions
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <Globe className="w-8 h-8 text-green-600 mx-auto" />
              <h3 className="font-semibold">OpenStreetMap</h3>
              <p className="text-sm text-muted-foreground">
                Powered by the world's most comprehensive open map data
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <MapPin className="w-8 h-8 text-purple-600 mx-auto" />
              <h3 className="font-semibold">Smart Zoom</h3>
              <p className="text-sm text-muted-foreground">
                Automatically adjusts zoom level for optimal viewing
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}