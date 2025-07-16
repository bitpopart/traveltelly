import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useAuthor } from '@/hooks/useAuthor';
import { Zap, Check, AlertCircle } from 'lucide-react';

export function LightningSetup() {
  const [lightningAddress, setLightningAddress] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending: isUpdating } = useNostrPublish();
  const { toast } = useToast();
  const author = useAuthor(user?.pubkey || '');
  const metadata = author.data?.metadata;

  const validateLightningAddress = async (address: string) => {
    if (!address || !address.includes('@')) {
      setIsValid(false);
      return;
    }

    setIsValidating(true);
    try {
      // Convert Lightning address to LNURL
      const [username, domain] = address.split('@');
      const lnurlUrl = `https://${domain}/.well-known/lnurlp/${username}`;

      const response = await fetch(lnurlUrl);
      const data = await response.json();

      if (data.tag === 'payRequest' && data.callback) {
        setIsValid(true);
      } else {
        setIsValid(false);
      }
    } catch (error) {
      console.error('Lightning address validation failed:', error);
      setIsValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAddressChange = (value: string) => {
    setLightningAddress(value);
    setIsValid(null);

    // Debounced validation
    if (value.includes('@')) {
      const timeoutId = setTimeout(() => {
        validateLightningAddress(value);
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleSaveAddress = () => {
    if (!user || !lightningAddress || !isValid) return;

    // Get current metadata from author data
    const currentMetadata = metadata || {};
    const updatedMetadata = {
      ...currentMetadata,
      lud16: lightningAddress, // Lightning address (NIP-57)
    };

    createEvent({
      kind: 0,
      content: JSON.stringify(updatedMetadata),
      tags: [],
    });

    toast({
      title: 'Lightning address saved!',
      description: 'You can now receive Lightning tips on your reviews.',
    });
  };

  if (!user) {
    return null;
  }

  const currentLightningAddress = metadata?.lud16 || metadata?.lud06;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Lightning Tips Setup
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLightningAddress && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Lightning tips enabled
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Current address: {currentLightningAddress}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="lightning-address">Lightning Address</Label>
          <div className="relative">
            <Input
              id="lightning-address"
              type="email"
              placeholder="username@domain.com"
              value={lightningAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={
                isValid === true ? 'border-green-500' :
                isValid === false ? 'border-red-500' : ''
              }
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
              </div>
            )}
            {isValid === true && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
            )}
            {isValid === false && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-red-500" />
            )}
          </div>

          {isValid === false && (
            <p className="text-sm text-red-600 dark:text-red-400">
              Invalid Lightning address. Please check the format and try again.
            </p>
          )}

          {isValid === true && (
            <p className="text-sm text-green-600 dark:text-green-400">
              ✅ Valid Lightning address detected!
            </p>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Popular Lightning Address Providers:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Wallet of Satoshi</Badge>
            <Badge variant="outline">Strike</Badge>
            <Badge variant="outline">Cash App</Badge>
            <Badge variant="outline">Alby</Badge>
            <Badge variant="outline">Phoenix</Badge>
          </div>
        </div>

        <Button
          onClick={handleSaveAddress}
          disabled={!lightningAddress || !isValid || isUpdating}
          className="w-full"
        >
          {isUpdating ? 'Saving...' : 'Save Lightning Address'}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 A Lightning address allows others to send you Bitcoin tips instantly.</p>
          <p>⚡ Popular wallets like Wallet of Satoshi provide free Lightning addresses.</p>
          <p>🔒 Your Lightning address will be stored in your Nostr profile.</p>
        </div>
      </CardContent>
    </Card>
  );
}