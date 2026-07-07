/**
 * Gamma Spec Collection Manager (Kind 30405)
 * Create and manage product collections
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGammaCollections } from '@/hooks/useGammaCollections';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { useToast } from '@/hooks/useToast';
import { buildCollectionTags, type GammaCollection } from '@/lib/gammaSpec';
import { FolderOpen, Plus, Edit3, Trash2, Loader2, Package, Search, Check } from 'lucide-react';

interface CollectionFormData {
  dTag: string;
  title: string;
  description: string;
  summary: string;
  image: string;
  location: string;
  productRefs: string[];
}

const defaultForm = (): CollectionFormData => ({
  dTag: `collection-${Date.now()}`,
  title: '',
  description: '',
  summary: '',
  image: '',
  location: '',
  productRefs: [],
});

interface CollectionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editCollection?: GammaCollection;
  onSaved?: () => void;
}

function CollectionFormDialog({ isOpen, onClose, editCollection, onSaved }: CollectionFormDialogProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  const [form, setForm] = useState<CollectionFormData>(() => {
    if (editCollection) {
      return {
        dTag: editCollection.dTag,
        title: editCollection.title,
        description: editCollection.description || '',
        summary: editCollection.summary || '',
        image: editCollection.image || '',
        location: editCollection.location || '',
        productRefs: editCollection.productRefs,
      };
    }
    return defaultForm();
  });

  const { data: products } = useMarketplaceProducts({ seller: user?.pubkey });

  const set = (field: keyof CollectionFormData, value: string | string[]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const toggleProduct = (productRef: string) => {
    if (form.productRefs.includes(productRef)) {
      set('productRefs', form.productRefs.filter(r => r !== productRef));
    } else {
      set('productRefs', [...form.productRefs, productRef]);
    }
  };

  const filteredProducts = products?.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  ) ?? [];

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title.trim()) { toast({ title: 'Title required', variant: 'destructive' }); return; }

    setIsSubmitting(true);
    try {
      const tags = buildCollectionTags({
        dTag: form.dTag,
        title: form.title,
        description: form.description || undefined,
        summary: form.summary || undefined,
        image: form.image || undefined,
        location: form.location || undefined,
        productRefs: form.productRefs,
      });

      await publishEvent({ kind: 30405, content: form.description, tags });

      toast({ title: editCollection ? 'Collection updated ✓' : 'Collection created ✓' });
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
            <FolderOpen className="w-5 h-5 text-purple-500" />
            {editCollection ? 'Edit Collection' : 'New Product Collection'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Collection Name *</Label>
            <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Beach Photography Bundle" />
          </div>

          <div>
            <Label>Short Summary</Label>
            <Input value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="One-line description for cards" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Detailed collection description…" rows={3} />
          </div>

          <div>
            <Label>Cover Image URL</Label>
            <Input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://…" />
          </div>

          <div>
            <Label>Location</Label>
            <Input value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Bali, Indonesia" />
          </div>

          {/* Product Selection */}
          <div>
            <Label>Products in Collection</Label>
            <div className="relative mt-1 mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search your products…"
                className="pl-8"
              />
            </div>

            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  <Package className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  No products found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProducts.map(product => {
                    const ref = `30402:${product.seller.pubkey}:${product.id}`;
                    const selected = form.productRefs.includes(ref);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 transition-colors ${selected ? 'bg-purple-50 dark:bg-purple-900/10' : ''}`}
                        onClick={() => toggleProduct(ref)}
                      >
                        {product.images[0] && (
                          <img src={product.images[0]} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.price} {product.currency}</p>
                        </div>
                        {selected && <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {form.productRefs.length > 0 && (
              <p className="text-xs text-purple-600 mt-1">{form.productRefs.length} product(s) selected</p>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleSubmit} className="flex-1 bg-purple-600 hover:bg-purple-700" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</> : editCollection ? 'Update Collection' : 'Create Collection'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollectionCard({ collection, onEdit, onDelete }: { collection: GammaCollection; onEdit: () => void; onDelete: () => void }) {
  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {collection.image ? (
            <img src={collection.image} alt={collection.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center flex-shrink-0">
              <FolderOpen className="w-6 h-6 text-purple-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{collection.title}</h3>
            {collection.summary && <p className="text-xs text-muted-foreground truncate mt-0.5">{collection.summary}</p>}
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">{collection.productRefs.length} products</Badge>
              {collection.location && <span className="text-xs text-muted-foreground">📍 {collection.location}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
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

interface GammaCollectionManagerProps {
  className?: string;
}

export function GammaCollectionManager({ className }: GammaCollectionManagerProps) {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { toast } = useToast();
  const { data: collections, isLoading, refetch } = useGammaCollections(user?.pubkey);
  const [showForm, setShowForm] = useState(false);
  const [editCollection, setEditCollection] = useState<GammaCollection | undefined>();

  const handleDelete = async (col: GammaCollection) => {
    if (!confirm(`Delete collection "${col.title}"?`)) return;
    try {
      await publishEvent({
        kind: 30405,
        content: '',
        tags: [
          ['d', col.dTag],
          ['title', col.title],
          ['status', 'deleted'],
        ],
      });
      toast({ title: 'Collection deleted' });
      refetch();
    } catch {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditCollection(undefined);
  };

  if (!user) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-purple-500" />
          <h3 className="font-semibold">Product Collections</h3>
          {collections && collections.length > 0 && (
            <Badge variant="secondary">{collections.length}</Badge>
          )}
        </div>
        <Button size="sm" onClick={() => { setEditCollection(undefined); setShowForm(true); }} className="gap-1">
          <Plus className="w-3.5 h-3.5" />
          New Collection
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : !collections?.length ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <FolderOpen className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No collections yet</p>
            <Button size="sm" variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Create First Collection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {collections.map(col => (
            <CollectionCard
              key={col.id}
              collection={col}
              onEdit={() => { setEditCollection(col); setShowForm(true); }}
              onDelete={() => handleDelete(col)}
            />
          ))}
        </div>
      )}

      <CollectionFormDialog
        isOpen={showForm}
        onClose={handleClose}
        editCollection={editCollection}
        onSaved={() => { refetch(); handleClose(); }}
      />
    </div>
  );
}
