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
    queryKey: ['latest-review-with-image'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s for faster initial load
      
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
    enabled: !!authorizedReviewers && authorizedReviewers.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Fetch the last 3 reviews with images
 */
export function useLatestReviews() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();

  return useQuery({
    queryKey: ['latest-reviews-with-images'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const events = await nostr.query([{
        kinds: [34879],
        authors: authorizedAuthors,
        limit: 10 // Further reduced - we only need 3 reviews with images
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
    enabled: !!authorizedReviewers && authorizedReviewers.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Disabled auto-refresh for performance
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
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
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      
      if (authorizedAuthors.length === 0) {
        return [];
      }

      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 10 // Reduced for faster loading
      }], { signal });

      console.log(`📸 Stock media items query: ${events.length} total events`);

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

      console.log(`✅ Active stock media with images: ${productsWithImages.length}`);

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
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0,
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
    refetchInterval: false, // Disabled auto-refresh for performance
  });
}

/**
 * Get total count of stock media products
 */
export function useStockMediaCount() {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['stock-media-count', authorizedUploaders?.size],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      
      if (authorizedAuthors.length === 0) {
        return 0;
      }

      const events = await nostr.query([{
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 1000
      }], { signal });

      console.log(`📊 Stock media count query: ${events.length} total events from ${authorizedAuthors.length} authors`);

      // Filter out deleted items
      const activeProducts = events.filter(event => {
        const status = event.tags.find(([name]) => name === 'status')?.[1];
        const deleted = event.tags.find(([name]) => name === 'deleted')?.[1];
        const adminDeleted = event.tags.find(([name]) => name === 'admin_deleted')?.[1];
        
        const isActive = status !== 'deleted' && deleted !== 'true' && adminDeleted !== 'true';
        
        if (!isActive) {
          console.log(`🗑️ Filtering out deleted media: ${event.id.substring(0, 8)}`);
        }
        
        return isActive;
      });

      console.log(`✅ Active stock media count: ${activeProducts.length}`);
      return activeProducts.length;
    },
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Disabled auto-refresh for performance
    refetchOnMount: false, // Don't refetch on mount if cached
    refetchOnWindowFocus: false, // Don't refetch on focus for performance
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(1000)]); // Reduced to 1s
      
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
 * Get total count of trips
 */
export function useTripCount() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['trip-count'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([{
        kinds: [30025],
        limit: 1000
      }], { signal });

      // Filter valid trips
      const validTrips = events.filter(event => {
        const d = event.tags.find(([name]) => name === 'd')?.[1];
        const title = event.tags.find(([name]) => name === 'title')?.[1];
        const images = event.tags.filter(([name]) => name === 'image');
        
        return !!(d && title && images.length > 0);
      });

      return validTrips.length;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: false, // Disabled auto-refresh for performance
  });
}
