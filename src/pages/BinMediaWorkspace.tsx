/**
 * BinMediaWorkspace
 *
 * A unified two-panel admin page that combines:
 *  LEFT  – Media library (thumbnail grid) with search/filter using useAllMediaAssets
 *  RIGHT – Bin editor: select a bin, see which photos belong to it, and assign
 *          photos by editing their category/geo tags via useEditMediaAsset
 *
 * Design principle: bins are filter-driven. "Assigning" a photo to a bin means
 * setting the correct tags (category, continent, t-tag) on the media event so it
 * matches the bin's filter — no hand-picked ID lists needed (except for 'featured' bins).
 */

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { useAllMediaAssets, useEditMediaAsset } from '@/hooks/useMediaManagement';
import { useMarketplaceBins } from '@/hooks/useMarketplaceBins';
import type { MarketplaceBin } from '@/hooks/useMarketplaceBins';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';
import { nip19 } from 'nostr-tools';
import {
  ArrowLeft,
  Search,
  Filter,
  FolderOpen,
  Shield,
  CheckCircle2,
  CircleDot,
  Tag,
  Globe,
  Star,
  Layers,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Loader2,
  X,
  Info,
} from 'lucide-react';

// ── Constants ──────────────────────────────────────────────────────────────────

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
  { value: 'Africa', label: '🌍 Africa' },
  { value: 'Asia', label: '🌏 Asia' },
  { value: 'Europe', label: '🌍 Europe' },
  { value: 'North America', label: '🌎 North America' },
  { value: 'South America', label: '🌎 South America' },
  { value: 'Oceania', label: '🌏 Oceania' },
  { value: 'Antarctica', label: '🧊 Antarctica' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function filterTypeIcon(ft: MarketplaceBin['filterType']) {
  switch (ft) {
    case 'category': return <Tag className="w-3 h-3" />;
    case 'tag': return <Tag className="w-3 h-3" />;
    case 'geo': return <Globe className="w-3 h-3" />;
    case 'featured': return <Star className="w-3 h-3" />;
  }
}

/** Returns true if this media product currently satisfies the bin's filter */
function productMatchesBin(product: MarketplaceProduct, bin: MarketplaceBin): boolean {
  switch (bin.filterType) {
    case 'category':
      return (
        product.contentCategory === bin.filterValue ||
        product.category === bin.filterValue
      );
    case 'tag': {
      const tTags = product.event.tags
        .filter(([n]) => n === 't')
        .map(([, v]) => v);
      return tTags.includes(bin.filterValue.trim());
    }
    case 'geo':
      return (
        product.continent === bin.filterValue ||
        product.country === bin.filterValue ||
        (product.geoFolder?.startsWith(bin.filterValue) ?? false)
      );
    case 'featured': {
      const ids = bin.filterValue.split(',').map((s) => s.trim()).filter(Boolean);
      return ids.includes(product.id);
    }
    default:
      return false;
  }
}

/** Derive what update to apply to make a product match a bin */
function buildAssignUpdates(
  bin: MarketplaceBin,
  product: MarketplaceProduct,
): Partial<MarketplaceProduct & { isFree?: boolean }> | null {
  switch (bin.filterType) {
    case 'category':
      return { contentCategory: bin.filterValue };
    case 'geo': {
      // filterValue might be "Europe" (continent) or "Europe/Netherlands" (geo_folder)
      const parts = bin.filterValue.split('/');
      if (parts.length === 2) {
        return { continent: parts[0], country: parts[1] };
      }
      return { continent: bin.filterValue };
    }
    case 'tag':
      // Tags need manual handling — return null to signal not auto-assignable
      return null;
    case 'featured':
      return null; // Featured bins use comma-separated IDs, handled separately
    default:
      return null;
  }
}

// ── MediaThumbnail ─────────────────────────────────────────────────────────────

interface MediaThumbnailProps {
  product: MarketplaceProduct;
  isInBin: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function MediaThumbnail({ product, isInBin, isSelected, onClick }: MediaThumbnailProps) {
  const thumb = product.images[0];

  return (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all focus:outline-none group ${
              isSelected
                ? 'border-pink-500 ring-2 ring-pink-300 ring-offset-1'
                : isInBin
                ? 'border-emerald-400'
                : 'border-transparent hover:border-gray-300'
            }`}
          >
            {/* Thumbnail image */}
            {thumb ? (
              <img
                src={thumb}
                alt={product.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <ImageOff className="w-6 h-6 text-gray-400" />
              </div>
            )}

            {/* In-bin overlay badge */}
            {isInBin && (
              <div className="absolute top-1 right-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 drop-shadow" />
              </div>
            )}

            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute inset-0 bg-pink-500/10 flex items-center justify-center">
                <CircleDot className="w-5 h-5 text-pink-600 drop-shadow" />
              </div>
            )}

            {/* Title overlay on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-1.5">
              <p className="text-white text-xs font-medium truncate">{product.title}</p>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-48">
          <p className="font-medium text-xs">{product.title}</p>
          <p className="text-xs text-muted-foreground">{product.category} · {product.contentCategory || 'no category'}</p>
          {product.continent && (
            <p className="text-xs text-muted-foreground">{product.continent}{product.country ? ` / ${product.country}` : ''}</p>
          )}
          {isInBin && <p className="text-xs text-emerald-600 font-medium mt-0.5">✓ In this bin</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ── BinPanel (right side) ──────────────────────────────────────────────────────

interface BinPanelProps {
  bins: MarketplaceBin[];
  selectedBin: MarketplaceBin | null;
  onSelectBin: (bin: MarketplaceBin | null) => void;
  allMedia: MarketplaceProduct[];
  selectedMedia: MarketplaceProduct | null;
  onAssign: (product: MarketplaceProduct, bin: MarketplaceBin) => void;
  isAssigning: boolean;
}

function BinPanel({
  bins,
  selectedBin,
  onSelectBin,
  allMedia,
  selectedMedia,
  onAssign,
  isAssigning,
}: BinPanelProps) {
  const binMedia = useMemo(() => {
    if (!selectedBin) return [];
    return allMedia.filter((p) => productMatchesBin(p, selectedBin));
  }, [selectedBin, allMedia]);

  const canAutoAssign = selectedBin && selectedMedia
    ? buildAssignUpdates(selectedBin, selectedMedia) !== null
    : false;

  const selectedAlreadyInBin = selectedBin && selectedMedia
    ? productMatchesBin(selectedMedia, selectedBin)
    : false;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Bin selector */}
      <div className="p-4 border-b bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-pink-500" />
            Bins
          </h2>
          <Link to="/admin/marketplace" className="text-xs text-pink-600 hover:underline flex items-center gap-1">
            Manage bins <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {bins.length === 0 ? (
          <div className="text-center py-4 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">No bins yet.</p>
            <Link to="/admin/marketplace">
              <Button size="sm" variant="outline" className="mt-2 text-xs">Create bins</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {bins.map((bin) => {
              const count = allMedia.filter((p) => productMatchesBin(p, bin)).length;
              const isActive = selectedBin?.id === bin.id;
              return (
                <button
                  key={bin.id}
                  onClick={() => onSelectBin(isActive ? null : bin)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all text-sm ${
                    isActive
                      ? 'bg-pink-50 dark:bg-pink-950 border border-pink-300 text-pink-800 dark:text-pink-200'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{bin.emoji}</span>
                  <span className="flex-1 truncate font-medium">{bin.title}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      {filterTypeIcon(bin.filterType)}
                    </span>
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className={`text-xs px-1.5 py-0 ${isActive ? 'bg-pink-500' : ''}`}
                    >
                      {count}
                    </Badge>
                    {!bin.isVisible && (
                      <span className="text-xs text-muted-foreground">(hidden)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected bin detail */}
      {selectedBin ? (
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Bin info bar */}
          <div className="px-4 py-3 bg-pink-50 dark:bg-pink-950/30 border-b flex-shrink-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {selectedBin.emoji} {selectedBin.title}
                </p>
                {selectedBin.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedBin.description}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge variant="outline" className="text-xs gap-1 flex items-center">
                    {filterTypeIcon(selectedBin.filterType)}
                    {selectedBin.filterType}: <span className="font-medium">{selectedBin.filterValue}</span>
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => onSelectBin(null)}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0 mt-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Assign action */}
          {selectedMedia && (
            <div className="px-4 py-3 border-b bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex items-start gap-3">
                {/* Thumb */}
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border">
                  {selectedMedia.images[0] ? (
                    <img
                      src={selectedMedia.images[0]}
                      alt={selectedMedia.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{selectedMedia.title}</p>

                  {selectedAlreadyInBin ? (
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Already in this bin
                    </p>
                  ) : canAutoAssign ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Assign to <strong>{selectedBin.title}</strong>?
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-0.5 flex items-start gap-1">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span>
                        {selectedBin.filterType === 'tag'
                          ? 'Edit the media to add the t-tag manually.'
                          : selectedBin.filterType === 'featured'
                          ? "Add the photo ID to the bin's featured list in the Marketplace Editor."
                          : 'Cannot auto-assign.'}
                      </span>
                    </p>
                  )}
                </div>

                {canAutoAssign && !selectedAlreadyInBin && (
                  <Button
                    size="sm"
                    onClick={() => onAssign(selectedMedia, selectedBin)}
                    disabled={isAssigning}
                    className="flex-shrink-0 text-xs"
                    style={{ backgroundColor: '#ec1a58' }}
                  >
                    {isAssigning ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <>Assign<ChevronRight className="w-3 h-3 ml-0.5" /></>
                    )}
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Bin contents grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Photos in this bin ({binMedia.length})
            </p>

            {binMedia.length === 0 ? (
              <div className="border-2 border-dashed rounded-xl py-10 text-center">
                <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm text-muted-foreground">No media matches this bin's filter yet.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a photo on the left and click <strong>Assign</strong>.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {binMedia.map((product) => (
                  <div key={product.id} className="relative aspect-square rounded-lg overflow-hidden border border-emerald-200 group">
                    {product.images[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity px-1.5 py-1.5">
                      <p className="text-white text-xs truncate">{product.title}</p>
                    </div>
                    <div className="absolute top-1 right-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 drop-shadow" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <Layers className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground font-medium">Select a bin</p>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a bin above to see which photos belong to it and assign new ones.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MediaLibraryPanel (left side) ──────────────────────────────────────────────

interface MediaLibraryPanelProps {
  selectedBin: MarketplaceBin | null;
  selectedMedia: MarketplaceProduct | null;
  onSelectMedia: (product: MarketplaceProduct | null) => void;
}

function MediaLibraryPanel({ selectedBin, selectedMedia, onSelectMedia }: MediaLibraryPanelProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [geoFilter, setGeoFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: allMedia = [], isLoading } = useAllMediaAssets({
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  // Further client-side geo filter
  const filteredMedia = useMemo(() => {
    if (geoFilter === 'all') return allMedia;
    return allMedia.filter(
      (p) =>
        p.continent === geoFilter ||
        p.geoFolder?.startsWith(geoFilter),
    );
  }, [allMedia, geoFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setGeoFilter('all');
    setStatusFilter('all');
  };

  const hasFilters =
    search !== '' ||
    categoryFilter !== 'all' ||
    geoFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Filter className="w-4 h-4 text-pink-500" />
            Media Library
            <Badge variant="secondary" className="text-xs">{filteredMedia.length}</Badge>
          </h2>
          {hasFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media…"
            className="pl-8 h-8 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters row */}
        <div className="flex gap-2 flex-wrap">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-7 text-xs flex-1 min-w-28">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CONTENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={geoFilter} onValueChange={setGeoFilter}>
            <SelectTrigger className="h-7 text-xs flex-1 min-w-28">
              <SelectValue placeholder="Geography" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {CONTINENTS_LIST.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'inactive')}>
            <SelectTrigger className="h-7 text-xs w-24 flex-shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Legend */}
        {selectedBin && (
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> In bin
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full border-2 border-pink-500" /> Selected
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 16 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <ImageOff className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-muted-foreground font-medium">No media found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
            {hasFilters && (
              <Button size="sm" variant="ghost" className="mt-3 text-xs" onClick={handleClearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredMedia.map((product) => (
              <MediaThumbnail
                key={product.id}
                product={product}
                isInBin={selectedBin ? productMatchesBin(product, selectedBin) : false}
                isSelected={selectedMedia?.id === product.id}
                onClick={() =>
                  onSelectMedia(selectedMedia?.id === product.id ? null : product)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── SelectedMediaDetail (below left panel on mobile / inline on desktop) ───────

interface SelectedMediaDetailProps {
  product: MarketplaceProduct;
  onClose: () => void;
}

function SelectedMediaDetail({ product, onClose }: SelectedMediaDetailProps) {
  return (
    <div className="border-t bg-white dark:bg-gray-900 p-3 flex gap-3 flex-shrink-0">
      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border">
        {product.images[0] ? (
          <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {product.category && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{product.category}</Badge>
          )}
          {product.contentCategory && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">{product.contentCategory}</Badge>
          )}
          {product.continent && (
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              <Globe className="w-2.5 h-2.5 mr-0.5" />{product.continent}
              {product.country ? ` / ${product.country}` : ''}
            </Badge>
          )}
          <Badge
            variant={product.status === 'active' ? 'default' : 'secondary'}
            className={`text-xs px-1.5 py-0 ${product.status === 'active' ? 'bg-emerald-500' : ''}`}
          >
            {product.status}
          </Badge>
        </div>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function BinMediaWorkspace() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { data: binsConfig, isLoading: binsLoading } = useMarketplaceBins();
  const { data: allMedia = [] } = useAllMediaAssets();
  const { mutate: editMedia, isPending: isAssigning } = useEditMediaAsset();

  const [selectedBin, setSelectedBin] = useState<MarketplaceBin | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<MarketplaceProduct | null>(null);

  // Admin auth
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  const bins = useMemo(
    () => (binsConfig?.bins ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder),
    [binsConfig],
  );

  const handleAssign = useCallback(
    (product: MarketplaceProduct, bin: MarketplaceBin) => {
      const updates = buildAssignUpdates(bin, product);
      if (!updates) return;
      editMedia({ product, updates });
    },
    [editMedia],
  );

  // ── guards ─────────────────────────────────────────────────────────────────

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Card className="max-w-sm w-full">
            <CardContent className="py-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-pink-600" />
              <p className="text-muted-foreground">Checking permissions…</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <Card className="max-w-sm w-full border-red-200 bg-red-50">
            <CardContent className="py-10 text-center">
              <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-6">Admin access required.</p>
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      {/* Page header */}
      <div className="flex-shrink-0 border-b bg-white dark:bg-gray-900 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground h-8">
                <ArrowLeft className="w-4 h-4" />
                Admin
              </Button>
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-pink-500" />
              Bin · Media Workspace
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/admin/marketplace">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <FolderOpen className="w-3.5 h-3.5" />
                Edit Bins
              </Button>
            </Link>
            <Link to="/admin/media-management" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <Filter className="w-3.5 h-3.5" />
                Full Media Manager
              </Button>
            </Link>
            <Link to="/marketplace" target="_blank">
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
                <ExternalLink className="w-3.5 h-3.5" />
                Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Instruction bar */}
      <div className="flex-shrink-0 bg-blue-50 dark:bg-blue-950/30 border-b px-4 py-2">
        <div className="max-w-screen-2xl mx-auto">
          <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2 flex-wrap">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              <strong>How to use:</strong> Click a photo on the left to select it →
              Click a bin on the right → hit <strong>Assign</strong> to tag the photo so it matches that bin's filter.
              Green checkmarks mean the photo already belongs to a bin.
            </span>
          </p>
        </div>
      </div>

      {/* Two-panel workspace */}
      <div className="flex-1 flex overflow-hidden max-w-screen-2xl mx-auto w-full">

        {/* LEFT: Media library */}
        <div
          className="flex flex-col border-r bg-gray-50 dark:bg-gray-950"
          style={{ width: '58%', minWidth: 320 }}
        >
          <MediaLibraryPanel
            selectedBin={selectedBin}
            selectedMedia={selectedMedia}
            onSelectMedia={setSelectedMedia}
          />

          {/* Selected photo detail strip */}
          {selectedMedia && (
            <SelectedMediaDetail
              product={selectedMedia}
              onClose={() => setSelectedMedia(null)}
            />
          )}
        </div>

        {/* RIGHT: Bin editor */}
        <div
          className="flex flex-col bg-white dark:bg-gray-900"
          style={{ width: '42%' }}
        >
          {binsLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center p-3 rounded-lg border">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <BinPanel
              bins={bins}
              selectedBin={selectedBin}
              onSelectBin={setSelectedBin}
              allMedia={allMedia}
              selectedMedia={selectedMedia}
              onAssign={handleAssign}
              isAssigning={isAssigning}
            />
          )}
        </div>
      </div>
    </div>
  );
}
