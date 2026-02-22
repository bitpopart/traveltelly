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
  if (event.kind !== 31491) {
    console.log(`❌ Validation failed: wrong kind ${event.kind}, expected 31491`);
    return false;
  }

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const requestType = event.tags.find(([name]) => name === 'request_type')?.[1];

  if (!d) {
    console.log(`❌ Validation failed: missing 'd' tag in event ${event.id.substring(0, 8)}`);
  }
  if (!requestType) {
    console.log(`❌ Validation failed: missing 'request_type' tag in event ${event.id.substring(0, 8)}`);
  }
  if (requestType && requestType !== 'review_permission') {
    console.log(`❌ Validation failed: wrong request_type '${requestType}', expected 'review_permission'`);
  }

  const isValid = !!(d && requestType === 'review_permission');
  if (isValid) {
    console.log(`✅ Valid permission request found:`, {
      id: event.id.substring(0, 8),
      d,
      requestType,
      pubkey: event.pubkey.substring(0, 8),
    });
  }
  
  return isValid;
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
      if (user.pubkey === ADMIN_HEX) {
        console.log('✅ User is admin - auto-granted permission');
        return true;
      }

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      console.log('🔍 Checking permission for user:', user.pubkey.substring(0, 8));

      // Check for permission grants - search without tag filters first
      const events = await nostr.query([{
        kinds: [30383],
        authors: [ADMIN_HEX],
        limit: 50, // Get more grants to debug
      }], { signal });

      console.log('📥 All permission grants from admin:', events.length);
      
      // Filter for this specific user
      const userGrants = events.filter(event => {
        const grantedPubkey = event.tags.find(([name]) => name === 'p')?.[1];
        const grantType = event.tags.find(([name]) => name === 'grant_type')?.[1];
        
        console.log('Grant event:', {
          id: event.id.substring(0, 8),
          grantedPubkey: grantedPubkey?.substring(0, 8),
          grantType,
          matchesUser: grantedPubkey === user.pubkey,
        });
        
        return grantedPubkey === user.pubkey && grantType === 'review_permission';
      });

      console.log('📋 Grants for this user:', userGrants.length, userGrants);

      const validGrants = userGrants.filter(validatePermissionGrant);
      const hasPermission = validGrants.length > 0;
      
      console.log(hasPermission ? '✅ User has permission' : '❌ User does NOT have permission');
      
      return hasPermission;
    },
    enabled: !!user,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true, // Always check on mount
    refetchOnWindowFocus: true, // Check when window gains focus
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

  console.log('🎯 usePermissionRequests hook called:', {
    hasUser: !!user,
    userPubkey: user?.pubkey?.substring(0, 8),
    isAdmin: user?.pubkey === ADMIN_HEX,
    ADMIN_HEX: ADMIN_HEX.substring(0, 8),
  });

  return useQuery({
    queryKey: ['permission-requests'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      console.log('🔍 Querying permission requests...');
      console.log('🔌 Current relay URLs:', nostr);

      // Get all permission requests - WITHOUT tag filters to see all kind 31491 events
      const events = await nostr.query([{
        kinds: [31491],
        limit: 100, // Increased limit
      }], { signal });

      console.log('📥 Raw permission request events (all kind 31491):', events.length, events);

      // Log all events to see their structure
      events.forEach((event, index) => {
        console.log(`Event ${index}:`, {
          id: event.id,
          kind: event.kind,
          pubkey: event.pubkey.substring(0, 8),
          tags: event.tags,
          content: event.content.substring(0, 100),
        });
      });

      const validRequests = events.filter(validatePermissionRequest);
      console.log('✅ Valid permission requests (with tag filter):', validRequests.length, validRequests);

      // Get existing grants to filter out already granted requests
      const grants = await nostr.query([{
        kinds: [30383],
        authors: [ADMIN_HEX],
        limit: 100, // Check all grants regardless of tag
      }], { signal });

      console.log('📥 Permission grants:', grants.length, grants);

      const validGrants = grants.filter(validatePermissionGrant);
      const grantedPubkeys = new Set(
        validGrants.map(grant => grant.tags.find(([name]) => name === 'p')?.[1]).filter(Boolean)
      );

      console.log('👥 Already granted pubkeys:', Array.from(grantedPubkeys));

      // Filter out already granted requests
      const pendingRequests = validRequests.filter(
        request => !grantedPubkeys.has(request.pubkey)
      );

      console.log('⏳ Pending requests:', pendingRequests.length, pendingRequests);

      return pendingRequests.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: user?.pubkey === ADMIN_HEX, // Only enable for Traveltelly admin
    staleTime: 30000, // 30 seconds
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
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

      console.log('📤 Submitting permission request:', {
        kind: 31491,
        content: data.reason,
        tags,
      });

      createEvent({
        kind: 31491,
        content: data.reason,
        tags,
      });
    },
    onSuccess: () => {
      console.log('✅ Permission request submitted successfully');
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