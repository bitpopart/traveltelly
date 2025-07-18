import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function RouteTest() {
  const location = useLocation();

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#def5ff' }}>
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
            <h1 className="text-3xl font-bold mb-2">Route Test Page</h1>
            <p className="text-muted-foreground">
              This page tests if client-side routing is working correctly.
            </p>
          </div>

          {/* Success Message */}
          <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
            <CardContent className="py-8 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h3 className="text-lg font-semibold mb-2 text-green-700 dark:text-green-300">
                ✅ Routing is Working!
              </h3>
              <p className="text-green-600 dark:text-green-400">
                If you can see this page, client-side routing is functioning correctly.
              </p>
            </CardContent>
          </Card>

          {/* Route Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current Route Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Path:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.pathname}</code></p>
                <p><strong>Search:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.search || 'none'}</code></p>
                <p><strong>Hash:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{location.hash || 'none'}</code></p>
                <p><strong>Full URL:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs break-all">{window.location.href}</code></p>
              </div>
            </CardContent>
          </Card>

          {/* Test Links */}
          <Card>
            <CardHeader>
              <CardTitle>Test Other Routes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link to="/admin">
                  <Button variant="outline" className="w-full">
                    /admin
                  </Button>
                </Link>
                <Link to="/admin-debug">
                  <Button variant="outline" className="w-full">
                    /admin-debug
                  </Button>
                </Link>
                <Link to="/admin-simple">
                  <Button variant="outline" className="w-full">
                    /admin-simple
                  </Button>
                </Link>
                <Link to="/admin-test">
                  <Button variant="outline" className="w-full">
                    /admin-test
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline" className="w-full">
                    /settings
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    /dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Direct URL Test */}
          <Card>
            <CardHeader>
              <CardTitle>Direct URL Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Try accessing these URLs directly in your browser address bar:
              </p>
              <div className="space-y-2 text-xs">
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <code>{window.location.origin}/route-test</code>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <code>{window.location.origin}/admin</code>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <code>{window.location.origin}/admin-debug</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}