import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCustomerSession, useCustomer } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/useToast';
import { CheckCircle, Mail, User, Zap, CreditCard, Crown, Download, Shield } from 'lucide-react';
import { hasActiveSubscription } from '@/lib/customerSchema';

interface UnlimitedSubscriptionProps {
  onSubscriptionComplete?: (customerEmail: string) => void;
}

const SUBSCRIPTION_PRICE = 99; // USD or equivalent in sats

export function UnlimitedSubscription({ onSubscriptionComplete }: UnlimitedSubscriptionProps) {
  const { session, setSession } = useCustomerSession();
  const { toast } = useToast();
  const { data: existingCustomer } = useCustomer(session?.email || null);
  
  const [email, setEmail] = useState(session?.email || '');
  const [name, setName] = useState(session?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'fiat'>('lightning');
  const [isProcessing, setIsProcessing] = useState(false);

  const hasSubscription = existingCustomer && hasActiveSubscription(existingCustomer);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Save session
      setSession(email, name);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Subscription activated!',
        description: 'You now have unlimited downloads. Check your email for confirmation.',
      });

      onSubscriptionComplete?.(email);
    } catch (error) {
      toast({
        title: 'Subscription failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasSubscription) {
    return (
      <Card className="max-w-md mx-auto border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            <CardTitle>Unlimited Access Active</CardTitle>
          </div>
          <CardDescription>
            You have unlimited downloads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {existingCustomer.name}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {existingCustomer.email}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {existingCustomer.subscriptionType === 'test' ? (
                    'Test Account - Free Unlimited Downloads'
                  ) : existingCustomer.subscriptionExpiry ? (
                    `Expires: ${new Date(existingCustomer.subscriptionExpiry * 1000).toLocaleDateString()}`
                  ) : (
                    'Lifetime Unlimited Downloads'
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span>Unlimited downloads of all stock media</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span>Commercial usage rights included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
              <span>Access to all future uploads</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          <CardTitle>Unlimited Downloads Subscription</CardTitle>
        </div>
        <CardDescription>
          Get unlimited access to all stock media for ${SUBSCRIPTION_PRICE}/month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subscription Benefits */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-start gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-900 dark:text-yellow-100">
                  ${SUBSCRIPTION_PRICE}/month
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Unlimited downloads, commercial rights
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600" />
                <span>Download any photo, video, or asset</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600" />
                <span>Full commercial usage rights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600" />
                <span>Access to all future uploads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-yellow-600" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="sub-name">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </Label>
              <Input
                id="sub-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="sub-email">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </Label>
              <Input
                id="sub-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for login and download links
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'lightning' | 'fiat')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="lightning" id="sub-lightning" />
                <Label htmlFor="sub-lightning" className="cursor-pointer flex items-center gap-2 flex-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Lightning Network</p>
                    <p className="text-xs text-muted-foreground">Instant Bitcoin payment</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="fiat" id="sub-fiat" />
                <Label htmlFor="sub-fiat" className="cursor-pointer flex items-center gap-2 flex-1">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Credit Card</p>
                    <p className="text-xs text-muted-foreground">Monthly recurring billing</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1"
              style={{ backgroundColor: '#ec1a58' }}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Subscribe ${SUBSCRIPTION_PRICE}/mo
                </>
              )}
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Secure payment processing. Your information is encrypted and never shared.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
