import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useAllReviews } from '@/hooks/useAllReviews';
import { useTrips } from '@/hooks/useTrips';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Play, Pause, Settings, Info, MapPin, Camera, BookOpen, Zap, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

/**
 * TravelBot - Automated Content Curator
 * 
 * Similar to the Thai Siamstr bot, this bot:
 * 1. Monitors new content on TravelTelly (reviews, stories, trips)
 * 2. Periodically posts curated collections with hashtags #travel #photography
 * 3. Uses proof-of-work (PoW) nonce for visibility
 * 4. Posts to Nostr with nevent links
 */

interface BotConfig {
  enabled: boolean;
  intervalMinutes: number;
  postsPerBatch: number;
  minTimeBetweenPosts: number; // minutes
  hashtags: string[];
  powDifficulty: number; // Target difficulty for PoW
}

interface BotStats {
  totalPosts: number;
  lastPostTime: number | null;
  nextPostTime: number | null;
  currentNonce: number;
}

const DEFAULT_CONFIG: BotConfig = {
  enabled: false,
  intervalMinutes: 120, // 2 hours
  postsPerBatch: 10,
  minTimeBetweenPosts: 30,
  hashtags: ['travel', 'photography', 'traveltelly'],
  powDifficulty: 21, // Similar to the Thai bot example
};

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

