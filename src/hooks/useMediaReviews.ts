import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';

export interface MediaReview {
  id: string;
  rating: number;
  comment: string;
  author: {
    pubkey: string;
    name?: string;
    picture?: string;
  };
  createdAt: number;
  event: NostrEvent;
}

function validateMediaReview(event: NostrEvent): boolean {
  // Check if it's a review kind (kind 1985 for reviews)
  if (event.kind !== 1985) return false;

  // Check for required tags
  const lTag = event.tags.find(([name]) => name === 'l')?.[1]; // rating
  const eTag = event.tags.find(([name]) => name === 'e')?.[1]; // event being reviewed

  if (!lTag || !eTag) return false;

  // Rating should be a valid number between 1-5
  const rating = parseFloat(lTag);
  if (isNaN(rating) || rating < 1 || rating > 5) return false;

  return true;
}

function parseMediaReview(event: NostrEvent): MediaReview | null {
  try {
    const lTag = event.tags.find(([name]) => name === 'l')?.[1];
    const rating = parseFloat(lTag || '0');

    return {
      id: event.id,
      rating,
      comment: event.content,
      author: {
        pubkey: event.pubkey,
      },
      createdAt: event.created_at,
      event,
    };
  } catch (error) {
    console.error('Error parsing media review:', error);
    return null;
  }
}

export function useMediaReviews(productEventId?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['media-reviews', productEventId],
    queryFn: async (c) => {
      if (!productEventId) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      // Query for reviews that reference this product
      const filter: NostrFilter = {
        kinds: [1985], // NIP-32 reviews
        '#e': [productEventId], // Reviews of this specific event
        limit: 50,
      };

      const events = await nostr.query([filter], { signal });

      // Filter and parse events
      const reviews = events
        .filter(validateMediaReview)
        .map(parseMediaReview)
        .filter((review): review is MediaReview => review !== null)
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

      return reviews;
    },
    enabled: !!productEventId,
    staleTime: 30000, // 30 seconds
  });
}