import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { normalizeCategory } from '@/lib/nostrUtils';
import { Coffee, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];
  
  if (!d || !title || !rating || !category) {
    return false;
  }

  // Filter out template/placeholder content
  const lowerContent = event.content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  const placeholderKeywords = [
    'lorem ipsum',
    'placeholder',
    'template',
    'sample review',
    'example review',
    'test review',
    'demo review',
    'dolor sit amet',
  ];

  // Check if content or title contains placeholder keywords
  const hasPlaceholder = placeholderKeywords.some(keyword => 
    lowerContent.includes(keyword) || lowerTitle.includes(keyword)
  );

  if (hasPlaceholder) {
    return false;
  }

  return true;
}

export function CategoryMigration() {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedCount, setUpdatedCount] = useState(0);

  // Fetch all reviews by current user
  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['user-reviews-for-migration', user?.pubkey],
    queryFn: async (c) => {
      if (!user) return [];
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([{
        kinds: [34879],
        authors: [user.pubkey],
        limit: 500,
      }], { signal });
      return events.filter(validateReviewEvent);
    },
    enabled: !!user,
  });

  // Find reviews with accented categories
  const reviewsWithAccents = reviews?.filter(review => {
    const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
    const normalized = normalizeCategory(category);
    // Check if normalization changes the category (meaning it had accents)
    return category !== normalized && category.toLowerCase() !== normalized;
  }) || [];

  const updateReview = async (review: ReviewEvent) => {
    const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
    const normalized = normalizeCategory(category);

    // Create updated tags with normalized category
    const newTags = review.tags.map(tag => {
      if (tag[0] === 'category') {
        return ['category', normalized];
      }
      return tag;
    });

    return new Promise<void>((resolve, reject) => {
      createEvent(
        {
          kind: 34879,
          content: review.content,
          tags: newTags,
        },
        {
          onSuccess: () => {
            console.log(`✅ Updated review: ${review.tags.find(([name]) => name === 'title')?.[1]}`);
            resolve();
          },
          onError: (error) => {
            console.error('❌ Failed to update review:', error);
            reject(error);
          },
        }
      );
    });
  };

  const updateAllReviews = async () => {
    if (!reviewsWithAccents.length) return;

    setIsUpdating(true);
    setUpdatedCount(0);

    try {
      for (const review of reviewsWithAccents) {
        await updateReview(review);
        setUpdatedCount(prev => prev + 1);
        // Small delay between updates to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: 'Migration Complete! ✅',
        description: `Successfully updated ${reviewsWithAccents.length} reviews with normalized categories.`,
      });

      // Refetch to update the list
      setTimeout(() => refetch(), 1000);
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: 'Migration Error',
        description: 'Some reviews could not be updated. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Please log in to migrate your reviews.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Scanning your reviews...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coffee className="w-5 h-5" />
          Category Migration Tool
        </CardTitle>
        <CardDescription>
          Update reviews with accented categories (e.g., "Café" → "cafe") to ensure proper marker display
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {reviewsWithAccents.length === 0 ? (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              All your reviews are up to date! No categories with accents found.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                Found <strong>{reviewsWithAccents.length}</strong> reviews with accented categories that need updating.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Reviews to Update:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {reviewsWithAccents.slice(0, 10).map(review => {
                  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
                  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
                  const normalized = normalizeCategory(category);
                  
                  return (
                    <div key={review.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate flex-1">{title}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge variant="outline">{category}</Badge>
                        <span className="text-xs text-muted-foreground">→</span>
                        <Badge variant="default">{normalized}</Badge>
                      </div>
                    </div>
                  );
                })}
                {reviewsWithAccents.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    ...and {reviewsWithAccents.length - 10} more
                  </p>
                )}
              </div>
            </div>

            {isUpdating && (
              <Alert>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <AlertDescription>
                  Updating reviews... ({updatedCount} / {reviewsWithAccents.length})
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button
                onClick={updateAllReviews}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Updating... ({updatedCount}/{reviewsWithAccents.length})
                  </>
                ) : (
                  <>
                    <Coffee className="w-4 h-4 mr-2" />
                    Update All Reviews
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => refetch()}
                disabled={isUpdating}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              This will republish your reviews with normalized categories. The original reviews will be replaced.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