export function TravelBot() {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();

  // Fetch content
  const { data: reviews = [] } = useAllReviews();
  const { data: trips = [] } = useTrips();
  
  // Fetch stories (kind 30023)
  const { data: stories = [] } = useQuery({
    queryKey: ['bot-stories'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const events = await nostr.query([{
        kinds: [30023],
        '#t': ['traveltelly'],
        limit: 100,
      }], { signal });
      return events.sort((a, b) => b.created_at - a.created_at);
    },
  });

  // Bot state
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<BotStats>({
    totalPosts: 0,
    lastPostTime: null,
    nextPostTime: null,
    currentNonce: 0,
  });
  const [isPosting, setIsPosting] = useState(false);

  // Admin check
  const isAdmin = user?.pubkey === nip19.decode(ADMIN_NPUB).data;

  /**
   * Calculate proof-of-work nonce
   * Inspired by the Thai bot's nonce mining
   */
  const mineNonce = async (event: Partial<NostrEvent>, targetDifficulty: number): Promise<string> => {
    let nonce = 0;
    const maxIterations = 1000000;

    while (nonce < maxIterations) {
      const testEvent = {
        ...event,
        tags: [...(event.tags || []), ['nonce', nonce.toString(), targetDifficulty.toString()]],
      };

      const serialized = JSON.stringify([
        0,
        testEvent.pubkey,
        testEvent.created_at,
        testEvent.kind,
        testEvent.tags,
        testEvent.content,
      ]);

      const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(serialized));
      const hashArray = Array.from(new Uint8Array(hash));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      const id = hashHex;

      // Count leading zeros in binary representation
      let leadingZeros = 0;
      for (const char of id) {
        const num = parseInt(char, 16);
        if (num === 0) {
          leadingZeros += 4;
        } else {
          leadingZeros += Math.clz32(num) - 28;
          break;
        }
      }

      if (leadingZeros >= targetDifficulty) {
        return nonce.toString();
      }

      nonce++;
    }

    return '0'; // Fallback
  };

  /**
   * Create bot post with curated content
   */
  const createBotPost = async () => {
    if (!user) return;

    setIsPosting(true);

    try {
      // Get recent content (last 24 hours)
      const now = Math.floor(Date.now() / 1000);
      const oneDayAgo = now - 86400;

      const recentContent = [
        ...reviews.filter(r => r.created_at > oneDayAgo),
        ...stories.filter(s => s.created_at > oneDayAgo),
        ...trips.filter(t => t.created_at > oneDayAgo),
      ].sort((a, b) => b.created_at - a.created_at);

      if (recentContent.length === 0) {
        toast({
          title: 'No Recent Content',
          description: 'No new posts in the last 24 hours to share',
          variant: 'destructive',
        });
        setIsPosting(false);
        return;
      }

      // Select top posts (up to config.postsPerBatch)
      const selectedPosts = recentContent.slice(0, config.postsPerBatch);

      // Extract images and create enhanced references
      const imageUrls: string[] = [];
      const allTags: string[][] = [];

      const neventLinks = selectedPosts.map((event) => {
        const nevent = nip19.neventEncode({
          id: event.id,
          author: event.pubkey,
          kind: event.kind,
        });

        // Create naddr for addressable events
        const dTag = event.tags.find(([name]) => name === 'd')?.[1];
        const naddr = dTag ? nip19.naddrEncode({
          kind: event.kind,
          pubkey: event.pubkey,
          identifier: dTag,
        }) : null;

        // Extract title for better display
        const title = event.tags.find(([name]) => name === 'title')?.[1];
        
        // Extract image URL from event
        const imageTag = event.tags.find(([name]) => name === 'image')?.[1];
        if (imageTag && !imageUrls.includes(imageTag)) {
          imageUrls.push(imageTag);
        }

        // Generate TravelTelly URL based on event kind
        let traveltellyUrl = '';
        if (event.kind === 34879 && naddr) {
          // Review
          traveltellyUrl = `https://www.traveltelly.com/review/${naddr}`;
        } else if (event.kind === 30023 && naddr) {
          // Story
          traveltellyUrl = `https://www.traveltelly.com/story/${naddr}`;
        } else if (event.kind === 30025 && naddr) {
          // Trip
          traveltellyUrl = `https://www.traveltelly.com/trip/${naddr}`;
        }
        
        // Create reference with title if available
        let reference = `nostr:${nevent}`;
        if (title) {
          reference = `${title}\n${reference}`;
        }
        if (traveltellyUrl) {
          reference += `\n${traveltellyUrl}`;
        }
        
        return reference;
      }).join('\n\n');

      // Build bot message without post number
      const greeting = getTimeBasedGreeting();
      
      // Add first image to content (Nostr standard for kind 1)
      const imageInContent = imageUrls.length > 0 ? `\n${imageUrls[0]}\n` : '';
      
      const content = `[BOT]
${greeting} TravelBot has curated posts you might have missed!
${imageInContent}
${neventLinks}

${config.hashtags.map(tag => `#${tag}`).join(' ')}`;

      // Create tags with images and URLs
      const baseTags = config.hashtags.map(tag => ['t', tag]);
      
      // Add image tags (for NIP-92 compatibility)
      imageUrls.forEach(url => {
        baseTags.push(['image', url]);
        baseTags.push(['imeta', `url ${url}`]);
      });

      // Add website URL
      baseTags.push(['r', 'https://www.traveltelly.com', 'web']);

      // Create event with PoW
      const baseEvent = {
        kind: 1,
        content,
        created_at: now,
        pubkey: user.pubkey,
        tags: baseTags,
      };

      // Mine nonce
      toast({
        title: 'Mining Proof-of-Work...',
        description: `Target difficulty: ${config.powDifficulty}`,
      });

      const nonce = await mineNonce(baseEvent, config.powDifficulty);

      // Add nonce tag
      const finalEvent = {
        ...baseEvent,
        tags: [
          ...baseEvent.tags,
          ['nonce', nonce, config.powDifficulty.toString()],
        ],
      };

      // Sign and publish
      const signedEvent = await user.signer.signEvent(finalEvent);
      await nostr.event(signedEvent, { signal: AbortSignal.timeout(5000) });

      // Update stats
      setStats(prev => ({
        totalPosts: prev.totalPosts + 1,
        lastPostTime: now,
        nextPostTime: now + (config.intervalMinutes * 60),
        currentNonce: parseInt(nonce),
      }));

      toast({
        title: '🤖 Bot Post Published!',
        description: `Shared ${selectedPosts.length} curated posts with ${imageUrls.length} images`,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to post',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  /**
   * Get greeting based on time of day
   */
  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    
    if (hour < 12) return 'Good morning! ☀️';
    if (hour < 18) return 'Good afternoon! 🌤️';
    return 'Good evening! 🌙';
  };

  /**
   * Auto-post scheduler
   */
  useEffect(() => {
    if (!config.enabled || !isAdmin) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      
      // Check if it's time to post
      if (stats.nextPostTime && now >= stats.nextPostTime) {
        createBotPost();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [config.enabled, stats.nextPostTime, isAdmin]);

  if (!user) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            Please login with Nostr to access TravelBot
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl py-8">
        <Alert>
          <Bot className="h-4 w-4" />
          <AlertDescription>
            TravelBot is admin-only. Contact the site admin for access.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalContent = reviews.length + stories.length + trips.length;
  const recentContent = [
    ...reviews.filter(r => r.created_at > Math.floor(Date.now() / 1000) - 86400),
    ...stories.filter(s => s.created_at > Math.floor(Date.now() / 1000) - 86400),
    ...trips.filter(t => t.created_at > Math.floor(Date.now() / 1000) - 86400),
  ];

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      {/* Back Button */}
      <Link to="/admin">
        <Button variant="outline" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Button>
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">TravelBot</h1>
            <p className="text-muted-foreground">Automated Content Curator for #travel #photography</p>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Alert className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
        <Info className="h-4 w-4" />
        <AlertTitle>How TravelBot Works</AlertTitle>
        <AlertDescription className="space-y-2 mt-2">
          <p>
            TravelBot automatically curates and shares the best travel content from TravelTelly:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Monitors reviews, stories, and trips from the last 24 hours</li>
            <li>Posts curated collections with nevent links every {config.intervalMinutes} minutes</li>
            <li>Uses proof-of-work (difficulty {config.powDifficulty}) for visibility</li>
            <li>Always includes #travel #photography #traveltelly hashtags</li>
            <li>Similar to the Thai Siamstr bot pattern</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Available Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContent}</div>
            <p className="text-xs text-muted-foreground">{recentContent.length} in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.lastPostTime 
                ? new Date(stats.lastPostTime * 1000).toLocaleString()
                : 'Never'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Post</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {stats.nextPostTime && config.enabled
                ? new Date(stats.nextPostTime * 1000).toLocaleString()
                : 'Disabled'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Bot Configuration
          </CardTitle>
          <CardDescription>
            Configure automated posting schedule and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable TravelBot</Label>
              <p className="text-sm text-muted-foreground">
                Automatically post curated content
              </p>
            </div>
            <Switch
              checked={config.enabled}
              onCheckedChange={(enabled) => setConfig({ ...config, enabled })}
            />
          </div>

          <Separator />

          {/* Interval */}
          <div className="space-y-2">
            <Label>Post Interval (minutes)</Label>
            <Input
              type="number"
              min={30}
              max={1440}
              value={config.intervalMinutes}
              onChange={(e) => setConfig({ ...config, intervalMinutes: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              How often to post (minimum 30 minutes)
            </p>
          </div>

          {/* Posts per batch */}
          <div className="space-y-2">
            <Label>Posts Per Batch</Label>
            <Input
              type="number"
              min={5}
              max={20}
              value={config.postsPerBatch}
              onChange={(e) => setConfig({ ...config, postsPerBatch: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Number of posts to include in each bot message
            </p>
          </div>

          {/* PoW Difficulty */}
          <div className="space-y-2">
            <Label>Proof-of-Work Difficulty</Label>
            <Input
              type="number"
              min={0}
              max={30}
              value={config.powDifficulty}
              onChange={(e) => setConfig({ ...config, powDifficulty: parseInt(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">
              Mining difficulty (21 recommended, 0 to disable)
            </p>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags</Label>
            <Input
              value={config.hashtags.join(', ')}
              onChange={(e) => setConfig({ 
                ...config, 
                hashtags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
              })}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated hashtags (always included: travel, photography)
            </p>
          </div>

          {/* Manual post */}
          <Separator />

          <div className="flex gap-2">
            <Button
              onClick={createBotPost}
              disabled={isPosting || recentContent.length === 0}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              {isPosting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Post Now
                </>
              )}
            </Button>
          </div>

          {recentContent.length === 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                No content from the last 24 hours. Bot will wait for new posts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Content Available</CardTitle>
          <CardDescription>
            Posts from the last 24 hours that can be curated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <MapPin className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {reviews.filter(r => r.created_at > Math.floor(Date.now() / 1000) - 86400).length}
                </div>
                <div className="text-sm text-muted-foreground">Reviews</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stories.filter(s => s.created_at > Math.floor(Date.now() / 1000) - 86400).length}
                </div>
                <div className="text-sm text-muted-foreground">Stories</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Camera className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  {trips.filter(t => t.created_at > Math.floor(Date.now() / 1000) - 86400).length}
                </div>
                <div className="text-sm text-muted-foreground">Trips</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Status */}
      <Card className={config.enabled ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.enabled ? (
              <>
                <Play className="h-5 w-5 text-green-600" />
                Bot Active
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 text-gray-600" />
                Bot Paused
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {config.enabled ? (
            <div className="space-y-2 text-sm">
              <p className="text-green-700">
                ✅ TravelBot is running and will automatically post every {config.intervalMinutes} minutes
              </p>
              <p className="text-muted-foreground">
                Next post scheduled for: {stats.nextPostTime 
                  ? new Date(stats.nextPostTime * 1000).toLocaleString()
                  : 'Waiting for schedule...'
                }
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Bot is paused. Enable it above to start automatic posting.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Example Output */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm">Example Bot Post</CardTitle>
        </CardHeader>
        <CardContent className="font-mono text-xs space-y-2">
          <p>[BOT]</p>
          <p>{getTimeBasedGreeting()} TravelBot has curated posts you might have missed!</p>
          <br />
          <p className="text-blue-600">https://example.com/image.jpg (image preview)</p>
          <br />
          <p className="font-semibold">Review of Rung Aroon Coffee Bar - 5 stars</p>
          <p className="text-blue-600">nostr:nevent1...</p>
          <p className="text-blue-600">https://www.traveltelly.com/review/...</p>
          <br />
          <p className="font-semibold">Journey through Thailand</p>
          <p className="text-blue-600">nostr:nevent1...</p>
          <p className="text-blue-600">https://www.traveltelly.com/story/...</p>
          <br />
          <p>#travel #photography #traveltelly</p>
          <br />
          <p className="text-muted-foreground italic">
            (With PoW nonce + images + clickable links)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
