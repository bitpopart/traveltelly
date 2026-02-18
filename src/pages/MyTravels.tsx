import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUserReviews } from '@/hooks/useAllReviews';
import { useUserStories, useUserTrips, useUserMedia } from '@/hooks/useUserContent';
import { useUserCheckIns } from '@/hooks/useCheckIns';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { usePrivacySettingsData } from '@/hooks/usePrivacySettings';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { CheckInForm } from '@/components/CheckInForm';
import { MyWorldMap } from '@/components/MyWorldMap';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  Star, 
  BookOpen, 
  Camera, 
  Image as ImageIcon,
  Edit,
  Save,
  X,
  Loader2,
  Navigation as NavigationIcon,
  Calendar,
  Zap,
  Map,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

function ContentSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </CardContent>
    </Card>
  );
}

function ReviewItem({ review }: { review: NostrEvent }) {
  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = review.tags.find(([name]) => name === 'location')?.[1];
  const identifier = review.tags.find(([name]) => name === 'd')?.[1] || '';

  const naddr = nip19.naddrEncode({
    kind: review.kind,
    pubkey: review.pubkey,
    identifier,
  });

  return (
    <Link to={`/review/${naddr}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{title}</h3>
              {location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {location}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{category}</Badge>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StoryItem({ story }: { story: NostrEvent }) {
  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1];
  const identifier = story.tags.find(([name]) => name === 'd')?.[1] || '';

  const naddr = nip19.naddrEncode({
    kind: story.kind,
    pubkey: story.pubkey,
    identifier,
  });

  return (
    <Link to={`/story/${naddr}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <h3 className="font-semibold text-lg">{title}</h3>
          {summary && <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>}
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(story.created_at * 1000), { addSuffix: true })}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

function TripItem({ trip }: { trip: NostrEvent }) {
  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || 'trip';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1];
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const identifier = trip.tags.find(([name]) => name === 'd')?.[1] || '';
  const imageUrl = trip.tags.find(([name]) => name === 'image')?.[1];

  const naddr = nip19.naddrEncode({
    kind: trip.kind,
    pubkey: trip.pubkey,
    identifier,
  });

  const categoryEmojis: Record<string, string> = {
    walk: '🚶',
    hike: '🥾',
    cycling: '🚴',
  };

  return (
    <Link to={`/trip/${naddr}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {imageUrl && (
          <div className="relative aspect-video">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              thumbnail
            />
          </div>
        )}
        <CardHeader>
          <h3 className="font-semibold text-lg">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {categoryEmojis[category] || '🗺️'} {category}
            </Badge>
            {distance && (
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                <NavigationIcon className="w-3 h-3 mr-1" />
                {distance} {distanceUnit}
              </Badge>
            )}
            <p className="text-xs text-muted-foreground ml-auto">
              {formatDistanceToNow(new Date(trip.created_at * 1000), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function MediaItem({ media }: { media: NostrEvent }) {
  const title = media.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const price = media.tags.find(([name]) => name === 'price');
  const imageUrl = media.tags.find(([name]) => name === 'image')?.[1];
  const identifier = media.tags.find(([name]) => name === 'd')?.[1] || '';

  const naddr = nip19.naddrEncode({
    kind: media.kind,
    pubkey: media.pubkey,
    identifier,
  });

  return (
    <Link to={`/media/preview/${naddr}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
        {imageUrl && (
          <div className="relative aspect-square">
            <OptimizedImage
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
              thumbnail
            />
          </div>
        )}
        <CardHeader>
          <h3 className="font-semibold">{title}</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {price && (
              <p className="text-sm font-semibold">
                {price[1]} {price[2]}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(media.created_at * 1000), { addSuffix: true })}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function MyTravels() {
  const { user, metadata } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: publishProfile, isPending: isPublishing } = useNostrPublish();
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [isMyMapDialogOpen, setIsMyMapDialogOpen] = useState(false);

  const { data: reviews, isLoading: loadingReviews } = useUserReviews(user?.pubkey);
  const { data: stories, isLoading: loadingStories } = useUserStories(user?.pubkey);
  const { data: trips, isLoading: loadingTrips } = useUserTrips(user?.pubkey);
  const { data: media, isLoading: loadingMedia } = useUserMedia(user?.pubkey);
  const { data: checkIns, isLoading: loadingCheckIns } = useUserCheckIns(user?.pubkey);
  const { data: visitedCountriesEvent } = useVisitedCountries(user?.pubkey);
  const privacySettings = usePrivacySettingsData(user?.pubkey);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const displayName = metadata?.name || genUserName(user.pubkey);
  const profileImage = metadata?.picture;
  const latestCheckIn = checkIns?.[0];

  const handleEditName = () => {
    setEditedName(metadata?.name || '');
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (!editedName.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    const updatedMetadata = {
      ...metadata,
      name: editedName.trim(),
    };

    publishProfile(
      {
        kind: 0,
        content: JSON.stringify(updatedMetadata),
        tags: [],
      },
      {
        onSuccess: () => {
          setIsEditingName(false);
          toast({
            title: 'Profile updated',
            description: 'Your name has been changed',
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to update profile',
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleToggleLocationVisibility = (showLocation: boolean) => {
    publishProfile(
      {
        kind: 30078,
        content: '',
        tags: [
          ['d', 'privacy-settings'],
          ['show_location_on_profile', showLocation ? 'true' : 'false'],
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Privacy updated',
            description: showLocation 
              ? 'Latest check-in now visible on your public profile' 
              : 'Latest check-in hidden from your public profile',
          });
        },
        onError: (error) => {
          toast({
            title: 'Failed to update privacy',
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profileImage} alt={displayName} />
                  <AvatarFallback className="text-2xl">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          placeholder="Your name"
                          className="max-w-xs"
                        />
                        <Button
                          size="sm"
                          onClick={handleSaveName}
                          disabled={isPublishing}
                        >
                          {isPublishing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setIsEditingName(false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold">{displayName}</h1>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleEditName}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap mb-4">
                    <Link to={`/traveler/${user.pubkey}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full font-semibold"
                        style={{ borderColor: '#10b981', color: '#10b981' }}
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </Button>
                    </Link>
                    <Link to="/zaplytics">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full font-semibold"
                        style={{ borderColor: '#f97316', color: '#f97316' }}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Zaplytics
                      </Button>
                    </Link>
                    <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
                      <Button
                        onClick={() => setIsCheckInDialogOpen(true)}
                        size="sm"
                        className="rounded-full text-black font-semibold"
                        style={{ backgroundColor: '#ffcc00' }}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Check In
                      </Button>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Check In</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <CheckInForm onSuccess={() => setIsCheckInDialogOpen(false)} />
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Dialog open={isMyMapDialogOpen} onOpenChange={setIsMyMapDialogOpen}>
                      <Button
                        onClick={() => setIsMyMapDialogOpen(true)}
                        size="sm"
                        variant="outline"
                        className="rounded-full font-semibold"
                        style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                      >
                        <Map className="w-4 h-4 mr-2" />
                        My Map
                      </Button>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl">My World Map</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <MyWorldMap
                            userPubkey={user.pubkey}
                            checkIns={checkIns}
                            visitedCountriesEvent={visitedCountriesEvent}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                   {latestCheckIn && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2 flex-1">
                          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-blue-900 dark:text-blue-100">
                              Latest Check-In
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                              {latestCheckIn.tags.find(([name]) => name === 'location')?.[1]}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              {formatDistanceToNow(new Date(latestCheckIn.created_at * 1000), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center gap-2">
                            {privacySettings.showLocationOnProfile ? (
                              <Eye className="w-4 h-4 text-blue-600" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            )}
                            <Switch
                              checked={privacySettings.showLocationOnProfile}
                              onCheckedChange={(checked) => handleToggleLocationVisibility(checked)}
                            />
                          </div>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            {privacySettings.showLocationOnProfile ? 'Public' : 'Private'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">My Reviews</span>
                <span className="sm:hidden">Reviews</span>
                {reviews && reviews.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{reviews.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="stories" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">My Stories</span>
                <span className="sm:hidden">Stories</span>
                {stories && stories.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{stories.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="trips" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">My Trips</span>
                <span className="sm:hidden">Trips</span>
                {trips && trips.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{trips.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">My Media</span>
                <span className="sm:hidden">Media</span>
                {media && media.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{media.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reviews" className="mt-6">
              {loadingReviews ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <ContentSkeleton key={i} />
                  ))}
                </div>
              ) : !reviews || reviews.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start sharing your experiences!
                    </p>
                    <Button asChild>
                      <Link to="/create-review">Create Review</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="stories" className="mt-6">
              {loadingStories ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {Array.from({ length: 4 }, (_, i) => (
                    <ContentSkeleton key={i} />
                  ))}
                </div>
              ) : !stories || stories.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">No stories yet</h3>
                    <p className="text-muted-foreground">
                      Your travel stories will appear here
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {stories.map((story) => (
                    <StoryItem key={story.id} story={story} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trips" className="mt-6">
              {loadingTrips ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <ContentSkeleton key={i} />
                  ))}
                </div>
              ) : !trips || trips.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">No trips yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your travel adventures with photos and GPS routes!
                    </p>
                    <Button asChild>
                      <Link to="/trips">Create Trip</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <TripItem key={trip.id} trip={trip} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              {loadingMedia ? (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {Array.from({ length: 8 }, (_, i) => (
                    <ContentSkeleton key={i} />
                  ))}
                </div>
              ) : !media || media.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold text-lg mb-2">No media yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload and sell your travel photos and videos!
                    </p>
                    <Button asChild>
                      <Link to="/marketplace">Go to Marketplace</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {media.map((item) => (
                    <MediaItem key={item.id} media={item} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
