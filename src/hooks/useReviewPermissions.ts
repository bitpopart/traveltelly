import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub who can grant permissions
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

import { nip19 } from 'nostr-tools';

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

interface PermissionRequest extends NostrEvent {
  kind: 31491; // Custom kind for permission requests
}

interface PermissionGrant extends NostrEvent {
  kind: 30383; // Custom kind for permission grants
}

function validatePermissionRequest(event: NostrEvent): event is PermissionRequest {
  if (event.kind !== 31491) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const requestType = event.tags.find(([name]) => name === 'request_type')?.[1];

  return !!(d && requestType === 'review_permission');
}

function validatePermissionGrant(event: NostrEvent): event is PermissionGrant {
  if (event.kind !== 30383) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const grantType = event.tags.find(([name]) => name === 'grant_type')?.[1];
  const grantedPubkey = event.tags.find(([name]) => name === 'p')?.[1];

  return !!(d && grantType === 'review_permission' && grantedPubkey);
}

export function useReviewPermissions() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  // Check if current user has review permission
  const { data: hasPermission, isLoading: isCheckingPermission } = useQuery({
    queryKey: ['review-permission', user?.pubkey],
    queryFn: async (c) => {
      if (!user) return false;

      // Admin always has permission
      if (user.pubkey === ADMIN_HEX) return true;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Check for permission grants
      const events = await nostr.query([{
        kinds: [30383],
        authors: [ADMIN_HEX],
        '#p': [user.pubkey],
        '#grant_type': ['review_permission'],
        limit: 1,
      }], { signal });

      const validGrants = events.filter(validatePermissionGrant);
      return validGrants.length > 0;
    },
    enabled: !!user,
  });

  // Check if current user is admin
  const isAdmin = user?.pubkey === ADMIN_HEX;

  // Debug logging in development
  if (import.meta.env.DEV && user) {
    console.log('🔐 Admin Check:', {
      userPubkey: user.pubkey,
      adminHex: ADMIN_HEX,
      isAdmin,
      adminNpub: ADMIN_NPUB,
    });
  }

  return {
    hasPermission: hasPermission || false,
    isCheckingPermission,
    isAdmin,
  };
}

export function usePermissionRequests() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['permission-requests'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Get all permission requests
      const events = await nostr.query([{
        kinds: [31491],
        '#request_type': ['review_permission'],
        limit: 50,
      }], { signal });

      const validRequests = events.filter(validatePermissionRequest);

      // Get existing grants to filter out already granted requests
      const grants = await nostr.query([{
        kinds: [30383],
        authors: [ADMIN_HEX],
        '#grant_type': ['review_permission'],
        limit: 100,
      }], { signal });

      const validGrants = grants.filter(validatePermissionGrant);
      const grantedPubkeys = new Set(
        validGrants.map(grant => grant.tags.find(([name]) => name === 'p')?.[1]).filter(Boolean)
      );

      // Filter out already granted requests
      const pendingRequests = validRequests.filter(
        request => !grantedPubkeys.has(request.pubkey)
      );

      return pendingRequests.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: user?.pubkey === ADMIN_HEX, // Only enable for Traveltelly admin
  });
}

export function useSubmitPermissionRequest() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reason: string }) => {
      const tags: string[][] = [
        ['d', `review-permission-${Date.now()}`],
        ['request_type', 'review_permission'],
        ['alt', 'Request for review posting permission'],
      ];

      createEvent({
        kind: 31491,
        content: data.reason,
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests'] });
    },
  });
}

export function useGrantPermission() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { pubkey: string; requestId: string }) => {
      const tags: string[][] = [
        ['d', `review-grant-${data.pubkey}`],
        ['grant_type', 'review_permission'],
        ['p', data.pubkey],
        ['e', data.requestId], // Reference to the original request
        ['alt', 'Review permission granted'],
      ];

      createEvent({
        kind: 30383,
        content: 'Review posting permission granted',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['review-permission'] });
    },
  });
}

export function useBlockRequest() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { pubkey: string; requestId: string }) => {
      const tags: string[][] = [
        ['d', `review-block-${data.pubkey}`],
        ['grant_type', 'review_permission_blocked'],
        ['p', data.pubkey],
        ['e', data.requestId], // Reference to the original request
        ['alt', 'Review permission blocked'],
      ];

      createEvent({
        kind: 30383,
        content: 'Review posting permission blocked',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permission-requests'] });
    },
  });
}