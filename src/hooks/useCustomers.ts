import { useNostr } from '@nostrify/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './useCurrentUser';
import { 
  CUSTOMER_RECORD_KIND, 
  parseCustomerEvent, 
  createCustomerEventContent,
  hasActiveSubscription,
  type CustomerData,
} from '@/lib/customerSchema';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

// The Traveltelly admin npub
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

/**
 * Fetch all customers (admin only)
 */
export function useCustomers() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['customers'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      
      const events = await nostr.query([{
        kinds: [CUSTOMER_RECORD_KIND],
        authors: [ADMIN_HEX],
        limit: 1000,
      }], { signal });

      const customers: CustomerData[] = [];
      
      for (const event of events) {
        const customer = parseCustomerEvent(event);
        if (customer) {
          customers.push(customer);
        }
      }

      console.log(`👥 Loaded ${customers.length} customers`);
      return customers;
    },
    enabled: user?.pubkey === ADMIN_HEX,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch a specific customer by email
 */
export function useCustomer(email: string | null) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['customer', email],
    queryFn: async (c) => {
      if (!email) return null;
      
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      
      const events = await nostr.query([{
        kinds: [CUSTOMER_RECORD_KIND],
        authors: [ADMIN_HEX],
        '#d': [email],
        limit: 1,
      }], { signal });

      if (events.length === 0) return null;

      return parseCustomerEvent(events[0]);
    },
    enabled: !!email,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create or update a customer record (admin only)
 */
export function useCreateCustomer() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: CustomerData) => {
      if (user?.pubkey !== ADMIN_HEX) {
        throw new Error('Only admin can create customer records');
      }

      if (!user.signer) {
        throw new Error('No signer available');
      }

      const content = createCustomerEventContent({
        name: customer.name,
        subscriptionType: customer.subscriptionType,
        subscriptionExpiry: customer.subscriptionExpiry,
        createdAt: customer.createdAt,
        lastPurchaseAt: customer.lastPurchaseAt,
        totalPurchases: customer.totalPurchases,
        notes: customer.notes,
      });

      // Create event
      const event: Partial<NostrEvent> = {
        kind: CUSTOMER_RECORD_KIND,
        content,
        tags: [
          ['d', customer.email],
          ['email', customer.email],
          ['name', customer.name],
          ['subscription', customer.subscriptionType],
        ],
        created_at: Math.floor(Date.now() / 1000),
      };

      // Sign and publish
      const signedEvent = await user.signer.signEvent(event as NostrEvent);
      await nostr.event(signedEvent);

      console.log('✅ Customer record created:', customer.email);
      return customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

/**
 * Check if a customer (by email) has unlimited download access
 */
export function useCustomerAccess(email: string | null) {
  const { data: customer, isLoading } = useCustomer(email);

  return {
    hasAccess: customer ? hasActiveSubscription(customer) : false,
    customer,
    isLoading,
  };
}

/**
 * Get current customer session from localStorage
 */
export function useCustomerSession() {
  const getSession = (): { email: string; name: string } | null => {
    try {
      const session = localStorage.getItem('traveltelly_customer_session');
      if (!session) return null;
      return JSON.parse(session);
    } catch {
      return null;
    }
  };

  const setSession = (email: string, name: string) => {
    localStorage.setItem('traveltelly_customer_session', JSON.stringify({ email, name }));
  };

  const clearSession = () => {
    localStorage.removeItem('traveltelly_customer_session');
  };

  return {
    session: getSession(),
    setSession,
    clearSession,
  };
}
