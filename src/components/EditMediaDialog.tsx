import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Edit3, Save, X, Trash2, Upload, XCircle, Loader2, Globe2, FolderTree } from 'lucide-react';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { CONTINENTS, getCountriesByContinent } from '@/lib/geoData';

interface EditMediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: MarketplaceProduct;
  onUpdate?: () => void;
}

export function EditMediaDialog({ isOpen, onClose, product, onUpdate }: EditMediaDialogProps) {
  const { mutate: createEvent } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    category: '',
    location: '',
    status: 'active' as 'active' | 'inactive' | 'sold' | 'deleted',
    continent: '',
    country: '',
  });

  const [images, setImages] = useState<string[]>([]);
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
        continent: product.continent || '',
        country: product.country || '',
      });
      setImages(product.images);
    }
  }, [product]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of Array.from(files)) {
        const tags = await uploadFile(file);
        const url = tags[0]?.[1]; // First tag contains the URL
        if (url) {
          setImages(prev => [...prev, url]);
          toast({
            title: "Image uploaded!",
            description: `Added ${file.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast({
        title: "Upload failed",
        description: "Could not upload image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Image removed",
      description: "Image will be removed when you save changes.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.price.trim()) return;

    setIsSubmitting(true);
    try {
      // Build image tags from current images array
      const imageTags = images.map(url => ['image', url]);

      // Preserve ALL existing tags from the original event
      // This ensures we don't lose any data like keywords, geohash, etc.
      const preservedTags = product.event.tags.filter(([name]) => {
        // Exclude tags that we're explicitly updating
        const excludedTags = ['d', 'title', 'summary', 'price', 'location', 'status', 'image', 'continent', 'country', 'geo_folder'];
        return !excludedTags.includes(name);
      });

      // Build new tags
      const newTags: string[][] = [
        ['d', product.id], // Same identifier to replace
        ['title', formData.title.trim()],
        ['summary', formData.description.trim()],
        ['price', formData.price.trim(), formData.currency],
        ['status', formData.status],
        ...imageTags,
      ];

      // Add location if provided
      if (formData.location?.trim()) {
        newTags.push(['location', formData.location.trim()]);
      }

      // Add geographical tags if provided
      if (formData.continent?.trim()) {
        newTags.push(['continent', formData.continent.trim()]);
      }
      if (formData.country?.trim()) {
        newTags.push(['country', formData.country.trim()]);
      }
      if (formData.continent?.trim() && formData.country?.trim()) {
        newTags.push(['geo_folder', `${formData.continent.trim()}/${formData.country.trim()}`]);
      }

      // Combine preserved tags with new tags
      const allTags = [...newTags, ...preservedTags];

      // Create updated event with same d-tag to replace the original
      createEvent({
        kind: 30402, // NIP-99 classified listing
        content: formData.description,
        tags: allTags,
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

            {/* Geographical Organization */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-semibold">Geographical Organization</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                📁 Organize: World → Continent → Country → Your File
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="continent">Continent</Label>
                  <Select
                    value={formData.continent}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, continent: value, country: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select continent" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map((continent) => (
                        <SelectItem key={continent.value} value={continent.value}>
                          {continent.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    disabled={!formData.continent}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.continent ? "Select country" : "Select continent first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.continent && getCountriesByContinent(formData.continent).map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.continent && formData.country && (
                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 text-xs text-green-900 dark:text-green-100">
                    <Globe2 className="w-3 h-3" />
                    <span className="font-medium">
                      📂 World → {CONTINENTS.find(c => c.value === formData.continent)?.label} → {getCountriesByContinent(formData.continent).find(c => c.value === formData.country)?.label}
                    </span>
                  </div>
                </div>
              )}

              {!formData.continent && !formData.country && (
                <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-900 dark:text-yellow-100">
                    💡 Add geographical tags to organize this media in the folder structure
                  </p>
                </div>
              )}
            </div>

            {/* Media Files Management */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Media Files ({images.length})</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('media-file-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Add Images
                    </>
                  )}
                </Button>
                <input
                  id="media-file-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {/* Current Images Display with Delete Option */}
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.map((image, index) => (
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
                      {/* Number Badge */}
                      <Badge
                        variant="secondary"
                        className="absolute -top-2 -right-2 text-xs w-6 h-6 flex items-center justify-center p-0 rounded-full"
                      >
                        {index + 1}
                      </Badge>
                      {/* Delete Button */}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 left-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteImage(index)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No images attached</p>
                  <p className="text-xs mt-1">Click "Add Images" to upload</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Add or remove images as needed. Changes will be saved when you click "Save Changes".
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