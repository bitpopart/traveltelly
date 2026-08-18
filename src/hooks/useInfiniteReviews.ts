import { useInfiniteQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ReviewEvent extends NostrEvent {
  kind: 34879;
}

export function validateReviewEvent(event: NostrEvent): event is ReviewEvent {
  if (event.kind !== 34879) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];

  if (!(d && title && rating && category)) return false;

  // Exclude plain map photo/video pins (tagged type=pin by TellyMap)
  const type = event.tags.find(([name]) => name === 'type')?.[1];
  if (type === 'pin') return false;

  return true;
}

export function useInfiniteReviews() {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['infinite-reviews'],
    queryFn: async ({ pageParam, signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(10000)]);

      // Build filter with pagination. A page of kind-34879 events can be
      // entirely photo/video pins (type=pin), which are filtered out below, so
      // a larger limit means fewer round trips to reach the actual reviews.
      // 200 per page keeps requests small enough for relays while roughly
      // halving the number of pages needed to page past a big pin flood.
      const PAGE = 200;
      const filter: {
        kinds: number[];
        limit: number;
        until?: number;
      } = {
        kinds: [34879],
        limit: PAGE,
      };

      // Add until parameter for pagination (older than this timestamp)
      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], { signal: abortSignal });

      const validReviews = events.filter(validateReviewEvent);

      // Sort by creation time (newest first)
      const sortedReviews = validReviews.sort((a, b) => b.created_at - a.created_at);

      // Advance the cursor on the RAW event stream, not the filtered reviews.
      // Pins are typically newer than reviews, so a page can contain zero
      // reviews; if the cursor stopped there the feed would end early and show
      // "No reviews found" even though older real reviews exist on later pages.
      // Stop only when a page comes back smaller than the limit (data exhausted).
      const nextPageParam = events.length >= PAGE
        ? Math.min(...events.map((event) => event.created_at))
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