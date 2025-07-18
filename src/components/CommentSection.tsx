import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';
import { useReviewComments } from '@/hooks/useReviewComments';
import { MessageCircle } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentSectionProps {
  review: NostrEvent;
}

export function CommentSection({ review }: CommentSectionProps) {
  // Generate naddr for the review
  const reviewIdentifier = review.tags.find(([name]) => name === 'd')?.[1];
  const reviewNaddr = reviewIdentifier ? nip19.naddrEncode({
    identifier: reviewIdentifier,
    pubkey: review.pubkey,
    kind: 34879,
  }) : '';

  const { data: comments, isLoading, error, refetch } = useReviewComments(reviewNaddr);

  const handleCommentAdded = () => {
    // Refetch comments when a new comment is added
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Comments Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Comments ({comments?.length || 0})
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Comment Form */}
      <CommentForm review={review} onCommentAdded={handleCommentAdded} />

      {/* Comments List */}
      <div>
        <CommentList
          comments={comments || []}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  );
}