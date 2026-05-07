import { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import {
  Award, Medal, Globe, Camera, Sparkles, Users, Search,
  Loader2, Send, CheckCircle2, AlertCircle, Crown, Trash2
} from 'lucide-react';

// --- Badge category data from the uploaded design ---
export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  tiers: string[];
  category: string;
  categoryColor: string;
}

const BADGE_CATEGORIES = [
  {
    id: 'explorer',
    emoji: '🌍',
    color: '#FF6B35',
    accent: '#FFD23F',
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
    accent: '#E040FB',
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
    accent: '#90E0EF',
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
    accent: '#69F0AE',
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
    accent: '#FFBE0B',
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

// Flatten all badge definitions
const ALL_BADGES: BadgeDef[] = BADGE_CATEGORIES.flatMap(cat =>
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

// NIP-58 kinds
const BADGE_DEFINITION_KIND = 30009;
const BADGE_AWARD_KIND = 8;

function buildBadgeAddr(adminPubkey: string, badgeId: string): string {
  return `${BADGE_DEFINITION_KIND}:${adminPubkey}:${badgeId}`;
}

/**
 * Admin Badge Manager
 * - Define/publish badges (kind 30009)
 * - Award badges to users (kind 8)
 * - View award history
 */
export function AdminBadgeManager() {
  const { nostr } = useNostr();
  const { mutate: publishEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const [activeCategory, setActiveCategory] = useState('explorer');
  const [recipientNpub, setRecipientNpub] = useState('');
  const [awardingBadgeId, setAwardingBadgeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch existing badge definitions published by admin
  const { data: definedBadges = [], isLoading: loadingDefs } = useQuery({
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
        return { id: d, name, description, image, event: e };
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

  const definedIds = useMemo(() => new Set(definedBadges.map(b => b.id)), [definedBadges]);

  const activeCat = BADGE_CATEGORIES.find(c => c.id === activeCategory);

  const filteredBadges = useMemo(() => {
    if (!searchQuery.trim()) return ALL_BADGES;
    const q = searchQuery.toLowerCase();
    return ALL_BADGES.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.description.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Publish a badge definition (kind 30009)
  const handleDefineBadge = (badge: BadgeDef) => {
    if (definedIds.has(badge.id)) {
      toast({ title: 'Badge already defined', description: `"${badge.name}" is already published.`, variant: 'destructive' });
      return;
    }

    publishEvent({
      kind: BADGE_DEFINITION_KIND,
      content: '',
      tags: [
        ['d', badge.id],
        ['name', badge.name],
        ['description', badge.description],
        // Include tiers in description or as custom tags
        ...badge.tiers.map((t, i) => ['t', t] as [string, string]),
      ],
    }, {
      onSuccess: () => {
        toast({ title: 'Badge defined!', description: `"${badge.name}" is now published on Nostr.` });
      },
      onError: (err: Error) => {
        toast({ title: 'Failed to define badge', description: err.message, variant: 'destructive' });
      },
    });
  };

  // Award a badge to a user (kind 8)
  const handleAwardBadge = (badgeId: string) => {
    const npub = recipientNpub.trim();
    if (!npub) {
      toast({ title: 'Enter recipient npub', description: 'Paste the user\'s npub or pubkey.', variant: 'destructive' });
      return;
    }

    // Decode npub to hex pubkey if needed
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
      toast({ title: 'Invalid npub', description: 'Please enter a valid npub or 64-char hex pubkey.', variant: 'destructive' });
      return;
    }

    // Must have the badge defined first
    if (!definedIds.has(badgeId)) {
      toast({ title: 'Badge not defined', description: 'Define the badge first before awarding it.', variant: 'destructive' });
      return;
    }

    // Use admin's pubkey for the badge definition addr
    const adminPubkey = user?.pubkey || '';
    if (!adminPubkey) {
      toast({ title: 'Not logged in', description: 'You must be logged in as admin to award badges.', variant: 'destructive' });
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
        toast({ title: 'Badge awarded!', description: `Sent to npub...${recipientPubkey.slice(-8)}` });
        setAwardingBadgeId(null);
        setRecipientNpub('');
      },
      onError: (err: Error) => {
        toast({ title: 'Award failed', description: err.message, variant: 'destructive' });
      },
    });
  };

  // Define ALL badges at once
  const handleDefineAll = () => {
    const unpublished = ALL_BADGES.filter(b => !definedIds.has(b.id));
    if (unpublished.length === 0) {
      toast({ title: 'All badges defined', description: 'Every badge is already published.' });
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
            ...badge.tiers.map((t) => ['t', t] as [string, string]),
          ],
        });
      }, i * 300);
    });

    toast({ title: `Defining ${unpublished.length} badges...`, description: 'Publishing to Nostr in batches.' });
  };

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
            Define NIP-58 badges and award them to TravelTelly users. Badges are published on Nostr and appear on user profiles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleDefineAll}
              disabled={isPublishing}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Define All Badges
            </Button>
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {definedBadges.length} / {ALL_BADGES.length} published
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="catalogue" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="catalogue" className="flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> Catalogue
          </TabsTrigger>
          <TabsTrigger value="award" className="flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Award
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1.5">
            <Crown className="w-4 h-4" /> History
          </TabsTrigger>
        </TabsList>

        {/* --- CATALOGUE TAB --- */}
        <TabsContent value="catalogue" className="mt-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search badges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category pills */}
          {!searchQuery && (
            <div className="flex flex-wrap gap-2">
              {BADGE_CATEGORIES.map(cat => (
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
            </div>
          )}

          {/* Badge grid */}
          <div className="grid gap-3">
            {(searchQuery ? filteredBadges : activeCat?.badges || []).map((badge) => {
              const isDefined = definedIds.has(badge.id);
              const fullBadge = ALL_BADGES.find(b => b.id === badge.id)!;
              return (
                <Card key={badge.id} className={`overflow-hidden transition-all ${isDefined ? 'border-green-300 dark:border-green-800' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: `${fullBadge.categoryColor}18` }}
                      >
                        {badge.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold">{badge.name}</h3>
                          {isDefined && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{badge.desc}</p>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {badge.tiers.map((tier: string, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs font-medium border"
                              style={{
                                background: i === 0 ? '#CD7F3215' : i === 1 ? '#C0C0C015' : i === 2 ? '#FFD70015' : `${fullBadge.categoryColor}15`,
                                borderColor: i === 0 ? '#CD7F3240' : i === 1 ? '#C0C0C040' : i === 2 ? '#FFD70040' : `${fullBadge.categoryColor}40`,
                                color: i === 0 ? '#CD7F32' : i === 1 ? '#888' : i === 2 ? '#D4A017' : fullBadge.categoryColor,
                              }}
                            >
                              {tier}
                            </span>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={isDefined ? 'outline' : 'default'}
                            className="text-xs rounded-full"
                            disabled={isDefined || isPublishing}
                            onClick={() => handleDefineBadge(fullBadge)}
                          >
                            {isDefined ? 'Defined' : <><Sparkles className="w-3 h-3 mr-1" /> Define on Nostr</>}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs rounded-full"
                            onClick={() => {
                              setAwardingBadgeId(badge.id);
                              // Switch to award tab
                              const tab = document.querySelector('[data-state="inactive"][value="award"]') as HTMLButtonElement;
                              tab?.click();
                            }}
                          >
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

        {/* --- AWARD TAB --- */}
        <TabsContent value="award" className="mt-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Send className="w-4 h-4" />
                Award a Badge
              </CardTitle>
              <CardDescription>
                Enter a user's npub and select a badge to award them. The badge must be defined first.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Recipient (npub or hex pubkey)</Label>
                <Input
                  placeholder="npub1... or 64-char hex"
                  value={recipientNpub}
                  onChange={(e) => setRecipientNpub(e.target.value)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Select Badge</Label>
                <div className="grid gap-2 max-h-80 overflow-y-auto">
                  {ALL_BADGES.map((badge) => {
                    const isDefined = definedIds.has(badge.id);
                    const isSelected = awardingBadgeId === badge.id;
                    return (
                      <button
                        key={badge.id}
                        onClick={() => setAwardingBadgeId(badge.id)}
                        disabled={!isDefined}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                          isSelected ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/30' : 'border-border hover:border-muted-foreground'
                        } ${!isDefined ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-xl">{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{badge.name}</div>
                          <div className="text-xs text-muted-foreground">{badge.category}</div>
                        </div>
                        {!isDefined && (
                          <Badge variant="outline" className="text-xs">Not defined</Badge>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full rounded-full"
                disabled={!awardingBadgeId || !recipientNpub.trim() || isPublishing}
                onClick={() => awardingBadgeId && handleAwardBadge(awardingBadgeId)}
              >
                {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Award className="w-4 h-4 mr-2" />}
                Award Badge
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- HISTORY TAB --- */}
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
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentAwards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No badges awarded yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentAwards.map((award, i) => {
                    const badge = ALL_BADGES.find(b => b.id === award.badgeId);
                    return (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <div className="text-xl">{badge?.icon || '🏅'}</div>
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
