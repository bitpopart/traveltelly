import { useSeoMeta } from '@unhead/react';
import { useState, useMemo } from 'react';
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ADMIN_HEX } from "@/hooks/useBlossomMedia";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { useMarketplaceSubscription } from "@/hooks/useMarketplaceSubscription";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { MarketplaceSubscriptionDialog } from "@/components/MarketplaceSubscriptionDialog";
import { PaymentDialog } from "@/components/PaymentDialog";
import { AdminSelectionProvider, useAdminSelection } from "@/contexts/AdminSelectionContext";
import { adminBulkDownload } from "@/lib/adminBulkDownload";
import type { BulkDownloadProgress } from "@/lib/adminBulkDownload";
import type { MarketplaceProduct } from "@/hooks/useMarketplaceProducts";
import { useAuthor } from "@/hooks/useAuthor";
import { genUserName } from "@/lib/genUserName";
import { usePriceConversion } from "@/hooks/usePriceConversion";
import {
  Search, Plus, ShoppingCart, Zap, Crown, Download,
  CheckSquare, X, Loader2, MapPin, Camera, Video,
  SlidersHorizontal
} from "lucide-react";
import { Link } from "react-router-dom";
import { nip19 } from "nostr-tools";

// ─── helpers ─────────────────────────────────────────────────────────────────

function generateNaddr(product: MarketplaceProduct): string {
  try {
    return nip19.naddrEncode({ identifier: product.id, pubkey: product.seller.pubkey, kind: 30402 });
  } catch { return ''; }
}

// ─── ShopCard — matches shosho.live shop card style ──────────────────────────

interface ShopCardProps {
  product: MarketplaceProduct;
  isAdmin: boolean;
  isSelected: boolean;
  onToggle: () => void;
}

