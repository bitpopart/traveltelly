import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLightningZap } from '@/hooks/useLightningZap';
import { useMarketplacePurchase } from '@/hooks/useMarketplacePurchase';
import { useToast } from '@/hooks/useToast';
import { Zap, Loader2, CheckCircle } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface LightningPaymentProps {
  product: MarketplaceProduct;
  onSuccess: () => void;
}

export function LightningPayment({ product, onSuccess }: LightningPaymentProps) {
  const [message, setMessage] = useState('');
  const [paymentStep, setPaymentStep] = useState<'form' | 'invoice' | 'success'>('form');
  const [isProcessing, setIsProcessing] = useState(false);

  const { sendZap, isZapping } = useLightningZap();
  const { createPurchaseOrder } = useMarketplacePurchase();
  const { toast } = useToast();

  const amountSats = product.currency === 'SATS'
    ? parseInt(product.price)
    : Math.round(parseFloat(product.price) * 100000000); // Convert BTC to sats

  const handleCreateInvoice = async () => {
    setIsProcessing(true);
    try {
      // Create a purchase order first
      const order = await createPurchaseOrder({
        productId: product.id,
        sellerPubkey: product.seller.pubkey,
        amount: amountSats,
        currency: 'SATS',
        message: message.trim(),
        paymentMethod: 'lightning',
      });

      if (!order) {
        throw new Error('Failed to create purchase order');
      }

      // For Lightning payments, we'll use the zap functionality
      // but adapt it for marketplace purchases
      const success = await sendZap({
        amount: amountSats,
        comment: `Purchase: ${product.title}${message ? ` - ${message}` : ''}`,
        recipientPubkey: product.seller.pubkey,
        eventId: product.event.id,
      });

      if (success) {
        setPaymentStep('success');
        toast({
          title: 'Payment Sent! ⚡',
          description: 'Your Lightning payment has been sent. The seller will be notified.',
        });

        // Auto-close after success
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('Lightning payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'Could not process Lightning payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };



  if (paymentStep === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
          Payment Successful! ⚡
        </h3>
        <p className="text-muted-foreground mb-4">
          Your Lightning payment has been sent to the creator.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• The creator has been notified of your license purchase</p>
          <p>• Download links will be sent via encrypted Nostr message</p>
          <p>• Check your purchases page for download access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <span className="font-medium">Lightning Payment</span>
            </div>
            <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-300">
              {amountSats.toLocaleString()} sats
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Fast, low-fee Bitcoin payment via Lightning Network
          </p>
        </CardContent>
      </Card>

      {/* Message to Seller */}
      <div className="space-y-2">
        <Label htmlFor="message">Message to Creator (optional)</Label>
        <Textarea
          id="message"
          placeholder="Add licensing questions or a note to the creator..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={280}
        />
        <p className="text-xs text-muted-foreground">
          {message.length}/280 characters
        </p>
      </div>

      {/* Payment Instructions */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>How Lightning payment works:</strong>
          <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
            <li>Click "Pay with Lightning" to generate an invoice</li>
            <li>Pay the invoice with your Lightning wallet or WebLN extension</li>
            <li>Payment confirmation will be posted to Nostr automatically</li>
            <li>The creator will send download links via encrypted message</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Payment Button */}
      <div className="flex gap-3">
        <Button
          onClick={handleCreateInvoice}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700"
          disabled={isProcessing || isZapping}
        >
          {isProcessing || isZapping ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Pay with Lightning
            </>
          )}
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 <strong>WebLN:</strong> If you have a WebLN extension, payment will be automatic.</p>
        <p>📱 <strong>Mobile:</strong> The invoice will be copied to clipboard for your wallet app.</p>
        <p>🔒 <strong>Security:</strong> Lightning payments are irreversible once confirmed.</p>
      </div>
    </div>
  );
}