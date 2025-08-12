import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Navigation,
  Compass
} from 'lucide-react';

export interface MapLocation {
  name: string;
  coordinates: [number, number]; // [lat, lng]
  zoom: number;
  description?: string;
  emoji?: string;
}

export interface MapRegion {
  name: string;
  locations: MapLocation[];
  emoji?: string;
}

// Predefined regions and countries with their coordinates
export const MAP_REGIONS: MapRegion[] = [
  {
    name: "North America",
    emoji: "🌎",
    locations: [
      { name: "United States", coordinates: [39.8283, -98.5795], zoom: 4, emoji: "🇺🇸", description: "Continental United States" },
      { name: "Canada", coordinates: [56.1304, -106.3468], zoom: 4, emoji: "🇨🇦", description: "Great White North" },
      { name: "Mexico", coordinates: [23.6345, -102.5528], zoom: 5, emoji: "🇲🇽", description: "Estados Unidos Mexicanos" },
      { name: "New York City", coordinates: [40.7128, -74.0060], zoom: 10, emoji: "🗽", description: "The Big Apple" },
      { name: "Los Angeles", coordinates: [34.0522, -118.2437], zoom: 10, emoji: "🌴", description: "City of Angels" },
      { name: "Toronto", coordinates: [43.6532, -79.3832], zoom: 10, emoji: "🍁", description: "Canada's largest city" },
    ]
  },
  {
    name: "Europe",
    emoji: "🇪🇺",
    locations: [
      { name: "United Kingdom", coordinates: [55.3781, -3.4360], zoom: 6, emoji: "🇬🇧", description: "Great Britain and Northern Ireland" },
      { name: "France", coordinates: [46.2276, 2.2137], zoom: 6, emoji: "🇫🇷", description: "République française" },
      { name: "Germany", coordinates: [51.1657, 10.4515], zoom: 6, emoji: "🇩🇪", description: "Deutschland" },
      { name: "Italy", coordinates: [41.8719, 12.5674], zoom: 6, emoji: "🇮🇹", description: "Italia" },
      { name: "Spain", coordinates: [40.4637, -3.7492], zoom: 6, emoji: "🇪🇸", description: "España" },
      { name: "Netherlands", coordinates: [52.1326, 5.2913], zoom: 7, emoji: "🇳🇱", description: "Nederland" },
      { name: "London", coordinates: [51.5074, -0.1278], zoom: 10, emoji: "🏰", description: "Capital of England" },
      { name: "Paris", coordinates: [48.8566, 2.3522], zoom: 11, emoji: "🗼", description: "City of Light" },
      { name: "Berlin", coordinates: [52.5200, 13.4050], zoom: 10, emoji: "🏛️", description: "German capital" },
      { name: "Rome", coordinates: [41.9028, 12.4964], zoom: 10, emoji: "🏛️", description: "Eternal City" },
    ]
  },
  {
    name: "Asia",
    emoji: "🌏",
    locations: [
      { name: "China", coordinates: [35.8617, 104.1954], zoom: 4, emoji: "🇨🇳", description: "People's Republic of China" },
      { name: "Japan", coordinates: [36.2048, 138.2529], zoom: 5, emoji: "🇯🇵", description: "Land of the Rising Sun" },
      { name: "India", coordinates: [20.5937, 78.9629], zoom: 5, emoji: "🇮🇳", description: "Republic of India" },
      { name: "South Korea", coordinates: [35.9078, 127.7669], zoom: 7, emoji: "🇰🇷", description: "Republic of Korea" },
      { name: "Thailand", coordinates: [15.8700, 100.9925], zoom: 6, emoji: "🇹🇭", description: "Kingdom of Thailand" },
      { name: "Singapore", coordinates: [1.3521, 103.8198], zoom: 11, emoji: "🇸🇬", description: "Lion City" },
      { name: "Tokyo", coordinates: [35.6762, 139.6503], zoom: 10, emoji: "🗼", description: "Japanese capital" },
      { name: "Beijing", coordinates: [39.9042, 116.4074], zoom: 10, emoji: "🏯", description: "Chinese capital" },
      { name: "Mumbai", coordinates: [19.0760, 72.8777], zoom: 10, emoji: "🏙️", description: "Financial capital of India" },
      { name: "Seoul", coordinates: [37.5665, 126.9780], zoom: 10, emoji: "🏙️", description: "Korean capital" },
    ]
  },
  {
    name: "Oceania",
    emoji: "🌊",
    locations: [
      { name: "Australia", coordinates: [-25.2744, 133.7751], zoom: 4, emoji: "🇦🇺", description: "Land Down Under" },
      { name: "New Zealand", coordinates: [-40.9006, 174.8860], zoom: 6, emoji: "🇳🇿", description: "Aotearoa" },
      { name: "Sydney", coordinates: [-33.8688, 151.2093], zoom: 10, emoji: "🏙️", description: "Harbour City" },
      { name: "Melbourne", coordinates: [-37.8136, 144.9631], zoom: 10, emoji: "☕", description: "Cultural capital" },
      { name: "Auckland", coordinates: [-36.8485, 174.7633], zoom: 10, emoji: "⛵", description: "City of Sails" },
    ]
  },
  {
    name: "South America",
    emoji: "🌎",
    locations: [
      { name: "Brazil", coordinates: [-14.2350, -51.9253], zoom: 4, emoji: "🇧🇷", description: "República Federativa do Brasil" },
      { name: "Argentina", coordinates: [-38.4161, -63.6167], zoom: 4, emoji: "🇦🇷", description: "República Argentina" },
      { name: "Chile", coordinates: [-35.6751, -71.5430], zoom: 4, emoji: "🇨🇱", description: "República de Chile" },
      { name: "Colombia", coordinates: [4.5709, -74.2973], zoom: 5, emoji: "🇨🇴", description: "República de Colombia" },
      { name: "São Paulo", coordinates: [-23.5505, -46.6333], zoom: 10, emoji: "🏙️", description: "Largest city in Brazil" },
      { name: "Buenos Aires", coordinates: [-34.6118, -58.3960], zoom: 10, emoji: "💃", description: "Capital of Argentina" },
      { name: "Rio de Janeiro", coordinates: [-22.9068, -43.1729], zoom: 10, emoji: "🏖️", description: "Cidade Maravilhosa" },
    ]
  },
  {
    name: "Africa",
    emoji: "🌍",
    locations: [
      { name: "South Africa", coordinates: [-30.5595, 22.9375], zoom: 5, emoji: "🇿🇦", description: "Rainbow Nation" },
      { name: "Egypt", coordinates: [26.8206, 30.8025], zoom: 6, emoji: "🇪🇬", description: "Land of the Pharaohs" },
      { name: "Nigeria", coordinates: [9.0820, 8.6753], zoom: 6, emoji: "🇳🇬", description: "Giant of Africa" },
      { name: "Kenya", coordinates: [-0.0236, 37.9062], zoom: 6, emoji: "🇰🇪", description: "Republic of Kenya" },
      { name: "Morocco", coordinates: [31.7917, -7.0926], zoom: 6, emoji: "🇲🇦", description: "Kingdom of Morocco" },
      { name: "Cape Town", coordinates: [-33.9249, 18.4241], zoom: 10, emoji: "🏔️", description: "Mother City" },
      { name: "Cairo", coordinates: [30.0444, 31.2357], zoom: 10, emoji: "🏛️", description: "City of a Thousand Minarets" },
      { name: "Lagos", coordinates: [6.5244, 3.3792], zoom: 10, emoji: "🏙️", description: "Commercial capital of Nigeria" },
    ]
  },
];

