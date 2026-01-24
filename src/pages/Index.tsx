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
import { useLatestReview, useLatestStory, useLatestStockMedia } from "@/hooks/useLatestItems";
import { MapPin, Star, Camera, Zap, Shield, BookOpen, Search, Navigation } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { data: latestReview } = useLatestReview();
  const { data: latestStory } = useLatestStory();
  const { data: latestStockMedia } = useLatestStockMedia();

  useSeoMeta({
    title: 'Traveltelly - Nostr Powered Travel Community',
    description: 'Nostr Powered Travel Community. Upload photos, rate locations, and earn Lightning tips.',
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <NavigationComponent />
      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6 md:mb-10">
            <h1 className="mb-6 md:mb-8 px-4">
              <Link to="/what-is-nostr" className="inline-block hover:opacity-80 transition-opacity">
                <img 
                  src="/traveltelly-slogan.png" 
                  alt="Nostr Powered Travel Community" 
                  className="h-8 md:h-12 w-auto mx-auto"
                />
              </Link>
            </h1>
            <div className="flex flex-col items-center gap-4 md:gap-6">
              {!user && <LoginArea className="max-w-60" />}

              {/* Feature Cards */}
              <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 w-full max-w-6xl">
                {/* Share Reviews Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/reviews" className="block relative">
                    <div className="aspect-video md:aspect-[4/5] overflow-hidden">
                      {latestReview ? (
                        <img
                          src={latestReview.image}
                          alt={latestReview.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                          <Star className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Button className="rounded-full px-6 py-2 bg-white/95 text-gray-900 hover:bg-white font-medium shadow-lg backdrop-blur-sm">
                          Explore Reviews
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Travel Stories Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <Link to="/stories" className="block relative">
                    <div className="aspect-video md:aspect-[4/5] overflow-hidden">
                      {latestStory ? (
                        <img
                          src={latestStory.image}
                          alt={latestStory.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Button className="rounded-full px-6 py-2 bg-white/95 text-gray-900 hover:bg-white font-medium shadow-lg backdrop-blur-sm">
                          Read Stories
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>

                {/* Stock Media Card */}
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group sm:col-span-2 md:col-span-1">
                  <Link to="/marketplace" className="block relative">
                    <div className="aspect-video md:aspect-[4/5] overflow-hidden">
                      {latestStockMedia ? (
                        <img
                          src={latestStockMedia.image}
                          alt={latestStockMedia.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <Camera className="w-16 h-16 md:w-24 md:h-24 text-white opacity-50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <Button className="rounded-full px-6 py-2 bg-white/95 text-gray-900 hover:bg-white font-medium shadow-lg backdrop-blur-sm">
                          Stock Media
                        </Button>
                      </div>
                    </div>
                  </Link>
                </Card>
              </div>

              {user && (
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  <Link to="/create-review">
                    <Button size="lg" className="rounded-full text-white text-sm md:text-base" style={{ backgroundColor: '#393636' }}>
                      <Camera className="w-4 h-4 mr-2" />
                      Create Review
                    </Button>
                  </Link>
                  <Link to="/stock-media-permissions">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
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
                      <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base" style={{ borderColor: '#393636', color: '#393636' }}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}

                  {/* Always show admin test link for debugging */}
                  {import.meta.env.DEV && (
                    <Link to="/admin-test">
                      <Button variant="outline" size="lg" className="rounded-full border-blue-300 text-blue-700 hover:bg-blue-50 text-sm md:text-base">
                        <Shield className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Admin Test Page</span>
                        <span className="sm:hidden">Admin Test</span>
                      </Button>
                    </Link>
                  )}
                  <Link to="/photo-upload-demo">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <Camera className="w-4 h-4 mr-2" />
                      Photo Demo
                    </Button>
                  </Link>
                  <Link to="/gps-correction-demo">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">GPS Correction</span>
                      <span className="sm:hidden">GPS Fix</span>
                    </Button>
                  </Link>
                  <Link to="/search-test">
                    <Button variant="outline" size="lg" className="rounded-full text-sm md:text-base">
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
            <UnifiedSearchBar />
          </div>

          {/* Reviews Map */}
          <div className="mb-8 md:mb-12">
            <AllAdminReviewsMap />
          </div>

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-6 md:mb-8 border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#393636' }}>
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
                    <Button variant="outline" className="rounded-full text-sm md:text-base w-full sm:w-auto" style={{ borderColor: '#393636', color: '#393636' }}>
                      Setup Tips
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Recent Reviews
              </h2>
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-full text-sm md:text-base w-full sm:w-auto">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <LoadMoreReviewFeed />
          </div>

          {/* Relay Configuration */}
          <Card className="mb-6 md:mb-8 border-gray-200 dark:border-gray-700">
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
                className="hover:underline"
                style={{ color: '#393636' }}
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
