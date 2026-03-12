import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { CONTINENTS, getContinentLabel, getCountryLabel } from '@/lib/geoData';

export interface GeoNode {
  key: string;      // continent / country-code / city-name
  label: string;    // human-readable
  thumb: string;    // cover image URL
  count: number;    // number of products in this node
  continent?: string;
  country?: string;
  city?: string;
}

export type GeoLevel = 'world' | 'continent' | 'country' | 'city';

interface UseGeoMediaBrowserOptions {
  continent?: string;
  country?: string;
}

function firstImage(event: NostrEvent): string {
  const img = event.tags.find(([n]) => n === 'image')?.[1];
  if (img) return img;
  // imeta fallback
  const imeta = event.tags.find(([n]) => n === 'imeta');
  if (imeta) {
    for (let i = 1; i < imeta.length; i++) {
      if (imeta[i].startsWith('url ')) return imeta[i].slice(4);
    }
  }
  return '';
}

function isActive(event: NostrEvent): boolean {
  return !event.tags.some(
    ([n, v]) => (n === 'deleted' && v === 'true') || (n === 'admin_deleted' && v === 'true') || (n === 'status' && v === 'deleted')
  );
}

/**
 * Returns continent-level GeoNodes (for the "world" view).
 * Scans all geo-tagged products and groups them by continent.
 */
export function useGeoWorld() {
  const { nostr } = useNostr();
  const { data: uploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['geo-world', Array.from(uploaders || []).join(',')],
    queryFn: async (c) => {
      if (!uploaders?.size) return [];
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      const events = await nostr.query([{
        kinds: [30402],
        authors: Array.from(uploaders),
        limit: 500,
      }], { signal });

      // Group by continent
      const continentMap = new Map<string, { thumb: string; count: number }>();
      for (const e of events) {
        if (!isActive(e)) continue;
        const cont = e.tags.find(([n]) => n === 'continent')?.[1];
        if (!cont) continue;
        const entry = continentMap.get(cont) || { thumb: '', count: 0 };
        entry.count++;
        if (!entry.thumb) entry.thumb = firstImage(e);
        continentMap.set(cont, entry);
      }

      // Also count untagged
      let untaggedCount = 0;
      let untaggedThumb = '';
      for (const e of events) {
        if (!isActive(e)) continue;
        const cont = e.tags.find(([n]) => n === 'continent')?.[1];
        if (!cont) {
          untaggedCount++;
          if (!untaggedThumb) untaggedThumb = firstImage(e);
        }
      }

      const nodes: GeoNode[] = Array.from(continentMap.entries()).map(([key, val]) => ({
        key,
        label: getContinentLabel(key),
        thumb: val.thumb,
        count: val.count,
        continent: key,
      }));

      // Sort by known continent order
      const order = CONTINENTS.map(c => c.value);
      nodes.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));

      return { nodes, total: events.filter(isActive).length, untaggedCount, untaggedThumb };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Returns country-level GeoNodes for a given continent.
 */
export function useGeoContinent(continent: string) {
  const { nostr } = useNostr();
  const { data: uploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['geo-continent', continent, Array.from(uploaders || []).join(',')],
    enabled: !!continent && !!uploaders?.size,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      const events = await nostr.query([{
        kinds: [30402],
        authors: Array.from(uploaders!),
        '#continent': [continent],
        limit: 500,
      }], { signal });

      const countryMap = new Map<string, { thumb: string; count: number }>();
      for (const e of events) {
        if (!isActive(e)) continue;
        const country = e.tags.find(([n]) => n === 'country')?.[1];
        if (!country) continue;
        const entry = countryMap.get(country) || { thumb: '', count: 0 };
        entry.count++;
        if (!entry.thumb) entry.thumb = firstImage(e);
        countryMap.set(country, entry);
      }

      const nodes: GeoNode[] = Array.from(countryMap.entries()).map(([key, val]) => ({
        key,
        label: getCountryLabel(key),
        thumb: val.thumb,
        count: val.count,
        continent,
        country: key,
      }));

      nodes.sort((a, b) => b.count - a.count);
      return nodes;
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Returns city-level GeoNodes for a given country.
 */
export function useGeoCountry(continent: string, country: string) {
  const { nostr } = useNostr();
  const { data: uploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['geo-country', continent, country, Array.from(uploaders || []).join(',')],
    enabled: !!continent && !!country && !!uploaders?.size,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      const events = await nostr.query([{
        kinds: [30402],
        authors: Array.from(uploaders!),
        '#country': [country],
        limit: 500,
      }], { signal });

      const cityMap = new Map<string, { thumb: string; count: number }>();
      for (const e of events) {
        if (!isActive(e)) continue;
        const city = e.tags.find(([n]) => n === 'location')?.[1] || e.tags.find(([n]) => n === 'city')?.[1];
        const cityKey = city || '__none__';
        const entry = cityMap.get(cityKey) || { thumb: '', count: 0 };
        entry.count++;
        if (!entry.thumb) entry.thumb = firstImage(e);
        cityMap.set(cityKey, entry);
      }

      const nodes: GeoNode[] = Array.from(cityMap.entries())
        .filter(([key]) => key !== '__none__')
        .map(([key, val]) => ({
          key,
          label: key,
          thumb: val.thumb,
          count: val.count,
          continent,
          country,
          city: key,
        }));

      nodes.sort((a, b) => b.count - a.count);

      const noCity = cityMap.get('__none__');
      return { nodes, noCityCount: noCity?.count || 0, noCityThumb: noCity?.thumb || '' };
    },
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Products for a specific geo selection (used after drilldown).
 */
export function useGeoProducts(opts: UseGeoMediaBrowserOptions) {
  const { nostr } = useNostr();
  const { data: uploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['geo-products', opts.continent, opts.country, Array.from(uploaders || []).join(',')],
    enabled: !!(opts.continent || opts.country) && !!uploaders?.size,
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);
      const filter: Record<string, unknown> = {
        kinds: [30402],
        authors: Array.from(uploaders!),
        limit: 200,
      };
      if (opts.country) filter['#country'] = [opts.country];
      else if (opts.continent) filter['#continent'] = [opts.continent];

      const events = await nostr.query([filter as Parameters<typeof nostr.query>[0][0]], { signal });

      return events
        .filter(isActive)
        .filter(e => e.tags.find(([n]) => n === 'title')?.[1])
        .map(e => {
          const d = e.tags.find(([n]) => n === 'd')?.[1] || e.id;
          const naddr = e.tags.find(([n]) => n === 'd')?.[1]
            ? nip19.naddrEncode({ identifier: d, pubkey: e.pubkey, kind: 30402 })
            : '';
          return {
            id: e.id,
            naddr,
            title: e.tags.find(([n]) => n === 'title')?.[1] || '',
            image: firstImage(e),
            price: e.tags.find(([n]) => n === 'price')?.[2] || '',
            amount: e.tags.find(([n]) => n === 'price')?.[1] || '',
            location: e.tags.find(([n]) => n === 'location')?.[1] || '',
            continent: e.tags.find(([n]) => n === 'continent')?.[1] || '',
            country: e.tags.find(([n]) => n === 'country')?.[1] || '',
            event: e,
          };
        })
        .sort((a, b) => b.event.created_at - a.event.created_at);
    },
    staleTime: 2 * 60 * 1000,
  });
}