function ShopCard({ product, isAdmin, isSelected, onToggle }: ShopCardProps) {
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const [showPayment, setShowPayment] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isVideo = product.mediaType === 'videos' || product.category === 'videos';
  const isFree = product.event.tags.some(t => t[0] === 'free' && t[1] === 'true');
  const isOwn = user?.pubkey === product.seller.pubkey;
  const naddr = generateNaddr(product);
  const priceInfo = usePriceConversion(product.price, product.currency);

  const img = product.images[0];

  return (
    <>
      <div
        className={`group relative bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
          isSelected ? 'ring-2 ring-amber-400' : ''
        }`}
        style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
      >
        {/* Image */}
        <Link to={naddr ? `/media/preview/${naddr}` : '#'} className="block">
          <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
            {isVideo ? (
              <video
                src={img}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                muted playsInline preload="metadata"
              />
            ) : imgError || !img ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Camera className="w-10 h-10 text-gray-300" />
              </div>
            ) : (
              <img
                src={img}
                alt={product.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                onError={() => setImgError(true)}
              />
            )}

            {/* Top-left: media type */}
            <div className="absolute top-2 left-2">
              <span className="flex items-center gap-1 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                {isVideo ? <Video className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                {isVideo ? 'Video' : 'Photo'}
              </span>
            </div>

            {/* Top-right: free badge */}
            {isFree && (
              <div className="absolute top-2 right-2">
                <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">FREE</span>
              </div>
            )}

            {/* Multiple images indicator */}
            {product.images.length > 1 && (
              <div className="absolute bottom-2 right-2">
                <span className="bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  +{product.images.length - 1}
                </span>
              </div>
            )}

            {/* Admin checkbox */}
            {isAdmin && isOwn && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onToggle(); }}
                className={`absolute bottom-2 left-2 z-10 w-6 h-6 rounded flex items-center justify-center transition-all ${
                  isSelected ? 'bg-amber-400 text-white' : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            )}
          </div>
        </Link>

        {/* Card body */}
        <div className="p-3">
          {/* Title */}
          <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">{product.title}</p>

          {/* Location */}
          {product.location && (
            <p className="flex items-center gap-1 text-xs text-gray-400 mb-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.location}</span>
            </p>
          )}

          {/* Price + CTA row */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {/* Price */}
            {isFree ? (
              <span className="text-sm font-bold text-green-600">Free</span>
            ) : (
              <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                {product.currency === 'SATS' || product.currency === 'BTC'
                  ? <Zap className="w-3 h-3 text-yellow-500" />
                  : null
                }
                {priceInfo.primary}
              </span>
            )}

            {/* Action */}
            {isOwn ? (
              <span className="text-xs text-gray-400">Your item</span>
            ) : isFree ? (
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#ec1a58' }}
              >
                <Download className="w-3 h-3" />
                Get
              </button>
            ) : subscription?.isActive ? (
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-green-600 px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors"
              >
                <Crown className="w-3 h-3" />
                Download
              </button>
            ) : (
              <button
                onClick={() => setShowPayment(true)}
                className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#ec1a58' }}
              >
                <Download className="w-3 h-3" />
                Buy
              </button>
            )}
          </div>
        </div>
      </div>

      <PaymentDialog isOpen={showPayment} onClose={() => setShowPayment(false)} product={product} />
    </>
  );
}

// ─── Profile header — mirrors shosho.live top area ───────────────────────────

function ProfileHeader() {
  const author = useAuthor(ADMIN_HEX);
  const meta = author.data?.metadata;
  const name = meta?.name ?? genUserName(ADMIN_HEX);
  const banner = meta?.banner;
  const avatar = meta?.picture;
  const about = meta?.about;

  return (
    <div className="mb-8">
      {/* Banner */}
      <div className="relative w-full h-36 sm:h-48 rounded-2xl overflow-hidden bg-gray-200 mb-0">
        {banner ? (
          <img src={banner} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #ec1a58 0%, #ff6b35 100%)' }} />
        )}
      </div>

      {/* Avatar + name row */}
      <div className="flex items-end gap-4 -mt-10 px-4">
        <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200 flex-shrink-0 shadow-md">
          {avatar
            ? <img src={avatar} alt={name} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: '#ec1a58' }}>{name[0]?.toUpperCase()}</div>
          }
        </div>
        <div className="pb-2 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{name}</h1>
          {meta?.nip05 && <p className="text-xs text-gray-400 truncate">{meta.nip05}</p>}
        </div>
      </div>

      {about && (
        <p className="text-sm text-gray-600 mt-3 px-4 line-clamp-3 leading-relaxed">{about}</p>
      )}
    </div>
  );
}

// ─── Main inner component ─────────────────────────────────────────────────────

function MarketplaceInner() {
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const isAdmin = user?.pubkey === ADMIN_HEX;

  const [search, setSearch] = useState('');
  const [mediaType, setMediaType] = useState<'all' | 'photos' | 'videos'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [], isLoading } = useMarketplaceProducts();

  const { selectedIds, selectedProducts, selectAll, clearAll, toggle } = useAdminSelection();
  const [bulkProgress, setBulkProgress] = useState<BulkDownloadProgress | null>(null);

  useSeoMeta({
    title: 'TravelTelly — Stock Media Marketplace',
    description: 'Premium travel photography & video from 88+ countries by Johannes Oppewal. Lightning payments on Nostr.',
  });

  // Filtered products — only show those with images
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (p.images.length === 0) return false;
      const isVideo = p.mediaType === 'videos' || p.category === 'videos';
      if (mediaType === 'photos' && isVideo) return false;
      if (mediaType === 'videos' && !isVideo) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${p.title} ${p.description} ${p.location ?? ''} ${p.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, mediaType, search]);

  const ownProducts = isAdmin ? filtered.filter(p => p.seller.pubkey === ADMIN_HEX) : [];
  const photoCount = products.filter(p => p.images.length > 0 && p.mediaType !== 'videos' && p.category !== 'videos').length;
  const videoCount = products.filter(p => p.images.length > 0 && (p.mediaType === 'videos' || p.category === 'videos')).length;

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;
    try {
      await adminBulkDownload(Array.from(selectedProducts.values()), p => setBulkProgress(p));
    } finally {
      setBulkProgress(null);
      clearAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Admin bulk bar */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white rounded-full px-5 py-3 shadow-2xl border border-amber-500/40">
          <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <Button
            size="sm"
            className="rounded-full bg-amber-500 hover:bg-amber-400 text-gray-900 font-semibold"
            onClick={handleBulkDownload}
            disabled={bulkProgress !== null}
          >
            {bulkProgress
              ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />{bulkProgress.done}/{bulkProgress.total}</>
              : <><Download className="w-4 h-4 mr-1" />ZIP</>}
          </Button>
          {ownProducts.length > 0 && selectedIds.size < ownProducts.length && (
            <button onClick={() => selectAll(ownProducts)} className="text-xs text-gray-300 hover:text-white">
              All ({ownProducts.length})
            </button>
          )}
          <button onClick={clearAll} className="text-gray-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Profile header — shosho.live style */}
        <ProfileHeader />

        {/* Action buttons row */}
        <div className="flex flex-wrap gap-2 mb-6 px-1">
          <MarketplaceSubscriptionDialog>
            <Button
              size="sm"
              className="rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: subscription?.isActive ? '#22c55e' : '#ec1a58' }}
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              {subscription?.isActive ? 'Unlimited ✓' : 'Subscribe'}
            </Button>
          </MarketplaceSubscriptionDialog>

          {user && (
            <CreateProductDialog>
              <Button size="sm" className="rounded-full text-white text-xs font-semibold" style={{ backgroundColor: '#ec1a58' }}>
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Upload
              </Button>
            </CreateProductDialog>
          )}

          <Link to="/marketplace/orders">
            <Button size="sm" variant="outline" className="rounded-full text-xs" style={{ borderColor: '#ec1a58', color: '#ec1a58' }}>
              <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
              My Purchases
            </Button>
          </Link>

          {user && (
            <Link to="/guest-portal">
              <Button size="sm" variant="outline" className="rounded-full text-xs border-yellow-500 text-yellow-700">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                Guest Checkout
              </Button>
            </Link>
          )}
        </div>

        {/* Stats pills */}
        {!isLoading && products.length > 0 && (
          <div className="flex gap-3 mb-5 px-1">
            <button
              onClick={() => setMediaType('all')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                mediaType === 'all'
                  ? 'text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
              style={mediaType === 'all' ? { backgroundColor: '#ec1a58' } : {}}
            >
              All · {products.filter(p => p.images.length > 0).length}
            </button>
            <button
              onClick={() => setMediaType('photos')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                mediaType === 'photos'
                  ? 'text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
              style={mediaType === 'photos' ? { backgroundColor: '#ec1a58' } : {}}
            >
              <Camera className="w-3 h-3" /> Photos · {photoCount}
            </button>
            <button
              onClick={() => setMediaType('videos')}
              className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                mediaType === 'videos'
                  ? 'text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
              style={mediaType === 'videos' ? { backgroundColor: '#ec1a58' } : {}}
            >
              <Video className="w-3 h-3" /> Videos · {videoCount}
            </button>
          </div>
        )}

        {/* Search bar */}
        <div className="flex items-center gap-2 mb-6 px-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search photos, videos, locations…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-white border-gray-200 focus-visible:ring-0 focus-visible:border-gray-300 text-sm h-9"
            />
          </div>
          {isAdmin && ownProducts.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs border-amber-400 text-amber-700 hover:bg-amber-50 shrink-0"
              onClick={() => selectedIds.size === ownProducts.length ? clearAll() : selectAll(ownProducts)}
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1" />
              {selectedIds.size === ownProducts.length ? 'Deselect' : 'Select all'}
            </Button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                <Skeleton className="aspect-square w-full rounded-none" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-1/2 rounded-full" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-4 w-16 rounded-full" />
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            {search ? (
              <>
                <Search className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-2">No results for "{search}"</p>
                <button onClick={() => setSearch('')} className="text-sm underline" style={{ color: '#ec1a58' }}>Clear search</button>
              </>
            ) : (
              <>
                <Camera className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-1">No media yet</p>
                <p className="text-xs text-gray-400">Still loading from relays…</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filtered.map(product => (
              <ShopCard
                key={product.id}
                product={product}
                isAdmin={isAdmin}
                isSelected={selectedIds.has(product.id)}
                onToggle={() => toggle(product)}
              />
            ))}
          </div>
        )}

        {/* Bottom note */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-300 mt-10">
            {filtered.length} items · Powered by Nostr &amp; Lightning ⚡
          </p>
        )}
      </div>

      <Footer showStockMediaPartners={false} />
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
