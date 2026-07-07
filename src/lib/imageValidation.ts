/**
 * Shared image URL validation utilities.
 *
 * The allowed-domain list is intentionally broad so that images hosted on any
 * legitimate Blossom / Nostr CDN are accepted. The only hard requirements are:
 *   1. Must be an https:// URL
 *   2. Must NOT be a video file
 *   3. Must NOT match known placeholder patterns
 *
 * We deliberately do NOT maintain a strict domain whitelist here — that
 * approach caused real images from valid hosts to be silently dropped.
 */

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv'];

const PLACEHOLDER_PATTERNS = [
  '/placeholder',
  'placeholder.com',
  'via.placeholder',
  'placehold.it',
  'example.com',
  'localhost',
  'data:image',
  'blob:',
  'picsum.photos',
  'unsplash.it',
  'dummyimage.com',
  'fakeimg.pl',
  'loremflickr.com',
];

/**
 * Validates an image URL for use in grids and thumbnails.
 *
 * - Requires https://
 * - Rejects video file extensions
 * - Rejects known placeholder services
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('https://')) return false;

  const lo = url.toLowerCase();

  if (VIDEO_EXTENSIONS.some(ext => lo.includes(ext))) return false;
  if (PLACEHOLDER_PATTERNS.some(p => lo.includes(p))) return false;

  return true;
}

/**
 * Same as isValidImageUrl but also accepts http:// (for legacy content).
 */
export function isValidImageUrlLoose(url: string | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;

  const lo = url.toLowerCase();

  if (VIDEO_EXTENSIONS.some(ext => lo.includes(ext))) return false;
  if (PLACEHOLDER_PATTERNS.some(p => lo.includes(p))) return false;

  return true;
}
