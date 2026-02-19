import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { WorldReviewsMap } from "@/components/WorldReviewsMap";
import { AllAdminReviewsMap } from "@/components/AllAdminReviewsMap";
import { RelaySelector } from "@/components/RelaySelector";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Star, Camera, Image as ImageIcon, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAllImages } from "@/hooks/useAllImages";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLatestReviews, useLatestStories, useLatestTrips, useLatestStockMediaItems, useReviewCount, useStoryCount, useTripCount, useStockMediaCount } from "@/hooks/useLatestItems";
import { ZapAuthorButton } from "@/components/ZapAuthorButton";
import { nip19 } from "nostr-tools";

export default function WorldMap() {
  const [viewMode, setViewMode] = useState<'map' | 'images'>('map');
  const { data: images, isLoading: imagesLoading } = useAllImages();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  
  // Get counts and latest items for homepage simulation
  const reviewCount = useReviewCount();
  const { data: storyCount = 0 } = useStoryCount();
  const { data: stockMediaCount = 0 } = useStockMediaCount();
  const { data: tripCount = 0 } = useTripCount();
  const { data: latestReviews = [] } = useLatestReviews();
  const { data: latestStories = [] } = useLatestStories();
  const { data: latestTrips = [] } = useLatestTrips();
  const { data: latestStockMediaItems = [] } = useLatestStockMediaItems();

  const getDestinationPath = (item: { naddr: string; type: string; eventId?: string }) => {
    // Handle tour type differently (no naddr, uses eventId)
    if (item.type === 'tour' && item.eventId) {
      return `/tour-feed/${item.eventId}`;
    }

    try {
      const decoded = nip19.decode(item.naddr);
      if (decoded.type !== 'naddr') return '/';

      switch (item.type) {
        case 'review':
          return `/review/${item.naddr}`;
        case 'trip':
          return `/trip/${item.naddr}`;
        case 'story':
          return `/story/${item.naddr}`;
        case 'stock':
          return `/stock-media/${item.naddr}`;
        default:
          return '/';
      }
    } catch (error) {
      console.error('Error decoding naddr:', error);
      return '/';
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      
      {/* Reviews Map - Full width on mobile directly under fixed header */}
      {viewMode === 'map' && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-10">
          <AllAdminReviewsMap showTitle={false} />
        </div>
      )}

      {/* Spacer for mobile to push content below map */}
      {viewMode === 'map' && <div className="md:hidden h-96" />}

      <div className="container mx-auto px-2 md:px-4 md:py-8 md:pt-24">
        <div className="max-w-6xl mx-auto">
          
          {/* Toggle View Button - Single Round Slider - Centered at top */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center bg-gray-200 dark:bg-gray-700 rounded-full p-1 gap-1 shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('map')}
                className={`rounded-full w-12 h-12 transition-all ${
                  viewMode === 'map' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title="World Map"
              >
                <Globe className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('images')}
                className={`rounded-full w-12 h-12 transition-all ${
                  viewMode === 'images' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
                title="Images Grid"
              >
                <ImageIcon className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/traveltelly-tour')}
                className="rounded-full w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all"
                title="TravelTelly Tour"
              >
                <Globe className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* User Controls Card - Zap button */}
          {user && (
            <Card className="shadow-lg mb-6 md:mb-8 overflow-visible">
              <CardContent className="p-4 md:p-8 overflow-visible">
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-0">
                  <ZapAuthorButton
                    authorPubkey="7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35"
                    showAuthorName={false}
                    variant="default"
                    size="lg"
                    className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 md:px-8 py-3 h-auto"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Feature Cards - Desktop Only */}
          <div className="hidden md:block mb-6 md:mb-8">
            <div className="grid md:grid-cols-4 gap-3 md:gap-4 w-full">
              {/* Reviews Card */}
              <Link to="/reviews" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    {latestReviews[0]?.image ? (
                      <>
                        <OptimizedImage
                          src={latestReviews[0].image}
                          alt="Latest Review"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          blurUp={true}
                          thumbnail={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: '#27b0ff' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: latestReviews[0]?.image ? '#27b0ff' : 'rgba(255,255,255,0.2)' }}>
                        <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl text-white mb-1 drop-shadow-lg">Reviews</h3>
                      {reviewCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-white/90">
                          {reviewCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Stories Card */}
              <Link to="/stories" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    {latestStories[0]?.image ? (
                      <>
                        <OptimizedImage
                          src={latestStories[0].image}
                          alt="Latest Story"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          blurUp={true}
                          thumbnail={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: '#b2d235' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: latestStories[0]?.image ? '#b2d235' : 'rgba(255,255,255,0.2)' }}>
                        <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl text-white mb-1 drop-shadow-lg">Stories</h3>
                      {storyCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-white/90">
                          {storyCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Trips Card */}
              <Link to="/trips" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    {latestTrips[0]?.image ? (
                      <>
                        <OptimizedImage
                          src={latestTrips[0].image}
                          alt="Latest Trip"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          blurUp={true}
                          thumbnail={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: '#ffcc00' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: latestTrips[0]?.image ? '#ffcc00' : 'rgba(255,255,255,0.2)' }}>
                        <MapPin className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl text-white mb-1 drop-shadow-lg">Trips</h3>
                      {tripCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-white/90">
                          {tripCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Stock Media Card */}
              <Link to="/marketplace" className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden group">
                    {latestStockMediaItems[0]?.image ? (
                      <>
                        <OptimizedImage
                          src={latestStockMediaItems[0].image}
                          alt="Latest Stock Media"
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          blurUp={true}
                          thumbnail={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: '#ec1a58' }} />
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: latestStockMediaItems[0]?.image ? '#ec1a58' : 'rgba(255,255,255,0.2)' }}>
                        <Camera className="w-6 h-6 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl text-white mb-1 drop-shadow-lg">Stock Media</h3>
                      {stockMediaCount > 0 && (
                        <Badge variant="secondary" className="text-xs bg-white/90">
                          {stockMediaCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>

          {/* Content Area - Map or Images */}
          {viewMode === 'map' ? (
            <>
              {/* Desktop Map */}
              <div className="hidden md:block mb-8">
                <AllAdminReviewsMap showTitle={true} />
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
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>
                  {user ? 'Your Travel Photos' : 'Community Travel Photos'}
                </CardTitle>
                <CardDescription>
                  {user 
                    ? 'All photos from your reviews, trips, stories, and stock media'
                    : 'Latest photos from reviews, trips, stories, stock media, and TravelTelly Tour'
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
                    {images.map((item, index) => {
                      const isTour = item.type === 'tour';
                      const isVideo = item.image.toLowerCase().match(/\.(mp4|webm|mov)$/);
                      
                      return (
                        <div
                          key={`${item.naddr || item.eventId}-${index}`}
                          className={`group relative aspect-square overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 transition-all ${
                            isTour ? 'hover:border-purple-500' : 'hover:border-blue-500'
                          }`}
                          onClick={() => navigate(getDestinationPath(item))}
                        >
                          {isVideo ? (
                            <video
                              src={item.image}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              {isTour && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Globe className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="text-white text-xs font-semibold">TravelTelly Tour</span>
                                </div>
                              )}
                              <p className="text-white text-sm font-medium line-clamp-2 mb-1">
                                {item.title}
                              </p>
                              <p className="text-white/80 text-xs capitalize">
                                {item.type}
                              </p>
                            </div>
                          </div>
                          {isVideo && (
                            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              VIDEO
                            </div>
                          )}
                        </div>
                      );
                    })}
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

        </div>
      </div>
    </div>
  );
}