// Special world views
export const WORLD_VIEWS: MapLocation[] = [
  { name: "World View", coordinates: [20, 0], zoom: 2, emoji: "🌍", description: "Global overview" },
  { name: "Europe Focus", coordinates: [54, 15], zoom: 4, emoji: "🇪🇺", description: "European continent" },
  { name: "Asia Focus", coordinates: [30, 100], zoom: 3, emoji: "🌏", description: "Asian continent" },
  { name: "Americas Focus", coordinates: [15, -90], zoom: 3, emoji: "🌎", description: "North and South America" },
  { name: "Africa Focus", coordinates: [0, 20], zoom: 3, emoji: "🌍", description: "African continent" },
];

interface MapNavigationControlsProps {
  onLocationSelect: (location: MapLocation) => void;
  className?: string;
}

export function MapNavigationControls({ onLocationSelect, className }: MapNavigationControlsProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());
  const [showWorldViews, setShowWorldViews] = useState(false);

  const toggleRegion = (regionName: string) => {
    const newExpanded = new Set(expandedRegions);
    if (newExpanded.has(regionName)) {
      newExpanded.delete(regionName);
    } else {
      newExpanded.add(regionName);
    }
    setExpandedRegions(newExpanded);
  };

  const handleLocationClick = (location: MapLocation) => {
    onLocationSelect(location);
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Navigation className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-lg">Map Navigation</h3>
        </div>

        <ScrollArea className="h-80">
          <div className="space-y-3">
            {/* World Views Section */}
            <div>
              <Button
                variant="ghost"
                className="w-full justify-between p-2 h-auto"
                onClick={() => setShowWorldViews(!showWorldViews)}
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">World Views</span>
                </div>
                {showWorldViews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
              
              {showWorldViews && (
                <div className="ml-4 mt-2 space-y-1">
                  {WORLD_VIEWS.map((view) => (
                    <Button
                      key={view.name}
                      variant="ghost"
                      className="w-full justify-start p-2 h-auto text-sm"
                      onClick={() => handleLocationClick(view)}
                    >
                      <span className="mr-2">{view.emoji}</span>
                      <div className="text-left">
                        <div className="font-medium">{view.name}</div>
                        {view.description && (
                          <div className="text-xs text-muted-foreground">{view.description}</div>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Regions and Countries */}
            {MAP_REGIONS.map((region) => (
              <div key={region.name}>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-2 h-auto"
                  onClick={() => toggleRegion(region.name)}
                >
                  <div className="flex items-center gap-2">
                    <span>{region.emoji}</span>
                    <span className="font-medium">{region.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {region.locations.length}
                    </Badge>
                  </div>
                  {expandedRegions.has(region.name) ? 
                    <ChevronUp className="w-4 h-4" /> : 
                    <ChevronDown className="w-4 h-4" />
                  }
                </Button>
                
                {expandedRegions.has(region.name) && (
                  <div className="ml-4 mt-2 space-y-1">
                    {region.locations.map((location) => (
                      <Button
                        key={location.name}
                        variant="ghost"
                        className="w-full justify-start p-2 h-auto text-sm hover:bg-blue-50 dark:hover:bg-blue-950"
                        onClick={() => handleLocationClick(location)}
                      >
                        <span className="mr-2">{location.emoji}</span>
                        <div className="text-left">
                          <div className="font-medium">{location.name}</div>
                          {location.description && (
                            <div className="text-xs text-muted-foreground">{location.description}</div>
                          )}
                        </div>
                        <div className="ml-auto">
                          <MapPin className="w-3 h-3 text-blue-600" />
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <Separator className="my-4" />
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Compass className="w-3 h-3" />
          <span>Click any location to navigate the map</span>
        </div>
      </CardContent>
    </Card>
  );
}