import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAllMediaAssets, useUpdateMediaStatus, useDeleteMediaAsset, useEditMediaAsset, useBulkDeleteMediaAssets, useMediaStatistics, type MediaManagementFilters } from '@/hooks/useMediaManagement';
import { useAuthorizedMediaUploaders } from '@/hooks/useStockMediaPermissions';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { formatDistanceToNow } from 'date-fns';
import {
  Camera,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  DollarSign,
  Flag,
  Play,
  Pause,
  AlertCircle,
  Gift
} from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { nip19 } from 'nostr-tools';

interface MediaItemProps {
  product: MarketplaceProduct;
  onStatusUpdate: (product: MarketplaceProduct, status: 'active' | 'inactive' | 'flagged', reason?: string) => void;
  onDelete: (product: MarketplaceProduct, reason: string) => void;
  onEdit: (product: MarketplaceProduct, updates: Partial<MarketplaceProduct>) => void;
  onToggleFree: (product: MarketplaceProduct, isFree: boolean) => void;
}

interface UserSelectorProps {
  mediaAssets: MarketplaceProduct[];
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
}

function UserItem({ user, selectedUsers, onSelectionChange }: {
  user: { pubkey: string; count: number };
  selectedUsers: string[];
  onSelectionChange: (users: string[]) => void;
}) {
  const author = useAuthor(user.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(user.pubkey);
  const userKey = user.pubkey;

  return (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
      <input
        type="checkbox"
        id={user.pubkey}
        checked={selectedUsers.includes(userKey)}
        onChange={(e) => {
          if (e.target.checked) {
            onSelectionChange([...selectedUsers, userKey]);
          } else {
            onSelectionChange(selectedUsers.filter(u => u !== userKey));
          }
        }}
        className="rounded border-gray-300"
      />
      <label htmlFor={user.pubkey} className="flex-1 cursor-pointer">
        <div className="flex justify-between items-center">
          <span className="font-medium">{displayName}</span>
          <Badge variant="secondary" className="text-xs">
            {user.count} asset{user.count !== 1 ? 's' : ''}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {user.pubkey}
        </div>
      </label>
    </div>
  );
}

function UserSelector({ mediaAssets, selectedUsers, onSelectionChange }: UserSelectorProps) {
  // Get unique users with their metadata
  const uniqueUsers = React.useMemo(() => {
    const userMap = new Map();

    mediaAssets.forEach(asset => {
      const key = asset.seller.pubkey;
      if (!userMap.has(key)) {
        userMap.set(key, {
          pubkey: asset.seller.pubkey,
          count: 1,
          assets: [asset]
        });
      } else {
        userMap.get(key).count++;
        userMap.get(key).assets.push(asset);
      }
    });

    return Array.from(userMap.values()).sort((a, b) => b.count - a.count);
  }, [mediaAssets]);

  return (
    <div className="space-y-2">
      {uniqueUsers.map((user) => (
        <UserItem
          key={user.pubkey}
          user={user}
          selectedUsers={selectedUsers}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </div>
  );
}

function MediaItem({ product, onStatusUpdate, onDelete, onEdit, onToggleFree }: MediaItemProps) {
  const author = useAuthor(product.seller.pubkey);
  const metadata = author.data?.metadata;
  const [statusReason, setStatusReason] = useState('');

  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'active' | 'inactive' | 'flagged' | null>(null);
  const [editForm, setEditForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    currency: product.currency,
    category: product.category,
  });

  const displayName = metadata?.name || genUserName(product.seller.pubkey);
  
  // Check if this item is marked as free
  const isFree = product.event.tags.some(tag => tag[0] === 'free' && tag[1] === 'true');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photos': return '📸';
      case 'videos': return '🎥';
      case 'audio': return '🎵';
      case 'graphics': return '🎨';
      case 'illustrations': return '✏️';
      case 'templates': return '📄';
      case '3d': return '🧊';
      case 'fonts': return '🔤';
      case 'presets': return '⚙️';
      default: return '📦';
    }
  };

  const handleStatusChange = (newStatus: 'active' | 'inactive' | 'flagged') => {
    setPendingStatus(newStatus);
    if (newStatus === 'inactive' || newStatus === 'flagged') {
      setShowStatusDialog(true);
    } else {
      onStatusUpdate(product, newStatus);
      setPendingStatus(null);
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      onStatusUpdate(product, pendingStatus, statusReason || undefined);
      setShowStatusDialog(false);
      setStatusReason('');
      setPendingStatus(null);
    }
  };

  const handleDelete = () => {
    onDelete(product, 'Admin deletion');
  };

  const handleEdit = () => {
    onEdit(product, editForm);
    setShowEditDialog(false);
  };

  const resetEditForm = () => {
    setEditForm({
      title: product.title,
      description: product.description,
      price: product.price,
      currency: product.currency,
      category: product.category,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Media Preview */}
          <div className="flex-shrink-0">
            {product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.title}
                className="w-20 h-20 object-cover rounded-lg"
                onError={(e) => {
                  console.log('Image failed to load:', product.images[0]);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center ${product.images.length > 0 ? 'hidden' : ''}`}>
              <span className="text-2xl">{getCategoryIcon(product.category)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                <p className="text-sm text-muted-foreground truncate">{product.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge className={getStatusColor(product.status)}>
                  {getStatusIcon(product.status)}
                  <span className="ml-1 capitalize">{product.status}</span>
                </Badge>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{displayName}</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>{product.price} {product.currency}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{getCategoryIcon(product.category)}</span>
                <span className="capitalize">{product.category}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(product.createdAt * 1000), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Status Actions */}
              {product.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('inactive')}
                >
                  <Pause className="w-3 h-3 mr-1" />
                  Deactivate
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('active')}
                >
                  <Play className="w-3 h-3 mr-1" />
                  Activate
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('flagged')}
              >
                <Flag className="w-3 h-3 mr-1" />
                Flag
              </Button>

              {/* Mark as Free Toggle */}
              <Button
                variant={isFree ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFree(product, !isFree)}
                className={isFree ? "bg-green-600 hover:bg-green-700 text-white" : ""}
              >
                <Gift className="w-3 h-3 mr-1" />
                {isFree ? 'Free ✓' : 'Mark Free'}
              </Button>

              {/* Edit Action */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetEditForm();
                  setShowEditDialog(true);
                }}
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>

              {/* Delete Action */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Media Asset</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove "{product.title}" from the marketplace. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Media
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingStatus === 'inactive' ? 'Deactivate' : 'Flag'} Media Asset
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {pendingStatus === 'inactive'
                ? 'This will hide the media from the marketplace. You can reactivate it later.'
                : 'This will flag the media for review and hide it from the marketplace.'
              }
            </p>
            <div>
              <Label htmlFor="statusReason">Reason (optional)</Label>
              <Textarea
                id="statusReason"
                placeholder="Explain the reason for this action..."
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmStatusChange}>
                {pendingStatus === 'inactive' ? 'Deactivate' : 'Flag'} Media
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Media Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTitle">Title *</Label>
                <Input
                  id="editTitle"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Media title..."
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </div>

            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the media asset..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editPrice">Price *</Label>
                <Input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="editCurrency">Currency</Label>
                <Select
                  value={editForm.currency}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="sats">sats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!editForm.title.trim() || !editForm.price || parseFloat(editForm.price) <= 0}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function MediaManagement() {
  const [filters, setFilters] = useState<MediaManagementFilters>({});
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showUserDeleteDialog, setShowUserDeleteDialog] = useState(false);
  const [bulkDeleteInProgress, setBulkDeleteInProgress] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const { data: authorizedUploaders, isLoading: isLoadingAuth } = useAuthorizedMediaUploaders();
  const { data: mediaAssets = [], isLoading, error } = useAllMediaAssets(filters);
  const updateStatus = useUpdateMediaStatus();
  const deleteMedia = useDeleteMediaAsset();
  const editMedia = useEditMediaAsset();
  const bulkDeleteMedia = useBulkDeleteMediaAssets();
  const stats = useMediaStatistics();

  // Traveltelly admin pubkey
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = (() => {
    try {
      const decoded = nip19.decode(ADMIN_NPUB);
      return decoded.data as string;
    } catch {
      return '';
    }
  })();

  const handleStatusUpdate = (product: MarketplaceProduct, status: 'active' | 'inactive' | 'flagged', reason?: string) => {
    updateStatus.mutate({ product, newStatus: status, reason });
  };

  const handleDelete = (product: MarketplaceProduct, reason: string) => {
    deleteMedia.mutate({ product, reason });
  };

  const handleEdit = (product: MarketplaceProduct, updates: Partial<MarketplaceProduct>) => {
    editMedia.mutate({ product, updates });
  };

  const handleToggleFree = (product: MarketplaceProduct, isFree: boolean) => {
    // We'll update the product by republishing it with or without the free tag
    const updates = {
      ...product,
      isFree, // This will be used to add/remove the free tag
    };
    editMedia.mutate({ product, updates });
  };

  const handleBulkDelete = () => {
    setBulkDeleteInProgress(true);

    bulkDeleteMedia.mutate({ products: mediaAssets }, {
      onSettled: () => {
        setBulkDeleteInProgress(false);
        setShowBulkDeleteDialog(false);
      }
    });
  };

  // Calculate selected user assets
  const selectedUserAssets = useMemo(() => {
    return mediaAssets.filter(asset => {
      return selectedUsers.includes(asset.seller.pubkey);
    });
  }, [mediaAssets, selectedUsers]);

  const handleUserDelete = () => {
    setBulkDeleteInProgress(true);

    bulkDeleteMedia.mutate({ products: selectedUserAssets }, {
      onSettled: () => {
        setBulkDeleteInProgress(false);
        setShowUserDeleteDialog(false);
        setSelectedUsers([]);
      }
    });
  };

  const handleRemoveNonAdminAssets = () => {
    setBulkDeleteInProgress(true);

    // Filter out admin assets, keep only non-admin assets for deletion
    const nonAdminAssets = mediaAssets.filter(asset => asset.seller.pubkey !== ADMIN_HEX);

    console.log('🎯 Targeting non-admin assets for deletion:', nonAdminAssets.map(a => ({
      title: a.title,
      seller: a.seller.pubkey,
      id: a.id,
      eventId: a.event.id
    })));

    bulkDeleteMedia.mutate({ products: nonAdminAssets }, {
      onSettled: () => {
        setBulkDeleteInProgress(false);
      }
    });
  };

  // Emergency nuclear option - delete everything visible
  const handleNuclearDelete = () => {
    setBulkDeleteInProgress(true);

    console.log('☢️ NUCLEAR DELETE: Targeting ALL visible assets:', mediaAssets.map(a => ({
      title: a.title,
      seller: a.seller.pubkey,
      id: a.id,
      eventId: a.event.id
    })));

    bulkDeleteMedia.mutate({ products: mediaAssets }, {
      onSettled: () => {
        setBulkDeleteInProgress(false);
      }
    });
  };

  const updateFilter = (key: keyof MediaManagementFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardContent className="py-8 text-center">
          <p className="text-red-600 dark:text-red-400">
            Failed to load media assets. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Assets</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Recent</p>
                <p className="text-2xl font-bold">{stats.recentUploads}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Media Assets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Button
                variant={filters.seller === ADMIN_HEX ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateFilter('seller', filters.seller === ADMIN_HEX ? '' : ADMIN_HEX)}
              >
                {filters.seller === ADMIN_HEX ? 'Show All Users' : 'Admin Uploads Only'}
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by title or description..."
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filters.category || 'all'} onValueChange={(value) => updateFilter('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => updateFilter('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={filters.dateRange || 'all'} onValueChange={(value) => updateFilter('dateRange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              🔍 Admin Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700 dark:text-yellow-300">
            <p><strong>Total media assets:</strong> {mediaAssets.length}</p>
            <p><strong>Assets with images:</strong> {mediaAssets.filter(m => m.images.length > 0).length}</p>
            <p><strong>Admin filter active:</strong> {filters.seller === ADMIN_HEX ? 'Yes' : 'No'}</p>
            <p><strong>Admin hex:</strong> {ADMIN_HEX}</p>
            <p><strong>Non-admin assets:</strong> {mediaAssets.filter(a => a.seller.pubkey !== ADMIN_HEX).length}</p>
            <p><strong>Authorized uploaders:</strong> {authorizedUploaders?.size || 0}</p>
            <p><strong>Loading auth:</strong> {isLoadingAuth ? 'Yes' : 'No'}</p>

            <div className="mt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  console.log('🔍 All media assets:', mediaAssets);
                  console.log('🔍 Non-admin assets:', mediaAssets.filter(a => a.seller.pubkey !== ADMIN_HEX));
                }}
              >
                Log Assets to Console
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Force refresh queries
                  window.location.reload();
                }}
              >
                Force Refresh
              </Button>
            </div>

            {mediaAssets.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-semibold">Sample Media Asset</summary>
                <pre className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-800 rounded text-xs overflow-auto">
                  {JSON.stringify(mediaAssets[0], null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      )}

      {/* Media List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Media Assets ({mediaAssets.length})
            </CardTitle>
            {mediaAssets.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUserDeleteDialog(true)}
                  disabled={bulkDeleteInProgress}
                >
                  <User className="w-4 h-4 mr-2" />
                  Delete by User
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleRemoveNonAdminAssets}
                  disabled={bulkDeleteInProgress || mediaAssets.filter(a => a.seller.pubkey !== ADMIN_HEX).length === 0}
                >
                  {bulkDeleteInProgress ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-current border-t-transparent rounded-full" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Remove Non-Admin ({mediaAssets.filter(a => a.seller.pubkey !== ADMIN_HEX).length})
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDeleteDialog(true)}
                  disabled={bulkDeleteInProgress}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Remove All Media
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleNuclearDelete}
                  disabled={bulkDeleteInProgress}
                  className="bg-red-800 hover:bg-red-900"
                >
                  {bulkDeleteInProgress ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      Nuking...
                    </>
                  ) : (
                    <>
                      ☢️ NUCLEAR DELETE
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {(isLoading || isLoadingAuth) ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4 p-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : mediaAssets.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Media Assets Found</h3>
              <p className="text-muted-foreground">
                {Object.keys(filters).length > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'No media assets have been uploaded yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaAssets.map((product) => (
                <MediaItem
                  key={product.id}
                  product={product}
                  onStatusUpdate={handleStatusUpdate}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  onToggleFree={handleToggleFree}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Remove All Media Assets
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p className="text-base font-semibold">
                  ⚠️ This will permanently delete ALL {mediaAssets.length} media assets from the marketplace.
                </p>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>This action will:</strong>
                  </p>
                  <ul className="text-sm text-red-700 dark:text-red-300 mt-1 space-y-1">
                    <li>• Delete all marketplace listings from all users</li>
                    <li>• Remove all uploaded media files and previews</li>
                    <li>• Clear the entire marketplace catalog</li>
                    <li>• Cannot be undone</li>
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  Each deletion will be logged with "Admin bulk deletion" as the reason.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteInProgress}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkDeleteInProgress}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkDeleteInProgress ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Deleting... ({mediaAssets.length} items)
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All {mediaAssets.length} Assets
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User-Specific Delete Dialog */}
      <AlertDialog open={showUserDeleteDialog} onOpenChange={setShowUserDeleteDialog}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
              <User className="w-5 h-5" />
              Delete Media by User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select users whose media assets you want to delete from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto border rounded-lg p-3">
              <UserSelector
                mediaAssets={mediaAssets}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
              />
            </div>

            {selectedUsers.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  <strong>Selected:</strong> {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''}
                  ({selectedUserAssets.length} asset{selectedUserAssets.length !== 1 ? 's' : ''} will be deleted)
                </p>
                <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Users: {selectedUsers.join(', ')}
                </div>
              </div>
            )}

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select all users except the admin
                  const allUserPubkeys = Array.from(new Set(mediaAssets.map(asset => asset.seller.pubkey)));
                  const nonAdminUsers = allUserPubkeys.filter(pubkey => pubkey !== ADMIN_HEX);
                  setSelectedUsers(nonAdminUsers);
                }}
              >
                Select All Non-Admin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allUserPubkeys = Array.from(new Set(mediaAssets.map(asset => asset.seller.pubkey)));
                  setSelectedUsers(allUserPubkeys);
                }}
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteInProgress}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUserDelete}
              disabled={bulkDeleteInProgress || selectedUsers.length === 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {bulkDeleteInProgress ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete {selectedUserAssets.length} Asset{selectedUserAssets.length !== 1 ? 's' : ''}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}