import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useContentByLocation, type ContentItem } from '@/hooks/useContentByLocation';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { MapPin, Star, Camera, BookOpen, FileImage, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface LocationContentGridProps {
  locationTag: string;
}

function ContentCard({ item }: { item: ContentItem }) {
  const author = useAuthor(item.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(item.event.pubkey);

  const getIcon = () => {
    switch (item.type) {
      case 'review':
        const rating = parseInt(item.event.tags.find(([name]) => name === 'rating')?.[1] || '0');
        return (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{rating}/5</span>
          </div>
        );
      case 'trip':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'story':
        return <BookOpen className="w-4 h-4 text-purple-600" />;
      case 'media':
        return <FileImage className="w-4 h-4 text-orange-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'review': return 'Review';
      case 'trip': return 'Trip';
      case 'story': return 'Story';
      case 'media': return 'Stock Media';
    }
  };

  const getLink = () => {
    switch (item.type) {
      case 'review': return `/review/${item.naddr}`;
      case 'trip': return `/trip/${item.naddr}`;
      case 'story': return `/story/${item.naddr}`;
      case 'media': return `/media/preview/${item.naddr}`;
    }
  };

  return (
    <Link to={getLink()}>
      <Card className="hover:shadow-lg transition-shadow h-full">
        {/* Image */}
        {item.image && (
          <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <OptimizedImage
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
              thumbnail={true}
            />
            <Badge 
              variant="secondary" 
              className="absolute top-2 left-2 text-xs"
            >
              {getTypeLabel()}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon()}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(item.createdAt * 1000), { addSuffix: true })}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <h3 className="font-semibold text-lg line-clamp-2 hover:text-orange-600 transition-colors">
            {item.title}
          </h3>

          {item.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{item.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={metadata?.picture} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {displayName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function LocationContentGrid({ locationTag }: LocationContentGridProps) {
  const { data: content, isLoading } = useContentByLocation(locationTag);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <Skeleton className="aspect-video" />
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            No content found for this location yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">
          {content.length} {content.length === 1 ? 'item' : 'items'} in {locationTag}
        </h3>
        <Badge variant="secondary">
          {content.filter(c => c.type === 'review').length} Reviews • 
          {content.filter(c => c.type === 'trip').length} Trips • 
          {content.filter(c => c.type === 'story').length} Stories • 
          {content.filter(c => c.type === 'media').length} Media
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
