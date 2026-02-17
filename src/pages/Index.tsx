import { useSeoMeta } from '@unhead/react';
import { useState, memo } from 'react';
import { Navigation as NavigationComponent } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { LoginArea } from "@/components/auth/LoginArea";
import { RelaySelector } from "@/components/RelaySelector";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AllAdminReviewsMap } from "@/components/AllAdminReviewsMap";
import { AdminDebugInfo } from "@/components/AdminDebugInfo";
import { UnifiedSearchBar } from "@/components/UnifiedSearchBar";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { LocationTagCloud } from "@/components/LocationTagCloud";
import { LocationContentGrid } from "@/components/LocationContentGrid";
import { CreateTripForm } from "@/components/CreateTripForm";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReviewPermissions } from "@/hooks/useReviewPermissions";
import { useLatestReview, useLatestStory, useLatestStockMedia, useLatestTrip, useReviewCount, useStoryCount, useStockMediaCount, useTripCount, useLatestReviews, useLatestStories, useLatestTrips, useLatestStockMediaItems } from "@/hooks/useLatestItems";
import { useAllImages } from "@/hooks/useAllImages";
import { useViewMode } from "@/contexts/ViewModeContext";
import { MapPin, Star, Camera, Zap, Shield, BookOpen, Search, Navigation, FileImage, ArrowRight, Calendar, MessageCircle } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ZapAuthorButton } from "@/components/ZapAuthorButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuthor } from "@/hooks/useAuthor";
import { genUserName } from "@/lib/genUserName";
import { formatDistanceToNow } from "date-fns";
import { getShortNpub } from "@/lib/nostrUtils";
import { ZapButton } from "@/components/ZapButton";
import { useReviewComments } from "@/hooks/useReviewComments";
import type { NostrEvent } from '@nostrify/nostrify';

// Separate card components to avoid hooks in map functions
interface ReviewCardProps {
  review: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
  priority?: boolean; // For eager loading of first image
}

