import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { useAllMediaAssets } from '@/hooks/useMediaManagement';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { CONTINENTS, getCountriesByContinent, getAllCountries, getContinentLabel, getCountryLabel } from '@/lib/geoData';
import { FolderTree, Wand2, CheckCircle2, AlertCircle, Loader2, Globe2, FolderPlus } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface GeoSuggestion {
  product: MarketplaceProduct;
  suggestedContinent?: string;
  suggestedCountry?: string;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
}

export function AutoGeoTagger() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [bulkContinent, setBulkContinent] = useState<string>('');
  const [bulkCountry, setBulkCountry] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const { data: allMedia = [], isLoading } = useAllMediaAssets();
  const { mutate: publishEvent } = useNostrPublish();
  const { toast } = useToast();

  // Filter media without geographical tags
  const mediaWithoutGeo = useMemo(() => {
    return allMedia.filter(media => !media.continent || !media.country);
  }, [allMedia]);

  // Generate geographical suggestions based on location field and title
  const suggestions = useMemo((): GeoSuggestion[] => {
    const countryMapping: Record<string, { continent: string; country: string }> = {};
    
    // Build quick lookup map
    getAllCountries().forEach(country => {
      const lowerLabel = country.label.toLowerCase();
      countryMapping[lowerLabel] = {
        continent: country.continent!,
        country: country.value,
      };
      // Also add country code
      countryMapping[country.value.toLowerCase()] = {
        continent: country.continent!,
        country: country.value,
      };
    });

    return mediaWithoutGeo.map(product => {
      const searchText = `${product.title} ${product.location || ''} ${product.description}`.toLowerCase();
      
      // Try to find country match
      for (const [countryKey, geo] of Object.entries(countryMapping)) {
        if (searchText.includes(countryKey)) {
          return {
            product,
            suggestedContinent: geo.continent,
            suggestedCountry: geo.country,
            confidence: product.location?.toLowerCase().includes(countryKey) ? 'high' : 'medium',
            reason: `Found "${countryKey}" in ${product.location ? 'location' : 'title'}`,
          };
        }
      }

      return {
        product,
        confidence: 'low' as const,
        reason: 'No location detected - please assign manually',
      };
    });
  }, [mediaWithoutGeo]);

  const handleToggleItem = (productId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const allIds = suggestions
      .filter(s => s.suggestedContinent && s.suggestedCountry)
      .map(s => s.product.id);
    setSelectedItems(new Set(allIds));
  };

  const handleDeselectAll = () => {
    setSelectedItems(new Set());
  };

  const handleBulkAssign = async () => {
    if (!bulkContinent || !bulkCountry) {
      toast({
        title: 'Select Folder',
        description: 'Please select both continent and country.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedItems.size === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to assign to this folder.',
        variant: 'destructive',
      });
      return;
    }

    const itemsToProcess = mediaWithoutGeo.filter(m => selectedItems.has(m.id));

    setIsProcessing(true);
    setProcessedCount(0);

    for (let i = 0; i < itemsToProcess.length; i++) {
      const product = itemsToProcess[i];

      try {
        // Preserve ALL existing tags
        const preservedTags = product.event.tags.filter(([name]) => {
          // Don't preserve old geographical tags if they exist
          const geoTags = ['continent', 'country', 'geo_folder'];
          return !geoTags.includes(name);
        });

        // Add new geographical tags
        const newTags = [
          ['continent', bulkContinent],
          ['country', bulkCountry],
          ['geo_folder', `${bulkContinent}/${bulkCountry}`],
        ];

        // Combine all tags
        const allTags = [...preservedTags, ...newTags];

        // Publish updated event
        await new Promise<void>((resolve) => {
          publishEvent({
            kind: 30402,
            content: product.event.content,
            tags: allTags,
          });
          setTimeout(resolve, 500); // Small delay between publishes
        });

        setProcessedCount(i + 1);
      } catch (error) {
        console.error(`Failed to tag ${product.title}:`, error);
      }
    }

    setIsProcessing(false);
    toast({
      title: 'Bulk Assignment Complete! 🎉',
      description: `Successfully assigned ${itemsToProcess.length} items to ${getContinentLabel(bulkContinent)} → ${getCountryLabel(bulkCountry)}.`,
    });

    // Clear selections
    setSelectedItems(new Set());
    setBulkContinent('');
    setBulkCountry('');
  };

  const highConfidence = suggestions.filter(s => s.confidence === 'high');
  const mediumConfidence = suggestions.filter(s => s.confidence === 'medium');
  const lowConfidence = suggestions.filter(s => s.confidence === 'low');

  const progress = processedCount > 0 
    ? (processedCount / selectedItems.size) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-blue-600" />
            Bulk Folder Assignment
          </CardTitle>
          <CardDescription>
            Select multiple items and assign them to a geographical folder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600">{mediaWithoutGeo.length}</div>
              <div className="text-xs text-muted-foreground">Items Without Folders</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600">{highConfidence.length}</div>
              <div className="text-xs text-muted-foreground">Auto-Detected</div>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-2xl font-bold text-purple-600">{selectedItems.size}</div>
              <div className="text-xs text-muted-foreground">Selected</div>
            </div>
          </div>

          {/* Bulk Folder Selection */}
          {mediaWithoutGeo.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div>
                <h3 className="font-semibold text-sm mb-3">📁 Assign Selected Items to Folder</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Continent</Label>
                    <Select value={bulkContinent} onValueChange={(value) => {
                      setBulkContinent(value);
                      setBulkCountry('');
                    }}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select continent" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTINENTS.map((continent) => (
                          <SelectItem key={continent.value} value={continent.value}>
                            {continent.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Country</Label>
                    <Select 
                      value={bulkCountry} 
                      onValueChange={setBulkCountry}
                      disabled={!bulkContinent}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder={bulkContinent ? "Select country" : "Select continent first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkContinent && getCountriesByContinent(bulkContinent).map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {bulkContinent && bulkCountry && (
                  <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200">
                    <div className="flex items-center gap-2 text-xs text-green-900 dark:text-green-100">
                      <Globe2 className="w-3 h-3" />
                      <span className="font-medium">
                        Will assign to: 📂 {getContinentLabel(bulkContinent)} → {getCountryLabel(bulkCountry)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleBulkAssign}
                disabled={isProcessing || !bulkContinent || !bulkCountry || selectedItems.size === 0}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning {processedCount}/{selectedItems.size}...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 mr-2" />
                    Assign {selectedItems.size} Items to Folder
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="h-2" />
              )}
            </div>
          )}

          {/* Selection Actions */}
          {suggestions.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isProcessing}
              >
                Select Suggested ({highConfidence.length + mediumConfidence.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={isProcessing}
              >
                Deselect All
              </Button>
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm space-y-2">
              <p><strong>How it works:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Select items below (checkboxes)</li>
                <li>Choose a continent and country above</li>
                <li>Click "Assign to Folder" to organize them</li>
                <li>Items with detected locations are pre-suggested ✓</li>
              </ol>
              <p className="text-xs">All existing data (images, tags, metadata) will be preserved.</p>
            </AlertDescription>
          </Alert>

          {/* Items List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="animate-pulse flex items-center gap-3">
                      <div className="h-12 w-12 bg-gray-200 rounded" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <CardContent className="py-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-green-600 mb-3" />
                <p className="font-medium text-green-900 dark:text-green-100">
                  All media has geographical tags! 🎉
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Every item in your marketplace is properly organized.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto border rounded-lg p-3">
              <div className="flex items-center justify-between mb-3 sticky top-0 bg-white dark:bg-gray-950 pb-2 border-b">
                <span className="text-sm font-medium">Select items to organize:</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={isProcessing}
                  >
                    Select Suggested ({highConfidence.length + mediumConfidence.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={isProcessing}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {suggestions.map((suggestion) => {
                const isSelected = selectedItems.has(suggestion.product.id);

                return (
                  <div
                    key={suggestion.product.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200'
                    }`}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleItem(suggestion.product.id)}
                        className="flex-shrink-0"
                      />
                    </div>

                    {/* Thumbnail */}
                    <div className="flex-shrink-0">
                      {suggestion.product.images[0] ? (
                        <img
                          src={suggestion.product.images[0]}
                          alt={suggestion.product.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-lg">
                          📸
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {suggestion.product.title}
                      </h4>
                      
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {suggestion.product.location && (
                          <span className="text-xs text-muted-foreground">📍 {suggestion.product.location}</span>
                        )}
                        
                        {suggestion.suggestedContinent && suggestion.suggestedCountry ? (
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              suggestion.confidence === 'high' ? 'bg-green-100 text-green-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {suggestion.confidence === 'high' ? '✓' : '~'} Suggests: {getCountryLabel(suggestion.suggestedCountry)}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">No location data</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
