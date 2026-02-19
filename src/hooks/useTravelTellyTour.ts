import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

// Admin pubkey from npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface TravelTellyTourItem {
  id: string;
  content: string;
  created_at: number;
  event: NostrEvent;
  images: string[];
  videos: string[];
}

/**
 * Check if an image/video URL is valid
 */
function isValidMediaUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  
  // Must start with http/https
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return false;
  }
  
  const lowerUrl = url.toLowerCase();
  
  // Whitelist for images and videos
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
  
  return allowedDomains.some(domain => lowerUrl.includes(domain));
}

/**
 * Extract image and video URLs from event content and imeta tags
 */
function extractMediaFromEvent(event: NostrEvent): { images: string[]; videos: string[] } {
  const images: string[] = [];
  const videos: string[] = [];
  
  // Extract from imeta tags (NIP-92)
  const imetaTags = event.tags.filter(([name]) => name === 'imeta');
  imetaTags.forEach((tag) => {
    const urlItem = tag.find((item) => item.startsWith('url '));
    const mimeItem = tag.find((item) => item.startsWith('m '));
    
    if (urlItem) {
      const url = urlItem.replace('url ', '');
      if (!isValidMediaUrl(url)) return;
      
      if (mimeItem) {
        const mime = mimeItem.replace('m ', '');
        if (mime.startsWith('video/')) {
          videos.push(url);
        } else if (mime.startsWith('image/')) {
          images.push(url);
        }
      } else {
        // No mime type, guess from extension
        const ext = url.split('.').pop()?.toLowerCase();
        if (ext && ['mp4', 'webm', 'mov', 'avi'].includes(ext)) {
          videos.push(url);
        } else {
          images.push(url);
        }
      }
    }
  });
  
  // Also extract from content (URLs)
  const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|mp4|webm|mov))/gi;
  const matches = event.content.match(urlRegex);
  if (matches) {
    matches.forEach((url) => {
      if (!isValidMediaUrl(url)) return;
      
      const ext = url.split('.').pop()?.toLowerCase();
      if (ext && ['mp4', 'webm', 'mov'].includes(ext)) {
        if (!videos.includes(url)) videos.push(url);
      } else {
        if (!images.includes(url)) images.push(url);
      }
    });
  }
  
  return { images, videos };
}

/**
 * Fetch all kind 1 notes from admin with #traveltelly hashtag
 */
export function useTravelTellyTour() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['traveltelly-tour'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      // Query kind 1 notes from admin with #traveltelly hashtag
      const events = await nostr.query([{
        kinds: [1],
        authors: [ADMIN_HEX],
        '#t': ['traveltelly'],
        limit: 200,
      }], { signal });

      console.log(`🌍 TravelTelly Tour: Found ${events.length} posts with #traveltelly from admin`);

      // Filter to only posts with media and transform
      const tourItems: TravelTellyTourItem[] = events
        .map((event) => {
          const { images, videos } = extractMediaFromEvent(event);
          
          return {
            id: event.id,
            content: event.content,
            created_at: event.created_at,
            event,
            images,
            videos,
          };
        })
        .filter((item) => item.images.length > 0 || item.videos.length > 0)
        .sort((a, b) => b.created_at - a.created_at);

      console.log(`📸 TravelTelly Tour: ${tourItems.length} posts with media`);
      
      return tourItems;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60000, // Refetch every minute
  });
}
