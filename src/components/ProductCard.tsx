import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PaymentDialog } from '@/components/PaymentDialog';
import { RobustImage } from '@/components/RobustImage';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { MapPin, User, ShoppingCart, Zap, CreditCard, Download, Eye, Camera, Video, Music, Palette } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface ProductCardProps {
  product: MarketplaceProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { user } = useCurrentUser();
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;

  // Debug logging for product images
  console.log('🖼️ ProductCard Debug:', {
    title: product.title,
    imageCount: product.images.length,
    images: product.images,
    firstImage: product.images[0],
    hasImages: product.images.length > 0
  });

  // Test if first image URL is valid
  if (product.images.length > 0) {
    const testImg = new Image();
    testImg.onload = () => console.log('✅ Image URL is valid:', product.images[0]);
    testImg.onerror = () => console.error('❌ Image URL is invalid:', product.images[0]);
    testImg.src = product.images[0];
  }

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  const profileImage = metadata?.picture;

  // Don't show buy button for own products
  const isOwnProduct = user && user.pubkey === product.seller.pubkey;

  const formatPrice = (price: string, currency: string) => {
    const amount = parseFloat(price);
    if (currency === 'BTC' || currency === 'SATS') {
      return `${amount.toLocaleString()} ${currency}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden">
        <CardHeader className="p-0">
          {/* Product Image - Clickable */}
          <Link to={`/media/preview/${generateProductNaddr()}`} className="block">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 relative overflow-hidden cursor-pointer">
              {product.images.length > 0 ? (
                <div className="relative w-full h-full">
                  <RobustImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onLoad={() => {
                      console.log('✅ Product image loaded successfully:', product.images[0]);
                    }}
                    onError={(error) => {
                      console.error('❌ Product image failed to load:', product.images[0]);
                      console.error('❌ Product:', product.title);
                      console.error('❌ All images:', product.images);
                      console.error('❌ Error:', error);
                    }}
                    retryAttempts={2}
                    retryDelay={1000}
                  />

                  {/* Preview Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-gray-800/90 rounded-full p-3">
                      <Eye className="w-6 h-6 text-gray-800 dark:text-gray-200" />
                    </div>
                  </div>



                  {/* Very small TravelTelly watermark on thumbnail */}
                  <div className="absolute bottom-2 right-2 text-white/15 text-xs font-light select-none">
                    TravelTelly
                  </div>
                </div>
              ) : null}

              {/* No images fallback */}
              <div className={`w-full h-full flex items-center justify-center ${product.images.length > 0 ? 'hidden' : ''}`}>
                <div className="text-center">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs text-gray-500">No preview available</p>
                </div>
              </div>

              {/* Status Badge */}
              {product.status !== 'active' && (
                <Badge
                  variant={product.status === 'sold' ? 'destructive' : 'secondary'}
                  className="absolute top-2 right-2"
                >
                  {product.status}
                </Badge>
              )}

              {/* Media Type Badge */}
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 capitalize flex items-center gap-1"
              >
                {getCategoryIcon(product.mediaType || product.category)}
                {product.mediaType || product.category}
              </Badge>

              {/* Content Category Badge */}
              {product.contentCategory && (
                <Badge
                  variant="outline"
                  className="absolute top-12 left-2 text-xs bg-white/90 dark:bg-gray-800/90"
                >
                  🏷️ {product.contentCategory}
                </Badge>
              )}

              {/* Debug Info in Development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {product.images.length} img{product.images.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </Link>
        </CardHeader>

        <CardContent className="p-4">
          {/* Title and Price */}
          <div className="space-y-2 mb-3">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {product.title}
            </h3>
            <div className="flex items-center gap-2">
              {getCurrencyIcon(product.currency)}
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatPrice(product.price, product.currency)}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Location */}
          {product.location && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />
              <span>{product.location}</span>
            </div>
          )}

          {/* Seller Info */}
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-6 w-6">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback className="text-xs">
                <User className="w-3 h-3" />
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

        <CardFooter className="p-4 pt-0">
          {isOwnProduct ? (
            <Button variant="outline" className="w-full" disabled>
              Your Media
            </Button>
          ) : product.status === 'sold' ? (
            <Button variant="outline" className="w-full" disabled>
              Sold Out
            </Button>
          ) : product.status === 'inactive' ? (
            <Button variant="outline" className="w-full" disabled>
              Unavailable
            </Button>
          ) : (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowPaymentDialog(true)}
            >
              <Download className="w-4 h-4 mr-2" />
              License & Download
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