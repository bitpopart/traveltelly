import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from './useCurrentUser';
import { useIsContributor } from './useIsContributor';

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
 * Fetch all images from reviews, trips, stories, and stock media
 * If user is logged in AND is a contributor, show only their content
 * Otherwise show all content from authorized contributors
 */
/**
 * Check if an image URL is a real uploaded image (not a placeholder or template)
 * ONLY ALLOW REAL IMAGE HOSTING SERVICES - NO TEMPLATE/PLACEHOLDER IMAGES EVER!
 */
function isValidImageUrl(url: string): boolean {
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
    console.log('🚫 BLOCKED non-whitelisted domain:', url.substring(0, 60));
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
    console.log('🚫 BLOCKED placeholder pattern:', url.substring(0, 60));
    return false;
  }
  
  return true;
}

/**
 * Extract media URLs from TravelTelly Tour posts (kind 1)
 */
function extractMediaFromTourPost(event: NostrEvent): string[] {
  const mediaUrls: string[] = [];
  
  // Extract from imeta tags (NIP-92)
  const imetaTags = event.tags.filter(([name]) => name === 'imeta');
  imetaTags.forEach((tag) => {
    const urlItem = tag.find((item) => item.startsWith('url '));
    if (urlItem) {
      const url = urlItem.replace('url ', '');
      if (isValidImageUrl(url)) {
        mediaUrls.push(url);
      }
    }
  });
  
  // Also extract from content (URLs)
  const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|mp4|webm|mov))/gi;
  const matches = event.content.match(urlRegex);
  if (matches) {
    matches.forEach((url) => {
      if (isValidImageUrl(url) && !mediaUrls.includes(url)) {
        mediaUrls.push(url);
      }
    });
  }
  
  return mediaUrls;
}

export function useAllImages() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const isContributor = useIsContributor();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['all-images', user?.pubkey, isContributor],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]); // Increased timeout for tour posts
      
      const images: ImageItem[] = [];
      
      console.log('🔄 Starting useAllImages query...');

      // Determine which authors to query
      // Contributors see only their own content, visitors/non-contributors see all
      const userFilter = (user?.pubkey && isContributor) ? [user.pubkey] : undefined;

      // Fetch reviews
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const reviewAuthors = userFilter || authorizedAuthors;
      
      if (reviewAuthors.length > 0) {
        const reviewEvents = await nostr.query([{
          kinds: [34879],
          authors: reviewAuthors,
          limit: userFilter ? 200 : 100,
        }], { signal });

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
            } else if (image && !isValidImageUrl(image)) {
              console.log('🚫 BLOCKED placeholder image in review:', image, 'from event:', event.id.substring(0, 8));
            }
          });
      }

      // Fetch trips
      const tripEvents = await nostr.query([{
        kinds: [30025],
        ...(userFilter && { authors: userFilter }),
        limit: userFilter ? 200 : 100,
      }], { signal });

      tripEvents
        .filter((event: NostrEvent) => {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const images = event.tags.filter(([name]) => name === 'image');
          return !!(d && title && images.length > 0);
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

          // Add all images from the trip
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
            } else if (image && !isValidImageUrl(image)) {
              console.log('🚫 BLOCKED placeholder image in trip:', image, 'from event:', event.id.substring(0, 8));
            }
          });
        });

      // Fetch stories
      const storyEvents = await nostr.query([{
        kinds: [30023],
        ...(userFilter && { authors: userFilter }),
        limit: userFilter ? 200 : 100,
      }], { signal });

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
          } else if (image && !isValidImageUrl(image)) {
            console.log('🚫 BLOCKED placeholder image in story:', image, 'from event:', event.id.substring(0, 8));
          }
        });

      // Fetch stock media
      const stockAuthors = Array.from(authorizedUploaders || []);
      const mediaAuthors = userFilter || stockAuthors;
      
      if (mediaAuthors.length > 0) {
        const stockEvents = await nostr.query([{
          kinds: [30402],
          authors: mediaAuthors,
          limit: userFilter ? 200 : 100,
        }], { signal });

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
            } else if (image && !isValidImageUrl(image)) {
              console.log('🚫 BLOCKED placeholder image in stock media:', image, 'from event:', event.id.substring(0, 8));
            }
          });
      }

      // Fetch TravelTelly Tour posts (kind 1 with #traveltelly from admin)
      console.log(`🔍 Querying TravelTelly Tour posts from admin: ${ADMIN_HEX}`);
      const tourEvents = await nostr.query([{
        kinds: [1],
        authors: [ADMIN_HEX],
        '#t': ['traveltelly'],
        limit: 100,
      }], { signal });

      console.log(`🌍 TravelTelly Tour: Found ${tourEvents.length} posts with #traveltelly from admin`);
      
      if (tourEvents.length > 0) {
        console.log('📝 Sample tour event:', tourEvents[0]);
      }

      // Extract media from tour posts and add to images
      let tourMediaCount = 0;
      tourEvents.forEach((event) => {
        const mediaUrls = extractMediaFromTourPost(event);
        
        console.log(`  Event ${event.id.substring(0, 8)}: Found ${mediaUrls.length} media items`);
        
        mediaUrls.forEach((mediaUrl) => {
          images.push({
            image: mediaUrl,
            title: event.content.slice(0, 100) || 'TravelTelly Tour',
            naddr: '', // Tour posts don't have naddr
            type: 'tour',
            event,
            created_at: event.created_at,
            eventId: event.id, // Store event ID for navigation
          });
          tourMediaCount++;
        });
      });

      console.log(`📸 TravelTelly Tour: Added ${tourMediaCount} media items from ${tourEvents.length} posts to grid`);

      // Shuffle images randomly to mix tour posts with other content
      const shuffledImages = images.sort(() => Math.random() - 0.5);
      
      // Log ALL images being displayed for debugging
      console.log('🖼️ ALL IMAGES BEING DISPLAYED:', shuffledImages.length);
      shuffledImages.slice(0, 10).forEach((img, i) => {
        console.log(`  ${i + 1}. [${img.type}] ${img.image.substring(0, 80)}...`);
      });
      
      return shuffledImages;
    },
    enabled: !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 30 * 1000, // 30 seconds - reduced for testing tour posts
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
}
