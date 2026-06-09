import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PaymentDialog } from '@/components/PaymentDialog';
import { OptimizedImage } from '@/components/OptimizedImage';
import { ShareButton } from '@/components/ShareButton';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceSubscription } from '@/hooks/useMarketplaceSubscription';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { genUserName } from '@/lib/genUserName';
import { embedMetadataIntoJpeg } from '@/lib/imageMetadataWriter';
import { useAdminSelection } from '@/contexts/AdminSelectionContext';
import { MapPin, User, ShoppingCart, Zap, CreditCard, Download, Eye, Camera, Video, Music, Palette, Images, Crown, Loader2, CheckSquare, Square } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

// Admin-only pubkey — only this user sees the download / selection UI
const ADMIN_HEX = nip19.decode('npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642').data as string;

interface ProductCardProps {
  product: MarketplaceProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;
  const { selectedIds, toggle } = useAdminSelection();

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  const profileImage = metadata?.picture;

  // Don't show buy button for own products
  const isOwnProduct = user && user.pubkey === product.seller.pubkey;

  // Admin-only: only the Traveltelly admin pubkey sees the download / selection UI
  const isAdmin = user?.pubkey === ADMIN_HEX;

  // Is this card currently selected for bulk download?
  const isSelected = selectedIds.has(product.id);

  // Extract tags (keywords) from the Nostr event
  const productTags = product.event.tags
    .filter(([name]) => name === 't')
    .map(([, val]) => val)
    .filter(Boolean);

  // Admin single-item download: fetch image, embed metadata, and save
  const handleAdminDownload = async () => {
    if (!product.images[0]) return;
    setIsDownloading(true);
    try {
      const response = await fetch(product.images[0]);
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });

      const enrichedBlob = await embedMetadataIntoJpeg(file, {
        title: product.title,
        description: product.description,
        keywords: productTags,
      });

      // Build a safe filename from the title
      const safeName = product.title
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .slice(0, 60);

      const url = URL.createObjectURL(enrichedBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[Admin Download] Error:', err);
      alert('Download failed. Check the console for details.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Check if this is a free item
  const isFree = product.event.tags.some(tag => tag[0] === 'free' && tag[1] === 'true');

  const priceInfo = usePriceConversion(product.price, product.currency);

  const getCurrencyIcon = (currency: string) => {
    if (currency === 'BTC' || currency === 'SATS') {
      return <Zap className="w-4 h-4 text-yellow-500" />;
    }
    return <CreditCard className="w-4 h-4 text-blue-500" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photos': return <Camera className="w-4 h-4" />;
      case 'videos': return <Video className="w-4 h-4" />;
      case 'audio': return <Music className="w-4 h-4" />;
      case 'graphics':
      case 'illustrations': return <Palette className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  // Generate naddr for the product
  const generateProductNaddr = () => {
    try {
      return nip19.naddrEncode({
        identifier: product.id,
        pubkey: product.seller.pubkey,
        kind: 30402,
      });
    } catch (error) {
      console.error('Failed to encode naddr:', error);
      return '';
    }
  };

  // Admin selection toggle — stop propagation so link doesn't fire
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <>
      <Card
        className={`group hover:shadow-xl transition-all duration-200 overflow-hidden border-0 shadow-sm ${
          isAdmin && isOwnProduct && isSelected
            ? 'ring-2 ring-amber-500 ring-offset-2'
            : ''
        }`}
      >
        <CardHeader className="p-0">
          {/* Product Image */}
          <div className="relative">
            <Link to={`/media/preview/${generateProductNaddr()}`} className="block">
              <div className="relative w-full pb-[100%] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                {product.images.length > 0 ? (
                  <>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-gray-800/90 rounded-full p-2.5 shadow-lg">
                        <Eye className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                      </div>
                    </div>

                    {/* Watermark */}
                    <div className="absolute bottom-2 right-2 text-white/20 text-[10px] font-light select-none pointer-events-none">
                      TravelTelly
                    </div>
                  </>
                ) : null}

                {/* No image fallback */}
                {product.images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                    <ShoppingCart className="w-12 h-12 text-gray-300" />
                  </div>
                )}

