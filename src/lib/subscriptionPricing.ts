/**
 * Single source of truth for marketplace subscription pricing.
 *
 * All subscription entry points (the Nostr "Marketplace Subscription" and the
 * guest "Unlimited Downloads" subscription) share this one USD price. The sat
 * price is derived from the live BTC/USD exchange rate (see
 * @/lib/exchangeRates), which updates regularly, so the sat amount always
 * equals the dollar price in value and moves with the market.
 */

export const SUBSCRIPTION_PRICING = {
  monthlyUsd: 21,
  yearlyUsd: 210,
} as const;

export const MONTHLY_USD = SUBSCRIPTION_PRICING.monthlyUsd;
export const YEARLY_USD = SUBSCRIPTION_PRICING.yearlyUsd;

const SATS_PER_BTC = 100_000_000;

/**
 * Convert a USD amount to sats at the given BTC/USD price.
 * Returns null when the rate is unavailable so callers can fall back to a
 * stable estimate instead of blocking the purchase.
 */
export function usdToSats(usd: number, btcUsd?: number): number | null {
  if (!btcUsd || btcUsd <= 0) return null;
  return Math.round((usd / btcUsd) * SATS_PER_BTC);
}

/**
 * Fallback estimate while the live rate is loading: 1 sat ≈ $0.001 (BTC ≈
 * $100k). Matches the previous static rate so the old behavior is preserved
 * until real-time rates arrive.
 */
export const FALLBACK_SATS_PER_USD = 1000;
