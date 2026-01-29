import { useSeoMeta } from '@unhead/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ShareButton } from '@/components/ShareButton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { LocationMap } from '@/components/LocationMap';
import { MapPin, Star, Calendar, ArrowLeft, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';
import { Navigation as NavigationComponent } from '@/components/Navigation';

import { ZapAuthorButton } from '@/components/ZapAuthorButton';
import { ZapButton } from '@/components/ZapButton';
import { CommentSection } from '@/components/CommentSection';
import { ShareLocationButton } from '@/components/ShareLocationButton';
import { getShortNpub, getFullNpub, getCategoryEmoji, normalizeCategory } from '@/lib/nostrUtils';
import * as geohash from 'ngeohash';
import { trackCoordinates } from '@/lib/coordinateVerification';

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

function decodeGeohash(geohashStr: string): { lat: number; lng: number } {
  try {
    const decoded = geohash.decode(geohashStr);
    const result = {
      lat: decoded.latitude,
      lng: decoded.longitude,
    };
    console.log(`🗺️ Decoding geohash: ${geohashStr} → lat=${result.lat}, lng=${result.lng}`);

    // Track coordinates when viewing review
    trackCoordinates('REVIEW_DISPLAY', result.lat, result.lng, `Review detail page (geohash: ${geohashStr})`);

    return result;
  } catch (error) {
    console.error('Error decoding geohash:', geohashStr, error);
    throw error;
  }
}

const ReviewDetail = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const { nostr } = useNostr();

  const { data: review, isLoading, error } = useQuery({
    queryKey: ['review', naddr],
    queryFn: async (c) => {
      if (!naddr) throw new Error('No review identifier provided');

      try {
        const decoded = nip19.decode(naddr);
        if (decoded.type !== 'naddr') {
          throw new Error('Invalid review identifier');
        }

        const { kind, pubkey, identifier } = decoded.data;

        const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
        const events = await nostr.query([{
          kinds: [kind],
          authors: [pubkey],
          '#d': [identifier],
        }], { signal });

        const validReviews = events.filter(validateReviewEvent);
        return validReviews[0] || null;
      } catch (error) {
        console.error('Error decoding naddr:', error);
        throw new Error('Invalid review identifier');
      }
    },
    enabled: !!naddr,
  });

  const author = useAuthor(review?.pubkey || '');
  const metadata = author.data?.metadata;

  useSeoMeta({
    title: review ? `${review.tags.find(([name]) => name === 'title')?.[1]} - Review | Traveltelly` : 'Review | Traveltelly',
    description: review ? `Review by ${metadata?.name || 'Anonymous'}: ${review.content.slice(0, 160)}` : 'View detailed review on Traveltelly',
  });

  if (error) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <NavigationComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Review not found or failed to load.
                </p>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <NavigationComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Loading review...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <NavigationComponent />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-dashed">
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Review not found.
                </p>
                <Button variant="outline" onClick={() => window.history.back()}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
  const rating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const description = review.tags.find(([name]) => name === 'description')?.[1];
  const location = review.tags.find(([name]) => name === 'location')?.[1];
  const geohashStr = review.tags.find(([name]) => name === 'g')?.[1];
  const images = review.tags.filter(([name]) => name === 'image').map(([, url]) => url);
  const mainImage = images[0];

  const displayName = metadata?.name || genUserName(review.pubkey);
  const profileImage = metadata?.picture;

  const coordinates = geohashStr ? decodeGeohash(geohashStr) : null;

  console.log('📋 Review Detail - Category:', { 
    original: category, 
    normalized: normalizeCategory(category),
    coordinates: coordinates ? 'yes' : 'no'
  });

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

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <NavigationComponent />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Review Card */}
          <Card className="mb-6">
            <CardHeader>
              {/* Author Info and Stars - Mobile Optimized */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0">
                      <AvatarImage src={profileImage} alt={displayName} />
                      <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-base sm:text-lg truncate">{displayName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{formatDistanceToNow(new Date(review.created_at * 1000), { addSuffix: true })}</span>
                      </p>
                      <p
                        className="text-xs text-muted-foreground font-mono cursor-pointer hover:text-blue-600 truncate"
                        onClick={() => navigator.clipboard.writeText(getFullNpub(review.pubkey))}
                        title="Click to copy full npub"
                      >
                        {getShortNpub(review.pubkey)}
                      </p>
                    </div>
                  </div>
                  <ZapAuthorButton
                    authorPubkey={review.pubkey}
                    event={review}
                    showAuthorName={false}
                    size="sm"
                    className="flex-shrink-0"
                  />
                </div>
                
                {/* Stars and Open in Maps Button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  {/* Open in Maps Button */}
                  {coordinates && (
                    <Button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
                        window.open(url, '_blank');
                      }}
                      className="rounded-full text-white hover:opacity-90 transition-opacity w-full sm:w-auto"
                      style={{ backgroundColor: '#27b0ff' }}
                      size="sm"
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      Open in Maps
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Title and Category */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getCategoryEmoji(category, categoryEmojis)}</span>
                  <h1 className="text-3xl font-bold">{title}</h1>
                </div>

                {description && (
                  <p className="text-lg text-muted-foreground">{description}</p>
                )}

                <div className="flex items-center gap-4 mt-3">
                  <Badge variant="outline" className="capitalize">
                    {category.replace('-', ' ')}
                  </Badge>

                  {location && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </p>
                  )}
                </div>
              </div>

              {/* Photos */}
              {images.length > 0 && (
                <div className="space-y-4">
                  {/* Main Photo */}
                  <div className="rounded-lg overflow-hidden">
                    <OptimizedImage
                      src={mainImage}
                      alt={title}
                      className="w-full max-h-96 object-cover"
                      blurUp={true}
                      priority={true}
                    />
                  </div>
                  
                  {/* Additional Photos Grid */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {images.slice(1).map((imageUrl, index) => (
                        <div key={index} className="rounded-lg overflow-hidden aspect-square">
                          <OptimizedImage
                            src={imageUrl}
                            alt={`${title} - Photo ${index + 2}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            blurUp={true}
                            onClick={() => window.open(imageUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Review Content */}
              {review.content && (
                <div className="prose dark:prose-invert max-w-none">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {review.content}
                  </p>
                </div>
              )}

              {/* Action Buttons - positioned prominently after content */}
              <div className="flex items-center gap-3 pt-4">
                <ZapButton
                  authorPubkey={review.pubkey}
                  event={review}
                  variant="prominent"
                  size="default"
                />
                <ShareButton
                  url={`/review/${naddr}`}
                  title={title}
                  description={review.content || `${rating}/5 stars - ${location || 'Review'}`}
                  image={mainImage}
                  variant="outline"
                  size="default"
                />
              </div>

              {/* Map */}
              {coordinates && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </h3>
                  <div className="h-64 rounded-lg overflow-hidden border">
                    <LocationMap
                      initialLocation={coordinates}
                      onLocationSelect={() => {}} // No-op for readonly
                      readonly={true}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </p>
                    <ShareLocationButton 
                      lat={coordinates.lat} 
                      lng={coordinates.lng}
                      title={title}
                      className="rounded-full text-white"
                      variant="default"
                      style={{ backgroundColor: '#27b0ff' }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Rating: {rating}/5 stars
                  </span>
                </div>

                <ZapAuthorButton
                  authorPubkey={review.pubkey}
                  event={review}
                  variant="default"
                  size="default"
                  showAuthorName={true}
                  className="px-6"
                />
              </div>
            </CardContent>
          </Card>

          {/* Comment Section */}
          <CommentSection review={review} />
        </div>
      </div>
    </div>
  );
};

export default ReviewDetail;