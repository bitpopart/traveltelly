/**
 * useBlossomMedia
 *
 * Fetches all media blobs for a pubkey from Blossom servers.
 *
 * IMPORTANT: Blossom BUD-02 /list/<pubkey> REQUIRES NIP-98 Authorization.
 * This hook only works when the owner (the admin) is logged in — it uses
 * their signer to create the auth header. Anonymous visitors cannot call /list.
 *
 * For anonymous browsing, use useMarketplaceProducts (kind 30402 relay query).
 */

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
export const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export const BLOSSOM_SERVERS = [
  'https://blossom.nostr.build',
  'https://blossom.primal.net',
  'https://cdn.satellite.earth',
  'https://blossom.nostr.hu',
];

export interface BlossomBlob {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
}

type MediaKind = 'image' | 'video';

export interface BlossomMediaItem {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
  kind: MediaKind;
  source: string;
}

/** Build a NIP-98 Authorization header for a Blossom request */
async function buildBlossomAuthHeader(
  signer: { signEvent: (event: object) => Promise<{ sig: string; id: string; pubkey: string; created_at: number }> },
  url: string,
  method: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const template = {
    kind: 27235,
    created_at: now,
    tags: [
      ['u', url],
      ['method', method],
      ['expiration', String(now + 60)],
    ],
    content: '',
  };
  const signed = await signer.signEvent(template);
  const encoded = btoa(JSON.stringify(signed));
  return `Nostr ${encoded}`;
}

async function fetchBlossomList(
  server: string,
  pubkeyHex: string,
  authHeader: string,
  signal: AbortSignal
): Promise<(BlossomBlob & { source: string })[]> {
  const url = `${server.replace(/\/$/, '')}/list/${pubkeyHex}`;
  const res = await fetch(url, {
    signal,
    headers: { Authorization: authHeader },
  });
  if (!res.ok) throw new Error(`${server} /list returned ${res.status}`);
  const data = await res.json();
  const items: BlossomBlob[] = Array.isArray(data) ? data : (data.files ?? data.blobs ?? []);
  return items
    .filter((b) => b.url && (b.type?.startsWith('image/') || b.type?.startsWith('video/')))
    .map((b) => ({ ...b, source: server }));
}

/**
 * useBlossomMedia — only works when the admin is logged in.
 * Returns their full media library from Blossom servers.
 */
export function useBlossomMedia() {
  const { user } = useCurrentUser();
  const isAdmin = user?.pubkey === ADMIN_HEX;

  return useQuery({
    queryKey: ['blossom-media-authed', user?.pubkey],
    enabled: isAdmin && !!user,
    queryFn: async (c) => {
      if (!user) throw new Error('Not logged in');
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(20000)]);

      // Build one auth header per server (each URL is different)
      const results = await Promise.allSettled(
        BLOSSOM_SERVERS.map(async (server) => {
          const url = `${server.replace(/\/$/, '')}/list/${ADMIN_HEX}`;
          const authHeader = await buildBlossomAuthHeader(user.signer, url, 'GET');
          return fetchBlossomList(server, ADMIN_HEX, authHeader, signal);
        })
      );

      const seen = new Map<string, BlossomMediaItem>();
      for (const result of results) {
        if (result.status === 'fulfilled') {
          for (const blob of result.value) {
            if (!seen.has(blob.sha256)) {
              seen.set(blob.sha256, {
                url: blob.url,
                sha256: blob.sha256,
                size: blob.size,
                type: blob.type,
                uploaded: blob.uploaded,
                kind: blob.type?.startsWith('video/') ? 'video' : 'image',
                source: blob.source,
              });
            }
          }
        }
      }

      const items = Array.from(seen.values());
      items.sort((a, b) => b.uploaded - a.uploaded);
      return items;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}
