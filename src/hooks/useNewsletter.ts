import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { useNostrPublish } from './useNostrPublish';
import { validateSubscriberEvent, parseSubscriberEvent, createSubscriberTags, type NewsletterSubscriber } from '@/lib/newsletterSchema';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

/**
 * Fetch all newsletter subscribers (admin only)
 */
export function useNewsletterSubscribers() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  
  const isAdmin = user?.pubkey === ADMIN_HEX;

  return useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([{
        kinds: [30080],
        authors: [ADMIN_HEX],
        limit: 1000,
      }], { signal });

      const subscribers = events
        .filter(validateSubscriberEvent)
        .map(parseSubscriberEvent)
        .filter((sub): sub is NewsletterSubscriber => sub !== null);

      console.log(`📧 Found ${subscribers.length} newsletter subscribers`);
      
      return subscribers;
    },
    enabled: isAdmin,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Subscribe to newsletter
 */
export function useSubscribeToNewsletter() {
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, name, source }: { email: string; name?: string; source?: string }) => {
      return new Promise<void>((resolve, reject) => {
        const tags = createSubscriberTags(email, name, source);
        
        publishEvent({
          kind: 30080,
          content: '',
          tags,
        }, {
          onSuccess: () => {
            console.log(`✅ Subscribed: ${email}`);
            resolve();
          },
          onError: (error) => {
            console.error(`❌ Failed to subscribe: ${email}`, error);
            reject(error);
          },
        });
      });
    },
    onSuccess: () => {
      // Invalidate subscribers list
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
}

/**
 * Unsubscribe from newsletter
 */
export function useUnsubscribeFromNewsletter() {
  const { mutate: publishEvent } = useNostrPublish();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      return new Promise<void>((resolve, reject) => {
        const tags: string[][] = [
          ['d', `subscriber-${email}`],
          ['email', email],
          ['status', 'unsubscribed'],
          ['alt', `Newsletter unsubscribe: ${email}`],
        ];
        
        publishEvent({
          kind: 30080,
          content: '',
          tags,
        }, {
          onSuccess: () => {
            console.log(`✅ Unsubscribed: ${email}`);
            resolve();
          },
          onError: (error) => {
            console.error(`❌ Failed to unsubscribe: ${email}`, error);
            reject(error);
          },
        });
      });
    },
    onSuccess: () => {
      // Invalidate subscribers list
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
    },
  });
}
