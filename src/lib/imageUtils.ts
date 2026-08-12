/**
 * Shared image URL helpers for fast-loading thumbnails.
 *
 * Blossom servers and nostr.build support server-side resizing via query
 * params (`w`, `q`). Using a small width for grid thumbnails dramatically
 * cuts download size vs. loading the original file.
 */

const RESIZE_HOSTS = [
  'nostr.build',
  'satellite.earth',
  'void.cat',
  'nostrcheck.me',
  'nostr.hu',
  'blossom.band',
];

/** Hosts that must NOT get resize params (they fail or ignore them). */
const NO_RESIZE_HOSTS = [
  'primal.net',
];

/**
 * Primal's Blossom storage (blossom.primal.net → r2a.primal.net) ignores
 * resize query params and serves the full original file. These hosts are
 * routed through the Weserv image proxy (images.weserv.nl) to get a small
 * WebP thumbnail instead of a multi-megabyte original.
 */
const PRIMAL_HOSTS = ['blossom.primal.net', 'r2a.primal.net', '.primal.net'];

/** Public imgproxy — resizes remote images; no key required. */
const WESERV = 'https://images.weserv.nl/';

function isPrimalHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return PRIMAL_HOSTS.some((h) => hostname.includes(h));
  } catch {
    return false;
  }
}

/**
 * Generate a small (WebP) thumbnail URL for a marketplace grid cell.
 *
 * Uses the smallest reliable path for each host:
 *  - primal.net images  → Weserv proxy resized to ~520px WebP (original can be
 *    several MB; proxied thumbnail is typically ~10–40 KB).
 *  - hosts with native  → existing `w`/`q` param resize.
 *    resize support
 *  - everything else    → original URL untouched.
 *
 * Returns the original URL on any error so a broken call never drops an image.
 */
export function getGridThumbUrl(url: string, width = 520, quality = 72): string {
  if (!url) return url;
  try {
    if (isPrimalHost(url)) {
      const u = new URL(WESERV);
      u.searchParams.set('url', url);
      u.searchParams.set('w', String(width));
      u.searchParams.set('q', String(quality));
      u.searchParams.set('output', 'webp');
      return u.toString();
    }
    return getThumbnailUrl(url, width, quality);
  } catch {
    return url;
  }
}

export function isResizableHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    if (NO_RESIZE_HOSTS.some((h) => hostname.includes(h))) return false;
    return RESIZE_HOSTS.some((h) => hostname.includes(h));
  } catch {
    return false;
  }
}

/**
 * Return a resized thumbnail URL (default 400px wide) for hosts that
 * support it. For everything else the original URL is returned untouched.
 */
export function getThumbnailUrl(url: string, width = 400, quality = 70): string {
  if (!url) return url;
  try {
    if (!isResizableHost(url)) return url;
    const urlObj = new URL(url);
    if (!urlObj.searchParams.has('w')) urlObj.searchParams.set('w', String(width));
    if (!urlObj.searchParams.has('q') && !urlObj.hostname.includes('nostr.build')) {
      urlObj.searchParams.set('q', String(quality));
    }
    return urlObj.toString();
  } catch {
    return url;
  }
}