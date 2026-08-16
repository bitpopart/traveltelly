import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export type SocialPublishPlatform = 'x' | 'facebook' | 'instagram';

export interface SocialBackendStatus {
  backendOnline: boolean;
  x: boolean;
  facebook: boolean;
  instagram: boolean;
}

export interface SocialPublishInput {
  platform: SocialPublishPlatform;
  text: string;
  imageUrl?: string;
  url?: string;
}

export interface SocialPublishResult {
  ok: boolean;
  platform: SocialPublishPlatform;
  id?: string | null;
  url?: string | null;
}

const ENDPOINT = '/api/social-publish';

const OFFLINE_STATUS: SocialBackendStatus = {
  backendOnline: false,
  x: false,
  facebook: false,
  instagram: false,
};

/**
 * Whether the posting backend (/api/social-publish Netlify function) is
 * reachable and which platforms are configured on it. Never returns secrets —
 * only booleans. On GitHub Pages (no function runtime) this resolves to
 * backendOnline:false without throwing.
 */
export function useSocialBackendStatus() {
  return useQuery<SocialBackendStatus>({
    queryKey: ['social-backend-status'],
    queryFn: async (): Promise<SocialBackendStatus> => {
      try {
        const res = await fetch(ENDPOINT, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) return OFFLINE_STATUS;
        const data = await res.json();
        return {
          backendOnline: true,
          x: Boolean(data && data.x),
          facebook: Boolean(data && data.facebook),
          instagram: Boolean(data && data.instagram),
        };
      } catch {
        return OFFLINE_STATUS;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

/**
 * Post text (and optionally an image) to X / Facebook / Instagram through the
 * backend. Throws with the server's message on failure so callers can toast it.
 */
export function useSocialPublish() {
  const queryClient = useQueryClient();
  return useMutation<SocialPublishResult, Error, SocialPublishInput>({
    mutationFn: async (input) => {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(90000),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error((data && data.error) || `Publish failed (HTTP ${res.status})`);
      }
      return data as SocialPublishResult;
    },
    onSuccess: () => {
      // Config may have changed (e.g. first successful post) — refresh badges.
      queryClient.invalidateQueries({ queryKey: ['social-backend-status'] });
    },
  });
}
