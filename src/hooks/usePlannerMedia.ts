import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { isValidImageUrl } from '@/lib/imageValidation';

// The Traveltelly admin npub (owner-authored stories/trips)
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export type PlannerCategory = 'reviews' | 'stories' | 'trips' | 'stock';

export interface PlannerMediaItem {
  id: string;
  category: PlannerCategory;
  url: string;
  title: string;
  image: string;
  hashtags: string[];
}

const CATEGORY_ROUTE: Record<number, { category: PlannerCategory; route: string }> = {
  34879: { category: 'reviews', route: 'review' },
  30023: { category: 'stories', route: 'story' },
  34235: { category: 'stories', route: 'video' },
  34236: { category: 'stories', route: 'video' },
  30025: { category: 'trips', route: 'trip' },
  30402: { category: 'stock', route: 'media/preview' },
};

/** Pull an image URL out of an event the same way the rest of the site does. */
function extractImage(event: { kind: number; tags: string[][] }): string {
  const find = (name: string) => event.tags.find(([tagName]) => tagName === name)?.[1] || '';
  if (event.kind === 34235 || event.kind === 34236) {
    const imeta = event.tags.find(([name]) => name === 'imeta');
    if (imeta) {
      for (let i = 1; i < imeta.length; i++) {
        if (imeta[i].startsWith('image ')) return imeta[i].substring(6);
      }
    }
    return find('thumb') || find('image');
  }
  return find('image');
}

function buildItem(
  event: { id: string; kind: number; pubkey: string; created_at: number; tags: string[][] },
  identifier: string,
  title: string,
  image: string,
): PlannerMediaItem | null {
  const meta = CATEGORY_ROUTE[event.kind];
  if (!meta || !identifier || !title || !isValidImageUrl(image)) return null;

  const naddr = nip19.naddrEncode({
    identifier,
    pubkey: event.pubkey,
    kind: event.kind,
  });

  const hashtags = event.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter((tag): tag is string => Boolean(tag) && !['travel', 'traveltelly'].includes(tag.toLowerCase()))
    .slice(0, 4);

  return {
    id: event.id,
    category: meta.category,
    url: `/${meta.route}/${naddr}`,
    title,
    image,
    hashtags,
  };
}

/**
 * Latest publisher-ready TravelTelly media (reviews, stories/videos, trips,
 * stock products) straight from the relay — used by the Social Media Planner
 * picker to submit existing site content to Nostr / X / Facebook / Instagram.
 */
export function usePlannerMedia() {
  const { nostr } = useNostr();

  return useQuery<PlannerMediaItem[]>({
    queryKey: ['planner-media'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([
        { kinds: [34879], limit: 8 },
        { kinds: [30023], authors: [ADMIN_HEX], limit: 6 },
        { kinds: [34235, 34236], authors: [ADMIN_HEX], limit: 6 },
        { kinds: [30025], authors: [ADMIN_HEX], limit: 6 },
        { kinds: [30402], limit: 8 },
      ], { signal });

      const seen = new Set<string>();
      const items: PlannerMediaItem[] = [];
      for (const event of events) {
        if (seen.has(event.id)) continue;
        seen.add(event.id);
        const identifier = event.tags.find(([name]) => name === 'd')?.[1] || '';
        const title = event.tags.find(([name]) => name === 'title')?.[1] ||
          event.tags.find(([name]) => name === 'summary')?.[1] || '';
        const image = extractImage(event);
        const item = buildItem(event, identifier, title, image);
        if (item) items.push(item);
      }
      return items;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}
