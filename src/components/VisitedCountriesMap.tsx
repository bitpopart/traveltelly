import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WorldMapImage } from '@/components/WorldMapImage';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { COUNTRIES, COUNTRIES_BY_CONTINENT, CONTINENTS, type Country } from '@/lib/countries';
import { Globe, Loader2, Check, Search, X, Trash2 } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface VisitedCountriesMapProps {
  visitedCountriesEvent?: NostrEvent | null;
}

export function VisitedCountriesMap({ visitedCountriesEvent }: VisitedCountriesMapProps) {
  const { mutate: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

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
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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
          // Invalidate the visited countries query to refresh the map
          if (user?.pubkey) {
            queryClient.invalidateQueries({ queryKey: ['visited-countries', user.pubkey] });
          }
          
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

  const handleResetCountries = () => {
    setIsResetting(true);
    
    // Clear all countries by publishing an empty event
    publishEvent(
      {
        kind: 30078,
        content: '',
        tags: [
          ['d', 'visited-countries'],
          // No country tags = empty list
        ],
      },
      {
        onSuccess: () => {
          // Invalidate the visited countries query to refresh the map
          if (user?.pubkey) {
            queryClient.invalidateQueries({ queryKey: ['visited-countries', user.pubkey] });
          }
          
          setVisitedCountries([]);
          setHasChanges(false);
          setIsResetting(false);
          setShowResetDialog(false);
          
          toast({
            title: 'Map reset!',
            description: 'All visited countries have been cleared',
          });
        },
        onError: (error) => {
          setIsResetting(false);
          setShowResetDialog(false);
          
          toast({
            title: 'Failed to reset',
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
        <CardContent className="p-0">
          <WorldMapImage
            key={visitedCountries.join(',')}
            visitedCountries={visitedCountries}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Compact Country Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Action buttons */}
            <div className="flex gap-2">
              {/* Save button if changes */}
              {hasChanges && (
                <Button
                  onClick={handleSaveCountries}
                  disabled={isPublishing}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save {visitedCountries.length} Countries
                    </>
                  )}
                </Button>
              )}
              
              {/* Reset button - only show if there are saved countries */}
              {savedVisitedCountries.length > 0 && (
                <Button
                  onClick={() => setShowResetDialog(true)}
                  disabled={isPublishing}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Map
                </Button>
              )}
            </div>

            {/* Search */}
            <div className="relative">
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

            {/* Continent filters - compact */}
            <div className="flex gap-1 flex-wrap text-xs">
              <Button
                variant={selectedContinent === 'All' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedContinent('All')}
                className={`h-7 text-xs ${selectedContinent === 'All' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                All
              </Button>
              {CONTINENTS.map((continent) => (
                <Button
                  key={continent}
                  variant={selectedContinent === continent ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedContinent(continent)}
                  className={`h-7 text-xs ${selectedContinent === continent ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  {continent.split(' ')[0]}
                  {continentStats[continent].visited > 0 && (
                    <span className="ml-1">({continentStats[continent].visited})</span>
                  )}
                </Button>
              ))}
            </div>

            {/* Country list - compact */}
            <ScrollArea className="h-[250px]">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {filteredCountries.map((country) => {
                  const isVisited = visitedCountries.includes(country.code);
                  return (
                    <Button
                      key={country.code}
                      variant={isVisited ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleCountry(country.code)}
                      className={`justify-start text-left h-auto py-2 text-xs ${
                        isVisited
                          ? 'bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-1 w-full">
                        {isVisited && <Check className="w-3 h-3 flex-shrink-0" />}
                        <span className="flex-1 truncate">{country.name}</span>
                      </div>
                    </Button>
                  );
                })}
              </div>
              {filteredCountries.length === 0 && (
                <div className="text-center py-8">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    No countries found
                  </p>
                </div>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog 
        open={showResetDialog} 
        onOpenChange={(open) => {
          // Don't allow closing while resetting
          if (!isResetting) {
            setShowResetDialog(open);
          }
        }}
      >
        <AlertDialogContent onEscapeKeyDown={(e) => isResetting && e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your travel map?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear all {savedVisitedCountries.length} visited {savedVisitedCountries.length === 1 ? 'country' : 'countries'} from your map. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetCountries}
              disabled={isResetting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Reset Map
                </>
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
