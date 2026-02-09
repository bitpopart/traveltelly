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
  Shield,
  ThumbsDown,
  ArrowLeft,
  Video as VideoIcon
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

export default function VideoDetail() {
  const { naddr } = useParams<{ naddr: string }>();
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');

  const { data: video, isLoading, error } = useQuery({
    queryKey: ['video', naddr],
    queryFn: async (c) => {
      if (!naddr) throw new Error('No video identifier provided');

      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') {
        throw new Error('Invalid video identifier');
      }

      const { kind, pubkey, identifier } = decoded.data;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([{
        kinds: [kind],
        authors: [pubkey],
        '#d': [identifier],
      }], { signal });

      if (events.length === 0) return null;
      return events[0];
    },
    enabled: !!naddr,
    retry: 2,
    retryDelay: 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="aspect-video w-full mb-6" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <VideoIcon className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Video Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    This video couldn't be found on the current relay.
                  </p>
                </div>
                <Link to="/stories?type=video">
                  <Button>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Videos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Extract video metadata
  const title = video.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Video';
  const summary = video.tags.find(([name]) => name === 'summary')?.[1] || video.content;
  const identifier = video.tags.find(([name]) => name === 'd')?.[1] || '';
  
  // Parse imeta tag for video URL and metadata (NIP-71)
  const imetaTag = video.tags.find(([name]) => name === 'imeta');
  let videoUrl = '';
  let thumb = '';
  let duration = '';
  let dimensions = '';
  
  if (imetaTag) {
    // Parse imeta properties
    for (let i = 1; i < imetaTag.length; i++) {
      const part = imetaTag[i];
      if (part.startsWith('url ')) {
        videoUrl = part.substring(4);
      } else if (part.startsWith('image ')) {
        thumb = part.substring(6);
      } else if (part.startsWith('duration ')) {
        const durationSec = parseFloat(part.substring(9));
        const minutes = Math.floor(durationSec / 60);
        const seconds = Math.floor(durationSec % 60);
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else if (part.startsWith('dim ')) {
        dimensions = part.substring(4);
      }
    }
  }
  
  // Fallback to legacy tags if imeta not present
  if (!videoUrl) {
    videoUrl = video.tags.find(([name]) => name === 'url')?.[1] || '';
  }
  if (!thumb) {
    thumb = video.tags.find(([name]) => name === 'thumb')?.[1] || '';
  }
  if (!duration) {
    duration = video.tags.find(([name]) => name === 'duration')?.[1] || '';
  }

  const topicTags = video.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0 && !['travel', 'traveltelly'].includes(tag));

  const author = useAuthor(video.pubkey);
  const authorMetadata = author.data?.metadata;
  const authorName = authorMetadata?.name || genUserName(video.pubkey);
  const authorImage = authorMetadata?.picture;

  const { data: reactions, isLoading: reactionsLoading } = useArticleReactions(video.id, video.pubkey);
  const { data: comments, isLoading: commentsLoading } = useArticleComments(video.id, video.pubkey, identifier);
  const { mutate: reactToArticle, isPending: isReacting } = useReactToArticle();
  const { mutate: commentOnArticle, isPending: isCommenting } = useCommentOnArticle();

  const handleReaction = (reaction: '+' | '-') => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to react to videos.',
        variant: 'destructive',
      });
      return;
    }

    reactToArticle({
      articleId: video.id,
      articleAuthor: video.pubkey,
      reaction,
    });
  };

  const handleComment = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to comment.',
        variant: 'destructive',
      });
      return;
    }

    if (!newComment.trim()) return;

    commentOnArticle({
      articleId: video.id,
      articleAuthor: video.pubkey,
      articleIdentifier: identifier,
      content: newComment,
    }, {
      onSuccess: () => {
        setNewComment('');
        toast({
          title: 'Comment posted!',
        });
      },
    });
  };

  // Only create videoNaddr if we have a valid identifier
  let videoNaddr = '';
  try {
    if (identifier) {
      videoNaddr = nip19.naddrEncode({
        identifier,
        pubkey: video.pubkey,
        kind: video.kind, // Use actual kind (34235 or 34236)
      });
    }
  } catch (error) {
    console.error('Failed to create naddr:', error);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6 flex justify-between items-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {videoNaddr && (
              <ShareToNostrButton
                url={`/video/${videoNaddr}`}
                title={title}
                description={summary}
                image={thumb}
                defaultContent={`🎥 ${title}\n\n${summary}\n\ntraveltelly.com/video/${videoNaddr}`}
                variant="default"
                size="default"
              />
            )}
          </div>

          <Card>
            <CardContent className="p-0">
              {/* Video Player */}
              {videoUrl && (
                <div className="aspect-video bg-black">
                  <video
                    src={videoUrl}
                    poster={thumb}
                    controls
                    className="w-full h-full"
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Video Info */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-3">{title}</h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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
                      {formatDistanceToNow(new Date(video.created_at * 1000), { addSuffix: true })}
                    </div>
                    {duration && (
                      <Badge variant="outline">
                        {duration}
                      </Badge>
                    )}
                  </div>

                  {summary && (
                    <p className="text-muted-foreground mb-4">
                      {summary}
                    </p>
                  )}

                  {topicTags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {topicTags.map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
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
                    {reactionsLoading ? '...' : (reactions?.likes ?? 0)}
                  </Button>

                  <Button
                    variant={reactions?.userReaction === '-' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleReaction('-')}
                    disabled={isReacting || !user}
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {reactionsLoading ? '...' : (reactions?.dislikes ?? 0)}
                  </Button>

                  {videoNaddr && (
                    <ShareButton
                      url={`/video/${videoNaddr}`}
                      title={title}
                      description={summary}
                    />
                  )}

                  <div className="flex items-center gap-1 text-muted-foreground ml-auto">
                    <MessageCircle className="w-4 h-4" />
                    <span>{commentsLoading ? '...' : (comments?.length ?? 0)} comments</span>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Comments</h3>

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
                        Please log in to comment on this video.
                      </p>
                    </div>
                  )}

                  {commentsLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
