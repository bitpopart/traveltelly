import { useSeoMeta } from '@unhead/react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { RelaySelector } from "@/components/RelaySelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInfiniteMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { useMarketplaceSubscription } from "@/hooks/useMarketplaceSubscription";
import { useMarketplaceBins } from "@/hooks/useMarketplaceBins";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { MarketplaceSubscriptionDialog } from "@/components/MarketplaceSubscriptionDialog";
import { MarketplaceBinSection } from "@/components/MarketplaceBinSection";
import { AdminSelectionProvider, useAdminSelection } from "@/contexts/AdminSelectionContext";
import { adminBulkDownload } from "@/lib/adminBulkDownload";
import type { BulkDownloadProgress } from "@/lib/adminBulkDownload";
import { PaymentDialog } from "@/components/PaymentDialog";
import { ShoppingCart, Plus, Store, Crown, Download, CheckSquare, X, Loader2, Camera, Video, Zap, LayoutGrid, Search, Settings2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import type { MarketplaceProduct } from "@/hooks/useMarketplaceProducts";
import { ADMIN_HEX } from "@/hooks/useBlossomMedia";

// ─── Compact thumbnail card ───────────────────────────────────────────────────
function MediaThumb({ product }: { product: MarketplaceProduct }) {
  const [hover, setHover] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { selectedIds, toggle } = useAdminSelection();
  const { user } = useCurrentUser();
  const isAdmin = user?.pubkey === ADMIN_HEX;
  const isSelected = selectedIds.has(product.id);
  const isFree = !product.price || product.price === '0' || parseFloat(product.price) === 0;
  const isVideo = product.mediaType === 'video' || product.images[0]?.match(/\.(mp4|webm|mov)/i);

  const naddr = nip19.naddrEncode({
    identifier: product.id,
    pubkey: product.seller.pubkey,
    kind: 30402,
  });

  const thumb = product.images[0];

  return (
    <>
      <div
        className={`relative aspect-square overflow-hidden bg-gray-900 cursor-pointer group ${isSelected ? 'ring-2 ring-amber-400' : ''}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => {
          if (isAdmin) { toggle(product); return; }
          setShowPayment(true);
        }}
      >
        {/* Thumbnail */}
        {thumb ? (
          <img
            src={thumb}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <Camera className="w-8 h-8 text-gray-600" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className={`absolute inset-0 bg-black/50 transition-opacity duration-200 flex flex-col justify-between p-2 ${hover ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top: price + type badges */}
          <div className="flex items-start justify-between">
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded text-white ${isFree ? 'bg-green-500' : 'bg-[#ec1a58]'}`}>
              {isFree ? 'FREE' : `$${product.price}`}
            </span>
            {isVideo && (
              <span className="bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Video className="w-2.5 h-2.5" /> video
              </span>
            )}
          </div>

          {/* Bottom: title + tags */}
          <div className="bg-gradient-to-t from-black/80 via-black/30 to-transparent -mx-2 -mb-2 px-2 pb-2 pt-6">
            <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight mb-1">{product.title}</p>
            {product.contentCategory && (
              <span className="text-[9px] text-white/70">#{product.contentCategory.toLowerCase().replace(/\s+/g, '')}</span>
            )}
          </div>
        </div>

        {/* Admin select indicator */}
        {isAdmin && isSelected && (
          <div className="absolute top-1 right-1 bg-amber-400 rounded-full p-0.5">
            <CheckSquare className="w-3 h-3 text-gray-900" />
          </div>
        )}

        {/* Lightning badge — always visible, bottom right */}
        {!isFree && !hover && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span>${product.price}</span>
          </div>
        )}
      </div>

      {/* Payment dialog — only for non-admin */}
      {!isAdmin && (
        <PaymentDialog
          product={product}
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}

// ─── Inner component so it can access AdminSelectionContext ───────────────────
function MarketplaceInner() {
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const { data: binsConfig } = useMarketplaceBins();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'all' | 'photos' | 'videos'>('all');

  const isAdmin = user?.pubkey === ADMIN_HEX;
  const { selectedIds, selectedProducts, selectAll, clearAll } = useAdminSelection();
  const [bulkProgress, setBulkProgress] = useState<BulkDownloadProgress | null>(null);

  // Scroll sentinel ref for infinite loading
  const sentinelRef = useRef<HTMLDivElement>(null);

  const visibleBins = (binsConfig?.bins ?? [])
    .filter((b) => b.isVisible)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteMarketplaceProducts({
    search: searchQuery || undefined,
    category: activeType === 'all' ? undefined : activeType,
  });

  // Flatten all pages into a single products array
  const allProducts = useMemo(
    () => infiniteData?.pages.flatMap(p => p.products) ?? [],
    [infiniteData]
  );

  useSeoMeta({
    title: 'Stock Media Marketplace — TravelTelly',
    description: 'Decentralized marketplace for travel photography with Lightning payments.',
  });

  // IntersectionObserver: auto-load next page when sentinel is visible
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Build hashtag cloud from loaded products
  const tagCloud = useMemo(() => {
    if (!allProducts.length) return [];
    const counts = new Map<string, number>();
    for (const p of allProducts) {
      for (const [name, val] of p.event.tags) {
        if (name === 't' && val) {
          counts.set(val, (counts.get(val) || 0) + 1);
        }
      }
      if (p.contentCategory) {
        const slug = p.contentCategory.toLowerCase().replace(/\s+/g, '-');
        counts.set(slug, (counts.get(slug) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag, count]) => ({ tag, count }));
  }, [allProducts]);

  // Filter by active tag and type (client-side, within loaded pages)
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (p.images.length === 0) return false;
      if (activeType === 'photos' && (p.mediaType === 'video' || p.images[0]?.match(/\.(mp4|webm|mov)/i))) return false;
      if (activeType === 'videos' && !(p.mediaType === 'video' || p.images[0]?.match(/\.(mp4|webm|mov)/i))) return false;
      if (activeTag) {
        const tags = p.event.tags.filter(([n]) => n === 't').map(([, v]) => v);
        const catSlug = p.contentCategory?.toLowerCase().replace(/\s+/g, '-');
        if (!tags.includes(activeTag) && catSlug !== activeTag) return false;
      }
      return true;
    });
  }, [allProducts, activeTag, activeType]);

  const ownProducts = isAdmin ? filteredProducts.filter(p => p.seller.pubkey === ADMIN_HEX) : [];

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    try {
      await adminBulkDownload(Array.from(selectedProducts.values()), (p) => setBulkProgress(p));
    } finally {
      setBulkProgress(null);
      clearAll();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      {/* Admin bulk-download sticky toolbar */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white rounded-full px-5 py-3 shadow-2xl border border-amber-500/40">
          <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedIds.size} selected
          </span>
          <Button
            size="sm"
            className="rounded-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold ml-1"
            onClick={handleBulkDownload}
            disabled={bulkProgress !== null}
          >
            {bulkProgress
              ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" />{bulkProgress.done}/{bulkProgress.total}</>
              : <><Download className="w-4 h-4 mr-1.5" />ZIP</>
            }
          </Button>
          {ownProducts.length > 0 && selectedIds.size < ownProducts.length && (
            <Button size="sm" variant="ghost" className="rounded-full text-gray-300 hover:text-white hover:bg-white/10 text-xs" onClick={() => selectAll(ownProducts)}>
              All ({ownProducts.length})
            </Button>
          )}
          <button onClick={clearAll} className="ml-1 text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="container mx-auto px-2 md:px-4 pt-2 pb-3 md:pt-3 md:pb-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Compact header ── */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold leading-none">Marketplace</h1>

                {/* Type pills */}
                <div className="flex items-center gap-1">
                  {(['all', 'photos', 'videos'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setActiveType(t)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeType === t
                          ? 'text-white'
                          : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58]'
                      }`}
                      style={activeType === t ? { backgroundColor: '#ec1a58' } : {}}
                    >
                      {t === 'photos' && <Camera className="w-3 h-3" />}
                      {t === 'videos' && <Video className="w-3 h-3" />}
                      {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Nav pills */}
                {user && (
                  <>
                    <Link to="/marketplace/orders">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58] transition-colors">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="hidden sm:inline">Purchases</span>
                      </button>
                    </Link>
                    <Link to="/marketplace/portfolio">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58] transition-colors">
                        <Store className="w-3 h-3" />
                        <span className="hidden sm:inline">Portfolio</span>
                      </button>
                    </Link>
                    <Link to="/marketplace/gamma">
                      <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58] transition-colors">
                        <Settings2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Seller</span>
                      </button>
                    </Link>
                    <MarketplaceSubscriptionDialog>
                      <button className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        subscription?.isActive
                          ? 'bg-green-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58]'
                      }`}>
                        <Crown className="w-3 h-3" />
                        {subscription?.isActive ? '✓ Unlimited' : 'Subscribe'}
                      </button>
                    </MarketplaceSubscriptionDialog>
                  </>
                )}

                {/* Admin select-all */}
                {isAdmin && ownProducts.length > 0 && (
                  <button
                    onClick={() => selectedIds.size === ownProducts.length ? clearAll() : selectAll(ownProducts)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 border border-amber-400 text-amber-700 hover:bg-amber-50 transition-colors"
                  >
                    <CheckSquare className="w-3 h-3" />
                    {selectedIds.size === ownProducts.length ? 'Deselect' : 'Select all'}
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Travel photography & video · Lightning ⚡</p>
            </div>

            {/* Upload button */}
            {user && (
              <CreateProductDialog>
                <Button size="sm" className="rounded-full text-white font-semibold text-xs flex-shrink-0" style={{ backgroundColor: '#ec1a58' }}>
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span className="hidden sm:inline">Upload</span>
                </Button>
              </CreateProductDialog>
            )}
          </div>

          {/* ── Search bar (compact, single row) ── */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search photos, videos, locations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#ec1a58' } as React.CSSProperties}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ── Hashtag cloud ── */}
          {tagCloud.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setActiveTag(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeTag === null
                    ? 'text-white'
                    : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58]'
                }`}
                style={activeTag === null ? { backgroundColor: '#ec1a58' } : {}}
              >
                All {allProducts.filter(p => p.images.length > 0).length || ''}
              </button>
              {tagCloud.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                    activeTag === tag
                      ? 'text-white'
                      : 'bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58]'
                  }`}
                  style={activeTag === tag ? { backgroundColor: '#ec1a58' } : {}}
                >
                  #{tag} <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* ── Collections (bins) ── */}
          {visibleBins.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <LayoutGrid className="w-4 h-4" style={{ color: '#ec1a58' }} />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Collections</h2>
              </div>
              {visibleBins.map((bin) => (
                <MarketplaceBinSection key={bin.id} bin={bin} />
              ))}
              <hr className="my-5 border-gray-200 dark:border-gray-700" />
            </div>
          )}

          {/* ── Media thumbnail grid ── */}
          {isLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
              {Array.from({ length: 24 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-sm" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground text-sm">Failed to load media. Try another relay?</p>
              <RelaySelector className="w-full max-w-xs mx-auto" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Camera className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground text-sm">
                {activeTag ? `No media tagged #${activeTag}` : 'No media found'}
              </p>
              {activeTag && (
                <button onClick={() => setActiveTag(null)} className="text-xs text-[#ec1a58] underline">
                  Clear filter
                </button>
              )}
              <RelaySelector className="w-full max-w-xs mx-auto" />
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground mb-2">
                {filteredProducts.length}{hasNextPage ? '+' : ''} {activeTag ? `#${activeTag}` : activeType === 'all' ? 'media items' : activeType}
                {activeTag && <button onClick={() => setActiveTag(null)} className="ml-2 text-[#ec1a58]">✕ clear</button>}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
                {filteredProducts.map(product => (
                  <MediaThumb key={product.id} product={product} />
                ))}
              </div>
            </>
          )}

          {/* ── Infinite scroll sentinel ── */}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* ── Relay selector bottom ── */}
          <div className="mt-6 flex justify-center">
            <RelaySelector className="w-full max-w-xs" />
          </div>

        </div>
      </div>

      <Footer showStockMediaPartners={true} />
    </div>
  );
}

// ─── Outer wrapper ────────────────────────────────────────────────────────────
const Marketplace = () => (
  <AdminSelectionProvider>
    <MarketplaceInner />
  </AdminSelectionProvider>
);

export default Marketplace;
