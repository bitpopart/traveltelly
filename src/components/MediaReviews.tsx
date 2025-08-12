import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useMediaReviews, type MediaReview } from '@/hooks/useMediaReviews';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { genUserName } from '@/lib/genUserName';
import { Star, StarIcon, User, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface MediaReviewsProps {
  productEventId: string;
  productTitle: string;
}

export function MediaReviews({ productEventId, productTitle }: MediaReviewsProps) {
  const { user } = useCurrentUser();
  const { data: reviews, isLoading } = useMediaReviews(productEventId);
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      createEvent({
        kind: 1985, // NIP-32 review
        content: comment.trim(),
        tags: [
          ['e', productEventId], // Event being reviewed
          ['l', rating.toString()], // Rating
          ['k', '30402'], // Kind of event being reviewed
          ['t', 'media-review'], // Category tag
        ],
      });

      setComment('');
      setRating(5);
      setShowReviewForm(false);

      toast({
        title: "Review submitted!",
        description: "Your review has been published to the network.",
      });
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast({
        title: "Failed to submit review",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating: currentRating, interactive = false, onRatingChange }: {
    rating: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange?.(star)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              className={`w-4 h-4 ${
                star <= currentRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const ReviewItem = ({ review }: { review: MediaReview }) => {
    const author = useAuthor(review.author.pubkey);
    const metadata = author.data?.metadata;
    const displayName = metadata?.name || genUserName(review.author.pubkey);
    const profileImage = metadata?.picture;

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0 pb-4 last:pb-0">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="text-xs">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{displayName}</span>
                <StarRating rating={review.rating} />
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(review.createdAt * 1000).toLocaleDateString()}
              </span>
            </div>

            {review.comment && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {review.comment}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <CardTitle className="text-lg">Media Reviews</CardTitle>
            {reviews && reviews.length > 0 && (
              <Badge variant="secondary">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {user && !showReviewForm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewForm(true)}
            >
              <StarIcon className="w-4 h-4 mr-2" />
              Write Review
            </Button>
          )}
        </div>

        {reviews && reviews.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StarRating rating={Math.round(averageRating)} />
            <span>{averageRating.toFixed(1)} average rating</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Review Form */}
        {showReviewForm && user && (
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Comment</label>
              <Textarea
                placeholder={`Share your thoughts about "${productTitle}"...`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={!comment.trim() || isSubmitting}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowReviewForm(false);
                  setComment('');
                  setRating(5);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No reviews yet</p>
            {user && (
              <p className="text-xs mt-1">Be the first to review this media!</p>
            )}
          </div>
        )}

        {/* Login prompt for non-logged in users */}
        {!user && (
          <div className="text-center py-4 text-sm text-muted-foreground border-t">
            <p>Sign in to write a review</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}