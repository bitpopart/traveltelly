import { useSeoMeta } from '@unhead/react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { LightningTipButton } from '@/components/LightningTipButton';
import { Trophy, Star, MapPin, TrendingUp } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from '@/hooks/useAuthorizedReviewers';

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

interface ReviewerStats {
  pubkey: string;
  reviewCount: number;
  averageRating: number;
  categories: Set<string>;
  totalRating: number;
}

function TopReviewerCard({ reviewer, rank }: { reviewer: ReviewerStats; rank: number }) {
  const author = useAuthor(reviewer.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(reviewer.pubkey);
  const profileImage = metadata?.picture;

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Trophy className={`w-6 h-6 mr-2 ${getTrophyColor(rank)}`} />
            <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>
          </div>

          <Avatar className="h-12 w-12">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {reviewer.reviewCount} reviews
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {reviewer.averageRating.toFixed(1)} avg
              </span>
              <span>{reviewer.categories.size} categories</span>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="flex items-center justify-end">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(reviewer.averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Badge variant="secondary">
                {reviewer.categories.size} categories
              </Badge>
              <LightningTipButton
                recipientPubkey={reviewer.pubkey}
                size="sm"
                showText={false}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopReviewerSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Skeleton className="w-6 h-6 mr-2" />
            <Skeleton className="w-8 h-8" />
          </div>

          <Skeleton className="h-12 w-12 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="text-right space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const Dashboard = () => {
  const { nostr } = useNostr();
  const { data: authorizedReviewers, isLoading: isLoadingAuth } = useAuthorizedReviewers();

  useSeoMeta({
    title: 'Dashboard - Top Reviewers | Traveltelly',
    description: 'Discover the top reviewers on Traveltelly and see trending locations.',
  });

  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ['all-reviews-stats', 'v3'], // Updated query key to force refresh
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      // Query specifically for authorized reviewers' posts
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors, // Only query for authorized authors
        limit: 1000
      }], { signal });

      return events.filter(validateReviewEvent);
    },
    enabled: !!authorizedReviewers && authorizedReviewers.size > 0, // Only run when we have authorized reviewers
  });

  const topReviewers = reviews ? (() => {
    const reviewerStats = new Map<string, ReviewerStats>();

    reviews.forEach(review => {
      const pubkey = review.pubkey;
      const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
      const category = review.tags.find(([name]) => name === 'category')?.[1] || '';

      if (!reviewerStats.has(pubkey)) {
        reviewerStats.set(pubkey, {
          pubkey,
          reviewCount: 0,
          averageRating: 0,
          categories: new Set(),
          totalRating: 0,
        });
      }

      const stats = reviewerStats.get(pubkey)!;
      stats.reviewCount++;
      stats.totalRating += rating;
      stats.averageRating = stats.totalRating / stats.reviewCount;
      stats.categories.add(category);
    });

    return Array.from(reviewerStats.values())
      .sort((a, b) => {
        // Sort by review count first, then by average rating
        if (b.reviewCount !== a.reviewCount) {
          return b.reviewCount - a.reviewCount;
        }
        return b.averageRating - a.averageRating;
      })
      .slice(0, 10);
  })() : [];

  const categoryStats = reviews ? (() => {
    const categories = new Map<string, number>();
    reviews.forEach(review => {
      const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
      categories.set(category, (categories.get(category) || 0) + 1);
    });

    return Array.from(categories.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  })() : [];

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

  if (error) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#def5ff' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground">
                  Failed to load dashboard data. Please try again.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📊 Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Top reviewers and trending categories on Traveltelly
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Top Reviewers */}
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Top 10 Reviewers
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {isLoading || isLoadingAuth ? (
                  Array.from({ length: 10 }, (_, i) => (
                    <TopReviewerSkeleton key={i} />
                  ))
                ) : topReviewers.length > 0 ? (
                  topReviewers.map((reviewer, index) => (
                    <TopReviewerCard
                      key={reviewer.pubkey}
                      reviewer={reviewer}
                      rank={index + 1}
                    />
                  ))
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-12 px-8 text-center">
                      <p className="text-muted-foreground">
                        No reviewers found yet. Be the first to create a review!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              {/* Total Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading || isLoadingAuth ? (
                    <>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Reviews</span>
                        <span className="font-semibold">{reviews?.length || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Active Reviewers</span>
                        <span className="font-semibold">{topReviewers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Categories</span>
                        <span className="font-semibold">{categoryStats.length}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Top Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoading || isLoadingAuth ? (
                    Array.from({ length: 5 }, (_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        <Skeleton className="h-5 w-8" />
                      </div>
                    ))
                  ) : categoryStats.length > 0 ? (
                    categoryStats.map(([category, count]) => (
                      <div key={category} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>{categoryEmojis[category] || '📍'}</span>
                          <span className="text-sm capitalize">
                            {category.replace('-', ' ')}
                          </span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No categories yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;