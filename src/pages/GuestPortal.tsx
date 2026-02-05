import { useSeoMeta } from '@unhead/react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuestLogin } from '@/components/GuestLogin';
import { UnlimitedSubscription } from '@/components/UnlimitedSubscription';
import { useCustomerSession } from '@/hooks/useCustomers';
import { Crown, LogIn, Download } from 'lucide-react';

export default function GuestPortal() {
  const { session } = useCustomerSession();

  useSeoMeta({
    title: 'Guest Portal - Traveltelly',
    description: 'Access your purchases and manage your subscription',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Guest Portal</h1>
            <p className="text-muted-foreground">
              Manage your purchases and subscriptions without a Nostr account
            </p>
          </div>

          <Tabs defaultValue={session ? "subscription" : "login"} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="subscription" className="flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="downloads" className="flex items-center gap-2" disabled={!session}>
                <Download className="w-4 h-4" />
                My Downloads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <GuestLogin />
            </TabsContent>

            <TabsContent value="subscription" className="mt-6">
              {session ? (
                <UnlimitedSubscription />
              ) : (
                <Card className="max-w-md mx-auto">
                  <CardHeader>
                    <CardTitle>Login Required</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Please log in to view or purchase a subscription.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="downloads" className="mt-6">
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle>My Downloads</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Download history will appear here.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Subscribe?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✅ Unlimited downloads of all stock media</p>
                <p>✅ Commercial usage rights included</p>
                <p>✅ Access to all future uploads</p>
                <p>✅ No per-download fees</p>
                <p>✅ Priority support</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Individual Purchases</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>💳 Pay per download</p>
                <p>⚡ Lightning or credit card payment</p>
                <p>📧 Download link sent to email</p>
                <p>🔒 Secure instant delivery</p>
                <p>📄 Standard commercial license</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
