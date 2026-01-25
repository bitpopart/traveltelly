// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import React, { useRef, useState, useEffect } from 'react';
import { Shield, Upload, QrCode, Smartphone } from 'lucide-react';
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
  const [nsec, setNsec] = useState('');
  const [bunkerUri, setBunkerUri] = useState('');
  const [nostrConnectUri, setNostrConnectUri] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const login = useLoginActions();
  const isMobile = useIsMobile();

  // Generate nostrconnect:// URI for client-initiated connections
  useEffect(() => {
    if (isOpen) {
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
      
      // Store the keypair and secret in sessionStorage for the connection flow
      sessionStorage.setItem('nip46_client_sk', JSON.stringify(Array.from(clientSk)));
      sessionStorage.setItem('nip46_secret', secret);
      sessionStorage.setItem('nip46_client_pubkey', clientPubkey);
    }
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

                    <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center'>
                      <p className='text-xs text-muted-foreground'>
                        📱 Scan with Nostrum, Amber, or any NIP-46 compatible signer
                      </p>
                    </div>

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
