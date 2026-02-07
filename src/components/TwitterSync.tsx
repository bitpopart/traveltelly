import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useToast } from '@/hooks/useToast';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { 
  Twitter, 
  CheckCircle2,
  AlertCircle,
  Info,
  ExternalLink,
  Settings,
  List,
  Loader2,
  Zap,
  Radio as RadioIcon,
  Link2
} from 'lucide-react';

/**
 * TwitterSync - Nostr.Band Twitter Bot Integration
 * 
 * Based on: https://github.com/nostrband/nostr-twitter-bot-ui
 * Backend API: https://api.xtonostr.com
 * 
 * Features:
 * - Connect Twitter username
 * - Verify Twitter account ownership
 * - Auto-sync tweets to Nostr
 * - Configure relay publishing
 * - View sync history
 */

const API_ENDPOINT = 'https://api.xtonostr.com';

interface Profile {
  name?: string;
  display_name?: string;
  picture?: string;
}

export function TwitterSync() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { nostr } = useNostr();
  
  const [username, setUsername] = useState('');
  const [connectedUsername, setConnectedUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [broadcastType, setBroadcastType] = useState<'public' | 'specific'>('public');
  const [selectedRelays, setSelectedRelays] = useState<string[]>([]);
  const [customRelay, setCustomRelay] = useState('');
  const [verifyMode, setVerifyMode] = useState(false);
  const [verifyTweetLink, setVerifyTweetLink] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const DEFAULT_RELAYS = [
    'wss://relay.nostr.band',
    'wss://nos.lol',
    'wss://relay.damus.io',
    'wss://relay.exit.pub',
    'wss://nostr.mutinywallet.com',
    'wss://nostr.mom',
  ];

  // Load user's Nostr profile
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      
      setIsLoadingProfile(true);
      try {
        const events = await nostr.query([{
          kinds: [0],
          authors: [user.pubkey],
        }], { signal: AbortSignal.timeout(5000) });

        if (events.length > 0) {
          const latest = events.sort((a, b) => b.created_at - a.created_at)[0];
          const profileData = JSON.parse(latest.content);
          setProfile(profileData);

          // Check if Twitter username is in profile
          const twitterTag = latest.tags.find(
            ([name, value]) => name === 'i' && value?.startsWith('twitter:')
          );
          if (twitterTag) {
            const twitterUser = twitterTag[1].split('twitter:')[1];
            setConnectedUsername(twitterUser);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user, nostr]);

  /**
   * Connect Twitter account
   */
  const handleConnect = async () => {
    if (!username.trim()) {
      toast({
        title: 'Username Required',
        description: 'Please enter your Twitter/X username',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login with Nostr to connect your Twitter account',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Get bunker URL for NIP-46 remote signing
      const bunkerUrl = `bunker://${user.pubkey}?relay=wss://relay.nsec.app`;

      // Prepare relays
      const relays = broadcastType === 'public' ? [] : selectedRelays;

      // Call Nostr.Band API to add user
      const response = await fetch(`${API_ENDPOINT}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.replace('@', ''),
          relays,
          bunkerUrl,
          verifyTweetId: verifyTweetLink,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // If 401, need verification
        if (response.status === 401) {
          setVerifyMode(true);
          toast({
            title: 'Verification Required',
            description: 'Please post the verification tweet and paste the link',
          });
          return;
        }

        throw new Error(error.message || 'Failed to connect account');
      }

      const data = await response.json();

      toast({
        title: 'Success!',
        description: `Twitter account @${username} connected! Your tweets will now sync to Nostr.`,
      });

      setConnectedUsername(username);
      setUsername('');
      setVerifyMode(false);
      setVerifyTweetLink('');

    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect Twitter account',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Add custom relay
   */
  const handleAddRelay = () => {
    if (!customRelay.trim()) return;
    
    if (!customRelay.startsWith('wss://')) {
      toast({
        title: 'Invalid Relay',
        description: 'Relay URL must start with wss://',
        variant: 'destructive',
      });
      return;
    }

    if (selectedRelays.includes(customRelay)) {
      toast({
        title: 'Already Added',
        description: 'This relay is already in your list',
        variant: 'destructive',
      });
      return;
    }

    setSelectedRelays([...selectedRelays, customRelay]);
    setCustomRelay('');
  };

  /**
   * Remove relay
   */
  const handleRemoveRelay = (relay: string) => {
    setSelectedRelays(selectedRelays.filter(r => r !== relay));
  };

  /**
   * Generate verification tweet text
   */
  const getVerificationText = () => {
    if (!user) return '';
    const npub = nip19.npubEncode(user.pubkey);
    return encodeURIComponent(`Verifying my account on nostr\n\nMy Public key: "${npub}"`);
  };

  const displayName = profile?.name || profile?.display_name || 
    (user ? `${nip19.npubEncode(user.pubkey).substring(0, 10)}...` : '');
  const avatar = profile?.picture || '';

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5" />
            Twitter/X Sync
          </CardTitle>
          <CardDescription>
            Login with Nostr to sync your Twitter/X account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please login with Nostr to connect your Twitter account
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Twitter className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                Cross-post your tweets to Nostr
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  by Nostr.Band
                </Badge>
              </CardTitle>
              <CardDescription>
                Automatically sync your X/Twitter posts to the Nostr network
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
            {avatar && (
              <img src={avatar} alt={displayName} className="h-10 w-10 rounded-full" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{displayName}</div>
              <div className="text-xs text-muted-foreground">
                {user ? nip19.npubEncode(user.pubkey).substring(0, 20) + '...' : ''}
              </div>
            </div>
            {connectedUsername && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected: @{connectedUsername}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Setup */}
      {!connectedUsername && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Your Twitter Account</CardTitle>
            <CardDescription>
              Enter your Twitter/X username to start syncing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="twitter-username">Twitter Username</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <Input
                    id="twitter-username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                    placeholder="yourusername"
                    className="pl-7"
                  />
                </div>
                <Button 
                  onClick={handleConnect}
                  disabled={!username.trim() || isConnecting}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Next'
                  )}
                </Button>
              </div>
            </div>

            {/* Broadcast Type Selection */}
            <div className="space-y-3">
              <Label>Publishing Mode</Label>
              <RadioGroup value={broadcastType} onValueChange={(value: any) => setBroadcastType(value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="font-normal cursor-pointer">
                    To default public relays (recommended)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="font-normal cursor-pointer">
                    To specific relays
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Custom Relays */}
            {broadcastType === 'specific' && (
              <div className="space-y-3">
                <Label>Custom Relays</Label>
                <div className="flex gap-2">
                  <Input
                    value={customRelay}
                    onChange={(e) => setCustomRelay(e.target.value)}
                    placeholder="wss://relay.example.com"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleAddRelay}
                    disabled={!customRelay.trim()}
                  >
                    Add
                  </Button>
                </div>

                {/* Selected Relays */}
                {selectedRelays.length > 0 && (
                  <div className="space-y-2">
                    {selectedRelays.map((relay) => (
                      <div key={relay} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm font-mono">{relay}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRelay(relay)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Preset Relays */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Quick Add:</Label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_RELAYS.filter(r => !selectedRelays.includes(r)).map((relay) => (
                      <Button
                        key={relay}
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRelays([...selectedRelays, relay])}
                        className="text-xs h-auto py-1"
                      >
                        {relay.replace('wss://', '')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Verification Mode */}
            {verifyMode && (
              <Alert className="border-amber-200 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900">Verification Required</AlertTitle>
                <AlertDescription className="space-y-3 text-sm">
                  <p className="text-amber-800">
                    You must verify that you own the <strong>@{username}</strong> account.
                  </p>
                  
                  <div className="space-y-2">
                    <div className="font-semibold text-amber-900">Step 1: Post Verification Tweet</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        const text = getVerificationText();
                        window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                      }}
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Post Verification Tweet
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verify-link" className="text-amber-900">
                      Step 2: Paste Tweet Link
                    </Label>
                    <Input
                      id="verify-link"
                      value={verifyTweetLink}
                      onChange={(e) => setVerifyTweetLink(e.target.value)}
                      placeholder={`https://twitter.com/${username}/status/123...789`}
                      className="bg-white"
                    />
                  </div>

                  <Button
                    onClick={handleConnect}
                    disabled={!verifyTweetLink.trim() || isConnecting}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Connect'
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">How Twitter Sync Works:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Enter your Twitter username and configure relay settings</li>
                  <li>Verify account ownership by posting a verification tweet</li>
                  <li>Your tweets will automatically sync to Nostr (via Nostr.Band backend)</li>
                  <li>NIP-46 remote signing keeps your keys secure</li>
                  <li>View sync history and manage settings anytime</li>
                </ol>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Connected Account Management */}
      {connectedUsername && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Twitter Account Connected
            </CardTitle>
            <CardDescription>
              Your @{connectedUsername} tweets are syncing to Nostr
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-green-200">
              <Twitter className="h-8 w-8 text-blue-500" />
              <div className="flex-1">
                <div className="font-semibold">@{connectedUsername}</div>
                <div className="text-xs text-muted-foreground">
                  Auto-syncing to {broadcastType === 'public' ? 'default public relays' : `${selectedRelays.length} custom relays`}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://nostr-twitter-bot-ui.vercel.app/${connectedUsername}`, '_blank')}
                >
                  <List className="h-4 w-4 mr-2" />
                  View History
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setConnectedUsername('');
                    toast({
                      title: 'Account Disconnected',
                      description: 'You can reconnect anytime',
                    });
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>

            <Alert>
              <Zap className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Sync Active!</strong> Your tweets are automatically being posted to Nostr. 
                Check the sync history to see which tweets have been published.
              </AlertDescription>
            </Alert>

            {/* Features List */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2 p-3 bg-white rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold mb-1">Automatic Sync</div>
                  <div className="text-muted-foreground">New tweets appear on Nostr automatically</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold mb-1">Secure Signing</div>
                  <div className="text-muted-foreground">NIP-46 remote signing protects your keys</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold mb-1">Media Included</div>
                  <div className="text-muted-foreground">Images and videos from tweets are synced</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-white rounded border">
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold mb-1">Open Source</div>
                  <div className="text-muted-foreground">Powered by Nostr.Band infrastructure</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attribution */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-blue-500" />
              <div>
                <div className="font-semibold text-sm">Powered by Nostr.Band</div>
                <div className="text-xs text-muted-foreground">
                  Open-source Twitter to Nostr bridge
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://nostr-twitter-bot-ui.vercel.app', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Try Original
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://github.com/nostrband/nostr-twitter-bot-ui', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
