import React from 'react';
import { GpsCorrectionManager } from '@/components/GpsCorrectionManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Camera, MapPin, Zap, CheckCircle } from 'lucide-react';

export function GpsCorrectionDemo() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Target className="w-8 h-8 text-orange-600" />
            GPS Correction System
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Automatically improve location accuracy of low-precision markers using GPS data extracted from photos
          </p>
        </div>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How GPS Correction Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">1. Identify</h3>
                  <p className="text-sm text-muted-foreground">
                    Find reviews with low precision location markers (precision &lt; 6)
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">2. Extract</h3>
                  <p className="text-sm text-muted-foreground">
                    Extract GPS coordinates from photos attached to those reviews
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-medium">3. Correct</h3>
                  <p className="text-sm text-muted-foreground">
                    Replace low-precision coordinates with high-precision photo GPS data
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium">4. Improve</h3>
                  <p className="text-sm text-muted-foreground">
                    Achieve meter-level accuracy from kilometer-level precision
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Precision Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Geohash Precision Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { precision: 1, accuracy: "±2500 km", color: "red", status: "Very Low" },
                { precision: 2, accuracy: "±630 km", color: "red", status: "Very Low" },
                { precision: 3, accuracy: "±78 km", color: "orange", status: "Low" },
                { precision: 4, accuracy: "±20 km", color: "orange", status: "Low" },
                { precision: 5, accuracy: "±2.4 km", color: "yellow", status: "Medium" },
                { precision: 6, accuracy: "±610 m", color: "yellow", status: "Medium" },
                { precision: 7, accuracy: "±76 m", color: "green", status: "Good" },
                { precision: 8, accuracy: "±19 m", color: "green", status: "High" },
                { precision: 9, accuracy: "±2.4 m", color: "blue", status: "Very High" },
              ].map((level) => (
                <div key={level.precision} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">P{level.precision}</Badge>
                    <span className="text-sm">{level.accuracy}</span>
                  </div>
                  <Badge 
                    variant={level.precision >= 7 ? "default" : "secondary"}
                    className={
                      level.color === "red" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                      level.color === "orange" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                      level.color === "yellow" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                      level.color === "green" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }
                  >
                    {level.status}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Target:</strong> The GPS correction system aims to upgrade all markers to precision 8 (±19m accuracy) 
                using high-precision GPS data from photos.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* GPS Correction Manager */}
        <GpsCorrectionManager />

        {/* Benefits */}
        <Card>
          <CardHeader>
            <CardTitle>Benefits of GPS Correction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">Accuracy Improvements</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Upgrade from ±2.4km to ±19m accuracy
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Precise location mapping on interactive maps
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Better location-based search and discovery
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Confidence scoring for correction quality
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Technical Features</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automatic EXIF GPS data extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Support for JPEG, HEIC, and TIFF formats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Batch processing of multiple markers
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Distance validation and error detection
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Step 1: Identify Low Precision Markers</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Click "Identify Low Precision" to scan all reviews and find markers with precision less than 6.
                </p>
              </div>

              <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                <h4 className="font-medium text-green-900 dark:text-green-100">Step 2: Process GPS Corrections</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Click "Correct with Photos" to automatically extract GPS data from photos and apply corrections.
                </p>
              </div>

              <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                <h4 className="font-medium text-purple-900 dark:text-purple-100">Step 3: Review Results</h4>
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  Check the "Corrections" tab to see all applied corrections with confidence scores and accuracy improvements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}