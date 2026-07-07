import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from './useCurrentUser';
import { useIsContributor } from './useIsContributor';
import { useTravelTellyTour } from './useTravelTellyTour';
import { isValidImageUrl } from '@/lib/imageValidation';

// Admin pubkey for TravelTelly Tour
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface ImageItem {
  image: string;
  title: string;
  naddr: string;
  type: 'review' | 'trip' | 'story' | 'stock' | 'tour';
  event: NostrEvent;
  created_at: number;
  eventId?: string; // For tour items navigation
}

/**
 * Fetch all images from reviews, trips, stories, stock media, AND TravelTelly Tour.
 * Sorted by newest first for fast, consistent display.
 */
export function useAllImages() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const isContributor = useIsContributor();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();
  const { data: tourItems = [] } = useTravelTellyTour();

  // Suppress unused-variable warnings — these may be needed for future filtering
  void user;
  void isContributor;

  const reviewAuthors = Array.from(authorizedReviewers || new Set([ADMIN_HEX]));
  const stockAuthors = Array.from(authorizedUploaders || new Set([ADMIN_HEX]));

  return useQuery({
    queryKey: ['all-images', tourItems?.length, reviewAuthors.length, stockAuthors.length],
    queryFn: async (c) => {
      // 8 second timeout — enough for slower relays
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      const images: ImageItem[] = [];

      // Run ALL queries in parallel for maximum speed
      const [reviewEvents, tripEvents, storyEvents, stockEvents] = await Promise.all([
        // Reviews — from all authorized reviewers
        reviewAuthors.length > 0
          ? nostr.query([{ kinds: [34879], authors: reviewAuthors, limit: 50 }], { signal })
          : Promise.resolve([] as NostrEvent[]),

        // Trips — from admin (main content source)
        nostr.query([{ kinds: [30025], authors: [ADMIN_HEX], limit: 50 }], { signal }),

        // Stories — from admin (main content source)
        nostr.query([{ kinds: [30023], authors: [ADMIN_HEX], limit: 50 }], { signal }),

        // Stock Media — from all authorized uploaders
        stockAuthors.length > 0
          ? nostr.query([{ kinds: [30402], authors: stockAuthors, limit: 50 }], { signal })
          : Promise.resolve([] as NostrEvent[]),
      ]);

      // Process reviews
      reviewEvents
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          return !!(d && title && image);
        })
        .forEach((event) => {
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
          const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';

          const naddr = nip19.naddrEncode({
            identifier,
            pubkey: event.pubkey,
            kind: 34879,
          });

          if (image && isValidImageUrl(image)) {
            images.push({
              image,
              title,
              naddr,
              type: 'review',
              event,
              created_at: event.created_at,
            });
          }
        });

      // Process trips
      tripEvents
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const imageTags = event.tags.filter(([name]) => name === 'image');
          return !!(d && title && imageTags.length > 0);
        })
        .forEach((event) => {
          const imageTags = event.tags.filter(([name]) => name === 'image');
          const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
          const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';

          const naddr = nip19.naddrEncode({
            identifier,
            pubkey: event.pubkey,
            kind: 30025,
          });

          imageTags.forEach(([, image]) => {
            if (image && isValidImageUrl(image)) {
              images.push({
                image,
                title,
                naddr,
                type: 'trip',
                event,
                created_at: event.created_at,
              });
            }
          });
        });

      // Process stories
      storyEvents
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          return !!(d && title && image);
        })
        .forEach((event) => {
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
          const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';

          const naddr = nip19.naddrEncode({
            identifier,
            pubkey: event.pubkey,
            kind: 30023,
          });

          if (image && isValidImageUrl(image)) {
            images.push({
              image,
              title,
              naddr,
              type: 'story',
              event,
              created_at: event.created_at,
            });
          }
        });

      // Process stock media
      stockEvents
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const price = event.tags.find(([name]) => name === 'price');
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const status = event.tags.find(([name]) => name === 'status')?.[1];
          const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
          const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];

          const hasValidPrice = price && price.length >= 3 && price[1] && price[2];
          const isActive = status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';

          return !!(d && title && hasValidPrice && image && isActive);
        })
        .forEach((event) => {
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Product';
          const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';

          const naddr = nip19.naddrEncode({
            identifier,
            pubkey: event.pubkey,
            kind: 30402,
          });

          if (image && isValidImageUrl(image)) {
            images.push({
              image,
              title,
              naddr,
              type: 'stock',
              event,
              created_at: event.created_at,
            });
          }
        });

      // Add TravelTelly Tour posts
      if (tourItems && tourItems.length > 0) {
        tourItems.forEach((item) => {
          item.images.forEach((imageUrl) => {
            if (isValidImageUrl(imageUrl)) {
              images.push({
                image: imageUrl,
                title: item.content.slice(0, 100) || 'TravelTelly Tour',
                naddr: '',
                type: 'tour',
                event: item.event,
                created_at: item.created_at,
                eventId: item.id,
              });
            }
          });

          // Add all videos from this tour post
          item.videos.forEach((videoUrl) => {
            images.push({
              image: videoUrl,
              title: item.content.slice(0, 100) || 'TravelTelly Tour',
              naddr: '',
              type: 'tour',
              event: item.event,
              created_at: item.created_at,
              eventId: item.id,
            });
          });
        });
      }

      // Sort by created_at (newest first)
      return images.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 60 * 1000,           // 1 min — show cached instantly on revisit
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    // Don't block render on authorizedReviewers — use fallback (admin only) if not yet loaded
    enabled: true,
  });
}
