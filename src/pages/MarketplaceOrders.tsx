import { useSeoMeta } from '@unhead/react';
import { useState, useEffect } from 'react';
import { Navigation } from "@/components/Navigation";
import { LoginArea } from "@/components/auth/LoginArea";
// RelaySelector not used in current implementation
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ShoppingCart, Search, Package, Download, Calendar, CreditCard, Zap, AlertCircle, CheckCircle, Clock, Mail } from "lucide-react";
import { Link } from "react-router-dom";

interface PurchaseOrder {
  orderId: string;
  productId: string;
  productTitle: string;
  buyerEmail: string;
  buyerName?: string;
  amount: number;
  currency: string;
  timestamp: number;
  paymentMethod: 'lightning' | 'stripe';
  status: 'verified' | 'pending' | 'expired';
  invoice?: string;
}

const MarketplaceOrders = () => {
  const { user } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useSeoMeta({
    title: 'My Orders - Nostr Media Marketplace',
    description: 'View your purchase history and download your digital media files.',
  });

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    setIsLoading(true);
    try {
      // Load orders from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('traveltelly_purchases') || '[]');
      setOrders(storedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.productTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'expired': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number, currency: string) => {
    if (currency === 'SATS' || currency === 'BTC') {
      return `${amount.toLocaleString()} ${currency}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const generateDownloadLink = (order: PurchaseOrder) => {
    // Generate download token (in production, this would be done server-side)
    const downloadToken = btoa(`${order.orderId}:${order.buyerEmail}:${order.timestamp}`);
    return `/download/${order.orderId}?token=${downloadToken}&email=${encodeURIComponent(order.buyerEmail)}`;
  };

  const getOrderAge = (timestamp: number) => {
    const ageInDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (ageInDays === 0) return 'Today';
    if (ageInDays === 1) return '1 day ago';
    if (ageInDays < 30) return `${ageInDays} days ago`;
    return 'Over 30 days ago';
  };

  const isDownloadExpired = (timestamp: number) => {
    const ageInDays = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    return ageInDays > 30; // Downloads expire after 30 days
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <ShoppingCart className="w-12 h-12 mx-auto text-blue-600 dark:text-blue-400 mb-4" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                My Orders
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                View your purchase history and download your digital media
              </p>
            </div>

            <LoginArea className="max-w-60 mx-auto" />
          </div>

          {!user ? (
            <Card className="max-w-md mx-auto">
              <CardContent className="py-12 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Login Required</h3>
                <p className="text-muted-foreground mb-4">
                  Please log in to view your order history and downloads.
                </p>
                <p className="text-sm text-muted-foreground">
                  Note: Orders are currently stored locally in your browser.
                  Future versions will sync with your Nostr identity.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Search and Filters */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Find Your Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        placeholder="Search by product name or order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="verified">Verified</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Orders List */}
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order History
                  </h2>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {filteredOrders.length} orders
                  </Badge>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <div className="flex gap-6">
                            <Skeleton className="w-24 h-24 rounded-lg" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <div className="grid md:grid-cols-3 gap-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-8 w-24" />
                              <Skeleton className="h-8 w-24" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 px-8 text-center">
                      <div className="max-w-sm mx-auto space-y-6">
                        <Package className="w-16 h-16 mx-auto text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                          <p className="text-muted-foreground">
                            {searchQuery || statusFilter !== 'all'
                              ? 'Try adjusting your search or filters.'
                              : 'You haven\'t made any purchases yet.'
                            }
                          </p>
                        </div>
                        <Link to="/marketplace">
                          <Button>
                            Browse Marketplace
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => {
                      const isExpired = isDownloadExpired(order.timestamp);
                      const downloadLink = generateDownloadLink(order);

                      return (
                        <Card key={order.orderId} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex gap-6">
                              {/* Thumbnail Placeholder */}
                              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>

                              {/* Order Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h3 className="font-semibold text-lg line-clamp-1">
                                      {order.productTitle}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                      Order #{order.orderId}
                                    </p>
                                  </div>
                                  <div className="flex gap-2">
                                    <Badge className={getStatusColor(order.status)}>
                                      {getStatusIcon(order.status)}
                                      <span className="ml-1 capitalize">{order.status}</span>
                                    </Badge>
                                    {isExpired && (
                                      <Badge variant="destructive">
                                        Expired
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="grid md:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground">Amount</p>
                                    <div className="flex items-center gap-1">
                                      <Zap className="w-3 h-3 text-yellow-500" />
                                      <span className="font-semibold">
                                        {formatPrice(order.amount, order.currency)}
                                      </span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Purchase Date</p>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>{formatDate(order.timestamp)}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Payment Method</p>
                                    <div className="flex items-center gap-1">
                                      {order.paymentMethod === 'lightning' ? (
                                        <Zap className="w-3 h-3 text-yellow-500" />
                                      ) : (
                                        <CreditCard className="w-3 h-3 text-blue-500" />
                                      )}
                                      <span className="capitalize">{order.paymentMethod}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Age</p>
                                    <span className={isExpired ? 'text-red-600 dark:text-red-400' : ''}>
                                      {getOrderAge(order.timestamp)}
                                    </span>
                                  </div>
                                </div>

                                {order.buyerEmail && (
                                  <div className="mt-2 text-sm">
                                    <p className="text-muted-foreground">Email: {order.buyerEmail}</p>
                                  </div>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                {order.status === 'verified' && !isExpired ? (
                                  <Link to={downloadLink}>
                                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                  </Link>
                                ) : isExpired ? (
                                  <Button size="sm" variant="outline" disabled>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Expired
                                  </Button>
                                ) : order.status === 'pending' ? (
                                  <Button size="sm" variant="outline" disabled>
                                    <Clock className="w-4 h-4 mr-2" />
                                    Pending
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="outline" disabled>
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    Unavailable
                                  </Button>
                                )}

                                <Button size="sm" variant="ghost" asChild>
                                  <a href={`mailto:traveltelly@primal.net?subject=Order Support&body=Order ID: ${order.orderId}`}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Support
                                  </a>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Support Info */}
              <Card className="mt-8 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle>Need Help?</CardTitle>
                  <CardDescription>
                    Having trouble with your orders or downloads?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Download Issues</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Download links are valid for 30 days</li>
                        <li>• Orders are stored locally in your browser</li>
                        <li>• Try a different browser if downloads fail</li>
                        <li>• Clear browser cache if having issues</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Contact Support</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Email: traveltelly@primal.net</li>
                        <li>• Include your order ID in messages</li>
                        <li>• Response time: 24 hours</li>
                        <li>• Lightning address for direct contact</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Footer */}
          <div className="text-center text-gray-600 dark:text-gray-400 mt-8">
            <p className="mb-4">

          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceOrders;