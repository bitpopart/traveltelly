import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Navigation } from "@/components/Navigation";
import { LoginArea } from "@/components/auth/LoginArea";
import { RelaySelector } from "@/components/RelaySelector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMarketplaceProducts } from "@/hooks/useMarketplaceProducts";
import { ProductCard } from "@/components/ProductCard";
import { CreateProductDialog } from "@/components/CreateProductDialog";
import { ShoppingCart, Search, Plus, Store, Zap, CreditCard, Camera, Video, Music, Palette } from "lucide-react";
import { Link } from "react-router-dom";

const Marketplace = () => {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMediaType, setSelectedMediaType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const { data: products, isLoading, error } = useMarketplaceProducts({
    search: searchQuery,
    category: selectedMediaType === 'all' ? undefined : selectedMediaType,
  });

  useSeoMeta({
    title: 'Nostr Media Marketplace - Digital Assets & Creative Content',
    description: 'Decentralized marketplace for digital media, creative assets, and content on Nostr. Buy and sell photos, videos, audio, graphics, and more with Lightning payments.',
  });

  const filteredProducts = products?.filter(product => {
    // Price filter
    if (priceRange !== 'all') {
      const price = parseFloat(product.price);
      switch (priceRange) {
        case 'under-25': if (price >= 25) return false; break;
        case '25-100': if (price < 25 || price > 100) return false; break;
        case '100-500': if (price < 100 || price > 500) return false; break;
        case 'over-500': if (price <= 500) return false; break;
      }
    }

    // Content category filter
    if (selectedCategory !== 'all') {
      if (!product.contentCategory || product.contentCategory !== selectedCategory) {
        return false;
      }
    }

    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6">
              <Store className="w-16 h-16 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                🎨 Nostr Media Marketplace
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Decentralized marketplace for digital media, creative assets & content with Lightning ⚡ payments
              </p>
            </div>

            <div className="flex flex-col items-center gap-4">
              <LoginArea className="max-w-60" />
              {user && (
                <div className="flex flex-wrap justify-center gap-3">
                  <CreateProductDialog>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                  </CreateProductDialog>
                  <Link to="/marketplace/orders">
                    <Button variant="outline" size="lg">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      My Purchases
                    </Button>
                  </Link>
                  <Link to="/marketplace/portfolio">
                    <Button variant="outline" size="lg">
                      <Store className="w-4 h-4 mr-2" />
                      My Portfolio
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Media Types Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-500 rounded-full w-fit mx-auto mb-3">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  📸 Photos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  High-quality stock photos, portraits, and artistic photography
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-red-500 rounded-full w-fit mx-auto mb-3">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🎥 Videos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Stock footage, animations, and professional video content
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-500 rounded-full w-fit mx-auto mb-3">
                  <Music className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🎵 Audio
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Music tracks, sound effects, and audio loops
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-500 rounded-full w-fit mx-auto mb-3">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  🎨 Graphics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Illustrations, icons, templates, and design assets
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500 rounded-full">
                    <Zap className="w-6 h-6 text-white fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      ⚡ Lightning Payments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Instant, low-fee Bitcoin payments for digital media
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      💳 Fiat Payments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      USD, EUR and other currencies for media licensing
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Digital Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search photos, videos, audio, graphics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={selectedMediaType} onValueChange={setSelectedMediaType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Media Type" />
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
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Animals">🐾 Animals</SelectItem>
                    <SelectItem value="Buildings and Architecture">🏢 Buildings and Architecture</SelectItem>
                    <SelectItem value="Business">💼 Business</SelectItem>
                    <SelectItem value="Drinks">🥤 Drinks</SelectItem>
                    <SelectItem value="The Environment">🌍 The Environment</SelectItem>
                    <SelectItem value="States of Mind (emotions, inner voice)">🧠 States of Mind</SelectItem>
                    <SelectItem value="Food">🍕 Food</SelectItem>
                    <SelectItem value="Graphic Resources (backgrounds, textures, symbols)">🎨 Graphic Resources</SelectItem>
                    <SelectItem value="Hobbies and Leisure">🎯 Hobbies and Leisure</SelectItem>
                    <SelectItem value="Industry">🏭 Industry</SelectItem>
                    <SelectItem value="Landscape">🏔️ Landscape</SelectItem>
                    <SelectItem value="Lifestyle">✨ Lifestyle</SelectItem>
                    <SelectItem value="People">👥 People</SelectItem>
                    <SelectItem value="Plants and Flowers">🌸 Plants and Flowers</SelectItem>
                    <SelectItem value="Culture and Religion">🕌 Culture and Religion</SelectItem>
                    <SelectItem value="Science">🔬 Science</SelectItem>
                    <SelectItem value="Social Issues">⚖️ Social Issues</SelectItem>
                    <SelectItem value="Sports">⚽ Sports</SelectItem>
                    <SelectItem value="Technology">💻 Technology</SelectItem>
                    <SelectItem value="Transport">🚗 Transport</SelectItem>
                    <SelectItem value="Travel">✈️ Travel</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-25">Under $25</SelectItem>
                    <SelectItem value="25-100">$25 - $100</SelectItem>
                    <SelectItem value="100-500">$100 - $500</SelectItem>
                    <SelectItem value="over-500">Over $500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Demo Purchase for Testing */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-8 border-purple-200 bg-purple-50 dark:bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-purple-800 dark:text-purple-200">
                  🧪 Demo Purchase (Development Only)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 dark:text-purple-300 mb-4">
                  Test the complete purchase and download flow without making a real payment.
                </p>
                <Button
                  onClick={() => {
                    // Create a demo purchase with realistic product data
                    const demoOrder = {
                      orderId: `demo_${Date.now()}`,
                      productId: 'demo_product',
                      productTitle: 'Sunset Mountain Landscape Collection',
                      buyerEmail: 'demo@example.com',
                      buyerName: 'Demo User',
                      amount: 2500,
                      currency: 'SATS',
                      timestamp: Date.now(),
                      paymentMethod: 'lightning' as const,
                      status: 'verified' as const,
                      productData: {
                        images: [
                          'https://picsum.photos/4000/3000?random=1',
                          'https://picsum.photos/1920/1080?random=1',
                          'https://picsum.photos/1200/800?random=1'
                        ],
                        description: 'High-quality landscape photography collection featuring stunning mountain sunsets. Perfect for commercial and personal use.',
                        category: 'photos', // Keep for backward compatibility
                        mediaType: 'photos',
                        contentCategory: 'Landscape',
                        seller: {
                          pubkey: 'demo_seller',
                          name: 'TravelTelly',
                          picture: 'https://picsum.photos/100/100?random=99'
                        }
                      }
                    };

                    // Store in localStorage
                    const purchases = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
                    purchases.push(demoOrder);
                    localStorage.setItem('traveltelly_purchases', JSON.stringify(purchases));

                    // Generate download link
                    const downloadToken = btoa(`${demoOrder.orderId}:${demoOrder.buyerEmail}:${demoOrder.timestamp}`);
                    const downloadUrl = `/download/${demoOrder.orderId}?token=${downloadToken}&email=${encodeURIComponent(demoOrder.buyerEmail)}`;

                    // Redirect to download page
                    window.location.href = downloadUrl;
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Demo Purchase & Download
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="text-yellow-800 dark:text-yellow-200">
                  🔍 Debug Information
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
                <p><strong>Total products found:</strong> {products?.length || 0}</p>
                <p><strong>Filtered products:</strong> {filteredProducts.length}</p>
                <p><strong>Products with images:</strong> {filteredProducts.filter(p => p.images.length > 0).length}</p>
                <p><strong>Search query:</strong> {searchQuery || 'None'}</p>
                <p><strong>Category filter:</strong> {selectedCategory}</p>
                <p><strong>Price filter:</strong> {priceRange}</p>
                {filteredProducts.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Sample Product Data</summary>
                    <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800 rounded text-xs overflow-auto">
                      {JSON.stringify(filteredProducts[0], null, 2)}
                    </pre>
                  </details>
                )}
                {filteredProducts.length > 0 && filteredProducts[0].images.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-semibold">Test Image URLs</summary>
                    <div className="mt-2 space-y-2">
                      {filteredProducts[0].images.map((url, idx) => (
                        <div key={idx} className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded text-xs">
                          <p><strong>Image {idx + 1}:</strong></p>
                          <p className="break-all">{url}</p>
                          <img
                            src={url}
                            alt={`Test ${idx + 1}`}
                            className="w-20 h-20 object-cover mt-1 border rounded"
                            onLoad={() => console.log(`✅ Debug image ${idx + 1} loaded`)}
                            onError={() => console.error(`❌ Debug image ${idx + 1} failed`)}
                          />
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          )}

          {/* Products Grid */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Digital Media
              </h2>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {filteredProducts.length} assets
              </Badge>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-48 w-full rounded-lg" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="col-span-full">
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <p className="text-muted-foreground">
                        Failed to load media. Try another relay?
                      </p>
                      <RelaySelector className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full">
                <Card className="border-dashed">
                  <CardContent className="py-12 px-8 text-center">
                    <div className="max-w-sm mx-auto space-y-6">
                      <p className="text-muted-foreground">
                        No media found. Try adjusting your search or filters.
                      </p>
                      {user && (
                        <CreateProductDialog>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Upload First Asset
                          </Button>
                        </CreateProductDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Relay Configuration */}
          <Card className="mb-8 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle>Relay Configuration</CardTitle>
              <CardDescription>
                Choose your preferred Nostr relay to discover media from different creators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelaySelector className="w-full max-w-md" />
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
                className="text-blue-600 dark:text-blue-400 hover:underline"
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

export default Marketplace;