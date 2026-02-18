import { useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorldMapImage } from '@/components/WorldMapImage';
import { useAuthor } from '@/hooks/useAuthor';
import { useUserReviews } from '@/hooks/useAllReviews';
import { useUserStories, useUserTrips, useUserMedia } from '@/hooks/useUserContent';
import { useUserCheckIns } from '@/hooks/useCheckIns';
import { useVisitedCountries } from '@/hooks/useVisitedCountries';
import { usePrivacySettingsData } from '@/hooks/usePrivacySettings';
import { genUserName } from '@/lib/genUserName';
import { COUNTRIES } from '@/lib/countries';
import { 
  MapPin, 
  Star, 
  BookOpen, 
  Camera, 
  Image as ImageIcon,
  Globe,
  Calendar,
  ExternalLink,
  Mail
} from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

// Admin npub
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

function ProfileSkeleton() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

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

export default function TravelerProfile() {
  const { username } = useParams<{ username: string }>();

  // Resolve username to pubkey
  const pubkey = useMemo(() => {
    if (!username) return null;
    
    // Check if username is "traveltelly" (admin)
    if (username.toLowerCase() === 'traveltelly') {
      try {
        const decoded = nip19.decode(ADMIN_NPUB);
        if (decoded.type === 'npub') {
          return decoded.data;
        }
      } catch (e) {
        console.error('Failed to decode admin npub:', e);
      }
    }
    
    // Try to decode as npub
    if (username.startsWith('npub1')) {
      try {
        const decoded = nip19.decode(username);
        if (decoded.type === 'npub') {
          return decoded.data;
        }
      } catch (e) {
        // Not a valid npub, will try as name
      }
    }
    
    // If it's a hex pubkey (64 characters)
    if (/^[0-9a-f]{64}$/i.test(username)) {
      return username.toLowerCase();
    }
    
    // Otherwise, we'll need to look up by name (not implemented yet)
    // For now, return null and show not found
    return null;
  }, [username]);

  const author = useAuthor(pubkey || '');
  const metadata = author.data?.metadata;
  const { data: reviews, isLoading: loadingReviews } = useUserReviews(pubkey);
  const { data: stories, isLoading: loadingStories } = useUserStories(pubkey);
  const { data: trips, isLoading: loadingTrips } = useUserTrips(pubkey);
  const { data: media, isLoading: loadingMedia } = useUserMedia(pubkey);
  const { data: checkIns, isLoading: loadingCheckIns } = useUserCheckIns(pubkey);
  const { data: visitedCountriesEvent } = useVisitedCountries(pubkey);
  const privacySettings = usePrivacySettingsData(pubkey);

  if (!username) {
    return <Navigate to="/" replace />;
  }

  if (!pubkey) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Traveler Not Found</h2>
              <p className="text-muted-foreground mb-6">
                We couldn't find a traveler with username "{username}"
              </p>
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const displayName = metadata?.name || genUserName(pubkey);
  const profileImage = metadata?.picture;
  const about = metadata?.about;
  const website = metadata?.website;
  const nip05 = metadata?.nip05;
  const latestCheckIn = checkIns?.[0];

  // Parse visited countries
  const visitedCountries = useMemo(() => {
    if (!visitedCountriesEvent) return [];
    return visitedCountriesEvent.tags
      .filter(([name]) => name === 'country')
      .map(([, code]) => code);
  }, [visitedCountriesEvent]);

  const isLoading = author.isLoading;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          {isLoading ? (
            <ProfileSkeleton />
          ) : (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6 flex-wrap">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profileImage} alt={displayName} />
                    <AvatarFallback className="text-2xl">
                      {displayName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
                    
                    {about && (
                      <p className="text-muted-foreground mb-4">{about}</p>
                    )}

                    <div className="flex gap-3 flex-wrap mb-4">
                      {nip05 && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {nip05}
                        </Badge>
                      )}
                      {website && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          <a 
                            href={website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Website
                          </a>
                        </Badge>
                      )}
                    </div>

                    {latestCheckIn && privacySettings.showLocationOnProfile && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex items-start gap-2">
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
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visited Countries Map */}
          {visitedCountries.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      {displayName}'s Travel Map
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Visited {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 text-lg px-4 py-2"
                  >
                    {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <WorldMapImage
                  visitedCountries={visitedCountries}
                  className="w-full"
                />
              </CardContent>
            </Card>
          )}

          {/* Content Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <div className="text-2xl font-bold">{reviews?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stories?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Stories</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{trips?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Trips</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <div className="text-2xl font-bold">{checkIns?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Check-ins</div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="reviews">
                <Star className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="stories">
                <BookOpen className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="trips">
                <Camera className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Trips</span>
              </TabsTrigger>
              <TabsTrigger value="media">
                <ImageIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Media</span>
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
                    <p className="text-muted-foreground">No reviews yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {reviews.map((review) => {
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
                      <Link key={review.id} to={`/review/${naddr}`}>
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
                  })}
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
                    <p className="text-muted-foreground">No stories yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {stories.map((story) => {
                    const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
                    const summary = story.tags.find(([name]) => name === 'summary')?.[1];
                    const identifier = story.tags.find(([name]) => name === 'd')?.[1] || '';

                    const naddr = nip19.naddrEncode({
                      kind: story.kind,
                      pubkey: story.pubkey,
                      identifier,
                    });

                    return (
                      <Link key={story.id} to={`/story/${naddr}`}>
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
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="trips" className="mt-6">
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Trips content - {trips?.length || 0} total
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Media content - {media?.length || 0} total
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
