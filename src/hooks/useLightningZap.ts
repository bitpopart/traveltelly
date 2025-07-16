import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useNostr } from '@nostrify/react';
import { NSchema as n } from '@nostrify/nostrify';
import { bech32 } from 'bech32';
import type { NostrEvent, NostrMetadata } from '@nostrify/nostrify';

interface ZapRequest {
  amount: number; // in sats
  comment?: string;
  recipientPubkey: string;
  eventId?: string;
  eventCoordinate?: string;
}

interface LNURLPayResponse {
  callback: string;
  maxSendable: number;
  minSendable: number;
  metadata: string;
  tag: string;
  allowsNostr?: boolean;
  nostrPubkey?: string;
}

/**
 * Decode LNURL using bech32
 */
function decodeLNURL(lnurl: string): string {
  try {
    const decoded = bech32.decode(lnurl, 2000);
    const words = bech32.fromWords(decoded.words);
    return new TextDecoder().decode(new Uint8Array(words));
  } catch {
    throw new Error('Invalid LNURL format');
  }
}

export function useLightningZap() {
  const [isZapping, setIsZapping] = useState(false);
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { nostr } = useNostr();

  /**
   * Get LNURL from user's profile (lud06 or lud16)
   */
  const getLNURLFromProfile = async (pubkey: string): Promise<string | null> => {
    try {
      // Fetch user's profile to get Lightning address (lud16 or lud06)
      const [event] = await nostr.query(
        [{ kinds: [0], authors: [pubkey], limit: 1 }],
        { signal: AbortSignal.timeout(5000) }
      );

      if (!event) {
        console.log('No profile found for pubkey:', pubkey);
        return null;
      }

      // Parse the metadata
      const metadata: NostrMetadata = n.json().pipe(n.metadata()).parse(event.content);
      console.log('User metadata:', metadata);

      // Check for lud16 (Lightning address) first, then lud06 (LNURL)
      if (metadata.lud16) {
        console.log('Found lud16:', metadata.lud16);
        // Convert Lightning address to LNURL
        const [username, domain] = metadata.lud16.split('@');
        if (username && domain) {
          const lnurlp = `https://${domain}/.well-known/lnurlp/${username}`;
          console.log('Generated LNURL:', lnurlp);
          return lnurlp;
        }
      }

      if (metadata.lud06) {
        console.log('Found lud06:', metadata.lud06);
        // lud06 is already an LNURL, but we need to decode it
        try {
          // Decode bech32 LNURL
          const decoded = decodeLNURL(metadata.lud06);
          console.log('Decoded LNURL:', decoded);
          return decoded;
        } catch (error) {
          console.error('Error decoding lud06:', error);
        }
      }

      console.log('No Lightning address found in profile for pubkey:', pubkey);
      return null;
    } catch (error) {
      console.error('Error getting LNURL from profile:', error);
      return null;
    }
  };

  /**
   * Fetch LNURL pay request details
   */
  const fetchLNURLPayRequest = async (lnurl: string): Promise<LNURLPayResponse | null> => {
    try {
      // Decode LNURL and make request
      const response = await fetch(lnurl);
      const data = await response.json();

      if (data.tag !== 'payRequest') {
        throw new Error('Invalid LNURL pay request');
      }

      return data;
    } catch (error) {
      console.error('Error fetching LNURL pay request:', error);
      return null;
    }
  };

  /**
   * Create a zap request event (kind 9734)
   */
  const createZapRequest = async (zapRequest: ZapRequest): Promise<NostrEvent | null> => {
    if (!user?.signer) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to send Lightning tips.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      const tags: string[][] = [
        ['relays', 'wss://relay.nostr.band'], // Use current relay
        ['amount', (zapRequest.amount * 1000).toString()], // Convert sats to millisats
        ['p', zapRequest.recipientPubkey],
      ];

      // Add event reference if zapping a specific event
      if (zapRequest.eventId) {
        tags.push(['e', zapRequest.eventId]);
      }

      // Add addressable event coordinate if applicable
      if (zapRequest.eventCoordinate) {
        tags.push(['a', zapRequest.eventCoordinate]);
      }

      const zapRequestEvent = {
        kind: 9734,
        content: zapRequest.comment || '',
        tags,
        created_at: Math.floor(Date.now() / 1000),
      };

      // Sign the event
      const signedEvent = await user.signer.signEvent(zapRequestEvent);
      return signedEvent as NostrEvent;
    } catch (error) {
      console.error('Error creating zap request:', error);
      toast({
        title: 'Failed to create zap request',
        description: 'Could not create Lightning zap request.',
        variant: 'destructive',
      });
      return null;
    }
  };

  /**
   * Send a Lightning zap
   */
  const sendZap = async (zapRequest: ZapRequest): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to send Lightning tips.',
        variant: 'destructive',
      });
      return false;
    }

    setIsZapping(true);

    try {
      // Step 1: Get recipient's LNURL
      const lnurl = await getLNURLFromProfile(zapRequest.recipientPubkey);
      if (!lnurl) {
        toast({
          title: 'Lightning address not found',
          description: 'This user has not set up Lightning payments in their profile (lud16 or lud06).',
          variant: 'destructive',
        });
        return false;
      }

      // Step 2: Fetch LNURL pay request
      const payRequest = await fetchLNURLPayRequest(lnurl);
      if (!payRequest) {
        toast({
          title: 'Invalid Lightning setup',
          description: 'Could not fetch Lightning payment details.',
          variant: 'destructive',
        });
        return false;
      }

      // Check if Nostr zaps are supported
      if (!payRequest.allowsNostr || !payRequest.nostrPubkey) {
        toast({
          title: 'Nostr zaps not supported',
          description: 'This Lightning address does not support Nostr zaps.',
          variant: 'destructive',
        });
        return false;
      }

      // Validate amount
      const amountMillisats = zapRequest.amount * 1000;
      if (amountMillisats < payRequest.minSendable || amountMillisats > payRequest.maxSendable) {
        toast({
          title: 'Invalid amount',
          description: `Amount must be between ${payRequest.minSendable / 1000} and ${payRequest.maxSendable / 1000} sats.`,
          variant: 'destructive',
        });
        return false;
      }

      // Step 3: Create zap request event
      const zapRequestEvent = await createZapRequest(zapRequest);
      if (!zapRequestEvent) {
        return false;
      }

      // Step 4: Send zap request to callback URL
      const callbackUrl = new URL(payRequest.callback);
      callbackUrl.searchParams.set('amount', amountMillisats.toString());
      callbackUrl.searchParams.set('nostr', encodeURIComponent(JSON.stringify(zapRequestEvent)));
      callbackUrl.searchParams.set('lnurl', lnurl);

      const invoiceResponse = await fetch(callbackUrl.toString());
      const invoiceData = await invoiceResponse.json();

      if (!invoiceData.pr) {
        throw new Error('No invoice received');
      }

      // Step 5: Present invoice to user for payment
      // Try WebLN first, then fall back to manual payment
      toast({
        title: 'Lightning Invoice Generated',
        description: 'Please pay the invoice in your Lightning wallet to complete the zap.',
      });

      console.log('Lightning Invoice:', invoiceData.pr);

      // Try to use WebLN if available
      if (window.webln) {
        try {
          await window.webln.enable();
          await window.webln.sendPayment(invoiceData.pr);

          toast({
            title: 'Zap sent! ⚡',
            description: `Successfully sent ${zapRequest.amount} sats!`,
          });
          return true;
        } catch (weblnError) {
          console.error('WebLN payment failed:', weblnError);
          // Fall back to showing invoice
        }
      }

      // If WebLN is not available, copy invoice to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(invoiceData.pr);
        toast({
          title: 'Invoice copied to clipboard',
          description: 'Paste this invoice in your Lightning wallet to complete the zap.',
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending zap:', error);
      toast({
        title: 'Zap failed',
        description: 'Could not send Lightning zap. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsZapping(false);
    }
  };

  return {
    sendZap,
    isZapping,
  };
}

// Extend Window interface for WebLN
declare global {
  interface Window {
    webln?: {
      enable(): Promise<void>;
      sendPayment(paymentRequest: string): Promise<{ preimage: string }>;
    };
  }
}