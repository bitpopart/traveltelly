/**
 * AdminMapPinBackfill
 * ────────────────────
 * Scans existing kind 34879 photo pins that became world-map pins
 * (have a `type=pin` tag, an `image` and a `g` geohash) and publishes a
 * companion NIP-99 marketplace listing (kind 30402) at the default $0.99 USD
 * price for any that aren't already listed.
 *
 * Why an admin action: a backfill must be signed by an authorized uploader,
 * and the server/agent key is not an authorized uploader for /marketplace.
 * These listings are therefore signed by the logged-in admin in the browser
 * (Mirror of AdminMassUpload's signer flow), one signature per listing.
 *
 * Dedup: a review is treated as "already listed" when an existing 30402
 * listing (from authorized uploaders) carries the same `d` value
 * (`map_pin_<review-slug>`), references the review via a `review` tag, or
 * already contains the review's primary image URL. Re-publishing with the
 * same `d` value is a no-op replace (addressable event), so the run is
 * idempotent.
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostr } from '@nostrify/react';
import { useToast } from '@/hooks/useToast';
import { ADMIN_HEX } from '@/hooks/useBlossomMedia';
import type { NostrEvent } from '@nostrify/nostrify';
import { History, Store, Loader2, RefreshCw, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

const REVIEW_KIND = 34879;
const PRODUCT_KIND = 30402;
const DEFAULT_SALE_PRICE = '0.99';
const DEFAULT_SALE_CURRENCY = 'USD';

interface PinReview {
  event: NostrEvent;
  slug: string;
  title: string;
  description: string;
  category: string;
  location?: string;
  images: string[];
  geohash?: string;
}

function isAuthNostrEvent(e: NostrEvent): e is NostrEvent {
  return Boolean(e && e.tags);
}

function collectReviewImages(event: NostrEvent): string[] {
  const urls: string[] = [];
  for (const tag of event.tags) {
    if (tag?.[0] === 'image' && tag[1]?.startsWith('http')) urls.push(tag[1]);
  }
  return urls;
}

function collectListingImages(event: NostrEvent): string[] {
  const urls: string[] = [];
  for (const tag of event.tags) {
    if (tag?.[0] === 'image' && tag[1]?.startsWith('http')) urls.push(tag[1]);
  }
  return urls;
}

function reviewToPin(event: NostrEvent): PinReview | null {
  const slug = event.tags.find(([n]) => n === 'd')?.[1];
  const title = event.tags.find(([n]) => n === 'title')?.[1];
  const category = event.tags.find(([n]) => n === 'category')?.[1];
  const images = collectReviewImages(event);
  const geohash = event.tags.find(([n]) => n === 'g')?.[1];
  if (!slug || !title || images.length === 0 || !geohash) return null;
  return {
    event,
    slug,
    title,
    description: event.tags.find(([n]) => n === 'description')?.[1] ?? event.content ?? '',
    category: category ?? 'Travel',
    location: event.tags.find(([n]) => n === 'location')?.[1] ?? undefined,
    images,
    geohash,
  };
}

export function AdminMapPinBackfill() {
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { toast } = useToast();

  const [scanning, setScanning] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [candidates, setCandidates] = useState<PinReview[]>([]);
  const [skipped, setSkipped] = useState(0);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ published: number; failed: number } | null>(null);
  const [lastScan, setLastScan] = useState<number | null>(null);

  const isAdmin = user?.pubkey === ADMIN_HEX;

  const runScan = useCallback(async () => {
    if (!nostr) return;
    setScanning(true);
    setCandidates([]);
    setResult(null);
    try {
      const signal = AbortSignal.timeout(30000);
      const [reviews, existing] = await Promise.all([
        nostr.query([{ kinds: [REVIEW_KIND], limit: 5000 }], { signal }),
        nostr.query([{ kinds: [PRODUCT_KIND], limit: 5000 }], { signal }),
      ]);

      const validReviews = reviews.filter(isAuthNostrEvent);
      const validProducts = existing.filter(isAuthNostrEvent);

      // Existing listing fingerprints for dedup
      const existingD = new Set<string>();
      const existingReviewRefs = new Set<string>();
      const existingImageUrls = new Set<string>();
      for (const p of validProducts) {
        const d = p.tags.find(([n]) => n === 'd')?.[1];
        if (d) existingD.add(d);
        const reviewRef = p.tags.find(([n]) => n === 'review')?.[1];
        if (reviewRef) existingReviewRefs.add(reviewRef);
        for (const u of collectListingImages(p)) existingImageUrls.add(u);
      }

      const pins: PinReview[] = [];
      let skipCount = 0;
      for (const ev of validReviews) {
        // Only backfill actual world-map PIN photos. Travel REVIEWS (kind 34879
        // without `type=pin`) belong to /reviews and are not for sale, so they
        // must never be listed on /marketplace.
        if (ev.tags.find(([n]) => n === 'type')?.[1] !== 'pin') continue;
        const pin = reviewToPin(ev);
        if (!pin) continue;
        const expectedD = `map_pin_${pin.slug}`;
        const alreadyListed =
          existingD.has(expectedD) ||
          existingReviewRefs.has(pin.slug) ||
          pin.images.some((u) => existingImageUrls.has(u));
        if (alreadyListed) {
          skipCount++;
          continue;
        }
        pins.push(pin);
      }

      pins.sort((a, b) => b.event.created_at - a.event.created_at);
      setCandidates(pins);
      setSkipped(skipCount);
      setLastScan(Date.now());
    } catch (error) {
      console.error('Backfill scan error:', error);
      toast({ title: 'Scan failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  }, [nostr, toast]);

  const runBackfill = useCallback(async () => {
    if (!user?.signer || !nostr || candidates.length === 0) return;
    setPublishing(true);
    setProgress(0);
    setResult(null);

    let published = 0;
    let failed = 0;
    try {
      for (let i = 0; i < candidates.length; i++) {
        const pin = candidates[i];
        try {
          const productId = `map_pin_${pin.slug}`;
          const tags: string[][] = [
            ['d', productId],
            ['title', pin.title],
            ['summary', (pin.description || pin.title).slice(0, 200)],
            ['price', DEFAULT_SALE_PRICE, DEFAULT_SALE_CURRENCY],
            ['t', 'photos'],
            ['category', pin.category],
            // Self-describe as a PIN photo so /marketplace can tell pins apart
            // from (excluded) review photos without resolving the source event.
            ['type', 'pin'],
            ['status', 'active'],
            ['published_at', Math.floor(Date.now() / 1000).toString()],
          ];
          // Reference the source review for provenance + dedup
          tags.push(['review', pin.slug]);
          tags.push(['e', pin.event.id]);
          for (const u of pin.images) tags.push(['image', u]);
          if (pin.location) tags.push(['location', pin.location]);
          if (pin.geohash) tags.push(['g', pin.geohash]);

          // Add client tag (same convention as AdminMassUpload)
          if (location.protocol === 'https:' && !tags.some(([name]) => name === 'client')) {
            tags.push(['client', location.hostname]);
          }

          const event = await user.signer.signEvent({
            kind: PRODUCT_KIND,
            content: pin.description || '',
            tags,
            created_at: Math.floor(Date.now() / 1000),
          });
          await nostr.event(event, { signal: AbortSignal.timeout(10000) });
          published++;
        } catch (error) {
          console.error(`Backfill publish failed for ${pin.slug}:`, error);
          failed++;
        }
        setProgress(Math.round(((i + 1) / candidates.length) * 100));
      }
    } finally {
      setPublishing(false);
      setResult({ published, failed });
      // Clear candidates: successful ones are now on the relay and a re-scan
      // will skip them via dedup; failures (if any) will reappear as candidates.
      setCandidates([]);
      if (failed === 0) {
        toast({ title: 'Backfill complete', description: `${published} map-pin photos listed on the marketplace at $${DEFAULT_SALE_PRICE}.` });
      } else {
        toast({ title: 'Backfill finished with errors', description: `${published} published, ${failed} failed. Re-scan to retry the failures.`, variant: 'destructive' });
      }
    }
  }, [user, nostr, candidates, toast]);

  if (!isAdmin) return null;

  return (
    <Card className="mb-4 border-violet-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-violet-600" />
          <CardTitle>Backfill Pins → Marketplace</CardTitle>
        </div>
        <CardDescription>
          One-time pass that lists every world-map pin photo (kind 34879 reviews with a photo + GPS location) on /marketplace at
          <strong> ${DEFAULT_SALE_PRICE} USD</strong>. Scroll the map pins from before auto-listing landed, so your older photos also show up for sale.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={runScan} disabled={scanning || publishing} variant="outline" className="gap-2">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {scanning ? 'Scanning pins…' : 'Scan pins'}
          </Button>

          {candidates.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={publishing} className="gap-2 text-white" style={{ backgroundColor: '#ec1a58' }}>
                  <History className="w-4 h-4" />
                  {publishing ? 'Publishing…' : `Publish ${candidates.length} listings`}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>List {candidates.length} pin photos for sale?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will publish {candidates.length} marketplace listing{candidates.length === 1 ? '' : 's'} at ${DEFAULT_SALE_PRICE} USD
                    ({DEFAULT_SALE_CURRENCY}), each signed by your logged-in wallet/extension. Please approve the signature
                    requests. It is idempotent — running it again will not create duplicates.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={runBackfill} className="bg-pink-600 hover:bg-pink-700">Publish</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {publishing && (
            <div className="w-full">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Publishing… {progress}%</p>
            </div>
          )}

          {lastScan && !scanning && !publishing && candidates.length === 0 && (
            <Badge variant="outline" className="gap-1 text-green-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> No new pins to list ({skipped} already listed)
            </Badge>
          )}
        </div>

        {candidates.length > 0 && !publishing && (
          <ScrollArea className="h-56 rounded-lg border">
            <ul className="p-3 space-y-1 text-sm">
              {candidates.slice(0, 200).map((pin) => (
                <li key={pin.event.id} className="flex items-center gap-2 py-1 border-b last:border-0">
                  <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="truncate flex-1">{pin.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{pin.images.length} img · {pin.location || 'no location'}</span>
                </li>
              ))}
              {candidates.length > 200 && (
                <li className="py-1 text-xs text-muted-foreground text-center">
                  …and {candidates.length - 200} more
                </li>
              )}
            </ul>
          </ScrollArea>
        )}

        {candidates.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {candidates.length} pin photo{candidates.length === 1 ? '' : 's'} to backfill · {skipped} already present.
          </p>
        )}

        {result && (
          <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              {result.failed === 0
                ? `✅ Published ${result.published} listing${result.published === 1 ? '' : 's'}. They are now live on /marketplace.`
                : `${result.published} listed, ${result.failed} failed (see browser console).`}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
