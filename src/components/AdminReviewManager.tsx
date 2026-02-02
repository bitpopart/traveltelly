import { useState } from 'react';
import { useAllReviews } from '@/hooks/useAllReviews';
import { useAuthor } from '@/hooks/useAuthor';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EditReviewForm } from '@/components/EditReviewForm';
import { RelaySelector } from '@/components/RelaySelector';
import { CategoryManager } from '@/components/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManager } from '@/components/CategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Star,
  Edit,
  Trash2,
  Search,
  Filter,
  MapPin,

  User,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';

interface ReviewCardProps {
  review: NostrEvent;
  onEdit: (review: NostrEvent) => void;
  onDelete: (review: NostrEvent) => void;
}

function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const author = useAuthor(review.pubkey);
  const metadata = author.data?.metadata;

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.tags.find(([name]) => name === 'location')?.[1];
  const image = review.tags.find(([name]) => name === 'image')?.[1];
  const hashtags = review.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const displayName = metadata?.name || genUserName(review.pubkey);
  const profileImage = metadata?.picture;

  const naddr = nip19.naddrEncode({
    identifier: review.tags.find(([name]) => name === 'd')?.[1] || '',
    pubkey: review.pubkey,
    kind: 34879,
  });

  const categoryEmojis: Record<string, string> = {
    'restaurant': '🍽️',
    'cafe': '☕',
    'hotel': '🏨',
    'bar-pub': '🍺',
    'grocery-store': '🛒',
    'park': '🌳',
    'museum': '🏛️',
    'hospital': '🏥',
    'bank': '🏦',
  };

  return (
    <Card className="overflow-hidden">
      {image && (
        <Link to={`/review/${naddr}`} className="block">
          <div className="aspect-video overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 flex items-center space-x-2">
              <span>{title}</span>
              <span className="text-lg">
                {categoryEmojis[category] || '📍'}
              </span>
            </CardTitle>

            <div className="flex items-center space-x-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(review)}
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Review</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this review? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(review)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{displayName}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {location && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        )}

        {review.content && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-3">{review.content}</p>
          </div>
        )}

        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Category: {category}</span>
          <span>ID: {naddr.slice(-8)}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminReviewManager() {
  const { data: reviews, isLoading, error, refetch } = useAllReviews();
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating'>('newest');
  const [editingReview, setEditingReview] = useState<NostrEvent | null>(null);

  // Filter and sort reviews
  const filteredReviews = reviews?.filter(review => {
    // Search filter
    if (searchQuery) {
      const title = review.tags.find(([name]) => name === 'title')?.[1]?.toLowerCase() || '';
      const content = review.content.toLowerCase();
      const location = review.tags.find(([name]) => name === 'location')?.[1]?.toLowerCase() || '';
      const query = searchQuery.toLowerCase();

      if (!title.includes(query) && !content.includes(query) && !location.includes(query)) {
        return false;
      }
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const category = review.tags.find(([name]) => name === 'category')?.[1];
      if (category !== categoryFilter) return false;
    }

    // Rating filter
    if (ratingFilter !== 'all') {
      const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
      const filterRating = parseInt(ratingFilter);
      if (rating !== filterRating) return false;
    }

    return true;
  }) || [];

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.created_at - a.created_at;
    }
    if (sortBy === 'oldest') {
      return a.created_at - b.created_at;
    }
    if (sortBy === 'rating') {
      const aRating = parseInt(a.tags.find(([name]) => name === 'rating')?.[1] || '0');
      const bRating = parseInt(b.tags.find(([name]) => name === 'rating')?.[1] || '0');
      return bRating - aRating;
    }
    return 0;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(
    reviews?.map(review => review.tags.find(([name]) => name === 'category')?.[1])
      .filter((category): category is string => Boolean(category)) || []
  ));

  // Calculate statistics
  const stats = {
    total: reviews?.length || 0,
    averageRating: reviews?.length ?
      reviews.reduce((sum, review) => {
        const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return sum + rating;
      }, 0) / reviews.length : 0,
    uniqueAuthors: reviews ? new Set(reviews.map(r => r.pubkey)).size : 0,
    categories: categories.length,
  };

  const handleEdit = (review: NostrEvent) => {
    setEditingReview(review);
  };

  const handleDelete = async (review: NostrEvent) => {
    try {
      // Create a deletion event (NIP-09)
      const dTag = review.tags.find(([name]) => name === 'd')?.[1];
      if (!dTag) {
        toast({
          title: 'Error',
          description: 'Cannot delete review: missing identifier',
          variant: 'destructive',
        });
        return;
      }

      createEvent({
        kind: 5, // Deletion event
        content: 'Review deleted by admin',
        tags: [
          ['e', review.id],
          ['a', `34879:${review.pubkey}:${dTag}`],
        ],
      });

      toast({
        title: 'Review deleted',
        description: 'The review has been marked for deletion.',
      });

      // Refresh the reviews list
      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete review. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEdit = () => {
    setEditingReview(null);
    refetch();
  };

  if (editingReview) {
    return (
      <EditReviewForm
        review={editingReview}
        onSave={handleSaveEdit}
        onCancel={() => setEditingReview(null)}
      />
    );
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <div className="aspect-video">
            <Skeleton className="w-full h-full" />
          </div>
          <div className="p-6 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="col-span-full">
      <Card className="border-dashed">
        <CardContent className="py-12 px-8 text-center">
          <div className="max-w-sm mx-auto space-y-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No reviews found</h3>
              <p className="text-muted-foreground">
                {error
                  ? 'Failed to load reviews. Try another relay?'
                  : searchQuery || categoryFilter !== 'all' || ratingFilter !== 'all'
                    ? 'No reviews match your search criteria.'
                    : 'No reviews available yet.'
                }
              </p>
            </div>
            <RelaySelector className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Tabs defaultValue="manage-reviews" className="w-full">
      <TabsList>
        <TabsTrigger value="manage-reviews">Manage Reviews</TabsTrigger>
        <TabsTrigger value="review-categories">Review Categories</TabsTrigger>
      </TabsList>

      <TabsContent value="manage-reviews" className="mt-6">
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reviews</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Authors</p>
                <p className="text-2xl font-bold">{stats.uniqueAuthors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{stats.categories}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search reviews</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search reviews by title, content, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <SelectItem key={rating} value={rating.toString()}>
                      {rating} Star{rating !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'rating') => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="rating">By Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchQuery || categoryFilter !== 'all' || ratingFilter !== 'all') && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {filteredReviews.length} of {reviews?.length || 0} reviews
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setRatingFilter('all');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviews Grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : sortedReviews.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
        </div>
      </TabsContent>

      <TabsContent value="review-categories" className="mt-6">
        <CategoryManager />
      </TabsContent>
    </Tabs>
  );
}