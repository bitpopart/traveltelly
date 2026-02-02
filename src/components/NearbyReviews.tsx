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
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Thumbnail */}
            {image && (
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
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
              <div className="flex items-start gap-2 mb-1">
                <span className="text-lg flex-shrink-0">{categoryEmojis[category] || '📍'}</span>
                <h4 className="font-semibold text-sm line-clamp-2">{title}</h4>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-600 ml-1">({rating}/5)</span>
              </div>

              {/* Location */}
              {location && (
                <div className="flex items-center text-xs text-gray-600 mb-2">
                  <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              {/* Author */}
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={metadata?.picture} alt={displayName} />
                  <AvatarFallback className="text-xs">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  {displayName}
                </span>
              </div>
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query by geohash prefix for nearby locations
      // Using precision 5 or 6 for neighborhood-level proximity
      const geohashPrefix = geohashStr.substring(0, 6);

      const events = await nostr.query([
        {
          kinds: [34879],
          '#g': [geohashPrefix], // Exact match on prefix
          limit: 50,
        }
      ], { signal });

      // Filter valid reviews and exclude current review
      const validReviews = events
        .filter(validateReviewEvent)
        .filter(e => e.id !== currentReviewId);

      // Calculate distance from current location and sort
      const currentCoords = geohash.decode(geohashStr);
      const reviewsWithDistance = validReviews.map(review => {
        const reviewGeohash = review.tags.find(([name]) => name === 'g')?.[1];
        if (!reviewGeohash) return { review, distance: Infinity };

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
      });

      // Sort by distance and return top 6
      return reviewsWithDistance
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 6)
        .map(item => item.review);
    },
    enabled: !!geohashStr && !!currentReviewId,
  });
}

export function NearbyReviews({ currentReviewId, geohashStr, category }: NearbyReviewsProps) {
  const { data: nearbyReviews, isLoading } = useNearbyReviews(currentReviewId, geohashStr, category);

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Nearby Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-3/4" />
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
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5" style={{ color: '#27b0ff' }} />
            Nearby Reviews
          </CardTitle>
          <Link to="/reviews">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Discover other reviews in this area
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {nearbyReviews.map((review) => (
            <NearbyReviewCard key={review.id} review={review} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
