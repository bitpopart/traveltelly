import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAllSubscriptions, formatExpiryDate } from '@/hooks/useMarketplaceSubscription';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { genUserName } from '@/lib/genUserName';
import { Crown, Calendar, Users, Plus, Check, X, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';

function SubscriptionRow({ userPubkey, subscription }: { userPubkey: string; subscription: any }) {
  const author = useAuthor(userPubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(userPubkey);

  let shortNpub = '';
  try {
    const npub = nip19.npubEncode(userPubkey);
    shortNpub = `${npub.slice(0, 8)}...${npub.slice(-4)}`;
  } catch (e) {
    shortNpub = `${userPubkey.slice(0, 8)}...`;
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200';
      case 'yearly': return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200';
      case 'monthly': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        <Avatar className="h-10 w-10">
          <AvatarImage src={metadata?.picture} alt={displayName} />
          <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{displayName}</div>
          <div className="text-sm text-muted-foreground truncate">{shortNpub}</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge className={getTypeColor(subscription.type)}>
          {subscription.type === 'free' ? (
            <><Crown className="w-3 h-3 mr-1" /> Free</>
          ) : (
            subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)
          )}
        </Badge>

        {subscription.isActive ? (
          <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
            <Check className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
            <X className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        )}

        <div className="text-sm text-muted-foreground min-w-[120px] text-right">
          {subscription.type === 'free' ? (
            'Never expires'
          ) : (
            <>
              {subscription.isActive ? 'Expires' : 'Expired'}{' '}
              {formatDistanceToNow(new Date(subscription.expiryDate * 1000), { addSuffix: true })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminSubscriptionManager() {
  const { user } = useCurrentUser();
  const { data: subscriptions, isLoading, refetch } = useAllSubscriptions();
  const { mutate: publishEvent, isPending } = useNostrPublish();
  const { toast } = useToast();

  const [newSubForm, setNewSubForm] = useState({
    npub: '',
    type: 'monthly' as 'monthly' | 'yearly' | 'free',
    duration: '30',
  });

  const handleAddSubscription = () => {
    try {
      // Decode npub to hex
      const decoded = nip19.decode(newSubForm.npub);
      if (decoded.type !== 'npub') {
        toast({
          title: 'Invalid npub',
          description: 'Please enter a valid npub address',
          variant: 'destructive',
        });
        return;
      }

      const userPubkey = decoded.data;
      const now = Math.floor(Date.now() / 1000);

      // Calculate expiry based on type
      let expiryDate: number;
      if (newSubForm.type === 'free') {
        expiryDate = now + (100 * 365 * 24 * 60 * 60); // 100 years
      } else if (newSubForm.type === 'yearly') {
        expiryDate = now + (365 * 24 * 60 * 60); // 1 year
      } else {
        expiryDate = now + (parseInt(newSubForm.duration) * 24 * 60 * 60); // Custom days
      }

      // Create subscription event
      publishEvent({
        kind: 7001,
        content: `Marketplace subscription: ${newSubForm.type}`,
        tags: [
          ['p', userPubkey],
          ['subscription_type', newSubForm.type],
          ['start_date', now.toString()],
          ['expiry_date', expiryDate.toString()],
        ],
      }, {
        onSuccess: () => {
          toast({
            title: 'Subscription created',
            description: 'User subscription has been activated',
          });
          setNewSubForm({ npub: '', type: 'monthly', duration: '30' });
          setTimeout(() => refetch(), 2000);
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to create subscription',
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid npub format',
        variant: 'destructive',
      });
    }
  };

  if (!user) {
    return (
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>Please log in to manage subscriptions</AlertDescription>
      </Alert>
    );
  }

  const activeSubscriptions = subscriptions?.filter(s => s.subscription.isActive) || [];
  const expiredSubscriptions = subscriptions?.filter(s => !s.subscription.isActive) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Marketplace Subscriptions
          </CardTitle>
          <CardDescription>
            Manage user subscriptions to the stock media marketplace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscriptions?.length || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {activeSubscriptions.length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Expired Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {expiredSubscriptions.length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Add New Subscription */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="npub">User npub</Label>
                  <Input
                    id="npub"
                    placeholder="npub1..."
                    value={newSubForm.npub}
                    onChange={(e) => setNewSubForm({ ...newSubForm, npub: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Subscription Type</Label>
                    <Select
                      value={newSubForm.type}
                      onValueChange={(value: 'monthly' | 'yearly' | 'free') => 
                        setNewSubForm({ ...newSubForm, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly (30 days)</SelectItem>
                        <SelectItem value="yearly">Yearly (365 days)</SelectItem>
                        <SelectItem value="free">Free (Unlimited)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newSubForm.type === 'monthly' && (
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Duration (days)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={newSubForm.duration}
                        onChange={(e) => setNewSubForm({ ...newSubForm, duration: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  onClick={handleAddSubscription} 
                  disabled={!newSubForm.npub || isPending}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isPending ? 'Creating...' : 'Create Subscription'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Active Subscriptions List */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Active Subscriptions ({activeSubscriptions.length})
            </h3>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : activeSubscriptions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active subscriptions
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeSubscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.userPubkey}
                    userPubkey={sub.userPubkey}
                    subscription={sub.subscription}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Expired Subscriptions */}
          {expiredSubscriptions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-600" />
                Expired Subscriptions ({expiredSubscriptions.length})
              </h3>
              <div className="space-y-3">
                {expiredSubscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.userPubkey}
                    userPubkey={sub.userPubkey}
                    subscription={sub.subscription}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
