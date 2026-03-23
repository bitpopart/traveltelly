import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useMarketplaceBins, useSaveMarketplaceBins, type MarketplaceBin } from '@/hooks/useMarketplaceBins';
import { nip19 } from 'nostr-tools';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Save,
  Eye,
  EyeOff,
  GripVertical,
  Store,
  FolderOpen,
  Shield,
  Loader2,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Tag,
  Globe,
  Star,
  LayoutGrid,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

// ── Constants ─────────────────────────────────────────────────────────────────

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

const CONTENT_CATEGORIES = [
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

const CONTINENTS = [
  { value: 'Africa', label: '🌍 Africa' },
  { value: 'Asia', label: '🌏 Asia' },
  { value: 'Europe', label: '🌍 Europe' },
  { value: 'North America', label: '🌎 North America' },
  { value: 'South America', label: '🌎 South America' },
  { value: 'Oceania', label: '🌏 Oceania' },
  { value: 'Antarctica', label: '🧊 Antarctica' },
];

const EMOJIS = ['📸', '🎥', '🌍', '🏔️', '🐘', '🏛️', '🌿', '🏙️', '✈️', '🌊', '🦁', '🌸', '🎨', '🍕', '⛵', '🧊', '🌅', '🦋', '🏜️', '🌺', '🗺️', '🏞️', '🎭', '🤿', '🛕'];

// ── Types ────────────────────────────────────────────────────────────────────

interface BinFormData {
  title: string;
  description: string;
  emoji: string;
  coverImage: string;
  filterType: MarketplaceBin['filterType'];
  filterValue: string;
  isVisible: boolean;
}

const emptyForm = (): BinFormData => ({
  title: '',
  description: '',
  emoji: '📸',
  coverImage: '',
  filterType: 'category',
  filterValue: '',
  isVisible: true,
});

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterValueInput({
  filterType,
  value,
  onChange,
}: {
  filterType: MarketplaceBin['filterType'];
  value: string;
  onChange: (v: string) => void;
}) {
  if (filterType === 'category') {
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select content category…" />
        </SelectTrigger>
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
        <SelectTrigger>
          <SelectValue placeholder="Select continent…" />
        </SelectTrigger>
        <SelectContent>
          {CONTINENTS.map((c) => (
            <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  if (filterType === 'tag') {
    return (
      <Input
        placeholder="e.g. wildlife, cityscape, portrait"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  // featured
  return (
    <Textarea
      placeholder="Comma-separated product IDs (d-tag values)"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
    />
  );
}

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

// ── BinCard ───────────────────────────────────────────────────────────────────

function BinCard({
  bin,
  index,
  total,
  onEdit,
  onDelete,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
}: {
  bin: MarketplaceBin;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <Card className={`border-2 transition-all ${bin.isVisible ? 'border-transparent' : 'border-dashed border-gray-300 opacity-60'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag handle / order controls */}
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move up"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <GripVertical className="w-4 h-4 text-gray-300" />
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-not-allowed"
              title="Move down"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Cover image or emoji */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-3xl">
            {bin.coverImage ? (
              <img src={bin.coverImage} alt={bin.title} className="w-full h-full object-cover" />
            ) : (
              <span>{bin.emoji}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900">{bin.emoji} {bin.title}</h3>
              <Badge variant="outline" className="text-xs gap-1 flex items-center">
                {filterTypeIcon(bin.filterType)}
                {filterTypeLabel(bin.filterType)}: <span className="font-medium ml-0.5">{bin.filterValue || '—'}</span>
              </Badge>
              {!bin.isVisible && (
                <Badge variant="secondary" className="text-xs">Hidden</Badge>
              )}
            </div>
            {bin.description && (
              <p className="text-sm text-muted-foreground mt-1 truncate">{bin.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">Sort order: {bin.sortOrder}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onToggleVisibility}
              title={bin.isVisible ? 'Hide from marketplace' : 'Show on marketplace'}
              className="text-gray-400 hover:text-gray-700 p-1 rounded"
            >
              {bin.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onEdit}
              title="Edit bin"
              className="text-blue-500 hover:text-blue-700 p-1 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  title="Delete bin"
                  className="text-red-400 hover:text-red-600 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete bin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the <strong>{bin.title}</strong> bin from your marketplace layout. The actual media assets will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── BinEditDialog ─────────────────────────────────────────────────────────────

function BinEditDialog({
  open,
  initialData,
  onSave,
  onClose,
}: {
  open: boolean;
  initialData: BinFormData;
  onSave: (data: BinFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<BinFormData>(initialData);

  useEffect(() => {
    setForm(initialData);
  }, [initialData, open]);

  const set = (patch: Partial<BinFormData>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" style={{ color: '#ec1a58' }} />
            {initialData.title ? 'Edit Bin' : 'New Bin'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Emoji picker (quick row) */}
          <div>
            <Label className="mb-2 block">Emoji</Label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set({ emoji: e })}
                  className={`text-xl p-1.5 rounded-lg border-2 transition-all ${
                    form.emoji === e ? 'border-pink-500 bg-pink-50' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {e}
                </button>
              ))}
              <Input
                className="w-16 text-center text-lg"
                value={form.emoji}
                onChange={(e) => set({ emoji: e.target.value })}
                placeholder="✏️"
                maxLength={4}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="bin-title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="bin-title"
              placeholder="e.g. Wildlife & Animals"
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="bin-desc">Short description</Label>
            <Textarea
              id="bin-desc"
              placeholder="What kind of photos are in this collection?"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Cover image URL */}
          <div>
            <Label htmlFor="bin-cover">Cover image URL (optional)</Label>
            <Input
              id="bin-cover"
              placeholder="https://…"
              value={form.coverImage}
              onChange={(e) => set({ coverImage: e.target.value })}
              className="mt-1"
            />
            {form.coverImage && (
              <div className="mt-2 w-full h-28 rounded-lg overflow-hidden border">
                <img src={form.coverImage} alt="cover preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Filter type */}
          <div>
            <Label>Filter type <span className="text-red-500">*</span></Label>
            <p className="text-xs text-muted-foreground mb-1">
              How should the marketplace pick photos for this bin?
            </p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {(['category', 'tag', 'geo', 'featured'] as const).map((ft) => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => set({ filterType: ft, filterValue: '' })}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    form.filterType === ft
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-gray-400 text-gray-600'
                  }`}
                >
                  {filterTypeIcon(ft)}
                  {filterTypeLabel(ft)}
                </button>
              ))}
            </div>
          </div>

          {/* Filter value */}
          <div>
            <Label>
              {form.filterType === 'category' && 'Content category'}
              {form.filterType === 'tag' && 'Tag (t-tag value)'}
              {form.filterType === 'geo' && 'Continent / Region'}
              {form.filterType === 'featured' && 'Featured product IDs'}
              <span className="text-red-500"> *</span>
            </Label>
            <div className="mt-1">
              <FilterValueInput
                filterType={form.filterType}
                value={form.filterValue}
                onChange={(v) => set({ filterValue: v })}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {form.filterType === 'category' && 'Products tagged with this content category will appear in the bin.'}
              {form.filterType === 'tag' && 'Products with this Nostr t-tag will appear in the bin.'}
              {form.filterType === 'geo' && 'Products from this geographic region will appear in the bin.'}
              {form.filterType === 'featured' && 'Enter the d-tag IDs of specific products to feature, comma-separated.'}
            </p>
          </div>

          {/* Visibility */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Visible on marketplace</p>
              <p className="text-xs text-muted-foreground">Toggle off to hide from public view</p>
            </div>
            <Switch
              checked={form.isVisible}
              onCheckedChange={(checked) => set({ isVisible: checked })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onSave(form)}
            disabled={!form.title.trim() || !form.filterValue.trim()}
            style={{ backgroundColor: '#ec1a58' }}
            className="text-white hover:opacity-90"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Bin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminMarketplace() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { data: config, isLoading } = useMarketplaceBins();
  const { mutate: saveBins, isPending: isSaving } = useSaveMarketplaceBins();

  const [bins, setBins] = useState<MarketplaceBin[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<BinFormData>(emptyForm());
  const [isDirty, setIsDirty] = useState(false);

  // Sync bins from Nostr data
  useEffect(() => {
    if (config) {
      setBins(config.bins.slice().sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [config]);

  // Admin check
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // ── handlers ─────────────────────────────────────────────────────────────

  function openNew() {
    setEditingIndex(null);
    setFormData(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(idx: number) {
    const bin = bins[idx];
    setEditingIndex(idx);
    setFormData({
      title: bin.title,
      description: bin.description,
      emoji: bin.emoji,
      coverImage: bin.coverImage || '',
      filterType: bin.filterType,
      filterValue: bin.filterValue,
      isVisible: bin.isVisible,
    });
    setDialogOpen(true);
  }

  function handleSave(data: BinFormData) {
    const now = Date.now();
    setBins((prev) => {
      let next: MarketplaceBin[];
      if (editingIndex !== null) {
        next = prev.map((b, i) =>
          i === editingIndex
            ? { ...b, ...data, sortOrder: b.sortOrder }
            : b,
        );
      } else {
        const maxOrder = prev.length ? Math.max(...prev.map((b) => b.sortOrder)) : -1;
        const newBin: MarketplaceBin = {
          id: `bin-${now}`,
          ...data,
          sortOrder: maxOrder + 1,
        };
        next = [...prev, newBin];
      }
      return next;
    });
    setDialogOpen(false);
    setIsDirty(true);
  }

  function handleDelete(idx: number) {
    setBins((prev) => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  }

  function handleToggleVisibility(idx: number) {
    setBins((prev) =>
      prev.map((b, i) => (i === idx ? { ...b, isVisible: !b.isVisible } : b)),
    );
    setIsDirty(true);
  }

  function handleMove(idx: number, dir: -1 | 1) {
    setBins((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      // Swap sort orders
      const tmp = next[idx].sortOrder;
      next[idx] = { ...next[idx], sortOrder: next[target].sortOrder };
      next[target] = { ...next[target], sortOrder: tmp };
      // Re-sort
      return next.sort((a, b) => a.sortOrder - b.sortOrder);
    });
    setIsDirty(true);
  }

  function handlePublish() {
    // Re-assign clean sequential sortOrders before saving
    const toSave = bins.map((b, i) => ({ ...b, sortOrder: i }));
    saveBins({ bins: toSave }, {
      onSuccess: () => setIsDirty(false),
    });
  }

  // ── guards ────────────────────────────────────────────────────────────────

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card><CardContent className="py-10 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-pink-600" />
            <p className="text-muted-foreground">Checking permissions…</p>
          </CardContent></Card>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-6">Admin access required.</p>
              <Link to="/admin"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" />Back to Admin</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-4 h-4" />
                  Admin Panel
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Store className="w-7 h-7" style={{ color: '#ec1a58' }} />
              Marketplace Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and arrange photo bins (folders/collections) that appear on the public marketplace page.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Link to="/admin/bin-workspace">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LayoutGrid className="w-4 h-4" />
                Bin · Media Workspace
              </Button>
            </Link>
            <Link to="/marketplace" target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="w-4 h-4" />
                Preview Marketplace
              </Button>
            </Link>
            <Button
              onClick={handlePublish}
              disabled={!isDirty || isSaving}
              style={{ backgroundColor: isDirty ? '#ec1a58' : undefined }}
              className="text-white gap-1.5 hover:opacity-90 disabled:opacity-40"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving…' : isDirty ? 'Save & Publish' : 'Saved'}
            </Button>
          </div>
        </div>

        {/* Info banner */}
        {isDirty && (
          <Card className="mb-4 border-orange-300 bg-orange-50">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <span className="text-orange-600 font-medium text-sm">
                ⚠️ You have unsaved changes. Click <strong>Save &amp; Publish</strong> to make them live.
              </span>
            </CardContent>
          </Card>
        )}

        {/* Bins list */}
        <Card className="mb-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5" style={{ color: '#ec1a58' }} />
                  Photo Bins / Collections
                </CardTitle>
                <CardDescription className="mt-1">
                  Each bin groups photos by category, tag, or location. They appear as browseable sections on the marketplace.
                </CardDescription>
              </div>
              <Button
                onClick={openNew}
                style={{ backgroundColor: '#ec1a58' }}
                className="text-white hover:opacity-90 gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Bin
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-center p-3 rounded-lg border">
                    <Skeleton className="w-14 h-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : bins.length === 0 ? (
              <div className="text-center py-14 border-2 border-dashed rounded-xl">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium text-gray-500 mb-2">No bins yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first photo bin to group your marketplace content into browseable collections.
                </p>
                <Button
                  onClick={openNew}
                  style={{ backgroundColor: '#ec1a58' }}
                  className="text-white hover:opacity-90 gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add First Bin
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bins.map((bin, idx) => (
                  <BinCard
                    key={bin.id}
                    bin={bin}
                    index={idx}
                    total={bins.length}
                    onEdit={() => openEdit(idx)}
                    onDelete={() => handleDelete(idx)}
                    onToggleVisibility={() => handleToggleVisibility(idx)}
                    onMoveUp={() => handleMove(idx, -1)}
                    onMoveDown={() => handleMove(idx, 1)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              How bins work
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Category bins</strong> – show all marketplace products tagged with a specific content category (Animals, Landscape, etc.)</li>
              <li><strong>Tag bins</strong> – show products that have a specific Nostr <code>t</code>-tag value</li>
              <li><strong>Geography bins</strong> – show products from a specific continent or region</li>
              <li><strong>Featured bins</strong> – hand-pick specific product IDs to highlight</li>
              <li>Reorder bins using the ▲ ▼ arrows; toggle the eye icon to hide/show on the public page</li>
              <li>Click <strong>Save &amp; Publish</strong> to push changes live — the public marketplace page updates immediately</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bin edit dialog */}
      <BinEditDialog
        open={dialogOpen}
        initialData={formData}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  );
}
