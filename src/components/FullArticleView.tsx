import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useArticleReactions, useReactToArticle } from '@/hooks/useArticleReactions';
import { useArticleComments, useCommentOnArticle } from '@/hooks/useArticleComments';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { useToast } from '@/hooks/useToast';
import {
  Heart,
  MessageCircle,
  Share,
  X,
  Send,
  Calendar,
  MapPin,
  Shield,
  ThumbsDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface FullArticleViewProps {
  article: NostrEvent;
  isOpen: boolean;
  onClose: () => void;
}

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

export function FullArticleView({ article, isOpen, onClose }: FullArticleViewProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: summary || 'Check out this travel article on Traveltelly',
          url: window.location.href,
        });
      } catch {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          description: 'Article link has been copied to clipboard.',
        });
      } catch {
        toast({
          title: 'Failed to copy link',
          description: 'Please copy the URL manually.',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <DialogTitle className="text-xl font-bold leading-tight mb-2">
                {title}
              </DialogTitle>
              {summary && (
                <p className="text-sm text-muted-foreground mb-3">
                  {summary}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={authorImage} alt={authorName} />
                    <AvatarFallback className="text-xs">
                      {authorName[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{authorName}</span>
                  <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 border-orange-200">
                    <Shield className="w-3 h-3 mr-1" />
                    Traveltelly
                  </Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(displayDate, { addSuffix: true })}
                </div>
                {location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </div>
                )}
              </div>
              {topicTags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {topicTags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Featured Image */}
          {image && (
            <div className="mb-6">
              <img
                src={image}
                alt={title}
                className="w-full max-h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert mb-8">
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

            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-1" />
              Share
            </Button>

            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <MessageCircle className="w-4 h-4" />
              {commentsLoading ? '...' : comments?.length || 0} comments
            </div>
          </div>

          {/* Comment Form */}
          {user && (
            <div className="mb-6">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    You
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[80px] mb-2"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={isCommenting || !newComment.trim()}
                    size="sm"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    Post Comment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <h3 className="font-semibold mb-4">
              Comments ({commentsLoading ? '...' : comments?.length || 0})
            </h3>

            {commentsLoading ? (
              <div>
                {Array.from({ length: 3 }, (_, i) => (
                  <CommentSkeleton key={i} />
                ))}
              </div>
            ) : !comments || comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}