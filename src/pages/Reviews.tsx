import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadMoreReviewFeed } from '@/components/LoadMoreReviewFeed';
import { AllAdminReviewsMap } from '@/components/AllAdminReviewsMap';
import { RelaySelector } from '@/components/RelaySelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Star,
  MapPin,
  Search,
  Filter,
  Plus,
  Map,
  List,
  Camera
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Reviews() {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [ratingFilter, setRatingFilter] = useState('all');

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Travel Reviews
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              Discover amazing places through authentic traveler experiences
            </p>

            {user && (
              <div className="flex justify-center gap-3 mb-6">
                <Link to="/create-review">
                  <Button className="bg-orange-600 hover:bg-orange-700 rounded-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Write Review
                  </Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="outline" className="rounded-full">
                    <Camera className="w-4 h-4 mr-2" />
                    Browse Photos
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Search & Filter Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search locations, restaurants, hotels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="rating-high">Highest Rated</SelectItem>
                    <SelectItem value="rating-low">Lowest Rated</SelectItem>
                    <SelectItem value="most-liked">Most Liked</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">⭐⭐⭐⭐⭐ (5 stars)</SelectItem>
                    <SelectItem value="4">⭐⭐⭐⭐ (4+ stars)</SelectItem>
                    <SelectItem value="3">⭐⭐⭐ (3+ stars)</SelectItem>
                    <SelectItem value="2">⭐⭐ (2+ stars)</SelectItem>
                    <SelectItem value="1">⭐ (1+ stars)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle and Content */}
          <Tabs defaultValue="list" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-fit grid-cols-2">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="w-4 h-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Map View
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Switch relay:</span>
                <RelaySelector />
              </div>
            </div>

            <TabsContent value="list" className="space-y-6">
              <LoadMoreReviewFeed />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <AllAdminReviewsMap />

              {/* Map Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Map Legend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm">⭐⭐⭐⭐⭐ Excellent (5 stars)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">⭐⭐⭐⭐ Very Good (4 stars)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm">⭐⭐⭐ Good (3 stars)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">⭐⭐ Fair (2 stars)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="text-sm">⭐ Poor (1 star)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
                      <span className="text-sm">📍 No rating</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mt-8">
            <Card>
              <CardContent className="py-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">4.2</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">1,247</p>
                <p className="text-sm text-muted-foreground">Locations</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6 text-center">
                <Camera className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">3,891</p>
                <p className="text-sm text-muted-foreground">Photos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6 text-center">
                <div className="w-8 h-8 mx-auto mb-2 text-orange-500 flex items-center justify-center text-lg">
                  👥
                </div>
                <p className="text-2xl font-bold">567</p>
                <p className="text-sm text-muted-foreground">Contributors</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          {!user && (
            <Card className="mt-8 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <CardContent className="py-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Join the Community</h3>
                <p className="text-lg mb-6 opacity-90">
                  Share your travel experiences and discover amazing places through authentic reviews
                </p>
                <div className="flex justify-center gap-4">
                  <Button variant="secondary" size="lg">
                    Sign Up Now
                  </Button>
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-orange-600">
                    Learn More
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}