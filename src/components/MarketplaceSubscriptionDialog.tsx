import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceSubscription, getSubscriptionPrice, formatExpiryDate } from '@/hooks/useMarketplaceSubscription';
import { LightningZapDialog } from '@/components/LightningZapDialog';
import { Check, Zap, Crown, Calendar, Download, Info } from 'lucide-react';

interface MarketplaceSubscriptionDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MarketplaceSubscriptionDialog({ 
  children, 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange 
}: MarketplaceSubscriptionDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = controlledOnOpenChange || setUncontrolledOpen;

  const monthlyPrice = getSubscriptionPrice('monthly');
  const yearlyPrice = getSubscriptionPrice('yearly');

  const features = [
    'Unlimited downloads from marketplace',
    'Access to all stock photos and videos',
    'High-resolution files',
    'Commercial usage rights',
    'Cancel anytime',
  ];

  const trigger = children || (
    <Button variant="default" className="gap-2">
      <Crown className="w-4 h-4" />
      Subscribe
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="w-6 h-6 text-yellow-600" />
            Marketplace Subscription
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Subscription Status */}
          {subscription?.isActive && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
              <Check className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Active Subscription</strong>
                <div className="mt-1 text-sm">
                  {subscription.type === 'free' ? (
                    'You have unlimited access (Free subscription)'
                  ) : (
                    <>
                      Your {subscription.type} subscription is active until{' '}
                      <strong>{formatExpiryDate(subscription.expiryDate)}</strong>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Alert */}
          {!subscription?.isActive && (
            <Alert>
              <Info className="w-4 h-4" />
              <AlertDescription>
                Subscribe to get unlimited downloads from our stock media marketplace. 
                Pay with Bitcoin Lightning for instant activation.
              </AlertDescription>
            </Alert>
          )}

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Monthly
                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                    Popular
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Flexible month-to-month billing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$21</div>
                  <div className="text-sm text-muted-foreground">
                    ≈ {monthlyPrice.toLocaleString()} sats/month
                  </div>
                </div>

                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!subscription?.isActive && user && (
                  <LightningZapDialog
                    recipientPubkey="7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35"
                    amount={monthlyPrice}
                    onSuccess={() => {
                      setIsOpen(false);
                    }}
                  >
                    <Button className="w-full gap-2" variant="default">
                      <Zap className="w-4 h-4" />
                      Subscribe Monthly
                    </Button>
                  </LightningZapDialog>
                )}
              </CardContent>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-2 border-yellow-500 hover:border-yellow-600 transition-colors relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-yellow-600 text-white">
                  Save 2 months!
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Yearly
                  <Crown className="w-5 h-5 text-yellow-600" />
                </CardTitle>
                <CardDescription>
                  Best value - pay for 10 months
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">$210</div>
                  <div className="text-sm text-muted-foreground">
                    ≈ {yearlyPrice.toLocaleString()} sats/year
                  </div>
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Save $42/year vs monthly
                  </div>
                </div>

                <ul className="space-y-2">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-500">
                    <Crown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>2 months free!</span>
                  </li>
                </ul>

                {!subscription?.isActive && user && (
                  <LightningZapDialog
                    recipientPubkey="7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35"
                    amount={yearlyPrice}
                    onSuccess={() => {
                      setIsOpen(false);
                    }}
                  >
                    <Button className="w-full gap-2 bg-yellow-600 hover:bg-yellow-700">
                      <Zap className="w-4 h-4" />
                      Subscribe Yearly
                    </Button>
                  </LightningZapDialog>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-sm text-muted-foreground space-y-2 border-t pt-4">
            <p className="flex items-start gap-2">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Subscriptions are processed via Bitcoin Lightning Network for instant activation</span>
            </p>
            <p className="flex items-start gap-2">
              <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Download as many stock photos and videos as you need during your subscription period</span>
            </p>
            <p className="flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>After payment, please allow a few minutes for subscription activation</span>
            </p>
          </div>

          {!user && (
            <Alert variant="destructive">
              <AlertDescription>
                Please log in to subscribe to the marketplace
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
