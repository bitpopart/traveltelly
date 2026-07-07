/**
 * Gamma Spec - Order Messaging (NIP-17: Kind 14, 16, 17)
 *
 * Orders use NIP-17 encrypted DMs:
 * - Kind 14: General communication
 * - Kind 16: Order processing (type 1=create, 2=payment, 3=status, 4=shipping)
 * - Kind 17: Payment receipts
 */
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { generateOrderId, type GammaOrderMessage, type OrderItem, type PaymentDetail, type OrderStatus, type ShippingStatus } from '@/lib/gammaSpec';

export interface OrderThread {
  orderId: string;
  merchantPubkey: string;
  buyerPubkey: string;
  messages: OrderMessage[];
  latestStatus?: OrderStatus;
  latestShippingStatus?: ShippingStatus;
  createdAt: number;
  updatedAt: number;
}

export interface OrderMessage {
  eventId: string;
  kind: 14 | 16 | 17;
  type?: string; // "1" | "2" | "3" | "4" for kind 16
  fromPubkey: string;
  toPubkey: string;
  orderId?: string;
  subject?: string;
  content: string;
  createdAt: number;
  status?: OrderStatus;
  shippingStatus?: ShippingStatus;
  payments?: PaymentDetail[];
  items?: OrderItem[];
  amountSats?: string;
  trackingNumber?: string;
  carrier?: string;
  eta?: number;
}

/**
 * Parse an order message event (kind 14, 16, or 17)
 */
function parseOrderMessage(event: { id: string; kind: number; pubkey: string; created_at: number; content: string; tags: string[][] }): OrderMessage | null {
  if (![14, 16, 17].includes(event.kind)) return null;

  const getTag = (name: string) => event.tags.find(([n]) => n === name)?.[1];
  const toPubkey = getTag('p');
  if (!toPubkey) return null;

  const msg: OrderMessage = {
    eventId: event.id,
    kind: event.kind as 14 | 16 | 17,
    type: getTag('type'),
    fromPubkey: event.pubkey,
    toPubkey,
    orderId: getTag('order'),
    subject: getTag('subject'),
    content: event.content,
    createdAt: event.created_at,
    status: getTag('status') as OrderStatus | undefined,
    shippingStatus: getTag('status') as ShippingStatus | undefined,
    amountSats: getTag('amount'),
    trackingNumber: getTag('tracking'),
    carrier: getTag('carrier'),
    eta: getTag('eta') ? parseInt(getTag('eta')!) : undefined,
  };

  // Parse payment details
  const paymentTags = event.tags.filter(([n]) => n === 'payment');
  if (paymentTags.length > 0) {
    msg.payments = paymentTags.map(tag => ({
      medium: tag[1] as PaymentDetail['medium'],
      reference: tag[2] || '',
      proof: tag[3],
    }));
  }

  // Parse order items
  const itemTags = event.tags.filter(([n]) => n === 'item');
  if (itemTags.length > 0) {
    msg.items = itemTags.map(tag => ({
      productRef: tag[1] || '',
      quantity: tag[2] || '1',
    }));
  }

  return msg;
}

/**
 * Hook: fetch all order messages for the current user
 * Queries kind 14, 16, 17 where user is sender OR recipient
 */
export function useGammaOrders() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['gamma-orders', user?.pubkey],
    queryFn: async (c) => {
      if (!user) return [];
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(15000)]);

      // Fetch messages sent by user and messages received by user
      const [sentEvents, receivedEvents] = await Promise.allSettled([
        nostr.query([{
          kinds: [14, 16, 17],
          authors: [user.pubkey],
          limit: 500,
        }], { signal }),
        nostr.query([{
          kinds: [14, 16, 17],
          '#p': [user.pubkey],
          limit: 500,
        }], { signal }),
      ]);

      const allEvents = [
        ...(sentEvents.status === 'fulfilled' ? sentEvents.value : []),
        ...(receivedEvents.status === 'fulfilled' ? receivedEvents.value : []),
      ];

      // Deduplicate by event id
      const seen = new Map<string, typeof allEvents[0]>();
      for (const e of allEvents) {
        if (!seen.has(e.id)) seen.set(e.id, e);
      }

      const messages: OrderMessage[] = [];
      for (const event of seen.values()) {
        const msg = parseOrderMessage(event);
        if (msg) messages.push(msg);
      }

      // Group by orderId into threads
      const threadMap = new Map<string, OrderThread>();
      for (const msg of messages) {
        if (!msg.orderId) continue;
        const threadKey = msg.orderId;

        if (!threadMap.has(threadKey)) {
          const isBuyer = msg.fromPubkey === user.pubkey;
          threadMap.set(threadKey, {
            orderId: msg.orderId,
            merchantPubkey: isBuyer ? msg.toPubkey : msg.fromPubkey,
            buyerPubkey: isBuyer ? msg.fromPubkey : msg.toPubkey,
            messages: [],
            createdAt: msg.createdAt,
            updatedAt: msg.createdAt,
          });
        }

        const thread = threadMap.get(threadKey)!;
        thread.messages.push(msg);
        if (msg.createdAt > thread.updatedAt) thread.updatedAt = msg.createdAt;

        // Track latest status
        if (msg.status && msg.kind === 16 && msg.type === '3') {
          thread.latestStatus = msg.status;
        }
        if (msg.shippingStatus && msg.kind === 16 && msg.type === '4') {
          thread.latestShippingStatus = msg.shippingStatus as ShippingStatus;
        }
      }

      const threads = Array.from(threadMap.values());
      threads.forEach(t => t.messages.sort((a, b) => a.createdAt - b.createdAt));
      threads.sort((a, b) => b.updatedAt - a.updatedAt);
      return threads;
    },
    enabled: !!user,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

