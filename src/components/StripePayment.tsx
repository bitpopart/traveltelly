import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketplacePurchase } from '@/hooks/useMarketplacePurchase';
import { useToast } from '@/hooks/useToast';
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

// Initialize Stripe (you'll need to set your publishable key)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface StripePaymentProps {
  product: MarketplaceProduct;
  onSuccess: () => void;
}

interface PaymentFormProps extends StripePaymentProps {
  clientSecret?: string;
}

function PaymentForm({ product, onSuccess }: PaymentFormProps) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState(product.currency);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const stripe = useStripe();
  const elements = useElements();
  const { createPurchaseOrder, createStripePaymentIntent } = useMarketplacePurchase();
  const { toast } = useToast();

  const amount = parseFloat(product.price);
  const supportedCurrencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create purchase order first
      const order = await createPurchaseOrder({
        productId: product.id,
        sellerPubkey: product.seller.pubkey,
        amount: amount * 100, // Convert to cents
        currency: currency,
        message: message.trim(),
        paymentMethod: 'stripe',
        buyerEmail: email,
        buyerName: name,
      });

      if (!order) {
        throw new Error('Failed to create purchase order');
      }

      // Create Stripe payment intent
      const paymentIntent = await createStripePaymentIntent({
        amount: amount * 100, // Stripe expects cents
        currency: currency.toLowerCase(),
        orderId: order.id,
        productTitle: product.title,
        sellerPubkey: product.seller.pubkey,
      });

      if (!paymentIntent?.client_secret) {
        throw new Error('Failed to create payment intent');
      }

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent: confirmedPayment } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: name,
              email: email,
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        toast({
          title: 'Payment Failed',
          description: error.message || 'Please check your card details and try again.',
          variant: 'destructive',
        });
      } else if (confirmedPayment.status === 'succeeded') {
        setPaymentSucceeded(true);
        toast({
          title: 'Payment Successful! 💳',
          description: 'Your payment has been processed. The seller will be notified.',
        });

        // Auto-close after success
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setPaymentError(errorMessage);
      toast({
        title: 'Payment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentSucceeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-2">
          Payment Successful! 💳
        </h3>
        <p className="text-muted-foreground mb-4">
          Your payment has been processed successfully.
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• The creator has been notified of your license purchase</p>
          <p>• You'll receive an email confirmation shortly</p>
          <p>• Download links will be sent via encrypted Nostr message</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Card Payment</span>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="text-blue-700 dark:text-blue-300">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency,
                }).format(amount)}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Secure payment via Stripe
          </p>
        </CardContent>
      </Card>

      {/* Currency Selection */}
      <div className="space-y-2">
        <Label htmlFor="currency">Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {supportedCurrencies.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {curr} - {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: curr,
                }).format(amount)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Buyer Information */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Card Details */}
      <div className="space-y-2">
        <Label>Card Details *</Label>
        <div className="p-3 border rounded-md">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>
      </div>

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

      {/* Error Display */}
      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Payment Button */}
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700"
        disabled={!stripe || isProcessing || !name || !email}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Pay {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: currency,
            }).format(amount)}
          </>
        )}
      </Button>

      {/* Security Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>🔒 <strong>Secure:</strong> Your payment information is encrypted and secure.</p>
        <p>💳 <strong>Stripe:</strong> Payments processed by Stripe, a trusted payment provider.</p>
        <p>📧 <strong>Receipt:</strong> You'll receive an email confirmation after payment.</p>
      </div>
    </form>
  );
}

export function StripePayment({ product, onSuccess }: StripePaymentProps) {
  // Check if Stripe is configured
  if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Stripe not configured:</strong> Card payments are not available.
          Please contact the administrator or use Lightning payment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentForm product={product} onSuccess={onSuccess} />
    </Elements>
  );
}