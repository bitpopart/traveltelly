import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

function validateVisitedCountriesEvent(event: NostrEvent): boolean {
  if (event.kind !== 30078) return false;
  
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  return d === 'visited-countries';
}

export function useVisitedCountries(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['visited-countries', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return null;

      const events = await nostr.query([
        {
          kinds: [30078],
          authors: [pubkey],
          '#d': ['visited-countries'],
          limit: 1,
        }
      ], { signal });

      if (events.length === 0) return null;
      
      const event = events[0];
      return validateVisitedCountriesEvent(event) ? event : null;
    },
    enabled: !!pubkey,
    staleTime: 60 * 1000, // 1 minute
  });
}
