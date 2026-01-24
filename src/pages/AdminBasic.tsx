import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminBasic() {
  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
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
            <h1 className="text-3xl font-bold mb-2">Basic Admin Panel</h1>
            <p className="text-muted-foreground">
              Simple admin panel without any permission checks - for testing routing only.
            </p>
          </div>

          {/* Success Message */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300">
                ✅ Admin Route is Working!
              </h3>
              <p className="text-green-600 dark:text-green-400 mb-4">
                If you can see this page, the admin routing is functioning correctly.
              </p>
              <p className="text-sm text-muted-foreground">
                This is a basic admin panel without permission checks, purely for testing routing.
              </p>
            </CardContent>
          </Card>

          {/* Admin Functions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Admin Panel Access Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  This basic admin panel confirms that:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>✅ The /admin route is accessible</li>
                  <li>✅ Client-side routing is working</li>
                  <li>✅ React components are loading correctly</li>
                  <li>✅ The hosting service supports SPA routing</li>
                </ul>

                <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800 mt-6">
                  <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">
                    🔧 Next Steps:
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    If this page loads successfully, the routing is working. Any issues with the main admin panel
                    are likely related to permission checks or authentication, not routing.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link to="/admin">
                    <Button>
                      Try Full Admin Panel
                    </Button>
                  </Link>
                  <Link to="/admin-debug">
                    <Button variant="outline">
                      View Debug Info
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* URL Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current URL Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Current URL:</strong></p>
                <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs break-all">
                  {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
                </code>
                <p><strong>Expected Working URLs:</strong></p>
                <div className="space-y-1">
                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                    https://npub1nr80d06jql93hwx2dtqxr8epchgyhwkvuarerj5sx0ufuxcjpqlq90pkwk.nostrdeploy.com/admin
                  </code>
                  <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs">
                    https://npub1nr80d06jql93hwx2dtqxr8epchgyhwkvuarerj5sx0ufuxcjpqlq90pkwk.nostrdeploy.com/admin-basic
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}