import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { getShortNpub } from '@/lib/nostrUtils';
import { MessageCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentEvent extends NostrEvent {
  kind: 1111;
}

interface CommentItemProps {
  comment: CommentEvent;
}

function CommentItem({ comment }: CommentItemProps) {
  const author = useAuthor(comment.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(comment.pubkey);
  const profileImage = metadata?.picture;

  return (
    <Card className="border-l-4 border-l-blue-200 dark:border-l-blue-800">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileImage} alt={displayName} />
            <AvatarFallback className="text-xs">
              {displayName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm">{displayName}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {getShortNpub(comment.pubkey)}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDistanceToNow(new Date(comment.created_at * 1000), { addSuffix: true })}
              </p>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CommentSkeleton() {
  return (
    <Card className="border-l-4 border-l-gray-200 dark:border-l-gray-800">
      <CardContent className="pt-4">
        <div className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CommentListProps {
  comments: CommentEvent[];
  isLoading: boolean;
  error: Error | null;
}

export function CommentList({ comments, isLoading, error }: CommentListProps) {
  if (error) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Failed to load comments. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => (
          <CommentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <MessageCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}