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
import { ShareToNostrButton } from '@/components/ShareToNostrButton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { LocationMap } from '@/components/LocationMap';
import { MapPin, Star, Calendar, ArrowLeft, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { useState } from 'react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
          {/* Back Button and Share to Nostr */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <ShareToNostrButton
              url={`/review/${naddr}`}
              title={title}
              description={review.content || `${rating}/5 stars - ${location || 'Review'}`}
              defaultContent={`Check out my review of ${title} on Traveltelly!\n\n⭐ Rating: ${rating}/5\n${location ? `📍 ${location}\n` : ''}\ntraveltelly.com/review/${naddr}`}
              variant="default"
              size="default"
            />
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

              {/* Photo Gallery */}
              {images.length > 0 && (
                <div className="space-y-4">
                  {/* Main Photo Carousel */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <OptimizedImage
                      src={images[currentImageIndex]}
                      alt={`${title} - Photo ${currentImageIndex + 1}`}
                      className="w-full max-h-96 object-cover"
                      blurUp={true}
                      priority={true}
                    />
                    
                    {/* Navigation Arrows */}
                    {images.length > 1 && (
                      <>
                        {currentImageIndex > 0 && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </Button>
                        )}
                        
                        {currentImageIndex < images.length - 1 && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                            onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                          >
                            <ChevronRight className="w-6 h-6" />
                          </Button>
                        )}
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Gallery */}
                  {images.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {images.map((imageUrl, index) => (
                        <div 
                          key={index} 
                          className={`rounded-lg overflow-hidden aspect-square cursor-pointer hover:opacity-90 transition-all border-2 ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-300' 
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => setCurrentImageIndex(index)}
                        >
                          <OptimizedImage
                            src={imageUrl}
                            alt={`${title} - Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            blurUp={true}
                            thumbnail={true}
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