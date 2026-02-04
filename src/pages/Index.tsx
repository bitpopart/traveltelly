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
}

const ReviewCard = memo(function ReviewCard({ review }: ReviewCardProps) {
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
}

const MediaCard = memo(function MediaCard({ media }: MediaCardProps) {
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
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Main Content Box */}
          <Card className="shadow-lg mb-8 overflow-visible">
            <CardContent className="p-6 md:p-8 overflow-visible">
              {/* Show full header only when no location is selected */}
              {!selectedLocationTag && (
                <>
                  {/* Header - Purple and orange buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
                <Link to="/what-is-nostr">
                  <Button 
                    className="rounded-full font-semibold text-white hover:opacity-90 transition-opacity text-sm md:text-base px-6 md:px-8 py-3 h-auto"
                    style={{ backgroundColor: '#b700d7' }}
                  >
                    NOSTR POWERED TRAVEL COMMUNITY
                  </Button>
                </Link>
                <ZapAuthorButton
                  authorPubkey="7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35"
                  showAuthorName={false}
                  variant="default"
                  size="lg"
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 md:px-8 py-3 h-auto"
                />
              </div>

              {/* Feature Cards */}
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full mb-6">
                {/* Share Reviews Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/reviews" className="block relative">
                    <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: '#27b0ff' }}>
                       {latestReview?.image ? (
                        <OptimizedImage
                          src={latestReview.image}
                          alt={latestReview.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={false}
                          blurUp={true}
                          thumbnail={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Star className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <Button 
                          className="w-full rounded-full font-medium shadow-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2" 
                          style={{ backgroundColor: '#27b0ff' }}
                        >
                          <span>Reviews</span>
                          {reviewCount > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                              {reviewCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Travel Stories Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/stories" className="block relative">
                    <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: '#b2d235' }}>
                       {latestStory?.image ? (
                        <OptimizedImage
                          src={latestStory.image}
                          alt={latestStory.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={false}
                          blurUp={true}
                          thumbnail={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <Button 
                          className="w-full rounded-full font-medium shadow-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2" 
                          style={{ backgroundColor: '#b2d235' }}
                        >
                          <span>Stories</span>
                          {storyCount > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                              {storyCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Trips Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/trips" className="block relative">
                    <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: '#ffcc00' }}>
                       {latestTrip?.image ? (
                        <OptimizedImage
                          src={latestTrip.image}
                          alt={latestTrip.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={false}
                          blurUp={true}
                          thumbnail={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <Button 
                          className="w-full rounded-full font-medium shadow-lg text-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2" 
                          style={{ backgroundColor: '#ffcc00' }}
                        >
                          <span>Trips</span>
                          {tripCount > 0 && (
                            <span className="bg-black/20 px-2 py-0.5 rounded-full text-sm">
                              {tripCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Stock Media Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/marketplace" className="block relative">
                    <div className="aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: '#ec1a58' }}>
                       {latestStockMedia?.image ? (
                        <OptimizedImage
                          src={latestStockMedia.image}
                          alt={latestStockMedia.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          priority={false}
                          blurUp={true}
                          thumbnail={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <Button 
                          className="w-full rounded-full font-medium shadow-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2" 
                          style={{ backgroundColor: '#ec1a58' }}
                        >
                          <span>Stock Media</span>
                          {stockMediaCount > 0 && (
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                              {stockMediaCount}
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              </div>

              {/* Action Buttons */}
              {user && (
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  <Link to="/create-review">
                    <Button size="lg" className="rounded-full text-white text-sm md:text-base" style={{ backgroundColor: '#393636' }}>
                      <Camera className="w-4 h-4 mr-2" />
                      Create Review
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    className="rounded-full text-white text-sm md:text-base" 
                    style={{ backgroundColor: '#b2d235' }}
                    onClick={() => navigate('/stories?tab=create')}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create Story
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
              )}
                </>
              )}

              {/* Search Bar - Always visible */}
              <div className={selectedLocationTag ? 'mb-6' : 'mb-6'}>
                <UnifiedSearchBar />
              </div>
            </CardContent>
          </Card>

          {/* Admin Debug Info (Development Only) */}
          {!selectedLocationTag && <AdminDebugInfo />}

          {/* Reviews Map */}
          <div className="mb-8 md:mb-12">
            <AllAdminReviewsMap zoomToLocation={selectedLocationTag} />
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

          {/* Location-Filtered Content */}
          {selectedLocationTag ? (
            <div className="mb-8 md:mb-12">
              <LocationContentGrid locationTag={selectedLocationTag} />
            </div>
          ) : (
            <>
              {/* Reviews Section */}
          {latestReviews.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Reviews
                  {reviewCount > 0 && (
                    <span className="text-lg md:text-xl font-normal text-muted-foreground">
                      ({reviewCount})
                    </span>
                  )}
                </h2>
                <Link to="/reviews">
                  <Button variant="outline" className="rounded-full" style={{ borderColor: '#27b0ff', color: '#27b0ff' }}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestReviews.map((review) => (
                  <ReviewCard key={review.naddr} review={review} />
                ))}
              </div>
            </div>
          )}

          {/* Stories Section */}
          {latestStories.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Stories
                  {storyCount > 0 && (
                    <span className="text-lg md:text-xl font-normal text-muted-foreground">
                      ({storyCount})
                    </span>
                  )}
                </h2>
                <Link to="/stories">
                  <Button variant="outline" className="rounded-full" style={{ borderColor: '#b2d235', color: '#b2d235' }}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestStories.map((story) => (
                  <StoryCard key={story.naddr} story={story} />
                ))}
              </div>
            </div>
          )}

          {/* Trips Section */}
          {latestTrips.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Trips
                  {tripCount > 0 && (
                    <span className="text-lg md:text-xl font-normal text-muted-foreground">
                      ({tripCount})
                    </span>
                  )}
                </h2>
                <Link to="/trips">
                  <Button variant="outline" className="rounded-full" style={{ borderColor: '#ffcc00', color: '#ffcc00' }}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestTrips.map((trip) => (
                  <TripCard key={trip.naddr} trip={trip} />
                ))}
              </div>
            </div>
          )}

          {/* Stock Media Section */}
          {latestStockMediaItems.length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Stock Media
                  {stockMediaCount > 0 && (
                    <span className="text-lg md:text-xl font-normal text-muted-foreground">
                      ({stockMediaCount})
                    </span>
                  )}
                </h2>
                <Link to="/marketplace">
                  <Button variant="outline" className="rounded-full" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                    View All
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {latestStockMediaItems.map((media) => (
                  <MediaCard key={media.naddr} media={media} />
                ))}
              </div>
            </div>
          )}
            </>
          )}

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-6 md:mb-8 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#393636' }}>
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                        ⚡ Lightning Tips Enabled!
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Support great reviewers with instant Bitcoin tips. Look for the ⚡ icon on reviews.
                      </p>
                    </div>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" className="rounded-full text-sm md:text-base w-full sm:w-auto" style={{ borderColor: '#393636', color: '#393636' }}>
                      Setup Tips
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Relay Configuration */}
          <Card className="mb-6 md:mb-8 border-gray-200 dark:border-gray-700">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Relay Configuration</CardTitle>
              <CardDescription className="text-sm">
                Choose your preferred Nostr relay to discover reviews from different communities
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
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
