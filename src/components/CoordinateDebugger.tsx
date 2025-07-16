import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import * as geohash from 'ngeohash';
import { getCoordinateHistory, clearCoordinateHistory, analyzeCoordinateDrift, type CoordinateVerification } from '@/lib/coordinateVerification';

interface CoordinateTest {
  original: { lat: number; lng: number };
  encoded: string;
  decoded: { lat: number; lng: number };
  precision: number;
  accuracy: string;
  distance: number;
}

export function CoordinateDebugger() {
  const [testLat, setTestLat] = useState('40.7128');
  const [testLng, setTestLng] = useState('-74.0060');
  const [results, setResults] = useState<CoordinateTest[]>([]);
  const [history, setHistory] = useState<CoordinateVerification[]>([]);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c * 1000; // Convert to meters
  };

  const getAccuracyDescription = (precision: number): string => {
    const accuracyMap: Record<number, string> = {
      1: "±2500 km",
      2: "±630 km",
      3: "±78 km",
      4: "±20 km",
      5: "±2.4 km",
      6: "±610 m",
      7: "±76 m",
      8: "±19 m",
      9: "±2.4 m",
      10: "±60 cm",
    };
    return accuracyMap[precision] || "Unknown";
  };

  const runTest = () => {
    const lat = parseFloat(testLat);
    const lng = parseFloat(testLng);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid coordinates');
      return;
    }

    const testResults: CoordinateTest[] = [];

    for (let precision = 5; precision <= 10; precision++) {
      const encoded = geohash.encode(lat, lng, precision);
      const decoded = geohash.decode(encoded);
      const distance = calculateDistance(lat, lng, decoded.latitude, decoded.longitude);

      testResults.push({
        original: { lat, lng },
        encoded,
        decoded: { lat: decoded.latitude, lng: decoded.longitude },
        precision,
        accuracy: getAccuracyDescription(precision),
        distance,
      });
    }

    setResults(testResults);
  };

  const getDistanceColor = (distance: number): string => {
    if (distance < 10) return 'bg-green-100 text-green-800';
    if (distance < 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const refreshHistory = () => {
    setHistory(getCoordinateHistory());
  };

  const clearHistory = () => {
    clearCoordinateHistory();
    setHistory([]);
  };

  const analyzeDrift = () => {
    analyzeCoordinateDrift();
  };

  // Auto-refresh history every 2 seconds
  useEffect(() => {
    const interval = setInterval(refreshHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>🧪 Coordinate Accuracy Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="testLat">Latitude</Label>
            <Input
              id="testLat"
              value={testLat}
              onChange={(e) => setTestLat(e.target.value)}
              placeholder="40.7128"
            />
          </div>
          <div>
            <Label htmlFor="testLng">Longitude</Label>
            <Input
              id="testLng"
              value={testLng}
              onChange={(e) => setTestLng(e.target.value)}
              placeholder="-74.0060"
            />
          </div>
        </div>

        <Button onClick={runTest} className="w-full">
          Test Geohash Accuracy
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Results:</h4>
            <div className="text-sm text-muted-foreground">
              Original: {results[0].original.lat.toFixed(8)}, {results[0].original.lng.toFixed(8)}
            </div>

            {results.map((result) => (
              <div key={result.precision} className="border rounded p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Precision {result.precision}</span>
                  <Badge variant="outline">{result.accuracy}</Badge>
                </div>

                <div className="text-sm space-y-1">
                  <div>Geohash: <code className="bg-gray-100 px-1 rounded">{result.encoded}</code></div>
                  <div>Decoded: {result.decoded.lat.toFixed(8)}, {result.decoded.lng.toFixed(8)}</div>
                  <div className="flex items-center gap-2">
                    <span>Distance error:</span>
                    <Badge className={getDistanceColor(result.distance)}>
                      {result.distance.toFixed(1)}m
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            <div className="text-xs text-muted-foreground mt-4">
              <strong>Recommendation:</strong> For location-based reviews, precision 8 (±19m accuracy)
              provides building-level accuracy while keeping geohash strings manageable.
            </div>
          </div>
        )}

        <Separator className="my-6" />

        {/* Coordinate History Tracking */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">📍 Coordinate Flow Tracking</h4>
            <div className="flex gap-2">
              <Button onClick={refreshHistory} variant="outline" size="sm">
                Refresh
              </Button>
              <Button onClick={analyzeDrift} variant="outline" size="sm">
                Analyze Drift
              </Button>
              <Button onClick={clearHistory} variant="destructive" size="sm">
                Clear
              </Button>
            </div>
          </div>

          {history.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4 border border-dashed rounded">
              No coordinate tracking data yet. Upload a photo or select a location to start tracking.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((entry, index) => (
                <div key={index} className="border rounded p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{entry.step}</span>
                    <Badge variant="outline" className="text-xs">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div>Lat: {entry.coordinates.lat.toFixed(8)}</div>
                    <div>Lng: {entry.coordinates.lng.toFixed(8)}</div>
                    <div>Source: {entry.source}</div>
                  </div>
                  {index > 0 && (
                    <div className="mt-2 pt-2 border-t">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Drift from previous: </span>
                        <Badge className={getDistanceColor(
                          calculateDistance(
                            history[index - 1].coordinates.lat,
                            history[index - 1].coordinates.lng,
                            entry.coordinates.lat,
                            entry.coordinates.lng
                          ) * 1000
                        )}>
                          {(calculateDistance(
                            history[index - 1].coordinates.lat,
                            history[index - 1].coordinates.lng,
                            entry.coordinates.lat,
                            entry.coordinates.lng
                          ) * 1000).toFixed(1)}m
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <strong>Real-time tracking:</strong> This panel automatically updates as coordinates
            flow through the system. Check the browser console for detailed logs.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}