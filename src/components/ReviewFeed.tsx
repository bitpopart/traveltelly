import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { MapPin, Star, Calendar, Camera, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { ZapButton } from '@/components/ZapButton';
import { getShortNpub } from '@/lib/nostrUtils';
import { useReviewComments } from '@/hooks/useReviewComments';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuthorizedReviewers } from '@/hooks/useAuthorizedReviewers';

// Helper function to truncate text and show summary
function truncateText(text: string, maxLength: number = 120): string {
  if (!text || text.length <= maxLength) return text;

  // Find the last space before the max length to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];

  return !!(d && title && rating && category);
}

function ReviewCard({ review }: { review: ReviewEvent }) {
  const author = useAuthor(review.pubkey);
  const metadata = author.data?.metadata;

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.tags.find(([name]) => name === 'location')?.[1];
  const image = review.tags.find(([name]) => name === 'image')?.[1];

  const displayName = metadata?.name || genUserName(review.pubkey);
  const profileImage = metadata?.picture;

  const naddr = nip19.naddrEncode({
    identifier: review.tags.find(([name]) => name === 'd')?.[1] || '',
    pubkey: review.pubkey,
    kind: 34879,
  });

  const { data: comments } = useReviewComments(naddr);

  const categoryEmojis: Record<string, string> = {
    'grocery-store': '🛒',
    'clothing-store': '👕',
    'electronics-store': '📱',
    'convenience-store': '🏪',
    'restaurant': '🍽️',
    'cafe': '☕',
    'fast-food': '🍔',
    'bar-pub': '🍺',
    'hotel': '🏨',
    'motel': '🏨',
    'hostel': '🏠',
    'landmarks': '🏛️',
    'bank': '🏦',
    'salon-spa': '💅',
    'car-repair': '🔧',
    'laundry': '🧺',
    'hospital': '🏥',
    'clinic': '🏥',
    'pharmacy': '💊',
    'dentist': '🦷',
    'park': '🌳',
    'beach': '🏖️',
    'playground': '🛝',
    'hiking-trail': '🥾',
    'cycling-trail': '🚴',
    'museum': '🏛️',
    'movie-theater': '🎬',
    'zoo': '🦁',
    'music-venue': '🎵',
    'school': '🏫',
    'library': '📚',
    'post-office': '📮',
    'police-station': '👮',
    'gas-station': '⛽',
    'bus-stop': '🚌',
    'train-station': '🚂',
    'parking-lot': '🅿️',
    'church': '⛪',
    'mosque': '🕌',
    'temple': '🛕',
    'synagogue': '✡️',
    'shrine': '⛩️'
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(review.pubkey)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryEmojis[category] || '📍'}</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>

          {location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          )}
        </div>

        {image && (
          <Link to={`/review/${naddr}`} className="block">
            <div className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
              <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover"
              />
            </div>
          </Link>
        )}

        {review.content && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {truncateText(review.content)}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <ZapButton
              authorPubkey={review.pubkey}
              event={review}
            />
            <Link to={`/review/${naddr}`}>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-700">
                View Details
              </Button>
            </Link>
            {comments && comments.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-muted-foreground hover:text-blue-600">
                <MessageCircle className="w-3 h-3 mr-1" />
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          <Badge variant="outline" className="capitalize">
            {category.replace('-', ' ')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ReviewFeed() {
  const { nostr } = useNostr();
  const { isUserBlocked } = useBlockedUsers();
  const { data: authorizedReviewers, isLoading: isLoadingAuth } = useAuthorizedReviewers();

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['reviews', 'v4'], // Updated query key to force refresh
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query specifically for authorized reviewers' posts
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors, // Only query for authorized authors
        limit: 50
      }], { signal });

      return events
        .filter(validateReviewEvent)
        .filter(event => !isUserBlocked(event.pubkey)) // Filter out blocked users
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 20); // Limit to 20 after sorting
    },
    enabled: !!authorizedReviewers && authorizedReviewers.size > 0, // Only run when we have authorized reviewers
  });

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <p className="text-muted-foreground">
              No reviews found. Try another relay?
            </p>
            {/* RelaySelector would go here if needed */}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isLoadingAuth) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ReviewSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <p className="text-muted-foreground">
              No reviews found yet. Be the first to share a review!
            </p>
            <Link to="/create-review">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Camera className="w-4 h-4 mr-2" />
                Create First Review
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}