import { useSeoMeta } from '@unhead/react';
import { Navigation as NavigationComponent } from "@/components/Navigation";
import { LoginArea } from "@/components/auth/LoginArea";
import { RelaySelector } from "@/components/RelaySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadMoreReviewFeed } from "@/components/LoadMoreReviewFeed";
import { AllAdminReviewsMap } from "@/components/AllAdminReviewsMap";
import { AdminDebugInfo } from "@/components/AdminDebugInfo";
import { UnifiedSearchBar } from "@/components/UnifiedSearchBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useReviewPermissions } from "@/hooks/useReviewPermissions";
import { MapPin, Star, Camera, Zap, Shield, BookOpen, Search, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();

  useSeoMeta({
    title: 'Traveltelly - Nostr Powered Travel Community',
    description: 'Nostr Powered Travel Community. Upload photos, rate locations, and earn Lightning tips.',
  });

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#def5ff' }}>
      <NavigationComponent />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 md:mb-4">
              🌍 Traveltelly
            </h1>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 mb-6 md:mb-8 px-4">
              Nostr Powered Travel Community
            </p>
            <div className="flex flex-col items-center gap-4 md:gap-6">
              {!user && <LoginArea className="max-w-60" />}

              {/* Feature Cards */}
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 w-full max-w-4xl">
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <Star className="w-10 h-10 md:w-12 md:h-12 mx-auto text-orange-600 mb-2" />
                    <CardTitle className="text-base md:text-lg">Share Reviews</CardTitle>
                    <CardDescription className="text-sm">
                      Rate and review amazing places you've visited
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to="/reviews">
                      <Button className="w-full">
                        Explore Reviews
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <BookOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto text-blue-600 mb-2" />
                    <CardTitle className="text-base md:text-lg">Travel Stories</CardTitle>
                    <CardDescription className="text-sm">
                      Discover inspiring travel adventures and experiences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to="/stories">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Read Stories
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="text-center hover:shadow-lg transition-shadow sm:col-span-2 md:col-span-1">
                  <CardHeader className="pb-3">
                    <Camera className="w-10 h-10 md:w-12 md:h-12 mx-auto text-green-600 mb-2" />
                    <CardTitle className="text-base md:text-lg">Stock Media</CardTitle>
                    <CardDescription className="text-sm">
                      Buy and sell high-quality travel photography
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Link to="/marketplace">
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        Browse Photos
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>

              {user && (
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  <Link to="/create-review">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      Create Review
                    </Button>
                  </Link>
                  <Link to="/stock-media-permissions">
                    <Button variant="outline" size="lg" className="text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Upload Permissions</span>
                      <span className="sm:hidden">Permissions</span>
                    </Button>
                  </Link>

                  {/* Debug info for admin detection */}
                  {import.meta.env.DEV && (
                    <div className="w-full text-center text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 p-2 rounded">
                      Debug: isAdmin={String(isAdmin)}, isChecking={String(isCheckingPermission)}, userPubkey={user.pubkey?.slice(0, 8)}...
                    </div>
                  )}

                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-50 text-sm md:text-base">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}

                  {/* Always show admin test link for debugging */}
                  {import.meta.env.DEV && (
                    <Link to="/admin-test">
                      <Button variant="outline" size="lg" className="border-blue-300 text-blue-700 hover:bg-blue-50 text-sm md:text-base">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Admin Test Page</span>
                        <span className="sm:hidden">Admin Test</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/photo-upload-demo">
                    <Button variant="outline" size="lg" className="text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      Photo Demo
                    </Button>
                  </Link>
                  <Link to="/gps-correction-demo">
                    <Button variant="outline" size="lg" className="text-sm md:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">GPS Correction</span>
                      <span className="sm:hidden">GPS Fix</span>
                    </Button>
                  </Link>
                  <Link to="/search-test">
                    <Button variant="outline" size="lg" className="text-sm md:text-base">
                      <Search className="w-4 h-4 mr-2" />
                      Search Test
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Admin Debug Info (Development Only) */}
          <AdminDebugInfo />

          {/* Search Bar */}
          <div className="mb-8 md:mb-12">
            <div className="text-center mb-4 md:mb-6 px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🔍 Search Everything
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-4 md:mb-6">
                Find reviews, stories, and media by tags, locations, or keywords
              </p>
            </div>
            <UnifiedSearchBar className="mb-6 md:mb-8" />
          </div>

          {/* Reviews Map */}
          <div className="mb-8 md:mb-12">
            <div className="text-center mb-4 md:mb-6 px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🗺️ Explore Reviews Worldwide
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-3 md:mb-4">
                Discover amazing places with our interactive map. Navigate to any country or region instantly!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                <Navigation className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Use the navigation panel to explore different regions</span>
                <span className="sm:hidden">Explore regions with navigation</span>
              </div>
            </div>
            <AllAdminReviewsMap />
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-base md:text-lg">
                  <Camera className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Photo Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Upload photos and extract GPS location automatically from EXIF data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-base md:text-lg">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Location Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  View locations on OpenStreetMap with precise pinpoint accuracy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-base md:text-lg">
                  <Star className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Star Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Rate places from 1-5 stars across multiple categories and services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300 text-base md:text-lg">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  Lightning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Support reviewers with Lightning zaps for helpful reviews.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-6 md:mb-8 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 bg-yellow-500 rounded-full flex-shrink-0">
                      <Zap className="w-5 h-5 md:w-6 md:h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                        ⚡ Lightning Tips Enabled!
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">
                        Support great reviewers with instant Bitcoin tips. Look for the ⚡ icon on reviews.
                      </p>
                    </div>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100 text-sm md:text-base w-full sm:w-auto">
                      Setup Tips
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Reviews
              </h2>
              <Link to="/dashboard">
                <Button variant="outline" className="text-sm md:text-base w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <LoadMoreReviewFeed />
          </div>

          {/* Relay Configuration */}
          <Card className="mb-6 md:mb-8 border-orange-200 dark:border-orange-800">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Relay Configuration</CardTitle>
              <CardDescription className="text-sm">
                Choose your preferred Nostr relay to discover reviews from different communities
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <RelaySelector className="w-full max-w-md" />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-600 dark:text-gray-400 px-4">
            <p className="mb-4 text-sm md:text-base">
              Vibed with{" "}
              <a
                href="https://soapbox.pub/mkstack"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 hover:underline"
              >
                MKStack
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
