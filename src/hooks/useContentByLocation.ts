import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface ContentItem {
  id: string;
  type: 'review' | 'trip' | 'story' | 'media';
  title: string;
  image?: string;
  naddr: string;
  event: NostrEvent;
  location?: string;
  createdAt: number;
}

/**
 * Check if location string contains the search tag
 */
function matchesLocation(location: string | undefined, searchTag: string): boolean {
  if (!location || !searchTag) return false;
  
  // Case-insensitive partial match
  return location.toLowerCase().includes(searchTag.toLowerCase());
}

/**
 * Parse review event into ContentItem
 */
function parseReview(event: NostrEvent): ContentItem | null {
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  
  if (!d || !title) return null;
  
  try {
    const naddr = nip19.naddrEncode({
      kind: event.kind,
      pubkey: event.pubkey,
      identifier: d,
    });
    
    return {
      id: d,
      type: 'review',
      title,
      image,
      naddr,
      event,
      location,
      createdAt: event.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Parse trip event into ContentItem
 */
function parseTrip(event: NostrEvent): ContentItem | null {
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const imageTags = event.tags.filter(([name]) => name === 'image');
  const image = imageTags[0]?.[1];
  
  if (!d || !title) return null;
  
  // Extract location from first image tag or summary
  const summary = event.tags.find(([name]) => name === 'summary')?.[1];
  
  try {
    const naddr = nip19.naddrEncode({
      kind: event.kind,
      pubkey: event.pubkey,
      identifier: d,
    });
    
    return {
      id: d,
      type: 'trip',
      title,
      image,
      naddr,
      event,
      location: summary,
      createdAt: event.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Parse story event into ContentItem
 */
function parseStory(event: NostrEvent): ContentItem | null {
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  
  if (!d || !title) return null;
  
  try {
    const naddr = nip19.naddrEncode({
      kind: event.kind,
      pubkey: event.pubkey,
      identifier: d,
    });
    
    return {
      id: d,
      type: 'story',
      title,
      image,
      naddr,
      event,
      createdAt: event.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Parse stock media event into ContentItem
 */
function parseStockMedia(event: NostrEvent): ContentItem | null {
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  
  if (!d || !title) return null;
  
  try {
    const naddr = nip19.naddrEncode({
      kind: event.kind,
      pubkey: event.pubkey,
      identifier: d,
    });
    
    return {
      id: d,
      type: 'media',
      title,
      image,
      naddr,
      event,
      location,
      createdAt: event.created_at,
    };
  } catch {
    return null;
  }
}

/**
 * Get all content filtered by location tag
 */
export function useContentByLocation(locationTag: string) {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['content-by-location', locationTag, authorizedReviewers, authorizedUploaders],
    queryFn: async (c) => {
      if (!locationTag) return [];
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const reviewAuthors = Array.from(authorizedReviewers || []);
      const mediaAuthors = Array.from(authorizedUploaders || []);

      // Query all content types
      const [reviews, trips, stories, stockMedia] = await Promise.all([
        nostr.query([{
          kinds: [34879],
          authors: reviewAuthors,
          limit: 200,
        }], { signal }),
        nostr.query([{
          kinds: [30025],
          authors: [ADMIN_HEX],
          limit: 100,
        }], { signal }),
        nostr.query([{
          kinds: [30023],
          authors: [ADMIN_HEX],
          limit: 100,
        }], { signal }),
        nostr.query([{
          kinds: [30402],
          authors: mediaAuthors,
          limit: 200,
        }], { signal }),
      ]);

      // Parse and filter by location
      const allContent: ContentItem[] = [
        ...reviews.map(parseReview),
        ...trips.map(parseTrip),
        ...stories.map(parseStory),
        ...stockMedia.map(parseStockMedia),
      ]
        .filter((item): item is ContentItem => item !== null)
        .filter(item => matchesLocation(item.location, locationTag))
        .sort((a, b) => b.createdAt - a.createdAt);

      return allContent;
    },
    enabled: !!locationTag && !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 30000,
  });
}
