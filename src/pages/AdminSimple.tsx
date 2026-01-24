import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSimple() {
  const { user } = useCurrentUser();

  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isCorrectAdmin = user?.pubkey === ADMIN_HEX;

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#e8e8e8' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Simple Admin Panel</h1>
            <p className="text-muted-foreground">
              Simplified admin panel without complex permission checks.
            </p>
          </div>

          {!user && (
            <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-6">
                  Please login with your Nostr account to access the admin panel.
                </p>
                <Link to="/admin-debug">
                  <Button variant="outline">
                    Go to Admin Debug Page
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user && !isCorrectAdmin && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-4">
                  You are logged in as: <br />
                  <code className="text-xs">{nip19.npubEncode(user.pubkey)}</code>
                </p>
                <p className="text-muted-foreground mb-6">
                  Expected admin: <br />
                  <code className="text-xs">{ADMIN_NPUB}</code>
                </p>
                <Link to="/admin-debug">
                  <Button variant="outline">
                    Go to Admin Debug Page
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {user && isCorrectAdmin && (
            <div className="space-y-6">
              <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                <CardContent className="py-8 text-center">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">Admin Access Confirmed!</h3>
                  <p className="text-muted-foreground mb-6">
                    Welcome, Traveltelly admin. You have full access to the admin panel.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/admin">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Go to Full Admin Panel
                      </Button>
                    </Link>
                    <Link to="/admin-debug">
                      <Button variant="outline">
                        View Debug Info
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Admin Functions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-muted-foreground">
                      This is a simplified admin panel. The full admin panel includes:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Review permission management</li>
                      <li>User request handling</li>
                      <li>Permission granting/blocking</li>
                      <li>Admin debug information</li>
                    </ul>
                    <div className="pt-4">
                      <Link to="/admin">
                        <Button>
                          Access Full Admin Panel
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}