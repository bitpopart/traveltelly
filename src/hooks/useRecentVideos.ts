import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';

export function useRecentVideos() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['recent-videos'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query recent video stories (NIP-71: kind 34235 landscape + kind 34236 portrait)
      // Fetch both videos with traveltelly tag AND videos from the admin account
      const adminPubkey = '7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35';
      
      const events = await nostr.query([
        {
          kinds: [34235, 34236],
          '#t': ['traveltelly'],
          limit: 20,
        },
        {
          kinds: [34235, 34236],
          authors: [adminPubkey],
          limit: 20,
        }
      ], { signal });

      // Remove duplicates (same event ID) and sort by creation time
      const uniqueEvents = Array.from(
        new Map(events.map(event => [event.id, event])).values()
      );

      return uniqueEvents.sort((a, b) => b.created_at - a.created_at);
    },
  });
}
