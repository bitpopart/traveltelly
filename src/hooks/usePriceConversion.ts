import { useMemo } from 'react';
import { useExchangeRates } from './useExchangeRates';

const SATS_PER_BTC = 100000000;

interface PriceInfo {
  primary: string;
  sats: string | null;
  isLoading: boolean;
}

/**
 * Hook to convert prices to sats using real-time exchange rates
 */
export function usePriceConversion(price: string, currency: string): PriceInfo {
  const { data: rates, isLoading } = useExchangeRates();

  const result = useMemo(() => {
    const amount = parseFloat(price);
    
    // Format primary price
    let primary: string;
    if (currency === 'BTC' || currency === 'SATS') {
      primary = `${amount.toLocaleString()} ${currency}`;
    } else {
      try {
        primary = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: currency,
        }).format(amount);
      } catch {
        primary = `${amount} ${currency}`;
      }
    }

    // Calculate sats conversion
    let sats: string | null = null;

    if (!rates) {
      return { primary, sats, isLoading: true };
    }

    const upperCurrency = currency.toUpperCase();

    // If already in BTC or SATS
    if (upperCurrency === 'BTC') {
      const satsAmount = Math.round(amount * SATS_PER_BTC);
      sats = `${satsAmount.toLocaleString()} sats`;
    } else if (upperCurrency === 'SATS') {
      sats = `${Math.round(amount).toLocaleString()} sats`;
    } else {
      // Convert fiat to sats
      const btcPrice = rates[upperCurrency as keyof typeof rates];
      
      if (typeof btcPrice === 'number') {
        const btcAmount = amount / btcPrice;
        const satsAmount = Math.round(btcAmount * SATS_PER_BTC);
        sats = `${satsAmount.toLocaleString()} sats`;
      }
    }

    return { primary, sats, isLoading: false };
  }, [price, currency, rates, isLoading]);

  return result;
}
