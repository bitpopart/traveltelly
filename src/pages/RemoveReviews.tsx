import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getShortNpub } from '@/lib/nostrUtils';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import { Trash2, ArrowLeft, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

// Review event kinds
const REVIEW_KINDS = [34879]; // Travel review kinds

function validateReviewEvent(event: NostrEvent): boolean {
  if (!REVIEW_KINDS.includes(event.kind)) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];

  return !!(d && title && rating && category);
}

interface ReviewItemProps {
  review: NostrEvent;
  onDelete: (reviewId: string) => void;
  isDeleting: boolean;
}

function ReviewItem({ review, onDelete, isDeleting }: ReviewItemProps) {
  const author = useAuthor(review.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(review.pubkey);
  const profileImage = metadata?.picture;

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Review';
  const location = review.tags.find(([name]) => name === 'location')?.[1] || 'Unknown Location';
  const rating = review.tags.find(([name]) => name === 'rating')?.[1];

  return (
    <Card className="border-l-4 border-l-red-200 dark:border-l-red-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(review.pubkey)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {rating && (
              <Badge variant="outline">
                ⭐ {rating}/5
              </Badge>
            )}
            <Badge variant="destructive">
              To Delete
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-lg">{title}</h4>
          <p className="text-sm text-muted-foreground">📍 {location}</p>
        </div>

        {review.content && (
          <div>
            <p className="text-sm leading-relaxed line-clamp-3">
              {review.content}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            <strong>Event ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{review.id.slice(0, 16)}...</code>
          </div>
          <Button
            onClick={() => onDelete(review.id)}
            disabled={isDeleting}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete Review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200 dark:border-l-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function RemoveReviews() {
  const [targetNpub, setTargetNpub] = useState('npub15dvtpm0evcm3u99av4t6zuevmy2mrwpugpgnysjguzvfvwfu64wsegachz');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { isAdmin } = useReviewPermissions();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  // Decode npub to hex
  let targetHex = '';
  let isValidNpub = false;
  try {
    const decoded = nip19.decode(targetNpub);
    if (decoded.type === 'npub') {
      targetHex = decoded.data;
      isValidNpub = true;
    }
  } catch {
    // Invalid npub
  }

  // Query reviews from target user
  const { data: reviews, isLoading, error, refetch } = useQuery({
    queryKey: ['user-reviews', targetHex],
    queryFn: async (c) => {
      if (!targetHex) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const events = await nostr.query([{
        kinds: REVIEW_KINDS,
        authors: [targetHex],
        limit: 100,
      }], { signal });

      return events.filter(validateReviewEvent).sort((a, b) => b.created_at - a.created_at);
    },
    enabled: isValidNpub && !!targetHex,
  });

  const handleDeleteReview = async (reviewId: string) => {
    if (!user || !isAdmin) {
      toast({
        title: 'Access denied',
        description: 'Only admins can delete reviews.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingIds(prev => new Set(prev).add(reviewId));

    try {
      // Create a deletion event (kind 5)
      createEvent({
        kind: 5,
        content: 'Review deleted by admin',
        tags: [
          ['e', reviewId],
          ['alt', 'Review deletion by admin'],
        ],
      });

      toast({
        title: 'Review deleted',
        description: 'The review has been marked for deletion.',
      });

      // Refetch reviews after a short delay
      setTimeout(() => {
        refetch();
      }, 1000);

    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: 'Failed to delete review',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!reviews || reviews.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete all ${reviews.length} reviews from this user? This action cannot be undone.`
    );

    if (!confirmed) return;

    for (const review of reviews) {
      await handleDeleteReview(review.id);
      // Small delay between deletions to avoid overwhelming the relay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  // Check admin access
  if (!user) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="py-8 text-center">
                <User className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-6">
                  Please login with your Nostr account to access review management.
                </p>
                <Link to="/admin-debug">
                  <Button variant="outline">
                    Go to Admin Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-6">
                  Only Traveltelly admins can access review management tools.
                </p>
                <Link to="/admin-debug">
                  <Button variant="outline">
                    Check Admin Status
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Remove User Reviews</h1>
            <p className="text-muted-foreground">
              Delete reviews from a specific user. This action creates deletion events that most relays will respect.
            </p>
          </div>

          {/* Target User Input */}
          <Card>
            <CardHeader>
              <CardTitle>Target User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-npub">User Npub</Label>
                <Input
                  id="target-npub"
                  value={targetNpub}
                  onChange={(e) => setTargetNpub(e.target.value)}
                  placeholder="npub1..."
                  className="font-mono text-sm"
                />
                {targetNpub && !isValidNpub && (
                  <p className="text-sm text-red-600 mt-1">Invalid npub format</p>
                )}
                {isValidNpub && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Valid npub: {getShortNpub(targetHex)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          {isValidNpub && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    User Reviews
                    {reviews && reviews.length > 0 && (
                      <Badge variant="destructive">{reviews.length} found</Badge>
                    )}
                  </CardTitle>
                  {reviews && reviews.length > 0 && (
                    <Button
                      onClick={handleDeleteAll}
                      variant="destructive"
                      disabled={deletingIds.size > 0}
                    >
                      Delete All Reviews
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800">
                    <p className="text-red-700 dark:text-red-300">
                      Failed to load reviews. Please try again.
                    </p>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <ReviewSkeleton key={i} />
                    ))}
                  </div>
                )}

                {!isLoading && !error && reviews && reviews.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p className="text-muted-foreground">
                      No reviews found for this user.
                    </p>
                  </div>
                )}

                {!isLoading && !error && reviews && reviews.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                        ⚠️ <strong>Warning:</strong> Deleting reviews creates deletion events (kind 5) that request relays to remove the content.
                        Most relays respect these deletion requests, but the action may not be immediately visible and some relays may not comply.
                      </p>
                    </div>

                    {reviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        onDelete={handleDeleteReview}
                        isDeleting={deletingIds.has(review.id)}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}