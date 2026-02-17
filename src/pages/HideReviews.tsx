import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getShortNpub } from '@/lib/nostrUtils';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import { EyeOff, ArrowLeft, User, AlertTriangle, CheckCircle, Eye, Trash2 } from 'lucide-react';
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

interface ReviewItemProps {
  review: NostrEvent;
  isBlocked: boolean;
}

function ReviewItem({ review, isBlocked }: ReviewItemProps) {
  const author = useAuthor(review.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(review.pubkey);
  const profileImage = metadata?.picture;

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Review';
  const location = review.tags.find(([name]) => name === 'location')?.[1] || 'Unknown Location';
  const rating = review.tags.find(([name]) => name === 'rating')?.[1];

  return (
    <Card className={`border-l-4 ${isBlocked ? 'border-l-red-500 opacity-60' : 'border-l-blue-200'} dark:border-l-blue-800`}>
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
            {isBlocked ? (
              <Badge variant="destructive">
                <EyeOff className="w-3 h-3 mr-1" />
                Hidden
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Eye className="w-3 h-3 mr-1" />
                Visible
              </Badge>
            )}
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

        <div className="text-xs text-muted-foreground">
          <strong>Event ID:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{review.id.slice(0, 16)}...</code>
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
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

interface BlockedUser {
  pubkey: string;
  npub: string;
  reason?: string;
  blockedAt: number;
}

function BlockedUserItem({ user, onUnblock }: { user: BlockedUser; onUnblock: (pubkey: string) => void }) {
  const author = useAuthor(user.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(user.pubkey);
  const profileImage = metadata?.picture;

  return (
    <Card className="border-l-4 border-l-red-500">
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(user.pubkey)}
              </p>
              {user.reason && (
                <p className="text-xs text-muted-foreground mt-1">
                  Reason: {user.reason}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Blocked {formatDistanceToNow(new Date(user.blockedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button
            onClick={() => onUnblock(user.pubkey)}
            variant="outline"
            size="sm"
          >
            <Eye className="w-4 h-4 mr-2" />
            Unblock
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HideReviews() {
  const [targetNpub, setTargetNpub] = useState('npub15dvtpm0evcm3u99av4t6zuevmy2mrwpugpgnysjguzvfvwfu64wsegachz');
  const [blockReason, setBlockReason] = useState('Inappropriate content');

  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { isAdmin } = useReviewPermissions();
  const { blockedUsers, blockUser, unblockUser, isUserBlocked } = useBlockedUsers();
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

  const isTargetBlocked = isValidNpub ? isUserBlocked(targetHex) : false;

  // Query reviews from target user
  const { data: reviews, isLoading, error } = useQuery({
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

  const handleBlockUser = () => {
    if (!isValidNpub || !targetHex) {
      toast({
        title: 'Invalid user',
        description: 'Please enter a valid npub.',
        variant: 'destructive',
      });
      return;
    }

    const success = blockUser(targetHex, blockReason);
    if (success) {
      toast({
        title: 'User blocked',
        description: 'All reviews from this user will now be hidden from the feed.',
      });
    } else {
      toast({
        title: 'User already blocked',
        description: 'This user is already in the blocked list.',
        variant: 'destructive',
      });
    }
  };

  const handleUnblockUser = (pubkey: string) => {
    unblockUser(pubkey);
    toast({
      title: 'User unblocked',
      description: 'Reviews from this user will now be visible again.',
    });
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
            <h1 className="text-3xl font-bold mb-2">Hide User Reviews</h1>
            <p className="text-muted-foreground">
              Block users to hide their reviews from the feed. This is stored locally and doesn't affect other users.
            </p>
          </div>

          {/* Block User Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <EyeOff className="w-5 h-5" />
                Block User
              </CardTitle>
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
                {isValidNpub && !isTargetBlocked && (
                  <p className="text-sm text-green-600 mt-1">
                    ✅ Valid npub: {getShortNpub(targetHex)}
                  </p>
                )}
                {isValidNpub && isTargetBlocked && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ This user is already blocked
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="block-reason">Reason (Optional)</Label>
                <Textarea
                  id="block-reason"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Why are you blocking this user?"
                  className="text-sm"
                  rows={2}
                />
              </div>

              <Button
                onClick={handleBlockUser}
                disabled={!isValidNpub || isTargetBlocked}
                className="w-full"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                {isTargetBlocked ? 'User Already Blocked' : 'Block User'}
              </Button>
            </CardContent>
          </Card>

          {/* Currently Blocked Users */}
          {blockedUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Blocked Users ({blockedUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {blockedUsers.map((blockedUser) => (
                    <BlockedUserItem
                      key={blockedUser.pubkey}
                      user={blockedUser}
                      onUnblock={handleUnblockUser}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview Reviews */}
          {isValidNpub && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview User Reviews
                  {reviews && reviews.length > 0 && (
                    <Badge variant={isTargetBlocked ? "destructive" : "secondary"}>
                      {reviews.length} found
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTargetBlocked && (
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded border border-red-200 dark:border-red-800 mb-4">
                    <p className="text-red-700 dark:text-red-300 text-sm">
                      🚫 <strong>This user is blocked.</strong> Their reviews are hidden from the main feed.
                      Reviews shown below are for preview only.
                    </p>
                  </div>
                )}

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
                    <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                      <p className="text-blue-700 dark:text-blue-300 text-sm">
                        ℹ️ <strong>How blocking works:</strong> Blocked users' reviews are filtered out client-side.
                        This only affects your view and doesn't remove content from the network. Other users will still see these reviews.
                      </p>
                    </div>

                    {reviews.map((review) => (
                      <ReviewItem
                        key={review.id}
                        review={review}
                        isBlocked={isTargetBlocked}
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