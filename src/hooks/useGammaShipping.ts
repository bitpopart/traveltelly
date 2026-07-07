/**
 * Gamma Spec - Shipping Options (Kind 30406)
 */
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { parseGammaShippingOption, type GammaShippingOption } from '@/lib/gammaSpec';

function isValidShipping(event: NostrEvent): boolean {
  if (event.kind !== 30406) return false;
  const d = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  const price = event.tags.find(([n]) => n === 'price')?.[1];
  const service = event.tags.find(([n]) => n === 'service')?.[1];
  return !!(d && title && price !== undefined && service);
}

export function useGammaShipping(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['gamma-shipping', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const filter = pubkey
        ? { kinds: [30406], authors: [pubkey], limit: 100 }
        : { kinds: [30406], limit: 200 };

      const events = await nostr.query([filter], { signal });

      // Deduplicate addressable events — keep newest per pubkey+d
      const seen = new Map<string, NostrEvent>();
      for (const e of events) {
        const dTag = e.tags.find(([n]) => n === 'd')?.[1] ?? '';
        const key = `${e.pubkey}:${dTag}`;
        const existing = seen.get(key);
        if (!existing || e.created_at > existing.created_at) {
          seen.set(key, e);
        }
      }

      const options: GammaShippingOption[] = [];
      for (const event of seen.values()) {
        if (!isValidShipping(event)) continue;
        const opt = parseGammaShippingOption(event);
        if (opt) options.push(opt);
      }

      options.sort((a, b) => b.createdAt - a.createdAt);
      return options;
    },
    staleTime: 60_000,
    enabled: true,
  });
}

export function useGammaShippingByRef(shippingRef: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['gamma-shipping-ref', shippingRef],
    queryFn: async (c) => {
      if (!shippingRef) return null;
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      // Parse "30406:pubkey:d-tag"
      const parts = shippingRef.split(':');
      if (parts.length < 3 || parts[0] !== '30406') return null;

      const [, pubkey, ...dParts] = parts;
      const dTag = dParts.join(':');

      const events = await nostr.query([{
        kinds: [30406],
        authors: [pubkey],
        '#d': [dTag],
        limit: 1,
      }], { signal });

      if (events.length === 0) return null;
      return parseGammaShippingOption(events[0]);
    },
    enabled: !!shippingRef,
    staleTime: 120_000,
  });
}
