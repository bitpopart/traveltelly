import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

// Hook to get user's stories (kind 30023)
export function useUserStories(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-stories', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return [];

      const events = await nostr.query([
        {
          kinds: [30023],
          authors: [pubkey],
          limit: 50,
        }
      ], { signal });

      // Sort by created_at (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to get user's trips (kind 30025)
export function useUserTrips(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-trips', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return [];

      const events = await nostr.query([
        {
          kinds: [30025],
          authors: [pubkey],
          limit: 50,
        }
      ], { signal });

      // Sort by created_at (newest first)
      return events.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to get user's media (kind 30402)
export function useUserMedia(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['user-media', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return [];

      const events = await nostr.query([
        {
          kinds: [30402],
          authors: [pubkey],
          limit: 100,
        }
      ], { signal });

      // Filter out deleted items
      const activeEvents = events.filter((event: NostrEvent) => {
        const status = event.tags.find(([name]) => name === 'status')?.[1];
        const isDeleted =
          status === 'deleted' ||
          event.content?.startsWith('[DELETED]') ||
          event.content?.startsWith('[ADMIN DELETED]') ||
          event.content?.startsWith('[TOMBSTONE]') ||
          event.tags.some(tag => tag[0] === 'deleted' && tag[1] === 'true') ||
          event.tags.some(tag => tag[0] === 'admin_deleted' && tag[1] === 'true') ||
          event.tags.some(tag => tag[0] === 'tombstone' && tag[1] === 'true');

        return !isDeleted;
      });

      // Sort by created_at (newest first)
      return activeEvents.sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!pubkey,
    staleTime: 30 * 1000, // 30 seconds
  });
}
