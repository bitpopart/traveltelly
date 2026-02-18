import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { WorldMapImage } from '@/components/WorldMapImage';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { COUNTRIES, COUNTRIES_BY_CONTINENT, CONTINENTS, type Country } from '@/lib/countries';
import { Globe, Loader2, Check, Search, X } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface VisitedCountriesMapProps {
  visitedCountriesEvent?: NostrEvent | null;
}

export function VisitedCountriesMap({ visitedCountriesEvent }: VisitedCountriesMapProps) {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');

  useEffect(() => {
    setVisitedCountries(savedVisitedCountries);
    setHasChanges(false);
  }, [savedVisitedCountries]);

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
            title: 'Countries saved!',
            description: `${visitedCountries.length} ${visitedCountries.length === 1 ? 'country' : 'countries'} saved successfully`,
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

  // Filter countries by search and continent
  const filteredCountries = useMemo(() => {
    let countries = COUNTRIES;
    
    if (selectedContinent !== 'All') {
      countries = COUNTRIES_BY_CONTINENT[selectedContinent] || [];
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      countries = countries.filter((country) =>
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query)
      );
    }
    
    return countries;
  }, [searchQuery, selectedContinent]);

  // Calculate statistics by continent
  const continentStats = useMemo(() => {
    const stats: Record<string, { total: number; visited: number }> = {};
    
    CONTINENTS.forEach((continent) => {
      const continentCountries = COUNTRIES_BY_CONTINENT[continent] || [];
      const visitedInContinent = continentCountries.filter((c) =>
        visitedCountries.includes(c.code)
      ).length;
      
      stats[continent] = {
        total: continentCountries.length,
        visited: visitedInContinent,
      };
    });
    
    return stats;
  }, [visitedCountries]);

  const totalCountries = COUNTRIES.length;
  const visitedPercentage = Math.round((visitedCountries.length / totalCountries) * 100);

  return (
    <div className="space-y-4">
      {/* World Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your Travel Map</CardTitle>
          <p className="text-sm text-muted-foreground">
            Countries in yellow are places you've visited
          </p>
        </CardHeader>
        <CardContent>
          <WorldMapImage
            visitedCountries={visitedCountries}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Statistics Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Visited Countries
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track where you've been around the world
              </p>
            </div>
            {hasChanges && (
              <Button
                onClick={handleSaveCountries}
                disabled={isPublishing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {visitedCountries.length}
              </div>
              <div className="text-sm text-muted-foreground">Countries Visited</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                {visitedPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Of World</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Object.values(continentStats).filter((s) => s.visited > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">Continents</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-orange-600">
                {totalCountries - visitedCountries.length}
              </div>
              <div className="text-sm text-muted-foreground">To Explore</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Continent Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Continents Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONTINENTS.map((continent) => {
              const stats = continentStats[continent];
              const percentage = stats.total > 0 
                ? Math.round((stats.visited / stats.total) * 100) 
                : 0;
              
              return (
                <div key={continent} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{continent}</span>
                    <span className="text-muted-foreground">
                      {stats.visited}/{stats.total} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Country Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Countries</CardTitle>
          <div className="flex gap-2 mt-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search countries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button
              variant={selectedContinent === 'All' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedContinent('All')}
              className={selectedContinent === 'All' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              All
            </Button>
            {CONTINENTS.map((continent) => (
              <Button
                key={continent}
                variant={selectedContinent === continent ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContinent(continent)}
                className={selectedContinent === continent ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {continent}
                {continentStats[continent].visited > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {continentStats[continent].visited}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-4">
              {filteredCountries.map((country) => {
                const isVisited = visitedCountries.includes(country.code);
                return (
                  <Button
                    key={country.code}
                    variant={isVisited ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleCountry(country.code)}
                    className={`justify-start text-left h-auto py-3 ${
                      isVisited
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {isVisited && <Check className="w-4 h-4 flex-shrink-0" />}
                      <span className="flex-1">{country.name}</span>
                      <span className="text-xs opacity-60 flex-shrink-0">
                        {country.code}
                      </span>
                    </div>
                  </Button>
                );
              })}
            </div>
            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <Globe className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No countries found matching "{searchQuery}"
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Visited Countries Summary */}
      {visitedCountries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Travel Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {visitedCountries
                .map((code) => COUNTRIES.find((c) => c.code === code))
                .filter((c): c is Country => c !== undefined)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((country) => (
                  <Badge
                    key={country.code}
                    variant="secondary"
                    className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 cursor-pointer"
                    onClick={() => toggleCountry(country.code)}
                  >
                    {country.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
