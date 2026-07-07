/**
 * NostrMarketplacePublisher
 * ─────────────────────────
 * Broadcast stock-media products (kind 30402) to three Nostr marketplaces:
 *   • Shopstr       – wss://shopstr.store
 *   • Plebeian Market – wss://relay.plebeian.market
 *   • Conduit Market  – wss://relay.conduit.market
 *
 * Each marketplace relay receives a copy of the product event so shoppers on
 * those platforms can discover Traveltelly media.  Per-product publish state is
 * persisted in localStorage so the UI can show "already published" badges even
 * after page reload.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NRelay1 } from '@nostrify/nostrify';
import type { NostrEvent } from '@nostrify/nostrify';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { ADMIN_HEX } from '@/hooks/useBlossomMedia';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import {
  ShoppingCart,
  Zap,
  Link2,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ExternalLink,
  Globe,
  Package,
  Radio,
  AlertCircle,
} from 'lucide-react';

// ── Marketplace definitions ────────────────────────────────────────────────────

interface NostrMarketplace {
  id: string;
  name: string;
  relay: string;
  shopUrl: (pubkey: string) => string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const MARKETPLACES: NostrMarketplace[] = [
  {
    id: 'shopstr',
    name: 'Shopstr',
    relay: 'wss://relay.shopstr.store',
    shopUrl: (pubkey) => `https://shopstr.store/${nip19.npubEncode(pubkey)}`,
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
  },
  {
    id: 'plebeian',
    name: 'Plebeian Market',
    relay: 'wss://relay.plebeian.market',
    shopUrl: (pubkey) => `https://plebeian.market/users/${nip19.npubEncode(pubkey)}`,
    icon: <Zap className="w-4 h-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  {
    id: 'conduit',
    name: 'Conduit Market',
    relay: 'wss://relay.conduit.market',
    shopUrl: (pubkey) => `https://conduit.market/profile/${nip19.npubEncode(pubkey)}`,
    icon: <Link2 className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
  },
];

// ── localStorage key helper ────────────────────────────────────────────────────

const STORAGE_KEY = 'traveltelly_market_publish_log';

interface PublishLog {
  [productId: string]: {
    [marketplaceId: string]: number; // unix timestamp of last publish
  };
}

function loadPublishLog(): PublishLog {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function savePublishLog(log: PublishLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

// ── Hook: publish to marketplace relays ───────────────────────────────────────

interface PublishResult {
  marketplaceId: string;
  success: boolean;
  error?: string;
}

async function broadcastEventToRelay(relay: string, event: NostrEvent): Promise<void> {
  const r = new NRelay1(relay);
  try {
    await r.event(event, { signal: AbortSignal.timeout(8000) });
  } finally {
    r.close?.();
  }
}

// ── MarketplaceStatusRow ───────────────────────────────────────────────────────

function MarketplaceStatusRow({
  marketplace,
  publishedAt,
  pubkey,
}: {
  marketplace: NostrMarketplace;
  publishedAt: number | undefined;
  pubkey: string;
}) {
  return (
    <div className={`flex items-center justify-between rounded-lg border px-3 py-2 ${marketplace.bgColor}`}>
      <div className="flex items-center gap-2">
        <span className={marketplace.color}>{marketplace.icon}</span>
        <span className="text-sm font-medium">{marketplace.name}</span>
        {publishedAt ? (
          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 gap-1 flex items-center">
            <CheckCircle2 className="w-3 h-3" />
            Published {new Date(publishedAt * 1000).toLocaleDateString()}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Not published
          </Badge>
        )}
      </div>
      <a
        href={marketplace.shopUrl(pubkey)}
        target="_blank"
        rel="noopener noreferrer"
        className={`text-xs ${marketplace.color} hover:underline flex items-center gap-1`}
      >
        My Shop
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ── ProductRow ─────────────────────────────────────────────────────────────────

interface ProductRowProps {
  product: import('@/hooks/useMarketplaceProducts').MarketplaceProduct;
  publishLog: PublishLog;
  onPublish: (product: import('@/hooks/useMarketplaceProducts').MarketplaceProduct) => Promise<void>;
  isPublishing: boolean;
}

function ProductPublishRow({ product, publishLog, onPublish, isPublishing }: ProductRowProps) {
  const [expanded, setExpanded] = useState(false);
  const log = publishLog[product.id] || {};
  const publishedCount = Object.keys(log).length;
  const allPublished = publishedCount === MARKETPLACES.length;

  return (
    <div className="border rounded-xl overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 p-3 bg-white hover:bg-gray-50 transition-colors">
        {/* Thumbnail */}
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-gray-300" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{product.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-0.5">
              <Zap className="w-3 h-3 text-yellow-500" />
              {product.price} {product.currency}
            </span>
            {product.contentCategory && (
              <Badge variant="outline" className="text-xs px-1.5 py-0">{product.contentCategory}</Badge>
            )}
            {product.location && (
              <span className="text-xs text-muted-foreground">📍 {product.location}</span>
            )}
          </div>
          {/* Publish status summary */}
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {MARKETPLACES.map((m) => (
              <span
                key={m.id}
                title={log[m.id] ? `Published to ${m.name}` : `Not yet on ${m.name}`}
                className={`inline-flex items-center gap-0.5 text-xs rounded-full px-1.5 py-0.5 border ${
                  log[m.id]
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-gray-50 text-gray-400 border-gray-200'
                }`}
              >
                {log[m.id] ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Globe className="w-2.5 h-2.5" />}
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
            onClick={() => setExpanded((v) => !v)}
            title="Show marketplace details"
          >
            <Radio className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => onPublish(product)}
            disabled={isPublishing || allPublished}
            className={`gap-1.5 text-white text-xs h-8 ${
              allPublished
                ? 'bg-green-500 hover:bg-green-600'
                : 'hover:opacity-90'
            }`}
            style={allPublished ? {} : { backgroundColor: '#ec1a58' }}
            title={allPublished ? 'Already published to all markets' : 'Broadcast to all 3 marketplaces'}
          >
            {isPublishing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : allPublished ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <Radio className="w-3.5 h-3.5" />
            )}
            {allPublished ? 'Published' : 'Publish to Markets'}
          </Button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 bg-gray-50 border-t space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
            Marketplace Status
          </p>
          {MARKETPLACES.map((m) => (
            <MarketplaceStatusRow
              key={m.id}
              marketplace={m}
              publishedAt={log[m.id]}
              pubkey={product.seller.pubkey}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function NostrMarketplacePublisher() {
  const { user } = useCurrentUser();
  const { data: products, isLoading, refetch } = useMarketplaceProducts({
    seller: ADMIN_HEX,
  });

  const [publishLog, setPublishLog] = useState<PublishLog>(loadPublishLog);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [lastResults, setLastResults] = useState<PublishResult[] | null>(null);
  const { toast } = useToast();

  // Active (non-deleted) products only
  const activeProducts = useMemo(
    () => (products || []).filter((p) => p.status !== 'deleted' && p.status !== 'inactive'),
    [products],
  );

  const publishedAnywhere = useMemo(
    () => activeProducts.filter((p) => Object.keys(publishLog[p.id] || {}).length > 0).length,
    [activeProducts, publishLog],
  );

  const handlePublish = useCallback(
    async (product: import('@/hooks/useMarketplaceProducts').MarketplaceProduct) => {
      if (!user) {
        toast({ title: 'Please log in first', variant: 'destructive' });
        return;
      }

      setPublishingId(product.id);
      setLastResults(null);

      const event = product.event;
      const results: PublishResult[] = [];

      await Promise.allSettled(
        MARKETPLACES.map(async (marketplace) => {
          try {
            await broadcastEventToRelay(marketplace.relay, event);
            results.push({ marketplaceId: marketplace.id, success: true });
          } catch (err) {
            results.push({
              marketplaceId: marketplace.id,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            });
          }
        }),
      );

      // Update publish log
      const now = Math.floor(Date.now() / 1000);
      setPublishLog((prev) => {
        const next = { ...prev };
        next[product.id] = { ...(next[product.id] || {}) };
        for (const r of results) {
          if (r.success) next[product.id][r.marketplaceId] = now;
        }
        savePublishLog(next);
        return next;
      });

      setLastResults(results);
      setPublishingId(null);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      if (successCount === MARKETPLACES.length) {
        toast({
          title: '✅ Published to all 3 marketplaces!',
          description: `"${product.title}" is now live on Shopstr, Plebeian Market, and Conduit Market.`,
        });
      } else if (successCount > 0) {
        toast({
          title: `⚡ Published to ${successCount}/${MARKETPLACES.length} marketplaces`,
          description: `${failCount} relay(s) didn't respond — your listing may still appear there shortly.`,
        });
      } else {
        toast({
          title: 'Publish failed',
          description: 'Could not reach any marketplace relay. Check your connection.',
          variant: 'destructive',
        });
      }
    },
    [user, toast],
  );

  const handlePublishAll = useCallback(async () => {
    if (!user || !activeProducts.length) return;

    const unpublished = activeProducts.filter(
      (p) => Object.keys(publishLog[p.id] || {}).length < MARKETPLACES.length,
    );

    if (!unpublished.length) {
      toast({ title: 'All products are already published to all marketplaces.' });
      return;
    }

    toast({ title: `Broadcasting ${unpublished.length} products…` });

    let successTotal = 0;
    for (const product of unpublished) {
      setPublishingId(product.id);
      const now = Math.floor(Date.now() / 1000);
      await Promise.allSettled(
        MARKETPLACES.map(async (marketplace) => {
          try {
            await broadcastEventToRelay(marketplace.relay, product.event);
            setPublishLog((prev) => {
              const next = { ...prev };
              next[product.id] = { ...(next[product.id] || {}), [marketplace.id]: now };
              savePublishLog(next);
              return next;
            });
            successTotal++;
          } catch {
            // silently skip failed relays in bulk mode
          }
        }),
      );
    }

    setPublishingId(null);
    toast({
      title: `🎉 Bulk publish complete!`,
      description: `Broadcast ${unpublished.length} products across up to 3 marketplaces.`,
    });
  }, [user, activeProducts, publishLog, toast]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingCart className="w-5 h-5" style={{ color: '#ec1a58' }} />
              Publish Merch to Nostr Marketplaces
            </CardTitle>
            <CardDescription className="mt-1 text-sm">
              Click <strong>Publish to Markets</strong> on any product below to broadcast it to Shopstr,
              Plebeian Market, and Conduit Market simultaneously. Your listing appears everywhere buyers are
              shopping — no account on each platform needed.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              title="Refresh products"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={handlePublishAll}
              disabled={!!publishingId || !activeProducts.length}
              className="gap-1.5 text-white text-xs hover:opacity-90"
              style={{ backgroundColor: '#ec1a58' }}
            >
              <Radio className="w-3.5 h-3.5" />
              Publish All to Markets
            </Button>
          </div>
        </div>

        {/* Marketplace header cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {MARKETPLACES.map((m) => {
            const count = activeProducts.filter((p) => publishLog[p.id]?.[m.id]).length;
            return (
              <div key={m.id} className={`rounded-xl border p-3 ${m.bgColor}`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className={m.color}>{m.icon}</span>
                    <span className={`text-sm font-semibold ${m.color}`}>{m.name}</span>
                  </div>
                  {user && (
                    <a
                      href={m.shopUrl(user.pubkey)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-xs ${m.color} hover:underline flex items-center gap-0.5`}
                    >
                      My Shop <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs text-muted-foreground">
                    <strong>{count}</strong> of {activeProducts.length} products published
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent>
        {/* Last publish results */}
        {lastResults && (
          <div className="mb-4 rounded-lg border p-3 bg-gray-50 space-y-1.5">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Last publish results</p>
            {lastResults.map((r) => {
              const m = MARKETPLACES.find((x) => x.id === r.marketplaceId)!;
              return (
                <div key={r.marketplaceId} className="flex items-center gap-2 text-sm">
                  {r.success ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-400 flex-shrink-0" />
                  )}
                  <span className={m.color}>{m.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {r.success ? '— broadcast accepted' : `— ${r.error || 'relay did not respond'}`}
                  </span>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-1 italic">
              Note: even if a relay shows a timeout, your event may still be indexed. Republishing is always safe.
            </p>
          </div>
        )}

        {/* Product list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3 items-center p-3 rounded-xl border">
                <Skeleton className="w-14 h-14 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-1">
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-8 w-32 rounded-lg flex-shrink-0" />
              </div>
            ))}
          </div>
        ) : activeProducts.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-xl">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground">
              No active stock media products found.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[600px]">
            <div className="space-y-3 pr-2">
              {activeProducts.map((product) => (
                <ProductPublishRow
                  key={product.id}
                  product={product}
                  publishLog={publishLog}
                  onPublish={handlePublish}
                  isPublishing={publishingId === product.id}
                />
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Summary footer */}
        {activeProducts.length > 0 && (
          <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {publishedAnywhere} of {activeProducts.length} products broadcast to at least one marketplace
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-500" />
              Publish status saved locally
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
