import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { TripMap } from '@/components/TripMap';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ShareButton } from '@/components/ShareButton';
import { useTrip } from '@/hooks/useTrips';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Calendar, 
  Navigation as NavigationIcon,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TripDetail() {
  const { naddr } = useParams<{ naddr: string }>();
  const { data: trip, isLoading } = useTrip(naddr || '');
  const author = useAuthor(trip?.pubkey || '');
  const metadata = author.data?.metadata;

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-8" />
            <Skeleton className="h-[500px] w-full rounded-lg mb-8" />
            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="aspect-square" />
              <Skeleton className="aspect-square" />
              <Skeleton className="aspect-square" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Trip not found</h3>
                <p className="text-muted-foreground mb-6">
                  This trip doesn't exist or couldn't be loaded
                </p>
                <Link to="/trips">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Trips
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Extract trip data
  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
  const summary = trip.tags.find(([name]) => name === 'summary')?.[1];
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || 'trip';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1];
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  
  const photoTags = trip.tags.filter(([name]) => name === 'image');
  const photos = photoTags
    .map((tag, index) => ({
      url: tag[1],
      lat: tag[2] ? parseFloat(tag[2]) : undefined,
      lon: tag[3] ? parseFloat(tag[3]) : undefined,
      timestamp: tag[4] ? parseInt(tag[4]) : undefined,
      index,
    }))
    .filter(p => p.lat !== undefined && p.lon !== undefined) as Array<{
      url: string;
      lat: number;
      lon: number;
      timestamp?: number;
      index: number;
    }>;

  const allPhotos = photoTags.map(tag => tag[1]);

  const displayName = metadata?.name || genUserName(trip.pubkey);
  const profileImage = metadata?.picture;

  const categoryEmojis: Record<string, string> = {
    walk: '🚶',
    hike: '🥾',
    cycling: '🚴',
  };

  const categoryEmoji = categoryEmojis[category] || '🗺️';

  // Convert distance to miles for display
  const distanceInMiles = distance ? (parseFloat(distance) * 0.621371).toFixed(2) : null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <Link to="/trips">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trips
            </Button>
          </Link>

          {/* Trip Header */}
          <div className="mb-8">
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback>
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <span className="font-medium">{displayName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDistanceToNow(new Date(trip.created_at * 1000), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <Badge variant="outline" style={{ backgroundColor: '#ffcc0020', borderColor: '#ffcc00', color: '#000' }}>
                    {categoryEmoji} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Badge>
                  {distance && (
                    <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                      <NavigationIcon className="w-3 h-3 mr-1" />
                      {distance} {distanceUnit} ({distanceInMiles} mi)
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                    <Camera className="w-3 h-3 mr-1" />
                    {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}
                  </Badge>
                  {photos.length > 0 && (
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
                      <MapPin className="w-3 h-3 mr-1" />
                      {photos.length} GPS point{photos.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                <ShareButton
                  url={`/trip/${naddr}`}
                  title={title}
                  description={summary || `Trip with ${allPhotos.length} photos`}
                  image={allPhotos[0]}
                  variant="outline"
                  size="default"
                />
              </div>
            </div>

            {summary && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{summary}</p>
                </CardContent>
              </Card>
            )}

            {trip.content && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{trip.content}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Route Map */}
          {photos.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: '#ffcc00' }} />
                  Trip Route
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TripMap photos={photos} />
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Note:</strong> The route is created from the photos uploaded and is not the exact route made. 
                      It shows you only the points of interest where photos were taken.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Photo Gallery */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5" style={{ color: '#ffcc00' }} />
                Photos ({allPhotos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {allPhotos.map((photoUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square overflow-hidden rounded-lg">
                      <OptimizedImage
                        src={photoUrl}
                        alt={`${title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        priority={index < 3}
                        blurUp={true}
                      />
                    </div>
                    {photos.find(p => p.url === photoUrl) && (
                      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-medium">
                        <MapPin className="w-3 h-3" />
                        {photos.findIndex(p => p.url === photoUrl) + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
