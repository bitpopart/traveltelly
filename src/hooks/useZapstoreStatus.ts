import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

const ZAPSTORE_RELAY = 'wss://relay.zapstore.dev';

interface ZapstoreRelayResult {
  appEvent: NostrEvent | null;       // kind 32267
  releaseEvents: NostrEvent[];       // kind 30063
  assetEvents: NostrEvent[];         // kind 3063
  latestVersion: string | null;
  allVersions: string[];
}

function queryRelay(filters: object[]): Promise<NostrEvent[]> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(ZAPSTORE_RELAY);
    const events: NostrEvent[] = [];
    const subId = `check-${Math.random().toString(36).slice(2, 8)}`;
    let settled = false;

    const done = () => {
      if (!settled) {
        settled = true;
        ws.close();
        resolve(events);
      }
    };

    const timeout = setTimeout(done, 12000);

    ws.onopen = () => {
      ws.send(JSON.stringify(['REQ', subId, ...filters]));
    };

    ws.onmessage = (msg) => {
      if (settled) return;
      try {
        const data = JSON.parse(msg.data as string) as unknown[];
        if (!Array.isArray(data)) return;
        if (data[0] === 'EVENT' && data[1] === subId) {
          events.push(data[2] as NostrEvent);
        } else if (data[0] === 'EOSE' && data[1] === subId) {
          clearTimeout(timeout);
          done();
        } else if (data[0] === 'CLOSED') {
          clearTimeout(timeout);
          done();
        }
      } catch {
        // ignore
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      if (!settled) {
        settled = true;
        reject(new Error('Cannot connect to relay.zapstore.dev'));
      }
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      if (!settled) {
        settled = true;
        resolve(events);
      }
    };
  });
}

function getTag(event: NostrEvent, name: string): string {
  return event.tags.find(([t]) => t === name)?.[1] ?? '';
}

export function useZapstoreStatus(pubkey: string | undefined, packageName: string) {
  return useQuery<ZapstoreRelayResult>({
    queryKey: ['zapstore-status', pubkey, packageName],
    enabled: !!pubkey && !!packageName,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      if (!pubkey) throw new Error('No pubkey');

      const [appEvents, releaseEvents, assetEvents] = await Promise.all([
        queryRelay([{ kinds: [32267], authors: [pubkey], '#d': [packageName], limit: 1 }]),
        queryRelay([{ kinds: [30063], authors: [pubkey], '#i': [packageName], limit: 50 }]),
        queryRelay([{ kinds: [3063], authors: [pubkey], '#i': [packageName], limit: 50 }]),
      ]);

      const appEvent = appEvents[0] ?? null;

      // Sort releases by created_at desc
      const sorted = [...releaseEvents].sort((a, b) => b.created_at - a.created_at);
      const allVersions = sorted
        .map(e => getTag(e, 'version'))
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i); // unique

      const latestVersion = allVersions[0] ?? null;

      return { appEvent, releaseEvents: sorted, assetEvents, latestVersion, allVersions };
    },
  });
}

export { getTag };
