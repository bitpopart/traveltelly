import { useState, useMemo, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  Award, Medal, Globe, Camera, Sparkles, Users, Search,
  Loader2, Send, CheckCircle2, AlertCircle, Crown, Trash2,
  Plus, ImagePlus, X
} from 'lucide-react';

// ------------------------------------------------------------------------------
// PRESET BADGE CATEGORIES (with image placeholders — admin can upload images)
// ------------------------------------------------------------------------------

export interface PresetBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiers: string[];
  category: string;
  categoryColor: string;
  image?: string;
}

const PRESET_CATEGORIES = [
  {
    id: 'explorer',
    emoji: '🌍',
    color: '#FF6B35',
    title: 'Explorer Badges',
    badges: [
      { id: 'country-collector', icon: '🗺️', name: 'Country Collector', tiers: ['Bronze 5+', 'Silver 15+', 'Gold 30+', 'Platinum 50+'], desc: 'Countries visited — the OG badge' },
      { id: 'continent-hopper', icon: '🌐', name: 'Continent Hopper', tiers: ['3 Continents', '5 Continents', 'All 7'], desc: 'Hit multiple continents' },
      { id: 'island-dweller', icon: '🏝️', name: 'Island Dweller', tiers: ['5 Islands', '15 Islands', '30 Islands'], desc: 'Islands explored' },
      { id: 'highlands-seeker', icon: '🏔️', name: 'Highlands Seeker', tiers: ['3 Mountain Regions', '8 Regions', '15 Regions'], desc: 'Mountain destinations conquered' },
      { id: 'desert-wanderer', icon: '🏜️', name: 'Desert Wanderer', tiers: ['1 Desert', '3 Deserts', '5 Major Deserts'], desc: 'Arid lands explorer' },
    ],
  },
  {
    id: 'culture',
    emoji: '🎭',
    color: '#7B2FBE',
    title: 'Culture Vulture Badges',
    badges: [
      { id: 'local-feast', icon: '🍜', name: 'Local Feast', tiers: ['10 Local Dishes', '30 Dishes', '100 Dishes'], desc: 'Street food & local eats documented' },
      { id: 'festival-junkie', icon: '🎪', name: 'Festival Junkie', tiers: ['3 Festivals', '8 Festivals', '20 Festivals'], desc: 'Local festivals attended' },
      { id: 'heritage-hunter', icon: '🕌', name: 'Heritage Hunter', tiers: ['5 UNESCO Sites', '15 Sites', '30 Sites'], desc: 'UNESCO World Heritage sites' },
      { id: 'phrase-dropper', icon: '🗣️', name: 'Phrase Dropper', tiers: ['5 Languages', '10 Languages', '20 Languages'], desc: 'Languages learned (even just hello!)' },
      { id: 'local-connect', icon: '🤝', name: 'Local Connect', tiers: ['5 Locals', '20 Locals', '50 Locals'], desc: 'Connected with locals on TravelTelly' },
    ],
  },
  {
    id: 'creator',
    emoji: '📸',
    color: '#00B4D8',
    title: 'Creator Badges',
    badges: [
      { id: 'reel-traveller', icon: '🎬', name: 'Reel Traveller', tiers: ['5 Videos', '20 Videos', '50 Videos'], desc: 'Travel videos published' },
      { id: 'travel-scribe', icon: '✍️', name: 'Travel Scribe', tiers: ['10 Posts', '50 Posts', '200 Posts'], desc: 'Stories & posts shared' },
      { id: 'spot-dropper', icon: '📍', name: 'Spot Dropper', tiers: ['10 Spots', '50 Spots', '150 Spots'], desc: 'Hidden gems pinned on the map' },
      { id: 'trending-teller', icon: '🔥', name: 'Trending Teller', tiers: ['1 Viral Post', '5 Viral Posts', '20 Viral Posts'], desc: 'Posts that blew up on Nostr' },
      { id: 'thread-maker', icon: '🧵', name: 'Thread Maker', tiers: ['5 Threads', '20 Threads', '50 Threads'], desc: 'Travel threads published' },
    ],
  },
  {
    id: 'community',
    emoji: '🤙',
    color: '#2D9B5A',
    title: 'Community Badges',
    badges: [
      { id: 'zap-magnet', icon: '⚡', name: 'Zap Magnet', tiers: ['100 Zaps', '1K Zaps', '10K Zaps'], desc: 'Zaps received from the community' },
      { id: 'vibe-curator', icon: '💜', name: 'Vibe Curator', tiers: ['50 Reactions', '200 Reactions', '1K Reactions'], desc: 'Content that made people feel something' },
      { id: 'trip-advisor', icon: '🧭', name: 'Trip Advisor', tiers: ['10 Replies', '50 Replies', '200 Replies'], desc: 'Helpful travel advice given' },
      { id: 'squad-builder', icon: '👥', name: 'Squad Builder', tiers: ['5 Followers', '50 Followers', '500 Followers'], desc: 'TravelTelly followers on Nostr' },
      { id: 'collab-king', icon: '🤝', name: 'Collab King', tiers: ['1 Collab', '5 Collabs', '15 Collabs'], desc: 'Collabs with other TravelTelly creators' },
    ],
  },
  {
    id: 'special',
    emoji: '✨',
    color: '#E63946',
    title: 'Special Edition Badges',
    badges: [
      { id: 'night-owl', icon: '🌙', name: 'Night Owl Tripper', tiers: ['Unique — Seasonal'], desc: 'Awarded during TravelTelly night travel campaigns' },
      { id: 'solo-ranger', icon: '🎒', name: 'Solo Ranger', tiers: ['Verified Solo Traveller'], desc: 'Travelling solo & documenting it on TravelTelly' },
      { id: 'eco-wanderer', icon: '🌱', name: 'Eco Wanderer', tiers: ['Eco Travel Documented'], desc: 'Sustainable & eco-friendly travel content' },
      { id: 'early-believer', icon: '🚀', name: 'Early Believer', tiers: ['OG Badge — Limited'], desc: 'First 1000 TravelTelly Nostr users — never reissued' },
      { id: 'traveltelly-og', icon: '👑', name: 'TravelTelly OG', tiers: ['Invite Only'], desc: 'Handpicked by the TravelTelly team. Legendary status.' },
    ],
  },
];

