import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface CommentEvent extends NostrEvent {
  kind: 1111;
}

function validateCommentEvent(event: NostrEvent): event is CommentEvent {
  if (event.kind !== 1111) return false;

  // Check for required tags according to NIP-22
  const hasRootScope = event.tags.some(([name]) => ['A', 'E', 'I'].includes(name));
  const hasRootKind = event.tags.some(([name]) => name === 'K');
  const hasParentScope = event.tags.some(([name]) => ['a', 'e', 'i'].includes(name));
  const hasParentKind = event.tags.some(([name]) => name === 'k');

  return hasRootScope && hasRootKind && hasParentScope && hasParentKind;
}

export function useReviewComments(reviewNaddr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['review-comments', reviewNaddr],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for comments that reference this review
      // Comments use 'A' tag for addressable events like reviews (kind 34879)
      const events = await nostr.query([{
        kinds: [1111],
        '#A': [reviewNaddr],
        limit: 100,
      }], { signal });

      const validComments = events.filter(validateCommentEvent);

      // Sort by creation time (oldest first for better conversation flow)
      return validComments.sort((a, b) => a.created_at - b.created_at);
    },
    enabled: !!reviewNaddr,
  });
}