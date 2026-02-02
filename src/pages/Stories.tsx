import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
import { OptimizedImage } from '@/components/OptimizedImage';
import { CreateArticleForm } from '@/components/CreateArticleForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import {
  BookOpen,
  Calendar,
  MapPin,
  Plus,
  List
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import { Link, useSearchParams } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

interface StoryCardProps {
  story: NostrEvent;
}

function StoryCard({ story }: StoryCardProps) {
  const author = useAuthor(story.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(story.pubkey);
  const profileImage = metadata?.picture;

  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Article';
  const location = story.tags.find(([name]) => name === 'location')?.[1];
  const image = story.tags.find(([name]) => name === 'image')?.[1];
  const summary = story.tags.find(([name]) => name === 'summary')?.[1];

  const publishedAt = story.tags.find(([name]) => name === 'published_at')?.[1];
  const displayDate = publishedAt ?
    new Date(parseInt(publishedAt) * 1000) :
    new Date(story.created_at * 1000);

  const topicTags = story.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0 && !['travel', 'traveltelly'].includes(tag))
    .slice(0, 2);

  // Create naddr for linking
  const identifier = story.tags.find(([name]) => name === 'd')?.[1];
  if (!identifier || typeof identifier !== 'string') {
    console.error('Invalid story identifier:', identifier);
    return null;
  }
  
  const naddr = nip19.naddrEncode({
    kind: story.kind,
    pubkey: story.pubkey,
    identifier,
  });

  return (
    <Link to={`/story/${naddr}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
      {image && (
        <div className="relative aspect-video overflow-hidden">
          <OptimizedImage
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            blurUp={true}
            priority={false}
            thumbnail={true}
          />
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
                {formatDistanceToNow(displayDate, { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          {location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3" />
              {location}
            </p>
          )}
          {summary && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{summary}</p>
          )}
        </div>

        {topicTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {topicTags.map(tag => (
              <Badge key={tag} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
    </Card>
    </Link>
  );
}

function StorySkeleton() {
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
      </CardHeader>
    </Card>
  );
}

function validateNIP23Article(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  return !!(d && title && event.content.length > 100);
}

function useStories() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['traveltelly-nip23-articles-all'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query stories with traveltelly tag to filter out template/demo stories
      const events = await nostr.query([
        {
          kinds: [30023],
          '#t': ['traveltelly'],
          limit: 100,
        }
      ], { signal });

      const validArticles = events.filter(validateNIP23Article);

      return validArticles.sort((a, b) => {
        const aPublished = a.tags.find(([name]) => name === 'published_at')?.[1];
        const bPublished = b.tags.find(([name]) => name === 'published_at')?.[1];

        const aTime = aPublished ? parseInt(aPublished) : a.created_at;
        const bTime = bPublished ? parseInt(bPublished) : b.created_at;

        return bTime - aTime;
      });
    },
  });
}

export default function Stories() {
  const { user } = useCurrentUser();
  const { data: stories, isLoading, error } = useStories();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'browse');

  // Update tab from URL on mount and when searchParams change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'create' || tab === 'browse') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#b2d23520' }}>
                <BookOpen className="w-8 h-8" style={{ color: '#b2d235' }} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Stories</h1>
                <p className="text-muted-foreground">Travel stories from the Nostr community</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full max-w-md mb-8" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Browse Stories
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Story
              </TabsTrigger>
            </TabsList>

            {/* Browse Tab */}
            <TabsContent value="browse" className="mt-0">

              {error ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <p className="text-muted-foreground">
                        Failed to load stories. Try another relay?
                      </p>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <StorySkeleton key={i} />
                  ))}
                </div>
              ) : !stories || stories.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <BookOpen className="w-16 h-16 mx-auto" style={{ color: '#b2d235' }} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">No stories found</h3>
                        <p className="text-muted-foreground mb-4">
                          No travel stories are available on this relay. Try switching to another relay or create your own!
                        </p>
                      </div>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="mt-0">
              <CreateArticleForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
