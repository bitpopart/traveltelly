// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import React, { useRef, useState, useEffect } from 'react';
import { Shield, Upload, QrCode, Smartphone, AlertCircle } from 'lucide-react';
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
  const [nsec, setNsec] = useState('');
  const [bunkerUri, setBunkerUri] = useState('');
  const [nostrConnectUri, setNostrConnectUri] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nip46CleanupRef = useRef<(() => void) | null>(null);
  const login = useLoginActions();
  const isMobile = useIsMobile();

  // Generate nostrconnect:// URI for client-initiated connections
  useEffect(() => {
    if (isOpen) {
      // Clear any previous errors
      setConnectionError(null);
      
      // Generate a client keypair for this connection
      const clientSk = generateSecretKey();
      const clientPubkey = getPublicKey(clientSk);
      const secret = Math.random().toString(36).substring(2, 15);
      
      // Use current app URL as relay
      const appUrl = window.location.origin;
      const relay = encodeURIComponent('wss://relay.damus.io');
      const relay2 = encodeURIComponent('wss://relay.primal.net');
      
      // Generate nostrconnect URI for QR code and deep links
      const uri = `nostrconnect://${clientPubkey}?relay=${relay}&relay=${relay2}&secret=${secret}&name=${encodeURIComponent('TravelTelly')}&url=${encodeURIComponent(appUrl)}`;
      setNostrConnectUri(uri);
      
      console.log('🔑 Generated nostrconnect URI:', uri);
      console.log('   Client pubkey:', clientPubkey);
      console.log('   Secret:', secret);
      
      // Store the keypair and secret in sessionStorage for the connection flow
      sessionStorage.setItem('nip46_client_sk', JSON.stringify(Array.from(clientSk)));
      sessionStorage.setItem('nip46_secret', secret);
      sessionStorage.setItem('nip46_client_pubkey', clientPubkey);

      // Start listening for remote signer connection
      startNip46Listener(clientSk, clientPubkey, secret);
    } else {
      // Clear error when dialog closes
      setConnectionError(null);
      setIsWaitingForConnection(false);
    }

    return () => {
      // Cleanup listener on unmount
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

  const handleKeyLogin = () => {
    if (!nsec.trim()) return;
    setIsLoading(true);
    
    try {
      login.nsec(nsec);
      onLogin();
      onClose();
    } catch (error) {
      console.error('Nsec login failed:', error);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNsec(content.trim());
    };
    reader.readAsText(file);
  };

  const handleSignupClick = () => {
    onClose();
    if (onSignup) {
      onSignup();
    }
  };

  const startNip46Listener = async (clientSk: Uint8Array, clientPubkey: string, secret: string) => {
    // Store cleanup function
    let isActive = true;
    let loginAttempted = false; // Prevent multiple login attempts
    const subscriptions: any[] = [];
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanup = () => {
      isActive = false;
      subscriptions.forEach(sub => {
        try {
          sub.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      subscriptions.length = 0;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    nip46CleanupRef.current = cleanup;

    // Set a timeout for the connection (2 minutes)
    timeoutId = setTimeout(() => {
      console.log('⏱️ NIP-46 connection timeout (no response received)');
      setIsWaitingForConnection(false);
      setConnectionError('No response from signer. Please try again or use manual bunker URI.');
      cleanup();
    }, 120000);

    try {
      setIsWaitingForConnection(true);
      
      // Import required functions
      const { nip44 } = await import('nostr-tools');
      const { NRelay1 } = await import('@nostrify/nostrify');
      
      // Connect to multiple relays to listen for remote signer connection
      const relays = [
        'wss://relay.damus.io',
        'wss://relay.primal.net', 
        'wss://nos.lol', // Popular relay for NIP-46
      ];
      
      console.log('🔌 Starting NIP-46 listener');
      console.log('  Client pubkey:', clientPubkey);
      console.log('  Secret:', secret);
      console.log('  Relays:', relays);
      
      const processRelay = async (relayUrl: string) => {
        if (!isActive) return;

        try {
          const relay = new NRelay1(relayUrl);
          
          console.log('🔌 Listening on', relayUrl);
          
          // Subscribe to events from the remote signer
          const filter = {
            kinds: [24133], // NIP-46 response kind
            '#p': [clientPubkey],
            since: Math.floor(Date.now() / 1000) - 10, // Start from 10 seconds ago
          };
          
          console.log('📡 Subscribing with filter:', filter);
          const sub = relay.req([filter]);
          subscriptions.push(sub);

          // Listen for connection approval
          for await (const msg of sub) {
            if (!isActive) break;
            
            if (msg[0] === 'EVENT') {
              const event = msg[2];
              
              console.log('📨 Received NIP-46 event from', event.pubkey);
              
              try {
                // Decrypt the content using NIP-44 v2
                console.log('🔐 Attempting to decrypt event...');
                
                // First get the conversation key
                const conversationKey = nip44.v2.utils.getConversationKey(clientSk, event.pubkey);
                const decrypted = nip44.v2.decrypt(event.content, conversationKey);
                
                console.log('🔓 Decrypted response:', decrypted);
                
                const response = JSON.parse(decrypted);
                console.log('📦 Parsed response:', response);
                console.log('   Response keys:', Object.keys(response));
                console.log('   Expected secret:', secret);
                console.log('   Received result:', response.result);
                console.log('   Response method:', response.method);
                console.log('   Is connect response?', response.result === secret || response.result === 'ack');
                
                // Verify this is a connect response with the correct secret
                if (response.result === secret || response.result === 'ack') {
                  console.log('✅ Connection approved! Remote signer pubkey:', event.pubkey);
                  
                  // Prevent multiple login attempts from different relay listeners
                  if (loginAttempted) {
                    console.log('⚠️ Login already attempted, skipping');
                    return;
                  }
                  loginAttempted = true;
                  
                  // Build the bunker URI
                  const bunkerUri = `bunker://${event.pubkey}?relay=${encodeURIComponent('wss://relay.damus.io')}&relay=${encodeURIComponent('wss://relay.primal.net')}&secret=${secret}`;
                  
                  console.log('🔗 Logging in with bunker URI:', bunkerUri);
                  
                  // Automatically log in
                  setIsLoading(true);
                  
                  try {
                    console.log('⏳ Attempting bunker login (this may take up to 90 seconds)...');
                    
                    // Increase timeout to 90 seconds for bunker login
                    const loginPromise = login.bunker(bunkerUri);
                    const timeoutPromise = new Promise((_, reject) => 
                      setTimeout(() => reject(new Error('Bunker connection timeout after 90s')), 90000)
                    );
                    
                    await Promise.race([loginPromise, timeoutPromise]);
                    
                    console.log('✅ Login successful! Closing dialog...');
                    
                    // Small delay to ensure state is updated
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Success!
                    setIsWaitingForConnection(false);
                    setIsLoading(false);
                    setConnectionError(null);
                    onLogin();
                    onClose();
                    cleanup();
                    return;
                  } catch (loginError) {
                    console.error('❌ Bunker login failed:', loginError);
                    const errorMsg = loginError instanceof Error ? loginError.message : 'Unknown error';
                    console.error('   Error:', errorMsg);
                    
                    // Show user-friendly error
                    if (errorMsg.includes('timeout')) {
                      setConnectionError('Bunker connection timed out. The remote signer may not be responding. Try manual bunker URI below.');
                    } else if (errorMsg.includes('WebSocket')) {
                      setConnectionError('Relay connection issue. Try using a manual bunker URI below.');
                    } else {
                      setConnectionError(`Connection failed: ${errorMsg}. Try manual bunker URI below.`);
                    }
                    
                    setIsWaitingForConnection(false);
                    setIsLoading(false);
                    // Don't cleanup - keep UI available for manual bunker URI entry
                  }
                } else {
                  console.log('⚠️ Response result did not match secret. Expected:', secret, 'Got:', response.result);
                }
              } catch (error) {
                console.error('❌ Failed to process NIP-46 event:', error);
                if (error instanceof Error) {
                  console.error('   Error message:', error.message);
                  console.error('   Error stack:', error.stack);
                }
              }
            }
          }
        } catch (error) {
          console.error('Relay error:', relayUrl, error);
        }
      };

      // Listen on all relays simultaneously
      await Promise.all(relays.map(processRelay));
      
    } catch (error) {
      console.error('NIP-46 listener error:', error);
      setIsWaitingForConnection(false);
    }
  };

  const stopNip46Listener = () => {
    if (nip46CleanupRef.current) {
      nip46CleanupRef.current();
      nip46CleanupRef.current = null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md p-0 overflow-hidden rounded-2xl'>
        <DialogHeader className='px-6 pt-6 pb-0 relative'>
          <DialogTitle className='text-xl font-semibold text-center'>Log in</DialogTitle>
          <DialogDescription className='text-center text-muted-foreground mt-2'>
            Access your account securely with your preferred method
          </DialogDescription>
        </DialogHeader>

        <div className='px-6 py-8 space-y-6'>
          {connectionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{connectionError}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue={'nostr' in window ? 'extension' : 'key'} className='w-full'>
            <TabsList className='grid grid-cols-3 mb-6'>
              <TabsTrigger value='extension'>Extension</TabsTrigger>
              <TabsTrigger value='key'>Nsec</TabsTrigger>
              <TabsTrigger value='bunker'>Bunker</TabsTrigger>
            </TabsList>

            <TabsContent value='extension' className='space-y-4'>
              <div className='text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
                <Shield className='w-12 h-12 mx-auto mb-3 text-primary' />
                <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>
                  Login with one click using the browser extension
                </p>
                <Button
                  className='w-full rounded-full py-6'
                  onClick={handleExtensionLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login with Extension'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='key' className='space-y-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label htmlFor='nsec' className='text-sm font-medium text-gray-700 dark:text-gray-400'>
                    Enter your nsec
                  </label>
                  <Input
                    type='password'
                    id='nsec'
                    value={nsec}
                    onChange={(e) => setNsec(e.target.value)}
                    className='rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-primary'
                    placeholder='nsec1...'
                  />
                </div>

                <div className='text-center'>
                  <p className='text-sm mb-2 text-gray-600 dark:text-gray-400'>Or upload a key file</p>
                  <input
                    type='file'
                    accept='.txt'
                    className='hidden'
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant='outline'
                    className='w-full dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700'
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className='w-4 h-4 mr-2' />
                    Upload Nsec File
                  </Button>
                </div>

                <Button
                  className='w-full rounded-full py-6 mt-4'
                  onClick={handleKeyLogin}
                  disabled={isLoading || !nsec.trim()}
                >
                  {isLoading ? 'Verifying...' : 'Login with Nsec'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='bunker' className='space-y-4'>
              <div className='p-4 rounded-lg bg-gray-50 dark:bg-gray-800'>
                {isMobile ? (
                  // Mobile: Show one-tap buttons for popular signers
                  <div className='space-y-4'>
                    <div className='text-center mb-4'>
                      <Smartphone className='w-12 h-12 mx-auto mb-3 text-primary' />
                      <h3 className='font-semibold mb-2'>One-Tap Sign In</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        Connect with your mobile signer app
                      </p>
                    </div>

                    {/* Popular mobile signer buttons */}
                    <div className='space-y-2'>
                      <a
                        href={`nostrum://${nostrConnectUri.replace('nostrconnect://', '')}`}
                        className='block'
                      >
                        <Button
                          variant="outline"
                          className='w-full rounded-full py-6'
                        >
                          <Shield className='w-4 h-4 mr-2' />
                          Open in Nostrum
                        </Button>
                      </a>

                      <a
                        href={`amber:${nostrConnectUri}`}
                        className='block'
                      >
                        <Button
                          variant="outline"
                          className='w-full rounded-full py-6'
                        >
                          <Shield className='w-4 h-4 mr-2' />
                          Open in Amber
                        </Button>
                      </a>

                      <a
                        href={nostrConnectUri}
                        className='block'
                      >
                        <Button
                          variant="outline"
                          className='w-full rounded-full py-6'
                        >
                          <Shield className='w-4 h-4 mr-2' />
                          Open in Default Signer
                        </Button>
                      </a>
                    </div>

                    {isWaitingForConnection && (
                      <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-medium text-green-700 dark:text-green-400'>
                            Waiting for connection...
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Approve the connection in your signer app
                        </p>
                      </div>
                    )}

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t' />
                      </div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-gray-50 dark:bg-gray-800 px-2 text-muted-foreground'>
                          Or paste bunker URI
                        </span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Input
                        id='bunkerUriMobile'
                        value={bunkerUri}
                        onChange={(e) => setBunkerUri(e.target.value)}
                        className='rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-primary'
                        placeholder='bunker://...'
                      />
                      {bunkerUri && !bunkerUri.startsWith('bunker://') && (
                        <p className='text-red-500 text-xs'>URI must start with bunker://</p>
                      )}
                    </div>

                    <Button
                      className='w-full rounded-full py-6'
                      onClick={handleBunkerLogin}
                      disabled={isLoading || !bunkerUri.trim() || !bunkerUri.startsWith('bunker://')}
                    >
                      {isLoading ? 'Connecting...' : 'Connect with URI'}
                    </Button>
                  </div>
                ) : (
                  // Desktop: Show QR code
                  <div className='space-y-4'>
                    <div className='text-center mb-4'>
                      <QrCode className='w-12 h-12 mx-auto mb-3 text-primary' />
                      <h3 className='font-semibold mb-2'>Scan with Mobile Signer</h3>
                      <p className='text-sm text-gray-600 dark:text-gray-300'>
                        Use your mobile app to scan and approve the connection
                      </p>
                    </div>

                    {/* QR Code */}
                    <div className='flex justify-center p-6 bg-white dark:bg-gray-900 rounded-lg'>
                      <QRCodeSVG
                        value={nostrConnectUri}
                        size={220}
                        level="M"
                        includeMargin={true}
                        className='rounded'
                      />
                    </div>

                    {isWaitingForConnection ? (
                      <div className='bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center'>
                        <div className='flex items-center justify-center gap-2 mb-2'>
                          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                          <p className='text-sm font-medium text-green-700 dark:text-green-400'>
                            Waiting for connection...
                          </p>
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          Approve the connection in your signer app
                        </p>
                      </div>
                    ) : (
                      <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center'>
                        <p className='text-xs text-muted-foreground'>
                          📱 Scan with Nostrum, Amber, or any NIP-46 compatible signer
                        </p>
                      </div>
                    )}

                    <div className='relative'>
                      <div className='absolute inset-0 flex items-center'>
                        <span className='w-full border-t' />
                      </div>
                      <div className='relative flex justify-center text-xs uppercase'>
                        <span className='bg-gray-50 dark:bg-gray-800 px-2 text-muted-foreground'>
                          Or paste bunker URI
                        </span>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Input
                        id='bunkerUri'
                        value={bunkerUri}
                        onChange={(e) => setBunkerUri(e.target.value)}
                        className='rounded-lg border-gray-300 dark:border-gray-700 focus-visible:ring-primary'
                        placeholder='bunker://...'
                      />
                      {bunkerUri && !bunkerUri.startsWith('bunker://') && (
                        <p className='text-red-500 text-xs'>URI must start with bunker://</p>
                      )}
                    </div>

                    <Button
                      className='w-full rounded-full py-6'
                      onClick={handleBunkerLogin}
                      disabled={isLoading || !bunkerUri.trim() || !bunkerUri.startsWith('bunker://')}
                    >
                      {isLoading ? 'Connecting...' : 'Connect with URI'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className='text-center text-sm'>
            <p className='text-gray-600 dark:text-gray-400'>
              Don't have an account?{' '}
              <button
                onClick={handleSignupClick}
                className='text-primary hover:underline font-medium'
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
