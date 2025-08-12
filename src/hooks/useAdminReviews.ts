import { useInfiniteQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub who can grant permissions
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

// Convert npub to hex for internal use
function npubToHex(npub: string): string {
  try {
    const decoded = nip19.decode(npub);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    throw new Error('Invalid npub');
  } catch {
    throw new Error('Invalid npub format');
  }
}

const ADMIN_HEX = npubToHex(ADMIN_NPUB);

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

export function useAdminReviews() {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['admin-reviews', ADMIN_HEX],
    queryFn: async ({ pageParam, signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(15000)]);

      // Build filter specifically for admin reviews
      const filter: {
        kinds: number[];
        authors: string[];
        limit: number;
        until?: number;
      } = {
        kinds: [34879],
        authors: [ADMIN_HEX], // Only get admin reviews
        limit: 500, // Much larger limit to get more reviews per page
      };

      // Add until parameter for pagination (older than this timestamp)
      if (pageParam) {
        filter.until = pageParam;
      }

      console.log('🔍 Querying admin reviews with filter:', filter);

      const events = await nostr.query([filter], { signal: abortSignal });

      console.log(`📊 Raw admin events received: ${events.length}`);

      const validReviews = events.filter(validateReviewEvent);

      console.log(`✅ Valid admin reviews: ${validReviews.length}`);

      // Log reviews with and without geohash
      const reviewsWithGeohash = validReviews.filter(r => r.tags.find(([name]) => name === 'g'));
      const reviewsWithoutGeohash = validReviews.filter(r => !r.tags.find(([name]) => name === 'g'));

      console.log(`📍 Admin reviews with geohash: ${reviewsWithGeohash.length}`);
      console.log(`❌ Admin reviews without geohash: ${reviewsWithoutGeohash.length}`);

      if (reviewsWithoutGeohash.length > 0) {
        console.log('📝 Reviews without geohash:', reviewsWithoutGeohash.slice(0, 5).map(r => ({
          id: r.id.slice(0, 8),
          title: r.tags.find(([name]) => name === 'title')?.[1],
          created: new Date(r.created_at * 1000).toISOString(),
        })));
        if (reviewsWithoutGeohash.length > 5) {
          console.log(`... and ${reviewsWithoutGeohash.length - 5} more without geohash`);
        }
      }

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

// Hook to automatically load all admin reviews
export function useAllAdminReviews() {
  const { nostr } = useNostr();

  return useInfiniteQuery({
    queryKey: ['all-admin-reviews', ADMIN_HEX],
    queryFn: async ({ pageParam, signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(20000)]);

      // Build filter specifically for admin reviews
      const filter: {
        kinds: number[];
        authors: string[];
        limit: number;
        until?: number;
      } = {
        kinds: [34879],
        authors: [ADMIN_HEX], // Only get admin reviews
        limit: 1000, // Very large limit to get as many as possible
      };

      // Add until parameter for pagination (older than this timestamp)
      if (pageParam) {
        filter.until = pageParam;
      }

      console.log('🔍 Querying ALL admin reviews with filter:', filter);

      const events = await nostr.query([filter], { signal: abortSignal });

      console.log(`📊 Raw admin events received (page): ${events.length}`);

      const validReviews = events.filter(validateReviewEvent);

      console.log(`✅ Valid admin reviews (page): ${validReviews.length}`);

      // Sort by creation time (newest first)
      const sortedReviews = validReviews.sort((a, b) => b.created_at - a.created_at);

      // Get the oldest timestamp for next page
      const nextPageParam = sortedReviews.length >= 1000
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