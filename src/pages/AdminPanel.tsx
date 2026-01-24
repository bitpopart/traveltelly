import React from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AdminPermissionManager } from '@/components/AdminPermissionManager';
import { StockMediaPermissionManager } from '@/components/StockMediaPermissionManager';
import { CategoryManager } from '@/components/CategoryManager';
import { MediaManagement } from '@/components/MediaManagement';
import { AdminReviewManager } from '@/components/AdminReviewManager';
import { nip19 } from 'nostr-tools';
import { Shield, ArrowLeft, Camera, MessageSquare, Settings, Tag, FileImage } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();

  // Double-check that this is specifically the Traveltelly admin npub
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Checking admin permissions...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-6">
                  Only the Traveltelly admin can access this panel.
                </p>
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">Traveltelly Admin Panel</h1>
            <p className="text-muted-foreground">
              Manage permissions, user requests, and content moderation for Traveltelly.
            </p>
          </div>

          {/* Quick Actions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Link to="/media-management">
                  <Button variant="default" className="bg-orange-600 hover:bg-orange-700">
                    <FileImage className="w-4 h-4 mr-2" />
                    Manage Media
                  </Button>
                </Link>
                <Link to="/hide-reviews">
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Hide User Reviews
                  </Button>
                </Link>
                <Link to="/remove-reviews">
                  <Button variant="outline">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Remove User Reviews
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    View Marketplace
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    App Settings
                  </Button>
                </Link>
                <Link to="/category-test">
                  <Button variant="outline">
                    <Tag className="w-4 h-4 mr-2" />
                    Test Categories
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Admin Tabs */}
          <Tabs defaultValue="manage-reviews" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="manage-reviews" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Manage Reviews
              </TabsTrigger>
              <TabsTrigger value="review-permissions" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Review Permissions
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Review Categories
              </TabsTrigger>
              <TabsTrigger value="media-permissions" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Media Permissions
              </TabsTrigger>
              <TabsTrigger value="media-management" className="flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Media Management
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage-reviews" className="mt-6">
              <AdminReviewManager />
            </TabsContent>

            <TabsContent value="review-permissions" className="mt-6">
              <AdminPermissionManager />
            </TabsContent>

            <TabsContent value="categories" className="mt-6">
              <CategoryManager />
            </TabsContent>

            <TabsContent value="media-permissions" className="mt-6">
              <StockMediaPermissionManager />
            </TabsContent>

            <TabsContent value="media-management" className="mt-6">
              <MediaManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}