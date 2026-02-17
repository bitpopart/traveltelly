import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';
import { useCurrentUser } from './useCurrentUser';
import { useIsContributor } from './useIsContributor';

export interface ImageItem {
  image: string;
  title: string;
  naddr: string;
  type: 'review' | 'trip' | 'story' | 'stock';
  event: NostrEvent;
  created_at: number;
}

/**
 * Fetch all images from reviews, trips, stories, and stock media
 * If user is logged in AND is a contributor, show only their content
 * Otherwise show all content from authorized contributors
 */
/**
 * Check if an image URL is a real uploaded image (not a placeholder or template)
 */
function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Filter out placeholder URLs
  const invalidPatterns = [
    '/placeholder',
    'placeholder.com',
    'via.placeholder',
    'placehold',
    'example.com',
    'localhost',
    'data:image',
    'blob:',
  ];
  
  const lowerUrl = url.toLowerCase();
  if (invalidPatterns.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  
  // Must start with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  return true;
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
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const images: ImageItem[] = [];

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
            }
          });
      }

      // Sort by created_at (newest first)
      return images.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
