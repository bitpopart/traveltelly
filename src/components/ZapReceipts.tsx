import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NostrEvent } from '@nostrify/nostrify';

interface ZapReceiptEvent extends NostrEvent {
  kind: 9735;
}

interface ZapReceiptsProps {
  eventId?: string;
  pubkey?: string;
  className?: string;
}

function validateZapReceipt(event: NostrEvent): event is ZapReceiptEvent {
  if (event.kind !== 9735) return false;

  // Must have bolt11 and description tags
  const bolt11 = event.tags.find(([name]) => name === 'bolt11')?.[1];
  const description = event.tags.find(([name]) => name === 'description')?.[1];

  return !!(bolt11 && description);
}

function extractZapAmount(bolt11: string): number | null {
  try {
    // Simple regex to extract amount from bolt11 invoice
    // Format: lnbc{amount}{multiplier}...
    const match = bolt11.match(/lnbc(\d+)([munp]?)/);
    if (!match) return null;

    const amount = parseInt(match[1]);
    const multiplier = match[2];

    // Convert to sats based on multiplier
    switch (multiplier) {
      case 'm': return amount / 1000; // milli-bitcoin to sats
      case 'u': return amount / 100; // micro-bitcoin to sats
      case 'n': return amount / 100000; // nano-bitcoin to sats
      case 'p': return amount / 100000000; // pico-bitcoin to sats
      default: return amount * 100000000; // bitcoin to sats
    }
  } catch (error) {
    console.error('Error extracting zap amount:', error);
    return null;
  }
}

function ZapReceiptCard({ zapReceipt }: { zapReceipt: ZapReceiptEvent }) {
  const bolt11 = zapReceipt.tags.find(([name]) => name === 'bolt11')?.[1] || '';
  const description = zapReceipt.tags.find(([name]) => name === 'description')?.[1] || '';
  const senderPubkey = zapReceipt.tags.find(([name]) => name === 'P')?.[1]; // Sender pubkey

  const author = useAuthor(senderPubkey || '');
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(senderPubkey || '');
  const profileImage = metadata?.picture;

  const amount = extractZapAmount(bolt11);

  // Parse zap request from description to get comment
  let comment = '';
  try {
    const zapRequest = JSON.parse(description);
    comment = zapRequest.content || '';
  } catch (error) {
    console.warn('Could not parse zap request description:', error);
  }

  return (
    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <Avatar className="h-8 w-8">
        <AvatarImage src={profileImage} alt={displayName} />
        <AvatarFallback className="text-xs">{displayName[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium truncate">{displayName}</p>
          <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-300 text-xs">
            <Zap className="w-3 h-3 mr-1" />
            {amount ? `${amount.toLocaleString()} sats` : 'Zap'}
          </Badge>
        </div>

        {comment && (
          <p className="text-xs text-muted-foreground mb-1">"{comment}"</p>
        )}

        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(zapReceipt.created_at * 1000), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

function ZapReceiptSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function ZapReceipts({ eventId, pubkey, className }: ZapReceiptsProps) {
  const { nostr } = useNostr();

  const { data: zapReceipts, isLoading } = useQuery({
    queryKey: ['zap-receipts', eventId, pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const filters: Array<{ kinds: number[]; limit: number; '#e'?: string[]; '#p'?: string[] }> = [{ kinds: [9735], limit: 50 }];

      // Filter by event ID if provided
      if (eventId) {
        filters[0]['#e'] = [eventId];
      }

      // Filter by recipient pubkey if provided
      if (pubkey) {
        filters[0]['#p'] = [pubkey];
      }

      const events = await nostr.query(filters, { signal });
      return events
        .filter(validateZapReceipt)
        .sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!(eventId || pubkey),
  });

  if (!eventId && !pubkey) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={`space-y-3 ${className}`}>
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Lightning Tips
        </h4>
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <ZapReceiptSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!zapReceipts || zapReceipts.length === 0) {
    return (
      <div className={`${className}`}>
        <h4 className="text-sm font-medium flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-500" />
          Lightning Tips
        </h4>
        <div className="p-4 text-center text-sm text-muted-foreground bg-gray-50 dark:bg-gray-800 rounded-lg border-dashed border-2">
          No tips received yet. Be the first to send a Lightning tip! ⚡
        </div>
      </div>
    );
  }

  const totalAmount = zapReceipts.reduce((sum, receipt) => {
    const bolt11 = receipt.tags.find(([name]) => name === 'bolt11')?.[1] || '';
    const amount = extractZapAmount(bolt11) || 0;
    return sum + amount;
  }, 0);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          Lightning Tips ({zapReceipts.length})
        </h4>
        {totalAmount > 0 && (
          <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-300">
            Total: {totalAmount.toLocaleString()} sats
          </Badge>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {zapReceipts.map((receipt) => (
          <ZapReceiptCard key={receipt.id} zapReceipt={receipt} />
        ))}
      </div>
    </div>
  );
}