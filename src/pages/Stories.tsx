import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RelaySelector } from '@/components/RelaySelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { CreateArticleForm } from '@/components/CreateArticleForm';
import { FullArticleView } from '@/components/FullArticleView';
import { useArticleReactions } from '@/hooks/useArticleReactions';
import { useArticleComments } from '@/hooks/useArticleComments';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Calendar,
  Heart,
  MessageCircle,
  Share,
  MapPin,
  Camera,
  Plus,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

interface StoryItemProps {
  story: NostrEvent;
  onReadMore: (story: NostrEvent) => void;
}

function StoryItem({ story, onReadMore }: StoryItemProps) {
  const author = useAuthor(story.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(story.pubkey);
  const profileImage = metadata?.picture;

  // Extract NIP-23 article metadata from tags
  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Article';
  const location = story.tags.find(([name]) => name === 'location')?.[1];
  const image = story.tags.find(([name]) => name === 'image')?.[1];
  const summary = story.tags.find(([name]) => name === 'summary')?.[1];
  const identifier = story.tags.find(([name]) => name === 'd')?.[1] || '';

  // Get topic tags
  const topicTags = story.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter(tag => tag && !['travel', 'traveltelly'].includes(tag)); // Exclude default tags

  // For NIP-23 articles, get published date
  const publishedAt = story.tags.find(([name]) => name === 'published_at')?.[1];
  const displayDate = publishedAt ?
    new Date(parseInt(publishedAt) * 1000) :
    new Date(story.created_at * 1000);

  // Get content preview for articles (first paragraph or 300 chars)
  const getContentPreview = (content: string) => {
    // Try to get first paragraph (up to first double newline)
    const firstParagraph = content.split('\n\n')[0];
    if (firstParagraph.length <= 300) {
      return firstParagraph;
    }
    // Fallback to character limit
    return content.slice(0, 300) + (content.length > 300 ? '...' : '');
  };

  const contentPreview = getContentPreview(story.content);

  // Get reactions and comments data
  const { data: reactions } = useArticleReactions(story.id, story.pubkey);
  const { data: comments } = useArticleComments(story.id, story.pubkey, identifier);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
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
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
              <BookOpen className="w-3 h-3 mr-1" />
              NIP-23 Article
            </Badge>
            <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 border-orange-200">
              <Shield className="w-3 h-3 mr-1" />
              Traveltelly
            </Badge>
            {topicTags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="bg-gray-50 dark:bg-gray-900/20 text-xs">
                #{tag}
              </Badge>
            ))}
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
            <p className="text-sm text-muted-foreground mb-3">{summary}</p>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="prose prose-sm max-w-none">
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {contentPreview}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={reactions?.userReaction === '+' ? 'text-red-600' : ''}
            >
              <Heart className={`w-4 h-4 mr-1 ${reactions?.userReaction === '+' ? 'fill-current' : ''}`} />
              {reactions?.likes || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="w-4 h-4 mr-1" />
              {comments?.length || 0}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReadMore(story)}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Read Full Article
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StorySkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function validateNIP23Article(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;

  // Must have required NIP-23 tags
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  // Must have identifier, title, and substantial markdown content
  return !!(d && title && event.content.length > 100);
}

function useStories() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['traveltelly-nip23-articles', ADMIN_HEX],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query specifically for NIP-23 long-form articles (kind 30023) from Traveltelly admin
      const events = await nostr.query([
        {
          kinds: [30023], // NIP-23 Long-form content
          authors: [ADMIN_HEX], // Only from Traveltelly admin
          limit: 50,
        }
      ], { signal });

      // Filter and validate NIP-23 articles
      const validArticles = events.filter(validateNIP23Article);

      // Sort by published_at if available, otherwise by created_at
      return validArticles.sort((a, b) => {
        const aPublished = a.tags.find(([name]) => name === 'published_at')?.[1];
        const bPublished = b.tags.find(([name]) => name === 'published_at')?.[1];

        const aTime = aPublished ? parseInt(aPublished) : a.created_at;
        const bTime = bPublished ? parseInt(bPublished) : b.created_at;

        return bTime - aTime; // Newest first
      });
    },
  });
}

export default function Stories() {
  const { user } = useCurrentUser();
  const { data: stories, isLoading, error } = useStories();
  const isAdmin = user?.pubkey === ADMIN_HEX;
  const [selectedArticle, setSelectedArticle] = useState<NostrEvent | null>(null);

  const handleReadMore = (article: NostrEvent) => {
    setSelectedArticle(article);
  };

  const handleCloseArticle = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-orange-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Traveltelly Stories
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
              Official NIP-23 travel articles from the Traveltelly team
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Long-form travel guides and insights using the NIP-23 standard from {ADMIN_NPUB.slice(0, 12)}...
            </p>
          </div>

          {/* Admin Info Card */}
          <Card className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  T
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                    Official NIP-23 Articles
                  </h3>
                  <p className="text-sm text-orange-700 dark:text-orange-300 mb-2">
                    Long-form travel articles using the NIP-23 standard with Markdown formatting
                  </p>
                  <div className="flex items-center gap-4 text-xs text-orange-600 dark:text-orange-400">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Kind 30023
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Addressable Events
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      Markdown Content
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="articles" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="articles" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Published Articles ({stories?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {isAdmin ? 'Create Article' : 'Admin Only'}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="articles" className="mt-6">
              {/* Articles Feed */}
              {error ? (
            <div className="col-span-full">
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
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }, (_, i) => (
                <StorySkeleton key={i} />
              ))}
            </div>
          ) : !stories || stories.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="py-12 px-8 text-center">
                  <div className="max-w-sm mx-auto space-y-6">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold mb-2">No NIP-23 articles found</h3>
                      <p className="text-muted-foreground mb-4">
                        No official Traveltelly NIP-23 articles are available on this relay. Try switching to another relay to discover long-form travel content.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <RelaySelector className="w-full" />
                      <div className="text-xs text-muted-foreground text-center">
                        Looking for kind 30023 events from: {ADMIN_NPUB.slice(0, 20)}...
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6">
              {stories.map((story) => (
                <StoryItem
                  key={story.id}
                  story={story}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
            </TabsContent>

            <TabsContent value="create" className="mt-6">
              <CreateArticleForm />
            </TabsContent>
          </Tabs>

          {/* Full Article View Modal */}
          {selectedArticle && (
            <FullArticleView
              article={selectedArticle}
              isOpen={!!selectedArticle}
              onClose={handleCloseArticle}
            />
          )}
        </div>
      </div>
    </div>
  );
}