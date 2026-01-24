import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Edit3, Save, X, Trash2 } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

interface EditMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
  onUpdate?: () => void;
}

export function EditMediaDialog({ isOpen, onClose, product, onUpdate }: EditMediaDialogProps) {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'sold' | 'deleted',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        category: product.category,
        location: product.location || '',
        status: product.status,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim()) return;

    setIsSubmitting(true);
    try {
      // Create updated event with same d-tag to replace the original
      createEvent({
        kind: 30402, // NIP-99 classified listing
        content: formData.description,
        tags: [
          ['d', product.id], // Same identifier to replace
          ['title', formData.title.trim()],
          ['summary', formData.description.trim()],
          ['price', formData.price.trim(), formData.currency],
          ['location', formData.location.trim()],
          ['status', formData.status],
          ['t', formData.category], // Category tag
          ['t', 'media'], // General media tag
          ['t', 'marketplace'], // Marketplace tag
          // Preserve existing image tags
          ...product.event.tags.filter(([name]) =>
            ['image', 'img', 'photo', 'picture', 'url', 'imeta'].includes(name)
          ),
        ],
      });

      toast({
        title: "Media updated!",
        description: "Your media listing has been updated.",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to update media:', error);
      toast({
        title: "Failed to update media",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      // Create a deletion event
      createEvent({
        kind: 30402,
        content: '[DELETED] This media has been removed by the owner.',
        tags: [
          ['d', product.id], // Same identifier to replace
          ['title', `[DELETED] ${product.title}`],
          ['summary', '[DELETED] This media has been removed by the owner.'],
          ['price', '0', 'USD'],
          ['status', 'deleted'],
          ['deleted', 'true'],
          ['t', 'deleted'],
        ],
      });

      toast({
        title: "Media deleted",
        description: "Your media listing has been removed.",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete media:', error);
      toast({
        title: "Failed to delete media",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            Edit Media Listing
          </DialogTitle>
          <DialogDescription>
            Update your media listing details. Changes will be published to the network.
          </DialogDescription>
        </DialogHeader>

        {!showDeleteConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter media title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your media..."
                rows={4}
              />
            </div>

            {/* Price and Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="SATS">SATS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photos">📸 Photos</SelectItem>
                    <SelectItem value="videos">🎥 Videos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'inactive' | 'sold' | 'deleted') =>
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Optional location..."
              />
            </div>

            {/* Media Info */}
            <div className="space-y-4">
              <Label>Media Files</Label>

              {/* Current Images Display */}
              {product.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            Failed to load
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="absolute -top-2 -right-2 text-xs"
                        >
                          {index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.images.map((image, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        Image {index + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">No images attached</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                To change media files, you'll need to create a new listing. Image editing will be available in a future update.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Listing
              </Button>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !formData.price.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          /* Delete Confirmation */
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Media Listing</h3>
                <p className="text-muted-foreground">
                  Are you sure you want to delete "{product.title}"? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Deleting...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}