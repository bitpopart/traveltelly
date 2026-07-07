/**
 * Gamma Spec - Product Collections (Kind 30405)
 */
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { parseGammaCollection, type GammaCollection } from '@/lib/gammaSpec';

function isValidCollection(event: NostrEvent): boolean {
  if (event.kind !== 30405) return false;
  const d = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  return !!(d && title);
}

export function useGammaCollections(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['gamma-collections', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const filter = pubkey
        ? { kinds: [30405], authors: [pubkey], limit: 200 }
        : { kinds: [30405], limit: 500 };

      const events = await nostr.query([filter], { signal });

      // Deduplicate addressable events
      const seen = new Map<string, NostrEvent>();
      for (const e of events) {
        const dTag = e.tags.find(([n]) => n === 'd')?.[1] ?? '';
        const key = `${e.pubkey}:${dTag}`;
        const existing = seen.get(key);
        if (!existing || e.created_at > existing.created_at) {
          seen.set(key, e);
        }
      }

      const collections: GammaCollection[] = [];
      for (const event of seen.values()) {
        if (!isValidCollection(event)) continue;
        const col = parseGammaCollection(event);
        if (col) collections.push(col);
      }

      collections.sort((a, b) => b.createdAt - a.createdAt);
      return collections;
    },
    staleTime: 60_000,
    enabled: true,
  });
}

export function useGammaCollection(pubkey: string | undefined, dTag: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['gamma-collection', pubkey, dTag],
    queryFn: async (c) => {
      if (!pubkey || !dTag) return null;
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      const events = await nostr.query([{
        kinds: [30405],
        authors: [pubkey],
        '#d': [dTag],
        limit: 1,
      }], { signal });

      if (events.length === 0) return null;
      return parseGammaCollection(events[0]);
    },
    enabled: !!(pubkey && dTag),
    staleTime: 120_000,
  });
}
