import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { type GPSCoordinates, extractPhotoMetadata } from '@/lib/exifUtils';
import * as geohash from 'ngeohash';
import { Plus, Loader2, Package, DollarSign, MapPin } from 'lucide-react';

interface CreateProductDialogProps {
  children: React.ReactNode;
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  currency: string;
  mediaType: string;
  category: string;
  location: string;
  keywords: string;
  images: string[];
  isFree: boolean;
}

const MEDIA_TYPES = [
  'photos',
  'videos',
];

const CATEGORIES = [
  'Animals',
  'Buildings and Architecture',
  'Business',
  'Drinks',
  'The Environment',
  'States of Mind (emotions, inner voice)',
  'Food',
  'Graphic Resources (backgrounds, textures, symbols)',
  'Hobbies and Leisure',
  'Industry',
  'Landscape',
  'Lifestyle',
  'People',
  'Plants and Flowers',
  'Culture and Religion',
  'Science',
  'Social Issues',
  'Sports',
  'Technology',
  'Transport',
  'Travel',
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', type: 'fiat' },
  { code: 'EUR', name: 'Euro', type: 'fiat' },
  { code: 'GBP', name: 'British Pound', type: 'fiat' },
  { code: 'CAD', name: 'Canadian Dollar', type: 'fiat' },
  { code: 'AUD', name: 'Australian Dollar', type: 'fiat' },
  { code: 'BTC', name: 'Bitcoin', type: 'crypto' },
  { code: 'SATS', name: 'Satoshis', type: 'crypto' },
];

