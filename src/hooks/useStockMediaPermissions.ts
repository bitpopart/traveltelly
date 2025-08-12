import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';

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

interface StockMediaPermissionRequest extends NostrEvent {
  kind: 31492; // Custom kind for stock media permission requests
}

interface StockMediaPermissionGrant extends NostrEvent {
  kind: 30384; // Custom kind for stock media permission grants
}

function validateStockMediaPermissionRequest(event: NostrEvent): event is StockMediaPermissionRequest {
  if (event.kind !== 31492) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const requestType = event.tags.find(([name]) => name === 'request_type')?.[1];

  return !!(d && requestType === 'stock_media_permission');
}

function validateStockMediaPermissionGrant(event: NostrEvent): event is StockMediaPermissionGrant {
  if (event.kind !== 30384) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const grantType = event.tags.find(([name]) => name === 'grant_type')?.[1];
  const grantedPubkey = event.tags.find(([name]) => name === 'p')?.[1];

  return !!(d && grantType === 'stock_media_permission' && grantedPubkey);
}

export function useStockMediaPermissions() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  // Check if current user has stock media upload permission
  const { data: hasPermission, isLoading: isCheckingPermission } = useQuery({
    queryKey: ['stock-media-permission', user?.pubkey],
    queryFn: async (c) => {
      if (!user) return false;

      // Admin always has permission
      if (user.pubkey === ADMIN_HEX) return true;

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Check for permission grants
      const events = await nostr.query([{
        kinds: [30384],
        authors: [ADMIN_HEX],
        '#p': [user.pubkey],
        '#grant_type': ['stock_media_permission'],
        limit: 1,
      }], { signal });

      const validGrants = events.filter(validateStockMediaPermissionGrant);
      return validGrants.length > 0;
    },
    enabled: !!user,
  });

  // Check if current user is admin
  const isAdmin = user?.pubkey === ADMIN_HEX;

  // Debug logging in development
  if (import.meta.env.DEV && user) {
    console.log('📸 Stock Media Admin Check:', {
      userPubkey: user.pubkey,
      adminHex: ADMIN_HEX,
      isAdmin,
      adminNpub: ADMIN_NPUB,
      hasPermission,
    });
  }

  return {
    hasPermission: hasPermission || false,
    isCheckingPermission,
    isAdmin,
  };
}

export function useStockMediaPermissionRequests() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['stock-media-permission-requests'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Get all stock media permission requests
      const events = await nostr.query([{
        kinds: [31492],
        '#request_type': ['stock_media_permission'],
        limit: 50,
      }], { signal });

      const validRequests = events.filter(validateStockMediaPermissionRequest);

      // Get existing grants to filter out already granted requests
      const grants = await nostr.query([{
        kinds: [30384],
        authors: [ADMIN_HEX],
        '#grant_type': ['stock_media_permission'],
        limit: 100,
      }], { signal });

      const validGrants = grants.filter(validateStockMediaPermissionGrant);
      const grantedPubkeys = new Set(
        validGrants.map(grant => grant.tags.find(([name]) => name === 'p')?.[1]).filter((pubkey): pubkey is string => Boolean(pubkey))
      );

      // Get blocked users
      const blocks = await nostr.query([{
        kinds: [30384],
        authors: [ADMIN_HEX],
        '#grant_type': ['stock_media_permission_blocked'],
        limit: 100,
      }], { signal });

      const blockedPubkeys = new Set(
        blocks.map(block => block.tags.find(([name]) => name === 'p')?.[1]).filter((pubkey): pubkey is string => Boolean(pubkey))
      );

      // Filter out already granted or blocked requests
      const pendingRequests = validRequests.filter(
        request => !grantedPubkeys.has(request.pubkey) && !blockedPubkeys.has(request.pubkey)
      );

      return {
        pendingRequests: pendingRequests.sort((a, b) => b.created_at - a.created_at),
        grantedUsers: Array.from(grantedPubkeys),
        blockedUsers: Array.from(blockedPubkeys),
      };
    },
    enabled: user?.pubkey === ADMIN_HEX, // Only enable for Traveltelly admin
  });
}

export function useSubmitStockMediaPermissionRequest() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reason: string; portfolio?: string; experience?: string }) => {
      const tags: string[][] = [
        ['d', `stock-media-permission-${Date.now()}`],
        ['request_type', 'stock_media_permission'],
        ['alt', 'Request for stock media upload permission'],
      ];

      if (data.portfolio) {
        tags.push(['portfolio', data.portfolio]);
      }

      if (data.experience) {
        tags.push(['experience', data.experience]);
      }

      createEvent({
        kind: 31492,
        content: data.reason,
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission-requests'] });
    },
  });
}

export function useGrantStockMediaPermission() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { pubkey: string; requestId: string }) => {
      const tags: string[][] = [
        ['d', `stock-media-grant-${data.pubkey}`],
        ['grant_type', 'stock_media_permission'],
        ['p', data.pubkey],
        ['e', data.requestId], // Reference to the original request
        ['alt', 'Stock media upload permission granted'],
      ];

      createEvent({
        kind: 30384,
        content: 'Stock media upload permission granted',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission'] });
    },
  });
}

export function useBlockStockMediaRequest() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { pubkey: string; requestId: string; reason?: string }) => {
      const tags: string[][] = [
        ['d', `stock-media-block-${data.pubkey}`],
        ['grant_type', 'stock_media_permission_blocked'],
        ['p', data.pubkey],
        ['e', data.requestId], // Reference to the original request
        ['alt', 'Stock media upload permission blocked'],
      ];

      if (data.reason) {
        tags.push(['block_reason', data.reason]);
      }

      createEvent({
        kind: 30384,
        content: data.reason || 'Stock media upload permission blocked',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission-requests'] });
    },
  });
}

export function useRevokeStockMediaPermission() {
  const { mutate: createEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { pubkey: string; reason?: string }) => {
      const tags: string[][] = [
        ['d', `stock-media-revoke-${data.pubkey}`],
        ['grant_type', 'stock_media_permission_revoked'],
        ['p', data.pubkey],
        ['alt', 'Stock media upload permission revoked'],
      ];

      if (data.reason) {
        tags.push(['revoke_reason', data.reason]);
      }

      createEvent({
        kind: 30384,
        content: data.reason || 'Stock media upload permission revoked',
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission-requests'] });
      queryClient.invalidateQueries({ queryKey: ['stock-media-permission'] });
    },
  });
}

/**
 * Hook to get all authorized media uploaders (users who have been granted permission to upload media)
 * Returns a Set of pubkeys that are authorized to upload media to the marketplace
 */
export function useAuthorizedMediaUploaders() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['authorized-media-uploaders'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Get all media permission grants from admin
      const events = await nostr.query([{
        kinds: [30384],
        authors: [ADMIN_HEX],
        '#grant_type': ['stock_media_permission'],
        limit: 500, // Increase limit to get all grants
      }], { signal });

      const validGrants = events.filter(validateStockMediaPermissionGrant);

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

      console.log('📸 Authorized media uploaders:', Array.from(authorizedPubkeys));
      return authorizedPubkeys;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to check if a specific pubkey is authorized to upload media
 */
export function useIsAuthorizedMediaUploader(pubkey: string | undefined) {
  const { data: authorizedUploaders, isLoading } = useAuthorizedMediaUploaders();

  return {
    isAuthorized: pubkey ? authorizedUploaders?.has(pubkey) ?? false : false,
    isLoading,
  };
}