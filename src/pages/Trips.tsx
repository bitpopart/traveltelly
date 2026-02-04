import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CreateTripForm } from '@/components/CreateTripForm';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTrips } from '@/hooks/useTrips';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MapPin, Plus, Camera, Calendar, Navigation as NavigationIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface TripCardProps {
  trip: NostrEvent;
}

function TripCard({ trip }: TripCardProps) {
  const author = useAuthor(trip.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(trip.pubkey);
  const profileImage = metadata?.picture;

  // Extract trip data from tags
  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
  const summary = trip.tags.find(([name]) => name === 'summary')?.[1];
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || 'trip';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1];
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const identifier = trip.tags.find(([name]) => name === 'd')?.[1] || '';

  // Get all photos
  const photoTags = trip.tags.filter(([name]) => name === 'image');
  const photos = photoTags.map(tag => ({
    url: tag[1],
    lat: tag[2] ? parseFloat(tag[2]) : undefined,
    lon: tag[3] ? parseFloat(tag[3]) : undefined,
  }));

  // Get first photo for thumbnail
  const thumbnailUrl = photos[0]?.url;

  // Category emoji mapping
  const categoryEmojis: Record<string, string> = {
    walk: '🚶',
    hike: '🥾',
    cycling: '🚴',
  };

  const categoryEmoji = categoryEmojis[category] || '🗺️';

  // Create naddr for linking
  const naddr = nip19.naddrEncode({
    kind: trip.kind,
    pubkey: trip.pubkey,
    identifier,
  });

  return (
    <Link to={`/trip/${naddr}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
        {thumbnailUrl && (
          <div className="relative aspect-video overflow-hidden">
            <OptimizedImage
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              priority={false}
              blurUp={true}
              thumbnail={true}
            />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
              <Camera className="w-3 h-3 text-white" />
              <span className="text-xs text-white font-medium">{photos.length}</span>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback>
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{displayName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(trip.created_at * 1000), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {summary && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{summary}</p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" style={{ backgroundColor: '#ffcc0020', borderColor: '#ffcc00', color: '#000' }}>
              {categoryEmoji} {category.charAt(0).toUpperCase() + category.slice(1)}
            </Badge>
            {distance && (
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                <NavigationIcon className="w-3 h-3 mr-1" />
                {distance} {distanceUnit}
              </Badge>
            )}
            {photos.filter(p => p.lat && p.lon).length > 0 && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                <MapPin className="w-3 h-3 mr-1" />
                GPS Route
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

function TripSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3 mb-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
    </Card>
  );
}

export default function Trips() {
  const { user } = useCurrentUser();
  const { data: trips, isLoading, error } = useTrips();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#ffcc0020' }}>
                  <MapPin className="w-8 h-8" style={{ color: '#ffcc00' }} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold">Trips</h1>
                  <p className="text-muted-foreground">
                    Travel adventures with photos and GPS routes
                  </p>
                </div>
              </div>
              
              {user && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    size="lg"
                    className="rounded-full text-black font-semibold"
                    style={{ backgroundColor: '#ffcc00' }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Trip
                  </Button>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Create New Trip</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <CreateTripForm onSuccess={() => setIsCreateDialogOpen(false)} />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Trips Grid */}
          {error ? (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    Failed to load trips. Try another relay?
                  </p>
                  <RelaySelector className="w-full" />
                </div>
              </CardContent>
            </Card>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <TripSkeleton key={i} />
              ))}
            </div>
          ) : !trips || trips.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <MapPin className="w-16 h-16 mx-auto" style={{ color: '#ffcc00' }} />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">No trips found</h3>
                    <p className="text-muted-foreground mb-4">
                      {user 
                        ? 'Be the first to share a trip adventure!' 
                        : 'No trips are available on this relay. Try switching to another relay.'}
                    </p>
                  </div>
                  {user ? (
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      size="lg"
                      className="rounded-full text-black font-semibold"
                      style={{ backgroundColor: '#ffcc00' }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Trip
                    </Button>
                  ) : (
                    <RelaySelector className="w-full" />
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
