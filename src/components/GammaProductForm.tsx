/**
 * Gamma Spec Product Form
 * Full NIP-99 + Gamma Spec compliant product creation/editing
 * Kind 30402 (published) or 30403 (draft/inactive)
 */
import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useGammaShipping } from '@/hooks/useGammaShipping';
import { useToast } from '@/hooks/useToast';
import { buildProductTags, type ProductType, type ProductFormat, type ProductVisibility, type ProductSpec } from '@/lib/gammaSpec';
import { type GPSCoordinates } from '@/lib/exifUtils';
import * as geohash from 'ngeohash';
import {
  Package, DollarSign, MapPin, Plus, Trash2, Loader2, FileText,
  Truck, Eye, EyeOff, ShoppingBag, Globe2, Weight, Ruler, Settings, Tag
} from 'lucide-react';
import { CONTINENTS, getCountriesByContinent } from '@/lib/geoData';

const MEDIA_CATEGORIES = [
  'Animals', 'Buildings and Architecture', 'Business', 'Drinks',
  'The Environment', 'States of Mind', 'Food', 'Graphic Resources',
  'Hobbies and Leisure', 'Industry', 'Landscape', 'Lifestyle',
  'People', 'Plants and Flowers', 'Culture and Religion', 'Science',
  'Social Issues', 'Sports', 'Technology', 'Transport', 'Travel',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BTC', 'SATS'];

interface GammaProductFormData {
  dTag: string;
  title: string;
  summary: string;
  description: string;

  // Pricing
  price: string;
  currency: string;
  priceFrequency: string;

  // Product classification
  productType: ProductType;
  productFormat: ProductFormat;
  visibility: ProductVisibility;
  stock: string;

  // Categories
  category: string;
  keywords: string;

  // Location
  location: string;
  continent: string;
  country: string;

  // Physical (for physical products)
  weightValue: string;
  weightUnit: string;
  dimLWH: string;
  dimUnit: string;

  // Shipping
  selectedShipping: string[];

  // Images (filled by PhotoUpload)
  images: string[];

  // Specs
  specs: ProductSpec[];
}

const defaultForm = (existing?: Partial<GammaProductFormData>): GammaProductFormData => ({
  dTag: existing?.dTag || `product-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: existing?.title || '',
  summary: existing?.summary || '',
  description: existing?.description || '',
  price: existing?.price || '',
  currency: existing?.currency || 'USD',
  priceFrequency: existing?.priceFrequency || '',
  productType: existing?.productType || 'simple',
  productFormat: existing?.productFormat || 'digital',
  visibility: existing?.visibility || 'on-sale',
  stock: existing?.stock || '',
  category: existing?.category || '',
  keywords: existing?.keywords || '',
  location: existing?.location || '',
  continent: existing?.continent || '',
  country: existing?.country || '',
  weightValue: existing?.weightValue || '',
  weightUnit: existing?.weightUnit || 'kg',
  dimLWH: existing?.dimLWH || '',
  dimUnit: existing?.dimUnit || 'cm',
  selectedShipping: existing?.selectedShipping || [],
  images: existing?.images || [],
  specs: existing?.specs || [],
});

interface GammaProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  editData?: Partial<GammaProductFormData>;
  onSaved?: (dTag: string) => void;
}

export function GammaProductForm({ isOpen, onClose, editData, onSaved }: GammaProductFormProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const { data: shippingOptions } = useGammaShipping(user?.pubkey);

  const [form, setForm] = useState<GammaProductFormData>(() => defaultForm(editData));
  const [allPhotos, setAllPhotos] = useState<UploadedPhoto[]>([]);
  const [gps, setGps] = useState<GPSCoordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [specKey, setSpecKey] = useState('');
  const [specValue, setSpecValue] = useState('');

  const set = <K extends keyof GammaProductFormData>(field: K, value: GammaProductFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handlePhotosChange = useCallback((photos: UploadedPhoto[]) => {
    setAllPhotos(photos);
    const urls = photos.filter(p => p.uploaded && p.url).map(p => p.url!);
    set('images', urls);
    if (photos.length > 0 && photos[0].file) {
      const isVideo = photos[0].file.type.startsWith('video/');
      if (!form.productFormat) {
        set('productFormat', isVideo ? 'digital' : 'digital');
      }
    }
  }, [form.productFormat]);

  const handleGPSExtracted = useCallback((coords: GPSCoordinates) => {
    setGps(coords);
  }, []);

  const handleMetadataExtracted = useCallback((meta: { title?: string; description?: string; keywords?: string[] }) => {
    setForm(prev => ({
      ...prev,
      title: prev.title || meta.title || '',
      description: prev.description || meta.description || '',
      keywords: prev.keywords || (meta.keywords?.join(', ') ?? ''),
    }));
  }, []);

  const addSpec = () => {
    if (!specKey.trim()) return;
    set('specs', [...form.specs, { key: specKey.trim(), value: specValue.trim() }]);
    setSpecKey(''); setSpecValue('');
  };

  const removeSpec = (i: number) => set('specs', form.specs.filter((_, idx) => idx !== i));

  const toggleShipping = (ref: string) => {
    if (form.selectedShipping.includes(ref)) {
      set('selectedShipping', form.selectedShipping.filter(r => r !== ref));
    } else {
      set('selectedShipping', [...form.selectedShipping, ref]);
    }
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return 'Title is required';
    if (!form.price.trim()) return 'Price is required';
    if (!form.currency) return 'Currency is required';
    if (!form.productFormat) return 'Product format is required';
    if (form.images.length === 0) return 'At least one image is required';
    const hasUnuploaded = allPhotos.some(p => !p.uploaded);
    if (hasUnuploaded) return 'Please upload all photos first';
    return null;
  };

  const handleSubmit = async (draft: boolean = false) => {
    if (!user) return;
    const err = validate();
    if (err) { toast({ title: err, variant: 'destructive' }); return; }

    setIsSubmitting(true);
    setIsDraft(draft);
    try {
      const keywords = form.keywords.split(',').map(k => k.trim()).filter(Boolean);

      const tags = buildProductTags({
        dTag: form.dTag,
        title: form.title,
        summary: form.summary || undefined,
        price: form.price,
        currency: form.currency,
        priceFrequency: form.priceFrequency || undefined,
        productType: form.productType,
        productFormat: form.productFormat,
        visibility: draft ? 'hidden' : form.visibility,
        stock: form.stock ? parseInt(form.stock) : undefined,
        publishedAt: Math.floor(Date.now() / 1000),
        status: 'active',
        images: form.images.map((url, i) => ({ url, sortOrder: i })),
        specs: form.specs,
        weight: form.weightValue ? { value: form.weightValue, unit: form.weightUnit } : undefined,
        dimensions: form.dimLWH ? { lwh: form.dimLWH, unit: form.dimUnit } : undefined,
        location: form.location || undefined,
        geohash: gps ? geohash.encode(gps.latitude, gps.longitude, 8) : undefined,
        tags: [form.category ? form.category.toLowerCase().replace(/\s+/g, '-') : '', ...keywords].filter(Boolean),
        collections: [],
        shippingOptions: form.selectedShipping,
      });

      // Also add continent/country for Traveltelly geographic filtering
      if (form.continent) tags.push(['continent', form.continent]);
      if (form.country) tags.push(['country', form.country]);
      if (form.continent && form.country) tags.push(['geo_folder', `${form.continent}/${form.country}`]);

      const kind = draft ? 30403 : 30402;
      await publishEvent({ kind, content: form.description, tags });

      toast({ title: draft ? 'Draft saved ✓' : 'Product published ✓' });
      onSaved?.(form.dTag);
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to save product', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPhysical = form.productFormat === 'physical';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#ec1a58]" />
            {editData ? 'Edit Product Listing' : 'New Gamma Product Listing'}
            <Badge variant="outline" className="ml-auto text-xs">NIP-99 · Gamma Spec</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="media" className="w-full">
          <TabsList className="w-full grid grid-cols-5 text-xs">
            <TabsTrigger value="media">📸 Media</TabsTrigger>
            <TabsTrigger value="details">📋 Details</TabsTrigger>
            <TabsTrigger value="pricing">💰 Pricing</TabsTrigger>
            <TabsTrigger value="shipping">🚚 Shipping</TabsTrigger>
            <TabsTrigger value="specs">⚙️ Specs</TabsTrigger>
          </TabsList>

          {/* ── Tab: Media ─────────────────────────────────────────────────── */}
          <TabsContent value="media" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Upload Media Files</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  onPhotosChange={handlePhotosChange}
                  onGPSExtracted={handleGPSExtracted}
                  onMetadataExtracted={handleMetadataExtracted}
                  maxPhotos={10}
                  className="w-full"
                />
                {gps && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    GPS detected: {gps.latitude.toFixed(5)}, {gps.longitude.toFixed(5)}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab: Details ────────────────────────────────────────────────── */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Product title…" />
              </div>
              <div>
                <Label>Short Summary</Label>
                <Input value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="One-line description for cards" />
              </div>
              <div>
                <Label>Full Description (Markdown)</Label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Detailed product description…" rows={5} />
              </div>
              <div>
                <Label>Keywords</Label>
                <Input value={form.keywords} onChange={e => set('keywords', e.target.value)}
                  placeholder="sunrise, landscape, travel (comma-separated)" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                    <SelectContent>
                      {MEDIA_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Visibility</Label>
                  <Select value={form.visibility} onValueChange={v => set('visibility', v as ProductVisibility)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-sale"><Eye className="w-3 h-3 inline mr-1" />On Sale</SelectItem>
                      <SelectItem value="hidden"><EyeOff className="w-3 h-3 inline mr-1" />Hidden</SelectItem>
                      <SelectItem value="pre-order">🔖 Pre-Order</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Product Format *</Label>
                  <Select value={form.productFormat} onValueChange={v => set('productFormat', v as ProductFormat)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="digital">💾 Digital</SelectItem>
                      <SelectItem value="physical">📦 Physical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product Type</Label>
                  <Select value={form.productType} onValueChange={v => set('productType', v as ProductType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="variable">Variable (with options)</SelectItem>
                      <SelectItem value="variation">Variation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Stock */}
              <div>
                <Label>Stock Quantity <span className="text-muted-foreground text-xs">(leave blank for unlimited)</span></Label>
                <Input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="e.g. 100" />
              </div>

              <Separator />

              {/* Location */}
              <div>
                <Label className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Location</Label>
                <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bali, Indonesia" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Continent</Label>
                  <Select value={form.continent} onValueChange={v => { set('continent', v); set('country', ''); }}>
                    <SelectTrigger><SelectValue placeholder="Continent…" /></SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Country</Label>
                  <Select value={form.country} onValueChange={v => set('country', v)} disabled={!form.continent}>
                    <SelectTrigger><SelectValue placeholder="Country…" /></SelectTrigger>
                    <SelectContent>
                      {form.continent && getCountriesByContinent(form.continent).map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Tab: Pricing ────────────────────────────────────────────────── */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Label>Price *</Label>
                <Input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
              </div>
              <div>
                <Label>Currency *</Label>
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Recurring Frequency <span className="text-muted-foreground text-xs">(optional, for subscriptions)</span></Label>
              <Select value={form.priceFrequency} onValueChange={v => set('priceFrequency', v)}>
                <SelectTrigger><SelectValue placeholder="One-time (no frequency)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">One-time payment</SelectItem>
                  <SelectItem value="D">Daily</SelectItem>
                  <SelectItem value="W">Weekly</SelectItem>
                  <SelectItem value="M">Monthly</SelectItem>
                  <SelectItem value="Y">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price preview */}
            {form.price && (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 p-3">
                <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                  {form.currency === 'BTC' || form.currency === 'SATS'
                    ? `${parseFloat(form.price).toLocaleString()} ${form.currency}`
                    : new Intl.NumberFormat('en-US', { style: 'currency', currency: form.currency }).format(parseFloat(form.price) || 0)
                  }
                  {form.priceFrequency && ` / ${form.priceFrequency}`}
                </p>
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Shipping ───────────────────────────────────────────────── */}
          <TabsContent value="shipping" className="space-y-4 mt-4">
            {form.productFormat === 'digital' ? (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 p-4 text-center">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  ✅ Digital products don't require shipping options.
                </p>
              </div>
            ) : !shippingOptions?.length ? (
              <div className="rounded-lg border border-dashed p-6 text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground mb-2">No shipping options configured yet.</p>
                <p className="text-xs text-muted-foreground">
                  Go to <strong>Marketplace → Settings → Shipping</strong> to add shipping options.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Available Shipping Options</Label>
                {shippingOptions.map(opt => {
                  const ref = `30406:${opt.pubkey}:${opt.dTag}`;
                  const selected = form.selectedShipping.includes(ref);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleShipping(ref)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                        selected ? 'border-[#ec1a58] bg-pink-50 dark:bg-pink-900/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Truck className={`w-4 h-4 flex-shrink-0 ${selected ? 'text-[#ec1a58]' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{opt.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.basePrice === '0' ? 'Free' : `${opt.basePrice} ${opt.currency}`}
                          {opt.durationMin && ` · ${opt.durationMin}–${opt.durationMax}${opt.durationUnit}`}
                          {opt.countries.length > 0 && ` · ${opt.countries.slice(0, 3).join(', ')}`}
                        </p>
                      </div>
                      {selected && <Badge className="bg-[#ec1a58] text-white text-xs">✓ Selected</Badge>}
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Specs ──────────────────────────────────────────────────── */}
          <TabsContent value="specs" className="space-y-4 mt-4">
            {/* Physical dimensions */}
            {isPhysical && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Weight className="w-4 h-4" />Physical Dimensions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Weight</Label>
                      <Input type="number" min="0" value={form.weightValue} onChange={e => set('weightValue', e.target.value)} placeholder="e.g. 0.5" />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Select value={form.weightUnit} onValueChange={v => set('weightUnit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Label className="text-xs">Dimensions (L×W×H)</Label>
                      <Input value={form.dimLWH} onChange={e => set('dimLWH', e.target.value)} placeholder="e.g. 20x15x5" />
                    </div>
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <Select value={form.dimUnit} onValueChange={v => set('dimUnit', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mm">mm</SelectItem>
                          <SelectItem value="cm">cm</SelectItem>
                          <SelectItem value="m">m</SelectItem>
                          <SelectItem value="in">in</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Specs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />Custom Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input value={specKey} onChange={e => setSpecKey(e.target.value)} placeholder="Key (e.g. resolution)" className="flex-1" />
                  <Input value={specValue} onChange={e => setSpecValue(e.target.value)} placeholder="Value (e.g. 4K)" className="flex-1" />
                  <Button type="button" size="sm" variant="outline" onClick={addSpec} disabled={!specKey.trim()}>
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {form.specs.length > 0 ? (
                  <div className="space-y-1.5">
                    {form.specs.map((spec, i) => (
                      <div key={i} className="flex items-center justify-between rounded bg-muted/50 px-2.5 py-1.5 text-sm">
                        <span><span className="font-medium">{spec.key}:</span> {spec.value}</span>
                        <button type="button" onClick={() => removeSpec(i)} className="text-muted-foreground hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">No specs added yet</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
          <Button variant="outline" onClick={() => handleSubmit(true)} className="flex-1" disabled={isSubmitting}>
            {isSubmitting && isDraft ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} className="flex-1 text-white" style={{ backgroundColor: '#ec1a58' }} disabled={isSubmitting}>
            {isSubmitting && !isDraft ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Publishing…</> : <>Publish Listing</>}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