const ReviewCard = memo(function ReviewCard({ review, priority = false }: ReviewCardProps) {
  const author = useAuthor(review.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(review.event.pubkey);
  const shortNpub = getShortNpub(review.event.pubkey);
  
  const rating = parseInt(review.event.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.event.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.event.tags.find(([name]) => name === 'location')?.[1] || '';
  const { data: comments = [] } = useReviewComments(review.event.id);
  
  const hashtags = review.event.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter(Boolean)
    .slice(0, 3);

  const categoryEmojis: Record<string, string> = {
    'grocery-store': '🛒', 'clothing-store': '👕', 'electronics-store': '📱',
    'convenience-store': '🏪', 'restaurant': '🍽️', 'cafe': '☕', 'fast-food': '🍔',
    'bar-pub': '🍺', 'hotel': '🏨', 'motel': '🏨', 'hostel': '🏠',
    'landmarks': '🏛️', 'bank': '🏦', 'salon-spa': '💅', 'car-repair': '🔧',
    'laundry': '🧺', 'hospital': '🏥', 'clinic': '🏥', 'pharmacy': '💊',
    'dentist': '🦷', 'park': '🌳', 'beach': '🏖️', 'playground': '🛝',
    'hiking-trail': '🥾', 'cycling-trail': '🚴', 'museum': '🏛️',
    'movie-theater': '🎬', 'zoo': '🦁', 'music-venue': '🎵',
    'school': '🏫', 'library': '📚', 'post-office': '📮',
    'police-station': '👮', 'gas-station': '⛽', 'bus-stop': '🚌',
    'train-station': '🚂', 'parking-lot': '🅿️', 'church': '⛪',
    'mosque': '🕌', 'temple': '🛕', 'synagogue': '✡️', 'shrine': '⛩️'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {review.image && (
        <Link to={`/review/${review.naddr}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <OptimizedImage
              src={review.image}
              alt={review.title}
              className="w-full h-full object-cover"
              blurUp={true}
              thumbnail={true}
              priority={priority}
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={metadata?.picture} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">{shortNpub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(review.event.created_at * 1000), { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryEmojis[category] || '📍'}</span>
            <h3 className="font-bold text-lg">{review.title}</h3>
          </div>
          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-orange-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">({rating}/5)</span>
          </div>
          {location && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </div>
          )}
        </div>

        {review.event.content && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>{review.event.content.length > 120 ? review.event.content.substring(0, 120) + '...' : review.event.content}</p>
          </div>
        )}

        {/* Tags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-4">
            <ZapButton
              authorPubkey={review.event.pubkey}
              event={review.event}
              className="text-xs"
            />
            {comments.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                <MessageCircle className="w-3 h-3 mr-1" />
                {comments.length}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {category.replace('-', ' ')}
            </Badge>
            <Link to={`/review/${review.naddr}`}>
              <Button size="sm" variant="outline" className="rounded-full text-xs">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

interface StoryCardProps {
  story: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}

const StoryCard = memo(function StoryCard({ story }: StoryCardProps) {
  const author = useAuthor(story.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(story.event.pubkey);
  const shortNpub = getShortNpub(story.event.pubkey);
  
  const location = story.event.tags.find(([name]) => name === 'location')?.[1];
  const summary = story.event.tags.find(([name]) => name === 'summary')?.[1];
  const publishedAt = story.event.tags.find(([name]) => name === 'published_at')?.[1];
  const displayDate = publishedAt ? new Date(parseInt(publishedAt) * 1000) : new Date(story.event.created_at * 1000);
  
  const topicTags = story.event.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter(tag => tag && !['travel', 'traveltelly'].includes(tag))
    .slice(0, 2);

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {story.image && (
        <Link to={`/story/${story.naddr}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <OptimizedImage
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover"
              blurUp={true}
              thumbnail={true}
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={metadata?.picture} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">{shortNpub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(displayDate, { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">{story.title}</h3>
          {location && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              {location}
            </div>
          )}
          {summary && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{summary}</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2 flex-wrap">
            {topicTags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-gray-50 dark:bg-gray-900/20 text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
          <Link to={`/story/${story.naddr}`}>
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              Read Story
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

interface TripCardProps {
  trip: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}

const TripCard = memo(function TripCard({ trip }: TripCardProps) {
  const author = useAuthor(trip.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(trip.event.pubkey);
  const shortNpub = getShortNpub(trip.event.pubkey);
  
  const summary = trip.event.tags.find(([name]) => name === 'summary')?.[1];
  const startDate = trip.event.tags.find(([name]) => name === 'start')?.[1];
  const endDate = trip.event.tags.find(([name]) => name === 'end')?.[1];
  const imageCount = trip.event.tags.filter(([name]) => name === 'image').length;

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {trip.image && (
        <Link to={`/trip/${trip.naddr}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <OptimizedImage
              src={trip.image}
              alt={trip.title}
              className="w-full h-full object-cover"
              blurUp={true}
              thumbnail={true}
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={metadata?.picture} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">{shortNpub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(trip.event.created_at * 1000), { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">{trip.title}</h3>
          {summary && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">{summary}</p>
          )}
          {(startDate || endDate) && (
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="w-3 h-3 mr-1" />
              {startDate && new Date(parseInt(startDate) * 1000).toLocaleDateString()}
              {endDate && ` - ${new Date(parseInt(endDate) * 1000).toLocaleDateString()}`}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            {imageCount > 1 && (
              <Badge variant="outline" className="text-xs">
                <Camera className="w-3 h-3 mr-1" />
                {imageCount} photos
              </Badge>
            )}
          </div>
          <Link to={`/trip/${trip.naddr}`}>
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              View Trip
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

interface MediaCardProps {
  media: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
  priority?: boolean; // For eager loading of first image
}

const MediaCard = memo(function MediaCard({ media, priority = false }: MediaCardProps) {
  const author = useAuthor(media.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(media.event.pubkey);
  const shortNpub = getShortNpub(media.event.pubkey);
  
  const price = media.event.tags.find(([name]) => name === 'price');
  const priceAmount = price && price[1] ? parseFloat(price[1]) : 0;
  const priceCurrency = price && price[2] ? price[2].toUpperCase() : 'SATS';
  const summary = media.event.tags.find(([name]) => name === 'summary')?.[1];
  const mediaType = media.event.tags.find(([name]) => name === 't')?.[1] || 'photo';

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      {media.image && (
        <Link to={`/media/preview/${media.naddr}`} className="block">
          <div className="relative aspect-[4/3] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <OptimizedImage
              src={media.image}
              alt={media.title}
              className="w-full h-full object-cover"
              blurUp={true}
              thumbnail={true}
              priority={priority}
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={metadata?.picture} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground">{shortNpub}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDistanceToNow(new Date(media.event.created_at * 1000), { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-bold text-lg mb-2">{media.title}</h3>
          {summary && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{summary}</p>
          )}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {mediaType}
            </Badge>
            <div className="font-bold text-sm" style={{ color: '#ec1a58' }}>
              {priceAmount.toLocaleString()} {priceCurrency}
            </div>
          </div>
          <Link to={`/media/preview/${media.naddr}`}>
            <Button size="sm" variant="outline" className="rounded-full text-xs">
              View Media
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
});

interface IndexProps {
  initialLocation?: string;
}

const Index = ({ initialLocation }: IndexProps = {}) => {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { viewMode } = useViewMode();
  const { data: latestReview } = useLatestReview();
  const { data: latestStory } = useLatestStory();
  const { data: latestStockMedia } = useLatestStockMedia();
  const { data: latestTrip } = useLatestTrip();
  const [isCreateTripDialogOpen, setIsCreateTripDialogOpen] = useState(false);
  const [selectedLocationTag, setSelectedLocationTag] = useState<string>(initialLocation || '');
  
  // Get counts
  const reviewCount = useReviewCount();
  const { data: storyCount = 0 } = useStoryCount();
  const { data: stockMediaCount = 0 } = useStockMediaCount();
  const { data: tripCount = 0 } = useTripCount();
  
  // Get last 3 items for each category
  const { data: latestReviews = [] } = useLatestReviews();
  const { data: latestStories = [] } = useLatestStories();
  const { data: latestTrips = [] } = useLatestTrips();
  const { data: latestStockMediaItems = [] } = useLatestStockMediaItems();
  
  // Get all images for image grid view (filtered by contributor status)
  const { data: allImages = [], isLoading: imagesLoading } = useAllImages();

  // Debug logging
  console.log('📊 Homepage thumbnails:', {
    latestReview: latestReview ? { title: latestReview.title, hasImage: !!latestReview.image } : null,
    latestStory: latestStory ? { title: latestStory.title, hasImage: !!latestStory.image } : null,
    latestStockMedia: latestStockMedia ? { title: latestStockMedia.title, hasImage: !!latestStockMedia.image } : null,
    latestTrip: latestTrip ? { title: latestTrip.title, hasImage: !!latestTrip.image } : null,
  });

  useSeoMeta({
    title: 'Traveltelly - Nostr Powered Travel Community',
    description: 'Nostr Powered Travel Community. Upload photos, rate locations, and earn Lightning tips.',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <NavigationComponent />
      
      {/* Reviews Map - Full width on mobile directly under fixed header - Only show in map mode */}
      {viewMode === 'map' && (
        <>
          <div className="md:hidden absolute top-16 left-0 right-0 z-10">
            <AllAdminReviewsMap zoomToLocation={selectedLocationTag} showTitle={false} />
          </div>

          {/* Spacer for mobile to push content below map */}
          <div className="md:hidden h-96" />
        </>
      )}

      <div className="container mx-auto px-2 md:px-4 md:py-8 md:pt-24">
        <div className="max-w-6xl mx-auto">
          {/* User Controls Card - Only show when user is logged in and no location selected */}
          {user && !selectedLocationTag && (
            <Card className="shadow-lg mb-6 md:mb-8 overflow-visible">
              <CardContent className="p-4 md:p-8 overflow-visible">
                {/* Header - Zap button */}
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

          {/* Feature Cards - Desktop Only with Images - Show in map mode when no location selected */}
          {viewMode === 'map' && !selectedLocationTag && (
            <div className="hidden md:block mb-6 md:mb-8">
              <div className="grid md:grid-cols-4 gap-3 md:gap-4 w-full">
                {/* Share Reviews Card */}
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
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#27b0ff' }} />
                      )}
                      {/* Content overlay */}
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

                {/* Travel Stories Card */}
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
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#b2d235' }} />
                      )}
                      {/* Content overlay */}
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
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#ffcc00' }} />
                      )}
                      {/* Content overlay */}
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
                          {/* Overlay gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        </>
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: '#ec1a58' }} />
                      )}
                      {/* Content overlay */}
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
          )}

          {/* Action Buttons */}
          {user && !selectedLocationTag && (
            <Card className="shadow-lg mb-6 md:mb-8 overflow-visible">
              <CardContent className="p-4 md:p-8 overflow-visible">(
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/create-review">
                    <Button className="rounded-full text-white text-xs md:text-sm px-3 md:px-4 py-2" style={{ backgroundColor: '#393636' }}>
                      <Camera className="w-4 h-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Create </span>Review
                    </Button>
                  </Link>
                  <Button 
                    className="rounded-full text-white text-xs md:text-sm px-3 md:px-4 py-2" 
                    style={{ backgroundColor: '#b2d235' }}
                    onClick={() => navigate('/stories?tab=create')}
                  >
                    <BookOpen className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Create </span>Story
                  </Button>
                  <Button 
                    size="lg" 
                    className="rounded-full text-black font-semibold text-sm md:text-base" 
                    style={{ backgroundColor: '#ffcc00' }}
                    onClick={() => setIsCreateTripDialogOpen(true)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Create Trip
                  </Button>
                  <CreateProductDialog>
                    <Button size="lg" className="rounded-full text-white text-sm md:text-base" style={{ backgroundColor: '#ec1a58' }}>
                      <FileImage className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upload Stock Media</span>
                      <span className="sm:hidden">Upload Media</span>
                    </Button>
                  </CreateProductDialog>
                  <Link to="/stock-media-permissions">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upload Permissions</span>
                      <span className="sm:hidden">Permissions</span>
                    </Button>
                  </Link>

                  {/* Debug info for admin detection */}
                  {import.meta.env.DEV && (
                    <div className="w-full text-center text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      Debug: isAdmin={String(isAdmin)}, isChecking={String(isCheckingPermission)}, userPubkey={user.pubkey?.slice(0, 8)}...
                    </div>
                  )}

                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base" style={{ borderColor: '#393636', color: '#393636' }}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}

                  {/* Always show admin test link for debugging */}
                  {import.meta.env.DEV && (
                    <Link to="/admin-test">
                      <Button variant="outline" size="lg" className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-50 text-sm md:text-base">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Admin Test Page</span>
                        <span className="sm:hidden">Admin Test</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/photo-upload-demo">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      Photo Demo
                    </Button>
                  </Link>
                  <Link to="/gps-correction-demo">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">GPS Correction</span>
                      <span className="sm:hidden">GPS Fix</span>
                    </Button>
                  </Link>
                  <Link to="/search-test">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <Search className="w-4 h-4 mr-2" />
                      Search Test
                    </Button>
                   </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Desktop Search Bar - Show outside Card when user not logged in */}
          {!user && !selectedLocationTag && (
            <div className="hidden md:block mb-6 md:mb-8">
              <Card className="shadow-lg">
                <CardContent className="p-4 md:p-8">
                  <UnifiedSearchBar />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Admin Debug Info (Development Only) */}
          {!selectedLocationTag && <AdminDebugInfo />}

          {/* View Mode: Map */}
          {viewMode === 'map' && (
            <>
              {/* Reviews Map - Desktop only (mobile is outside container) */}
              <div className="hidden md:block mb-8 md:mb-12">
                <AllAdminReviewsMap zoomToLocation={selectedLocationTag} showTitle={false} />
              </div>

              {/* Location Tag Cloud */}
              <div className="mb-8 md:mb-12">
                <LocationTagCloud 
                  onTagClick={(tag) => {
                    const newTag = tag === selectedLocationTag ? '' : tag;
                    setSelectedLocationTag(newTag);
                    
                    // Update URL when tag clicked (lowercase)
                    if (newTag) {
                      const urlFriendlyTag = newTag.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/${urlFriendlyTag}`, { replace: true });
                    } else {
                      navigate('/', { replace: true });
                    }
                  }}
                  selectedTag={selectedLocationTag}
                />
              </div>
            </>
          )}

          {/* View Mode: Images Grid */}
          {viewMode === 'images' && !selectedLocationTag && (
            <div className="mb-8 md:mb-12">
              {imagesLoading ? (
                <div className="grid gap-1 md:gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              ) : allImages.length > 0 ? (
                <div className="grid gap-1 md:gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {(() => {
                    // Shuffle images to mix different content types
                    // Group by type first
                    const byType = {
                      review: allImages.filter(i => i.type === 'review'),
                      story: allImages.filter(i => i.type === 'story'),
                      trip: allImages.filter(i => i.type === 'trip'),
                      stock: allImages.filter(i => i.type === 'stock'),
                    };

                    // Create a mixed array by round-robin from each type
                    const mixed: typeof allImages = [];
                    const maxLength = Math.max(
                      byType.review.length,
                      byType.story.length,
                      byType.trip.length,
                      byType.stock.length
                    );

                    for (let i = 0; i < maxLength; i++) {
                      if (byType.review[i]) mixed.push(byType.review[i]);
                      if (byType.story[i]) mixed.push(byType.story[i]);
                      if (byType.trip[i]) mixed.push(byType.trip[i]);
                      if (byType.stock[i]) mixed.push(byType.stock[i]);
                    }

                    return mixed.map((item) => {
                      // Get the destination path based on type
                      let destinationPath = '/';
                      switch (item.type) {
                        case 'review':
                          destinationPath = `/review/${item.naddr}`;
                          break;
                        case 'trip':
                          destinationPath = `/trip/${item.naddr}`;
                          break;
                        case 'story':
                          destinationPath = `/story/${item.naddr}`;
                          break;
                        case 'stock':
                          destinationPath = `/media/preview/${item.naddr}`;
                          break;
                      }

                      // Get icon and color based on type
                      let icon = Star;
                      let color = '#27b0ff';
                      switch (item.type) {
                        case 'review':
                          icon = Star;
                          color = '#27b0ff';
                          break;
                        case 'story':
                          icon = BookOpen;
                          color = '#b2d235';
                          break;
                        case 'trip':
                          icon = MapPin;
                          color = '#ffcc00';
                          break;
                        case 'stock':
                          icon = Camera;
                          color = '#ec1a58';
                          break;
                      }
                      const Icon = icon;

                      return (
                        <Link key={`${item.type}-${item.naddr}`} to={destinationPath}>
                          <div className="relative aspect-square overflow-hidden group cursor-pointer bg-gray-200 dark:bg-gray-700">
                            <OptimizedImage
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              blurUp={true}
                              thumbnail={true}
                              priority={false}
                              aspectRatio="1/1"
                            />
                            {/* Type icon overlay - colored round button */}
                            <div className="absolute top-2 right-2 z-10">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                                style={{ backgroundColor: color }}
                              >
                                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    });
                  })()}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-4">
                      <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No images found. {user ? 'Start creating content to see it here!' : 'Try switching relays or check back later.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Search Bar - Mobile Only (after Popular Destinations) - Only in Map Mode */}
          {viewMode === 'map' && (
            <div className="md:hidden mb-8">
              <Card className="shadow-lg">
                <CardContent className="p-4">
                  <UnifiedSearchBar />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Location-Filtered Content - Only in Map Mode */}
          {viewMode === 'map' && (
            selectedLocationTag ? (
              <div className="mb-8 md:mb-12">
                <LocationContentGrid locationTag={selectedLocationTag} />
              </div>
            ) : (
              <>
                {/* Reviews Section */}
            {latestReviews.length > 0 && (
            <div className="mb-6 md:mb-12">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Reviews
                  {reviewCount > 0 && (
                    <span className="text-sm md:text-xl font-normal text-muted-foreground">
                      ({reviewCount})
                    </span>
                  )}
                </h2>
                <Link to="/reviews">
                  <Button variant="outline" className="rounded-full text-xs md:text-sm px-3 md:px-4" style={{ borderColor: '#27b0ff', color: '#27b0ff' }}>
                    View All
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestReviews.slice(0, 1).map((review, index) => (
                  <ReviewCard key={review.naddr} review={review} priority={index === 0} />
                ))}
                {/* Show more reviews on desktop only */}
                <div className="hidden md:grid md:grid-cols-1 md:col-span-1 lg:col-span-2 gap-4 md:gap-6">
                  {latestReviews.slice(1, 3).map((review, index) => (
                    <ReviewCard key={review.naddr} review={review} priority={false} />
                  ))}
                </div>
              </div>
              {/* Mobile View All Button */}
              <div className="mt-4 text-center md:hidden">
                <Link to="/reviews">
                  <Button variant="outline" className="rounded-full w-full" style={{ borderColor: '#27b0ff', color: '#27b0ff' }}>
                    View All Reviews
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stories Section */}
          {latestStories.length > 0 && (
            <div className="mb-6 md:mb-12">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Stories
                  {storyCount > 0 && (
                    <span className="text-sm md:text-xl font-normal text-muted-foreground">
                      ({storyCount})
                    </span>
                  )}
                </h2>
                <Link to="/stories">
                  <Button variant="outline" className="rounded-full text-xs md:text-sm px-3 md:px-4" style={{ borderColor: '#b2d235', color: '#b2d235' }}>
                    View All
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestStories.slice(0, 1).map((story) => (
                  <StoryCard key={story.naddr} story={story} />
                ))}
                {/* Show more stories on desktop only */}
                <div className="hidden md:grid md:grid-cols-1 md:col-span-1 lg:col-span-2 gap-4 md:gap-6">
                  {latestStories.slice(1, 3).map((story) => (
                    <StoryCard key={story.naddr} story={story} />
                  ))}
                </div>
              </div>
              {/* Mobile View All Button */}
              <div className="mt-4 text-center md:hidden">
                <Link to="/stories">
                  <Button variant="outline" className="rounded-full w-full" style={{ borderColor: '#b2d235', color: '#b2d235' }}>
                    View All Stories
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Trips Section */}
          {latestTrips.length > 0 && (
            <div className="mb-6 md:mb-12">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Trips
                  {tripCount > 0 && (
                    <span className="text-sm md:text-xl font-normal text-muted-foreground">
                      ({tripCount})
                    </span>
                  )}
                </h2>
                <Link to="/trips">
                  <Button variant="outline" className="rounded-full text-xs md:text-sm px-3 md:px-4" style={{ borderColor: '#ffcc00', color: '#ffcc00' }}>
                    View All
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestTrips.slice(0, 1).map((trip) => (
                  <TripCard key={trip.naddr} trip={trip} />
                ))}
                {/* Show more trips on desktop only */}
                <div className="hidden md:grid md:grid-cols-1 md:col-span-1 lg:col-span-2 gap-4 md:gap-6">
                  {latestTrips.slice(1, 3).map((trip) => (
                    <TripCard key={trip.naddr} trip={trip} />
                  ))}
                </div>
              </div>
              {/* Mobile View All Button */}
              <div className="mt-4 text-center md:hidden">
                <Link to="/trips">
                  <Button variant="outline" className="rounded-full w-full" style={{ borderColor: '#ffcc00', color: '#ffcc00' }}>
                    View All Trips
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Stock Media Section */}
          {latestStockMediaItems.length > 0 && (
            <div className="mb-6 md:mb-12">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Stock Media
                  {stockMediaCount > 0 && (
                    <span className="text-sm md:text-xl font-normal text-muted-foreground">
                      ({stockMediaCount})
                    </span>
                  )}
                </h2>
                <Link to="/marketplace">
                  <Button variant="outline" className="rounded-full text-xs md:text-sm px-3 md:px-4" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                    View All
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestStockMediaItems.slice(0, 1).map((media, index) => (
                  <MediaCard key={media.naddr} media={media} priority={index === 0} />
                ))}
                {/* Show more media on desktop only */}
                <div className="hidden md:grid md:grid-cols-1 md:col-span-1 lg:col-span-2 gap-4 md:gap-6">
                  {latestStockMediaItems.slice(1, 3).map((media, index) => (
                    <MediaCard key={media.naddr} media={media} priority={false} />
                  ))}
                </div>
              </div>
              {/* Mobile View All Button */}
              <div className="mt-4 text-center md:hidden">
                <Link to="/marketplace">
                  <Button variant="outline" className="rounded-full w-full" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                    View All Stock Media
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}
              </>
            )
          )}

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-4 md:mb-8 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <CardContent className="p-3 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#393636' }}>
                      <Zap className="w-4 h-4 md:w-6 md:h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h3 className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                        ⚡ Lightning Tips Enabled!
                      </h3>
                      <p className="text-[10px] md:text-sm text-gray-600 dark:text-gray-300">
                        Support reviewers with instant Bitcoin tips
                      </p>
                    </div>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" className="rounded-full text-xs md:text-base w-full sm:w-auto px-3 md:px-4" style={{ borderColor: '#393636', color: '#393636' }}>
                      Setup
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relay Configuration */}
          <Card className="mb-4 md:mb-8 border-gray-200 dark:border-gray-700">
            <CardHeader className="px-3 md:px-6 pb-3 md:pb-4">
              <CardTitle className="text-sm md:text-lg">Relay Configuration</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Choose your preferred Nostr relay
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <RelaySelector className="w-full max-w-md" />
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Create Trip Dialog */}
      <Dialog open={isCreateTripDialogOpen} onOpenChange={setIsCreateTripDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Create New Trip</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <CreateTripForm onSuccess={() => setIsCreateTripDialogOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
