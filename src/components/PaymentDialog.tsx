import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LightningMarketplacePayment } from '@/components/LightningMarketplacePayment';
import { GuestCheckout } from '@/components/GuestCheckout';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceSubscription } from '@/hooks/useMarketplaceSubscription';
import { useCustomerAccess } from '@/hooks/useCustomers';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { genUserName } from '@/lib/genUserName';
import { Zap, CreditCard, ShoppingCart, User, MapPin, Package, Crown, Download, Check } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
}

export function PaymentDialog({ isOpen, onClose, product }: PaymentDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'lightning' | 'stripe' | 'guest'>('lightning');
  const [guestEmail, setGuestEmail] = useState<string | null>(null);
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const { hasAccess: guestHasAccess } = useCustomerAccess(guestEmail);
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  const profileImage = metadata?.picture;

  const priceInfo = usePriceConversion(product.price, product.currency);
  
  // Check if user has access (either Nostr subscription or guest subscription)
  const hasUnlimitedAccess = subscription?.isActive || guestHasAccess;

  // Handle subscription download
  const handleSubscriptionDownload = () => {
    // Trigger download directly
    if (product.images.length > 0) {
      const link = document.createElement('a');
      link.href = product.images[0];
      link.download = `${product.title}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {subscription?.isActive ? (
              <>
                <Crown className="w-5 h-5 text-yellow-600" />
                Download Media
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                License Stock Media
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Subscription Download */}
          {hasUnlimitedAccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <Crown className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Subscription Active</strong> - Download included with your unlimited subscription!
              </AlertDescription>
            </Alert>
          )}
              {/* Product Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">License Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {product.description}
                      </p>
                      {product.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                          <MapPin className="w-3 h-3" />
                          <span>{product.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {priceInfo.primary}
                      </div>
                      {priceInfo.sats && (
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mt-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          <span>{priceInfo.sats}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className="mt-1 capitalize">
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Seller Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profileImage} alt={displayName} />
                      <AvatarFallback>
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Created by {displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        Nostr: {product.seller.pubkey.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods or Subscription Download */}
              {subscription?.isActive ? (
                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Download className="w-5 h-5 text-green-600" />
                      Download Media
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center py-6">
                      <Crown className="w-16 h-16 mx-auto text-yellow-600 mb-4" />
                      <p className="text-lg font-semibold mb-2">
                        Free Download with Subscription
                      </p>
                      <p className="text-sm text-muted-foreground mb-6">
                        This download is included with your unlimited subscription
                      </p>
                      <Button 
                        onClick={handleSubscriptionDownload}
                        size="lg"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Choose Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as 'lightning' | 'stripe' | 'guest')}>
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger
                          value="lightning"
                          className="flex items-center gap-1"
                        >
                          <Zap className="w-4 h-4" />
                          <span className="hidden sm:inline">Lightning</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="guest"
                          className="flex items-center gap-1"
                        >
                          <User className="w-4 h-4" />
                          <span className="hidden sm:inline">Guest</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="stripe"
                          className="flex items-center gap-1"
                          disabled={true}
                        >
                          <CreditCard className="w-4 h-4" />
                          <span className="hidden sm:inline">Card</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="lightning" className="mt-6">
                        {user ? (
                          <LightningMarketplacePayment product={product} onSuccess={onClose} />
                        ) : (
                          <div className="space-y-4">
                            <Alert>
                              <Zap className="w-4 h-4" />
                              <AlertDescription>
                                Lightning payment requires a Nostr account with a Lightning address.
                                Use <strong>Guest Checkout</strong> tab for email-based purchase.
                              </AlertDescription>
                            </Alert>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="guest" className="mt-6">
                        <GuestCheckout
                          productTitle={product.title}
                          price={product.price}
                          currency={product.currency}
                          onPurchaseComplete={(email, paymentMethod) => {
                            setGuestEmail(email);
                            // TODO: Record purchase
                            onClose();
                          }}
                          onCancel={onClose}
                        />
                      </TabsContent>

                      <TabsContent value="stripe" className="mt-6">
                        <div className="text-center py-6">
                          <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-muted-foreground">
                            Traditional payment methods are coming soon.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Use <strong>Guest Checkout</strong> tab for email-based purchase with Lightning/fiat options.
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}

          {/* Payment Info */}
          <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p>🔒 <strong>Secure Payment:</strong> All payments are processed securely via Lightning Network.</p>
            <p>⚡ <strong>Lightning:</strong> Instant, low-fee Bitcoin payments to traveltelly@primal.net</p>
            <p>📁 <strong>Delivery:</strong> Download links sent to your email within minutes.</p>
            <p>📄 <strong>License:</strong> Standard royalty-free license included with purchase.</p>
            <p>🛡️ <strong>No Account Required:</strong> Purchase instantly without creating an account.</p>
            <p>📧 <strong>Support:</strong> Contact traveltelly@primal.net for any questions.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}