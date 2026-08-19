import { useQuery } from '@tanstack/react-query';
import { NRelay1 } from '@nostrify/nostrify';
import * as geohash from 'ngeohash';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';

export interface DuplicatePin {
  event: NostrEvent;
  lat: number;
  lng: number;
  geohash: string;
  title: string;
  image?: string;
  dTag?: string;
}

export interface DuplicatePinGroup {
  key: string; // normalized "lat,lng" (5 decimals)
  lat: number;
  lng: number;
  pins: DuplicatePin[];
}

// Approved relays queried in parallel for best coverage
const PIN_RELAYS = [
  'wss://relay.ditto.pub',
  'wss://relay.dreamith.to',
  'wss://relay.primal.net',
];

function normalizeCoord(value: number, places = 5): number {
  const factor = Math.pow(10, places);
  return Math.round(value * factor) / factor;
}

/**
 * Query ALL kind-34879 pin/review events from all relays in parallel,
 * merging and deduplicating results (mirrors useAdminReviews' direct query).
 */
async function fetchAllPins(signal: AbortSignal): Promise<NostrEvent[]> {
  const filter: NostrFilter = {
    kinds: [34879],
    limit: 2000,
  };

  const results = await Promise.allSettled(
    PIN_RELAYS.map(async (url) => {
      const relay = new NRelay1(url);
      try {
        return await relay.query([filter], { signal });
      } finally {
        relay.close?.();
      }
    })
  );

  const seen = new Map<string, NostrEvent>();
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const e of r.value) {
        if (!seen.has(e.id)) seen.set(e.id, e);
      }
    }
  }
  return Array.from(seen.values());
}

/**
 * Detects duplicate pins: kind-34879 events that share the same exact GPS
 * location (decoded from their 'g' geohash and normalized to 5 decimals) and
 * therefore stack overlapping photo thumbs on the world map. Only events that
 * render on the map (carry a decodable 'g' tag) are considered. Groups with
 * 2+ pins are returned as potential doubles for the admin to review & delete.
 */
export function useDuplicatePins() {
  return useQuery({
    queryKey: ['duplicate-pins'],
    queryFn: async ({ signal }) => {
      const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(15000)]);
      const events = await fetchAllPins(abortSignal);

      const groups = new Map<string, DuplicatePin[]>();

      for (const event of events) {
        const g = event.tags.find(([n]) => n === 'g')?.[1];
        if (!g) continue;

        let decoded: { latitude: number; longitude: number };
        try {
          decoded = geohash.decode(g);
        } catch {
          continue;
        }

        const lat = normalizeCoord(decoded.latitude);
        const lng = normalizeCoord(decoded.longitude);
        const key = `${lat},${lng}`;

        const pin: DuplicatePin = {
          event,
          lat,
          lng,
          geohash: g,
          title: event.tags.find(([n]) => n === 'title')?.[1] || 'Unknown Place',
          image: event.tags.find(([n]) => n === 'image')?.[1],
          dTag: event.tags.find(([n]) => n === 'd')?.[1],
        };

        const list = groups.get(key);
        if (list) list.push(pin);
        else groups.set(key, [pin]);
      }

      return Array.from(groups.values())
        .filter((pins) => pins.length >= 2)
        .map((pins) => ({
          key: `${normalizeCoord(pins[0].lat)},${normalizeCoord(pins[0].lng)}`,
          lat: pins[0].lat,
          lng: pins[0].lng,
          pins: [...pins].sort((a, b) => a.event.created_at - b.event.created_at),
        }))
        .sort((a, b) => b.pins.length - a.pins.length);
    },
    staleTime: 2 * 60 * 1000,
    // Return [] immediately so the panel renders while loading
    placeholderData: [],
  });
}
