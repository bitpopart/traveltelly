import { useNostr } from '@nostrify/react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

import { nip19 } from 'nostr-tools';
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
 * Also excludes video files (.mp4, .webm, .mov, etc.)
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Must start with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  const lowerUrl = url.toLowerCase();
  
  // EXCLUDE: Video files - these should not be in the image grid
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return false;
  }
  
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
 * Fetch images with infinite pagination for faster loading
 * Loads 20 images per page
 */
export function useInfiniteImages() {
  const { nostr } = useNostr();
  const { data: tourItems = [] } = useTravelTellyTour();

  return useInfiniteQuery({
    queryKey: ['infinite-images', tourItems?.length],
    queryFn: async ({ pageParam, signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(5000)]);

      const images: ImageItem[] = [];
      const until = pageParam as number | undefined;

      const events = await nostr.query([{
        kinds: [34879, 30025, 30023, 30402],
        authors: [ADMIN_HEX],
        limit: 20,
        ...(until && { until }),
      }], { signal: abortSignal });

      // Process events and extract images
      events.forEach((event: NostrEvent) => {
        // Process reviews
        if (event.kind === 34879) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          if (d && title && image && isValidImageUrl(image)) {
            const identifier = d;
            const naddr = nip19.naddrEncode({
              identifier,
              pubkey: event.pubkey,
              kind: 34879,
            });
            
            images.push({
              image,
              title: title || 'Unknown Place',
              naddr,
              type: 'review',
              event,
              created_at: event.created_at,
            });
          }
        }
        
        // Process trips (multiple images per trip)
        else if (event.kind === 30025) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const imageTags = event.tags.filter(([name]) => name === 'image');
          
          if (d && title && imageTags.length > 0) {
            const identifier = d;
            const naddr = nip19.naddrEncode({
              identifier,
              pubkey: event.pubkey,
              kind: 30025,
            });
            
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
        
        // Process stories
        else if (event.kind === 30023) {
          const d = event.tags.find(([name]) => name === 'd')?.[1];
          const title = event.tags.find(([name]) => name === 'title')?.[1];
          const image = event.tags.find(([name]) => name === 'image')?.[1];
          
          if (d && title && image && isValidImageUrl(image)) {
            const identifier = d;
            const naddr = nip19.naddrEncode({
              identifier,
              pubkey: event.pubkey,
              kind: 30023,
            });
            
            images.push({
              image,
              title: title || 'Untitled Story',
              naddr,
              type: 'story',
              event,
              created_at: event.created_at,
            });
          }
        }
        
        // Process stock media
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
            const identifier = d;
            const naddr = nip19.naddrEncode({
              identifier,
              pubkey: event.pubkey,
              kind: 30402,
            });
            
            images.push({
              image,
              title: title || 'Untitled Product',
              naddr,
              type: 'stock',
              event,
              created_at: event.created_at,
            });
          }
        }
      });

      // Add TravelTelly Tour posts only on first page
      if (!pageParam && tourItems && tourItems.length > 0) {
        
        tourItems.forEach((item) => {
          // Add all images (videos are excluded by isValidImageUrl)
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
          
          // Note: Videos are intentionally excluded from the image grid
          // They are filtered out by isValidImageUrl() to prevent loading errors
        });
      }

      // Sort by created_at (newest first)
      const sortedImages = images.sort((a, b) => b.created_at - a.created_at);
      
      // Cursor: oldest timestamp minus 1 to avoid re-fetching the boundary event
      const nextPageParam = sortedImages.length > 0
        ? sortedImages[sortedImages.length - 1].created_at - 1
        : undefined;

      return { images: sortedImages, nextPageParam };
    },
    getNextPageParam: (lastPage) => lastPage.nextPageParam,
    initialPageParam: undefined as number | undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
