import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { MapPin, Star, ArrowRight, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import type { NostrEvent } from '@nostrify/nostrify';

interface NearbyReviewsProps {
  currentReviewId: string;
  geohashStr: string;
  category?: string;
}

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  return !!(d && title && rating);
}

interface NearbyReviewCardProps {
  review: ReviewEvent;
}

function NearbyReviewCard({ review }: NearbyReviewCardProps) {
  const author = useAuthor(review.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(review.pubkey);

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.tags.find(([name]) => name === 'location')?.[1];
  const image = review.tags.find(([name]) => name === 'image')?.[1];
  const identifier = review.tags.find(([name]) => name === 'd')?.[1];

  if (!identifier) return null;

  const naddr = nip19.naddrEncode({
    kind: review.kind,
    pubkey: review.pubkey,
    identifier,
  });

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
    <Link to={`/review/${naddr}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-3">
          <div className="flex gap-2">
            {/* Thumbnail - smaller on mobile */}
            {image && (
              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-md overflow-hidden">
                <OptimizedImage
                  src={image}
                  alt={title}
                  className="w-full h-full object-cover"
                  blurUp={true}
                  thumbnail={true}
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-1 mb-1">
                <span className="text-sm flex-shrink-0">{categoryEmojis[category] || '📍'}</span>
                <h4 className="font-semibold text-xs md:text-sm line-clamp-2 leading-tight">{title}</h4>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 md:w-3 md:h-3 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-600 ml-1">({rating})</span>
              </div>

              {/* Location - only show on larger screens */}
              {location && (
                <div className="hidden sm:flex items-center text-xs text-gray-600">
                  <MapPin className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function useNearbyReviews(currentReviewId: string, geohashStr: string, category?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nearby-reviews', currentReviewId, geohashStr, category],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      console.log('🔍 Searching for nearby reviews with geohash:', geohashStr);

      // Get all reviews first, then filter by proximity in JavaScript
      // This is more reliable than geohash prefix matching since relays may not support it well
      const events = await nostr.query([
        {
          kinds: [34879],
          limit: 200, // Get more reviews to filter from
        }
      ], { signal });

      console.log('📊 Total reviews fetched:', events.length);

      // Filter valid reviews with geohash and exclude current review
      const validReviews = events
        .filter(validateReviewEvent)
        .filter(e => e.id !== currentReviewId)
        .filter(e => e.tags.find(([name]) => name === 'g')?.[1]); // Must have geohash

      console.log('✅ Valid reviews with geohash:', validReviews.length);

      // Calculate distance from current location and sort
      const currentCoords = geohash.decode(geohashStr);
      const reviewsWithDistance = validReviews.map(review => {
        const reviewGeohash = review.tags.find(([name]) => name === 'g')?.[1];
        if (!reviewGeohash) return { review, distance: Infinity };

        try {
          const reviewCoords = geohash.decode(reviewGeohash);
          
          // Haversine formula for distance
          const R = 6371; // Earth's radius in km
          const dLat = (reviewCoords.latitude - currentCoords.latitude) * Math.PI / 180;
          const dLon = (reviewCoords.longitude - currentCoords.longitude) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(currentCoords.latitude * Math.PI / 180) * 
            Math.cos(reviewCoords.latitude * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;

          return { review, distance };
        } catch (error) {
          console.error('Error decoding geohash:', reviewGeohash, error);
          return { review, distance: Infinity };
        }
      });

      // Filter to reviews within 50km and sort by distance
      const nearby = reviewsWithDistance
        .filter(item => item.distance < 50) // Within 50km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6)
        .map(item => {
          console.log(`📍 Nearby review: ${item.review.tags.find(([name]) => name === 'title')?.[1]} - ${item.distance.toFixed(2)}km away`);
          return item.review;
        });

      console.log('🎯 Found', nearby.length, 'nearby reviews');
      return nearby;
    },
    enabled: !!geohashStr && !!currentReviewId,
  });
}

export function NearbyReviews({ currentReviewId, geohashStr, category }: NearbyReviewsProps) {
  const { data: nearbyReviews, isLoading } = useNearbyReviews(currentReviewId, geohashStr, category);

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Navigation className="w-4 h-4 md:w-5 md:h-5" />
            Nearby Reviews
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid gap-2 md:gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-md flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-2.5 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nearbyReviews || nearbyReviews.length === 0) {
    return null; // Don't show section if no nearby reviews
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Navigation className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#27b0ff' }} />
            Nearby Reviews
          </CardTitle>
          <Link to="/reviews">
            <Button variant="ghost" size="sm" className="h-8 text-xs md:text-sm">
              View All
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-xs md:text-sm text-muted-foreground">
          Discover other reviews in this area
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 md:gap-3 md:grid-cols-2">
          {nearbyReviews.map((review) => (
            <NearbyReviewCard key={review.id} review={review} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
