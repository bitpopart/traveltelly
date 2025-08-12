// import { useSeoMeta } from '@unhead/react';
import { LoginArea } from "@/components/auth/LoginArea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MapPin, Star, Camera, Zap, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const IndexMinimal = () => {
  const { user } = useCurrentUser();

  // useSeoMeta({
  //   title: 'Reviewstr - Location-Based Reviews on Nostr',
  //   description: 'Share your experiences and discover amazing places on the Nostr network. Upload photos, rate locations, and earn Lightning tips.',
  // });

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#def5ff' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              🌍 Traveltelly
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Nostr Powered Travel Community
            </p>
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

          {/* Status */}
          <Card className="mb-8">
            <CardContent className="py-12 px-8 text-center">
              <div className="max-w-sm mx-auto space-y-6">
                <MapPin className="w-12 h-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-700 dark:text-green-300">
                    ✅ Minimal Page Working
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This page loads successfully. The issue is likely with the ReviewsMap or ReviewFeed components.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p className="mb-4">
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

export default IndexMinimal;