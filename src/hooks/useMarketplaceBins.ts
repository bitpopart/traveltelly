/**
 * useMarketplaceBins
 *
 * Reads and writes the marketplace "bins" (named photo/gallery collections)
 * that the admin curates and that appear on the public Marketplace front page.
 *
 * Storage: Nostr kind 30078 (app-specific replaceable event), d-tag = "traveltelly-marketplace-bins"
 *
 * Schema stored in content as JSON:
 * {
 *   bins: MarketplaceBin[]
 * }
 */

import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostrPublish } from './useNostrPublish';
import { useToast } from './useToast';

export interface MarketplaceBin {
  id: string;            // unique id (UUID or slug)
  title: string;         // e.g. "Wildlife & Animals"
  description: string;  // short subtitle shown on the card
  emoji: string;         // e.g. "🐘" (kept for backward compat, no longer used in UI)
  coverImage?: string;  // optional cover photo URL (legacy)
  thumbnailImage?: string; // image URL picked from collection media items
  /** Filter mode: category = content category tag, tag = t-tag, geo = continent/country, featured = hand-picked ids */
  filterType: 'category' | 'tag' | 'geo' | 'featured';
  /** Value that drives the filter:
   *  - category → e.g. "Animals"
   *  - tag       → e.g. "wildlife"
   *  - geo       → e.g. "Europe/Netherlands" or just "Europe"
   *  - featured  → comma-separated product d-tag ids
   */
  filterValue: string;
  sortOrder: number;     // display order (ascending)
  isVisible: boolean;    // whether to show on the public page
}

export interface MarketplaceBinsConfig {
  bins: MarketplaceBin[];
}

const D_TAG = 'traveltelly-marketplace-bins';
const KIND = 30078;

// The admin's pubkey
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

/** Query key */
const QUERY_KEY = ['marketplace-bins'];

export function useMarketplaceBins() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      // Decode admin pubkey
      const { nip19 } = await import('nostr-tools');
      const adminPubkey = nip19.decode(ADMIN_NPUB).data as string;

      const events = await nostr.query(
        [{ kinds: [KIND], authors: [adminPubkey], '#d': [D_TAG], limit: 1 }],
        { signal },
      );

      if (!events.length) {
        return { bins: [] } as MarketplaceBinsConfig;
      }

      try {
        const config = JSON.parse(events[0].content) as MarketplaceBinsConfig;
        return config;
      } catch {
        return { bins: [] } as MarketplaceBinsConfig;
      }
    },
    staleTime: 30_000,
  });
}

export function useSaveMarketplaceBins() {
  const { mutate: publish } = useNostrPublish();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: MarketplaceBinsConfig) => {
      return new Promise<void>((resolve, reject) => {
        publish(
          {
            kind: KIND,
            content: JSON.stringify(config),
            tags: [
              ['d', D_TAG],
              ['alt', 'Traveltelly Marketplace Bins Configuration'],
            ],
          },
          {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          },
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Marketplace layout saved!', description: 'Changes are now live on the public marketplace.' });
    },
    onError: (err) => {
      console.error('Failed to save marketplace bins:', err);
      toast({ title: 'Save failed', description: String(err), variant: 'destructive' });
    },
  });
}