/**
 * Hook: actions for order messaging
 */
export function useGammaOrderActions() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  /**
   * Send an order creation message (type 1) to a merchant
   */
  const createOrder = async (params: {
    merchantPubkey: string;
    items: OrderItem[];
    amountSats: string;
    shippingRef?: string;
    shippingAddress?: string;
    customerEmail?: string;
    customerPhone?: string;
    notes?: string;
  }): Promise<string> => {
    if (!user) throw new Error('Not logged in');

    const orderId = generateOrderId();
    const subject = `Order #${orderId.slice(6, 14).toUpperCase()}`;

    const tags: string[][] = [
      ['p', params.merchantPubkey],
      ['subject', subject],
      ['type', '1'],
      ['order', orderId],
      ['amount', params.amountSats],
    ];

    params.items.forEach(item => {
      tags.push(['item', item.productRef, item.quantity]);
    });

    if (params.shippingRef) tags.push(['shipping', params.shippingRef]);
    if (params.shippingAddress) tags.push(['address', params.shippingAddress]);
    if (params.customerEmail) tags.push(['email', params.customerEmail]);
    if (params.customerPhone) tags.push(['phone', params.customerPhone]);

    await publishEvent({
      kind: 16,
      content: params.notes || '',
      tags,
    });

    return orderId;
  };

  /**
   * Send a payment receipt (kind 17) after paying
   */
  const sendPaymentReceipt = async (params: {
    merchantPubkey: string;
    orderId: string;
    amountSats: string;
    payment: PaymentDetail;
  }) => {
    if (!user) throw new Error('Not logged in');

    const tags: string[][] = [
      ['p', params.merchantPubkey],
      ['subject', 'order-receipt'],
      ['order', params.orderId],
      ['amount', params.amountSats],
      ['payment', params.payment.medium, params.payment.reference, ...(params.payment.proof ? [params.payment.proof] : [])],
    ];

    await publishEvent({
      kind: 17,
      content: 'Payment sent',
      tags,
    });
  };

  /**
   * Update order status (merchant sends type 3)
   */
  const updateOrderStatus = async (params: {
    buyerPubkey: string;
    orderId: string;
    status: OrderStatus;
    message?: string;
  }) => {
    if (!user) throw new Error('Not logged in');

    await publishEvent({
      kind: 16,
      content: params.message || '',
      tags: [
        ['p', params.buyerPubkey],
        ['subject', 'order-info'],
        ['type', '3'],
        ['order', params.orderId],
        ['status', params.status],
      ],
    });
  };

  /**
   * Send shipping update (merchant sends type 4)
   */
  const sendShippingUpdate = async (params: {
    buyerPubkey: string;
    orderId: string;
    shippingStatus: ShippingStatus;
    trackingNumber?: string;
    carrier?: string;
    eta?: number;
    message?: string;
  }) => {
    if (!user) throw new Error('Not logged in');

    const tags: string[][] = [
      ['p', params.buyerPubkey],
      ['subject', 'shipping-info'],
      ['type', '4'],
      ['order', params.orderId],
      ['status', params.shippingStatus],
    ];
    if (params.trackingNumber) tags.push(['tracking', params.trackingNumber]);
    if (params.carrier) tags.push(['carrier', params.carrier]);
    if (params.eta) tags.push(['eta', String(params.eta)]);

    await publishEvent({
      kind: 16,
      content: params.message || '',
      tags,
    });
  };

  /**
   * Send a general message about an order (kind 14)
   */
  const sendMessage = async (params: {
    recipientPubkey: string;
    orderId?: string;
    message: string;
  }) => {
    if (!user) throw new Error('Not logged in');

    await publishEvent({
      kind: 14,
      content: params.message,
      tags: [
        ['p', params.recipientPubkey],
        ...(params.orderId ? [['subject', params.orderId]] : []),
      ],
    });
  };

  return {
    createOrder,
    sendPaymentReceipt,
    updateOrderStatus,
    sendShippingUpdate,
    sendMessage,
  };
}

/**
 * Hook: messages in a specific order thread
 */
export function useGammaOrderThread(orderId: string | undefined) {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['gamma-order-thread', orderId, user?.pubkey],
    queryFn: async (c) => {
      if (!user || !orderId) return [];
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const events = await nostr.query([{
        kinds: [14, 16, 17],
        '#order': [orderId],
        limit: 100,
      }], { signal });

      const messages: OrderMessage[] = [];
      for (const event of events) {
        const msg = parseOrderMessage(event);
        if (msg) messages.push(msg);
      }

      messages.sort((a, b) => a.createdAt - b.createdAt);
      return messages;
    },
    enabled: !!(user && orderId),
    staleTime: 15_000,
    refetchInterval: 30_000,
  });
}
