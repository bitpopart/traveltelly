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
 * Check if an image URL is a real uploaded image (not a placeholder or template)
 * ONLY ALLOW REAL IMAGE HOSTING SERVICES - NO TEMPLATE/PLACEHOLDER IMAGES EVER!
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Must start with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  const lowerUrl = url.toLowerCase();
  
  // WHITELIST: Only allow known real image hosting services
  const allowedDomains = [
    'nostr.build',
    'void.cat',
    'satellite.earth',
    'nostrcheck.me',
    'blossom.primal.net',
    'image.nostr.build',
    'i.nostr.build',
    'media.nostr.band',
  ];
  
  const isAllowedDomain = allowedDomains.some(domain => lowerUrl.includes(domain));
  if (!isAllowedDomain) {
    return false;
  }
  
  // BLACKLIST: Block known placeholder services  
  const invalidPatterns = [
    '/placeholder',
    'placeholder.com',
    'via.placeholder',
    'placehold',
    'example.com',
    'localhost',
    'data:image',
    'blob:',
    'picsum.photos',
    'unsplash.it',
    'dummyimage.com',
    'fakeimg.pl',
    'loremflickr.com',
  ];
  
  if (invalidPatterns.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  
  return true;
}

/**
 * Fetch the latest review with an image (for homepage thumbnail)
 */
export function useLatestReview() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();

  return useQuery({
    queryKey: ['latest-review-with-image', authorizedReviewers?.size],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors,
        limit: 5 // Only need 5 events to find 1 with image
      }], { signal });

      // Find the first review with an image
      const reviewWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const rating = event.tags.find(([name]) => name === 'rating')?.[1];
          const category = event.tags.find(([name]) => name === 'category')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          return !!(d && title && rating && category && isValidImageUrl(image));
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
    
    staleTime: 30 * 1000, // 30 seconds - so new reviews appear quickly
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch the last 3 reviews with images
 */
export function useLatestReviews() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();

  return useQuery({
    queryKey: ['latest-reviews-with-images', authorizedReviewers?.size],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors,
        limit: 10
      }], { signal });

      // Find reviews with images
      const reviewsWithImages = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const rating = event.tags.find(([name]) => name === 'rating')?.[1];
          const category = event.tags.find(([name]) => name === 'category')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          return !!(d && title && rating && category && isValidImageUrl(image));
        })
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3); // Get the last 3

      return reviewsWithImages.map((event) => {
        const image = event.tags.find(([name]) => name === 'image')?.[1];
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Unknown Place';
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        
        const naddr = nip19.naddrEncode({
          identifier,
          pubkey: event.pubkey,
          kind: 34879,
        });

        return {
          image,
          title,
          naddr,
          event,
        };
      });
    },
    
    staleTime: 30 * 1000, // 30 seconds - so new reviews appear quickly
    gcTime: 10 * 60 * 1000,
    refetchInterval: false,
  });
}

/**
 * Fetch the latest story (article) with an image (for homepage thumbnail)
 */
export function useLatestStory() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-story-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      // Query for articles (kind 30023) from admin
      const events = await nostr.query([{
        kinds: [30023],
        authors: [ADMIN_HEX],
        limit: 5 // Only need 5 to find 1 with image
      }], { signal });

      // Find the first story with an image
      const storyWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          return !!(d && title && isValidImageUrl(image));
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
 * Fetch the last 3 stories with images (includes both written stories and video stories)
 */
