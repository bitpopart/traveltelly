import { useEffect } from 'react';
import { useCreateCustomer, useCustomer } from './useCustomers';
import { useCurrentUser } from './useCurrentUser';
import { TEST_CUSTOMER } from '@/lib/customerSchema';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

/**
 * Hook to automatically initialize the test customer account
 * Only runs when admin is logged in
 */
export function useInitializeTestCustomer() {
  const { user } = useCurrentUser();
  const { data: existingCustomer, isLoading } = useCustomer(TEST_CUSTOMER.email);
  const { mutateAsync: createCustomer } = useCreateCustomer();

  useEffect(() => {
    const initializeTestAccount = async () => {
      // Only run if:
      // 1. User is the admin
      // 2. Data has loaded
      // 3. Test customer doesn't exist yet
      if (user?.pubkey !== ADMIN_HEX || isLoading || existingCustomer) {
        return;
      }

      try {
        console.log('🧪 Initializing test customer account...');
        await createCustomer({
          ...TEST_CUSTOMER,
          email: TEST_CUSTOMER.email,
          name: TEST_CUSTOMER.name,
          subscriptionType: TEST_CUSTOMER.subscriptionType,
          createdAt: TEST_CUSTOMER.createdAt,
          notes: TEST_CUSTOMER.notes,
        });
        console.log('✅ Test customer account created:', TEST_CUSTOMER.email);
      } catch (error) {
        console.error('❌ Failed to create test customer:', error);
      }
    };

    initializeTestAccount();
  }, [user, existingCustomer, isLoading, createCustomer]);
}
