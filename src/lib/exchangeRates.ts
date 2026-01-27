/**
 * Bitcoin exchange rate management with daily updates
 * Uses public APIs to fetch current BTC/fiat exchange rates
 */

const SATS_PER_BTC = 100000000; // 100 million sats = 1 BTC
const CACHE_KEY = 'btc-exchange-rates';
const CACHE_TIMESTAMP_KEY = 'btc-exchange-rates-timestamp';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Fallback rates if API fails
const FALLBACK_RATES = {
  USD: 100000,
  EUR: 92000,
  GBP: 78000,
} as const;

export interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  timestamp: number;
}

/**
 * Fetches current BTC exchange rates from CoinGecko API
 * Free tier: 10-30 calls/minute, no auth required
 */
async function fetchExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur,gbp',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch exchange rates:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.bitcoin) {
      console.error('Invalid API response:', data);
      return null;
    }

    const rates: ExchangeRates = {
      USD: data.bitcoin.usd,
      EUR: data.bitcoin.eur,
      GBP: data.bitcoin.gbp,
      timestamp: Date.now(),
    };

    console.log('✅ Fetched BTC exchange rates:', rates);
    return rates;
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return null;
  }
}

/**
 * Gets cached exchange rates from localStorage
 */
function getCachedRates(): ExchangeRates | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

    if (!cached || !timestamp) {
      return null;
    }

    const age = Date.now() - parseInt(timestamp);
    
    // Check if cache is still valid (less than 24 hours old)
    if (age > CACHE_DURATION) {
      console.log('📅 Exchange rate cache expired (age:', Math.round(age / 1000 / 60 / 60), 'hours)');
      return null;
    }

    const rates = JSON.parse(cached) as ExchangeRates;
    console.log('💾 Using cached exchange rates (age:', Math.round(age / 1000 / 60 / 60), 'hours)');
    return rates;
  } catch (error) {
    console.error('Error reading cached rates:', error);
    return null;
  }
}

/**
 * Saves exchange rates to localStorage
 */
function setCachedRates(rates: ExchangeRates): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(rates));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, rates.timestamp.toString());
    console.log('💾 Cached exchange rates');
  } catch (error) {
    console.error('Error caching rates:', error);
  }
}

/**
 * Gets current exchange rates with automatic daily updates
 * Uses cache if available and fresh, otherwise fetches new rates
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Try cache first
  const cached = getCachedRates();
  if (cached) {
    // Trigger background refresh if cache is more than 12 hours old
    const age = Date.now() - cached.timestamp;
    if (age > CACHE_DURATION / 2) {
      console.log('🔄 Cache aging, refreshing in background...');
      fetchExchangeRates().then(rates => {
        if (rates) {
          setCachedRates(rates);
        }
      });
    }
    return cached;
  }

  // Fetch fresh rates
  console.log('🌐 Fetching fresh exchange rates...');
  const rates = await fetchExchangeRates();

  if (rates) {
    setCachedRates(rates);
    return rates;
  }

  // Fallback to hardcoded rates
  console.warn('⚠️ Using fallback exchange rates');
  return {
    ...FALLBACK_RATES,
    timestamp: Date.now(),
  };
}

/**
 * Converts fiat currency to SATs using current exchange rates
 */
export async function convertToSats(amount: number, currency: string): Promise<number | null> {
  const upperCurrency = currency.toUpperCase();
  
  // If already in BTC or SATS, return as is
  if (upperCurrency === 'BTC') {
    return Math.round(amount * SATS_PER_BTC);
  }
  
  if (upperCurrency === 'SATS') {
    return Math.round(amount);
  }
  
  // Get current exchange rates
  const rates = await getExchangeRates();
  const btcPrice = rates[upperCurrency as keyof typeof rates];
  
  if (typeof btcPrice !== 'number') {
    return null; // Unsupported currency
  }
  
  // Convert: amount in fiat / price per BTC = BTC amount
  // BTC amount * sats per BTC = sats
  const btcAmount = amount / btcPrice;
  const satsAmount = btcAmount * SATS_PER_BTC;
  
  return Math.round(satsAmount);
}

/**
 * Formats sats amount with proper separators
 */
export function formatSats(sats: number): string {
  return `${sats.toLocaleString()} sats`;
}

/**
 * Formats price with sats conversion
 */
export async function formatPriceWithSats(price: string, currency: string): Promise<{
  primary: string;
  sats: string | null;
}> {
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
  const satsAmount = await convertToSats(amount, currency);
  const sats = satsAmount ? formatSats(satsAmount) : null;
  
  return { primary, sats };
}

/**
 * Preload exchange rates on app initialization
 * Call this when the app starts to ensure rates are ready
 */
export function preloadExchangeRates(): void {
  getExchangeRates().catch(error => {
    console.error('Failed to preload exchange rates:', error);
  });
}