export function useLatestStories() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-stories-with-images'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      // Query for both articles (kind 30023) and video stories (kinds 34235/34236)
      const events = await nostr.query([
        {
          kinds: [30023],
          '#t': ['traveltelly'],
          limit: 10
        },
        {
          kinds: [34235, 34236], // Video stories (landscape and portrait)
          '#t': ['traveltelly'],
          limit: 10
        }
      ], { signal });

      // Find stories with images or video thumbnails
      const storiesWithImages = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          
          // For written stories (30023), check 'image' tag
          if (event.kind === 30023) {
            const image = event.tags.find(([name]) => name === 'image')?.[1];
            return !!(d && title && isValidImageUrl(image));
          }
          
          // For video stories (34235/34236), check 'imeta' tag for thumbnail
          if (event.kind === 34235 || event.kind === 34236) {
            const imetaTag = event.tags.find(([name]) => name === 'imeta');
            if (!imetaTag) return false;
            
            // Extract thumbnail from imeta
            let thumb = '';
            for (let i = 1; i < imetaTag.length; i++) {
              const part = imetaTag[i];
              if (part.startsWith('image ')) {
                thumb = part.substring(6);
                break;
              }
            }
            
            // Fallback to legacy thumb tag
            if (!thumb) {
              thumb = event.tags.find(([name]) => name === 'thumb')?.[1] || '';
            }
            
            return !!(d && title && isValidImageUrl(thumb));
          }
          
          return false;
        })
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3); // Get the last 3

      return storiesWithImages.map((event) => {
        let image = '';
        
        // Extract image based on event kind
        if (event.kind === 30023) {
          image = event.tags.find(([name]) => name === 'image')?.[1] || '';
        } else if (event.kind === 34235 || event.kind === 34236) {
          // Extract thumbnail from imeta tag
          const imetaTag = event.tags.find(([name]) => name === 'imeta');
          if (imetaTag) {
            for (let i = 1; i < imetaTag.length; i++) {
              const part = imetaTag[i];
              if (part.startsWith('image ')) {
                image = part.substring(6);
                break;
              }
            }
          }
          // Fallback to legacy thumb tag
          if (!image) {
            image = event.tags.find(([name]) => name === 'thumb')?.[1] || '';
          }
        }
        
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        
        const naddr = nip19.naddrEncode({
          identifier,
          pubkey: event.pubkey,
          kind: event.kind,
        });

        return {
          image,
          title,
          naddr,
          event,
        };
      });
    },
      staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch the latest stock media product with an image (for homepage thumbnail)
 */
export function useLatestStockMedia() {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['latest-stock-media-with-image', authorizedUploaders?.size],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      
      if (authorizedAuthors.length === 0) {
        return null;
      }

      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 10 // Reduced for faster loading
      }], { signal });

      // Find the first product with an image - use same filter as count
      const productWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const price = event.tags.find(([name]) => name === 'price');
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const status = event.tags.find(([name]) => name === 'status')?.[1];
          const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
          const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];
          
          // Check price validity
          const hasValidPrice = price && price.length >= 3 && price[1] && price[2];
          
          // Match the same filter logic as count query
          const isActive = status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';
          
          return !!(d && title && hasValidPrice && isValidImageUrl(image) && isActive);
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
    
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Fetch the last 3 stock media products with images
 */
export function useLatestStockMediaItems() {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['latest-stock-media-items-with-images', authorizedUploaders?.size],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      
      if (authorizedAuthors.length === 0) {
        return [];
      }

      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 10 // Reduced for faster loading
      }], { signal });



      // Find products with images
      const productsWithImages = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const price = event.tags.find(([name]) => name === 'price');
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          const status = event.tags.find(([name]) => name === 'status')?.[1];
          const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
          const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];
          
          // Check price validity
          const hasValidPrice = price && price.length >= 3 && price[1] && price[2];
          
          // Match the same filter logic as count query
          const isActive = status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';
          
          return !!(d && title && hasValidPrice && isValidImageUrl(image) && isActive);
        })
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3); // Get the last 3



      return productsWithImages.map((event) => {
        const image = event.tags.find(([name]) => name === 'image')?.[1];
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Product';
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        
        const naddr = nip19.naddrEncode({
          identifier,
          pubkey: event.pubkey,
          kind: 30402,
        });

        return {
          image,
          title,
          naddr,
          event,
        };
      });
    },
    
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Disabled auto-refresh for performance
    refetchOnMount: false, // Don't refetch on mount if cached
    refetchOnWindowFocus: false, // Don't refetch on focus for performance
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
 * Get total count of stories (derived from the latest stories query, no extra relay request)
 */
