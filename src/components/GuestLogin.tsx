import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerSession, useCustomerAccess } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/useToast';
import { Mail, LogIn, Crown, CheckCircle } from 'lucide-react';

interface GuestLoginProps {
  onLoginSuccess?: (email: string) => void;
}

export function GuestLogin({ onLoginSuccess }: GuestLoginProps) {
  const { session, setSession, clearSession } = useCustomerSession();
  const { hasAccess, customer } = useCustomerAccess(session?.email || null);
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsLoggingIn(true);

    try {
      // Simulate checking customer account
      await new Promise(resolve => setTimeout(resolve, 500));

      // For test account, allow immediate login
      if (email === 'admin-non-nostr@traveltelly.test') {
        setSession(email, 'Admin Non-Nostr');
        toast({
          title: 'Login successful!',
          description: 'Welcome back, Admin Non-Nostr (Test Account)',
        });
        onLoginSuccess?.(email);
        return;
      }

      // For real customers, verify they exist
      // In production, this would make an API call to verify the email
      setSession(email, 'Guest User');
      toast({
        title: 'Login successful!',
        description: 'You are now logged in',
      });
      onLoginSuccess?.(email);
    } catch (error) {
      toast({
        title: 'Login failed',
        description: 'Please check your email and try again',
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    toast({
      title: 'Logged out',
      description: 'You have been logged out',
    });
  };

  if (session) {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Logged In
          </CardTitle>
          <CardDescription>
            Guest account session active
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-semibold">{session.name}</p>
                <p className="text-sm text-muted-foreground">{session.email}</p>
                {hasAccess && customer && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Unlimited Downloads Active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full"
          >
            Log Out
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LogIn className="w-5 h-5" />
          Guest Login
        </CardTitle>
        <CardDescription>
          Access your purchases and downloads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="login-email">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </Label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the email you used to purchase or subscribe
            </p>
          </div>

          <Button
            type="submit"
            disabled={isLoggingIn}
            className="w-full"
          >
            {isLoggingIn ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Access My Purchases
              </>
            )}
          </Button>

          {/* Test Account Info */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>For testing:</strong>
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
              admin-non-nostr@traveltelly.test
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