                {/* Free badge */}
                {isFree && (
                  <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    🎁 FREE
                  </span>
                )}

                {/* Status badge */}
                {!isFree && product.status !== 'active' && (
                  <Badge
                    variant={product.status === 'sold' ? 'destructive' : 'secondary'}
                    className="absolute top-2 right-2 text-[10px] rounded-full"
                  >
                    {product.status}
                  </Badge>
                )}

                {/* Media type badge */}
                <span className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm capitalize">
                  {getCategoryIcon(product.mediaType || product.category)}
                  {product.mediaType || product.category}
                </span>

                {/* Multi-image indicator */}
                {product.images.length > 1 && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    <Images className="w-3 h-3" />
                    {product.images.length}
                  </span>
                )}
              </div>
            </Link>

            {/* Admin checkbox */}
            {isAdmin && isOwnProduct && product.images.length > 0 && (
              <button
                onClick={handleCheckboxClick}
                className={`absolute bottom-2 right-2 z-10 w-6 h-6 rounded flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-amber-400 text-white shadow-sm'
                    : 'bg-white/80 dark:bg-gray-900/80 text-gray-400 opacity-0 group-hover:opacity-100'
                }`}
                aria-label={isSelected ? 'Deselect photo' : 'Select photo for bulk download'}
              >
                {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pb-3">
          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-[#ec1a58] transition-colors leading-snug">
            {product.title}
          </h3>

          {/* Price */}
          {isFree ? (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base font-bold text-green-600 dark:text-green-400">FREE</span>
              <span className="text-[10px] text-green-600 border border-green-200 dark:border-green-800 rounded-full px-1.5 py-0.5">No payment needed</span>
            </div>
          ) : (
            <div className="mb-2">
              <div className="flex items-center gap-1.5">
                {getCurrencyIcon(product.currency)}
                <span className="text-base font-bold text-gray-900 dark:text-white">{priceInfo.primary}</span>
              </div>
              {priceInfo.sats && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>{priceInfo.sats}</span>
                </div>
              )}
            </div>
          )}

          {/* Description — only 1 line */}
          {product.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
          )}

          {/* Location */}
          {product.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{product.location}</span>
            </div>
          )}

          {/* Seller */}
          <div className="flex items-center gap-2 text-xs">
            <Avatar className="h-5 w-5">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-[9px]">
                <User className="w-2.5 h-2.5" />
              </AvatarFallback>
            </Avatar>
            <Link
              to={`/profile/${product.seller.pubkey}`}
              className="text-muted-foreground hover:text-foreground transition-colors truncate"
            >
              {displayName}
            </Link>
          </div>
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex flex-col gap-2">
          {isOwnProduct ? (
            <>
              <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled>
                Your Media
              </Button>
              {isAdmin && product.images.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs border-amber-400 text-amber-700 hover:bg-amber-50"
                  onClick={handleAdminDownload}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Embedding…</>
                  ) : (
                    <><Download className="w-3.5 h-3.5 mr-1.5" />Download + Metadata</>
                  )}
                </Button>
              )}
            </>
          ) : product.status === 'sold' ? (
            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled>Sold Out</Button>
          ) : product.status === 'inactive' ? (
            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled>Unavailable</Button>
          ) : isFree ? (
            <Button
              size="sm"
              className="w-full rounded-xl text-xs bg-green-600 hover:bg-green-700"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download Free
            </Button>
          ) : subscription?.isActive ? (
            <Button
              size="sm"
              className="w-full rounded-xl text-xs bg-green-600 hover:bg-green-700"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Crown className="w-3.5 h-3.5 mr-1.5" />
              Download (Included)
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full rounded-xl text-xs text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#ec1a58' }}
              onClick={() => setShowPaymentDialog(true)}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              License &amp; Download
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        product={product}
      />
    </>
  );
}
