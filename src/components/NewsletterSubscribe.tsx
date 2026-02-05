import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Check, Loader2 } from 'lucide-react';
import { useSubscribeToNewsletter } from '@/hooks/useNewsletter';
import { useToast } from '@/hooks/useToast';

interface NewsletterSubscribeProps {
  className?: string;
  variant?: 'card' | 'inline';
  source?: string;
}

export function NewsletterSubscribe({ className = '', variant = 'card', source = 'website' }: NewsletterSubscribeProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { mutate: subscribe, isPending } = useSubscribeToNewsletter();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    subscribe({ email, name: name || undefined, source }, {
      onSuccess: () => {
        setIsSuccess(true);
        toast({
          title: 'Subscribed!',
          description: 'You\'re now subscribed to the Traveltelly newsletter.',
        });
        setEmail('');
        setName('');
        
        // Reset success state after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
      },
      onError: () => {
        toast({
          title: 'Subscription failed',
          description: 'Please try again or contact support.',
          variant: 'destructive',
        });
      },
    });
  };

  if (variant === 'inline') {
    return (
      <div className={className}>
        {isSuccess ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              ✅ You're subscribed! Check your email for confirmation.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Subscribe to Newsletter
        </CardTitle>
        <CardDescription>
          Get the latest travel reviews, stories, and trips delivered to your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              <p className="font-semibold mb-1">✅ You're subscribed!</p>
              <p className="text-sm">Check your email for confirmation. You'll receive our next newsletter with the latest travel content.</p>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isPending}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe to Newsletter
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We'll send you updates about new travel content. Unsubscribe anytime.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
