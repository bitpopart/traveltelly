import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];

  return !!(d && title && rating && category);
}

export function useAllReviews() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['all-reviews'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for all review events (not just authorized reviewers)
      const events = await nostr.query([{
        kinds: [34879],
        limit: 100 // Get more reviews for admin purposes
      }], { signal });

      return events
        .filter(validateReviewEvent)
        .sort((a, b) => b.created_at - a.created_at);
    },
  });
}

export function useUserReviews(pubkey: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-reviews', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query([{
        kinds: [34879],
        authors: [pubkey],
        limit: 50
      }], { signal });

      return events
        .filter(validateReviewEvent)
        .sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
  });
}