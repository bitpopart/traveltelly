import { Navigation } from "@/components/Navigation";
import { WorldReviewsMap } from "@/components/WorldReviewsMap";
import { RelaySelector } from "@/components/RelaySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Star, Camera } from "lucide-react";
import { Link } from "react-router-dom";

export default function WorldMap() {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Globe className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                World Reviews Map
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Explore reviews from around the globe with infinite scroll
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/create-review">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Your Review
                </Button>
              </Link>
              <Link to="/reviews">
                <Button variant="outline" size="lg">
                  <Star className="w-4 h-4 mr-2" />
                  Browse All Reviews
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Info */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                  <MapPin className="w-5 h-5" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore reviews on an interactive world map with precise GPS locations and visual rating indicators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Globe className="w-5 h-5" />
                  Infinite Scroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reviews load automatically as you scroll down, showing more locations from around the world.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                  <Star className="w-5 h-5" />
                  Smart Markers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Color-coded markers show ratings at a glance, with special indicators for GPS-corrected and upgraded locations.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* World Map */}
          <WorldReviewsMap />

          {/* Relay Configuration */}
          <Card className="mt-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>Relay Configuration</CardTitle>
              <CardDescription>
                Switch relays to discover reviews from different Nostr communities around the world
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelaySelector className="w-full max-w-md" />
            </CardContent>
          </Card>

          {/* Map Legend */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Map Legend</CardTitle>
              <CardDescription>
                Understanding the map markers and their meanings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Rating Colors</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm">4-5 stars (Excellent)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">3 stars (Good)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm">1-2 stars (Poor)</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Special Indicators</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-green-500 rounded-full bg-green-100"></div>
                      <span className="text-sm">📷 GPS Corrected from Photo</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded-full bg-blue-100"></div>
                      <span className="text-sm">↑ Precision Upgraded</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-red-400 border-dashed rounded-full"></div>
                      <span className="text-sm">Low Precision Location</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
}