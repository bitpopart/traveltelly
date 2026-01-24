import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { LoginArea } from '@/components/auth/LoginArea';
import { nip19 } from 'nostr-tools';
import { Shield, ArrowLeft, User, CheckCircle, XCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function AdminDebug() {
  const { user } = useCurrentUser();
  const { isAdmin, hasPermission, isCheckingPermission } = useReviewPermissions();
  const location = useLocation();

  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

  const isCorrectAdmin = user?.pubkey === ADMIN_HEX;

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
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
            <h1 className="text-3xl font-bold mb-2">Admin Route Debug</h1>
            <p className="text-muted-foreground">
              Debug page to verify admin routing and permissions.
            </p>
          </div>

          {/* Current Route Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Current Path:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.pathname}</code></p>
                <p><strong>Search:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.search || 'none'}</code></p>
                <p><strong>Hash:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.hash || 'none'}</code></p>
              </div>
            </CardContent>
          </Card>

          {/* Login Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Login Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">You are not logged in.</p>
                  <LoginArea className="max-w-60" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Logged in</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Your Npub:</strong></p>
                    <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                      {nip19.npubEncode(user.pubkey)}
                    </code>
                    <p><strong>Your Hex:</strong></p>
                    <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                      {user.pubkey}
                    </code>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expected Admin */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Traveltelly Admin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Expected Npub:</strong></p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {ADMIN_NPUB}
                </code>
                <p><strong>Expected Hex:</strong></p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {ADMIN_HEX}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Permission Check */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Permission Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    {isCorrectAdmin ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Correct Admin</p>
                      <p className="text-sm text-muted-foreground">{isCorrectAdmin ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Is Admin</p>
                      <p className="text-sm text-muted-foreground">{isAdmin ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasPermission ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">Has Permission</p>
                      <p className="text-sm text-muted-foreground">{hasPermission ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>

                {isCheckingPermission && (
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-blue-700 dark:text-blue-300">
                      🔄 Checking permissions...
                    </p>
                  </div>
                )}

                {user && isCorrectAdmin && (
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 font-medium mb-3">
                      ✅ You are logged in as the correct Traveltelly admin!
                    </p>
                    <p className="text-green-600 dark:text-green-400 text-sm mb-3">
                      The admin panel should be accessible at <code>/admin</code>
                    </p>
                    <Link to="/admin">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Shield className="w-4 h-4 mr-2" />
                        Go to Admin Panel
                      </Button>
                    </Link>
                  </div>
                )}

                {user && !isCorrectAdmin && (
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

          {/* Test Links */}
          <Card>
            <CardHeader>
              <CardTitle>Test Admin Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-3">
                  Try these links to test admin access:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/admin">
                    <Button variant="outline">
                      /admin (Main Admin Panel)
                    </Button>
                  </Link>
                  <Link to="/admin-test">
                    <Button variant="outline">
                      /admin-test (Admin Test Page)
                    </Button>
                  </Link>
                  <a href="/admin" target="_blank" rel="noopener noreferrer">
                    <Button variant="outline">
                      /admin (New Tab)
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Browser Info */}
          <Card>
            <CardHeader>
              <CardTitle>Browser Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>User Agent:</strong></p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {navigator.userAgent}
                </code>
                <p><strong>Current URL:</strong></p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {window.location.href}
                </code>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}