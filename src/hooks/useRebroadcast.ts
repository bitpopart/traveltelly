import { useNostr } from '@nostrify/react';
import { useMutation } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAppContext } from './useAppContext';

// Well-known relays that index content for major Nostr clients
// Adding these ensures the event shows up on Primal, Damus, Amethyst, etc.
const BROADCAST_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.nostr.band',
  'wss://relay.damus.io',
  'wss://nos.lol',
];

/**
 * Rebroadcast an already-signed Nostr event to the user's configured relays
 * plus a set of well-known relays (Primal, Nostr.band, Damus, etc.).
 *
 * Unlike useNostrPublish, this does NOT re-sign the event — it sends the
 * original signed event as-is. Use this to push events from external apps
 * (like divine.video) into the broader relay network.
 */
export function useRebroadcast() {
  const { nostr } = useNostr();
  const { config } = useAppContext();

  return useMutation({
    mutationFn: async (event: NostrEvent) => {
      // Collect all target relay URLs: user's configured relays + broadcast relays
      const allUrls = new Set<string>([
        ...config.relayUrls,
        ...BROADCAST_RELAYS,
      ]);

      // Publish to each relay in parallel; ignore individual failures
      const results = await Promise.allSettled(
        [...allUrls].map(async (url) => {
          const { NRelay1 } = await import('@nostrify/nostrify');
          const relay = new NRelay1(url);
          try {
            await relay.event(event, { signal: AbortSignal.timeout(5000) });
            return url;
          } finally {
            // Close the relay connection after publishing
            relay.close?.();
          }
        })
      );

      const succeeded = results
        .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
        .map((r) => r.value);

      const failed = results.filter((r) => r.status === 'rejected').length;

      return { succeeded, failed, total: allUrls.size };
    },
  });
}
