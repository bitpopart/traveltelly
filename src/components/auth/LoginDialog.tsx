import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Shield, QrCode, Smartphone, AlertCircle, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { Input } from '@/components/ui/input.tsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLoginActions } from '@/hooks/useLoginActions';
import { useIsMobile } from '@/hooks/useIsMobile';
import { QRCodeSVG } from 'qrcode.react';
import { generateSecretKey, getPublicKey } from 'nostr-tools';

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup?: () => void;
}

// Relays used for NIP-46 handshake
const NIP46_RELAYS = [
  'wss://relay.damus.io',
  'wss://relay.primal.net',
  'wss://nos.lol',
];

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [bunkerUri, setBunkerUri] = useState('');
  const [nostrConnectUri, setNostrConnectUri] = useState('');

  // Keep a stable ref to the session's client keypair + secret
  // so re-renders never generate a new secret mid-session
  const sessionRef = useRef<{
    clientSk: Uint8Array;
    clientPubkey: string;
    secret: string;
  } | null>(null);

  const nip46CleanupRef = useRef<(() => void) | null>(null);
  const login = useLoginActions();
  const isMobile = useIsMobile();

  const stopNip46Listener = useCallback(() => {
    if (nip46CleanupRef.current) {
      nip46CleanupRef.current();
      nip46CleanupRef.current = null;
    }
  }, []);

  const startNip46Listener = useCallback(async () => {
    const session = sessionRef.current;
    if (!session) return;

    const { clientSk, clientPubkey, secret } = session;

    let isActive = true;
    let loginAttempted = false;
    const subs: { close?: () => void; return?: () => void }[] = [];
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      isActive = false;
      subs.forEach(sub => { try { (sub.close ?? sub.return)?.(); } catch { /* ignore */ } });
      subs.length = 0;
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    };
    nip46CleanupRef.current = cleanup;

    timeoutId = setTimeout(() => {
      if (!isActive) return;
      setIsWaitingForConnection(false);
      setConnectionError('No response from signer after 2 minutes. Try again or paste a bunker URI.');
      cleanup();
    }, 120_000);

    setIsWaitingForConnection(true);

    const { nip44 } = await import('nostr-tools');
    const { NRelay1 } = await import('@nostrify/nostrify');

    const processRelay = async (relayUrl: string) => {
      if (!isActive) return;
      try {
        const relay = new NRelay1(relayUrl);
        const filter = {
          kinds: [24133],
          '#p': [clientPubkey],
          since: Math.floor(Date.now() / 1000) - 30,
        };

        const sub = relay.req([filter]);
        subs.push(sub as { close?: () => void; return?: () => void });

        for await (const msg of sub) {
          if (!isActive) break;
          if (msg[0] !== 'EVENT') continue;

          const event = msg[2];
          try {
            const conversationKey = nip44.v2.utils.getConversationKey(clientSk, event.pubkey);
            const decrypted = nip44.v2.decrypt(event.content, conversationKey);
            const response = JSON.parse(decrypted) as {
              id?: string;
              result?: string;
              error?: string;
            };

            // Amber (and other signers) respond to nostrconnect:// by sending
            // kind 24133 with result === <the secret from the URI>.
            // Some signers also send result === "ack" for the connect method.
            // If result matches neither but error === "invalid secret", the
            // signer is responding but has a stale/mismatched URI — surface
            // that as an actionable error instead of silently waiting.
            if (response.error === 'invalid secret') {
              if (isActive && !loginAttempted) {
                setConnectionError(
                  'Secret mismatch: the signer responded but the secret didn\'t match. ' +
                  'Please close and reopen the dialog to get a fresh QR code.'
                );
                setIsWaitingForConnection(false);
                cleanup();
              }
              return;
            }

            const isValidConnect =
              response.result === secret ||
              response.result === 'ack';

            if (!isValidConnect) continue;
            if (loginAttempted) continue;
            loginAttempted = true;

            // For the nostrconnect:// flow (Amber / mobile signers):
            // The signer sends result === secret as acknowledgement.
            // We do NOT need to send a connect request back — the signer
            // already approved. Just build the bunker URI from the signer's
            // pubkey (event.pubkey) and log in directly.
            //
            // For the bunker:// flow, result === "ack" is the response to our
            // earlier connect request, and event.pubkey is also the signer.
            // In both cases the bunker URI is constructed the same way.

            // Build bunker URI from the remote signer's pubkey
            const resolvedBunkerUri =
              `bunker://${event.pubkey}` +
              `?relay=${encodeURIComponent('wss://relay.damus.io')}` +
              `&relay=${encodeURIComponent('wss://relay.primal.net')}` +
              `&secret=${secret}`;

            setIsLoading(true);

            try {
              const loginPromise = login.bunker(resolvedBunkerUri);
              const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('timeout')), 90_000)
              );
              await Promise.race([loginPromise, timeoutPromise]);

              // Small settle delay
              await new Promise(r => setTimeout(r, 500));

              setIsWaitingForConnection(false);
              setIsLoading(false);
              setConnectionError(null);
              onLogin();
              onClose();
              cleanup();
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              setConnectionError(
                msg.includes('timeout')
                  ? 'Signer connected but login timed out. Try pasting the bunker URI manually.'
                  : `Login failed: ${msg}`
              );
              setIsWaitingForConnection(false);
              setIsLoading(false);
            }
          } catch { /* ignore decrypt errors from unrelated events */ }
        }
      } catch { /* ignore relay connection errors */ }
    };

    // Listen on all relays simultaneously
    Promise.all(NIP46_RELAYS.map(processRelay)).catch(() => {
      if (isActive) setIsWaitingForConnection(false);
    });
  }, [login, onClose, onLogin]);

  // Generate a stable session when the dialog opens.
  // The session (clientSk / clientPubkey / secret) is created ONCE per dialog
  // open and stored in sessionRef so that React re-renders never produce a new
  // secret mid-session.  When the dialog closes we clear the ref so the next
  // open always gets a fresh keypair.
  useEffect(() => {
    if (!isOpen) {
      stopNip46Listener();
      // Wipe the session so the next open generates fresh keys
      sessionRef.current = null;
      setConnectionError(null);
      setIsWaitingForConnection(false);
      return;
    }

    // Guard: if a session already exists (e.g. due to a double-run in
    // StrictMode or a re-render that flipped isOpen → true again),
    // don't overwrite it — reuse the same keys so Amber's response still
    // matches the QR code the user already scanned.
    if (!sessionRef.current) {
      const clientSk = generateSecretKey();
      const clientPubkey = getPublicKey(clientSk);
      const secret = Math.random().toString(36).substring(2, 18);
      sessionRef.current = { clientSk, clientPubkey, secret };
    }

    const { clientPubkey, secret } = sessionRef.current;

    const appUrl = window.location.origin;
    const relayParams = NIP46_RELAYS
      .map(r => `relay=${encodeURIComponent(r)}`)
      .join('&');

    const uri =
      `nostrconnect://${clientPubkey}` +
      `?${relayParams}` +
      `&secret=${secret}` +
      `&name=${encodeURIComponent('TravelTelly')}` +
      `&url=${encodeURIComponent(appUrl)}` +
      `&perms=${encodeURIComponent('sign_event,nip44_encrypt,nip44_decrypt')}`;

    setNostrConnectUri(uri);
    setConnectionError(null);

    startNip46Listener();

    return () => stopNip46Listener();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleExtensionLogin = () => {
    setIsLoading(true);
    try {
      if (!('nostr' in window)) {
        throw new Error('No Nostr extension found. Please install Alby or nos2x.');
      }
      login.extension();
      onLogin();
      onClose();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Extension login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBunkerLogin = () => {
    if (!bunkerUri.trim() || !bunkerUri.startsWith('bunker://')) return;
    setIsLoading(true);
    try {
      login.bunker(bunkerUri);
      onLogin();
      onClose();
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : 'Bunker login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose();
    setTimeout(() => { if (onSignup) onSignup(); }, 100);
  };

  const defaultTab = 'nostr' in window ? 'extension' : 'bunker';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='px-6 pt-6 pb-0'>
          <DialogTitle className='text-xl font-semibold text-center'>Log in to TravelTelly</DialogTitle>
          <DialogDescription className='text-center text-muted-foreground mt-1'>
            Use your Nostr identity to sign in securely
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 py-6 space-y-5'>
          {connectionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue={defaultTab} className='w-full'>
            <TabsList className='grid grid-cols-2 mb-5'>
              <TabsTrigger value='extension'>
                <Shield className='w-3.5 h-3.5 mr-1.5' />
                Extension
              </TabsTrigger>
              <TabsTrigger value='bunker'>
                <Smartphone className='w-3.5 h-3.5 mr-1.5' />
                Bunker / App
              </TabsTrigger>
            </TabsList>

            {/* ── Extension tab ── */}
            <TabsContent value='extension' className='space-y-4'>
              <div className='text-center p-5 rounded-xl bg-muted/50'>
                <Shield className='w-10 h-10 mx-auto mb-3 text-primary' />
                <p className='text-sm font-medium mb-1'>Browser extension login</p>
                <p className='text-xs text-muted-foreground mb-4'>
                  Works with Alby, nos2x, Flamingo, and any NIP-07 extension.
                </p>
                <Button
                  className='w-full rounded-full py-5'
                  onClick={handleExtensionLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in…' : 'Login with Extension'}
                </Button>
                {'nostr' in window ? (
                  <p className='text-xs text-green-600 mt-2'>✓ Extension detected</p>
                ) : (
                  <p className='text-xs text-muted-foreground mt-2'>
                    No extension found.{' '}
                    <a href='https://getalby.com' target='_blank' rel='noopener noreferrer' className='underline text-primary'>
                      Get Alby ↗
                    </a>
                  </p>
                )}
              </div>
            </TabsContent>

            {/* ── Bunker / App tab ── */}
            <TabsContent value='bunker' className='space-y-4'>
              <div className='rounded-xl bg-muted/50 p-4'>
                {isMobile ? (
                  // ── Mobile: one-tap signer buttons ──
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <Smartphone className='w-10 h-10 mx-auto mb-2 text-primary' />
                      <p className='font-semibold text-sm'>Open your signer app</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Tap the button for the app installed on your phone
                      </p>
                    </div>

                    <div className='space-y-2'>
                      {/* Amber — Android intent URI with correct package */}
                      <a
                        href={`intent:${nostrConnectUri}#Intent;scheme=nostrconnect;package=com.greenart7c3.nostrsigner;end`}
                        className='block'
                        onClick={() => setIsWaitingForConnection(true)}
                      >
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <span className='text-lg'>🟠</span>
                          <div className='text-left'>
                            <p className='font-semibold text-sm'>Connect with Amber</p>
                            <p className='text-xs text-muted-foreground font-normal'>Recommended for Android</p>
                          </div>
                        </Button>
                      </a>

                      {/* Nostrum */}
                      <a
                        href={`nostrum://${nostrConnectUri.replace('nostrconnect://', '')}`}
                        className='block'
                        onClick={() => setIsWaitingForConnection(true)}
                      >
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <span className='text-lg'>🔐</span>
                          <div className='text-left'>
                            <p className='font-semibold text-sm'>Connect with Nostrum</p>
                            <p className='text-xs text-muted-foreground font-normal'>iOS & Android</p>
                          </div>
                        </Button>
                      </a>

                      {/* Generic */}
                      <a
                        href={nostrConnectUri}
                        className='block'
                        onClick={() => setIsWaitingForConnection(true)}
                      >
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <Shield className='w-5 h-5 shrink-0' />
                          <div className='text-left'>
                            <p className='font-semibold text-sm'>Open in default signer</p>
                            <p className='text-xs text-muted-foreground font-normal'>Any NIP-46 compatible app</p>
                          </div>
                        </Button>
                      </a>
                    </div>

                    {isWaitingForConnection && (
                      <div className='bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl text-center'>
                        <div className='flex items-center justify-center gap-2 mb-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-semibold text-green-700 dark:text-green-400'>
                            Waiting for approval…
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Approve the connection request in your signer app
                        </p>
                      </div>
                    )}

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'><span className='w-full border-t' /></div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-muted/50 px-2 text-muted-foreground'>or paste bunker URI</span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Input
                        value={bunkerUri}
                        onChange={(e) => setBunkerUri(e.target.value)}
                        placeholder='bunker://...'
                        className='font-mono text-xs'
                      />
                      {bunkerUri && !bunkerUri.startsWith('bunker://') && (
                        <p className='text-red-500 text-xs'>URI must start with bunker://</p>
                      )}
                      <Button
                        className='w-full rounded-full py-5'
                        onClick={handleBunkerLogin}
                        disabled={isLoading || !bunkerUri.trim() || !bunkerUri.startsWith('bunker://')}
                      >
                        {isLoading ? 'Connecting…' : 'Connect with URI'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // ── Desktop: QR code ──
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <QrCode className='w-10 h-10 mx-auto mb-2 text-primary' />
                      <p className='font-semibold text-sm'>Scan with your mobile signer</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Use Amber, Nostrum, or any NIP-46 compatible app
                      </p>
                    </div>

                    <div className='flex justify-center p-4 bg-white dark:bg-gray-900 rounded-xl'>
                      {nostrConnectUri && (
                        <QRCodeSVG value={nostrConnectUri} size={200} level="M" includeMargin className='rounded' />
                      )}
                    </div>

                    {isWaitingForConnection ? (
                      <div className='bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-xl text-center'>
                        <div className='flex items-center justify-center gap-2 mb-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-semibold text-green-700 dark:text-green-400'>Waiting for approval…</p>
                        </div>
                        <p className='text-xs text-muted-foreground'>Approve the connection in your signer app</p>
                      </div>
                    ) : (
                      <p className='text-xs text-muted-foreground text-center'>
                        📱 Scan with Amber, Nostrum, or any NIP-46 signer
                      </p>
                    )}

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'><span className='w-full border-t' /></div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-muted/50 px-2 text-muted-foreground'>or paste bunker URI</span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Input
                        value={bunkerUri}
                        onChange={(e) => setBunkerUri(e.target.value)}
                        placeholder='bunker://...'
                        className='font-mono text-xs'
                      />
                      {bunkerUri && !bunkerUri.startsWith('bunker://') && (
                        <p className='text-red-500 text-xs'>URI must start with bunker://</p>
                      )}
                      <Button
                        className='w-full rounded-full py-5'
                        onClick={handleBunkerLogin}
                        disabled={isLoading || !bunkerUri.trim() || !bunkerUri.startsWith('bunker://')}
                      >
                        {isLoading ? 'Connecting…' : 'Connect with URI'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* No nsec login — safety notice */}
          <div className='rounded-xl border border-muted bg-muted/30 px-4 py-3 flex items-start gap-3'>
            <Lock className='w-4 h-4 text-muted-foreground shrink-0 mt-0.5' />
            <p className='text-xs text-muted-foreground leading-relaxed'>
              <span className='font-semibold text-foreground'>We don't support nsec (private key) login.</span>{' '}
              Pasting your private key into websites risks losing everything. Use a browser extension or signer app — they keep your key safe.{' '}
              <a href='/what-is-nostr' className='underline font-medium' style={{ color: '#b700d7' }}>
                Learn about Nostr login →
              </a>
            </p>
          </div>

          {/* Footer */}
          <div className='text-center text-sm space-y-1.5'>
            <p className='text-muted-foreground'>
              Don't have an account?{' '}
              <button
                onClick={handleSignupClick}
                onTouchEnd={handleSignupClick}
                type="button"
                className='text-primary hover:underline font-medium cursor-pointer touch-manipulation'
                style={{ WebkitTapHighlightColor: 'transparent', userSelect: 'none' }}
              >
                Sign up
              </button>
            </p>
            <p>
              <a href='/what-is-nostr' className='text-xs font-medium hover:underline' style={{ color: '#b700d7' }}>
                <ExternalLink className='w-3 h-3 inline mr-0.5' />
                What is Nostr?
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
