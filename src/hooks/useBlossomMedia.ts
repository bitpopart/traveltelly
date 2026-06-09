/**
 * useBlossomMedia
 *
 * Fetches all media blobs uploaded by a pubkey directly from Blossom servers.
 * This is the primary data source for the marketplace — relay-independent.
 *
 * Blossom BUD-02 /list/<pubkey> returns all blobs for that pubkey without
 * any authentication requirement (public listing).
 */

import { useQuery } from '@tanstack/react-query';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
export const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

// Blossom servers to query for media — ordered by reliability
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

/** Fetch the blob list from a single Blossom server for a given pubkey hex. */
async function fetchBlossomList(server: string, pubkeyHex: string, signal: AbortSignal): Promise<BlossomBlob[]> {
  const url = `${server.replace(/\/$/, '')}/list/${pubkeyHex}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`${server} returned ${res.status}`);
  const data = await res.json();
  // Some servers return an array directly, others wrap in { files: [...] }
  const items: BlossomBlob[] = Array.isArray(data) ? data : (data.files ?? data.blobs ?? []);
  return items.filter((b) => b.url && (b.type?.startsWith('image/') || b.type?.startsWith('video/')));
}

/** Media types we care about */
type MediaKind = 'image' | 'video';

export interface BlossomMediaItem {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
  kind: MediaKind;
  /** Which Blossom server first provided this item */
  source: string;
}

/**
 * useBlossomMedia
 *
 * Tries all configured Blossom servers in parallel and merges results,
 * deduplicating by sha256. Returns the combined unique set of media files
 * owned by the admin pubkey.
 */
export function useBlossomMedia(pubkeyHex: string = ADMIN_HEX) {
  return useQuery({
    queryKey: ['blossom-media', pubkeyHex],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(15000)]);

      const results = await Promise.allSettled(
        BLOSSOM_SERVERS.map((server) => fetchBlossomList(server, pubkeyHex, signal).then((blobs) =>
          blobs.map((b) => ({ ...b, source: server }))
        ))
      );

      // Merge and deduplicate by sha256 — first server wins
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
      // Sort newest first
      items.sort((a, b) => b.uploaded - a.uploaded);
      return items;
    },
    staleTime: 5 * 60 * 1000,    // 5 min
    gcTime: 15 * 60 * 1000,      // 15 min
    retry: 2,
  });
}