export function CreateProductDialog({ children }: CreateProductDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);
  const [allPhotos, setAllPhotos] = useState<UploadedPhoto[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: '',
    currency: 'USD',
    mediaType: '',
    category: '',
    location: '',
    keywords: '',
    images: [],
    isFree: false,
  });

  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();

  const handleInputChange = (field: keyof ProductFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotosChange = (photos: UploadedPhoto[]) => {
    // Store all photos (uploaded or not)
    setAllPhotos(photos);
    // Update images with uploaded ones
    const imageUrls = photos.filter(photo => photo.uploaded && photo.url).map(photo => photo.url!);
    setFormData(prev => ({ ...prev, images: imageUrls }));
    
    // Auto-detect media type based on first file type
    if (photos.length > 0 && photos[0].file) {
      const isVideo = photos[0].file.type.startsWith('video/');
      setFormData(prev => ({
        ...prev,
        mediaType: prev.mediaType || (isVideo ? 'videos' : 'photos'),
      }));
    }
  };

  const handleMetadataExtracted = useCallback((metadata: PhotoMetadata) => {
    console.log('📸 Metadata extracted callback:', metadata);
    
    // Auto-fill form fields if empty
    setFormData(prev => ({
      ...prev,
      title: prev.title || metadata.title || '',
      description: prev.description || metadata.description || '',
      keywords: prev.keywords || (metadata.keywords?.join(', ') || ''),
    }));
    
    // Set GPS coordinates
    if (metadata.gps) {
      setGpsCoordinates(metadata.gps);
    }

    toast({
      title: 'Metadata extracted!',
      description: 'Title, description, and keywords have been auto-filled from your photo.',
    });
  }, [toast]);

  const handleGPSExtracted = useCallback((coordinates: GPSCoordinates) => {
    setGpsCoordinates(coordinates);
    console.log('📍 GPS coordinates extracted from photo:', coordinates);
  }, []);

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (!formData.price.trim()) return 'Price is required';
    if (!formData.currency) return 'Currency is required';
    if (!formData.mediaType) return 'Media Type is required';
    if (!formData.category) return 'Category is required';

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) return 'Price must be a valid positive number';

    // Check if photos are selected but not uploaded
    const hasUnuploadedPhotos = allPhotos.some(photo => !photo.uploaded);
    if (hasUnuploadedPhotos) return 'Please upload all photos before publishing (click "Upload All Photos" button)';

    // Check if at least one photo is uploaded
    if (formData.images.length === 0) return 'At least one photo is required';

    return null;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Not logged in',
        description: 'Please log in to create products.',
        variant: 'destructive',
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: 'Validation Error',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate unique product ID
      const productId = `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Build tags for NIP-99 classified listing
      const tags: string[][] = [
        ['d', productId], // Required identifier
        ['title', formData.title],
        ['summary', formData.description.slice(0, 200)], // Short summary
        ['price', formData.price, formData.currency],
        ['t', formData.mediaType], // Media type tag for filtering (photos, videos, etc.)
        ['category', formData.category], // Content category tag (Animals, Business, etc.)
        ['status', 'active'],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
      ];

      // Add location if provided
      if (formData.location.trim()) {
        tags.push(['location', formData.location.trim()]);
      }

      // Add keywords as tags if provided
      if (formData.keywords.trim()) {
        const keywordList = formData.keywords
          .split(',')
          .map(k => k.trim())
          .filter(Boolean);
        
        keywordList.forEach(keyword => {
          tags.push(['t', keyword.toLowerCase()]);
        });
        
        console.log('🏷️ Adding keywords as tags:', keywordList);
      }

      // Add geohash if GPS coordinates are available
      if (gpsCoordinates) {
        const hash = geohash.encode(gpsCoordinates.latitude, gpsCoordinates.longitude, 8);
        tags.push(['g', hash]);
        console.log('📍 Adding geohash to stock media:', hash, gpsCoordinates);
      }

      // Add image tags
      formData.images.forEach(imageUrl => {
        tags.push(['image', imageUrl]);
      });

      // Add free tag if marked as free
      if (formData.isFree) {
        tags.push(['free', 'true']);
      }

      // Create NIP-99 classified listing event
      await publishEvent({
        kind: 30402, // NIP-99 classified listing
        content: formData.description,
        tags,
      });

      toast({
        title: 'Media Uploaded! 🎉',
        description: 'Your stock media has been published to the marketplace.',
      });

      // Reset form and close dialog
      setFormData({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        mediaType: '',
        isFree: false,
        category: '',
        location: '',
        keywords: '',
        images: [],
      });
      setGpsCoordinates(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: 'Failed to Upload Media',
        description: 'Could not publish your stock media. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCurrency = CURRENCIES.find(c => c.code === formData.currency);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Upload Stock Media
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images - Moved to top for metadata extraction */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Media Files</CardTitle>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                onPhotosChange={handlePhotosChange}
                onGPSExtracted={handleGPSExtracted}
                onMetadataExtracted={handleMetadataExtracted}
                maxPhotos={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Upload your media files first. Title, description, and keywords will be auto-filled from photo metadata.
                {gpsCoordinates && (
                  <span className="block mt-1 text-green-600 font-medium">
                    ✅ GPS location detected: {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
                  </span>
                )}
                {formData.title && (
                  <span className="block mt-1 text-blue-600 font-medium">
                    ✅ Metadata extracted from photo
                  </span>
                )}
              </p>
              
              {/* Manual GPS Input - Show if no GPS detected */}
              {!gpsCoordinates && allPhotos.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium mb-3 text-yellow-900 dark:text-yellow-100">
                    No GPS data found. Add location manually (optional):
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="manual-lat" className="text-xs">Latitude</Label>
                      <Input
                        id="manual-lat"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 13.736717"
                        value={gpsCoordinates?.latitude || ''}
                        onChange={(e) => {
                          const lat = parseFloat(e.target.value);
                          if (!isNaN(lat) && lat >= -90 && lat <= 90) {
                            setGpsCoordinates(prev => ({ 
                              latitude: lat, 
                              longitude: prev?.longitude || 0 
                            }));
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="manual-lng" className="text-xs">Longitude</Label>
                      <Input
                        id="manual-lng"
                        type="number"
                        step="0.000001"
                        placeholder="e.g., 100.523186"
                        value={gpsCoordinates?.longitude || ''}
                        onChange={(e) => {
                          const lng = parseFloat(e.target.value);
                          if (!isNaN(lng) && lng >= -180 && lng <= 180) {
                            setGpsCoordinates(prev => ({ 
                              latitude: prev?.latitude || 0, 
                              longitude: lng 
                            }));
                          }
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Or find coordinates on Google Maps and paste them here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-4 h-4" />
                Media Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Media Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Sunset Over Mountains, Corporate Team Meeting"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your media asset: subject, style, usage rights, technical details..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., sunset, landscape, nature, travel"
                  value={formData.keywords}
                  onChange={(e) => handleInputChange('keywords', e.target.value)}
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated keywords for better discoverability
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type *</Label>
                  <Select value={formData.mediaType} onValueChange={(value) => handleInputChange('mediaType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                    <SelectContent>
                      {MEDIA_TYPES.map((mediaType) => (
                        <SelectItem key={mediaType} value={mediaType}>
                          <span className="capitalize">{mediaType}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Shot Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Paris, France or Studio"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  maxLength={100}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <span>{currency.code}</span>
                            <Badge variant={currency.type === 'crypto' ? 'default' : 'secondary'} className="text-xs">
                              {currency.type === 'crypto' ? '⚡' : '💳'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedCurrency && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Payment Method:</strong> {selectedCurrency.type === 'crypto' ? 'Lightning Network' : 'Stripe (Cards/Bank)'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Buyers will be able to pay using {selectedCurrency.type === 'crypto' ? 'Bitcoin Lightning' : 'credit cards, debit cards, and bank transfers'}.
                  </p>
                </div>
              )}

              {/* Admin-only: Mark as Free */}
              {isAdmin && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Checkbox
                    id="isFree"
                    checked={formData.isFree}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFree: checked === true }))}
                  />
                  <div className="flex-1">
                    <Label htmlFor="isFree" className="text-sm font-medium cursor-pointer text-green-900 dark:text-green-100">
                      🎁 Offer as Free Download
                    </Label>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      This item will be available for free download. Price is for display only.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.title && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-lg">{formData.title}</h3>
                  {formData.price && formData.currency && (
                    <div className="text-xl font-bold text-green-600">
                      {formData.currency === 'BTC' || formData.currency === 'SATS'
                        ? `${parseFloat(formData.price).toLocaleString()} ${formData.currency}`
                        : new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: formData.currency,
                          }).format(parseFloat(formData.price) || 0)
                      }
                    </div>
                  )}
                  {formData.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {formData.description}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {formData.isFree && (
                      <Badge className="bg-green-600 hover:bg-green-700 text-white">
                        🎁 FREE
                      </Badge>
                    )}
                    {formData.mediaType && (
                      <Badge variant="secondary" className="capitalize">
                        📁 {formData.mediaType}
                      </Badge>
                    )}
                    {formData.category && (
                      <Badge variant="outline">
                        🏷️ {formData.category}
                      </Badge>
                    )}
                    {formData.location && (
                      <Badge variant="outline" className="text-xs">
                        <MapPin className="w-3 h-3 mr-1" />
                        {formData.location}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !formData.title || !formData.description || !formData.price || !formData.mediaType || !formData.category}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Media
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p>📝 <strong>Listing:</strong> Your media will be published as a NIP-99 classified listing on Nostr.</p>
            <p>💰 <strong>Payments:</strong> Buyers can pay via Lightning (for BTC/SATS) or Stripe (for fiat currencies).</p>
            <p>📁 <strong>Delivery:</strong> Digital files are delivered instantly after payment via encrypted messages.</p>
            <p>🔄 <strong>Updates:</strong> You can edit or remove your media listing anytime from your portfolio.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}