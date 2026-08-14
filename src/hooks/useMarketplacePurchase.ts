import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';

export interface PurchaseOrder {
  id: string;
  productId: string;
  sellerPubkey: string;
  buyerPubkey: string;
  amount: number;
  currency: string;
  message?: string;
  paymentMethod: 'lightning' | 'stripe';
  buyerEmail?: string;
  buyerName?: string;
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface CreatePurchaseOrderRequest {
  productId: string;
  sellerPubkey: string;
  amount: number;
  currency: string;
  message?: string;
  paymentMethod: 'lightning' | 'stripe';
  buyerEmail?: string;
  buyerName?: string;
}

export interface StripePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  orderId: string;
  productTitle: string;
  sellerPubkey: string;
}

export interface StripePaymentIntent {
  client_secret: string;
  id: string;
}

/**
 * URL of the serverless endpoint that creates Stripe Payment Intents.
 * Configure at build time (VITE_STRIPE_PAYMENT_INTENT_URL) or default to the
 * live Netlify function (see netlify/functions/create-payment-intent.mjs).
 *
 * Important: the live site is deployed to GitHub Pages, which serves only
 * static files and CANNOT run serverless functions. So the default must point
 * at the Netlify-hosted function (fully-qualified URL), not the same-origin
 * `/api/create-payment-intent` (which 404s on GitHub Pages). Creating a
 * Payment Intent requires the Stripe *secret* key, which must never live in
 * the client — it stays on the serverless endpoint.
 */
function getPaymentIntentUrl(): string {
  return (
    import.meta.env.VITE_STRIPE_PAYMENT_INTENT_URL ||
    'https://traveltelly.netlify.app/api/create-payment-intent'
  );
}

export function useMarketplacePurchase() {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();

  /**
   * Create a purchase order (NIP-04 encrypted message to seller)
   */
  const createPurchaseOrder = async (request: CreatePurchaseOrderRequest): Promise<PurchaseOrder | null> => {
    if (!user?.signer) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to make purchases.',
        variant: 'destructive',
      });
      return null;
    }

    setIsCreatingOrder(true);

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const order: PurchaseOrder = {
        id: orderId,
        productId: request.productId,
        sellerPubkey: request.sellerPubkey,
        buyerPubkey: user.pubkey,
        amount: request.amount,
        currency: request.currency,
        message: request.message,
        paymentMethod: request.paymentMethod,
        buyerEmail: request.buyerEmail,
        buyerName: request.buyerName,
        status: 'pending',
        createdAt: Math.floor(Date.now() / 1000),
      };

      // Create encrypted order message to seller (NIP-04)
      const orderMessage = {
        type: 0, // New Order (following NIP-15 message types)
        id: orderId,
        name: request.buyerName || 'Anonymous',
        message: request.message || '',
        contact: {
          nostr: user.pubkey,
          email: request.buyerEmail,
        },
        items: [
          {
            product_id: request.productId,
            quantity: 1,
          },
        ],
        payment_method: request.paymentMethod,
        amount: request.amount,
        currency: request.currency,
      };

      // Encrypt the message using NIP-44 if available, fallback to NIP-04
      let encryptedContent: string;
      if (user.signer.nip44) {
        encryptedContent = await user.signer.nip44.encrypt(request.sellerPubkey, JSON.stringify(orderMessage));
      } else {
        // Fallback to NIP-04 (deprecated but more widely supported)
        if (!user.signer.nip04) {
          throw new Error('No encryption method available');
        }
        encryptedContent = await user.signer.nip04.encrypt(request.sellerPubkey, JSON.stringify(orderMessage));
      }

      // Publish encrypted direct message to seller
      await publishEvent({
        kind: 4, // Encrypted Direct Message
        content: encryptedContent,
        tags: [
          ['p', request.sellerPubkey],
          ['subject', `New Order: ${request.productId}`],
        ],
      });

      toast({
        title: 'Order Created',
        description: 'Your purchase order has been sent to the seller.',
      });

      return order;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast({
        title: 'Order Failed',
        description: 'Could not create purchase order. Please try again.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  /**
   * Create a Stripe Payment Intent on the server.
   *
   * The client only ever holds the publishable key; the *secret* key lives on
   * the serverless endpoint that creates the intent. If no endpoint is
   * reachable/configured this throws with a clear message — it never
   * fabricates a fake client secret (a Stripe.js call with a fake secret can
   * never succeed, so a fake intent would only mislead the buyer).
   */
  const createStripePaymentIntent = async (request: StripePaymentIntentRequest): Promise<StripePaymentIntent> => {
    let response: Response;
    try {
      response = await fetch(getPaymentIntentUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          metadata: {
            orderId: request.orderId,
            productTitle: request.productTitle,
            sellerPubkey: request.sellerPubkey,
          },
        }),
      });
    } catch (err) {
      console.error('Stripe payment intent request failed:', err);
      throw new Error('Card checkout is not reachable right now. Please use Lightning ⚡ instead.');
    }

    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json();
        detail = body?.error?.message || body?.message || '';
      } catch { /* ignore */ }
      console.error('Stripe payment intent error', response.status, detail);
      throw new Error(
        detail || 'Card checkout is not configured yet. Please use Lightning ⚡ instead.'
      );
    }

    return await response.json() as StripePaymentIntent;
  };

  /**
   * Update order status (for sellers)
   */
  const updateOrderStatus = async (orderId: string, status: PurchaseOrder['status'], _message?: string): Promise<boolean> => {
    if (!user?.signer) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to update orders.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // This would typically update the order in your database
      // and send a status update message to the buyer

      toast({
        title: 'Order Updated',
        description: `Order ${orderId} status updated to ${status}.`,
      });

      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Update Failed',
        description: 'Could not update order status.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    createPurchaseOrder,
    createStripePaymentIntent,
    updateOrderStatus,
    isCreatingOrder,
  };
}