import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from './useCurrentUser';
import { useIsContributor } from './useIsContributor';
import { useTravelTellyTour } from './useTravelTellyTour';

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
 * Fetch all images from reviews, trips, stories, stock media, AND TravelTelly Tour
 * Sorted by newest first for fast, consistent display
 */
export function useAllImages() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const isContributor = useIsContributor();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();
  const { data: tourItems = [] } = useTravelTellyTour(); // Fetch TravelTelly Tour posts

  return useQuery({
    queryKey: ['all-images', tourItems?.length],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]); // 3 seconds
      
      const images: ImageItem[] = [];

      // ALWAYS show ALL content - no filtering by contributor status
      // This ensures the grid shows a proper mix of all content types
      const authorizedAuthors = Array.from(authorizedReviewers || []);
      const stockAuthors = Array.from(authorizedUploaders || []);
      
      // Run ALL queries in parallel for maximum speed
      const [reviewEvents, tripEvents, storyEvents, stockEvents] = await Promise.all([
        // Reviews - from all authorized reviewers
        authorizedAuthors.length > 0 ? nostr.query([{
          kinds: [34879],
          authors: authorizedAuthors,
          limit: 150,
        }], { signal }) : Promise.resolve([]),
        
        // Trips - from admin only (main content source)
        nostr.query([{
          kinds: [30025],
          authors: [ADMIN_HEX],
          limit: 150,
        }], { signal }),
        
        // Stories - from admin only (main content source)
        nostr.query([{
          kinds: [30023],
          authors: [ADMIN_HEX],
          limit: 150,
        }], { signal }),
        
        // Stock Media - from all authorized uploaders
        stockAuthors.length > 0 ? nostr.query([{
          kinds: [30402],
          authors: stockAuthors,
          limit: 150,
        }], { signal }) : Promise.resolve([]),
      ]);

      console.log('🔍 Query Results:', {
        reviews: reviewEvents.length,
        trips: tripEvents.length,
        stories: storyEvents.length,
        stock: stockEvents.length,
      });

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
      let tourMediaCount = 0;
      if (tourItems && tourItems.length > 0) {
        console.log(`🌍 Adding ${tourItems.length} TravelTelly Tour posts to grid`);
        
        tourItems.forEach((item) => {
          // Add all images from this tour post
          item.images.forEach((imageUrl) => {
            if (isValidImageUrl(imageUrl)) {
              images.push({
                image: imageUrl,
                title: item.content.slice(0, 100) || 'TravelTelly Tour',
                naddr: '', // Tour posts don't have naddr
                type: 'tour',
                event: item.event,
                created_at: item.created_at,
                eventId: item.id,
              });
              tourMediaCount++;
            }
          });
          
          // Add all videos from this tour post (videos will have image URLs for thumbnails)
          item.videos.forEach((videoUrl) => {
            images.push({
              image: videoUrl,
              title: item.content.slice(0, 100) || 'TravelTelly Tour',
              naddr: '', // Tour posts don't have naddr
              type: 'tour',
              event: item.event,
              created_at: item.created_at,
              eventId: item.id,
            });
            tourMediaCount++;
          });
        });
        
        console.log(`📸 TravelTelly Tour: Added ${tourMediaCount} media items from ${tourItems.length} posts`);
      } else {
        console.log('ℹ️ No TravelTelly Tour items available yet');
      }

      // Sort by created_at (newest first) for consistent, fast display
      const sortedImages = images.sort((a, b) => b.created_at - a.created_at);
      
      // Log breakdown for debugging
      console.log('🖼️ ALL IMAGES BREAKDOWN:', sortedImages.length, 'total');
      console.log('  📍 Reviews:', images.filter(i => i.type === 'review').length);
      console.log('  📝 Stories:', images.filter(i => i.type === 'story').length);
      console.log('  ✈️ Trips:', images.filter(i => i.type === 'trip').length);
      console.log('  📸 Stock Media:', images.filter(i => i.type === 'stock').length);
      console.log('  🌍 Tour Items:', images.filter(i => i.type === 'tour').length);
      
      return sortedImages;
    },
    enabled: !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
