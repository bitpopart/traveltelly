import { useInfiniteQuery } from '@tanstack/react-query';
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

export function useInfiniteReviews() {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['infinite-reviews'],
    queryFn: async ({ pageParam, signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(10000)]);

      // Build filter with pagination
      const filter: {
        kinds: number[];
        limit: number;
        until?: number;
      } = {
        kinds: [34879],
        limit: 50, // Load 50 reviews per page
      };

      // Add until parameter for pagination (older than this timestamp)
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], { signal: abortSignal });

      const validReviews = events.filter(validateReviewEvent);

      // Sort by creation time (newest first)
      const sortedReviews = validReviews.sort((a, b) => b.created_at - a.created_at);

      // Get the oldest timestamp for next page
      const nextPageParam = sortedReviews.length > 0
        ? sortedReviews[sortedReviews.length - 1].created_at
        : undefined;

      return {
        reviews: sortedReviews,
        nextPageParam,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: undefined as number | undefined,
  });
}