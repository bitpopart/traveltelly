/**
 * Gamma Spec Shipping Manager
 * Create, edit, and manage shipping options (Kind 30406)
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGammaShipping } from '@/hooks/useGammaShipping';
import { useToast } from '@/hooks/useToast';
import { buildShippingOptionTags, type GammaShippingOption, type ShippingService } from '@/lib/gammaSpec';
import { Truck, Plus, Edit3, Trash2, Loader2, Package, MapPin, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

const ISO_COUNTRIES = [
  { code: 'NL', name: 'Netherlands' }, { code: 'US', name: 'United States' }, { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' }, { code: 'FR', name: 'France' }, { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' }, { code: 'CA', name: 'Canada' }, { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' }, { code: 'TH', name: 'Thailand' }, { code: 'ID', name: 'Indonesia' },
  { code: 'SG', name: 'Singapore' }, { code: 'MY', name: 'Malaysia' }, { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' }, { code: 'MX', name: 'Mexico' }, { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' }, { code: 'EG', name: 'Egypt' }, { code: 'AE', name: 'UAE' },
  { code: 'TR', name: 'Turkey' }, { code: 'PL', name: 'Poland' }, { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' }, { code: 'DK', name: 'Denmark' }, { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' }, { code: 'BE', name: 'Belgium' }, { code: 'PT', name: 'Portugal' },
];

const SERVICE_LABELS: Record<ShippingService, { label: string; icon: string }> = {
  standard: { label: 'Standard', icon: '📦' },
  express: { label: 'Express', icon: '🚀' },
  overnight: { label: 'Overnight', icon: '⚡' },
  pickup: { label: 'Local Pickup', icon: '🏪' },
};

interface ShippingFormData {
  dTag: string;
  title: string;
  description: string;
  basePrice: string;
  currency: string;
  service: ShippingService;
  countries: string[];
  carrier: string;
  durationMin: string;
  durationMax: string;
  durationUnit: 'H' | 'D' | 'W';
  location: string;
  weightMax: string;
  weightUnit: string;
  pricePerWeight: string;
}

const defaultForm = (): ShippingFormData => ({
  dTag: `shipping-${Date.now()}`,
  title: '',
  description: '',
  basePrice: '0',
  currency: 'USD',
  service: 'standard',
  countries: [],
  carrier: '',
  durationMin: '',
  durationMax: '',
  durationUnit: 'D',
  location: '',
  weightMax: '',
  weightUnit: 'kg',
  pricePerWeight: '',
});

function ShippingOptionCard({ option, onEdit, onDelete }: { option: GammaShippingOption; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const svcInfo = SERVICE_LABELS[option.service] || { label: option.service, icon: '📦' };

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-base">{svcInfo.icon}</span>
              <h3 className="font-semibold text-sm">{option.title}</h3>
              <Badge variant="secondary" className="text-xs capitalize">{svcInfo.label}</Badge>
              {option.basePrice === '0' ? (
                <Badge className="text-xs bg-green-500 text-white">Free</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">{option.basePrice} {option.currency}</Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {option.countries.length > 0 && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {option.countries.slice(0, 3).join(', ')}{option.countries.length > 3 ? ` +${option.countries.length - 3}` : ''}
                </span>
              )}
              {option.durationMin && option.durationMax && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {option.durationMin}–{option.durationMax}{option.durationUnit}
                </span>
              )}
              {option.carrier && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3" />
                  {option.carrier}
                </span>
              )}
            </div>
            {option.description && expanded && (
              <p className="mt-2 text-xs text-muted-foreground">{option.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setExpanded(v => !v)} className="h-7 w-7 p-0">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>
            <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 w-7 p-0">
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} className="h-7 w-7 p-0 text-red-500 hover:text-red-700">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ShippingFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editOption?: GammaShippingOption;
  onSaved?: () => void;
}

function ShippingFormDialog({ isOpen, onClose, editOption, onSaved }: ShippingFormDialogProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ShippingFormData>(() => {
    if (editOption) {
      return {
        dTag: editOption.dTag,
        title: editOption.title,
        description: editOption.description || '',
        basePrice: editOption.basePrice,
        currency: editOption.currency,
        service: editOption.service,
        countries: editOption.countries,
        carrier: editOption.carrier || '',
        durationMin: editOption.durationMin || '',
        durationMax: editOption.durationMax || '',
        durationUnit: editOption.durationUnit || 'D',
        location: editOption.location || '',
        weightMax: editOption.weightMax?.value || '',
        weightUnit: editOption.weightMax?.unit || 'kg',
        pricePerWeight: editOption.pricePerWeight?.price || '',
      };
    }
    return defaultForm();
  });
  const [countryInput, setCountryInput] = useState('');

  const set = (field: keyof ShippingFormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const addCountry = (code: string) => {
    if (code && !form.countries.includes(code)) {
      set('countries', [...form.countries, code]);
    }
    setCountryInput('');
  };

  const removeCountry = (code: string) =>
    set('countries', form.countries.filter(c => c !== code));

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (form.countries.length === 0) { toast({ title: 'Select at least one country', variant: 'destructive' }); return; }

    setIsSubmitting(true);
    try {
      const tags = buildShippingOptionTags({
        dTag: form.dTag,
        title: form.title,
        basePrice: form.basePrice,
        currency: form.currency,
        service: form.service,
        countries: form.countries,
        carrier: form.carrier || undefined,
        durationMin: form.durationMin || undefined,
        durationMax: form.durationMax || undefined,
        durationUnit: form.durationMin ? form.durationUnit : undefined,
        location: form.location || undefined,
        weightMax: form.weightMax ? { value: form.weightMax, unit: form.weightUnit } : undefined,
        pricePerWeight: form.pricePerWeight ? { price: form.pricePerWeight, unit: form.weightUnit } : undefined,
      });

      await publishEvent({ kind: 30406, content: form.description, tags });

      toast({ title: editOption ? 'Shipping option updated ✓' : 'Shipping option created ✓' });
      onSaved?.();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to save', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            {editOption ? 'Edit Shipping Option' : 'New Shipping Option'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Standard Shipping Netherlands" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional details…" rows={2} />
            </div>
          </div>

          <Separator />

          {/* Service & Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Service Type *</Label>
              <Select value={form.service} onValueChange={v => set('service', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SERVICE_LABELS).map(([val, info]) => (
                    <SelectItem key={val} value={val}>{info.icon} {info.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Carrier</Label>
              <Input value={form.carrier} onChange={e => set('carrier', e.target.value)} placeholder="PostNL, DHL…" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label>Base Price *</Label>
              <div className="flex gap-2">
                <Input type="number" min="0" step="0.01" value={form.basePrice} onChange={e => set('basePrice', e.target.value)} placeholder="0" />
                <Select value={form.currency} onValueChange={v => set('currency', v)}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="SATS">SATS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Free shipping?</Label>
              <Button type="button" variant={form.basePrice === '0' ? 'default' : 'outline'} size="sm" className="w-full mt-1"
                onClick={() => set('basePrice', form.basePrice === '0' ? '' : '0')}>
                {form.basePrice === '0' ? '✓ Free' : 'Set Free'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Delivery Window */}
          <div>
            <Label>Delivery Window</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <Input type="number" min="0" value={form.durationMin} onChange={e => set('durationMin', e.target.value)} placeholder="Min" />
              <Input type="number" min="0" value={form.durationMax} onChange={e => set('durationMax', e.target.value)} placeholder="Max" />
              <Select value={form.durationUnit} onValueChange={v => set('durationUnit', v as 'H' | 'D' | 'W')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="H">Hours</SelectItem>
                  <SelectItem value="D">Days</SelectItem>
                  <SelectItem value="W">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Pickup location */}
          {form.service === 'pickup' && (
            <div>
              <Label>Pickup Address *</Label>
              <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="123 Main St, Amsterdam, NL" />
            </div>
          )}

          <Separator />

          {/* Countries */}
          <div>
            <Label>Countries *</Label>
            <div className="flex gap-2 mt-1">
              <Select value={countryInput} onValueChange={code => addCountry(code)}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Add country…" /></SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {ISO_COUNTRIES.map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.code} – {c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {form.countries.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.countries.map(code => (
                  <Badge key={code} variant="secondary" className="cursor-pointer gap-1 pr-1" onClick={() => removeCountry(code)}>
                    {code}
                    <span className="text-muted-foreground hover:text-foreground">×</span>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Weight & Pricing */}
          <div>
            <Label>Weight Constraints & Pricing</Label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <div>
                <Label className="text-xs text-muted-foreground">Max Weight</Label>
                <Input type="number" min="0" value={form.weightMax} onChange={e => set('weightMax', e.target.value)} placeholder="e.g. 30" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Unit</Label>
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
              <div>
                <Label className="text-xs text-muted-foreground">Price/kg</Label>
                <Input type="number" min="0" step="0.01" value={form.pricePerWeight} onChange={e => set('pricePerWeight', e.target.value)} placeholder="0.00" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : editOption ? 'Update Option' : 'Create Option'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface GammaShippingManagerProps {
  className?: string;
}

