import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { MessageCircle, Loader2 } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentFormProps {
  review: NostrEvent;
  onCommentAdded?: () => void;
}

export function CommentForm({ review, onCommentAdded }: CommentFormProps) {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();

  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: CommentFormData) => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'You must be logged in to comment.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get the review's naddr for referencing
      const reviewIdentifier = review.tags.find(([name]) => name === 'd')?.[1];
      if (!reviewIdentifier) {
        throw new Error('Review identifier not found');
      }

      const reviewNaddr = nip19.naddrEncode({
        identifier: reviewIdentifier,
        pubkey: review.pubkey,
        kind: 34879,
      });

      // Create comment event according to NIP-22
      const tags: string[][] = [
        // Root scope - the review being commented on
        ['A', reviewNaddr],
        ['K', '34879'], // Root kind (review)
        ['P', review.pubkey], // Root author

        // Parent scope - same as root for top-level comments
        ['a', reviewNaddr],
        ['e', review.id], // Include event id for addressable events
        ['k', '34879'], // Parent kind (review)
        ['p', review.pubkey], // Parent author

        // Alt tag for accessibility
        ['alt', `Comment on review: ${review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place'}`],
      ];

      createEvent({
        kind: 1111,
        content: data.content,
        tags,
      });

      // Reset form
      form.reset();

      toast({
        title: 'Comment posted!',
        description: 'Your comment has been published.',
      });

      // Notify parent component
      onCommentAdded?.();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Failed to post comment',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground mb-4">
            You must be logged in to comment on this review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Add a Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="content">Your Comment</Label>
            <Textarea
              id="content"
              placeholder="Share your thoughts about this review..."
              rows={4}
              {...form.register('content')}
            />
            {form.formState.errors.content && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.content.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPublishing}
            className="w-full"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Posting Comment...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Post Comment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}