import { useSeoMeta } from '@unhead/react';
import { LoginArea } from "@/components/auth/LoginArea";
import { RelaySelector } from "@/components/RelaySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewFeed } from "@/components/ReviewFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MapPin, Star, Camera, Zap, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const IndexNoMap = () => {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Reviewstr - Location-Based Reviews on Nostr',
    description: 'Share your experiences and discover amazing places on the Nostr network. Upload photos, rate locations, and earn Lightning tips.',
  });

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🌍 Traveltelly
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <Link to="/what-is-nostr">
                <Button 
                  className="rounded-full font-semibold text-white hover:opacity-90 transition-opacity text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 h-auto"
                  style={{ backgroundColor: '#b700d7' }}
                >
                  NOSTR POWERED TRAVEL COMMUNITY
                </Button>
              </Link>
            </div>
            <div className="flex flex-col items-center gap-4">
              <LoginArea className="max-w-60" />
              {user && (
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/create-review">
                    <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Create Review
                    </Button>
                  </Link>
                  <Link to="/settings">
                    <Button variant="outline" size="lg">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  <Link to="/photo-upload-demo">
                    <Button variant="outline" size="lg">
                      <Camera className="w-4 h-4 mr-2" />
                      Photo Demo
                    </Button>
                  </Link>
                  <Link to="/gps-correction-demo">
                    <Button variant="outline" size="lg">
                      <MapPin className="w-4 h-4 mr-2" />
                      GPS Correction
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-12">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🗺️ Explore Reviews
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Map temporarily disabled for debugging
              </p>
            </div>
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Interactive map will be restored once debugging is complete.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Camera className="w-5 h-5" />
                  Photo Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Upload photos and extract GPS location automatically from EXIF data.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <MapPin className="w-5 h-5" />
                  Location Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View locations on OpenStreetMap with precise pinpoint accuracy.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Star className="w-5 h-5" />
                  Star Ratings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Rate places from 1-5 stars across multiple categories and services.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-orange-200 dark:border-orange-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <Zap className="w-5 h-5" />
                  Lightning Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Support reviewers with Lightning zaps for helpful reviews.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Lightning Tips Info */}
          {user && (
            <Card className="mb-8 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500 rounded-full">
                      <Zap className="w-6 h-6 text-white fill-current" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        ⚡ Lightning Tips Enabled!
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Support great reviewers with instant Bitcoin tips. Look for the ⚡ icon on reviews.
                      </p>
                    </div>
                  </div>
                  <Link to="/settings">
                    <Button variant="outline" className="border-yellow-400 text-yellow-700 hover:bg-yellow-100">
                      Setup Tips
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Recent Reviews
              </h2>
              <Link to="/dashboard">
                <Button variant="outline">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <ReviewFeed />
          </div>

          {/* Relay Configuration */}
          <Card className="mb-8 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle>Relay Configuration</CardTitle>
              <CardDescription>
                Choose your preferred Nostr relay to discover reviews from different communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelaySelector className="w-full max-w-md" />
            </CardContent>
          </Card>


        </div>
      </div>
    </div>
  );
};

export default IndexNoMap;