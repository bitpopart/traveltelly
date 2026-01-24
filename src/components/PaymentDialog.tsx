import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LightningMarketplacePayment } from '@/components/LightningMarketplacePayment';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatPriceWithSats } from '@/lib/priceConversion';
import { Zap, CreditCard, ShoppingCart, User, MapPin, Package } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
}

export function PaymentDialog({ isOpen, onClose, product }: PaymentDialogProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'lightning' | 'stripe'>('lightning');
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  const profileImage = metadata?.picture;

  const priceInfo = formatPriceWithSats(product.price, product.currency);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            License Stock Media
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* No login required - anyone can purchase */}
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

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Choose Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as 'lightning' | 'stripe')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="lightning"
                        className="flex items-center gap-2"
                      >
                        <Zap className="w-4 h-4" />
                        Lightning
                        <Badge variant="secondary" className="ml-1">Recommended</Badge>
                      </TabsTrigger>
                      <TabsTrigger
                        value="stripe"
                        className="flex items-center gap-2"
                        disabled={true}
                      >
                        <CreditCard className="w-4 h-4" />
                        Card/Bank
                        <Badge variant="outline" className="ml-1">Coming Soon</Badge>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="lightning" className="mt-6">
                      <LightningMarketplacePayment product={product} onSuccess={onClose} />
                    </TabsContent>

                    <TabsContent value="stripe" className="mt-6">
                      <div className="text-center py-6">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-muted-foreground">
                          Traditional payment methods are coming soon.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          For now, please use Lightning payment for instant, low-fee transactions.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

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