export function useStoryCount() {
  const { data: stories = [] } = useLatestStories();
  return useQuery({
    queryKey: ['story-count-derived', stories.length],
    queryFn: async () => stories.length,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Get total count of stock media products (derived from latest items query, no extra relay request)
 */
export function useStockMediaCount() {
  const { data: items = [] } = useLatestStockMediaItems();
  return useQuery({
    queryKey: ['stock-media-count-derived', items.length],
    queryFn: async () => items.length,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch the latest trip with an image (for homepage thumbnail)
 */
export function useLatestTrip() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-trip-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      const events = await nostr.query([{
        kinds: [30025],
        limit: 5 // Only need 5 to find 1 with image
      }], { signal });

      // Find the first trip with an image
      const tripWithImage = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const images = event.tags.filter(([name]) => name === 'image');
          const validImages = images.filter(([, url]) => isValidImageUrl(url));
          
          return !!(d && title && validImages.length > 0);
        })
        .sort((a, b) => b.created_at - a.created_at)[0];

      if (!tripWithImage) return null;

      // Get first image
      const image = tripWithImage.tags.find(([name]) => name === 'image')?.[1];
      const title = tripWithImage.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
      const identifier = tripWithImage.tags.find(([name]) => name === 'd')?.[1] || '';
      
      const naddr = nip19.naddrEncode({
        identifier,
        pubkey: tripWithImage.pubkey,
        kind: 30025,
      });

      return {
        image,
        title,
        naddr,
        event: tripWithImage,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch the last 3 trips with images
 */
export function useLatestTrips() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-trips-with-images'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // Reduced to 1s
      
      const events = await nostr.query([{
        kinds: [30025],
        limit: 10 // Reduced for faster loading
      }], { signal });

      // Find trips with images
      const tripsWithImages = events
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const images = event.tags.filter(([name]) => name === 'image');
          const validImages = images.filter(([, url]) => isValidImageUrl(url));
          
          return !!(d && title && validImages.length > 0);
        })
        .sort((a, b) => b.created_at - a.created_at)
        .slice(0, 3); // Get the last 3

      return tripsWithImages.map((event) => {
        // Get first image
        const image = event.tags.find(([name]) => name === 'image')?.[1];
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        
        const naddr = nip19.naddrEncode({
          identifier,
          pubkey: event.pubkey,
          kind: 30025,
        });

        return {
          image,
          title,
          naddr,
          event,
        };
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Disabled auto-refresh for performance
  });
}

/**
 * Fetch the latest NIP-71 divine.video videos (kinds 21, 22, 34235, 34236)
 * Returns up to `limit` raw NostrEvent objects — the caller renders them with VideoThumbnailGrid
 */
export function useLatestVideos(limit = 12) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-videos', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const adminPubkey = ADMIN_HEX;

      const events = await nostr.query([
        {
          kinds: [34235, 34236, 21, 22],
          '#t': ['traveltelly'],
          limit: limit + 10,
        },
        {
          kinds: [34235, 34236, 21, 22],
          authors: [adminPubkey],
          limit: limit + 10,
        },
      ], { signal });

      // De-duplicate by event id, sort newest first, cap to limit
      const unique = Array.from(new Map(events.map(e => [e.id, e])).values());
      return unique.sort((a, b) => b.created_at - a.created_at).slice(0, limit);
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get total count of trips (derived from the latest trips query, no extra relay request)
 */
export function useTripCount() {
  const { data: trips = [] } = useLatestTrips();
  return useQuery({
    queryKey: ['trip-count-derived', trips.length],
    queryFn: async () => trips.length,
    staleTime: 5 * 60 * 1000,
  });
}

export interface CommunityMixItem {
  key: string;
  image: string;
  alt: string;
  link: string;
  type: 'tour' | 'review' | 'story' | 'video' | 'trip' | 'stock';
  color: string;
  created_at: number;
}

/**
 * Single hook that fires all community content queries in parallel and returns
 * a guaranteed round-robin mix of up to 9 items (3 from each of: tour, reviews,
 * stories/videos, trips, stock). One cache entry, one render, no waterfall.
 */
export function useCommunityMix() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['community-mix'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Fire all 5 queries in parallel — one round-trip to the relay
      const [tourEvents, reviewEvents, storyEvents, tripEvents, stockEvents, videoEvents] =
        await Promise.all([
          // Tour: kind 1 notes with #traveltelly from admin
          nostr.query([{ kinds: [1], authors: [ADMIN_HEX], '#t': ['traveltelly'], limit: 10 }], { signal }),
          // Reviews
          nostr.query([{ kinds: [34879], authors: [ADMIN_HEX], limit: 10 }], { signal }),
          // Written stories
          nostr.query([{ kinds: [30023], '#t': ['traveltelly'], limit: 10 }], { signal }),
          // Trips
          nostr.query([{ kinds: [30025], authors: [ADMIN_HEX], limit: 10 }], { signal }),
          // Stock media
          nostr.query([{ kinds: [30402], authors: [ADMIN_HEX], limit: 10 }], { signal }),
          // Videos (divine.video kinds)
          nostr.query([
            { kinds: [21, 22, 34235, 34236], authors: [ADMIN_HEX], limit: 10 },
          ], { signal }),
        ]);

      // Helper: accept any https image (not a video file, not a placeholder)
      function isOkImage(url: string | undefined): url is string {
        if (!url || !url.startsWith('https://')) return false;
        const lo = url.toLowerCase();
        const badExts = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
        if (badExts.some(e => lo.includes(e))) return false;
        const badWords = ['placeholder', 'example.com', 'localhost', 'data:image', 'blob:'];
        if (badWords.some(w => lo.includes(w))) return false;
        return true;
      }

      // Helper: extract URL from content or imeta tags (for kind 1 tour posts)
      function firstImageFromNote(event: NostrEvent): string {
        // imeta tags
        const imetaTags = event.tags.filter(([n]) => n === 'imeta');
        for (const tag of imetaTags) {
          const urlPart = tag.find(p => p.startsWith('url '));
          const mimePart = tag.find(p => p.startsWith('m '));
          if (urlPart) {
            const url = urlPart.slice(4);
            const mime = mimePart?.slice(2) || '';
            if (!mime.startsWith('video/') && isOkImage(url)) return url;
          }
        }
        // Inline URLs in content
        const match = event.content.match(/https:\/\/\S+\.(?:jpg|jpeg|png|gif|webp)(?:\?\S*)?/i);
        if (match && isOkImage(match[0])) return match[0];
        return '';
      }

      // Helper: extract thumbnail from imeta for video events
      function videoThumb(event: NostrEvent): string {
        const imeta = event.tags.find(([n]) => n === 'imeta');
        if (imeta) {
          for (let i = 1; i < imeta.length; i++) {
            if (imeta[i].startsWith('image ')) {
              const url = imeta[i].slice(6);
              if (isOkImage(url)) return url;
            }
          }
        }
        const thumb = event.tags.find(([n]) => n === 'thumb')?.[1] || '';
        return isOkImage(thumb) ? thumb : '';
      }

      // --- Build buckets (up to 3 items each) ---

      // Tour bucket — kind 1 notes with inline images
      const tourBucket: CommunityMixItem[] = tourEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const img = firstImageFromNote(e);
          if (img) acc.push({
            key: `tour-${e.id}`,
            image: img,
            alt: e.content.slice(0, 60) || 'TravelTelly Tour',
            link: `/tour-feed/${e.id}`,
            type: 'tour',
            color: '#9333ea',
            created_at: e.created_at,
          });
          return acc;
        }, []);

      // Reviews bucket
      const reviewBucket: CommunityMixItem[] = reviewEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const img = e.tags.find(([n]) => n === 'image')?.[1];
          const title = e.tags.find(([n]) => n === 'title')?.[1];
          const d = e.tags.find(([n]) => n === 'd')?.[1];
          if (img && isOkImage(img) && d && title) {
            acc.push({
              key: `review-${e.id}`,
              image: img,
              alt: title,
              link: `/review/${nip19.naddrEncode({ identifier: d, pubkey: e.pubkey, kind: 34879 })}`,
              type: 'review',
              color: '#27b0ff',
              created_at: e.created_at,
            });
          }
          return acc;
        }, []);

      // Stories bucket (written only — videos handled separately)
      const storyBucket: CommunityMixItem[] = storyEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const img = e.tags.find(([n]) => n === 'image')?.[1];
          const title = e.tags.find(([n]) => n === 'title')?.[1];
          const d = e.tags.find(([n]) => n === 'd')?.[1];
          if (img && isOkImage(img) && d && title) {
            acc.push({
              key: `story-${e.id}`,
              image: img,
              alt: title,
              link: `/story/${nip19.naddrEncode({ identifier: d, pubkey: e.pubkey, kind: 30023 })}`,
              type: 'story',
              color: '#b2d235',
              created_at: e.created_at,
            });
          }
          return acc;
        }, []);

      // Trips bucket
      const tripBucket: CommunityMixItem[] = tripEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const img = e.tags.find(([n]) => n === 'image')?.[1];
          const title = e.tags.find(([n]) => n === 'title')?.[1];
          const d = e.tags.find(([n]) => n === 'd')?.[1];
          if (img && isOkImage(img) && d && title) {
            acc.push({
              key: `trip-${e.id}`,
              image: img,
              alt: title,
              link: `/trip/${nip19.naddrEncode({ identifier: d, pubkey: e.pubkey, kind: 30025 })}`,
              type: 'trip',
              color: '#ffcc00',
              created_at: e.created_at,
            });
          }
          return acc;
        }, []);

      // Stock media bucket
      const stockBucket: CommunityMixItem[] = stockEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const img = e.tags.find(([n]) => n === 'image')?.[1];
          const title = e.tags.find(([n]) => n === 'title')?.[1];
          const d = e.tags.find(([n]) => n === 'd')?.[1];
          const status = e.tags.find(([n]) => n === 'status')?.[1];
          const deleted = e.tags.find(([n]) => n === 'deleted')?.[1];
          if (img && isOkImage(img) && d && title && status !== 'deleted' && deleted !== 'true') {
            acc.push({
              key: `stock-${e.id}`,
              image: img,
              alt: title,
              link: `/media/preview/${nip19.naddrEncode({ identifier: d, pubkey: e.pubkey, kind: 30402 })}`,
              type: 'stock',
              color: '#ec1a58',
              created_at: e.created_at,
            });
          }
          return acc;
        }, []);

      // Videos bucket
      const videoBucket: CommunityMixItem[] = videoEvents
        .sort((a, b) => b.created_at - a.created_at)
        .reduce<CommunityMixItem[]>((acc, e) => {
          if (acc.length >= 3) return acc;
          const thumb = videoThumb(e);
          const title = e.tags.find(([n]) => n === 'title')?.[1];
          if (!thumb || !title) return acc;
          const d = e.tags.find(([n]) => n === 'd')?.[1];
          const isAddressable = d && (e.kind === 34235 || e.kind === 34236);
          const naddr = isAddressable
            ? nip19.naddrEncode({ identifier: d!, pubkey: e.pubkey, kind: e.kind })
            : nip19.neventEncode({ id: e.id, author: e.pubkey });
          acc.push({
            key: `video-${e.id}`,
            image: thumb,
            alt: title,
            link: `/video/${naddr}`,
            type: 'video',
            color: '#9333ea',
            created_at: e.created_at,
          });
          return acc;
        }, []);

      // Round-robin interleave across all non-empty buckets
      const allBuckets = [tourBucket, reviewBucket, storyBucket, tripBucket, stockBucket, videoBucket]
        .filter(b => b.length > 0);

      const mixed: CommunityMixItem[] = [];
      let round = 0;
      while (mixed.length < 9) {
        let added = false;
        for (const bucket of allBuckets) {
          if (mixed.length >= 9) break;
          if (bucket[round]) { mixed.push(bucket[round]); added = true; }
        }
        if (!added) break;
        round++;
      }

      return mixed;
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