export function GammaShippingManager({ className }: GammaShippingManagerProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const { data: shippingOptions, isLoading, refetch } = useGammaShipping(user?.pubkey);
  const [showForm, setShowForm] = useState(false);
  const [editOption, setEditOption] = useState<GammaShippingOption | undefined>();

  const handleEdit = (opt: GammaShippingOption) => {
    setEditOption(opt);
    setShowForm(true);
  };

  const handleDelete = async (opt: GammaShippingOption) => {
    if (!confirm(`Delete "${opt.title}"?`)) return;
    try {
      await publishEvent({
        kind: 30406,
        content: '',
        tags: [
          ['d', opt.dTag],
          ['title', opt.title],
          ['price', '0', 'USD'],
          ['country', 'US'],
          ['service', opt.service],
          ['status', 'deleted'],
        ],
      });
      toast({ title: 'Shipping option deleted' });
      refetch();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditOption(undefined);
  };

  if (!user) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">Shipping Options</h3>
          {shippingOptions && shippingOptions.length > 0 && (
            <Badge variant="secondary">{shippingOptions.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => { setEditOption(undefined); setShowForm(true); }} className="gap-1">
          <Plus className="w-3.5 h-3.5" />
          New Option
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !shippingOptions?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No shipping options yet</p>
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create First Option
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {shippingOptions.map(opt => (
            <ShippingOptionCard
              key={opt.id}
              option={opt}
              onEdit={() => handleEdit(opt)}
              onDelete={() => handleDelete(opt)}
            />
          ))}
        </div>
      )}

      <ShippingFormDialog
        isOpen={showForm}
        onClose={handleClose}
        editOption={editOption}
        onSaved={() => { refetch(); handleClose(); }}
      />
    </div>
  );
}
