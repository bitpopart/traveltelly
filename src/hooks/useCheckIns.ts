import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

function validateCheckInEvent(event: NostrEvent): boolean {
  if (event.kind !== 30026) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  const geohash = event.tags.find(([name]) => name === 'g')?.[1];

  return !!(d && location && geohash);
}

export function useCheckIns() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['check-ins'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const events = await nostr.query([
        {
          kinds: [30026],
          limit: 200,
        }
      ], { signal });

      const validCheckIns = events.filter(validateCheckInEvent);

      // Sort by created_at (newest first)
      return validCheckIns.sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUserCheckIns(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['check-ins', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return [];

      const events = await nostr.query([
        {
          kinds: [30026],
          authors: [pubkey],
          limit: 50,
        }
      ], { signal });

      const validCheckIns = events.filter(validateCheckInEvent);

      // Sort by created_at (newest first)
      return validCheckIns.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCheckIn(naddr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['check-in', naddr],
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
        return validateCheckInEvent(event) ? event : null;
      } catch (error) {
        console.error('Error fetching check-in:', error);
        return null;
      }
    },
    enabled: !!naddr,
    staleTime: 60 * 1000, // 1 minute
  });
}
