import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  images: string[];
  category: string;
  mediaType?: string;
  contentCategory?: string;
  location?: string;
  continent?: string;
  country?: string;
  geoFolder?: string;
  seller: {
    pubkey: string;
    name?: string;
    picture?: string;
  };
  status: 'active' | 'sold' | 'inactive' | 'deleted';
  createdAt: number;
  event: NostrEvent;
}

interface UseMarketplaceProductsOptions {
  search?: string;
  category?: string;
  seller?: string;
  freeOnly?: boolean;
  continent?: string;
  country?: string;
  city?: string;
  geoFolder?: string;
}

/** Image URL pattern — loose to catch as many as possible */
const IMAGE_URL_RE = /https?:\/\/[^\s"'<>)]+\.(?:jpg|jpeg|png|gif|webp|svg|tiff|tif|heic|heif|bmp|avif)/gi;

/**
 * Extract ALL image URLs from an event, checking every possible location:
 *   1. `image` tags (most common for traveltelly products)
 *   2. `imeta` tags (NIP-92)
 *   3. Other common tag names: img, photo, picture, thumb, url
 *   4. Content field — JSON with images array, or raw URLs
 */
function extractImages(event: NostrEvent): string[] {
  const urls = new Set<string>();

  for (const tag of event.tags) {
    const tagName = tag[0];

    // 1. Direct image-like tags
    if (['image', 'img', 'photo', 'picture', 'thumb', 'thumbnail'].includes(tagName)) {
      if (tag[1]) urls.add(tag[1]);
    }

    // 2. `url` tag — only if it looks like an image
    if (tagName === 'url' && tag[1] && IMAGE_URL_RE.test(tag[1])) {
      IMAGE_URL_RE.lastIndex = 0; // reset regex state
      urls.add(tag[1]);
    }

    // 3. imeta tags (NIP-92): ["imeta", "url https://...", "m image/jpeg", ...]
    if (tagName === 'imeta') {
      for (let i = 1; i < tag.length; i++) {
        const el = tag[i];
        if (typeof el === 'string') {
          const m = el.match(/^url\s+(.+)/);
          if (m) urls.add(m[1].trim());
        }
      }
    }
  }

  // 4. Content field fallback
  if (event.content) {
    try {
      const json = JSON.parse(event.content);
      if (Array.isArray(json.images)) {
        for (const u of json.images) if (typeof u === 'string') urls.add(u);
      } else if (typeof json.image === 'string') {
        urls.add(json.image);
      }
    } catch {
      // Not JSON — scan for image URLs in raw text
      const matches = event.content.match(IMAGE_URL_RE);
      if (matches) {
        for (const u of matches) urls.add(u);
      }
    }
  }

  return [...urls].filter(Boolean);
}

/**
 * Minimal validation: kind 30402, has d-tag and title.
 * Price validation is relaxed — many real products may have unusual price formats.
 */
function isValidProduct(event: NostrEvent): boolean {
  if (event.kind !== 30402) return false;

  const d = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  if (!d || !title) return false;

  // Filter placeholder/test content
  const lower = `${title} ${event.content}`.toLowerCase();
  const junk = ['lorem ipsum', 'placeholder', 'template', 'sample product', 'example product', 'test product', 'demo product', 'dolor sit amet'];
  if (junk.some((kw) => lower.includes(kw))) return false;

  return true;
}

/**
 * Check whether a product event should be treated as deleted.
 */
function isDeleted(event: NostrEvent): boolean {
  const status = event.tags.find(([n]) => n === 'status')?.[1];
  if (status === 'deleted') return true;

  for (const [name, val] of event.tags) {
    if ((name === 'deleted' || name === 'admin_deleted' || name === 'tombstone') && val === 'true') return true;
  }

  const content = (event.tags.find(([n]) => n === 'summary')?.[1] ?? event.content ?? '').slice(0, 30);
  if (content.startsWith('[DELETED]') || content.startsWith('[ADMIN DELETED]') || content.startsWith('[TOMBSTONE]')) return true;

  return false;
}

function parseProduct(event: NostrEvent): MarketplaceProduct | null {
  const d = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  if (!d || !title) return null;

  const summary = event.tags.find(([n]) => n === 'summary')?.[1];
  const priceTag = event.tags.find(([n]) => n === 'price');
  const location = event.tags.find(([n]) => n === 'location')?.[1];
  const status = (event.tags.find(([n]) => n === 'status')?.[1] as MarketplaceProduct['status']) || 'active';
  const continent = event.tags.find(([n]) => n === 'continent')?.[1];
  const country = event.tags.find(([n]) => n === 'country')?.[1];
  const geoFolder = event.tags.find(([n]) => n === 'geo_folder')?.[1];

  // Price: try to get amount+currency, fall back to "0" / "SATS"
  let amount = '0';
  let currency = 'SATS';
  if (priceTag && priceTag[1]) {
    amount = priceTag[1];
    currency = (priceTag[2] || 'SATS').toUpperCase();
  }

  const images = extractImages(event);

  const mediaTypes = event.tags.filter(([n]) => n === 't').map(([, v]) => v).filter(Boolean);
  const contentCategories = event.tags.filter(([n]) => n === 'category').map(([, v]) => v).filter(Boolean);

  return {
    id: d,
    title,
    description: summary || event.content || '',
    price: amount,
    currency,
    images,
    category: mediaTypes[0] || 'other',
    mediaType: mediaTypes[0] || 'other',
    contentCategory: contentCategories[0] || '',
    location,
    continent,
    country,
    geoFolder,
    seller: { pubkey: event.pubkey },
    status,
    createdAt: event.created_at,
    event,
  };
}

export function useMarketplaceProducts(options: UseMarketplaceProductsOptions = {}) {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['marketplace-products', JSON.stringify(options), Array.from(authorizedUploaders || [])],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(20000)]);

      const authorizedAuthors = Array.from(authorizedUploaders || []);
      if (authorizedAuthors.length === 0) return [];

      const authors = options.seller ? [options.seller] : authorizedAuthors;
      const filter: NostrFilter = {
        kinds: [30402],
        authors,
        limit: 5000,
      };
      if (options.category) filter['#t'] = [options.category];

      const allEvents = await nostr.query([filter], { signal });

      // Deduplicate addressable events — keep newest per pubkey+d
      const seen = new Map<string, NostrEvent>();
      for (const e of allEvents) {
        const dTag = e.tags.find(([n]) => n === 'd')?.[1] ?? '';
        const key = `${e.pubkey}:${dTag}`;
        const existing = seen.get(key);
        if (!existing || e.created_at > existing.created_at) {
          seen.set(key, e);
        }
      }
      const events = Array.from(seen.values());

      // Parse, validate, filter
      const products: MarketplaceProduct[] = [];
      for (const event of events) {
        if (!isValidProduct(event)) continue;
        if (isDeleted(event)) continue;

        const product = parseProduct(event);
        if (!product) continue;

        // Free-only mode
        if (options.freeOnly) {
          const isFree = event.tags.some(([n, v]) => n === 'free' && v === 'true');
          if (!isFree) continue;
        } else {
          // Geo filters
          if (options.continent && product.continent !== options.continent) continue;
          if (options.country && product.country !== options.country) continue;
          if (options.city && product.location !== options.city) continue;
          if (options.geoFolder && product.geoFolder !== options.geoFolder) continue;

          // Search
          if (options.search) {
            const q = options.search.toLowerCase();
            const haystack = `${product.title} ${product.description} ${product.category}`.toLowerCase();
            if (!haystack.includes(q)) continue;
          }
        }

        products.push(product);
      }

      products.sort((a, b) => b.createdAt - a.createdAt);
      return products;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
