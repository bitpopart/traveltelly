import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { LoginArea } from "@/components/auth/LoginArea";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { ProductCard } from "@/components/ProductCard";
import { Store, Search, Plus, TrendingUp, DollarSign, Eye, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const MarketplacePortfolio = () => {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: myProducts, isLoading } = useMarketplaceProducts({
    seller: user?.pubkey,
    search: searchQuery,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  useSeoMeta({
    title: 'My Portfolio - Nostr Media Marketplace',
    description: 'Manage your digital media portfolio and track sales.',
  });

  // Mock analytics data
  const analytics = {
    totalAssets: myProducts?.length || 0,
    totalViews: 1247,
    totalDownloads: 89,
    totalEarnings: 1850,
    currency: 'USD',
    topPerforming: myProducts?.[0]?.title || 'Sunset Over Mountains - 4K Photo',
  };

  const filteredProducts = myProducts || [];

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/marketplace">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
            </div>
            <div className="text-center">
              <Store className="w-12 h-12 mx-auto text-purple-600 dark:text-purple-400 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                My Portfolio
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Manage your digital media portfolio and track performance
              </p>
            </div>
          </div>

          {!user ? (
            /* Login Required */
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <div className="max-w-sm mx-auto space-y-6">
                  <p className="text-muted-foreground">
                    You need to be logged in to view your portfolio.
                  </p>
                  <LoginArea className="max-w-60 mx-auto" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Analytics Dashboard */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-purple-200 dark:border-purple-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-purple-600" />
                      <span className="text-2xl font-bold">{analytics.totalAssets}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 dark:border-blue-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-blue-600" />
                      <span className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-green-200 dark:border-green-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-green-600" />
                      <span className="text-2xl font-bold">{analytics.totalDownloads}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-yellow-600" />
                      <span className="text-2xl font-bold">
                        ${analytics.totalEarnings.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Asset */}
              <Card className="mb-8 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500 rounded-full">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        🏆 Top Performing Asset
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        "{analytics.topPerforming}" - 45 downloads this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Management */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Media Assets
                </h2>
                <CreateProductDialog>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload New Asset
                  </Button>
                </CreateProductDialog>
              </div>

              {/* Search and Filters */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Manage Portfolio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search your assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Media Types</SelectItem>
                        <SelectItem value="photos">📸 Photos</SelectItem>
                        <SelectItem value="videos">🎥 Videos</SelectItem>
                        <SelectItem value="audio">🎵 Audio</SelectItem>
                        <SelectItem value="graphics">🎨 Graphics</SelectItem>
                        <SelectItem value="illustrations">✏️ Illustrations</SelectItem>
                        <SelectItem value="templates">📄 Templates</SelectItem>
                        <SelectItem value="3d">🧊 3D Models</SelectItem>
                        <SelectItem value="fonts">🔤 Fonts</SelectItem>
                        <SelectItem value="presets">⚙️ Presets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Portfolio Grid */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {filteredProducts.length} assets
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 px-8 text-center">
                      <div className="max-w-sm mx-auto space-y-6">
                        <Store className="w-16 h-16 mx-auto text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No Assets Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Start building your portfolio by uploading your first stock media asset.
                          </p>
                          <CreateProductDialog>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Upload First Asset
                            </Button>
                          </CreateProductDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} />
                        {/* Portfolio-specific overlay */}
                        <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg">
                          <div className="text-xs text-center">
                            <div className="font-semibold text-green-600">
                              {Math.floor(Math.random() * 50) + 1} sales
                            </div>
                            <div className="text-muted-foreground">
                              ${Math.floor(Math.random() * 500) + 50}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Portfolio Tips */}
              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle>Portfolio Tips</CardTitle>
                  <CardDescription>
                    Maximize your stock media sales with these best practices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">📸 Quality Guidelines</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Use high resolution (4K+ for photos, 1080p+ for videos)</li>
                        <li>• Ensure proper lighting and composition</li>
                        <li>• Include multiple formats when possible</li>
                        <li>• Add detailed, searchable descriptions</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">💰 Pricing Strategy</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Research competitor pricing</li>
                        <li>• Consider offering bundle discounts</li>
                        <li>• Price premium content higher</li>
                        <li>• Use both crypto and fiat pricing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplacePortfolio;