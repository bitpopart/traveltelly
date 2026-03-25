import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ShareButton } from '@/components/ShareButton';
import { ShareToNostrButton } from '@/components/ShareToNostrButton';
import { ClawstrShare } from '@/components/ClawstrShare';
import { useArticleReactions, useReactToArticle } from '@/hooks/useArticleReactions';
import { useArticleComments, useCommentOnArticle } from '@/hooks/useArticleComments';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';
import {
  Heart,
  MessageCircle,
  Send,
  Calendar,
  MapPin,
  Shield,
  ThumbsDown,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

// ---------------------------------------------------------------------------
// Helper: render basic Markdown to JSX-safe HTML string
// ---------------------------------------------------------------------------
function renderMarkdown(raw: string): string {
  let html = raw
    // Escape HTML entities first to prevent XSS in plain text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-2">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>');

  // Bold + italic combo
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 rounded text-sm font-mono">$1</code>');

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-3 text-muted-foreground">$1</blockquote>');

  // Images (must come before links)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4 shadow-sm" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:no-underline">$1</a>');

  // Unordered lists — group consecutive lines
  html = html.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (match) => `<ul class="my-3 space-y-1">${match}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr class="my-6 border-gray-200 dark:border-gray-700" />');

  // Paragraphs — split on double newline, wrap non-tag lines
  const paragraphs = html.split(/\n{2,}/);
  html = paragraphs
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      // Don't wrap blocks that are already HTML tags
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|img|div|p)/.test(trimmed)) return trimmed;
      return `<p class="my-3 leading-relaxed">${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .filter(Boolean)
    .join('\n');

  return html;
}

// ---------------------------------------------------------------------------
// CommentItem
// ---------------------------------------------------------------------------
interface CommentItemProps {
  comment: NostrEvent;
}

function CommentItem({ comment }: CommentItemProps) {
  const author = useAuthor(comment.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name ?? genUserName(comment.pubkey);
  const profileImage = metadata?.picture;

  return (
    <div className="flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={profileImage} alt={displayName} />
        <AvatarFallback className="text-xs">
          {displayName[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{displayName}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at * 1000), { addSuffix: true })}
          </p>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ArticleBody — inner component that can freely call hooks unconditionally
// because it only renders when the article is confirmed valid.
// ---------------------------------------------------------------------------
interface ArticleBodyProps {
  article: NostrEvent;
}

function ArticleBody({ article }: ArticleBodyProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

  // Extract metadata
  const title = article.tags.find(([name]) => name === 'title')?.[1] ?? 'Untitled Article';
  const summary = article.tags.find(([name]) => name === 'summary')?.[1];
  const image = article.tags.find(([name]) => name === 'image')?.[1];
  const location = article.tags.find(([name]) => name === 'location')?.[1];
  const identifier = article.tags.find(([name]) => name === 'd')?.[1] ?? '';
  const publishedAtRaw = article.tags.find(([name]) => name === 'published_at')?.[1];

  const displayDate = publishedAtRaw
    ? new Date(parseInt(publishedAtRaw) * 1000)
    : new Date(article.created_at * 1000);

  const topicTags = article.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter((tag): tag is string =>
      typeof tag === 'string' && tag.length > 0 && !['travel', 'traveltelly'].includes(tag),
    );

  // All hooks called unconditionally at the top of this component
  const author = useAuthor(article.pubkey);
  const authorMetadata = author.data?.metadata;
  const authorName = authorMetadata?.name ?? genUserName(article.pubkey);
  const authorImage = authorMetadata?.picture;

  const { data: reactions, isLoading: reactionsLoading } = useArticleReactions(article.id, article.pubkey);
  const { data: comments, isLoading: commentsLoading } = useArticleComments(article.id, article.pubkey, identifier);
  const { mutate: reactToArticle, isPending: isReacting } = useReactToArticle();
  const { mutate: commentOnArticle, isPending: isCommenting } = useCommentOnArticle();

  // Generate naddr for sharing
  const articleNaddr = nip19.naddrEncode({
    identifier,
    pubkey: article.pubkey,
    kind: 30023,
  });

  const handleReaction = (reaction: '+' | '-') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to react to articles.',
        variant: 'destructive',
      });
      return;
    }
    reactToArticle(
      { articleId: article.id, articleAuthor: article.pubkey, reaction },
      {
        onSuccess: () => {
          toast({ title: reaction === '+' ? 'Liked!' : 'Disliked!', description: 'Your reaction has been recorded.' });
        },
        onError: () => {
          toast({ title: 'Failed to react', description: 'Please try again.', variant: 'destructive' });
        },
      },
    );
  };

  const handleComment = () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please log in to comment.', variant: 'destructive' });
      return;
    }
    if (!newComment.trim()) {
      toast({ title: 'Comment required', description: 'Please enter a comment.', variant: 'destructive' });
      return;
    }
    commentOnArticle(
      { articleId: article.id, articleAuthor: article.pubkey, articleIdentifier: identifier, content: newComment },
      {
        onSuccess: () => {
          toast({ title: 'Comment posted!', description: 'Your comment has been added.' });
          setNewComment('');
        },
        onError: () => {
          toast({ title: 'Failed to post comment', description: 'Please try again.', variant: 'destructive' });
        },
      },
    );
  };

  return (
    <>
      {/* Back + Share row */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex flex-wrap gap-2">
          <ShareToNostrButton
            url={`/story/${articleNaddr}`}
            title={title}
            description={summary ?? article.content.slice(0, 200)}
            image={image}
            defaultContent={`📖 ${title}\n\n${summary ?? article.content.slice(0, 150) + '...'}\n\ntraveltelly.com/story/${articleNaddr}`}
            variant="default"
            size="default"
          />
          <ClawstrShare event={article} contentType="story" />
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          {/* Article header */}
          <header className="mb-6">
            <h1 className="text-3xl font-bold mb-3 leading-tight">{title}</h1>

            {summary && (
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{summary}</p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={authorImage} alt={authorName} />
                  <AvatarFallback className="text-xs">{authorName[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-foreground">{authorName}</span>
                <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 border-orange-200">
                  <Shield className="w-3 h-3 mr-1" />
                  Traveltelly
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDistanceToNow(displayDate, { addSuffix: true })}
              </div>

              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
              )}
            </div>

            {topicTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {topicTags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {/* Featured image */}
          {image && (
            <div className="mb-8">
              <img
                src={image}
                alt={title}
                className="w-full max-h-96 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Article content — rendered as Markdown */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:text-foreground
              prose-p:text-foreground prose-p:leading-relaxed
              prose-a:text-blue-600 dark:prose-a:text-blue-400
              prose-img:rounded-lg prose-img:shadow-sm
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300
              prose-code:bg-gray-100 dark:prose-code:bg-gray-800
              mb-8"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
          />

          {/* Reactions row */}
          <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-800 mb-6">
            <Button
              variant={reactions?.userReaction === '+' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleReaction('+')}
              disabled={isReacting || !user}
              className={reactions?.userReaction === '+' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              <Heart className="w-4 h-4 mr-1" />
              {reactionsLoading ? '…' : (reactions?.likes ?? 0)}
            </Button>

            <Button
              variant={reactions?.userReaction === '-' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleReaction('-')}
              disabled={isReacting || !user}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {reactionsLoading ? '…' : (reactions?.dislikes ?? 0)}
            </Button>

            <ShareButton
              url={`/story/${articleNaddr}`}
              title={title}
              description={summary ?? article.content.slice(0, 200)}
            />

            <div className="flex items-center gap-1 text-muted-foreground ml-auto">
              <MessageCircle className="w-4 h-4" />
              <span>{commentsLoading ? '…' : (comments?.length ?? 0)} comments</span>
            </div>
          </div>

          {/* Comments section */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Comments</h3>

            {user ? (
              <div className="mb-6">
                <Textarea
                  placeholder="Write a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-2"
                  rows={3}
                />
                <Button
                  onClick={handleComment}
                  disabled={isCommenting || !newComment.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            ) : (
              <div className="mb-6 p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  Please log in to comment on this story.
                </p>
              </div>
            )}

            {commentsLoading ? (
              <div className="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {Array.from({ length: 3 }, (_, i) => <CommentSkeleton key={i} />)}
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </>
  );
}

// ---------------------------------------------------------------------------
// Validator
// ---------------------------------------------------------------------------
function validateArticleEvent(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  if (!d || typeof d !== 'string' || !title || typeof title !== 'string') return false;
  if (typeof event.pubkey !== 'string' || typeof event.id !== 'string') return false;
  if (!Array.isArray(event.tags)) return false;

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

  return !placeholderKeywords.some(
    (kw) => lowerContent.includes(kw) || lowerTitle.includes(kw),
  );
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function ArticleLoadingSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Not-found / error state
// ---------------------------------------------------------------------------
function ArticleNotFound() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Story Not Found</h2>
                <p className="text-muted-foreground mb-4">
                  This story couldn't be found on the current relay. This could mean:
                </p>
                <ul className="text-sm text-muted-foreground text-left max-w-md mx-auto space-y-2">
                  <li>• The story is on a different Nostr relay</li>
                  <li>• The story was deleted by the author</li>
                  <li>• The story identifier is invalid</li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
                <Link to="/stories">
                  <Button variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Stories
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline">Go to Home</Button>
                </Link>
              </div>
              <div className="pt-4 border-t max-w-md mx-auto">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Try changing your relay in the settings to access stories from different Nostr relays.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function StoryDetail() {
  const { naddr } = useParams<{ naddr: string }>();
  const { nostr } = useNostr();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['story', naddr],
    queryFn: async (c) => {
      if (!naddr) throw new Error('No story identifier provided');

      const decoded = nip19.decode(naddr);

      if (decoded.type !== 'naddr') {
        throw new Error('Invalid story identifier — expected an naddr');
      }

      const { kind, pubkey, identifier } = decoded.data;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query(
        [{ kinds: [kind], authors: [pubkey], '#d': [identifier] }],
        { signal },
      );

      const valid = events.filter(validateArticleEvent);
      if (valid.length === 0) return null;

      // Return the most-recently created valid event
      return valid.sort((a, b) => b.created_at - a.created_at)[0];
    },
    enabled: !!naddr,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) return <ArticleLoadingSkeleton />;

  if (error || !article) return <ArticleNotFound />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* ArticleBody owns all hooks — called unconditionally inside this component */}
          <ArticleBody article={article} />
        </div>
      </div>
    </div>
  );
}
