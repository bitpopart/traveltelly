import React, { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/useToast';
import {
  MapPin,
  Camera,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Target
} from 'lucide-react';
import {
  identifyLowPrecisionMarkers,
  getGpsCorrectionStats,
  type LowPrecisionMarker,
  type PhotoGpsCorrection
} from '@/lib/photoGpsCorrection';

export function GpsCorrectionManager() {
  const [corrections, setCorrections] = useState<PhotoGpsCorrection[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [lowPrecisionMarkers, setLowPrecisionMarkers] = useState<LowPrecisionMarker[]>([]);

  const { nostr } = useNostr();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch reviews with location data
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ['reviews-for-gps-correction'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([
        { kinds: [34879], limit: 100 }, // Review events
        { kinds: [1], '#t': ['review'], limit: 100 } // Regular notes tagged as reviews
      ], { signal });

      // Filter events that have geohash tags
      return events.filter(event =>
        event.tags.some(([name]) => name === 'g')
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Identify low precision markers
  const identifyMarkers = useCallback(() => {
    if (!reviews.length) return;

    const markers = identifyLowPrecisionMarkers(reviews, 6); // Precision threshold of 6
    setLowPrecisionMarkers(markers);

    toast({
      title: 'Analysis Complete',
      description: `Found ${markers.length} low precision markers, ${markers.filter(m => m.hasPhotos).length} with photos.`,
    });
  }, [reviews, toast]);

  // Process GPS corrections
  const processCorrections = useCallback(async () => {
    if (!lowPrecisionMarkers.length) {
      toast({
        title: 'No markers to process',
        description: 'Please identify low precision markers first.',
        variant: 'destructive',
      });
      return;
    }

    const markersWithPhotos = lowPrecisionMarkers.filter(m => m.hasPhotos);
    if (!markersWithPhotos.length) {
      toast({
        title: 'No photos available',
        description: 'No markers have photos available for GPS correction.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const maxCorrections = Math.min(markersWithPhotos.length, 10);
      const newCorrections: PhotoGpsCorrection[] = [];

      for (let i = 0; i < maxCorrections; i++) {
        const marker = markersWithPhotos[i];
        setProcessingProgress((i / maxCorrections) * 100);

        try {
          // Import the correction function dynamically to avoid blocking
          const { correctMarkerWithPhotoGps } = await import('@/lib/photoGpsCorrection');
          const correction = await correctMarkerWithPhotoGps(marker, 8);

          if (correction) {
            newCorrections.push(correction);
          }
        } catch (error) {
          console.error(`Error processing marker ${marker.reviewId}:`, error);
        }
      }

      setCorrections(prev => [...prev, ...newCorrections]);
      setProcessingProgress(100);

      toast({
        title: 'GPS Correction Complete',
        description: `Successfully corrected ${newCorrections.length} out of ${maxCorrections} markers.`,
      });

      // Invalidate map queries to refresh with corrections
      queryClient.invalidateQueries({ queryKey: ['reviews'] });

    } catch (error) {
      console.error('Error processing GPS corrections:', error);
      toast({
        title: 'Processing Failed',
        description: 'An error occurred while processing GPS corrections.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  }, [lowPrecisionMarkers, toast, queryClient]);

  const stats = getGpsCorrectionStats(corrections);
  const markersWithPhotos = lowPrecisionMarkers.filter(m => m.hasPhotos);
  // const highConfidenceCorrections = corrections.filter(c => c.confidence > 0.7);

  if (isLoadingReviews) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            GPS Correction Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            GPS Correction Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reviews.length}</div>
              <div className="text-sm text-muted-foreground">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{lowPrecisionMarkers.length}</div>
              <div className="text-sm text-muted-foreground">Low Precision</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{corrections.length}</div>
              <div className="text-sm text-muted-foreground">Corrected</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={identifyMarkers}
              disabled={!reviews.length}
              variant="outline"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Identify Low Precision
            </Button>
            <Button
              onClick={processCorrections}
              disabled={!markersWithPhotos.length || isProcessing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Correct with Photos
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Processing GPS corrections...</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <Progress value={processingProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="markers">Low Precision Markers</TabsTrigger>
          <TabsTrigger value="corrections">Corrections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistics */}
          {stats.totalCorrections > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Correction Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.totalCorrections}</div>
                    <div className="text-sm text-muted-foreground">Total Corrections</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.averageDistanceCorrection.toFixed(0)}m</div>
                    <div className="text-sm text-muted-foreground">Avg Distance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{(stats.averageConfidence * 100).toFixed(0)}%</div>
                    <div className="text-sm text-muted-foreground">Avg Confidence</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.highConfidenceCorrections}</div>
                    <div className="text-sm text-muted-foreground">High Confidence</div>
                  </div>
                </div>

                {Object.keys(stats.precisionDistribution).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Precision Improvements</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.precisionDistribution).map(([improvement, count]) => (
                        <div key={improvement} className="flex justify-between items-center">
                          <span className="text-sm">{improvement}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Alerts */}
          {lowPrecisionMarkers.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {lowPrecisionMarkers.length} low precision markers.
                {markersWithPhotos.length > 0 && (
                  <> {markersWithPhotos.length} have photos available for GPS correction.</>
                )}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="markers" className="space-y-4">
          {lowPrecisionMarkers.length > 0 ? (
            <div className="grid gap-4">
              {lowPrecisionMarkers.map((marker) => (
                <Card key={marker.reviewId}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Precision {marker.precision}</Badge>
                          <Badge variant="secondary">{marker.accuracy}</Badge>
                          {marker.hasPhotos && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <Camera className="w-3 h-3 mr-1" />
                              {marker.photoUrls.length} photo{marker.photoUrls.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Coordinates: {marker.coordinates.lat.toFixed(6)}, {marker.coordinates.lng.toFixed(6)}</div>
                          <div>Geohash: {marker.geohash}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        {marker.hasPhotos ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No low precision markers identified yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Identify Low Precision" to analyze reviews.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="corrections" className="space-y-4">
          {corrections.length > 0 ? (
            <div className="grid gap-4">
              {corrections.map((correction) => (
                <Card key={correction.reviewId}>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {correction.originalPrecision} → {correction.correctedPrecision}
                            </Badge>
                            <Badge
                              variant={correction.confidence > 0.7 ? "default" : "secondary"}
                              className={correction.confidence > 0.7 ? "bg-green-600" : ""}
                            >
                              {(correction.confidence * 100).toFixed(0)}% confidence
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Distance correction: {correction.distanceCorrection.toFixed(2)}m
                          </div>
                        </div>
                        <Zap className="w-5 h-5 text-orange-500" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Original</div>
                          <div className="text-muted-foreground">
                            {correction.originalCoordinates.lat.toFixed(6)}, {correction.originalCoordinates.lng.toFixed(6)}
                          </div>
                          <div className="text-xs text-muted-foreground">{correction.originalGeohash}</div>
                        </div>
                        <div>
                          <div className="font-medium">Corrected</div>
                          <div className="text-muted-foreground">
                            {correction.photoGpsCoordinates.latitude.toFixed(6)}, {correction.photoGpsCoordinates.longitude.toFixed(6)}
                          </div>
                          <div className="text-xs text-muted-foreground">{correction.correctedGeohash}</div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Accuracy: {correction.accuracyImprovement}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-muted-foreground">No GPS corrections applied yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Process markers with photos to see corrections here.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}