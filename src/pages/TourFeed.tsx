import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useTravelTellyTour } from "@/hooks/useTravelTellyTour";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteContent } from "@/components/NoteContent";
import { ZapAuthorButton } from "@/components/ZapAuthorButton";
import { useAuthor } from "@/hooks/useAuthor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { genUserName } from "@/lib/genUserName";

export default function TourFeed() {
  const { eventId } = useParams<{ eventId: string }>();
  const { data: tourItems, isLoading } = useTravelTellyTour();
  
  // Find the specific item
  const item = tourItems?.find((i) => i.id === eventId);
  const author = useAuthor(item?.event.pubkey || '');
  const metadata = author.data?.metadata;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto space-y-4">
            <Skeleton className="h-8 w-32" />
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-96 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navigation />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-muted-foreground mb-4">Post not found</p>
            <Button asChild>
              <Link to="/traveltelly-tour">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tour
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayName = metadata?.name || metadata?.display_name || genUserName(item.event.pubkey);
  const profileImage = metadata?.picture;
  const allMedia = [...item.images, ...item.videos];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/traveltelly-tour">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to TravelTelly Tour
            </Link>
          </Button>

          {/* Post Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    {profileImage && <AvatarImage src={profileImage} alt={displayName} />}
                    <AvatarFallback>
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </p>
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Globe className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.created_at * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <ZapAuthorButton 
                  authorPubkey={item.event.pubkey}
                  showAuthorName={false}
                  size="sm"
                />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Content */}
              <div className="whitespace-pre-wrap break-words text-gray-900 dark:text-gray-100">
                <NoteContent event={item.event} className="text-sm" />
              </div>

              {/* Media Grid */}
              {allMedia.length > 0 && (
                <div className={`grid gap-4 ${
                  allMedia.length === 1 ? 'grid-cols-1' : 
                  allMedia.length === 2 ? 'grid-cols-2' : 
                  'grid-cols-2 md:grid-cols-3'
                }`}>
                  {allMedia.map((mediaUrl, idx) => {
                    const isVideo = item.videos.includes(mediaUrl);
                    
                    return (
                      <div
                        key={idx}
                        className={`relative overflow-hidden rounded-lg ${
                          allMedia.length === 1 ? 'aspect-video' : 'aspect-square'
                        }`}
                      >
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            controls
                            className="w-full h-full object-cover"
                            playsInline
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`Media ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hashtags */}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                  #traveltelly
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
