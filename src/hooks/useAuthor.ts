import { type NostrEvent, type NostrMetadata, NSchema as n } from '@nostrify/nostrify';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

export function useAuthor(pubkey: string | undefined) {
  const { nostr } = useNostr();
  
  // Ensure pubkey is a string for queryKey to prevent React error #310
  const safePubkey = typeof pubkey === 'string' ? pubkey : '';

  return useQuery<{ event?: NostrEvent; metadata?: NostrMetadata }>({
    queryKey: ['author', safePubkey],
    queryFn: async ({ signal }) => {
      if (!safePubkey) {
        return {};
      }

      const [event] = await nostr.query(
        [{ kinds: [0], authors: [safePubkey], limit: 1 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(1500)]) },
      );

      if (!event) {
        return {}; // Return empty object instead of throwing
      }

      try {
        const metadata = n.json().pipe(n.metadata()).parse(event.content);
        return { metadata, event };
      } catch {
        return { event };
      }
    },
    retry: false, // Disable retry to prevent serialization issues
    enabled: !!safePubkey && safePubkey.length === 64, // Only run if valid hex pubkey
  });
}
