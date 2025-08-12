import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import {
  BookOpen,
  Send,
  Eye,
  EyeOff,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

// The Traveltelly admin npub
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

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
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: '',
    summary: '',
    content: '',
    image: '',
    tags: '',
    identifier: '',
  });

  const isAdmin = user?.pubkey === ADMIN_HEX;

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
        setShowPreview(false);
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
            Please log in to create articles.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="border-dashed border-orange-200">
        <CardContent className="py-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-orange-600" />
          <h3 className="font-semibold mb-2">Admin Access Required</h3>
          <p className="text-muted-foreground mb-4">
            Only the Traveltelly admin can create official articles.
          </p>
          <p className="text-xs text-muted-foreground">
            Admin npub: {ADMIN_NPUB.slice(0, 20)}...
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
          Create NIP-23 Article
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Publish a long-form travel article using the NIP-23 standard. Articles support Markdown formatting.
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

          {/* Image URL */}
          <div>
            <Label htmlFor="image">Featured Image URL (optional)</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
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
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">
                Article Content (Markdown) <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-1" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </>
                )}
              </Button>
            </div>

            {showPreview ? (
              <div className="border rounded-md p-4 min-h-[300px] bg-gray-50 dark:bg-gray-900">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {formData.content ? (
                    <div className="whitespace-pre-wrap">{formData.content}</div>
                  ) : (
                    <p className="text-muted-foreground italic">Content preview will appear here...</p>
                  )}
                </div>
              </div>
            ) : (
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your article content in Markdown format...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet points
- Another point

[Link text](https://example.com)

> Quote text

```
Code block
```"
                className="mt-1 min-h-[300px] font-mono"
                required
              />
            )}
          </div>

          {/* Markdown Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Markdown Formatting Tips
            </h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Use # for headings (# H1, ## H2, ### H3)</p>
              <p>• **bold** and *italic* text formatting</p>
              <p>• [Link text](URL) for links</p>
              <p>• &gt; for quotes, - for bullet points</p>
              <p>• ``` for code blocks</p>
            </div>
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