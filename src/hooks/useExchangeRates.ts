import { useQuery } from '@tanstack/react-query';
import { getExchangeRates, type ExchangeRates } from '@/lib/exchangeRates';

/**
 * Hook to get current BTC exchange rates with automatic caching and updates
 */
export function useExchangeRates() {
  return useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRates,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
