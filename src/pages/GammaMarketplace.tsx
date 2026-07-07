/**
 * Gamma Marketplace - NIP-99 Gamma Spec Marketplace
 * Full product management, shipping, collections, and order messaging
 */
import { useSeoMeta } from '@unhead/react';
import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginArea } from '@/components/auth/LoginArea';
import { GammaProductForm } from '@/components/GammaProductForm';
import { GammaShippingManager } from '@/components/GammaShippingManager';
import { GammaCollectionManager } from '@/components/GammaCollectionManager';
import { GammaOrdersInbox } from '@/components/GammaOrderMessaging';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { useGammaCollections } from '@/hooks/useGammaCollections';
import { useGammaShipping } from '@/hooks/useGammaShipping';
import { useGammaOrders } from '@/hooks/useGammaOrders';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import {
  ShoppingBag, Truck, FolderOpen, MessageSquare, Plus, Package,
  Eye, EyeOff, Edit3, Trash2, ArrowLeft, BarChart3, Zap, Store,
  CheckCircle, Loader2, RefreshCw
} from 'lucide-react';

// ─── Product Row ──────────────────────────────────────────────────────────────

function ProductRow({ product, onEdit, onDelete }: {
  product: MarketplaceProduct;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const naddr = nip19.naddrEncode({ identifier: product.id, pubkey: product.seller.pubkey, kind: 30402 });
  const isHidden = product.event.tags.find(([n]) => n === 'visibility')?.[1] === 'hidden';
  const productType = product.event.tags.find(([n]) => n === 'type')?.[1] || 'simple';
  const productFormat = product.event.tags.find(([n]) => n === 'type')?.[2] || 'digital';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-colors">
      {/* Thumbnail */}
      {product.images[0] ? (
        <img src={product.images[0]} alt={product.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium truncate">{product.title}</p>
          {isHidden && <Badge variant="secondary" className="text-xs flex items-center gap-0.5"><EyeOff className="w-2.5 h-2.5" />Hidden</Badge>}
          <Badge variant="outline" className="text-xs capitalize">{productFormat}</Badge>
          <Badge variant="outline" className="text-xs capitalize">{productType}</Badge>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
          <span className="flex items-center gap-0.5">
            {product.currency === 'SATS' || product.currency === 'BTC'
              ? <><Zap className="w-3 h-3 text-yellow-500" />{product.price} {product.currency}</>
              : <>{product.price} {product.currency}</>
            }
          </span>
          {product.location && <span>📍 {product.location}</span>}
          <span>{new Date(product.createdAt * 1000).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Link to={`/media/preview/${naddr}`}>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Preview">
            <Eye className="w-3.5 h-3.5" />
          </Button>
        </Link>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={onEdit} title="Edit">
          <Edit3 className="w-3.5 h-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={onDelete} title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ─── Products Management Tab ──────────────────────────────────────────────────

function ProductsTab() {
  const { user } = useCurrentUser();
  const { data: products, isLoading, refetch } = useMarketplaceProducts({ seller: user?.pubkey });
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<MarketplaceProduct | null>(null);

  const handleDelete = async (product: MarketplaceProduct) => {
    if (!confirm(`Delete "${product.title}"?`)) return;
    try {
      await publishEvent({
        kind: 30402,
        content: '[DELETED]',
        tags: [
          ['d', product.id],
          ['title', product.title],
          ['price', '0', 'USD'],
          ['status', 'deleted'],
          ['visibility', 'hidden'],
        ],
      });
      toast({ title: 'Product deleted' });
      refetch();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleEdit = (product: MarketplaceProduct) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditProduct(null);
  };

  // Build editData from existing product
  const editData = editProduct ? {
    dTag: editProduct.id,
    title: editProduct.title,
    summary: editProduct.event.tags.find(([n]) => n === 'summary')?.[1],
    description: editProduct.description,
    price: editProduct.price,
    currency: editProduct.currency,
    category: editProduct.contentCategory,
    location: editProduct.location,
    continent: editProduct.continent,
    country: editProduct.country,
    images: editProduct.images,
  } : undefined;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#ec1a58]" />
          <h3 className="font-semibold">My Products</h3>
          {products && <Badge variant="secondary">{products.length}</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-8 w-8 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => { setEditProduct(null); setShowForm(true); }} className="gap-1 text-white" style={{ backgroundColor: '#ec1a58' }}>
            <Plus className="w-3.5 h-3.5" />
            New Product
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />)}
        </div>
      ) : !products?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground mb-3">No products yet</p>
            <Button onClick={() => setShowForm(true)} size="sm" className="text-white" style={{ backgroundColor: '#ec1a58' }}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create First Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <ProductRow key={p.id} product={p} onEdit={() => handleEdit(p)} onDelete={() => handleDelete(p)} />
          ))}
        </div>
      )}

      <GammaProductForm
        isOpen={showForm}
        onClose={handleClose}
        editData={editData}
        onSaved={() => { refetch(); handleClose(); }}
      />
    </div>
  );
}