// Flatten preset badges
const PRESET_BADGES: PresetBadge[] = PRESET_CATEGORIES.flatMap(cat =>
  cat.badges.map(b => ({
    id: b.id,
    name: b.name,
    description: b.desc,
    icon: b.icon,
    tiers: b.tiers,
    category: cat.title,
    categoryColor: cat.color,
  }))
);

export interface CustomBadge {
  id: string;
  name: string;
  description: string;
  image: string;
  tiers: string[];
  category: string;
  isCustom: true;
  icon?: string;
}

const BADGE_DEFINITION_KIND = 30009;
const BADGE_AWARD_KIND = 8;

function buildBadgeAddr(adminPubkey: string, badgeId: string): string {
  return `${BADGE_DEFINITION_KIND}:${adminPubkey}:${badgeId}`;
}

function sanitizeId(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCategoryColor(catName: string): string {
  const found = PRESET_CATEGORIES.find(c => c.title === catName);
  if (found) return found.color;
  // Hash to consistent color for custom categories
  let hash = 0;
  for (let i = 0; i < catName.length; i++) hash = catName.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 55%)`;
}

// ------------------------------------------------------------------------------
// COMPONENT
// ------------------------------------------------------------------------------

export function AdminBadgeManager() {
  const { nostr } = useNostr();
  const { mutate: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

  const [activeCategory, setActiveCategory] = useState('explorer');
  const [recipientNpub, setRecipientNpub] = useState('');
  const [awardingBadgeId, setAwardingBadgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom badge creation dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newBadgeName, setNewBadgeName] = useState('');
  const [newBadgeDesc, setNewBadgeDesc] = useState('');
  const [newBadgeCategory, setNewBadgeCategory] = useState('Custom');
  const [newBadgeTiers, setNewBadgeTiers] = useState('Bronze, Silver, Gold');
  const [newBadgeImage, setNewBadgeImage] = useState<string | null>(null);

  // Fetch badge definitions from Nostr (both preset + custom)
  const { data: relayDefs = [], isLoading: loadingDefs } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([{
        kinds: [BADGE_DEFINITION_KIND],
        limit: 200,
      }], { signal });

      return events.map((e: NostrEvent) => {
        const d = e.tags.find(([n]) => n === 'd')?.[1] || '';
        const name = e.tags.find(([n]) => n === 'name')?.[1] || d;
        const description = e.tags.find(([n]) => n === 'description')?.[1] || '';
        const image = e.tags.find(([n]) => n === 'image')?.[1] || '';
        const cat = e.tags.find(([n]) => n === 't')?.[1] || 'Custom';
        // Custom badge marker
        const isCustom = e.tags.some(([n, v]) => n === 'custom' && v === 'true');
        return { id: d, name, description, image, category: cat, isCustom, event: e };
      });
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch recent badge awards
  const { data: recentAwards = [], isLoading: loadingAwards } = useQuery({
    queryKey: ['badge-awards'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([{
        kinds: [BADGE_AWARD_KIND],
        limit: 50,
      }], { signal });

      return events.map((e: NostrEvent) => {
        const aTag = e.tags.find(([n]) => n === 'a')?.[1] || '';
        const pTags = e.tags.filter(([n]) => n === 'p').map(([, v]) => v);
        const parts = aTag.split(':');
        const badgeId = parts.length >= 3 ? parts[2] : '';
        return { badgeId, recipients: pTags, created_at: e.created_at, eventId: e.id };
      }).sort((a, b) => b.created_at - a.created_at);
    },
    staleTime: 2 * 60 * 1000,
  });

  // Build ALL badges list: presets (with optional image override from relay) + custom
  const mergedBadges = useMemo(() => {
    const defsById = new Map<string, { image: string; category: string; isCustom: boolean }>();
    relayDefs.forEach(d => defsById.set(d.id, { image: d.image, category: d.category, isCustom: d.isCustom }));

    const all: (PresetBadge | CustomBadge)[] = [
      ...PRESET_BADGES.map(b => {
        const def = defsById.get(b.id);
        return {
          ...b,
          image: def?.image || undefined,
          category: def?.category || b.category,
        };
      }),
      ...relayDefs
        .filter(d => d.isCustom)
        .map(d => ({
          id: d.id,
          name: d.name,
          description: d.description,
          image: d.image,
          tiers: ['Awarded'],
          category: d.category,
          isCustom: true as const,
        })),
    ];
    return all;
  }, [relayDefs]);

  const definedIds = useMemo(() => new Set(relayDefs.map(b => b.id)), [relayDefs]);

  const activeCat = PRESET_CATEGORIES.find(c => c.id === activeCategory);

  const filteredBadges = useMemo(() => {
    if (!searchQuery.trim()) return mergedBadges;
    const q = searchQuery.toLowerCase();
    return mergedBadges.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  }, [searchQuery, mergedBadges]);

  // -- IMAGE UPLOAD --
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const tags = await uploadFile(file);
      // Extract URL from NIP-94 tags returned by Blossom upload
      const urlTag = tags.find(([n]) => n === 'url');
      const imageUrl = urlTag?.[1] || '';
      if (imageUrl) {
        setNewBadgeImage(imageUrl);
        toast({ title: 'Image uploaded', description: 'Badge image is ready.' });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: String(err), variant: 'destructive' });
    }
  };

  const resetCreateForm = () => {
    setNewBadgeName('');
    setNewBadgeDesc('');
    setNewBadgeCategory('Custom');
    setNewBadgeTiers('Bronze, Silver, Gold');
    setNewBadgeImage(null);
    setShowCreateDialog(false);
  };

  // -- DEFINE PRESET BADGE --
  const handleDefinePreset = useCallback((badge: PresetBadge) => {
    if (definedIds.has(badge.id)) {
      toast({ title: 'Already defined', description: `"${badge.name}" is published.`, variant: 'destructive' });
      return;
    }

    publishEvent({
      kind: BADGE_DEFINITION_KIND,
      content: '',
      tags: [
        ['d', badge.id],
        ['name', badge.name],
        ['description', badge.description],
        ...badge.tiers.map((t): [string, string] => ['t', t]),
        ['t', badge.category],
      ],
    }, {
      onSuccess: () => toast({ title: 'Badge defined!', description: `"${badge.name}" published on Nostr.` }),
      onError: (err: Error) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
    });
  }, [definedIds, publishEvent, toast]);

  // -- CREATE CUSTOM BADGE --
  const handleCreateCustom = useCallback(() => {
    if (!newBadgeName.trim() || !newBadgeDesc.trim()) {
      toast({ title: 'Fill in name & description', variant: 'destructive' });
      return;
    }
    const id = sanitizeId(newBadgeName);
    const tiers = newBadgeTiers.split(',').map(t => t.trim()).filter(Boolean);

    const tags: string[][] = [
      ['d', id],
      ['name', newBadgeName.trim()],
      ['description', newBadgeDesc.trim()],
      ['custom', 'true'],
      ['t', newBadgeCategory.trim() || 'Custom'],
      ...tiers.map((t): [string, string] => ['t', t]),
    ];
    if (newBadgeImage) {
      tags.push(['image', newBadgeImage]);
      // Add thumbnail hint
      tags.push(['thumb', newBadgeImage]);
    }

    publishEvent({
      kind: BADGE_DEFINITION_KIND,
      content: '',
      tags,
    }, {
      onSuccess: () => {
        toast({ title: 'Custom badge created!', description: `"${newBadgeName}" is now published.` });
        resetCreateForm();
      },
      onError: (err: Error) => toast({ title: 'Failed', description: err.message, variant: 'destructive' }),
    });
  }, [newBadgeName, newBadgeDesc, newBadgeCategory, newBadgeTiers, newBadgeImage, publishEvent, toast]);

  // -- DEFINE ALL PRESET BADGES --
  const handleDefineAllPresets = useCallback(() => {
    const unpublished = PRESET_BADGES.filter(b => !definedIds.has(b.id));
    if (unpublished.length === 0) {
      toast({ title: 'All preset badges defined' });
      return;
    }
    unpublished.forEach((badge, i) => {
      setTimeout(() => {
        publishEvent({
          kind: BADGE_DEFINITION_KIND,
          content: '',
          tags: [
            ['d', badge.id],
            ['name', badge.name],
            ['description', badge.description],
            ...badge.tiers.map((t): [string, string] => ['t', t]),
            ['t', badge.category],
          ],
        });
      }, i * 300);
    });
    toast({ title: `Defining ${unpublished.length} badges...`, description: 'Publishing to Nostr in batches.' });
  }, [definedIds, publishEvent, toast]);

  // -- AWARD BADGE --
  const handleAward = useCallback((badgeId: string) => {
    const npub = recipientNpub.trim();
    if (!npub) {
      toast({ title: 'Enter recipient npub', variant: 'destructive' });
      return;
    }

    let recipientPubkey: string;
    try {
      if (npub.startsWith('npub1')) {
        const decoded = nip19.decode(npub);
        if (decoded.type !== 'npub') throw new Error('Invalid npub');
        recipientPubkey = decoded.data as string;
      } else if (npub.length === 64) {
        recipientPubkey = npub;
      } else {
        throw new Error('Invalid pubkey format');
      }
    } catch {
      toast({ title: 'Invalid npub', description: 'Enter a valid npub or 64-char hex pubkey.', variant: 'destructive' });
      return;
    }

    if (!definedIds.has(badgeId)) {
      toast({ title: 'Badge not defined', description: 'Define the badge first before awarding.', variant: 'destructive' });
      return;
    }

    const adminPubkey = user?.pubkey || '';
    if (!adminPubkey) {
      toast({ title: 'Not logged in', variant: 'destructive' });
      return;
    }
    const addr = buildBadgeAddr(adminPubkey, badgeId);

    publishEvent({
      kind: BADGE_AWARD_KIND,
      content: `Awarded ${badgeId} badge`,
      tags: [
        ['a', addr],
        ['p', recipientPubkey],
      ],
    }, {
      onSuccess: () => {
        toast({ title: 'Badge awarded!', description: `Sent to ...${recipientPubkey.slice(-8)}` });
        setAwardingBadgeId(null);
        setRecipientNpub('');
      },
      onError: (err: Error) => toast({ title: 'Award failed', description: err.message, variant: 'destructive' }),
    });
  }, [recipientNpub, definedIds, user?.pubkey, publishEvent, toast]);

  // Helper: find any badge by id
  const findBadge = (id: string) => mergedBadges.find(b => b.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Medal className="w-5 h-5" style={{ color: '#FF6B35' }} />
            Badge Manager
          </CardTitle>
          <CardDescription>
            Define NIP-58 badges and award them to TravelTelly users. Create custom badges with your own images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full" onClick={handleDefineAllPresets} disabled={isPublishing}>
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Define All Presets
            </Button>
            <Button variant="default" className="rounded-full" style={{ backgroundColor: '#FF6B35' }} onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Badge
            </Button>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {relayDefs.length} / {PRESET_BADGES.length} published
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* CREATE CUSTOM BADGE DIALOG */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" style={{ color: '#FF6B35' }} />
              Create Custom Badge
            </DialogTitle>
            <DialogDescription>
              Design your own badge with a custom image. It will be published on Nostr as a kind 30009 event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Image upload */}
            <div className="space-y-2">
              <Label>Badge Image</Label>
              <div className="flex items-center gap-4">
                <div
                  className="w-24 h-24 rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden bg-muted/50 hover:bg-muted transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newBadgeImage ? (
                    <img src={newBadgeImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImagePlus className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  {newBadgeImage && (
                    <Button type="button" variant="ghost" size="sm" className="text-red-500 rounded-full" onClick={() => setNewBadgeImage(null)}>
                      <X className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelect}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Square images work best. Recommended: 512×512 or 1024×1024.</p>
            </div>

            <div className="space-y-2">
              <Label>Badge Name *</Label>
              <Input placeholder="e.g. Sunrise Chaser" value={newBadgeName} onChange={e => setNewBadgeName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Description *</Label>
              <Input placeholder="What does this badge mean?" value={newBadgeDesc} onChange={e => setNewBadgeDesc(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="Custom, Event, Challenge..."
                value={newBadgeCategory}
                onChange={e => setNewBadgeCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Tiers (comma-separated)</Label>
              <Input
                placeholder="Bronze, Silver, Gold, Platinum"
                value={newBadgeTiers}
                onChange={e => setNewBadgeTiers(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Leave tiers blank if the badge has no levels.</p>
            </div>

            <Separator />

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 rounded-full" style={{ backgroundColor: '#FF6B35' }} disabled={isPublishing} onClick={handleCreateCustom}>
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Publish Badge
              </Button>
              <Button variant="outline" className="rounded-full" onClick={resetCreateForm}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="catalogue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="catalogue" className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> Catalogue</TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Award</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5"><Crown className="w-4 h-4" /> History</TabsTrigger>
        </TabsList>

        {/* === CATALOGUE === */}
        <TabsContent value="catalogue" className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search badges..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          {/* Category pills (hide when searching) */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-2">
              {PRESET_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                  style={{
                    borderColor: activeCategory === cat.id ? cat.color : 'rgba(0,0,0,0.1)',
                    background: activeCategory === cat.id ? `${cat.color}18` : 'transparent',
                    color: activeCategory === cat.id ? cat.color : '#666',
                  }}
                >
                  {cat.emoji} {cat.title}
                </button>
              ))}
              {/* Custom category pill if there are custom badges */}
              {relayDefs.some(d => d.isCustom) && (
                <button
                  onClick={() => setActiveCategory('custom')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all border"
                  style={{
                    borderColor: activeCategory === 'custom' ? '#FF6B35' : 'rgba(0,0,0,0.1)',
                    background: activeCategory === 'custom' ? '#FF6B3518' : 'transparent',
                    color: activeCategory === 'custom' ? '#FF6B35' : '#666',
                  }}
                >
                  ✨ Custom Badges
                </button>
              )}
            </div>
          )}

          {/* Badge grid */}
          <div className="grid gap-3">
            {(searchQuery ? filteredBadges
              : activeCategory === 'custom'
                ? mergedBadges.filter(b => 'isCustom' in b && b.isCustom)
                : (activeCat?.badges.map(pb => mergedBadges.find(b => b.id === pb.id)!).filter(Boolean) as typeof mergedBadges)
            ).map((badge) => {
              const isDefined = definedIds.has(badge.id);
              const color = getCategoryColor(badge.category);
              const imageUrl = ('image' in badge && badge.image) ? badge.image : undefined;
              const isCustom = 'isCustom' in badge;

              return (
                <Card key={badge.id} className={`overflow-hidden transition-all ${isDefined ? 'border-green-300 dark:border-green-800' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Badge image / icon */}
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                        style={{ background: imageUrl ? 'transparent' : `${color}18` }}
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={badge.name} className="w-full h-full object-cover" />
                        ) : (
                          badge.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold">{badge.name}</h3>
                          {isDefined && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                            </Badge>
                          )}
                          {isCustom && (
                            <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">
                              Custom
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                        {'tiers' in badge && badge.tiers.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {badge.tiers.map((tier, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{
                                background: i === 0 ? '#CD7F3215' : i === 1 ? '#C0C0C015' : i === 2 ? '#FFD70015' : `${color}15`,
                                borderColor: i === 0 ? '#CD7F3240' : i === 1 ? '#C0C0C040' : i === 2 ? '#FFD70040' : `${color}40`,
                                color: i === 0 ? '#CD7F32' : i === 1 ? '#888' : i === 2 ? '#D4A017' : color,
                              }}>{tier}</span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 mt-1">
                          {!isDefined && !isCustom && (
                            <Button size="sm" variant="default" className="text-xs rounded-full" disabled={isPublishing} onClick={() => handleDefinePreset(badge as PresetBadge)}>
                              <Sparkles className="w-3 h-3 mr-1" /> Define on Nostr
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="text-xs rounded-full" onClick={() => { setAwardingBadgeId(badge.id); }}>
                            <Award className="w-3 h-3 mr-1" /> Award
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* === AWARD === */}
        <TabsContent value="award" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="w-4 h-4" />
                Award a Badge
              </CardTitle>
              <CardDescription>
                Enter a user's npub and select a badge to award them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient (npub or hex pubkey)</Label>
                <Input placeholder="npub1... or 64-char hex" value={recipientNpub} onChange={e => setRecipientNpub(e.target.value)} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Select Badge</Label>
                <div className="grid gap-2 max-h-80 overflow-y-auto">
                  {mergedBadges.map(badge => {
                    const isDefined = definedIds.has(badge.id);
                    const isSelected = awardingBadgeId === badge.id;
                    const imageUrl = ('image' in badge && badge.image) ? badge.image : undefined;
                    const color = getCategoryColor(badge.category);
                    return (
                      <button
                        key={badge.id}
                        onClick={() => setAwardingBadgeId(badge.id)}
                        disabled={!isDefined}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-border hover:border-muted-foreground'
                        } ${!isDefined ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden" style={{ background: imageUrl ? 'transparent' : `${color}18` }}>
                          {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : badge.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{badge.name}</div>
                          <div className="text-xs text-muted-foreground">{badge.category}</div>
                        </div>
                        {!isDefined && <Badge variant="outline" className="text-xs">Not defined</Badge>}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full rounded-full"
                disabled={!awardingBadgeId || !recipientNpub.trim() || isPublishing}
                onClick={() => awardingBadgeId && handleAward(awardingBadgeId)}
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
                Award Badge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* === HISTORY === */}
        <TabsContent value="history" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="w-4 h-4" />
                Recent Awards
              </CardTitle>
              <CardDescription>
                Badges awarded on Nostr. Users can accept them to display on their profiles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAwards ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : recentAwards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No badges awarded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAwards.map((award, i) => {
                    const badge = findBadge(award.badgeId);
                    const imageUrl = badge && ('image' in badge && badge.image) ? badge.image : undefined;
                    const color = badge ? getCategoryColor(badge.category) : '#888';
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden" style={{ background: imageUrl ? 'transparent' : `${color}18` }}>
                          {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : (badge?.icon || '🏅')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{badge?.name || award.badgeId}</div>
                          <div className="text-xs text-muted-foreground">
                            To: {award.recipients.map(r => `${r.slice(0, 8)}...${r.slice(-4)}`).join(', ')}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(award.created_at * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
