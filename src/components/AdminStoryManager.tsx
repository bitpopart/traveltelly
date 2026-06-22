import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { BookOpen, Trash2, Loader2, Download, ExternalLink, Edit, Save, Video, FileText, Play, Upload, Globe, CheckCircle2 } from 'lucide-react';
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
  
  if (!d || !title) {
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
    'sample story',
    'example article',
    'example story',
    'test article',
    'test story',
    'demo article',
    'demo story',
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

interface StoryCardProps {
  story: StoryEvent;
  onDelete: (story: StoryEvent) => void;
  onEdit: (story: StoryEvent) => void;
}

function StoryCard({ story, onDelete, onEdit }: StoryCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isVideo = story.kind === 34235 || story.kind === 34236;
  const title = story.tags.find(([name]) => name === 'title')?.[1] || (isVideo ? 'Untitled Video' : 'Untitled Story');
  const summary = story.tags.find(([name]) => name === 'summary')?.[1];
  const image = story.tags.find(([name]) => name === 'image')?.[1];
  const thumb = story.tags.find(([name]) => name === 'thumb')?.[1];
  const duration = story.tags.find(([name]) => name === 'duration')?.[1];
  const location = story.tags.find(([name]) => name === 'location')?.[1];
  const publishedAt = story.tags.find(([name]) => name === 'published_at')?.[1];
  const hashtags = story.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const displayDate = publishedAt ?
    new Date(parseInt(publishedAt) * 1000) :
    new Date(story.created_at * 1000);
  
  const displayImage = isVideo ? thumb : image;

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(story)}
                className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {location && (
            <Badge variant="outline" className="mb-2">
              {location}
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {displayImage && (
            <div className="mb-3 relative">
              <OptimizedImage
                src={displayImage}
                alt={title}
                className="w-full h-48 object-cover rounded-lg"
                blurUp={true}
                thumbnail={true}
              />
              {isVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-900 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              )}
              {duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {duration}
                </div>
              )}
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
  const { mutate: publish, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  
  const [storyType, setStoryType] = useState<'write' | 'video'>('write');
  const [primalUrl, setPrimalUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryEvent | null>(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
    location: '',
    tags: '',
  });

  // HTML Page Upload state
  const [htmlUploadForm, setHtmlUploadForm] = useState({
    title: '',
    summary: '',
    image: '',
    location: '',
    tags: '',
  });
  const [selectedHtmlFile, setSelectedHtmlFile] = useState<File | null>(null);
  const [htmlUploadProgress, setHtmlUploadProgress] = useState<'idle' | 'uploading' | 'publishing' | 'done'>('idle');
  const [uploadedHtmlUrl, setUploadedHtmlUrl] = useState('');
  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  const { data: stories = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-stories', ADMIN_HEX, storyType],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const kinds = storyType === 'video' ? [34235, 34236] : [30023]; // NIP-71: landscape + portrait
      const events = await nostr.query([{
        kinds,
        authors: [ADMIN_HEX],
        limit: 100,
      }], { signal });

      if (storyType === 'write') {
        return events.filter(validateStoryEvent).sort((a, b) => b.created_at - a.created_at);
      } else {
        // For videos, just sort by date
        return events.sort((a, b) => b.created_at - a.created_at);
      }
    },
    enabled: !!user && user.pubkey === ADMIN_HEX,
  });

  const handleEdit = (story: StoryEvent) => {
    const title = story.tags.find(([name]) => name === 'title')?.[1] || '';
    const summary = story.tags.find(([name]) => name === 'summary')?.[1] || '';
    const image = story.tags.find(([name]) => name === 'image')?.[1] || '';
    const location = story.tags.find(([name]) => name === 'location')?.[1] || '';
    const hashtags = story.tags
      .filter(([name]) => name === 't')
      .map(([, tag]) => tag)
      .filter(tag => tag !== 'travel' && tag !== 'traveltelly')
      .join(', ');

    setEditFormData({
      title,
      summary,
      content: story.content,
      image,
      location,
      tags: hashtags,
    });
    setEditingStory(story);
  };

  const handleSaveEdit = () => {
    if (!editingStory) return;

    const dTag = editingStory.tags.find(([name]) => name === 'd')?.[1];
    if (!dTag) {
      toast({
        title: 'Error',
        description: 'Story identifier not found',
        variant: 'destructive',
      });
      return;
    }

    if (!editFormData.title.trim() || !editFormData.content.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    // Build tags
    const tags: string[][] = [
      ['d', dTag],
      ['title', editFormData.title.trim()],
      ['published_at', Math.floor(Date.now() / 1000).toString()],
      ['alt', `Article: ${editFormData.title.trim()}`],
    ];

    if (editFormData.summary.trim()) {
      tags.push(['summary', editFormData.summary.trim()]);
    }

    if (editFormData.image.trim()) {
      tags.push(['image', editFormData.image.trim()]);
    }

    if (editFormData.location.trim()) {
      tags.push(['location', editFormData.location.trim()]);
    }

    // Add topic tags
    if (editFormData.tags.trim()) {
      const topicTags = editFormData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      topicTags.forEach(tag => {
        tags.push(['t', tag]);
      });
    }

    // Always add travel-related tags
    tags.push(['t', 'travel']);
    tags.push(['t', 'traveltelly']);

    publish({
      kind: 30023,
      content: editFormData.content.trim(),
      tags,
    }, {
      onSuccess: () => {
        toast({
          title: 'Story updated!',
          description: 'Your changes have been saved.',
        });
        setEditingStory(null);
        setTimeout(() => refetch(), 1000);
      },
      onError: () => {
        toast({
          title: 'Failed to update story',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

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

  const handleHtmlThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const [[, url]] = await uploadFile(file);
      setHtmlUploadForm(prev => ({ ...prev, image: url }));
      toast({ title: 'Thumbnail uploaded!', description: 'Thumbnail image has been uploaded.' });
    } catch {
      toast({ title: 'Upload failed', description: 'Could not upload thumbnail.', variant: 'destructive' });
    }
  };

  const handleHtmlPageUpload = async () => {
    if (!selectedHtmlFile) {
      toast({ title: 'No file selected', description: 'Please select an HTML file to upload.', variant: 'destructive' });
      return;
    }
    if (!htmlUploadForm.title.trim()) {
      toast({ title: 'Title required', description: 'Please enter a title for this story page.', variant: 'destructive' });
      return;
    }

    try {
      setHtmlUploadProgress('uploading');

      // Upload the HTML file to Blossom
      const [[, htmlUrl]] = await uploadFile(selectedHtmlFile);
      setUploadedHtmlUrl(htmlUrl);

      setHtmlUploadProgress('publishing');

      // Build the story tags
      const dTag = `html-page-${Date.now()}`;
      const tags: string[][] = [
        ['d', dTag],
        ['title', htmlUploadForm.title.trim()],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
        ['alt', `Travel Story: ${htmlUploadForm.title.trim()}`],
        // Custom tag to mark this as an HTML page
        ['brand_site', htmlUrl],
        ['brand_site_is_srcdoc', 'false'],
      ];

      if (htmlUploadForm.summary.trim()) {
        tags.push(['summary', htmlUploadForm.summary.trim()]);
      }
      if (htmlUploadForm.image.trim()) {
        tags.push(['image', htmlUploadForm.image.trim()]);
      }
      if (htmlUploadForm.location.trim()) {
        tags.push(['location', htmlUploadForm.location.trim()]);
      }

      // Add topic tags
      if (htmlUploadForm.tags.trim()) {
        const topicTags = htmlUploadForm.tags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);
        topicTags.forEach(tag => tags.push(['t', tag]));
      }

      // Always add traveltelly tags
      tags.push(['t', 'travel']);
      tags.push(['t', 'traveltelly']);
      tags.push(['t', 'htmlpage']);

      // Publish as NIP-23 long-form article (kind 30023) with minimal content
      publish({
        kind: 30023,
        content: `# ${htmlUploadForm.title.trim()}\n\n${htmlUploadForm.summary || 'Travel story page'}\n\n[View full page](${htmlUrl})`,
        tags,
      }, {
        onSuccess: () => {
          setHtmlUploadProgress('done');
          toast({
            title: 'HTML Page Published!',
            description: `"${htmlUploadForm.title}" is now live as a story page.`,
          });
          // Reset form
          setTimeout(() => {
            setHtmlUploadProgress('idle');
            setSelectedHtmlFile(null);
            setUploadedHtmlUrl('');
            setHtmlUploadForm({ title: '', summary: '', image: '', location: '', tags: '' });
            if (htmlFileInputRef.current) htmlFileInputRef.current.value = '';
            if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
            refetch();
          }, 2000);
        },
        onError: () => {
          setHtmlUploadProgress('idle');
          toast({ title: 'Publish failed', description: 'Could not publish story page.', variant: 'destructive' });
        },
      });
    } catch (err) {
      setHtmlUploadProgress('idle');
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload HTML file.',
        variant: 'destructive',
      });
    }
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
    <>
      {/* Story Type Selector */}
      <div className="mb-6">
        <Tabs value={storyType} onValueChange={(v) => setStoryType(v as 'write' | 'video')} className="w-full">
          <TabsList className="grid w-full max-w-md" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <TabsTrigger value="write" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Write Stories
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video Stories
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs defaultValue="manage-stories" className="w-full">
        <TabsList>
          <TabsTrigger value="manage-stories">Manage {storyType === 'write' ? 'Stories' : 'Videos'}</TabsTrigger>
          {storyType === 'write' && <TabsTrigger value="upload-html-page" className="flex items-center gap-1"><Globe className="w-3 h-3" />Upload HTML Page</TabsTrigger>}
          {storyType === 'write' && <TabsTrigger value="import-story">Import from Primal</TabsTrigger>}
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
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      </TabsContent>

      {/* HTML Page Upload Tab */}
      <TabsContent value="upload-html-page" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Upload Full HTML Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Info box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>How it works:</strong> Upload a complete HTML file (e.g. a full travel story page).
                It will be stored on Blossom and appear as a thumbnail in the Written Stories grid.
                When visitors click it, the full page loads directly under the navigation menu — like a mini website.
              </p>
            </div>

            {/* HTML File Upload */}
            <div>
              <Label className="mb-2 block">HTML File <span className="text-red-500">*</span></Label>
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                onClick={() => htmlFileInputRef.current?.click()}
              >
                {selectedHtmlFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-8 h-8 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedHtmlFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedHtmlFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm font-medium">Click to select HTML file</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports .html, .htm files</p>
                  </div>
                )}
              </div>
              <input
                ref={htmlFileInputRef}
                type="file"
                accept=".html,.htm"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedHtmlFile(file);
                }}
              />
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="html-title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="html-title"
                value={htmlUploadForm.title}
                onChange={(e) => setHtmlUploadForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Story page title (shown on thumbnail)"
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="html-summary">Summary (optional)</Label>
              <Textarea
                id="html-summary"
                value={htmlUploadForm.summary}
                onChange={(e) => setHtmlUploadForm(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Short description shown on hover..."
                className="mt-1 min-h-[70px]"
              />
            </div>

            {/* Thumbnail Image */}
            <div>
              <Label className="mb-2 block font-semibold">
                Thumbnail Image <span className="text-red-500">*</span>
                <span className="font-normal text-muted-foreground ml-1">(shown in the grid)</span>
              </Label>

              {/* Upload area */}
              {!htmlUploadForm.image ? (
                <div
                  className="border-2 border-dashed border-orange-300 dark:border-orange-700 rounded-lg p-6 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-colors"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2 text-orange-500">
                      <Loader2 className="w-8 h-8 animate-spin" />
                      <p className="text-sm font-medium">Uploading thumbnail…</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                      <p className="text-sm font-medium">Click to upload thumbnail image</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — this is the grid preview image</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative inline-block">
                  <img
                    src={htmlUploadForm.image}
                    alt="Thumbnail preview"
                    className="w-40 h-40 object-cover rounded-lg border-2 border-green-400 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setHtmlUploadForm(prev => ({ ...prev, image: '' }));
                      if (thumbnailFileInputRef.current) thumbnailFileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 shadow"
                    title="Remove thumbnail"
                  >
                    ✕
                  </button>
                  <div className="mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => thumbnailFileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Replace
                    </Button>
                  </div>
                </div>
              )}

              <input
                ref={thumbnailFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleHtmlThumbnailUpload}
              />

              {/* Or paste URL */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Or paste an image URL directly:</p>
                <Input
                  value={htmlUploadForm.image}
                  onChange={(e) => setHtmlUploadForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://example.com/thumbnail.jpg"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="html-location">Location (optional)</Label>
              <Input
                id="html-location"
                value={htmlUploadForm.location}
                onChange={(e) => setHtmlUploadForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="mt-1"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="html-tags">Topic Tags (optional)</Label>
              <Input
                id="html-tags"
                value={htmlUploadForm.tags}
                onChange={(e) => setHtmlUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="destination, guide, photography (comma-separated)"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                "travel", "traveltelly", and "htmlpage" tags are added automatically.
              </p>
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleHtmlPageUpload}
              disabled={!selectedHtmlFile || !htmlUploadForm.title.trim() || htmlUploadProgress !== 'idle'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {htmlUploadProgress === 'uploading' && (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading HTML to Blossom…</>
              )}
              {htmlUploadProgress === 'publishing' && (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing to Nostr…</>
              )}
              {htmlUploadProgress === 'done' && (
                <><CheckCircle2 className="w-4 h-4 mr-2" />Published! 🎉</>
              )}
              {htmlUploadProgress === 'idle' && (
                <><Globe className="w-4 h-4 mr-2" />Upload & Publish HTML Page</>
              )}
            </Button>

            {uploadedHtmlUrl && htmlUploadProgress === 'done' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">HTML file uploaded to Blossom:</p>
                <a href={uploadedHtmlUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline break-all">
                  {uploadedHtmlUrl}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Edit Story Dialog */}
      <Dialog open={!!editingStory} onOpenChange={(open) => !open && setEditingStory(null)}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Edit className="w-6 h-6" />
            Edit Story
          </DialogTitle>
          <DialogDescription>
            Update your travel story. Changes will be published as a new version.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <Label htmlFor="edit-title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-title"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              placeholder="Enter story title..."
              className="mt-1"
            />
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="edit-summary">Summary (optional)</Label>
            <Textarea
              id="edit-summary"
              value={editFormData.summary}
              onChange={(e) => setEditFormData({ ...editFormData, summary: e.target.value })}
              placeholder="Brief summary of the story..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Featured Image URL */}
          <div>
            <Label htmlFor="edit-image">Featured Image URL (optional)</Label>
            <Input
              id="edit-image"
              value={editFormData.image}
              onChange={(e) => setEditFormData({ ...editFormData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
            {editFormData.image && (
              <div className="mt-2">
                <OptimizedImage
                  src={editFormData.image}
                  alt="Preview"
                  className="w-full max-w-md rounded-lg border"
                  blurUp={true}
                  thumbnail={true}
                />
              </div>
            )}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="edit-location">Location (optional)</Label>
            <Input
              id="edit-location"
              value={editFormData.location}
              onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
              placeholder="City, Country"
              className="mt-1"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="edit-tags">Topic Tags (optional)</Label>
            <Input
              id="edit-tags"
              value={editFormData.tags}
              onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
              placeholder="destination, guide, photography (comma-separated)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas. "travel" and "traveltelly" tags are added automatically.
            </p>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="edit-content" className="mb-3 block text-base">
              Story Content <span className="text-red-500">*</span>
            </Label>
            <MarkdownEditor
              value={editFormData.content}
              onChange={(content) => setEditFormData({ ...editFormData, content })}
              placeholder="Write your travel story here..."
              minHeight="400px"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setEditingStory(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isPending || !editFormData.title.trim() || !editFormData.content.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
