import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCustomerSession } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/useToast';
import { Mail, User, CreditCard, Zap, CheckCircle } from 'lucide-react';

interface GuestCheckoutProps {
  productTitle: string;
  price: number;
  currency: string;
  onPurchaseComplete: (customerEmail: string, paymentMethod: 'lightning' | 'fiat') => void;
  onCancel?: () => void;
}

export function GuestCheckout({ productTitle, price, currency, onPurchaseComplete, onCancel }: GuestCheckoutProps) {
  const { session, setSession } = useCustomerSession();
  const { toast } = useToast();
  
  const [email, setEmail] = useState(session?.email || '');
  const [name, setName] = useState(session?.name || '');
  const [paymentMethod, setPaymentMethod] = useState<'lightning' | 'fiat'>('lightning');
  const [isProcessing, setIsProcessing] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
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
      // Save session for future purchases
      setSession(email, name);

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Purchase successful!',
        description: 'Check your email for the download link',
      });

      onPurchaseComplete(email, paymentMethod);
    } catch (error) {
      toast({
        title: 'Purchase failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Guest Checkout</CardTitle>
        <CardDescription>
          Complete your purchase without creating a Nostr account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Purchasing:</p>
            <p className="font-semibold">{productTitle}</p>
            <p className="text-lg font-bold mt-2" style={{ color: '#ec1a58' }}>
              {price.toLocaleString()} {currency}
            </p>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">
                <User className="w-4 h-4 inline mr-1" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Download link will be sent to this email
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label className="mb-3 block">Payment Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'lightning' | 'fiat')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="lightning" id="lightning" />
                <Label htmlFor="lightning" className="cursor-pointer flex items-center gap-2 flex-1">
                  <Zap className="w-4 h-4 text-orange-500" />
                  <div>
                    <p className="font-medium">Lightning Network</p>
                    <p className="text-xs text-muted-foreground">Instant Bitcoin payment</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <RadioGroupItem value="fiat" id="fiat" />
                <Label htmlFor="fiat" className="cursor-pointer flex items-center gap-2 flex-1">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="font-medium">Credit Card / PayPal</p>
                    <p className="text-xs text-muted-foreground">Traditional payment methods</p>
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
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Purchase
                </>
              )}
            </Button>
          </div>

          {/* Privacy Notice */}
          <p className="text-xs text-muted-foreground text-center">
            Your information is stored securely and will only be used for order fulfillment.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
