import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';;
import { Button } from '@/components/ui/button';
;
;
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
;
import { CreateArticleForm } from '@/components/CreateArticleForm';
import { CreateVideoStoryForm } from '@/components/CreateVideoStoryForm';
import { UploadHtmlStoryForm } from '@/components/UploadHtmlStoryForm';
;
import { VideoThumbnailGrid } from '@/components/VideoThumbnailGrid';
import { WrittenStoryThumbnailGrid } from '@/components/WrittenStoryThumbnailGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { NRelay1 } from '@nostrify/nostrify';
;
;
;
import { BookOpen, Plus, Video, FileText } from 'lucide-react';;
;
;
import { useSearchParams } from 'react-router-dom';;
;
import type { NostrEvent } from '@nostrify/nostrify';

function validateNIP23Article(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  if (!d || !title) {
    return false;
  }

  // HTML page stories (brand_site tag) are always valid — they have a full page attached
  const hasBrandSite = !!event.tags.find(([name]) => name === 'brand_site')?.[1];
  if (hasBrandSite) return true;

  // Regular stories need meaningful content
  if (event.content.length < 100) {
    return false;
  }

  // Filter out template/placeholder content
  const lowerContent = event.content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  const placeholderKeywords = [
    'lorem ipsum',
    'placeholder',
    'template',
    'sample article',
    'example article',
    'test article',
    'demo article',
    'dolor sit amet',
  ];

  // Check if content or title contains placeholder keywords
  const hasPlaceholder = placeholderKeywords.some(keyword => 
    lowerContent.includes(keyword) || lowerTitle.includes(keyword)
  );

  if (hasPlaceholder) {
    return false;
  }

  return true;
}

const ADMIN_PUBKEY = '7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35';

const VIDEO_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.dreamith.to',
  'wss://relay.primal.net',
];

/**
 * Fetch all videos directly from all 3 relays in parallel, bypassing the
 * NPool's eoseTimeout. Each relay streams events; we keep limits modest so
 * the grid renders fast.
 */
async function fetchVideosDirect(signal: AbortSignal): Promise<NostrEvent[]> {
  const results = await Promise.allSettled(
    VIDEO_RELAYS.map(async (url) => {
      const relay = new NRelay1(url);
      try {
        const events = await relay.query([
          { kinds: [34235, 34236, 21, 22], '#t': ['traveltelly'], limit: 120 },
          { kinds: [34235, 34236, 21, 22], authors: [ADMIN_PUBKEY], limit: 120 },
        ], { signal });
        return events;
      } finally {
        relay.close?.();
      }
    })
  );

  const seen = new Map<string, NostrEvent>();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const e of r.value) {
        if (!seen.has(e.id)) seen.set(e.id, e);
      }
    }
  }
  return Array.from(seen.values());
}

function useStories(type: 'write' | 'video' = 'write') {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['traveltelly-stories', type],
    queryFn: async (c) => {
      if (type === 'video') {
        // Bypass NPool — query all 3 relays directly so eoseTimeout doesn't cut us off
        const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
        const events = await fetchVideosDirect(signal);
        return events.sort((a, b) => b.created_at - a.created_at);
      } else {
        // Written stories — NPool is fine here (small dataset, quick)
        const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
        const events = await nostr.query([
          {
            kinds: [30023],
            authors: [ADMIN_PUBKEY],
            '#t': ['traveltelly'],
            limit: 40,
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
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

export default function Stories() {
  const { user } = useCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [storyType, setStoryType] = useState<'write' | 'video'>(
    (searchParams.get('type') as 'write' | 'video') || 'video'
  );
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'browse');

  const { data: stories = [], isLoading, isFetching, error } = useStories(storyType);

  // Update from URL on mount and when searchParams change
  useEffect(() => {
    const tab = searchParams.get('tab');
    const type = searchParams.get('type') as 'write' | 'video';
    if (tab === 'create' || tab === 'browse') {
      setActiveTab(tab);
    }
    if (type === 'write' || type === 'video') {
      setStoryType(type);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value, type: storyType });
  };

  const handleStoryTypeChange = (type: 'write' | 'video') => {
    setStoryType(type);
    setSearchParams({ tab: activeTab, type });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      <div className="container mx-auto px-2 md:px-4 pt-2 pb-3 md:pt-3 md:pb-6">
        <div className="max-w-6xl mx-auto">

          {/* Compact header row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            {/* Left: title + type pills */}
            <div className="flex items-center gap-3 min-w-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl md:text-2xl font-bold leading-none">Stories</h1>
                  {/* Type toggle pills */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStoryTypeChange('video')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        storyType === 'video'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-purple-300 hover:text-purple-600'
                      }`}
                    >
                      <Video className="w-3 h-3" />
                      Video
                    </button>
                    <button
                      onClick={() => handleStoryTypeChange('write')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        storyType === 'write'
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-green-300 hover:text-green-600'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      Written
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">Travel stories from the Nostr community</p>
              </div>
            </div>

            {/* Right: Create button */}
            <Button
              size="sm"
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => handleTabChange(activeTab === 'create' ? 'browse' : 'create')}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </div>

          {/* Action Tabs (Browse/Create) — hidden TabsList, controlled by header buttons */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="sr-only">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="create">Create</TabsTrigger>
            </TabsList>

            {/* Browse Tab */}
            <TabsContent value="browse" className="mt-0">

              {/* Loading skeleton — only on first load with no data yet */}
              {isLoading && !stories?.length && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                  {Array.from({ length: 24 }, (_, i) => (
                    <Skeleton key={i} className="aspect-square w-full rounded-sm" />
                  ))}
                </div>
              )}

              {/* Grid — show immediately if we have any data, even while re-fetching */}
              {!isLoading && error && !stories?.length ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <p className="text-muted-foreground">Failed to load stories. Try another relay?</p>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              ) : !isLoading && stories?.length === 0 ? (
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
              ) : stories && stories.length > 0 ? (
                <div className="relative">
                  {storyType === 'video'
                    ? <VideoThumbnailGrid videos={stories} />
                    : <WrittenStoryThumbnailGrid stories={stories} />
                  }
                  {/* Subtle re-fetch indicator — doesn't hide the grid */}
                  {isFetching && !isLoading && (
                    <div className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-gray-900/80 rounded-full px-2 py-0.5 flex items-center gap-1 text-xs text-muted-foreground shadow pointer-events-none">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      loading more…
                    </div>
                  )}
                </div>
              ) : null}
            </TabsContent>

            {/* Create Tab */}
            <TabsContent value="create" className="mt-0">
              {!user ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <BookOpen className="w-16 h-16 mx-auto" style={{ color: '#b2d235' }} />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Login Required</h3>
                        <p className="text-muted-foreground mb-4">
                          Please log in to create stories
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : storyType === 'write' ? (
                <Tabs defaultValue="write" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="write" className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      Write Story
                    </TabsTrigger>
                    <TabsTrigger value="html" className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Upload HTML Page
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="write" className="mt-0">
                    <CreateArticleForm />
                  </TabsContent>
                  <TabsContent value="html" className="mt-0">
                    <UploadHtmlStoryForm />
                  </TabsContent>
                </Tabs>
              ) : (
                <CreateVideoStoryForm />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
