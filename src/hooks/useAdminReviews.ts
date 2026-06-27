import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { NRelay1 } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';

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

// Approved relays — query all three in parallel for best coverage
const REVIEW_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.dreamith.to',
  'wss://relay.primal.net',
];

/**
 * Query ALL admin reviews directly from all 3 relays in parallel,
 * bypassing the NPool's eoseTimeout. Merges and deduplicates results.
 * Each NRelay1 instance uses a generous eoseTimeout so the relay has
 * time to stream back all events before the subscription closes.
 */
async function fetchAllAdminReviewsDirect(signal: AbortSignal): Promise<NostrEvent[]> {
  const filter: NostrFilter = {
    kinds: [34879],
    authors: [ADMIN_HEX],
    limit: 2000,
  };

  const results = await Promise.allSettled(
    REVIEW_RELAYS.map(async (url) => {
      // Give each relay up to 10 seconds to stream back all events
      const relay = new NRelay1(url, { eoseTimeout: 10000 });
      try {
        return await relay.query([filter], { signal });
      } finally {
        relay.close?.();
      }
    })
  );

  // Merge all events, deduplicate by event id
  const seen = new Map<string, NostrEvent>();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const e of r.value) {
        if (!seen.has(e.id)) seen.set(e.id, e);
      }
    }
  }
  return Array.from(seen.values());
}

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

      const filter: {
        kinds: number[];
        authors: string[];
        limit: number;
        until?: number;
      } = {
        kinds: [34879],
        authors: [ADMIN_HEX],
        limit: 20,
      };

      if (pageParam) {
        filter.until = pageParam;
      }

      const events = await nostr.query([filter], { signal: abortSignal });
      const validReviews = events.filter(validateReviewEvent);
      const sortedReviews = validReviews.sort((a, b) => b.created_at - a.created_at);

      const nextPageParam = sortedReviews.length > 0
        ? sortedReviews[sortedReviews.length - 1].created_at
        : undefined;

      return { reviews: sortedReviews, nextPageParam };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: undefined as number | undefined,
  });
}

/**
 * Fetch ALL admin reviews for the world map — queries all 3 relays directly
 * in parallel with a generous per-relay eoseTimeout (10s).
 * Returns a flat sorted array of valid review events.
 */
export function useAllAdminReviews() {
  return useQuery({
    queryKey: ['all-admin-reviews-direct', ADMIN_HEX],
    queryFn: async ({ signal }) => {
      // Allow up to 12s total; each NRelay1 uses 10s eoseTimeout internally
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(12000)]);
      const events = await fetchAllAdminReviewsDirect(abortSignal);
      const validReviews = events.filter(validateReviewEvent);
      return validReviews.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // Return [] immediately so the map renders while loading
    placeholderData: [],
  });
}
