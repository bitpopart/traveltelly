import React, { useRef, useState, useEffect } from 'react';
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

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLogin, onSignup }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [bunkerUri, setBunkerUri] = useState('');
  const [nostrConnectUri, setNostrConnectUri] = useState('');
  const nip46CleanupRef = useRef<(() => void) | null>(null);
  const login = useLoginActions();
  const isMobile = useIsMobile();

  // Generate nostrconnect:// URI for client-initiated connections
  useEffect(() => {
    if (isOpen) {
      setConnectionError(null);

      const clientSk = generateSecretKey();
      const clientPubkey = getPublicKey(clientSk);
      const secret = Math.random().toString(36).substring(2, 15);

      const appUrl = window.location.origin;
      const relay = encodeURIComponent('wss://relay.damus.io');
      const relay2 = encodeURIComponent('wss://relay.primal.net');

      const uri = `nostrconnect://${clientPubkey}?relay=${relay}&relay=${relay2}&secret=${secret}&name=${encodeURIComponent('TravelTelly')}&url=${encodeURIComponent(appUrl)}`;
      setNostrConnectUri(uri);

      sessionStorage.setItem('nip46_client_sk', JSON.stringify(Array.from(clientSk)));
      sessionStorage.setItem('nip46_secret', secret);
      sessionStorage.setItem('nip46_client_pubkey', clientPubkey);

      startNip46Listener(clientSk, clientPubkey, secret);
    } else {
      setConnectionError(null);
      setIsWaitingForConnection(false);
    }

    return () => {
      stopNip46Listener();
    };
  }, [isOpen]);

  const handleExtensionLogin = () => {
    setIsLoading(true);
    try {
      if (!('nostr' in window)) {
        throw new Error('Nostr extension not found. Please install a NIP-07 extension.');
      }
      login.extension();
      onLogin();
      onClose();
    } catch (error) {
      console.error('Extension login failed:', error);
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
      console.error('Bunker login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (e?: React.MouseEvent | React.TouchEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    onClose();
    setTimeout(() => {
      if (onSignup) onSignup();
    }, 100);
  };

  const startNip46Listener = async (clientSk: Uint8Array, clientPubkey: string, secret: string) => {
    let isActive = true;
    let loginAttempted = false;
    const subscriptions: { close: () => void }[] = [];
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      isActive = false;
      subscriptions.forEach(sub => { try { sub.close(); } catch { /* ignore */ } });
      subscriptions.length = 0;
      if (timeoutId) { clearTimeout(timeoutId); timeoutId = null; }
    };

    nip46CleanupRef.current = cleanup;

    timeoutId = setTimeout(() => {
      setIsWaitingForConnection(false);
      setConnectionError('No response from signer. Please try again or paste a bunker URI manually.');
      cleanup();
    }, 120000);

    try {
      setIsWaitingForConnection(true);

      const { nip44 } = await import('nostr-tools');
      const { NRelay1 } = await import('@nostrify/nostrify');

      const relays = ['wss://relay.damus.io', 'wss://relay.primal.net', 'wss://nos.lol'];

      const processRelay = async (relayUrl: string) => {
        if (!isActive) return;
        try {
          const relay = new NRelay1(relayUrl);
          const filter = {
            kinds: [24133],
            '#p': [clientPubkey],
            since: Math.floor(Date.now() / 1000) - 10,
          };
          const sub = relay.req([filter]);
          subscriptions.push(sub as { close: () => void });

          for await (const msg of sub) {
            if (!isActive) break;
            if (msg[0] === 'EVENT') {
              const event = msg[2];
              try {
                const conversationKey = nip44.v2.utils.getConversationKey(clientSk, event.pubkey);
                const decrypted = nip44.v2.decrypt(event.content, conversationKey);
                const response = JSON.parse(decrypted);

                if (response.result === secret || response.result === 'ack') {
                  if (loginAttempted) return;
                  loginAttempted = true;

                  const resolvedBunkerUri = `bunker://${event.pubkey}?relay=${encodeURIComponent('wss://relay.damus.io')}&relay=${encodeURIComponent('wss://relay.primal.net')}&secret=${secret}`;
                  setIsLoading(true);

                  try {
                    const loginPromise = login.bunker(resolvedBunkerUri);
                    const timeoutPromise = new Promise<never>((_, reject) =>
                      setTimeout(() => reject(new Error('Bunker connection timeout after 90s')), 90000)
                    );
                    await Promise.race([loginPromise, timeoutPromise]);
                    await new Promise(resolve => setTimeout(resolve, 500));

                    setIsWaitingForConnection(false);
                    setIsLoading(false);
                    setConnectionError(null);
                    onLogin();
                    onClose();
                    cleanup();
                    return;
                  } catch (loginError) {
                    const errorMsg = loginError instanceof Error ? loginError.message : 'Unknown error';
                    if (errorMsg.includes('timeout')) {
                      setConnectionError('Bunker connection timed out. The remote signer may not be responding. Try pasting a bunker URI manually.');
                    } else if (errorMsg.includes('WebSocket')) {
                      setConnectionError('Relay connection issue. Try pasting a bunker URI manually.');
                    } else {
                      setConnectionError(`Connection failed: ${errorMsg}. Try pasting a bunker URI manually.`);
                    }
                    setIsWaitingForConnection(false);
                    setIsLoading(false);
                  }
                }
              } catch {
                // ignore decrypt errors
              }
            }
          }
        } catch {
          // ignore relay errors
        }
      };

      await Promise.all(relays.map(processRelay));
    } catch {
      setIsWaitingForConnection(false);
    }
  };

  const stopNip46Listener = () => {
    if (nip46CleanupRef.current) {
      nip46CleanupRef.current();
      nip46CleanupRef.current = null;
    }
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
                <p className='text-sm text-muted-foreground mb-1 font-medium'>Browser extension login</p>
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
                    <a
                      href='https://getalby.com'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='underline text-primary'
                    >
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
                  // ── Mobile: deep-link buttons for signer apps ──
                  <div className='space-y-4'>
                    <div className='text-center'>
                      <Smartphone className='w-10 h-10 mx-auto mb-2 text-primary' />
                      <p className='font-semibold text-sm'>Open your signer app</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Tap the button for the app installed on your device
                      </p>
                    </div>

                    <div className='space-y-2'>
                      {/* Amber — correct Android intent URI */}
                      <a
                        href={`intent:${nostrConnectUri}#Intent;scheme=nostrconnect;package=com.greenart7c3.nostrsigner;end`}
                        className='block'
                      >
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <span className='text-lg'>🟠</span>
                          <span>Connect with Amber</span>
                        </Button>
                      </a>

                      {/* Nostrum */}
                      <a
                        href={`nostrum://${nostrConnectUri.replace('nostrconnect://', '')}`}
                        className='block'
                      >
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <span className='text-lg'>🔐</span>
                          <span>Connect with Nostrum</span>
                        </Button>
                      </a>

                      {/* Generic fallback */}
                      <a href={nostrConnectUri} className='block'>
                        <Button variant="outline" className='w-full rounded-full py-5 justify-start gap-3'>
                          <Shield className='w-4 h-4' />
                          <span>Open in default signer</span>
                        </Button>
                      </a>
                    </div>

                    {isWaitingForConnection && (
                      <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center'>
                        <div className='flex items-center justify-center gap-2 mb-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-medium text-green-700 dark:text-green-400'>
                            Waiting for approval…
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Approve the connection in your signer app
                        </p>
                      </div>
                    )}

                    {/* Divider */}
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
                      <p className='font-semibold text-sm'>Scan with mobile signer</p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        Use Amber, Nostrum, or any NIP-46 compatible app
                      </p>
                    </div>

                    <div className='flex justify-center p-4 bg-white dark:bg-gray-900 rounded-xl'>
                      <QRCodeSVG value={nostrConnectUri} size={200} level="M" includeMargin={true} className='rounded' />
                    </div>

                    {isWaitingForConnection ? (
                      <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center'>
                        <div className='flex items-center justify-center gap-2 mb-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-medium text-green-700 dark:text-green-400'>Waiting for approval…</p>
                        </div>
                        <p className='text-xs text-muted-foreground'>Approve the connection in your signer app</p>
                      </div>
                    ) : (
                      <p className='text-xs text-muted-foreground text-center'>
                        📱 Scan with Amber, Nostrum, or any NIP-46 signer
                      </p>
                    )}

                    {/* Divider */}
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
              <a
                href='/what-is-nostr'
                className='underline font-medium'
                style={{ color: '#b700d7' }}
              >
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
