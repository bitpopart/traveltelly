import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useMediaStatistics, useAllMediaAssets, useEditMediaAsset } from '@/hooks/useMediaManagement';
import { useMarketplaceBins, useSaveMarketplaceBins } from '@/hooks/useMarketplaceBins';
import type { MarketplaceBin } from '@/hooks/useMarketplaceBins';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { MediaManagement } from '@/components/MediaManagement';
import { nip19 } from 'nostr-tools';
import {
  Shield, ArrowLeft, Loader2, Camera, Store, Layers, LayoutGrid,
  ExternalLink, CheckCircle, XCircle, Calendar, Plus, Trash2, Edit2,
  Save, Eye, EyeOff, GripVertical, FolderOpen, Tag, Globe, Star,
  ChevronUp, ChevronDown, Search, Filter, CheckCircle2, CircleDot,
  ImageOff, X, Info, ChevronRight,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

const CONTENT_CATEGORIES = [
  'Animals', 'Buildings and Architecture', 'Business', 'Drinks',
  'The Environment', 'States of Mind (emotions, inner voice)', 'Food',
  'Graphic Resources (backgrounds, textures, symbols)', 'Hobbies and Leisure',
  'Industry', 'Landscape', 'Lifestyle', 'People', 'Plants and Flowers',
  'Culture and Religion', 'Science', 'Social Issues', 'Sports', 'Technology',
  'Transport', 'Travel',
];

const CONTINENTS_LIST = [
  { value: 'Africa', label: 'Africa' },
  { value: 'Asia', label: 'Asia' },
  { value: 'Europe', label: 'Europe' },
  { value: 'North America', label: 'North America' },
  { value: 'South America', label: 'South America' },
  { value: 'Oceania', label: 'Oceania' },
  { value: 'Antarctica', label: 'Antarctica' },
];

const EMOJIS = ['📸', '🎥', '🌍', '🏔️', '🐘', '🏛️', '🌿', '🏙️', '✈️', '🌊', '🦁', '🌸', '🎨', '🍕', '⛵', '🧊', '🌅', '🦋', '🏜️', '🌺', '🗺️', '🏞️', '🎭', '🤿', '🛕'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface BinFormData {
  title: string;
  description: string;
  emoji: string;
  coverImage: string;
  filterType: MarketplaceBin['filterType'];
  filterValue: string;
  isVisible: boolean;
}

const emptyBinForm = (): BinFormData => ({
  title: '',
  description: '',
  emoji: '📸',
  coverImage: '',
  filterType: 'category',
  filterValue: '',
  isVisible: true,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function filterTypeIcon(ft: MarketplaceBin['filterType']) {
  switch (ft) {
    case 'category': return <Tag className="w-3.5 h-3.5" />;
    case 'tag': return <Tag className="w-3.5 h-3.5" />;
    case 'geo': return <Globe className="w-3.5 h-3.5" />;
    case 'featured': return <Star className="w-3.5 h-3.5" />;
  }
}

function filterTypeLabel(ft: MarketplaceBin['filterType']) {
  switch (ft) {
    case 'category': return 'Category';
    case 'tag': return 'Tag';
    case 'geo': return 'Geography';
    case 'featured': return 'Featured';
  }
}

function productMatchesBin(product: MarketplaceProduct, bin: MarketplaceBin): boolean {
  switch (bin.filterType) {
    case 'category':
      return product.contentCategory === bin.filterValue || product.category === bin.filterValue;
    case 'tag': {
      const tTags = product.event.tags.filter(([n]) => n === 't').map(([, v]) => v);
      return tTags.includes(bin.filterValue.trim());
    }
    case 'geo':
      return product.continent === bin.filterValue || product.country === bin.filterValue;
    case 'featured': {
      const ids = bin.filterValue.split(',').map((s) => s.trim()).filter(Boolean);
      return ids.includes(product.id);
    }
    default: return false;
  }
}

function buildAssignUpdates(bin: MarketplaceBin, product: MarketplaceProduct): Partial<MarketplaceProduct> | null {
  switch (bin.filterType) {
    case 'category': return { contentCategory: bin.filterValue };
    case 'geo': {
      const parts = bin.filterValue.split('/');
      if (parts.length === 2) return { continent: parts[0], country: parts[1] };
      return { continent: bin.filterValue };
    }
    default: return null;
  }
}

// ── BinEditDialog ─────────────────────────────────────────────────────────────

function BinEditDialog({ open, initialData, onSave, onClose }: {
  open: boolean; initialData: BinFormData;
  onSave: (data: BinFormData) => void; onClose: () => void;
}) {
  const [form, setForm] = useState<BinFormData>(initialData);
  useEffect(() => { setForm(initialData); }, [initialData, open]);
  const set = (patch: Partial<BinFormData>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-pink-500" />
            {initialData.title ? 'Edit Collection' : 'New Collection'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block">Emoji</Label>
            <div className="flex flex-wrap gap-1.5">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => set({ emoji: e })}
                  className={`text-xl p-1.5 rounded-lg border-2 transition-all ${form.emoji === e ? 'border-pink-500 bg-pink-50' : 'border-transparent hover:border-gray-300'}`}>
                  {e}
                </button>
              ))}
              <Input className="w-16 text-center text-lg" value={form.emoji} onChange={(e) => set({ emoji: e.target.value })} maxLength={4} />
            </div>
          </div>
          <div>
            <Label htmlFor="bin-title">Title <span className="text-red-500">*</span></Label>
            <Input id="bin-title" placeholder="e.g. Wildlife & Animals" value={form.title} onChange={(e) => set({ title: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bin-desc">Short description</Label>
            <Textarea id="bin-desc" placeholder="What kind of photos are in this collection?" value={form.description} onChange={(e) => set({ description: e.target.value })} rows={2} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="bin-cover">Cover image URL (optional)</Label>
            <Input id="bin-cover" placeholder="https://..." value={form.coverImage} onChange={(e) => set({ coverImage: e.target.value })} className="mt-1" />
            {form.coverImage && (
              <div className="mt-2 w-full h-24 rounded-lg overflow-hidden border">
                <img src={form.coverImage} alt="cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <Label>Filter type <span className="text-red-500">*</span></Label>
            <p className="text-xs text-muted-foreground mb-1">How should the marketplace pick photos for this collection?</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['category', 'tag', 'geo', 'featured'] as const).map((ft) => (
                <button key={ft} type="button" onClick={() => set({ filterType: ft, filterValue: '' })}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${form.filterType === ft ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 hover:border-gray-400 text-gray-600'}`}>
                  {filterTypeIcon(ft)} {filterTypeLabel(ft)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Filter value <span className="text-red-500">*</span></Label>
            <div className="mt-1">
              <FilterValueInput filterType={form.filterType} value={form.filterValue} onChange={(v) => set({ filterValue: v })} />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Visible on marketplace</p>
              <p className="text-xs text-muted-foreground">Toggle off to hide from public view</p>
            </div>
            <Switch checked={form.isVisible} onCheckedChange={(checked) => set({ isVisible: checked })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} disabled={!form.title.trim() || !form.filterValue.trim()}
            style={{ backgroundColor: '#ec1a58' }} className="text-white hover:opacity-90">
            <Save className="w-4 h-4 mr-2" />Save Collection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── FilterValueInput ──────────────────────────────────────────────────────────

function FilterValueInput({ filterType, value, onChange }: {
  filterType: MarketplaceBin['filterType'];
  value: string;
  onChange: (v: string) => void;
}) {
  if (filterType === 'category') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select category..." /></SelectTrigger>
        <SelectContent>
          {CONTENT_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (filterType === 'geo') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Select continent..." /></SelectTrigger>
        <SelectContent>
          {CONTINENTS_LIST.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (filterType === 'tag') {
    return (
      <Input placeholder="e.g. wildlife, cityscape" value={value} onChange={(e) => onChange(e.target.value)} />
    );
  }
  return (
    <Textarea placeholder="Comma-separated product IDs" value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
  );
}

// ── BinCard ───────────────────────────────────────────────────────────────────

function BinCard({ bin, index, total, onEdit, onDelete, onToggleVisibility, onMoveUp, onMoveDown }: {
  bin: MarketplaceBin; index: number; total: number;
  onEdit: () => void; onDelete: () => void;
  onToggleVisibility: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  return (
    <Card className={`border-2 transition-all ${bin.isVisible ? 'border-transparent' : 'border-dashed border-gray-300 opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button onClick={onMoveUp} disabled={index === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
              <ChevronUp className="w-4 h-4" />
            </button>
            <GripVertical className="w-4 h-4 text-gray-300" />
            <button onClick={onMoveDown} disabled={index === total - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-2xl">
            {bin.coverImage ? <img src={bin.coverImage} alt={bin.title} className="w-full h-full object-cover" /> : <span>{bin.emoji}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900">{bin.emoji} {bin.title}</span>
              <Badge variant="outline" className="text-xs gap-1 flex items-center">
                {filterTypeIcon(bin.filterType)} {filterTypeLabel(bin.filterType)}: <span className="font-medium ml-0.5">{bin.filterValue || '—'}</span>
              </Badge>
              {!bin.isVisible && <Badge variant="secondary" className="text-xs">Hidden</Badge>}
            </div>
            {bin.description && <p className="text-sm text-muted-foreground mt-1 truncate">{bin.description}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button onClick={onToggleVisibility} className="text-gray-400 hover:text-gray-700 p-1 rounded">
              {bin.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button onClick={onEdit} className="text-blue-500 hover:text-blue-700 p-1 rounded">
              <Edit2 className="w-4 h-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="text-red-400 hover:text-red-600 p-1 rounded"><Trash2 className="w-4 h-4" /></button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete bin?</AlertDialogTitle>
                  <AlertDialogDescription>Remove <strong>{bin.title}</strong> bin. Media assets are not affected.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── MediaThumbnail ─────────────────────────────────────────────────────────────

function MediaThumbnail({ product, isInBin, isSelected, onClick }: {
  product: MarketplaceProduct; isInBin: boolean; isSelected: boolean; onClick: () => void;
}) {
  const thumb = product.images[0];
  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none group ${
              isSelected ? 'border-pink-500 ring-2 ring-pink-300 ring-offset-1'
                : isInBin ? 'border-emerald-400' : 'border-transparent hover:border-gray-300'
            }`}>
            {thumb ? (
              <img src={thumb} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <ImageOff className="w-5 h-5 text-gray-400" />
              </div>
            )}
            {isInBin && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow" />
              </div>
            )}
            {isSelected && (
              <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center">
                <CircleDot className="w-5 h-5 text-pink-600 drop-shadow" />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-1">
              <p className="text-white text-xs truncate">{product.title}</p>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48">
          <p className="font-medium text-xs">{product.title}</p>
          <p className="text-xs text-muted-foreground">{product.category}</p>
          {isInBin && <p className="text-xs text-emerald-600 mt-0.5">In this collection</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── MarketplaceEditorTab ───────────────────────────────────────────────────────

function MarketplaceEditorTab() {
  const { data: config, isLoading } = useMarketplaceBins();
  const { mutate: saveBins, isPending: isSaving } = useSaveMarketplaceBins();
  const [bins, setBins] = useState<MarketplaceBin[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BinFormData>(emptyBinForm());
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (config) setBins(config.bins.slice().sort((a, b) => a.sortOrder - b.sortOrder));
  }, [config]);

  function openNew() { setEditingIndex(null); setFormData(emptyBinForm()); setDialogOpen(true); }
  function openEdit(idx: number) {
    const bin = bins[idx];
    setEditingIndex(idx);
    setFormData({ title: bin.title, description: bin.description, emoji: bin.emoji, coverImage: bin.coverImage || '', filterType: bin.filterType, filterValue: bin.filterValue, isVisible: bin.isVisible });
    setDialogOpen(true);
  }
  function handleSave(data: BinFormData) {
    const now = Date.now();
    setBins((prev) => {
      if (editingIndex !== null) {
        return prev.map((b, i) => i === editingIndex ? { ...b, ...data } : b);
      }
      const maxOrder = prev.length ? Math.max(...prev.map((b) => b.sortOrder)) : -1;
      return [...prev, { id: `bin-${now}`, ...data, sortOrder: maxOrder + 1 }];
    });
    setDialogOpen(false);
    setIsDirty(true);
  }
  function handleDelete(idx: number) { setBins((prev) => prev.filter((_, i) => i !== idx)); setIsDirty(true); }
  function handleToggleVisibility(idx: number) { setBins((prev) => prev.map((b, i) => i === idx ? { ...b, isVisible: !b.isVisible } : b)); setIsDirty(true); }
  function handleMove(idx: number, dir: -1 | 1) {
    setBins((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[idx].sortOrder;
      next[idx] = { ...next[idx], sortOrder: next[target].sortOrder };
      next[target] = { ...next[target], sortOrder: tmp };
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setIsDirty(true);
  }
  function handlePublish() {
    const toSave = bins.map((b, i) => ({ ...b, sortOrder: i }));
    saveBins({ bins: toSave }, { onSuccess: () => setIsDirty(false) });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Create and arrange collections (bins) that appear as browseable sections on the marketplace.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/marketplace" target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </Button>
          </Link>
          <Button onClick={handlePublish} disabled={!isDirty || isSaving}
            style={{ backgroundColor: isDirty ? '#ec1a58' : undefined }}
            className="text-white gap-1.5 hover:opacity-90 disabled:opacity-40">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Saving...' : isDirty ? 'Save & Publish' : 'Saved'}
          </Button>
        </div>
      </div>

      {isDirty && (
        <Card className="border-orange-300 bg-orange-50">
          <CardContent className="py-3 px-4 text-sm text-orange-600 font-medium">
            Unsaved changes — click <strong>Save &amp; Publish</strong> to go live.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutGrid className="w-4 h-4 text-pink-500" /> Collections ({bins.length})
              </CardTitle>
              <CardDescription className="mt-1 text-xs">Each collection groups photos by category, tag, or location.</CardDescription>
            </div>
            <Button onClick={openNew} style={{ backgroundColor: '#ec1a58' }} className="text-white hover:opacity-90 gap-1.5" size="sm">
              <Plus className="w-4 h-4" /> Add Collection
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 items-center p-3 rounded-lg border">
                  <Skeleton className="w-14 h-14 rounded-lg" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/2" /></div>
                </div>
              ))}
            </div>
          ) : bins.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl">
              <FolderOpen className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="font-medium text-gray-500 mb-2">No collections yet</p>
              <p className="text-sm text-muted-foreground mb-4">Add your first collection to group marketplace content into browseable sections.</p>
              <Button onClick={openNew} style={{ backgroundColor: '#ec1a58' }} className="text-white hover:opacity-90 gap-1.5" size="sm">
                <Plus className="w-4 h-4" /> Add First Collection
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {bins.map((bin, idx) => (
                <BinCard key={bin.id} bin={bin} index={idx} total={bins.length}
                  onEdit={() => openEdit(idx)} onDelete={() => handleDelete(idx)}
                  onToggleVisibility={() => handleToggleVisibility(idx)}
                  onMoveUp={() => handleMove(idx, -1)} onMoveDown={() => handleMove(idx, 1)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-800 mb-2 text-sm flex items-center gap-2">
            <Info className="w-4 h-4" /> How collections work
          </h4>
          <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Category</strong> — shows all products tagged with a content category (Animals, Landscape, etc.)</li>
            <li><strong>Tag</strong> — shows products with a specific Nostr t-tag value</li>
            <li><strong>Geography</strong> — shows products from a specific continent or region</li>
            <li><strong>Featured</strong> — hand-pick specific product IDs to highlight</li>
            <li>Use the arrows to reorder; the eye icon toggles visibility</li>
          </ul>
        </CardContent>
      </Card>

      <BinEditDialog open={dialogOpen} initialData={formData} onSave={handleSave} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

// ── BinWorkspaceTab ────────────────────────────────────────────────────────────

function BinWorkspaceTab() {
  const { data: binsConfig, isLoading: binsLoading } = useMarketplaceBins();
  const { data: allMedia = [], isLoading: mediaLoading } = useAllMediaAssets();
  const { mutate: editMedia, isPending: isAssigning } = useEditMediaAsset();
  const [selectedBin, setSelectedBin] = useState<MarketplaceBin | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MarketplaceProduct | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const bins = useMemo(
    () => (binsConfig?.bins ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [binsConfig],
  );

  const filteredMedia = useMemo(() => {
    return allMedia.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      return true;
    });
  }, [allMedia, search, categoryFilter]);

  const binMedia = useMemo(() => {
    if (!selectedBin) return [];
    return allMedia.filter((p) => productMatchesBin(p, selectedBin));
  }, [selectedBin, allMedia]);

  const handleAssign = useCallback((product: MarketplaceProduct, bin: MarketplaceBin) => {
    const updates = buildAssignUpdates(bin, product);
    if (!updates) return;
    editMedia({ product, updates });
  }, [editMedia]);

  const canAutoAssign = selectedBin && selectedMedia ? buildAssignUpdates(selectedBin, selectedMedia) !== null : false;
  const selectedAlreadyInBin = selectedBin && selectedMedia ? productMatchesBin(selectedMedia, selectedBin) : false;

  return (
    <div className="space-y-4">
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-3 px-4">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span><strong>How to use:</strong> Select a photo from the library, then select a collection on the right, then click <strong>Assign</strong> to tag the photo so it appears in that collection. Green checkmarks mean the photo already belongs to the selected collection.</span>
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* LEFT: media library */}
        <div className="lg:col-span-3 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="w-4 h-4 text-pink-500" /> Media Library
                <Badge variant="secondary" className="text-xs">{filteredMedia.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="pl-8 h-8 text-sm" />
                  {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-muted-foreground" /></button>}
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-8 text-xs w-32"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="photos">Photos</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="graphics">Graphics</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedBin && (
                <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> In collection</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full border-2 border-pink-500" /> Selected</span>
                </div>
              )}
              {mediaLoading ? (
                <div className="grid grid-cols-5 gap-2">
                  {Array.from({ length: 15 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-lg" />)}
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="text-center py-10">
                  <ImageOff className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-muted-foreground">No media found</p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto">
                  {filteredMedia.map((product) => (
                    <MediaThumbnail key={product.id} product={product}
                      isInBin={selectedBin ? productMatchesBin(product, selectedBin) : false}
                      isSelected={selectedMedia?.id === product.id}
                      onClick={() => setSelectedMedia(selectedMedia?.id === product.id ? null : product)} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected photo detail */}
          {selectedMedia && (
            <Card className="border-pink-200 bg-pink-50">
              <CardContent className="p-3 flex gap-3 items-start">
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border">
                  {selectedMedia.images[0] ? <img src={selectedMedia.images[0]} alt={selectedMedia.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-4 h-4 text-gray-400" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{selectedMedia.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedMedia.category && <Badge variant="secondary" className="text-xs">{selectedMedia.category}</Badge>}
                    {selectedMedia.continent && <Badge variant="outline" className="text-xs">{selectedMedia.continent}</Badge>}
                  </div>
                  {selectedBin && !selectedAlreadyInBin && canAutoAssign && (
                    <Button size="sm" onClick={() => handleAssign(selectedMedia, selectedBin)} disabled={isAssigning}
                      className="mt-2 text-xs h-7" style={{ backgroundColor: '#ec1a58' }}>
                      {isAssigning ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ChevronRight className="w-3 h-3 mr-1" />}
                      Assign to {selectedBin.emoji} {selectedBin.title}
                    </Button>
                  )}
                  {selectedBin && selectedAlreadyInBin && <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Already in this collection</p>}
                  {selectedBin && !selectedAlreadyInBin && !canAutoAssign && (
                    <p className="text-xs text-amber-600 mt-1 flex items-start gap-1"><Info className="w-3 h-3 flex-shrink-0 mt-0.5" /> Add the tag manually via the Media Assets tab to assign to this collection.</p>
                  )}
                </div>
                <button onClick={() => setSelectedMedia(null)} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X className="w-4 h-4" /></button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT: collections list */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-pink-500" /> Collections
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {binsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
                </div>
              ) : bins.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No collections yet. Create some in the <strong>Marketplace Editor</strong> tab.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {bins.map((bin) => {
                    const count = allMedia.filter((p) => productMatchesBin(p, bin)).length;
                    const isActive = selectedBin?.id === bin.id;
                    return (
                      <button key={bin.id} onClick={() => setSelectedBin(isActive ? null : bin)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                          isActive ? 'bg-pink-50 border border-pink-300 text-pink-800' : 'hover:bg-gray-50 border border-transparent text-gray-700'
                        }`}>
                        <span className="text-base flex-shrink-0">{bin.emoji}</span>
                        <span className="flex-1 truncate font-medium">{bin.title}</span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {filterTypeIcon(bin.filterType)}
                          <Badge variant={isActive ? 'default' : 'secondary'} className={`text-xs px-1.5 py-0 ${isActive ? 'bg-pink-500' : ''}`}>{count}</Badge>
                          {!bin.isVisible && <span className="text-xs text-muted-foreground">(hidden)</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected bin contents */}
          {selectedBin && (
            <Card className="border-pink-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {selectedBin.emoji} {selectedBin.title}
                    <Badge variant="outline" className="text-xs">{binMedia.length} photos</Badge>
                  </CardTitle>
                  <button onClick={() => setSelectedBin(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                </div>
                <Badge variant="outline" className="text-xs w-fit gap-1 flex items-center mt-1">
                  {filterTypeIcon(selectedBin.filterType)} {filterTypeLabel(selectedBin.filterType)}: {selectedBin.filterValue}
                </Badge>
              </CardHeader>
              <CardContent className="pt-0">
                {binMedia.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed rounded-lg">
                    <FolderOpen className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs text-muted-foreground">No photos match this collection yet. Select a photo on the left and click Assign.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-1.5 max-h-64 overflow-y-auto">
                    {binMedia.map((product) => (
                      <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden border border-emerald-200">
                        {product.images[0] ? <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><ImageOff className="w-3 h-3 text-gray-400" /></div>}
                        <div className="absolute top-0.5 right-0.5"><CheckCircle2 className="w-3 h-3 text-emerald-500 drop-shadow" /></div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ── StatsBar ───────────────────────────────────────────────────────────────────

function StatsBar() {
  const stats = useMediaStatistics();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Camera className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className="text-xl font-bold">{stats.total}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-xl font-bold">{stats.active}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-xl font-bold">{stats.inactive}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Recent Uploads</p>
            <p className="text-xl font-bold">{stats.recentUploads}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MediaManagementHub() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isAuthorizedAdmin = user?.pubkey === ADMIN_HEX;

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Card className="max-w-sm w-full">
            <CardContent className="py-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-pink-600" />
              <p className="text-muted-foreground">Checking admin permissions...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Card className="max-w-sm w-full border-red-200 bg-red-50">
            <CardContent className="py-10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-6">Only authorized admins can access media management.</p>
              <Link to="/">
                <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* Page header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <ArrowLeft className="w-4 h-4" /> Admin Panel
              </Button>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-700">Media Management</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Camera className="w-6 h-6 text-pink-500" />
                Media Management Hub
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Manage all media assets, create marketplace collections, and assign photos to the right bins — all in one place.
              </p>
            </div>
            <Link to="/marketplace" target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" /> View Marketplace
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <StatsBar />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="assets">
          <TabsList className="mb-4 w-full sm:w-auto">
            <TabsTrigger value="assets" className="gap-1.5">
              <Camera className="w-4 h-4" />
              <span>Media Assets</span>
            </TabsTrigger>
            <TabsTrigger value="collections" className="gap-1.5">
              <Store className="w-4 h-4" />
              <span>Marketplace Collections</span>
            </TabsTrigger>
            <TabsTrigger value="assign" className="gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Assign to Collections</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Full media manager */}
          <TabsContent value="assets">
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold">All Media Assets</h2>
              <p className="text-sm text-muted-foreground">View, edit, activate/deactivate, geo-tag and delete all media in the marketplace.</p>
            </div>
            <MediaManagement />
          </TabsContent>

          {/* Tab 2: Marketplace bin editor */}
          <TabsContent value="collections">
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold">Marketplace Collections</h2>
              <p className="text-sm text-muted-foreground">Create and arrange collections (bins) that group photos into browseable sections on the marketplace homepage.</p>
            </div>
            <MarketplaceEditorTab />
          </TabsContent>

          {/* Tab 3: Bin-media workspace */}
          <TabsContent value="assign">
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold">Assign Photos to Collections</h2>
              <p className="text-sm text-muted-foreground">Browse your media library and assign photos to the right collection by tagging them with the correct category, region, or label.</p>
            </div>
            <BinWorkspaceTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
