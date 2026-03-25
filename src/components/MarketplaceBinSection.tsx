/**
 * MarketplaceBinSection
 *
 * Renders a single named "bin" (photo collection/folder) on the public marketplace page.
 * Loads products that match the bin's filter and shows them in a horizontal scrollable strip.
 */

import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ProductCard';
import { useAuthorizedMediaUploaders } from '@/hooks/useStockMediaPermissions';
import type { MarketplaceBin } from '@/hooks/useMarketplaceBins';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';
import { ChevronRight, FolderOpen } from 'lucide-react';

// ── parser (lightweight copy to avoid circular imports) ───────────────────────

function parseProduct(event: NostrEvent): MarketplaceProduct | null {
  try {
    const d = event.tags.find(([n]) => n === 'd')?.[1];
    const title = event.tags.find(([n]) => n === 'title')?.[1];
    const summary = event.tags.find(([n]) => n === 'summary')?.[1];
    const price = event.tags.find(([n]) => n === 'price');
    const location = event.tags.find(([n]) => n === 'location')?.[1];
    const status = (event.tags.find(([n]) => n === 'status')?.[1] as MarketplaceProduct['status']) || 'active';
    const continent = event.tags.find(([n]) => n === 'continent')?.[1];
    const country = event.tags.find(([n]) => n === 'country')?.[1];
    const geoFolder = event.tags.find(([n]) => n === 'geo_folder')?.[1];

    if (!d || !title || !price) return null;
    const [, amount, currency] = price;
    if (!amount || !currency) return null;
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return null;

    // Collect images from various tag names + imeta + content
    const imageTagNames = ['image', 'img', 'photo', 'picture', 'url'];
    const tagImages = event.tags
      .filter(([n]) => imageTagNames.includes(n))
      .map(([, u]) => u)
      .filter(Boolean);

    const imetaImages = event.tags
      .filter(([n]) => n === 'imeta')
      .map(([, v]) => {
        const m = v?.match(/url\s+(.+)/);
        return m ? m[1] : null;
      })
      .filter(Boolean) as string[];

    let contentImages: string[] = [];
    if (event.content) {
      try {
        const j = JSON.parse(event.content);
        if (Array.isArray(j.images)) contentImages = j.images;
        else if (j.image) contentImages = [j.image];
      } catch {
        const urlRegex = /https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp|svg|tiff|bmp)/gi;
        contentImages = event.content.match(urlRegex) || [];
      }
    }

    const allImages = [...new Set([...tagImages, ...imetaImages, ...contentImages])].filter(Boolean);

    const mediaTypes = event.tags.filter(([n]) => n === 't').map(([, v]) => v).filter(Boolean);
    const contentCategories = event.tags.filter(([n]) => n === 'category').map(([, v]) => v).filter(Boolean);

    return {
      id: d,
      title,
      description: summary || event.content || '',
      price: amount,
      currency: currency.toUpperCase(),
      images: allImages,
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
  } catch {
    return null;
  }
}

function isDeletedProduct(p: MarketplaceProduct): boolean {
  return (
    p.status === 'deleted' ||
    p.description?.startsWith('[DELETED]') ||
    p.description?.startsWith('[ADMIN DELETED]') ||
    p.description?.startsWith('[TOMBSTONE]') ||
    p.event.tags.some((t) => t[0] === 'deleted' && t[1] === 'true') ||
    p.event.tags.some((t) => t[0] === 'admin_deleted' && t[1] === 'true') ||
    p.event.tags.some((t) => t[0] === 'tombstone' && t[1] === 'true')
  );
}

// ── hook ──────────────────────────────────────────────────────────────────────

function useBinProducts(bin: MarketplaceBin, authorizedUploaders: string[]) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['bin-products', bin.id, bin.filterType, bin.filterValue, authorizedUploaders],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(8000)]);

      if (authorizedUploaders.length === 0) return [];

      const filter: NostrFilter = {
        kinds: [30402],
        authors: authorizedUploaders,
        limit: 12,
      };

      // Apply relay-side filter where possible
      if (bin.filterType === 'tag') {
        filter['#t'] = [bin.filterValue.trim()];
      }

      const events = await nostr.query([filter], { signal });

      let products = events
        .map(parseProduct)
        .filter((p): p is MarketplaceProduct => p !== null)
        .filter((p) => !isDeletedProduct(p));

      // Client-side filtering
      switch (bin.filterType) {
        case 'category':
          products = products.filter(
            (p) => p.contentCategory === bin.filterValue || p.category === bin.filterValue,
          );
          break;
        case 'geo':
          products = products.filter(
            (p) =>
              p.continent === bin.filterValue ||
              p.country === bin.filterValue ||
              p.geoFolder?.startsWith(bin.filterValue),
          );
          break;
        case 'featured': {
          const ids = bin.filterValue.split(',').map((s) => s.trim()).filter(Boolean);
          products = products.filter((p) => ids.includes(p.id));
          break;
        }
        default:
          break;
      }

      return products.slice(0, 8); // Show max 8 per bin strip
    },
    staleTime: 60_000,
    enabled: authorizedUploaders.length > 0,
  });
}

// ── component ─────────────────────────────────────────────────────────────────

interface MarketplaceBinSectionProps {
  bin: MarketplaceBin;
}

export function MarketplaceBinSection({ bin }: MarketplaceBinSectionProps) {
  const { data: authorizedUploaders = [] } = useAuthorizedMediaUploaders();
  const uploadersList = Array.from(authorizedUploaders);
  const { data: products, isLoading } = useBinProducts(bin, uploadersList);

  // Don't render if empty and done loading
  if (!isLoading && (!products || products.length === 0)) {
    return null;
  }

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {(bin.thumbnailImage || bin.coverImage) ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
              <img
                src={bin.thumbnailImage || bin.coverImage}
                alt={bin.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : null}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {bin.title}
            </h2>
            {bin.description && (
              <p className="text-sm text-muted-foreground">{bin.description}</p>
            )}
          </div>
        </div>

        {/* View all link using marketplace search */}
        <Link
          to={
            bin.filterType === 'category'
              ? `/marketplace?category=${encodeURIComponent(bin.filterValue)}`
              : bin.filterType === 'geo'
              ? `/marketplace?geo=${encodeURIComponent(bin.filterValue)}`
              : `/marketplace?q=${encodeURIComponent(bin.filterValue)}`
          }
          className="flex-shrink-0"
        >
          <Button
            variant="ghost"
            size="sm"
            className="text-sm gap-1"
            style={{ color: '#ec1a58' }}
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* Products strip */}
      {isLoading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-56">
              <Card>
                <CardContent className="p-0">
                  <Skeleton className="h-40 w-full rounded-t-lg" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-xl py-8 text-center">
          <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-muted-foreground">No media in this bin yet.</p>
        </div>
      )}
    </section>
  );
}
