import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

// Subscription event kind (using kind 7001 for marketplace subscription)
const SUBSCRIPTION_KIND = 7001;

// Admin pubkey (TravelTelly)
const ADMIN_PUBKEY = '7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35';

// Free subscription pubkey (BitpopArt)
const FREE_SUBSCRIPTION_PUBKEY = '404623cc512b83074bc3019b196ce0a632a61d7d1d16ca991c435cc988473060';

export interface Subscription {
  type: 'monthly' | 'yearly' | 'free';
  startDate: number;
  expiryDate: number;
  isActive: boolean;
  event?: NostrEvent;
}

/**
 * Check if a user has an active marketplace subscription
 */
export function useMarketplaceSubscription(userPubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['marketplace-subscription', userPubkey],
    queryFn: async (c) => {
      if (!userPubkey) return null;

      // Check if this is the free subscription user (BitpopArt)
      if (userPubkey === FREE_SUBSCRIPTION_PUBKEY) {
        return {
          type: 'free' as const,
          startDate: Date.now() / 1000,
          expiryDate: Number.MAX_SAFE_INTEGER,
          isActive: true,
        };
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query for subscription events from admin
      const events = await nostr.query(
        [
          {
            kinds: [SUBSCRIPTION_KIND],
            authors: [ADMIN_PUBKEY],
            '#p': [userPubkey],
            limit: 10,
          },
        ],
        { signal }
      );

      if (events.length === 0) return null;

      // Get the most recent subscription event
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0];

      const type = latestEvent.tags.find(([name]) => name === 'subscription_type')?.[1] as 'monthly' | 'yearly' | 'free';
      const startDateStr = latestEvent.tags.find(([name]) => name === 'start_date')?.[1];
      const expiryDateStr = latestEvent.tags.find(([name]) => name === 'expiry_date')?.[1];

      if (!type || !startDateStr || !expiryDateStr) return null;

      const startDate = parseInt(startDateStr);
      const expiryDate = parseInt(expiryDateStr);
      const now = Date.now() / 1000;

      return {
        type,
        startDate,
        expiryDate,
        isActive: now >= startDate && now <= expiryDate,
        event: latestEvent,
      };
    },
    enabled: !!userPubkey,
  });
}

/**
 * Get all active subscriptions (admin only)
 */
export function useAllSubscriptions() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['all-subscriptions'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query all subscription events
      const events = await nostr.query(
        [
          {
            kinds: [SUBSCRIPTION_KIND],
            authors: [ADMIN_PUBKEY],
            limit: 500,
          },
        ],
        { signal }
      );

      // Group by user pubkey and get latest for each
      const subscriptionsByUser = new Map<string, NostrEvent>();

      events.forEach((event) => {
        const userPubkey = event.tags.find(([name]) => name === 'p')?.[1];
        if (!userPubkey) return;

        const existing = subscriptionsByUser.get(userPubkey);
        if (!existing || event.created_at > existing.created_at) {
          subscriptionsByUser.set(userPubkey, event);
        }
      });

      // Parse subscriptions
      const subscriptions: Array<{
        userPubkey: string;
        subscription: Subscription;
      }> = [];

      const now = Date.now() / 1000;

      subscriptionsByUser.forEach((event, userPubkey) => {
        const type = event.tags.find(([name]) => name === 'subscription_type')?.[1] as 'monthly' | 'yearly' | 'free';
        const startDateStr = event.tags.find(([name]) => name === 'start_date')?.[1];
        const expiryDateStr = event.tags.find(([name]) => name === 'expiry_date')?.[1];

        if (!type || !startDateStr || !expiryDateStr) return;

        const startDate = parseInt(startDateStr);
        const expiryDate = parseInt(expiryDateStr);

        subscriptions.push({
          userPubkey,
          subscription: {
            type,
            startDate,
            expiryDate,
            isActive: now >= startDate && now <= expiryDate,
            event,
          },
        });
      });

      // Add free subscription user
      subscriptions.push({
        userPubkey: FREE_SUBSCRIPTION_PUBKEY,
        subscription: {
          type: 'free',
          startDate: Date.now() / 1000,
          expiryDate: Number.MAX_SAFE_INTEGER,
          isActive: true,
        },
      });

      return subscriptions;
    },
  });
}

/**
 * Calculate subscription pricing in satoshis
 */
export function getSubscriptionPrice(type: 'monthly' | 'yearly'): number {
  // Prices in USD
  const MONTHLY_USD = 21;
  const YEARLY_USD = 210; // 10 months price

  // Approximate BTC/USD rate (this should ideally come from an exchange rate API)
  // For now, using a rough estimate of 100k USD/BTC = 1 sat = 0.001 USD
  const SAT_PER_USD = 1000;

  return type === 'monthly' 
    ? MONTHLY_USD * SAT_PER_USD 
    : YEARLY_USD * SAT_PER_USD;
}

/**
 * Format subscription expiry date
 */
export function formatExpiryDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
