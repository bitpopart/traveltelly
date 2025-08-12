import { SimpleMapDemo } from '@/components/SimpleMapDemo';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Code, Zap } from 'lucide-react';

export function SimpleMapDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            OpenStreetMap Navigation Demo
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience instant navigation to major cities worldwide with our interactive OpenStreetMap integration.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="w-3 h-3" />
            OpenStreetMap
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Instant Navigation
          </Badge>
          <Badge variant="outline">
            React Leaflet
          </Badge>
        </div>
      </div>

      {/* Demo */}
      <SimpleMapDemo />

      {/* Footer */}
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Features Demonstrated</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p className="font-medium">Button Controls</p>
                <p className="text-muted-foreground">
                  Simple button interface for quick navigation to predefined locations
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <p className="font-medium">Smooth Animation</p>
                <p className="text-muted-foreground">
                  Watch the map smoothly animate between different locations with zoom control
                </p>
              </div>
              <div className="space-y-2">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <p className="font-medium">Location Pins</p>
                <p className="text-muted-foreground">
                  Interactive markers with popups showing location information
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}