// ─── Stats Overview ───────────────────────────────────────────────────────────

function MarketplaceStats() {
  const { user } = useCurrentUser();
  const { data: products } = useMarketplaceProducts({ seller: user?.pubkey });
  const { data: collections } = useGammaCollections(user?.pubkey);
  const { data: shipping } = useGammaShipping(user?.pubkey);
  const { data: orders } = useGammaOrders();

  const activeProducts = products?.filter(p => p.status === 'active').length ?? 0;
  const pendingOrders = orders?.filter(o => !o.latestStatus || o.latestStatus === 'pending').length ?? 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Products', value: activeProducts, icon: <ShoppingBag className="w-4 h-4 text-[#ec1a58]" />, color: 'border-pink-200' },
        { label: 'Collections', value: collections?.length ?? 0, icon: <FolderOpen className="w-4 h-4 text-purple-500" />, color: 'border-purple-200' },
        { label: 'Shipping', value: shipping?.length ?? 0, icon: <Truck className="w-4 h-4 text-blue-500" />, color: 'border-blue-200' },
        { label: 'Pending Orders', value: pendingOrders, icon: <MessageSquare className="w-4 h-4 text-orange-500" />, color: 'border-orange-200' },
      ].map(stat => (
        <Card key={stat.label} className={`${stat.color}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {stat.icon}
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function GammaMarketplace() {
  const { user } = useCurrentUser();

  useSeoMeta({
    title: 'Gamma Marketplace Manager — TravelTelly',
    description: 'Manage your NIP-99 Gamma Spec products, shipping options, collections, and orders.',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/marketplace">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Marketplace
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Store className="w-6 h-6 text-[#ec1a58]" />
                Seller Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                NIP-99 Gamma Spec · Products, Shipping, Collections, Orders
              </p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            Gamma Spec v1
          </Badge>
        </div>

        {!user ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Store className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-40" />
              <h2 className="text-xl font-semibold mb-2">Seller Login Required</h2>
              <p className="text-muted-foreground mb-6">
                Connect your Nostr identity to manage products, shipping, and orders.
              </p>
              <LoginArea className="max-w-60 mx-auto" />
            </CardContent>
          </Card>
        ) : (
          <>
            <MarketplaceStats />

            <Tabs defaultValue="products">
              <TabsList className="mb-4 w-full grid grid-cols-4">
                <TabsTrigger value="products" className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Products</span>
                </TabsTrigger>
                <TabsTrigger value="shipping" className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Shipping</span>
                </TabsTrigger>
                <TabsTrigger value="collections" className="flex items-center gap-1.5">
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Collections</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Orders</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <ProductsTab />
              </TabsContent>

              <TabsContent value="shipping">
                <GammaShippingManager />
              </TabsContent>

              <TabsContent value="collections">
                <GammaCollectionManager />
              </TabsContent>

              <TabsContent value="orders">
                <GammaOrdersInbox className="min-h-[500px]" />
              </TabsContent>
            </Tabs>

            {/* Gamma Spec info banner */}
            <Card className="mt-6 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">Gamma Spec Marketplace Protocol</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                      This seller dashboard implements the{' '}
                      <a href="https://github.com/GammaMarkets/market-spec" target="_blank" rel="noopener noreferrer" className="underline">
                        Gamma Market Spec
                      </a>
                      {' '}— an interoperable e-commerce extension for NIP-99 classified listings.
                      Products (kind 30402), shipping options (kind 30406), collections (kind 30405),
                      and order messaging (NIP-17 kind 16/17) are all published to Nostr relays.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
