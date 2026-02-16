import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WorldReviewsMap } from "@/components/WorldReviewsMap";
import { RelaySelector } from "@/components/RelaySelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Globe, Star, Camera, Image as ImageIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAllImages } from "@/hooks/useAllImages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { nip19 } from "nostr-tools";

export default function WorldMap() {
  const [viewMode, setViewMode] = useState<'map' | 'images'>('map');
  const { data: images, isLoading: imagesLoading } = useAllImages();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const getDestinationPath = (naddr: string, type: string) => {
    try {
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') return '/';

      switch (type) {
        case 'review':
          return `/review/${naddr}`;
        case 'trip':
          return `/trip/${naddr}`;
        case 'story':
          return `/story/${naddr}`;
        case 'stock':
          return `/stock-media/${naddr}`;
        default:
          return '/';
      }
    } catch (error) {
      console.error('Error decoding naddr:', error);
      return '/';
    }
  };

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
                {viewMode === 'map' ? 'World Reviews Map' : 'Travel Images'}
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {viewMode === 'map' 
                ? 'Explore reviews from around the globe with infinite scroll'
                : user 
                  ? 'Your travel photos from reviews, trips, stories, and stock media'
                  : 'Latest travel photos from the community'
              }
            </p>
            
            {/* Toggle View Button */}
            <div className="flex justify-center gap-2 mb-6">
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setViewMode('map')}
                className={viewMode === 'map' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <Globe className="w-4 h-4 mr-2" />
                World Map
              </Button>
              <Button
                variant={viewMode === 'images' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setViewMode('images')}
                className={viewMode === 'images' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Images
              </Button>
            </div>

            {viewMode === 'map' && (
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
            )}
          </div>

          {/* Features Info - Only show in map view */}
          {viewMode === 'map' && (
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
          )}

          {/* Content Area - Map or Images */}
          {viewMode === 'map' ? (
            <WorldReviewsMap />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {user ? 'Your Travel Photos' : 'Community Travel Photos'}
                </CardTitle>
                <CardDescription>
                  {user 
                    ? 'All photos from your reviews, trips, stories, and stock media'
                    : 'Latest uploaded photos from reviews, trips, stories, and stock media'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {imagesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-lg" />
                    ))}
                  </div>
                ) : images && images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((item, index) => (
                      <div
                        key={`${item.naddr}-${index}`}
                        className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all"
                        onClick={() => navigate(getDestinationPath(item.naddr, item.type))}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                              {item.title}
                            </p>
                            <p className="text-white/80 text-xs capitalize">
                              {item.type}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-6">
                      {user 
                        ? "You haven't uploaded any photos yet. Start by creating a review, trip, story, or adding stock media!"
                        : "No images found. Try switching relays to see content from other communities."
                      }
                    </p>
                    {!user && <RelaySelector className="w-full max-w-md mx-auto" />}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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

          {/* Map Legend - Only show in map view */}
          {viewMode === 'map' && (
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
          )}


        </div>
      </div>
    </div>
  );
}