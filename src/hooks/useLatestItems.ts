import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';
import { useAdminReviews } from './useAdminReviews';

// The Traveltelly admin npub
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

/**
 * Fetch the latest review with an image
 */
export function useLatestReview() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();

  return useQuery({
    queryKey: ['latest-review-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors,
        limit: 30
      }], { signal });

      // Find the first review with an image
      const reviewWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const rating = event.tags.find(([name]) => name === 'rating')?.[1];
          const category = event.tags.find(([name]) => name === 'category')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          return !!(d && title && rating && category && image);
        })
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (!reviewWithImage) return null;

      const image = reviewWithImage.tags.find(([name]) => name === 'image')?.[1];
      const title = reviewWithImage.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
      const identifier = reviewWithImage.tags.find(([name]) => name === 'd')?.[1] || '';
      
      const naddr = nip19.naddrEncode({
        identifier,
        pubkey: reviewWithImage.pubkey,
        kind: 34879,
      });

      return {
        image,
        title,
        naddr,
        event: reviewWithImage,
      };
    },
    enabled: !!authorizedReviewers && authorizedReviewers.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch the latest story (article) with an image
 */
export function useLatestStory() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-story-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      // Query for articles (kind 30023) from admin
      const events = await nostr.query([{
        kinds: [30023],
        authors: [ADMIN_HEX],
        limit: 20
      }], { signal });

      // Find the first story with an image
      const storyWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          return !!(d && title && image);
        })
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (!storyWithImage) return null;

      const image = storyWithImage.tags.find(([name]) => name === 'image')?.[1];
      const title = storyWithImage.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
      const identifier = storyWithImage.tags.find(([name]) => name === 'd')?.[1] || '';
      
      const naddr = nip19.naddrEncode({
        identifier,
        pubkey: storyWithImage.pubkey,
        kind: 30023,
      });

      return {
        image,
        title,
        naddr,
        event: storyWithImage,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch the latest stock media product with an image
 */
export function useLatestStockMedia() {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['latest-stock-media-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 25
      }], { signal });

      // Find the first product with an image
      const productWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const price = event.tags.find(([name]) => name === 'price');
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const status = event.tags.find(([name]) => name === 'status')?.[1];
          
          // Check price validity
          const hasValidPrice = price && price.length >= 3 && price[1] && price[2];
          
          // Only show active/available products
          const isActive = !status || status === 'active';
          
          return !!(d && title && hasValidPrice && image && isActive);
        })
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (!productWithImage) return null;

      const image = productWithImage.tags.find(([name]) => name === 'image')?.[1];
      const title = productWithImage.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Product';
      const identifier = productWithImage.tags.find(([name]) => name === 'd')?.[1] || '';
      
      const naddr = nip19.naddrEncode({
        identifier,
        pubkey: productWithImage.pubkey,
        kind: 30402,
      });

      return {
        image,
        title,
        naddr,
        event: productWithImage,
      };
    },
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

/**
 * Get total count of reviews
 */
export function useReviewCount() {
  const { data } = useAdminReviews();
  
  if (!data?.pages) return 0;
  
  const allReviews = data.pages.flatMap(page => page.reviews);
  return allReviews.length;
}

/**
 * Get total count of stories
 */
export function useStoryCount() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['story-count'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([{
        kinds: [30023],
        authors: [ADMIN_HEX],
        limit: 1000
      }], { signal });

      return events.length;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

/**
 * Get total count of stock media products
 */
export function useStockMediaCount() {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['stock-media-count'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 1000
      }], { signal });

      // Filter out deleted items
      const activeProducts = events.filter(event => {
        const status = event.tags.find(([name]) => name === 'status')?.[1];
        const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
        const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];
        
        return status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';
      });

      return activeProducts.length;
    },
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}
