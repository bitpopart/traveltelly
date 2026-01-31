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
  ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentItemProps {
  comment: NostrEvent;
}

function CommentItem({ comment }: CommentItemProps) {
  const author = useAuthor(comment.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(comment.pubkey);
  const profileImage = metadata?.picture;

  return (
    <div className="flex gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
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
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
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

function validateArticleEvent(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  return !!(d && title);
}

export default function StoryDetail() {
  const { naddr } = useParams<{ naddr: string }>();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['story', naddr],
    queryFn: async (c) => {
      if (!naddr) throw new Error('No story identifier provided');

      try {
        const decoded = nip19.decode(naddr);
        if (decoded.type !== 'naddr') {
          throw new Error('Invalid story identifier');
        }

        const { kind, pubkey, identifier } = decoded.data;

        const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
        const events = await nostr.query([{
          kinds: [kind],
          authors: [pubkey],
          '#d': [identifier],
        }], { signal });

        const validArticles = events.filter(validateArticleEvent);
        return validArticles[0] || null;
      } catch (error) {
        console.error('Error decoding naddr:', error);
        throw new Error('Invalid story identifier');
      }
    },
    enabled: !!naddr,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">Story not found</p>
                <Link to="/stories">
                  <Button>Back to Stories</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Extract article metadata
  const title = article.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Article';
  const summary = article.tags.find(([name]) => name === 'summary')?.[1];
  const image = article.tags.find(([name]) => name === 'image')?.[1];
  const location = article.tags.find(([name]) => name === 'location')?.[1];
  const identifier = article.tags.find(([name]) => name === 'd')?.[1] || '';
  const publishedAt = article.tags.find(([name]) => name === 'published_at')?.[1];

  const displayDate = publishedAt ?
    new Date(parseInt(publishedAt) * 1000) :
    new Date(article.created_at * 1000);

  // Get topic tags
  const topicTags = article.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter(tag => tag && !['travel', 'traveltelly'].includes(tag));

  // Get author info
  const author = useAuthor(article.pubkey);
  const authorMetadata = author.data?.metadata;
  const authorName = authorMetadata?.name || genUserName(article.pubkey);
  const authorImage = authorMetadata?.picture;

  // Hooks for reactions and comments
  const { data: reactions, isLoading: reactionsLoading } = useArticleReactions(article.id, article.pubkey);
  const { data: comments, isLoading: commentsLoading } = useArticleComments(article.id, article.pubkey, identifier);
  const { mutate: reactToArticle, isPending: isReacting } = useReactToArticle();
  const { mutate: commentOnArticle, isPending: isCommenting } = useCommentOnArticle();

  const handleReaction = (reaction: '+' | '-') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to react to articles.',
        variant: 'destructive',
      });
      return;
    }

    reactToArticle({
      articleId: article.id,
      articleAuthor: article.pubkey,
      reaction,
    }, {
      onSuccess: () => {
        toast({
          title: reaction === '+' ? 'Liked!' : 'Disliked!',
          description: 'Your reaction has been recorded.',
        });
      },
      onError: () => {
        toast({
          title: 'Failed to react',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  const handleComment = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to comment on articles.',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: 'Comment required',
        description: 'Please enter a comment.',
        variant: 'destructive',
      });
      return;
    }

    commentOnArticle({
      articleId: article.id,
      articleAuthor: article.pubkey,
      articleIdentifier: identifier,
      content: newComment,
    }, {
      onSuccess: () => {
        toast({
          title: 'Comment posted!',
          description: 'Your comment has been added to the article.',
        });
        setNewComment('');
      },
      onError: () => {
        toast({
          title: 'Failed to post comment',
          description: 'Please try again.',
          variant: 'destructive',
        });
      },
    });
  };

  // Generate naddr for sharing
  const articleNaddr = nip19.naddrEncode({
    identifier,
    pubkey: article.pubkey,
    kind: 30023,
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and Share to Nostr */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <ShareToNostrButton
              url={`/story/${articleNaddr}`}
              title={title}
              description={summary || article.content.slice(0, 200)}
              defaultContent={`📖 ${title}\n\n${summary || article.content.slice(0, 150) + '...'}\n\n${window.location.origin}/story/${articleNaddr}`}
              variant="default"
              size="default"
            />
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-3">{title}</h1>
                {summary && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {summary}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={authorImage} alt={authorName} />
                      <AvatarFallback className="text-xs">
                        {authorName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{authorName}</span>
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
                    {topicTags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-green-50 dark:bg-green-900/20">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Featured Image */}
              {image && (
                <div className="mb-8">
                  <img
                    src={image}
                    alt={title}
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {article.content}
                </div>
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-4 py-4 border-t border-b border-gray-200 dark:border-gray-800 mb-6">
                <Button
                  variant={reactions?.userReaction === '+' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleReaction('+')}
                  disabled={isReacting || !user}
                  className={reactions?.userReaction === '+' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {reactionsLoading ? '...' : reactions?.likes || 0}
                </Button>

                <Button
                  variant={reactions?.userReaction === '-' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleReaction('-')}
                  disabled={isReacting || !user}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {reactionsLoading ? '...' : reactions?.dislikes || 0}
                </Button>

                <ShareButton
                  url={`/story/${articleNaddr}`}
                  title={title}
                  description={summary || article.content.slice(0, 200)}
                />

                <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                  <MessageCircle className="w-4 h-4" />
                  <span>{commentsLoading ? '...' : comments?.length || 0} comments</span>
                </div>
              </div>

              {/* Comments Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Comments</h3>

                {/* Add Comment Form */}
                {user ? (
                  <div className="mb-6">
                    <Textarea
                      placeholder="Write a comment..."
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

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <CommentSkeleton key={i} />
                    ))}
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-0 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
