import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub who can grant permissions
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

// Convert npub to hex for internal use
function npubToHex(npub: string): string {
  try {
    const decoded = nip19.decode(npub);
    if (decoded.type === 'npub') {
      return decoded.data;
    }
    throw new Error('Invalid npub');
  } catch {
    throw new Error('Invalid npub format');
  }
}

const ADMIN_HEX = npubToHex(ADMIN_NPUB);

interface PermissionGrant extends NostrEvent {
  kind: 30383;
}

function validatePermissionGrant(event: NostrEvent): event is PermissionGrant {
  if (event.kind !== 30383) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const grantType = event.tags.find(([name]) => name === 'grant_type')?.[1];
  const grantedPubkey = event.tags.find(([name]) => name === 'p')?.[1];

  return !!(d && grantType === 'review_permission' && grantedPubkey);
}

/**
 * Hook to get all authorized reviewers (users who have been granted permission to post reviews)
 * Returns a Set of pubkeys that are authorized to post reviews
 */
export function useAuthorizedReviewers() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['authorized-reviewers'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Get all permission grants from admin
      const events = await nostr.query([{
        kinds: [30383],
        authors: [ADMIN_HEX],
        '#grant_type': ['review_permission'],
        limit: 500, // Increase limit to get all grants
      }], { signal });

      const validGrants = events.filter(validatePermissionGrant);
      
      // Extract granted pubkeys
      const authorizedPubkeys = new Set<string>();
      
      // Admin is always authorized
      authorizedPubkeys.add(ADMIN_HEX);
      
      // Add all granted users
      validGrants.forEach(grant => {
        const grantedPubkey = grant.tags.find(([name]) => name === 'p')?.[1];
        if (grantedPubkey) {
          authorizedPubkeys.add(grantedPubkey);
        }
      });

      return authorizedPubkeys;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if a specific pubkey is authorized to post reviews
 */
export function useIsAuthorizedReviewer(pubkey: string | undefined) {
  const { data: authorizedReviewers, isLoading } = useAuthorizedReviewers();

  return {
    isAuthorized: pubkey ? authorizedReviewers?.has(pubkey) ?? false : false,
    isLoading,
  };
}