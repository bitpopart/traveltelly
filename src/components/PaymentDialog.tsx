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
import {
  Zap, CreditCard, ShoppingCart, User, MapPin, Package, Crown, Download, Info
} from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
}

export function PaymentDialog({ isOpen, onClose, product }: PaymentDialogProps) {
  const isFree = product.event.tags.some(t => t[0] === 'free' && t[1] === 'true');

  // Default to lightning for logged-in users, guest for everyone else
  const { user } = useCurrentUser();
  const defaultTab = isFree ? 'guest' : user ? 'lightning' : 'guest';
  const [activeTab, setActiveTab] = useState<'lightning' | 'guest' | 'card'>(defaultTab);

  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const [guestEmail, setGuestEmail] = useState<string | null>(null);
  const { hasAccess: guestHasAccess } = useCustomerAccess(guestEmail);
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  const profileImage = metadata?.picture;
  const priceInfo = usePriceConversion(product.price, product.currency);

  const hasUnlimitedAccess = subscription?.isActive || guestHasAccess;

  const stripeEnabled = localStorage.getItem('traveltelly_stripe_enabled') !== 'false';
  const stripeKey = localStorage.getItem('traveltelly_stripe_publishable_key') || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
  const stripeConfigured = stripeKey.startsWith('pk_live_') || stripeKey.startsWith('pk_test_');

  // Handle direct subscription download
  const handleSubscriptionDownload = () => {
    if (product.images.length > 0) {
      const link = document.createElement('a');
      link.href = product.images[0];
      link.download = `${product.title.replace(/\s+/g, '-')}.jpg`;
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
              <><Crown className="w-5 h-5 text-yellow-600" /> Download Media</>
            ) : isFree ? (
              <><Download className="w-5 h-5 text-green-600" /> Free Download</>
            ) : (
              <><ShoppingCart className="w-5 h-5 text-blue-600" /> License Stock Media</>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Access banner */}
          {hasUnlimitedAccess && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <Crown className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Subscription Active</strong> — This download is included in your unlimited plan!
              </AlertDescription>
            </Alert>
          )}

          {/* Product summary card */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                  {product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                  {product.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                      <MapPin className="w-3 h-3" /><span>{product.location}</span>
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  {isFree ? (
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">FREE</div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{priceInfo.primary}</div>
                      {priceInfo.sats && (
                        <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground mt-1">
                          <Zap className="w-3 h-3 text-yellow-500" /><span>{priceInfo.sats}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Badge variant="secondary" className="mt-1 capitalize text-xs">
                    {product.mediaType || product.category}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={profileImage} alt={displayName} />
                  <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">By {displayName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{product.seller.pubkey.slice(0, 10)}…</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment section */}
          {subscription?.isActive ? (
            /* Subscriber download */
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" /> Download (Subscription)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-4">
                <Crown className="w-14 h-14 mx-auto text-yellow-500 mb-3" />
                <p className="font-semibold mb-1">Included in your unlimited plan</p>
                <p className="text-sm text-muted-foreground mb-5">Click below to download this media</p>
                <Button onClick={handleSubscriptionDownload} size="lg" className="bg-green-600 hover:bg-green-700">
                  <Download className="w-4 h-4 mr-2" /> Download Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Payment tabs */
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {isFree ? 'Get Your Free Download' : 'Choose Payment Method'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                  {/* Tab bar — only show payment tabs relevant to what's available */}
                  {!isFree && (
                    <div className="px-6 pt-2">
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="lightning" className="flex items-center gap-1.5 text-sm">
                          <Zap className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Lightning</span>
                          <span className="sm:hidden">⚡</span>
                        </TabsTrigger>
                        <TabsTrigger value="guest" className="flex items-center gap-1.5 text-sm">
                          <User className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Guest</span>
                          <span className="sm:hidden">👤</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="card"
                          className="flex items-center gap-1.5 text-sm"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Card</span>
                          {!stripeEnabled && <span className="text-xs text-muted-foreground ml-1">(off)</span>}
                        </TabsTrigger>
                      </TabsList>
                    </div>
                  )}

                  {/* Lightning tab — available to all, no Nostr required */}
                  <TabsContent value="lightning" className="px-6 pb-6 pt-4">
                    {/* Lightning works for guests too via LightningMarketplacePayment */}
                    <LightningMarketplacePayment product={product} onSuccess={onClose} />
                  </TabsContent>

                  {/* Guest tab — email + Lightning OR card selection */}
                  <TabsContent value="guest" className={`${isFree ? 'px-6 pb-6' : 'px-6 pb-6 pt-4'}`}>
                    <GuestCheckout
                      product={product}
                      onPurchaseComplete={(email, method) => {
                        setGuestEmail(email);
                        onClose();
                      }}
                      onCancel={onClose}
                    />
                  </TabsContent>

                  {/* Card tab */}
                  <TabsContent value="card" className="px-6 pb-6 pt-4">
                    {!stripeEnabled ? (
                      <Alert className="border-gray-200">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Card payments are currently disabled by the admin. Use Lightning ⚡ or Guest checkout instead.
                        </AlertDescription>
                      </Alert>
                    ) : !stripeConfigured ? (
                      <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/10">
                        <Info className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 dark:text-amber-200">
                          <strong>Card payments not configured.</strong> The admin needs to add a Stripe key in{' '}
                          <strong>Admin → Payments → Stripe</strong>. Use <strong>Lightning ⚡</strong> in the meantime.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      /* Stripe IS configured — use Guest checkout card flow */
                      <GuestCheckout
                        product={product}
                        onPurchaseComplete={(email, method) => {
                          setGuestEmail(email);
                          onClose();
                        }}
                        onCancel={onClose}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Info footer */}
          <div className="text-xs text-muted-foreground space-y-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p>⚡ <strong>Lightning:</strong> Instant Bitcoin payments to traveltelly@primal.net</p>
            <p>💳 <strong>Card:</strong> Secure card payments via Stripe (when configured)</p>
            <p>📁 <strong>Delivery:</strong> Downloads available immediately after payment.</p>
            <p>📄 <strong>License:</strong> Royalty-free license included with every purchase.</p>
            <p>📧 <strong>Support:</strong> traveltelly@primal.net — include your order ID.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
