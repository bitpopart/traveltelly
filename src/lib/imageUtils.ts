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
];

/** Hosts that must NOT get resize params (they fail or ignore them). */
const NO_RESIZE_HOSTS = [
  'primal.net',
];

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