import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { AdminDebugInfo } from '@/components/AdminDebugInfo';
import { LoginArea } from '@/components/auth/LoginArea';
import { nip19 } from 'nostr-tools';
import { Shield, ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminTest() {
  const { user } = useCurrentUser();
  const { isAdmin, hasPermission } = useReviewPermissions();

  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#e8e8e8' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Admin Access Test</h1>
            <p className="text-muted-foreground">
              Test page to verify admin access for Traveltelly npub.
            </p>
          </div>

          {/* Login Section */}
          {!user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Login Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Please login with your Nostr account to test admin access.
                </p>
                <LoginArea className="max-w-60" />
              </CardContent>
            </Card>
          )}

          {/* Expected Admin Info */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Traveltelly Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Npub:</strong></p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                  {ADMIN_NPUB}
                </p>
                <p><strong>Hex:</strong></p>
                <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                  {nip19.decode(ADMIN_NPUB).data as string}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Is Admin:</p>
                      <p className={`text-lg font-bold ${isAdmin ? 'text-green-600' : 'text-red-600'}`}>
                        {isAdmin ? '✅ YES' : '❌ NO'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Has Permission:</p>
                      <p className={`text-lg font-bold ${hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                        {hasPermission ? '✅ YES' : '❌ NO'}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                      <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                        🎉 Admin Access Confirmed!
                      </p>
                      <Link to="/admin">
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Shield className="w-4 h-4 mr-2" />
                          Go to Admin Panel
                        </Button>
                      </Link>
                    </div>
                  )}

                  {user && !isAdmin && (
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                      <p className="text-yellow-700 dark:text-yellow-300 font-medium">
                        ⚠️ You are not logged in as the Traveltelly admin.
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                        Please login with the correct npub to access admin features.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          <AdminDebugInfo />

          {/* Test Links */}
          <Card>
            <CardHeader>
              <CardTitle>Test Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Link to="/admin">
                  <Button variant="outline">
                    Test Admin Panel Access
                  </Button>
                </Link>
                <Link to="/create-review">
                  <Button variant="outline">
                    Test Review Creation
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}