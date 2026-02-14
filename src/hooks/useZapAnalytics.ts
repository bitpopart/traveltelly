import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ZapReceipt {
  id: string;
  amount: number; // in sats
  sender?: string; // pubkey of sender (P tag)
  comment: string;
  timestamp: number;
  bolt11: string;
  event?: NostrEvent;
}

interface ZapAnalytics {
  totalSats: number;
  totalZaps: number;
  averageZap: number;
  topZappers: { pubkey: string; amount: number; count: number }[];
  recentZaps: ZapReceipt[];
  zapsByDay: { date: string; amount: number; count: number }[];
}

function parseBolt11Amount(bolt11: string): number {
  // Extract amount from bolt11 invoice
  // Format: lnbc{amount}{multiplier}...
  const match = bolt11.match(/lnbc(\d+)([munp]?)/i);
  if (!match) return 0;

  const amount = parseInt(match[1]);
  const multiplier = match[2]?.toLowerCase();

  // Convert to sats
  switch (multiplier) {
    case 'm': // milli-bitcoin (0.001 BTC)
      return amount * 100000;
    case 'u': // micro-bitcoin (0.000001 BTC)
      return amount * 100;
    case 'n': // nano-bitcoin (0.000000001 BTC)
      return amount / 10;
    case 'p': // pico-bitcoin (0.000000000001 BTC)
      return amount / 10000;
    default: // no multiplier means bitcoin
      return amount * 100000000;
  }
}

function parseZapReceipt(event: NostrEvent): ZapReceipt | null {
  try {
    const bolt11Tag = event.tags.find(([name]) => name === 'bolt11')?.[1];
    const descriptionTag = event.tags.find(([name]) => name === 'description')?.[1];
    const senderTag = event.tags.find(([name]) => name === 'P')?.[1]; // Capital P is sender

    if (!bolt11Tag) return null;

    // Parse the zap request from description tag
    let comment = '';
    if (descriptionTag) {
      try {
        const zapRequest = JSON.parse(descriptionTag);
        comment = zapRequest.content || '';
      } catch (e) {
        console.error('Error parsing zap request:', e);
      }
    }

    const amount = parseBolt11Amount(bolt11Tag);

    return {
      id: event.id,
      amount,
      sender: senderTag,
      comment,
      timestamp: event.created_at,
      bolt11: bolt11Tag,
      event,
    };
  } catch (error) {
    console.error('Error parsing zap receipt:', error);
    return null;
  }
}

export function useZapAnalytics(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['zap-analytics', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      if (!pubkey) {
        return {
          totalSats: 0,
          totalZaps: 0,
          averageZap: 0,
          topZappers: [],
          recentZaps: [],
          zapsByDay: [],
        };
      }

      // Query all zap receipts for this user
      const events = await nostr.query([
        {
          kinds: [9735],
          '#p': [pubkey],
          limit: 500, // Get last 500 zaps
        }
      ], { signal });

      // Parse all zap receipts
      const zaps = events
        .map(parseZapReceipt)
        .filter((zap): zap is ZapReceipt => zap !== null)
        .sort((a, b) => b.timestamp - a.timestamp);

      // Calculate analytics
      const totalSats = zaps.reduce((sum, zap) => sum + zap.amount, 0);
      const totalZaps = zaps.length;
      const averageZap = totalZaps > 0 ? Math.round(totalSats / totalZaps) : 0;

      // Top zappers
      const zapperMap = new Map<string, { amount: number; count: number }>();
      zaps.forEach(zap => {
        if (zap.sender) {
          const existing = zapperMap.get(zap.sender) || { amount: 0, count: 0 };
          zapperMap.set(zap.sender, {
            amount: existing.amount + zap.amount,
            count: existing.count + 1,
          });
        }
      });

      const topZappers = Array.from(zapperMap.entries())
        .map(([pubkey, data]) => ({ pubkey, ...data }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 10);

      // Zaps by day (last 30 days)
      const zapsByDayMap = new Map<string, { amount: number; count: number }>();
      const thirtyDaysAgo = Date.now() / 1000 - (30 * 24 * 60 * 60);
      
      zaps
        .filter(zap => zap.timestamp >= thirtyDaysAgo)
        .forEach(zap => {
          const date = new Date(zap.timestamp * 1000).toISOString().split('T')[0];
          const existing = zapsByDayMap.get(date) || { amount: 0, count: 0 };
          zapsByDayMap.set(date, {
            amount: existing.amount + zap.amount,
            count: existing.count + 1,
          });
        });

      const zapsByDay = Array.from(zapsByDayMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const analytics: ZapAnalytics = {
        totalSats,
        totalZaps,
        averageZap,
        topZappers,
        recentZaps: zaps.slice(0, 20),
        zapsByDay,
      };

      return analytics;
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}
