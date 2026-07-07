import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { nip19 } from 'nostr-tools';
import { useTravelTellyTour } from './useTravelTellyTour';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { isValidImageUrl } from '@/lib/imageValidation';

// Admin pubkey for TravelTelly Tour
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface ImageItem {
  image: string;
  title: string;
  naddr: string;
  type: 'review' | 'trip' | 'story' | 'stock' | 'tour' | 'video';
  event: NostrEvent;
  created_at: number;
  eventId?: string; // For tour items navigation
}

/**
 * Looser validator for video thumbnails extracted from imeta tags.
 * These are real uploaded images but may come from any CDN.
 */
function isValidVideoThumb(url: string): boolean {
  return isValidImageUrl(url);
}

/**
 * Extract the thumbnail image URL from a NIP-71 video event's imeta tag.
 * Returns empty string if no valid thumbnail found.
 */
function extractVideoThumb(event: NostrEvent): string {
  // Try imeta tag first
  const imetaTag = event.tags.find(([name]) => name === 'imeta');
  if (imetaTag) {
    for (let i = 1; i < imetaTag.length; i++) {
      if (imetaTag[i].startsWith('image ')) {
        const url = imetaTag[i].substring(6);
        if (isValidVideoThumb(url)) return url;
      }
    }
  }
  // Fallback: legacy thumb tag
  const thumb = event.tags.find(([name]) => name === 'thumb')?.[1] || '';
  if (thumb && isValidVideoThumb(thumb)) return thumb;
  return '';
}

/**
 * Fetch images with infinite pagination for faster loading.
 * Queries all authorized authors — not just the admin.
 */
export function useInfiniteImages() {
  const { nostr } = useNostr();
  const { data: tourItems = [] } = useTravelTellyTour();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  // Collect all relevant authors
  const reviewAuthors = Array.from(authorizedReviewers || new Set([ADMIN_HEX]));
  const stockAuthors = Array.from(authorizedUploaders || new Set([ADMIN_HEX]));

  return useInfiniteQuery({
    queryKey: ['infinite-images', tourItems?.length, reviewAuthors.length, stockAuthors.length],
    queryFn: async ({ pageParam, signal }) => {
      // 8 second timeout — enough for slower relays
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(8000)]);

      const images: ImageItem[] = [];
      const until = pageParam as number | undefined;

      // Fire two queries in parallel:
      //  1. Admin-only kinds (trips, stories, stock, videos) — always from admin
      //  2. Reviews — from all authorized reviewers
      const [adminEvents, reviewEvents] = await Promise.all([
        nostr.query([{
          kinds: [30025, 30023, 30402, 21, 22, 34235, 34236],
          authors: [ADMIN_HEX],
          limit: 50,
          ...(until && { until }),
        }], { signal: abortSignal }),

        // Only fire review query if we have authors and there's no active `until` cursor
        // (reviews are only shown on the first page to keep pagination simple)
        (!until && reviewAuthors.length > 0)
          ? nostr.query([{
              kinds: [34879],
              authors: reviewAuthors,
              limit: 50,
            }], { signal: abortSignal })
          : Promise.resolve([] as NostrEvent[]),
      ]);

      // Merge & de-duplicate by event ID
      const allEvents = Array.from(
        new Map([...adminEvents, ...reviewEvents].map(e => [e.id, e])).values()
      );

      allEvents.forEach((event: NostrEvent) => {
        // Reviews (kind 34879)
        if (event.kind === 34879) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          if (d && title && image && isValidImageUrl(image)) {
            images.push({
              image,
              title: title || 'Unknown Place',
              naddr: d, // Use d-tag slug for short SEO-friendly review URLs
              type: 'review',
              event,
              created_at: event.created_at,
            });
          }
        }

        // Trips (kind 30025) — may have multiple images
        else if (event.kind === 30025) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const imageTags = event.tags.filter(([name]) => name === 'image');
          if (d && title && imageTags.length > 0) {
            const naddr = nip19.naddrEncode({ identifier: d, pubkey: event.pubkey, kind: 30025 });
            imageTags.forEach(([, image]) => {
              if (image && isValidImageUrl(image)) {
                images.push({
                  image,
                  title: title || 'Untitled Trip',
                  naddr,
                  type: 'trip',
                  event,
                  created_at: event.created_at,
                });
              }
            });
          }
        }

        // Written stories (kind 30023)
        else if (event.kind === 30023) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          if (d && title && image && isValidImageUrl(image)) {
            images.push({
              image,
              title: title || 'Untitled Story',
              naddr: nip19.naddrEncode({ identifier: d, pubkey: event.pubkey, kind: 30023 }),
              type: 'story',
              event,
              created_at: event.created_at,
            });
          }
        }

        // Stock media (kind 30402)
        else if (event.kind === 30402) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const price = event.tags.find(([name]) => name === 'price');
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const status = event.tags.find(([name]) => name === 'status')?.[1];
          const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
          const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];
          const hasValidPrice = price && price.length >= 3 && price[1] && price[2];
          const isActive = status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';
          if (d && title && hasValidPrice && image && isActive && isValidImageUrl(image)) {
            images.push({
              image,
              title: title || 'Untitled Product',
              naddr: nip19.naddrEncode({ identifier: d, pubkey: event.pubkey, kind: 30402 }),
              type: 'stock',
              event,
              created_at: event.created_at,
            });
          }
        }

        // NIP-71 Videos (kinds 21, 22, 34235, 34236) — use imeta thumbnail
        else if ([21, 22, 34235, 34236].includes(event.kind)) {
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          if (!title) return;

          const thumb = extractVideoThumb(event);
          if (!thumb) return;

          // Build naddr for addressable kinds, nevent for regular kinds
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const isAddressable = d && (event.kind === 34235 || event.kind === 34236);
          const naddr = isAddressable
            ? nip19.naddrEncode({ identifier: d!, pubkey: event.pubkey, kind: event.kind })
            : nip19.neventEncode({ id: event.id, author: event.pubkey });

          images.push({
            image: thumb,
            title: title || 'Untitled Video',
            naddr,
            type: 'video',
            event,
            created_at: event.created_at,
          });
        }
      });

      // Inject TravelTelly Tour posts (kind 1 notes) on first page only
      if (!pageParam && tourItems && tourItems.length > 0) {
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
        });
      }

      // Sort newest first
      const sortedImages = images.sort((a, b) => b.created_at - a.created_at);

      // Cursor for next page: oldest timestamp minus 1
      const nextPageParam = sortedImages.length > 0
        ? sortedImages[sortedImages.length - 1].created_at - 1
        : undefined;

      return { images: sortedImages, nextPageParam };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: undefined as number | undefined,
    staleTime: 60 * 1000,        // 1 min — show cached images instantly on revisit
    gcTime: 10 * 60 * 1000,
    retry: 2,                    // retry twice on failure (relay timeouts)
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
  });
}
