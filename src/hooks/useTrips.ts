import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

function validateTripEvent(event: NostrEvent): boolean {
  if (event.kind !== 30025) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const images = event.tags.filter(([name]) => name === 'image');

  if (!d || !title || images.length === 0) {
    return false;
  }

  // Filter out template/placeholder content
  const lowerContent = event.content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  const placeholderKeywords = [
    'lorem ipsum',
    'placeholder',
    'template',
    'sample trip',
    'example trip',
    'test trip',
    'demo trip',
    'dolor sit amet',
  ];

  // Check if content or title contains placeholder keywords
  const hasPlaceholder = placeholderKeywords.some(keyword => 
    lowerContent.includes(keyword) || lowerTitle.includes(keyword)
  );

  if (hasPlaceholder) {
    return false;
  }

  return true;
}

export function useTrips() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['trips'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query([
        {
          kinds: [30025],
          limit: 100,
        }
      ], { signal });

      const validTrips = events.filter(validateTripEvent);

      // Sort by created_at (newest first)
      return validTrips.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTrip(naddr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['trip', naddr],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      try {
        // Decode naddr to get event coordinates
        const { nip19 } = await import('nostr-tools');
        const decoded = nip19.decode(naddr);
        
        if (decoded.type !== 'naddr') {
          throw new Error('Invalid naddr');
        }

        const { kind, pubkey, identifier } = decoded.data;

        const events = await nostr.query([
          {
            kinds: [kind],
            authors: [pubkey],
            '#d': [identifier],
            limit: 1,
          }
        ], { signal });

        if (events.length === 0) return null;

        const event = events[0];
        return validateTripEvent(event) ? event : null;
      } catch (error) {
        console.error('Error fetching trip:', error);
        return null;
      }
    },
    enabled: !!naddr,
    staleTime: 60 * 1000, // 1 minute
  });
}
