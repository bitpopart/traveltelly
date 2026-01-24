import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthor } from '@/hooks/useAuthor';
import { useInfiniteReviews } from '@/hooks/useInfiniteReviews';
import { genUserName } from '@/lib/genUserName';
import { MapPin, Star, Calendar, Camera, MessageCircle, Plus, Loader2 } from 'lucide-react';
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

function ReviewCard({ review }: { review: ReviewEvent }) {
  const author = useAuthor(review.pubkey);
  const { isUserBlocked } = useBlockedUsers();
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(review.pubkey);
  const shortNpub = getShortNpub(review.pubkey);

  // Extract review data from tags
  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Review';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.tags.find(([name]) => name === 'location')?.[1] || '';
  const image = review.tags.find(([name]) => name === 'image')?.[1];

  // Get review comments
  const { data: comments = [] } = useReviewComments(review.id);

  // Create naddr for the review
  const naddr = nip19.naddrEncode({
    identifier: review.tags.find(([name]) => name === 'd')?.[1] || '',
    pubkey: review.pubkey,
    kind: 34879,
  });

  // Don't render if user is blocked
  if (isUserBlocked(review.pubkey)) {
    return null;
  }

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
            <span>{formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{categoryEmojis[category] || '📍'}</span>
            <h3 className="font-bold text-lg">{title}</h3>
          </div>
          <div className="flex items-center mb-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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

        {image && (
          <Link to={`/review/${naddr}`} className="block">
            <div className="relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
              <img
                src={image}
                alt={title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            </div>
          </Link>
        )}

        {review.content && (
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p>{truncateText(review.content)}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex items-center gap-4">
            <ZapButton
              authorPubkey={review.pubkey}
              event={review}
              className="text-xs"
            />
            {comments.length > 0 && (
              <Button variant="ghost" size="sm" className="text-xs p-0 h-auto">
                <MessageCircle className="w-3 h-3 mr-1" />
                {comments.length} comment{comments.length !== 1 ? 's' : ''}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize text-xs">
              {category.replace('-', ' ')}
            </Badge>
            <Link to={`/review/${naddr}`}>
              <Button size="sm" variant="outline" className="rounded-full text-xs">
                View Details
              </Button>
            </Link>
          </div>
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

export function LoadMoreReviewFeed() {
  const { isUserBlocked } = useBlockedUsers();
  const { data: authorizedReviewers, isLoading: isLoadingAuth } = useAuthorizedReviewers();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteReviews();

  // Filter reviews by authorized reviewers and blocked users
  const allReviews = data?.pages.flatMap(page =>
    page.reviews.filter(review => {
      // Only show reviews from authorized reviewers
      if (authorizedReviewers && !authorizedReviewers.has(review.pubkey)) {
        return false;
      }
      // Filter out blocked users
      return !isUserBlocked(review.pubkey);
    })
  ) || [];

  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <p className="text-muted-foreground">
              No reviews found. Try another relay?
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || isLoadingAuth) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!allReviews || allReviews.length === 0) {
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
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {allReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="min-w-40"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Load More Reviews
              </>
            )}
          </Button>
        </div>
      )}

      {!hasNextPage && allReviews.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-4">
          All reviews loaded ({allReviews.length} total)
        </div>
      )}
    </div>
  );
}