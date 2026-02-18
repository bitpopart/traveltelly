import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';

interface PrivacySettings {
  showLocationOnProfile: boolean;
}

function validatePrivacySettingsEvent(event: NostrEvent): boolean {
  if (event.kind !== 30078) return false;
  
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  return d === 'privacy-settings';
}

function parsePrivacySettings(event: NostrEvent | null): PrivacySettings {
  if (!event) {
    return { showLocationOnProfile: true }; // Default: show location
  }

  const showLocation = event.tags.find(([name]) => name === 'show_location_on_profile')?.[1];
  
  return {
    showLocationOnProfile: showLocation !== 'false', // Default to true unless explicitly set to false
  };
}

export function usePrivacySettings(pubkey?: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['privacy-settings', pubkey],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      if (!pubkey) return null;

      const events = await nostr.query([
        {
          kinds: [30078],
          authors: [pubkey],
          '#d': ['privacy-settings'],
          limit: 1,
        }
      ], { signal });

      if (events.length === 0) return null;
      
      const event = events[0];
      return validatePrivacySettingsEvent(event) ? event : null;
    },
    enabled: !!pubkey,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function usePrivacySettingsData(pubkey?: string): PrivacySettings {
  const { data: event } = usePrivacySettings(pubkey);
  return parsePrivacySettings(event || null);
}
