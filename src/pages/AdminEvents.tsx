import { useState } from 'react';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEventCard } from '@/components/CalendarEventCard';
import { CreateEventForm } from '@/components/CreateEventForm';
import { RelaySelector } from '@/components/RelaySelector';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CalendarIcon, 
  PlusIcon, 
  FilterIcon, 
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  TrendingUpIcon
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AdminEvents() {
  const { user } = useCurrentUser();
  const { data: events, isLoading, error } = useCalendarEvents();
  const [filter, setFilter] = useState<'all' | 'date' | 'time' | 'mine'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'start'>('start');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter events based on type and ownership
  const filteredEvents = events?.filter(event => {
    // Search filter
    if (searchQuery) {
      const title = event.tags.find(([name]) => name === 'title')?.[1]?.toLowerCase() || '';
      const summary = event.tags.find(([name]) => name === 'summary')?.[1]?.toLowerCase() || '';
      const content = event.content.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      if (!title.includes(query) && !summary.includes(query) && !content.includes(query)) {
        return false;
      }
    }

    // Type filter
    if (filter === 'all') return true;
    if (filter === 'date') return event.kind === 31922;
    if (filter === 'time') return event.kind === 31923;
    if (filter === 'mine') return user && event.pubkey === user.pubkey;
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
        aTime = new Date(aStart).getTime();
      } else {
        aTime = parseInt(aStart) * 1000;
      }
      
      if (b.kind === 31922) {
        bTime = new Date(bStart).getTime();
      } else {
        bTime = parseInt(bStart) * 1000;
      }
      
      return aTime - bTime;
    }
    return 0;
  });

  // Calculate statistics
  const stats = {
    total: events?.length || 0,
    dateEvents: events?.filter(e => e.kind === 31922).length || 0,
    timeEvents: events?.filter(e => e.kind === 31923).length || 0,
    myEvents: user ? events?.filter(e => e.pubkey === user.pubkey).length || 0 : 0,
    uniqueAuthors: events ? new Set(events.map(e => e.pubkey)).size : 0,
  };

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
                  : searchQuery 
                    ? 'No events match your search criteria.'
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SettingsIcon className="h-6 w-6" />
              <span>Admin Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You must be logged in to access the admin panel.
              </p>
              <LoginArea className="max-w-60 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <SettingsIcon className="h-8 w-8" />
              <span>Admin Events</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage and create calendar events with advanced controls
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            NIP-52 Calendar Events
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUpIcon className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">My Events</p>
                  <p className="text-2xl font-bold">{stats.myEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Authors</p>
                  <p className="text-2xl font-bold">{stats.uniqueAuthors}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Event Types</p>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {stats.dateEvents} All-Day
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      {stats.timeEvents} Timed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="manage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="manage" className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4" />
            <span>Manage Events</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <PlusIcon className="h-4 w-4" />
            <span>Create Event</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">Search events</Label>
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search events by title, summary, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <FilterIcon className="h-4 w-4 text-muted-foreground" />
                    <Select value={filter} onValueChange={(value: 'all' | 'date' | 'time' | 'mine') => setFilter(value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="mine">My Events</SelectItem>
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
              </div>

              {(searchQuery || filter !== 'all') && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {filteredEvents.length} of {events?.length || 0} events
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setFilter('all');
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

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