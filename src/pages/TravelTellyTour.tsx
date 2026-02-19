import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useTravelTellyTour } from "@/hooks/useTravelTellyTour";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RelaySelector } from "@/components/RelaySelector";

export default function TravelTellyTour() {
  const { data: tourItems, isLoading } = useTravelTellyTour();
  const navigate = useNavigate();

  // Handler to navigate to the feed view of a specific post
  const handleItemClick = (eventId: string) => {
    // Navigate to a feed view showing this specific post
    // For now, we'll create a simple route that shows the event
    navigate(`/tour-feed/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                TravelTelly Tour
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exclusive photos and videos from around the world, curated by TravelTelly
            </p>
          </div>

          {/* Grid of Photos and Videos */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          ) : tourItems && tourItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tourItems.map((item) => {
                // Get all media (images + videos)
                const allMedia = [...item.images, ...item.videos];
                
                return allMedia.map((mediaUrl, idx) => {
                  const isVideo = item.videos.includes(mediaUrl);
                  
                  return (
                    <div
                      key={`${item.id}-${idx}`}
                      className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all"
                      onClick={() => handleItemClick(item.id)}
                    >
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt="Travel photo"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      )}
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <Globe className="w-3 h-3 text-white" />
                            </div>
                            <p className="text-white text-xs font-medium line-clamp-2">
                              {item.content.slice(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Video indicator */}
                      {isVideo && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          VIDEO
                        </div>
                      )}
                    </div>
                  );
                });
              })}
            </div>
          ) : (
            <div className="col-span-full">
              <Card className="border-dashed">
                <div className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-6">
                    <Globe className="w-12 h-12 text-gray-400 mx-auto" />
                    <p className="text-muted-foreground">
                      No TravelTelly Tour content found. Try switching relays?
                    </p>
                    <RelaySelector className="w-full" />
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
