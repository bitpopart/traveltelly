import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { type GPSCoordinates } from '@/lib/exifUtils';
import { nip19 } from 'nostr-tools';
import * as geohash from 'ngeohash';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BookOpen,
  Send,
  Calendar,
  AlertCircle,
  MapPin,
  Download,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';

interface ArticleFormData {
  title: string;
  summary: string;
  content: string;
  image: string;
  tags: string;
  identifier: string;
}

export function CreateArticleForm() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useNostrPublish();
  const { toast } = useToast();
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    summary: '',
    content: '',
    image: '',
    tags: '',
    identifier: '',
  });

  const handlePhotosChange = (photos: UploadedPhoto[]) => {
    setUploadedPhotos(photos);
    // Use the first uploaded photo URL as the featured image
    const firstUploadedUrl = photos.find(p => p.uploaded && p.url)?.url;
    if (firstUploadedUrl) {
      setFormData(prev => ({ ...prev, image: firstUploadedUrl }));
    }
  };

  const handleGPSExtracted = (coordinates: GPSCoordinates) => {
    setGpsCoordinates(coordinates);
    console.log('📍 GPS coordinates extracted from article photo:', coordinates);
  };

  const handleImportFromUrl = async () => {
    if (!importUrl.trim()) {
      toast({
        title: 'URL required',
        description: 'Please enter a URL to import content from.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);
    try {
      const url = importUrl.trim();
      
      // Check if this is a Nostr client URL (Primal, etc.)
      const nostrClientPatterns = [
        /primal\.net\/([^\/]+)\/([^\/]+)/,  // primal.net/npub/eventid
        /highlighter\.com\/([^\/]+)\/([^\/]+)/, // highlighter.com
        /nostrudel\.ninja\/([^\/]+)\/([^\/]+)/, // nostrudel
      ];
      
      let isNostrUrl = false;
      for (const pattern of nostrClientPatterns) {
        if (pattern.test(url)) {
          isNostrUrl = true;
          break;
        }
      }
      
      if (isNostrUrl) {
        toast({
          title: 'Nostr link detected',
          description: 'This appears to be a Nostr client link. Please use the Nostr event ID (note1... or naddr1...) instead, or copy the actual article URL.',
          variant: 'destructive',
        });
        setIsImporting(false);
        return;
      }
      
      // Use webfetch via CORS proxy
      const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Check if it's a client-side rendered app
      if (html.includes('You need to enable JavaScript to run this app')) {
        toast({
          title: 'Cannot import from this URL',
          description: 'This is a JavaScript app that cannot be imported. Please copy the content manually or use the original article URL.',
          variant: 'destructive',
        });
        setIsImporting(false);
        return;
      }
      
      // Parse HTML to extract content
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Create a base URL for resolving relative links
      const baseUrl = new URL(url);
      
      // Extract title
      let title = doc.querySelector('h1')?.textContent || 
                  doc.querySelector('title')?.textContent || 
                  'Imported Article';
      title = title.trim();

      // Extract meta description as summary
      const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || 
                       doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';

      // Extract main content - try common article selectors
      const contentSelectors = [
        'article',
        '[role="main"]',
        'main',
        '.post-content',
        '.article-content',
        '.entry-content',
        '#content',
        '.content'
      ];

      let contentElement: Element | null = null;
      for (const selector of contentSelectors) {
        const element = doc.querySelector(selector);
        if (element) {
          contentElement = element;
          break;
        }
      }

      // Fallback to body if no article content found
      if (!contentElement) {
        contentElement = doc.body;
      }

      // Clone and clean the element
      const cleanElement = contentElement.cloneNode(true) as HTMLElement;
      cleanElement.querySelectorAll('script, style, nav, header, footer, aside, .comments, #comments, .sidebar, .navigation, .menu, .ad, .advertisement').forEach(el => el.remove());

      // Convert HTML to Markdown-like format
      let content = '';
      
      // Process the content recursively
      const processNode = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent?.trim() || '';
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          const tagName = element.tagName.toLowerCase();
          const children = Array.from(element.childNodes).map(processNode).join('');
          
          switch (tagName) {
            case 'h1':
              return `\n\n# ${children}\n\n`;
            case 'h2':
              return `\n\n## ${children}\n\n`;
            case 'h3':
              return `\n\n### ${children}\n\n`;
            case 'h4':
              return `\n\n#### ${children}\n\n`;
            case 'h5':
              return `\n\n##### ${children}\n\n`;
            case 'h6':
              return `\n\n###### ${children}\n\n`;
            case 'p':
              return `\n\n${children}\n\n`;
            case 'br':
              return '\n';
            case 'strong':
            case 'b':
              return `**${children}**`;
            case 'em':
            case 'i':
              return `*${children}*`;
            case 'a':
              let href = element.getAttribute('href') || '';
              // Convert relative URLs to absolute
              if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
                try {
                  href = new URL(href, baseUrl).href;
                } catch {
                  // If URL parsing fails, keep original
                }
              }
              return href ? `[${children}](${href})` : children;
            case 'ul':
            case 'ol':
              return `\n${children}\n`;
            case 'li':
              return `- ${children}\n`;
            case 'blockquote':
              return `\n> ${children}\n`;
            case 'code':
              return `\`${children}\``;
            case 'pre':
              return `\n\`\`\`\n${children}\n\`\`\`\n`;
            case 'img':
              let src = element.getAttribute('src') || '';
              const alt = element.getAttribute('alt') || '';
              // Convert relative URLs to absolute
              if (src && !src.startsWith('http') && !src.startsWith('data:')) {
                try {
                  src = new URL(src, baseUrl).href;
                } catch {
                  // If URL parsing fails, keep original
                }
              }
              return src ? `\n![${alt}](${src})\n` : '';
            default:
              return children;
          }
        }
        
        return '';
      };

      content = processNode(cleanElement);
      
      // Clean up excessive newlines and whitespace
      content = content
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      // Extract image
      let ogImage = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      // Convert relative URLs to absolute
      if (ogImage && !ogImage.startsWith('http') && !ogImage.startsWith('data:')) {
        try {
          ogImage = new URL(ogImage, baseUrl).href;
        } catch {
          // If URL parsing fails, keep original
        }
      }
      
      // Debug logging
      console.log('📥 Import results:', {
        title,
        summaryLength: metaDesc.trim().length,
        contentLength: content.length,
        contentPreview: content.substring(0, 200),
        hasImage: !!ogImage,
      });

      // Validate we have content
      if (!content || content.length < 50) {
        toast({
          title: 'Limited content extracted',
          description: 'The content extraction found very little text. You may need to manually copy the content.',
          variant: 'destructive',
        });
      }
      
      // Update form
      setFormData(prev => ({
        ...prev,
        title,
        summary: metaDesc.trim(),
        content,
        image: ogImage,
      }));

      toast({
        title: 'Content imported!',
        description: `Imported ${content.length} characters. Review and edit before publishing.`,
      });

      setImportUrl('');
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Import failed',
        description: 'Unable to import content from this URL. Please try copying the content manually.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const generateIdentifier = () => {
    const timestamp = Date.now();
    const titleSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    return titleSlug ? `${titleSlug}-${timestamp}` : `article-${timestamp}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Title and content are required for NIP-23 articles.',
        variant: 'destructive',
      });
      return;
    }

    const identifier = formData.identifier.trim() || generateIdentifier();
    const tags: string[][] = [
      ['d', identifier], // Required for addressable events
      ['title', formData.title.trim()],
      ['published_at', Math.floor(Date.now() / 1000).toString()],
      ['alt', `Article: ${formData.title.trim()}`], // NIP-31 alt tag
    ];

    // Add optional tags
    if (formData.summary.trim()) {
      tags.push(['summary', formData.summary.trim()]);
    }

    if (formData.image.trim()) {
      tags.push(['image', formData.image.trim()]);
    }

    // Add geohash if GPS coordinates are available
    if (gpsCoordinates) {
      const hash = geohash.encode(gpsCoordinates.latitude, gpsCoordinates.longitude, 8);
      tags.push(['g', hash]);
      console.log('📍 Adding geohash to article:', hash, gpsCoordinates);
    }

    // Add topic tags
    if (formData.tags.trim()) {
      const topicTags = formData.tags
        .split(',')
        .map(tag => tag.trim().toLowerCase())
        .filter(tag => tag.length > 0);

      topicTags.forEach(tag => {
        tags.push(['t', tag]);
      });
    }

    // Always add travel-related tags for Traveltelly content
    tags.push(['t', 'travel']);
    tags.push(['t', 'traveltelly']);

    createEvent({
      kind: 30023, // NIP-23 long-form content
      content: formData.content.trim(),
      tags,
    }, {
      onSuccess: () => {
        toast({
          title: 'Article published!',
          description: `"${formData.title}" has been published as a NIP-23 article.`,
        });
        // Reset form
        setFormData({
          title: '',
          summary: '',
          content: '',
          image: '',
          tags: '',
          identifier: '',
        });
        setGpsCoordinates(null);
        setUploadedPhotos([]);
      },
      onError: () => {
        toast({
          title: 'Failed to publish article',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Please log in to create travel stories.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Create Travel Story
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your travel experiences as a long-form article using the NIP-23 standard. Articles support Markdown formatting.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            Kind 30023
          </Badge>
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20">
            NIP-23
          </Badge>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
            Addressable
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Import from URL */}
          <Alert>
            <LinkIcon className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="text-sm font-medium">Import from URL (optional)</p>
                <p className="text-xs text-muted-foreground">
                  Have an existing blog post or article? Enter the URL below to automatically import the content.
                </p>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/your-article"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    disabled={isImporting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleImportFromUrl}
                    disabled={isImporting || !importUrl.trim()}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Import
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Title */}
          <div>
            <Label htmlFor="title">
              Article Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter article title..."
              className="mt-1"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary">Summary (optional)</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Brief summary of the article..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          {/* Featured Image Upload */}
          <div>
            <Label>Featured Image (optional)</Label>
            <PhotoUpload
              onPhotosChange={handlePhotosChange}
              onGPSExtracted={handleGPSExtracted}
              maxPhotos={1}
              className="mt-2"
            />
            {formData.image && (
              <div className="mt-3">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <img
                  src={formData.image}
                  alt="Featured"
                  className="w-full max-w-md rounded-lg border"
                />
              </div>
            )}
            {gpsCoordinates && (
              <div className="mt-3">
                <p className="text-sm text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location detected: {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                </p>
                <div className="h-48 rounded-lg overflow-hidden border">
                  <MapContainer
                    center={[gpsCoordinates.latitude, gpsCoordinates.longitude]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <Marker position={[gpsCoordinates.latitude, gpsCoordinates.longitude]}>
                      <Popup>Article location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Topic Tags (optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="destination, guide, photography (comma-separated)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas. "travel" and "traveltelly" tags are added automatically.
            </p>
          </div>

          {/* Identifier */}
          <div>
            <Label htmlFor="identifier">Article Identifier (optional)</Label>
            <Input
              id="identifier"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder="unique-article-id (auto-generated if empty)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for this article. Used for editing and linking.
            </p>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content" className="mb-3 block text-base">
              Story Content <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-muted-foreground mb-3">
              Write your travel story below. Use the toolbar buttons to add headings, bold text, links, and more.
            </p>
            <MarkdownEditor
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Start writing your travel story here...

Share your experiences, tips, and memories from your journey. Use the toolbar buttons above to format your text - make headings bold, add photos, create lists, and more!"
              minHeight="500px"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending || !formData.title.trim() || !formData.content.trim()}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <Calendar className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Publish Article
                </>
              )}
            </Button>
          </div>

          {/* NIP-23 Info */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2">About NIP-23 Articles</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Articles are addressable events (kind 30023) that can be edited</li>
              <li>• Content should be written in Markdown format</li>
              <li>• Articles can be linked using naddr identifiers</li>
              <li>• Published articles appear in the Stories feed</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}