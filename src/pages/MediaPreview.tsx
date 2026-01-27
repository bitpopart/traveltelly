import { useSeoMeta } from '@unhead/react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/ShareButton";
import { PaymentDialog } from "@/components/PaymentDialog";
import { MediaReviews } from "@/components/MediaReviews";
import { EditMediaDialog } from "@/components/EditMediaDialog";
import { RobustImage } from "@/components/RobustImage";
import { ImageDiagnostic } from "@/components/ImageDiagnostic";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { useAuthor } from "@/hooks/useAuthor";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePriceConversion } from "@/hooks/usePriceConversion";
import { genUserName } from "@/lib/genUserName";
import {
  ArrowLeft,
  Download,
  Eye,
  Heart,
  MapPin,
  User,
  Zap,
  CreditCard,
  Camera,
  Video,
  Music,
  Palette,
  ShoppingCart,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Edit3
} from "lucide-react";
import { nip19 } from 'nostr-tools';

const MediaPreview = () => {
  const { naddr } = useParams<{ naddr: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);

  // Decode naddr to get product details
  const [productId, setProductId] = useState<string | null>(null);
  const [authorPubkey, setAuthorPubkey] = useState<string | null>(null);

  useEffect(() => {
    if (naddr) {
      try {
        const decoded = nip19.decode(naddr);
        if (decoded.type === 'naddr') {
          setProductId(decoded.data.identifier);
          setAuthorPubkey(decoded.data.pubkey);
        }
      } catch (error) {
        console.error('Failed to decode naddr:', error);
      }
    }
  }, [naddr]);

  // Get all products and find the specific one
  const { data: products, isLoading, refetch } = useMarketplaceProducts();
  const product = products?.find(p => p.id === productId && p.seller.pubkey === authorPubkey);

  const author = useAuthor(product?.seller.pubkey || '');
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(product?.seller.pubkey || '');
  const profileImage = metadata?.picture;

  // Don't show buy button for own products
  const isOwnProduct = user && product && user.pubkey === product.seller.pubkey;

  useSeoMeta({
    title: product ? `${product.title} - Media Preview` : 'Media Preview',
    description: product?.description || 'Preview digital media on Nostr Marketplace',
  });

  // Debug logging for images
  if (product) {
    console.log('🖼️ MediaPreview Debug - Product images:', product.images);
    console.log('🖼️ MediaPreview Debug - Product event tags:', product.event.tags);
    console.log('🖼️ MediaPreview Debug - Current image index:', currentImageIndex);
    console.log('🖼️ MediaPreview Debug - Current image URL:', product.images[currentImageIndex]);
    console.log('🖼️ MediaPreview Debug - Image exists:', !!product.images[currentImageIndex]);

    // Test each image URL
    product.images.forEach((url, idx) => {
      if (url) {
        const testImg = new Image();
        testImg.onload = () => console.log(`✅ Image ${idx + 1} is valid:`, url);
        testImg.onerror = () => console.error(`❌ Image ${idx + 1} is invalid:`, url);
        testImg.src = url;
      } else {
        console.error(`❌ Image ${idx + 1} is empty or null`);
      }
    });
  }

  const priceInfo = usePriceConversion(product?.price || '0', product?.currency || 'USD');

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

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images.length) return;

    if (direction === 'prev') {
      setCurrentImageIndex(prev =>
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev =>
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }

    // Reset zoom and rotation when changing images
    setImageZoom(1);
    setImageRotation(0);
  };

  // Ensure currentImageIndex is within bounds and image exists
  React.useEffect(() => {
    if (product?.images.length) {
      if (currentImageIndex >= product.images.length || currentImageIndex < 0) {
        console.log('🔄 Resetting image index from', currentImageIndex, 'to 0');
        setCurrentImageIndex(0);
      } else if (!product.images[currentImageIndex]) {
        console.log('🔄 Current image URL is invalid, resetting to 0');
        setCurrentImageIndex(0);
      }
    }
  }, [product?.images, currentImageIndex]);

  const handleZoom = (direction: 'in' | 'out') => {
    setImageZoom(prev => {
      if (direction === 'in') {
        return Math.min(prev + 0.25, 3);
      } else {
        return Math.max(prev - 0.25, 0.5);
      }
    });
  };

  const handleRotate = () => {
    setImageRotation(prev => (prev + 90) % 360);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-8 w-32 mb-6" />
            <div className="grid lg:grid-cols-2 gap-8">
              <Skeleton className="aspect-square rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Media Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The requested media could not be found or may have been removed.
            </p>
            <Link to="/marketplace">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Back Button */}
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Media Preview Section */}
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                      {product.images.length > 0 && product.images[currentImageIndex] ? (
                        <div className="relative w-full h-full overflow-hidden">
                          {/* Watermarked Image */}
                          <div
                            className="relative w-full h-full transition-transform duration-200"
                            style={{
                              transform: `scale(${imageZoom}) rotate(${imageRotation}deg)`
                            }}
                          >
                            <RobustImage
                              src={product.images[currentImageIndex]}
                              alt={`${product.title} - Image ${currentImageIndex + 1}`}
                              className="w-full h-full object-contain"
                              onLoad={() => {
                                console.log('✅ Preview image loaded successfully:', product.images[currentImageIndex]);
                              }}
                              onError={(error) => {
                                console.error('❌ Preview image failed to load:', product.images[currentImageIndex]);
                                console.error('❌ Error:', error);
                                console.error('❌ Current index:', currentImageIndex);
                                console.error('❌ Total images:', product.images.length);
                                console.error('❌ All images:', product.images);
                              }}
                              retryAttempts={3}
                              retryDelay={1500}
                              fallbackIcon={<ShoppingCart className="w-16 h-16 text-gray-400" />}
                            />

                            {/* TravelTelly Watermark Overlay - Very subtle and transparent */}
                            <div className="absolute inset-0 pointer-events-none">
                              {/* Multiple very small and transparent TravelTelly watermarks scattered across the image */}
                              <div className="absolute top-4 left-4 text-white/8 text-xs font-light transform -rotate-12 select-none">
                                TravelTelly
                              </div>
                              <div className="absolute top-1/4 right-8 text-white/6 text-xs font-light transform rotate-12 select-none">
                                TravelTelly
                              </div>
                              <div className="absolute bottom-1/3 left-8 text-white/8 text-xs font-light transform -rotate-12 select-none">
                                TravelTelly
                              </div>
                              <div className="absolute bottom-4 right-4 text-white/6 text-xs font-light transform rotate-12 select-none">
                                TravelTelly
                              </div>
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/4 text-sm font-light select-none">
                                TravelTelly
                              </div>

                              {/* Very subtle diagonal watermarks */}
                              <div className="absolute top-1/3 left-1/4 text-black/2 text-xs font-light transform rotate-45 select-none">
                                TravelTelly.com
                              </div>
                              <div className="absolute bottom-1/4 right-1/4 text-black/2 text-xs font-light transform -rotate-45 select-none">
                                TravelTelly.com
                              </div>

                              {/* Additional scattered small watermarks */}
                              <div className="absolute top-16 right-1/3 text-white/3 text-xs font-light transform rotate-6 select-none">
                                TravelTelly
                              </div>
                              <div className="absolute bottom-16 left-1/3 text-white/3 text-xs font-light transform -rotate-6 select-none">
                                TravelTelly
                              </div>

                              {/* Center brand watermark */}
                              <div className="absolute top-2/3 left-1/3 text-white/3 text-xs font-light transform rotate-15 select-none">
                                🌍 TravelTelly
                              </div>
                            </div>
                          </div>

                          {/* Image Navigation */}
                          {product.images.length > 1 && (
                            <>
                              <button
                                onClick={() => handleImageNavigation('prev')}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                              >
                                <ArrowLeft className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleImageNavigation('next')}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                              >
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                              </button>
                            </>
                          )}

                          {/* Image Controls */}
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            <button
                              onClick={() => handleZoom('out')}
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded transition-colors"
                              disabled={imageZoom <= 0.5}
                            >
                              <ZoomOut className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleZoom('in')}
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded transition-colors"
                              disabled={imageZoom >= 3}
                            >
                              <ZoomIn className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleRotate}
                              className="bg-black/50 hover:bg-black/70 text-white p-1.5 rounded transition-colors"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Image Counter */}
                          {product.images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                              {currentImageIndex + 1} / {product.images.length}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 text-sm">No preview available</p>
                            {process.env.NODE_ENV === 'development' && (
                              <div className="mt-2 text-xs text-gray-400">
                                <p>Images: {product.images.length}</p>
                                <p>Current index: {currentImageIndex}</p>
                                <p>Valid image: {product.images[currentImageIndex] ? 'Yes' : 'No'}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Thumbnail Strip */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {product.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentImageIndex(index);
                          setImageZoom(1);
                          setImageRotation(0);
                        }}
                        className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                          index === currentImageIndex
                            ? 'border-blue-500'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <RobustImage
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                          retryAttempts={1}
                          retryDelay={500}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details Section */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="capitalize flex items-center gap-1">
                            {getCategoryIcon(product.category)}
                            {product.category}
                          </Badge>
                          {product.status !== 'active' && (
                            <Badge
                              variant={product.status === 'sold' ? 'destructive' : 'secondary'}
                            >
                              {product.status}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-2xl">{product.title}</CardTitle>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {getCurrencyIcon(product.currency)}
                            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {priceInfo?.primary}
                            </span>
                          </div>
                          {priceInfo?.sats && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              <span>{priceInfo.sats}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    {product.description && (
                      <div>
                        <h3 className="font-semibold mb-2">Description</h3>
                        <p className="text-muted-foreground whitespace-pre-wrap">
                          {product.description}
                        </p>
                      </div>
                    )}

                    {/* Location */}
                    {product.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{product.location}</span>
                      </div>
                    )}

                    {/* Seller Info */}
                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-3">Seller</h3>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={profileImage} alt={displayName} />
                          <AvatarFallback>
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Link
                            to={`/profile/${product.seller.pubkey}`}
                            className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {displayName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            Digital Media Creator
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-4">
                      {isOwnProduct ? (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => setShowEditDialog(true)}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Media
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

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Heart className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <ShareButton
                          url={`/media/preview/${naddr}`}
                          title={product.title}
                          description={product.description || `Stock media - ${priceInfo?.primary || 'Available'}`}
                          image={product.images[0]}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Purchase Info for all users */}
                    {!user && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground mb-3">
                          💡 No account required! Purchase instantly with Lightning payment.
                        </p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>⚡ Pay with Bitcoin Lightning Network</p>
                          <p>📧 Download link sent to your email</p>
                          <p>🔒 Secure and instant transactions</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Additional Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Media Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Images:</span>
                      <span>{product.images.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Listed:</span>
                      <span>{new Date(product.createdAt * 1000).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">License:</span>
                      <span>Standard Commercial</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Debug Info for Development */}
                {process.env.NODE_ENV === 'development' && (
                  <>
                    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                      <CardHeader>
                        <CardTitle className="text-yellow-800 dark:text-yellow-200 text-lg">
                          🔍 Debug Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-yellow-700 dark:text-yellow-300 space-y-2">
                        <div>
                          <strong>Product ID:</strong> {product.id}
                        </div>
                        <div>
                          <strong>Event ID:</strong> {product.event.id}
                        </div>
                        <div>
                          <strong>Images found:</strong> {product.images.length}
                        </div>
                        {product.images.length > 0 && (
                          <div>
                            <strong>Image URLs:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {product.images.map((img, idx) => (
                                <li key={idx} className="break-all text-xs">
                                  {idx + 1}: {img}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div>
                          <strong>Image tags in event:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {product.event.tags
                              .filter(([name]) => ['image', 'img', 'photo', 'picture', 'url', 'imeta'].includes(name))
                              .map((tag, idx) => (
                                <li key={idx} className="break-all text-xs">
                                  {tag[0]}: {tag[1]}
                                </li>
                              ))}
                          </ul>
                        </div>
                        <div>
                          <strong>Current image index:</strong> {currentImageIndex}
                        </div>
                        <div>
                          <strong>Is own product:</strong> {isOwnProduct ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <strong>Current displaying:</strong> {product.images[currentImageIndex] || 'No image'}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Image Diagnostic Tool */}
                    <ImageDiagnostic images={product.images} title={product.title} />
                  </>
                )}

                {/* Media Reviews Section */}
                <MediaReviews
                  productEventId={product.event.id}
                  productTitle={product.title}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        product={product}
      />

      {/* Edit Media Dialog */}
      {isOwnProduct && (
        <EditMediaDialog
          isOpen={showEditDialog}
          onClose={() => setShowEditDialog(false)}
          product={product}
          onUpdate={() => {
            // Trigger a refetch of the product data
            refetch();
          }}
        />
      )}
    </>
  );
};

export default MediaPreview;