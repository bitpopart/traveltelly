import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadMoreReviewFeed } from '@/components/LoadMoreReviewFeed';
import { RelaySelector } from '@/components/RelaySelector';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Star,
  MapPin,
  Search,
  Filter,
  Plus,
  Map,
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

      <div className="container mx-auto px-2 md:px-4 pt-2 pb-3 md:pt-3 md:pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Compact header */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold leading-none">Reviews</h1>
                <Link to="/">
                  <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:text-blue-600 transition-colors">
                    <Map className="w-3 h-3" />
                    Map
                  </button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Authentic traveler experiences</p>
            </div>
            {user && (
              <Link to="/create-review" className="flex-shrink-0">
                <Button size="sm" className="rounded-full bg-[#27b0ff] hover:bg-[#1a9fe6] text-white flex items-center gap-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Write Review</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filters - desktop only (mobile uses nav search) */}
          <Card className="hidden md:block mb-6">
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

          {/* Reviews feed */}
          <div className="flex items-center justify-between mb-4">
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Switch relay:</span>
              <RelaySelector />
            </div>
          </div>
          <LoadMoreReviewFeed />

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

      <Footer />
    </div>
  );
}