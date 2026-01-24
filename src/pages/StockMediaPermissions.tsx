import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StockMediaPermissionRequest } from '@/components/StockMediaPermissionRequest';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useStockMediaPermissions } from '@/hooks/useStockMediaPermissions';
import { LoginArea } from '@/components/auth/LoginArea';
import { Camera, ArrowLeft, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function StockMediaPermissions() {
  const { user } = useCurrentUser();
  const { hasPermission, isAdmin } = useStockMediaPermissions();

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
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
            <h1 className="text-3xl font-bold mb-2">Stock Media Permissions</h1>
            <p className="text-muted-foreground">
              Request permission to upload and sell stock media content on Traveltelly.
            </p>
          </div>

          {/* Status Cards */}
          {user && (
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card className={`border-l-4 ${isAdmin ? 'border-l-purple-200 dark:border-l-purple-800' : 'border-l-gray-200 dark:border-l-gray-800'}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Shield className={`w-8 h-8 ${isAdmin ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">Admin Status</p>
                      <p className="text-sm text-muted-foreground">
                        {isAdmin ? 'Admin Access' : 'Regular User'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={`border-l-4 ${hasPermission ? 'border-l-green-200 dark:border-l-green-800' : 'border-l-orange-200 dark:border-l-orange-800'}`}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <Camera className={`w-8 h-8 ${hasPermission ? 'text-green-600' : 'text-orange-600'}`} />
                    <div>
                      <p className="font-medium">Upload Permission</p>
                      <p className="text-sm text-muted-foreground">
                        {hasPermission ? 'Granted' : 'Not Granted'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-blue-200 dark:border-l-blue-800">
                <CardContent className="py-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Account Status</p>
                      <p className="text-sm text-muted-foreground">
                        Logged In
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          {!user ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Stock Media Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-6">
                  Please log in to request stock media upload permissions.
                </p>
                <LoginArea className="max-w-60 mx-auto" />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <StockMediaPermissionRequest />

              {/* Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle>About Stock Media Permissions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Why do I need permission?</h4>
                    <p className="text-sm text-muted-foreground">
                      To maintain quality and prevent spam, Traveltelly requires approval before users can upload stock media content. This ensures our marketplace features high-quality, travel-focused content.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">What content is accepted?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• High-resolution travel photography (landscapes, cities, culture)</li>
                      <li>• Professional-quality images with proper composition and lighting</li>
                      <li>• Original content that you own the rights to</li>
                      <li>• Images that would be useful for travel-related projects</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Review process</h4>
                    <p className="text-sm text-muted-foreground">
                      The Traveltelly admin will review your request and portfolio. Approval typically takes 1-3 business days. You'll be notified through the platform when a decision is made.
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-medium mb-2 text-purple-800 dark:text-purple-200">Admin Access</h4>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                        You have admin privileges and can manage stock media permissions.
                      </p>
                      <Link to="/admin">
                        <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                          <Shield className="w-4 h-4 mr-2" />
                          Open Admin Panel
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}