import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { BookOpen, Trash2, Loader2, Download, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

interface StoryEvent extends NostrEvent {
  kind: 30023;
}

function validateStoryEvent(event: NostrEvent): event is StoryEvent {
  if (event.kind !== 30023) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  return !!(d && title);
}

interface StoryCardProps {
  story: StoryEvent;
  onDelete: (story: StoryEvent) => void;
}

function StoryCard({ story, onDelete }: StoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1];
  const image = story.tags.find(([name]) => name === 'image')?.[1];
  const location = story.tags.find(([name]) => name === 'location')?.[1];
  const publishedAt = story.tags.find(([name]) => name === 'published_at')?.[1];
  const hashtags = story.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const displayDate = publishedAt ?
    new Date(parseInt(publishedAt) * 1000) :
    new Date(story.created_at * 1000);

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(displayDate, { addSuffix: true })}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {location && (
            <Badge variant="outline" className="mb-2">
              {location}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {image && (
            <div className="mb-3">
              <OptimizedImage
                src={image}
                alt={title}
                className="w-full h-48 object-cover rounded-lg"
                blurUp={true}
                thumbnail={true}
              />
            </div>
          )}

          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {summary}
            </p>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hashtags.slice(0, 4).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Story?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(story);
                setShowDeleteDialog(false);
              }}
            >
              Delete Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminStoryManager() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: publish } = useNostrPublish();
  
  const [primalUrl, setPrimalUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const { data: stories = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-stories', ADMIN_HEX],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([{
        kinds: [30023],
        authors: [ADMIN_HEX],
        limit: 100,
      }], { signal });

      return events.filter(validateStoryEvent).sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user && user.pubkey === ADMIN_HEX,
  });

  const handleDelete = (story: StoryEvent) => {
    const dTag = story.tags.find(([name]) => name === 'd')?.[1];
    if (!dTag) return;

    publish({
      kind: 5,
      content: 'Deleted story',
      tags: [
        ['e', story.id],
        ['a', `30023:${story.pubkey}:${dTag}`],
      ],
    });

    toast({
      title: 'Story deleted',
      description: 'The story has been removed',
    });

    setTimeout(() => refetch(), 1000);
  };

  const handleImportFromPrimal = async () => {
    if (!primalUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a Primal story URL',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    try {
      // Parse Primal URL: https://primal.net/traveltelly/bitcoin-bangkok-1769241725685
      // Format: https://primal.net/{username}/{identifier}
      const urlParts = primalUrl.split('/');
      const identifier = urlParts[urlParts.length - 1];

      if (!identifier) {
        throw new Error('Invalid Primal URL format');
      }

      // Query for the story from Nostr
      const events = await nostr.query([{
        kinds: [30023],
        authors: [ADMIN_HEX],
        '#d': [identifier],
        limit: 1,
      }], { signal: AbortSignal.timeout(5000) });

      if (events.length === 0) {
        throw new Error('Story not found on Nostr network');
      }

      const story = events[0];

      // Re-publish the story (this creates a fresh copy)
      const tags = story.tags.filter(([name]) => name !== 'client');
      tags.push(['client', 'www.traveltelly.com']);

      publish({
        kind: 30023,
        content: story.content,
        tags,
      });

      toast({
        title: 'Story imported!',
        description: 'The story has been successfully imported from Primal',
      });

      setPrimalUrl('');
      setTimeout(() => refetch(), 1000);

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Failed to import story from Primal',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  if (!user || user.pubkey !== ADMIN_HEX) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Tabs defaultValue="manage-stories" className="w-full">
      <TabsList>
        <TabsTrigger value="manage-stories">Manage Stories</TabsTrigger>
        <TabsTrigger value="import-story">Import from Primal</TabsTrigger>
      </TabsList>

      <TabsContent value="manage-stories" className="mt-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {stories.length} stor{stories.length !== 1 ? 'ies' : 'y'} found
            </p>
          </div>

          {stories.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No stories found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stories.map((story) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="import-story" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Import Story from Primal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="primal-url">Primal Story URL</Label>
              <Input
                id="primal-url"
                placeholder="https://primal.net/traveltelly/bitcoin-bangkok-1769241725685"
                value={primalUrl}
                onChange={(e) => setPrimalUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the full Primal URL of a story you want to import. The story must already exist on the Nostr network.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>How it works:</strong> This fetches the story from the Nostr network using the identifier in the URL,
                then re-publishes it with the TravelTelly client tag. This creates a fresh copy without any rendering errors.
              </p>
            </div>

            <Button
              onClick={handleImportFromPrimal}
              disabled={isImporting || !primalUrl.trim()}
              className="w-full"
            >
              {isImporting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Download className="w-4 h-4 mr-2" />
              Import Story
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-2">Example URLs:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <code>https://primal.net/traveltelly/bitcoin-bangkok-1769241725685</code>
                </div>
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  <code>https://primal.net/username/story-identifier-here</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
