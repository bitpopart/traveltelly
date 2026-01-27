/**
 * @deprecated This file uses static exchange rates. 
 * Use @/lib/exchangeRates and @/hooks/usePriceConversion instead for real-time rates.
 * 
 * Kept for backward compatibility only.
 */

const APPROXIMATE_BTC_PRICES = {
  USD: 100000, // $100k per BTC (fallback only)
  EUR: 92000,  // €92k per BTC (fallback only)
  GBP: 78000,  // £78k per BTC (fallback only)
} as const;

const SATS_PER_BTC = 100000000; // 100 million sats = 1 BTC

/**
 * @deprecated Use convertToSats from @/lib/exchangeRates instead
 */
export function convertToSats(amount: number, currency: string): number | null {
  const upperCurrency = currency.toUpperCase();
  
  // If already in BTC or SATS, return as is
  if (upperCurrency === 'BTC') {
    return Math.round(amount * SATS_PER_BTC);
  }
  
  if (upperCurrency === 'SATS') {
    return Math.round(amount);
  }
  
  // Get BTC price for the currency
  const btcPrice = APPROXIMATE_BTC_PRICES[upperCurrency as keyof typeof APPROXIMATE_BTC_PRICES];
  
  if (!btcPrice) {
    return null; // Unsupported currency
  }
  
  // Convert: amount in fiat / price per BTC = BTC amount
  // BTC amount * sats per BTC = sats
  const btcAmount = amount / btcPrice;
  const satsAmount = btcAmount * SATS_PER_BTC;
  
  return Math.round(satsAmount);
}

/**
 * @deprecated Use formatSats from @/lib/exchangeRates instead
 */
export function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}

/**
 * @deprecated Use usePriceConversion hook instead
 */
export function formatPriceWithSats(price: string, currency: string): {
  primary: string;
  sats: string | null;
} {
  const amount = parseFloat(price);
  
  // Format primary price
  let primary: string;
  if (currency === 'BTC' || currency === 'SATS') {
    primary = `${amount.toLocaleString()} ${currency}`;
  } else {
    primary = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
  
  // Calculate sats conversion for fiat currencies
  const satsAmount = convertToSats(amount, currency);
  const sats = satsAmount ? formatSats(satsAmount) : null;
  
  return { primary, sats };
}
