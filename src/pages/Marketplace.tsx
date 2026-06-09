import { useSeoMeta } from '@unhead/react';
import { useState, useMemo } from 'react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBlossomMedia, ADMIN_HEX, type BlossomMediaItem } from "@/hooks/useBlossomMedia";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { useMarketplaceSubscription } from "@/hooks/useMarketplaceSubscription";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { MarketplaceSubscriptionDialog } from "@/components/MarketplaceSubscriptionDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { AdminSelectionProvider, useAdminSelection } from "@/contexts/AdminSelectionContext";
import { adminBulkDownload } from "@/lib/adminBulkDownload";
import type { BulkDownloadProgress } from "@/lib/adminBulkDownload";
import type { MarketplaceProduct } from "@/hooks/useMarketplaceProducts";
import {
  Search, Plus, Store, Zap, CreditCard, Camera, Video, Crown,
  Download, CheckSquare, X, Loader2, Eye, MapPin, RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import { nip19 } from "nostr-tools";

// ─── constants ───────────────────────────────────────────────────────────────

const BLOSSOM_SERVERS_DISPLAY = [
  'blossom.nostr.build',
  'blossom.primal.net',
  'cdn.satellite.earth',
];

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function matchBlobToProduct(
  blob: BlossomMediaItem,
  products: MarketplaceProduct[]
): MarketplaceProduct | undefined {
  return products.find((p) =>
    p.images.some((imgUrl) => imgUrl.includes(blob.sha256))
  );
}

function generateNaddr(product: MarketplaceProduct): string {
  try {
    return nip19.naddrEncode({
      identifier: product.id,
      pubkey: product.seller.pubkey,
      kind: 30402,
    });
  } catch {
    return '';
  }
}

// ─── MediaCard ───────────────────────────────────────────────────────────────

interface MediaCardProps {
  blob: BlossomMediaItem;
  product?: MarketplaceProduct;
  isAdmin: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}

function MediaCard({ blob, product, isAdmin, isSelected, onToggleSelect }: MediaCardProps) {
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const [showPayment, setShowPayment] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isFree = product?.event.tags.some((t) => t[0] === 'free' && t[1] === 'true') ?? false;
  const isVideo = blob.kind === 'video';
  const naddr = product ? generateNaddr(product) : '';

  return (
    <>
      <div
        className={`group relative bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border ${
          isSelected ? 'ring-2 ring-amber-500 border-amber-300' : 'border-gray-200 dark:border-gray-700'
        }`}
      >
        {/* Thumbnail */}
        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
          {isVideo ? (
            <video
              src={blob.url}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              muted
              playsInline
              preload="metadata"
            />
          ) : imgError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Camera className="w-8 h-8" />
              <span className="text-xs">Image unavailable</span>
            </div>
          ) : (
            <img
              src={blob.url}
              alt={product?.title ?? 'Travel media'}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              {naddr ? (
                <Link to={`/media/preview/${naddr}`} className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2.5 hover:bg-white transition-colors">
                  <Eye className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </Link>
              ) : (
                <a href={blob.url} target="_blank" rel="noopener noreferrer" className="bg-white/90 dark:bg-gray-800/90 rounded-full p-2.5 hover:bg-white transition-colors">
                  <Eye className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </a>
              )}
            </div>
          </div>

          {/* Watermark */}
          <div className="absolute bottom-1.5 right-2 text-white/20 text-[10px] font-light select-none pointer-events-none">
            TravelTelly
          </div>

          {/* Media type badge */}
          <div className="absolute top-2 left-2 pointer-events-none">
            <Badge className="text-[10px] py-0 px-1.5 bg-black/60 text-white border-0 backdrop-blur-sm flex items-center gap-1">
              {isVideo ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
              {isVideo ? 'Video' : 'Photo'}
            </Badge>
          </div>

          {/* Price / Free badge */}
          <div className="absolute top-2 right-2 pointer-events-none">
            {isFree ? (
              <Badge className="bg-green-600 text-white border-0 text-[10px] py-0 px-1.5">FREE</Badge>
            ) : product ? (
              <Badge className="bg-black/60 text-white border-0 text-[10px] py-0 px-1.5 backdrop-blur-sm flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-yellow-400" />
                {product.price} {product.currency}
              </Badge>
            ) : null}
          </div>

          {/* Admin selection checkbox */}
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
              className={`absolute bottom-2 left-2 z-10 rounded p-0.5 transition-all ${
                isSelected
                  ? 'text-amber-500 bg-white/95 dark:bg-gray-900/95'
                  : 'text-gray-400 bg-white/80 dark:bg-gray-900/80 opacity-0 group-hover:opacity-100'
              }`}
              aria-label={isSelected ? 'Deselect' : 'Select for download'}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1 mb-1">
            {product?.title ?? (isVideo ? 'Travel Video' : 'Travel Photo')}
          </h3>

          {product?.location ? (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
              {formatSize(blob.size)}
            </p>
          )}

          {/* CTA */}
          {product ? (
            isFree ? (
              <Button
                size="sm"
                className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => setShowPayment(true)}
              >
                <Download className="w-3 h-3 mr-1" />
                Download Free
              </Button>
            ) : subscription?.isActive ? (
              <Button
                size="sm"
                className="w-full h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => setShowPayment(true)}
              >
                <Crown className="w-3 h-3 mr-1" />
                Download (Included)
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full h-7 text-xs text-white"
                style={{ backgroundColor: '#ec1a58' }}
                onClick={() => setShowPayment(true)}
              >
                <Download className="w-3 h-3 mr-1" />
                License &amp; Download
              </Button>
            )
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs"
              asChild
            >
              <a href={blob.url} target="_blank" rel="noopener noreferrer">
                <Eye className="w-3 h-3 mr-1" />
                View Full Size
              </a>
            </Button>
          )}
        </div>
      </div>

      {product && (
        <PaymentDialog
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          product={product}
        />
      )}
    </>
  );
}

// ─── Inner page component ─────────────────────────────────────────────────────

function MarketplaceInner() {
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const isAdmin = user?.pubkey === ADMIN_HEX;

  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'image' | 'video'>('all');

  // Blossom — primary source (relay-independent)
  const { data: blossomItems = [], isLoading: blossomLoading, error: blossomError, refetch } = useBlossomMedia(ADMIN_HEX);

  // Nostr products — enriches with title, price, location, etc.
  const { data: products = [] } = useMarketplaceProducts();

  // Admin bulk-download
  const { selectedIds, selectedProducts, selectAll, clearAll, toggle } = useAdminSelection();
  const [bulkProgress, setBulkProgress] = useState<BulkDownloadProgress | null>(null);

  useSeoMeta({
    title: 'Stock Media Marketplace — TravelTelly',
    description: 'Premium travel photography & video from 88+ countries by Johannes Oppewal. Lightning payments. Served from Blossom.',
  });

  // Merge Blossom blobs with Nostr product metadata
  const enrichedItems = useMemo(() => {
    return blossomItems.map((blob) => ({
      blob,
      product: matchBlobToProduct(blob, products),
    }));
  }, [blossomItems, products]);

  // Apply filters
  const filtered = useMemo(() => {
    return enrichedItems.filter(({ blob, product }) => {
      if (mediaTypeFilter !== 'all' && blob.kind !== mediaTypeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = [
          product?.title ?? '',
          product?.description ?? '',
          product?.location ?? '',
          product?.category ?? '',
        ].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [enrichedItems, mediaTypeFilter, searchQuery]);

  const photoCount = blossomItems.filter((b) => b.kind === 'image').length;
  const videoCount = blossomItems.filter((b) => b.kind === 'video').length;

  // Products visible for bulk-download (admin)
  const adminProducts: MarketplaceProduct[] = isAdmin
    ? filtered.map(({ product }) => product).filter((p): p is MarketplaceProduct => !!p)
    : [];

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

      {/* Admin bulk-download bar */}
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
              : <><Download className="w-4 h-4 mr-1.5" />Download ZIP</>
            }
          </Button>
          {adminProducts.length > 0 && selectedIds.size < adminProducts.length && (
            <Button
              size="sm"
              variant="ghost"
              className="rounded-full text-gray-300 hover:text-white hover:bg-white/10 text-xs"
              onClick={() => selectAll(adminProducts)}
            >
              Select all ({adminProducts.length})
            </Button>
          )}
          <button onClick={clearAll} className="ml-1 text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="p-4 rounded-full w-fit mx-auto mb-4" style={{ backgroundColor: '#ec1a5820' }}>
            <Store className="w-14 h-14" style={{ color: '#ec1a58' }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Stock Media Marketplace
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-5">
            Premium travel photography &amp; video from 88+ countries.<br className="hidden sm:inline" />
            Served directly from Blossom — always available, relay-independent.
          </p>

          {/* Live stats */}
          {!blossomLoading && blossomItems.length > 0 && (
            <div className="flex flex-wrap justify-center gap-5 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4" style={{ color: '#ec1a58' }} />
                <strong className="text-gray-800 dark:text-white">{photoCount}</strong> photos
              </span>
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4" style={{ color: '#ec1a58' }} />
                <strong className="text-gray-800 dark:text-white">{videoCount}</strong> videos
              </span>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3">
            <MarketplaceSubscriptionDialog>
              <Button
                size="lg"
                className="rounded-full text-white font-semibold hover:opacity-90"
                style={{ backgroundColor: subscription?.isActive ? '#22c55e' : '#ec1a58' }}
              >
                <Crown className="w-4 h-4 mr-2" />
                {subscription?.isActive ? 'Unlimited Access ✓' : 'Subscribe for Unlimited'}
              </Button>
            </MarketplaceSubscriptionDialog>

            {user && (
              <CreateProductDialog>
                <Button size="lg" className="rounded-full text-white font-semibold hover:opacity-90" style={{ backgroundColor: '#ec1a58' }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </CreateProductDialog>
            )}

            <Link to="/marketplace/orders">
              <Button variant="outline" size="lg" className="rounded-full" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                <Download className="w-4 h-4 mr-2" />
                My Purchases
              </Button>
            </Link>

            {user && (
              <Link to="/marketplace/portfolio">
                <Button variant="outline" size="lg" className="rounded-full" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
                  <Store className="w-4 h-4 mr-2" />
                  My Portfolio
                </Button>
              </Link>
            )}

            {isAdmin && adminProducts.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-amber-500 text-amber-700 hover:bg-amber-50"
                onClick={() => selectedIds.size === adminProducts.length ? clearAll() : selectAll(adminProducts)}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {selectedIds.size === adminProducts.length ? 'Deselect all' : `Select all (${adminProducts.length})`}
              </Button>
            )}
          </div>
        </div>

        {/* Feature strip */}
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ffcc00' }}>
                <Zap className="w-5 h-5 text-black fill-current" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">⚡ Lightning Payments</p>
                <p className="text-xs text-gray-500">Instant Bitcoin micropayments</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-full shrink-0" style={{ backgroundColor: '#ec1a58' }}>
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">💳 Fiat Payments</p>
                <p className="text-xs text-gray-500">USD, EUR and more</p>
              </div>
            </CardContent>
          </Card>

          <Link to="/guest-portal" className="block">
            <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:shadow-md transition-shadow h-full">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-2.5 rounded-full shrink-0 bg-yellow-500">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">👑 Unlimited Subscription</p>
                  <p className="text-xs text-gray-500">All downloads — no Nostr needed</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Search & filter bar */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search photos, videos, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={mediaTypeFilter} onValueChange={(v) => setMediaTypeFilter(v as typeof mediaTypeFilter)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Media" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">📁 All Media ({blossomItems.length})</SelectItem>
                <SelectItem value="image">📸 Photos ({photoCount})</SelectItem>
                <SelectItem value="video">🎥 Videos ({videoCount})</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => refetch()}
              title="Refresh from Blossom servers"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          {(searchQuery || mediaTypeFilter !== 'all') && (
            <p className="text-xs text-gray-400 mt-2 pl-1">
              Showing {filtered.length} of {blossomItems.length} items
            </p>
          )}
        </div>

        {/* Gallery */}
        {blossomLoading ? (
          <div>
            <div className="flex items-center gap-2 mb-5">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#ec1a58' }} />
              <span className="text-sm text-gray-500">Loading media from Blossom servers…</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-7 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : blossomError && blossomItems.length === 0 ? (
          <div className="text-center py-20">
            <Camera className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-4">Could not reach Blossom servers. Please check your connection.</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 mb-2">No media matches your search.</p>
            <Button variant="ghost" onClick={() => { setSearchQuery(''); setMediaTypeFilter('all'); }}>
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {searchQuery || mediaTypeFilter !== 'all' ? 'Search Results' : 'All Media'}
              </h2>
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map(({ blob, product }) => (
                <MediaCard
                  key={blob.sha256}
                  blob={blob}
                  product={product}
                  isAdmin={isAdmin}
                  isSelected={!!product && selectedIds.has(product.id)}
                  onToggleSelect={() => product && toggle(product)}
                />
              ))}
            </div>
          </>
        )}

        {/* Footer note */}
        {!blossomLoading && blossomItems.length > 0 && (
          <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600 space-y-1">
            <p>Media served directly from decentralised Blossom storage — relay-independent &amp; always accessible.</p>
            <p>Servers: {BLOSSOM_SERVERS_DISPLAY.join(' · ')}</p>
          </div>
        )}
      </div>

      <Footer showStockMediaPartners={true} />
    </div>
  );
}

// ─── Outer wrapper ─────────────────────────────────────────────────────────────

const Marketplace = () => (
  <AdminSelectionProvider>
    <MarketplaceInner />
  </AdminSelectionProvider>
);

export default Marketplace;
