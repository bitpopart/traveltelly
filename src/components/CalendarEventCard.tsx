import type { NostrEvent } from '@nostrify/nostrify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon } from 'lucide-react';

interface CalendarEventCardProps {
  event: NostrEvent;
}

export function CalendarEventCard({ event }: CalendarEventCardProps) {
  const author = useAuthor(event.pubkey);
  const metadata = author.data?.metadata;

  // Extract event data from tags
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Event';
  const summary = event.tags.find(([name]) => name === 'summary')?.[1];
  const start = event.tags.find(([name]) => name === 'start')?.[1];
  const end = event.tags.find(([name]) => name === 'end')?.[1];
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const participants = event.tags.filter(([name]) => name === 'p');
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const displayName = metadata?.name ?? genUserName(event.pubkey);
  const profileImage = metadata?.picture;

  // Format dates based on event type
  const formatEventTime = () => {
    if (!start) return null;

    if (event.kind === 31922) {
      // Date-based event (YYYY-MM-DD format)
      const startDate = new Date(start);
      const endDate = end ? new Date(end) : null;
      
      if (endDate && endDate.getTime() !== startDate.getTime()) {
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      }
      return startDate.toLocaleDateString();
    } else {
      // Time-based event (unix timestamp)
      const startDate = new Date(parseInt(start) * 1000);
      const endDate = end ? new Date(parseInt(end) * 1000) : null;
      
      if (endDate) {
        return `${startDate.toLocaleString()} - ${endDate.toLocaleString()}`;
      }
      return startDate.toLocaleString();
    }
  };

  const eventTime = formatEventTime();

  return (
    <Card className="overflow-hidden">
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            {summary && (
              <p className="text-sm text-muted-foreground mb-3">{summary}</p>
            )}
          </div>
          <Badge variant={event.kind === 31922 ? "secondary" : "default"}>
            {event.kind === 31922 ? "All Day" : "Timed"}
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="text-xs">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{displayName}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {eventTime && (
          <div className="flex items-center space-x-2 text-sm">
            {event.kind === 31922 ? (
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{eventTime}</span>
          </div>
        )}

        {location && (
          <div className="flex items-center space-x-2 text-sm">
            <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            <span>{location}</span>
          </div>
        )}

        {participants.length > 0 && (
          <div className="flex items-center space-x-2 text-sm">
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {event.content && (
          <div className="text-sm text-muted-foreground">
            <p className="line-clamp-3">{event.content}</p>
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
      </CardContent>
    </Card>
  );
}