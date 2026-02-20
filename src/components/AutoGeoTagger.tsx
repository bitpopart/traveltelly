import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAllMediaAssets } from '@/hooks/useMediaManagement';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { CONTINENTS, getCountriesByContinent, getAllCountries } from '@/lib/geoData';
import { FolderTree, Wand2, CheckCircle2, AlertCircle, Loader2, Globe2 } from 'lucide-react';
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

  const handleAutoTag = async () => {
    const itemsToProcess = suggestions.filter(s => 
      selectedItems.has(s.product.id) && s.suggestedContinent && s.suggestedCountry
    );

    if (itemsToProcess.length === 0) {
      toast({
        title: 'No Items Selected',
        description: 'Please select items to auto-tag.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);

    for (let i = 0; i < itemsToProcess.length; i++) {
      const { product, suggestedContinent, suggestedCountry } = itemsToProcess[i];

      try {
        // Preserve ALL existing tags
        const preservedTags = product.event.tags.filter(([name]) => {
          // Don't preserve old geographical tags if they exist
          const geoTags = ['continent', 'country', 'geo_folder'];
          return !geoTags.includes(name);
        });

        // Add new geographical tags
        const newTags = [
          ['continent', suggestedContinent!],
          ['country', suggestedCountry!],
          ['geo_folder', `${suggestedContinent}/${suggestedCountry}`],
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
      title: 'Auto-Tagging Complete! 🎉',
      description: `Successfully tagged ${itemsToProcess.length} media items with geographical data.`,
    });

    // Clear selections
    setSelectedItems(new Set());
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
            <Wand2 className="w-5 h-5 text-blue-600" />
            Auto-Tag Geographical Locations
          </CardTitle>
          <CardDescription>
            Automatically assign continent and country tags to existing media based on location data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl font-bold text-blue-600">{mediaWithoutGeo.length}</div>
              <div className="text-xs text-muted-foreground">Without Geo Tags</div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-2xl font-bold text-green-600">{highConfidence.length}</div>
              <div className="text-xs text-muted-foreground">High Confidence</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="text-2xl font-bold text-yellow-600">{mediumConfidence.length}</div>
              <div className="text-xs text-muted-foreground">Medium Confidence</div>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
              <div className="text-2xl font-bold text-gray-600">{lowConfidence.length}</div>
              <div className="text-xs text-muted-foreground">Manual Required</div>
            </div>
          </div>

          {/* Selection Actions */}
          {suggestions.length > 0 && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={isProcessing}
              >
                Select All Auto-Detected ({highConfidence.length + mediumConfidence.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeselectAll}
                disabled={isProcessing}
              >
                Deselect All
              </Button>
              <Badge variant="secondary">
                {selectedItems.size} selected
              </Badge>
            </div>
          )}

          {/* Process Button */}
          {selectedItems.size > 0 && (
            <div className="space-y-3">
              <Button
                onClick={handleAutoTag}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing {processedCount}/{selectedItems.size}...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Auto-Tag {selectedItems.size} Selected Items
                  </>
                )}
              </Button>

              {isProcessing && (
                <Progress value={progress} className="h-2" />
              )}
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>How it works:</strong> This tool analyzes your existing media's location field and title
              to automatically detect the country and continent. Review suggestions below and select items to auto-tag.
              All existing data (images, tags, metadata) will be preserved.
            </AlertDescription>
          </Alert>

          {/* Suggestions List */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse flex items-center gap-4">
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
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {suggestions.map((suggestion) => {
                const isSelected = selectedItems.has(suggestion.product.id);
                const hasGeoData = suggestion.suggestedContinent && suggestion.suggestedCountry;

                return (
                  <Card
                    key={suggestion.product.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                    } ${
                      suggestion.confidence === 'high' ? 'border-green-200' :
                      suggestion.confidence === 'medium' ? 'border-yellow-200' :
                      'border-gray-200'
                    }`}
                    onClick={() => hasGeoData && handleToggleItem(suggestion.product.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        {hasGeoData && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleItem(suggestion.product.id)}
                            className="mt-1 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}

                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {suggestion.product.images[0] ? (
                            <img
                              src={suggestion.product.images[0]}
                              alt={suggestion.product.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                              📸
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate mb-1">
                            {suggestion.product.title}
                          </h4>
                          
                          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            {suggestion.product.location && (
                              <span>📍 {suggestion.product.location}</span>
                            )}
                            {suggestion.product.price && (
                              <span>• {suggestion.product.price} {suggestion.product.currency}</span>
                            )}
                          </div>

                          {/* Suggestion */}
                          {hasGeoData ? (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant={
                                  suggestion.confidence === 'high' ? 'default' :
                                  suggestion.confidence === 'medium' ? 'secondary' :
                                  'outline'
                                }
                                className={
                                  suggestion.confidence === 'high' ? 'bg-green-600' :
                                  suggestion.confidence === 'medium' ? 'bg-yellow-600' :
                                  ''
                                }
                              >
                                {suggestion.confidence === 'high' ? '✓' : 
                                 suggestion.confidence === 'medium' ? '~' : '?'} {suggestion.confidence}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs">
                                <Globe2 className="w-3 h-3" />
                                <span className="font-medium">
                                  {CONTINENTS.find(c => c.value === suggestion.suggestedContinent)?.label}
                                  {' → '}
                                  {getCountriesByContinent(suggestion.suggestedContinent!).find(c => c.value === suggestion.suggestedCountry)?.label}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                ❌ Manual Assignment Needed
                              </Badge>
                            </div>
                          )}

                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.reason}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Assignment Section */}
      {lowConfidence.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription>
            <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
              {lowConfidence.length} items need manual assignment
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-200">
              These items don't have detectable location data. Edit them individually to add continent and country tags.
              Use the "Edit" button on each media item in the list below.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
