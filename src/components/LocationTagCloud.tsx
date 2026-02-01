import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocationTags, type LocationTag } from '@/hooks/useLocationTags';
import { MapPin, Globe } from 'lucide-react';

interface LocationTagCloudProps {
  onTagClick: (tag: string, type: 'country' | 'city') => void;
  selectedTag?: string;
}

export function LocationTagCloud({ onTagClick, selectedTag }: LocationTagCloudProps) {
  const { data: locationData, isLoading } = useLocationTags();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-600" />
            Popular Destinations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!locationData || locationData.all.length === 0) {
    return null;
  }

  // Get top locations (mix of countries and cities)
  const topLocations = locationData.all.slice(0, 25);

  // Calculate font sizes based on count
  const maxCount = Math.max(...topLocations.map(loc => loc.count));
  const minCount = Math.min(...topLocations.map(loc => loc.count));
  
  const getFontSize = (count: number): string => {
    if (maxCount === minCount) return 'text-base';
    
    const normalized = (count - minCount) / (maxCount - minCount);
    
    if (normalized > 0.8) return 'text-xl';
    if (normalized > 0.6) return 'text-lg';
    if (normalized > 0.4) return 'text-base';
    if (normalized > 0.2) return 'text-sm';
    return 'text-xs';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-orange-600" />
          Popular Destinations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 items-center">
          {topLocations.map((location) => {
            const isSelected = selectedTag === location.tag;
            const fontSize = getFontSize(location.count);
            
            return (
              <Button
                key={location.tag}
                variant={isSelected ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTagClick(location.tag, location.type)}
                className={`
                  ${fontSize}
                  ${isSelected 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-orange-900/20'
                  }
                  transition-all duration-200 rounded-full
                `}
              >
                {location.type === 'country' ? (
                  <Globe className="w-3 h-3 mr-1" />
                ) : (
                  <MapPin className="w-3 h-3 mr-1" />
                )}
                {location.tag}
                <Badge 
                  variant="secondary" 
                  className={`ml-2 ${isSelected ? 'bg-white/20' : ''}`}
                >
                  {location.count}
                </Badge>
              </Button>
            );
          })}
        </div>
        
        {selectedTag && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onTagClick('', 'country')}
              className="text-muted-foreground"
            >
              ✕ Clear filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
