import React, { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { AdminPermissionManager } from '@/components/AdminPermissionManager';
import { StockMediaPermissionManager } from '@/components/StockMediaPermissionManager';
import { AdminSubscriptionManager } from '@/components/AdminSubscriptionManager';
import { CategoryManager } from '@/components/CategoryManager';
import { MediaManagement } from '@/components/MediaManagement';
import { AdminReviewManager } from '@/components/AdminReviewManager';
import { AdminTripManager } from '@/components/AdminTripManager';
import { AdminStoryManager } from '@/components/AdminStoryManager';
import { CustomerManagement } from '@/components/CustomerManagement';
import { NewsletterManager } from '@/components/NewsletterManager';
import { AdminCommunityManager } from '@/components/AdminCommunityManager';
import { useInitializeTestCustomer } from '@/hooks/useInitializeTestCustomer';
import { nip19 } from 'nostr-tools';
import { Shield, ArrowLeft, Camera, MessageSquare, Settings, Tag, FileImage, Coffee, MapPin, Upload, BookOpen, Smartphone, Clock, BarChart3, Crown, Users, Mail, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminPanel() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  
  // Initialize test customer account automatically
  useInitializeTestCustomer();

  // Handle hash-based navigation for tabs
  const [activeTab, setActiveTab] = useState('manage-reviews');
  
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash) {
      setActiveTab(hash);
    }
  }, []);

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
                <Link to="/admin/telly-bot">
                  <Button variant="default" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Telly Bot
                  </Button>
                </Link>
                <Link to="/admin/analytics">
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                <Link to="/admin/share-scheduler">
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                    <Clock className="w-4 h-4 mr-2" />
                    Social Media
                  </Button>
                </Link>
                <Link to="/admin/app-builder">
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
                    <Smartphone className="w-4 h-4 mr-2" />
                    App Builder
                  </Button>
                </Link>
                <Link to="/media-management">
                  <Button variant="default" className="bg-orange-600 hover:bg-orange-700">
                    <FileImage className="w-4 h-4 mr-2" />
                    Manage Media
                  </Button>
                </Link>
                <Link to="/admin/mass-upload">
                  <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Mass Upload
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
                <Link to="/admin#review-permissions">
                  <Button variant="default" className="bg-green-600 hover:bg-green-700">
                    <Shield className="w-4 h-4 mr-2" />
                    Review Permission
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
                <Link to="/category-migration">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    <Coffee className="w-4 h-4 mr-2" />
                    Category Migration
                  </Button>
                </Link>
                <Link to="/map-marker-editor">
                  <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-50">
                    <MapPin className="w-4 h-4 mr-2" />
                    Map Marker Editor
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Main Admin Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2">
              <TabsTrigger value="manage-reviews" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="manage-stories" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <BookOpen className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Stories</span>
              </TabsTrigger>
              <TabsTrigger value="manage-trips" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Trips</span>
              </TabsTrigger>
              <TabsTrigger value="customers" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Customers</span>
              </TabsTrigger>
              <TabsTrigger value="newsletter" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Newsletter</span>
              </TabsTrigger>
              <TabsTrigger value="community" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <UsersRound className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Community</span>
              </TabsTrigger>
              <TabsTrigger value="review-permissions" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <Shield className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Review Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="media-permissions" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <Camera className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Media Permissions</span>
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <Crown className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Subscriptions</span>
              </TabsTrigger>
              <TabsTrigger value="media-management" className="flex items-center gap-1.5 whitespace-nowrap px-3">
                <FileImage className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Media Management</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage-reviews" className="mt-6">
              <AdminReviewManager />
            </TabsContent>

            <TabsContent value="manage-stories" className="mt-6">
              <AdminStoryManager />
            </TabsContent>

            <TabsContent value="manage-trips" className="mt-6">
              <AdminTripManager />
            </TabsContent>

            <TabsContent value="customers" className="mt-6">
              <CustomerManagement />
            </TabsContent>

            <TabsContent value="newsletter" className="mt-6">
              <NewsletterManager />
            </TabsContent>

            <TabsContent value="community" className="mt-6">
              <AdminCommunityManager />
            </TabsContent>

            <TabsContent value="review-permissions" className="mt-6">
              <AdminPermissionManager />
            </TabsContent>

            <TabsContent value="media-permissions" className="mt-6">
              <StockMediaPermissionManager />
            </TabsContent>

            <TabsContent value="subscriptions" className="mt-6">
              <AdminSubscriptionManager />
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