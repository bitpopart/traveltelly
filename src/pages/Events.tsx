import { useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import { CreateEventForm } from '@/components/CreateEventForm';
import { RelaySelector } from '@/components/RelaySelector';
import { Card, CardContent } from '@/components/ui/card';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, PlusIcon, FilterIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Events() {
  const { data: events, isLoading, error } = useCalendarEvents();
  const [filter, setFilter] = useState<'all' | 'date' | 'time'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'start'>('start');

  // Filter events based on type
  const filteredEvents = events?.filter(event => {
    if (filter === 'all') return true;
    if (filter === 'date') return event.kind === 31922;
    if (filter === 'time') return event.kind === 31923;
    return true;
  }) || [];

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'newest') {
      return b.created_at - a.created_at;
    }
    if (sortBy === 'oldest') {
      return a.created_at - b.created_at;
    }
    if (sortBy === 'start') {
      const aStart = a.tags.find(([name]) => name === 'start')?.[1];
      const bStart = b.tags.find(([name]) => name === 'start')?.[1];

      if (!aStart || !bStart) return 0;

      // Handle different date formats
      let aTime: number;
      let bTime: number;

      if (a.kind === 31922) {
        // Date format YYYY-MM-DD
        aTime = new Date(aStart).getTime();
      } else {
        // Unix timestamp
        aTime = parseInt(aStart) * 1000;
      }

      if (b.kind === 31922) {
        // Date format YYYY-MM-DD
        bTime = new Date(bStart).getTime();
      } else {
        // Unix timestamp
        bTime = parseInt(bStart) * 1000;
      }

      return aTime - bTime;
    }
    return 0;
  });

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
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-6 w-16" />
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
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {error
                  ? 'Failed to load events. Try another relay?'
                  : 'No calendar events available. Create the first one!'
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <CalendarIcon className="h-8 w-8" />
              <span>Events</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover and create calendar events on Nostr
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            NIP-52 Calendar Events
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="browse" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Browse Events</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Create Event</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FilterIcon className="h-4 w-4 text-muted-foreground" />
                <Select value={filter} onValueChange={(value: 'all' | 'date' | 'time') => setFilter(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="date">All-Day</SelectItem>
                    <SelectItem value="time">Timed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'start') => setSortBy(value)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="start">By Start Date</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {events && events.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {filteredEvents.length} of {events.length} events
              </div>
            )}
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : sortedEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => (
                <CalendarEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create">
          <CreateEventForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}