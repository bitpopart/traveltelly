import { nip19 } from 'nostr-tools';

/**
 * Convert a hex pubkey to npub format
 */
export function hexToNpub(hexPubkey: string): string {
  try {
    return nip19.npubEncode(hexPubkey);
  } catch (error) {
    console.error('Error encoding npub:', error);
    return hexPubkey;
  }
}

/**
 * Get a shortened version of an npub for display
 */
export function getShortNpub(hexPubkey: string): string {
  try {
    const npub = nip19.npubEncode(hexPubkey);
    return `${npub.slice(0, 8)}...${npub.slice(-8)}`;
  } catch (error) {
    console.error('Error creating short npub:', error);
    return `npub...${hexPubkey.slice(-8)}`;
  }
}

/**
 * Get the full npub for copying
 */
export function getFullNpub(hexPubkey: string): string {
  try {
    return nip19.npubEncode(hexPubkey);
  } catch (error) {
    console.error('Error encoding full npub:', error);
    return hexPubkey;
  }
}

/**
 * Normalizes a category string by removing accents and converting to lowercase
 * Example: "Café" -> "cafe"
 */
export function normalizeCategory(category: string): string {
  return category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gets the emoji for a category, handling both accented and non-accented versions
 */
export function getCategoryEmoji(category: string, categoryEmojis: Record<string, string>): string {
  const normalized = normalizeCategory(category);
  return categoryEmojis[normalized] || categoryEmojis[category] || '📍';
}

/**
 * Generate a URL-friendly slug from a title.
 * Example: "Café de Flore, Paris 🇫🇷" -> "cafe-de-flore-paris"
 */
export function generateSlug(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[\p{Emoji}\p{Emoji_Modifier}\p{Emoji_Component}\u200d\ufe0f]/gu, '') // Remove emoji
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Keep only alphanumeric, spaces, hyphens
    .trim()
    .replace(/\s+/g, '-') // Spaces to hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, '') // Trim leading/trailing hyphens
    .slice(0, 60); // Max 60 chars
}

/**
 * Generate a unique review slug from a title, appending a short suffix to prevent collisions.
 * Example: "Café de Flore" -> "cafe-de-flore-x7k"
 */
export function generateReviewSlug(title: string): string {
  const base = generateSlug(title);
  const suffix = Math.random().toString(36).substring(2, 5); // 3-char random suffix
  return base ? `${base}-${suffix}` : `review-${suffix}`;
}

/**
 * Check if a string looks like an naddr identifier
 */
export function isNaddr(str: string): boolean {
  return str.startsWith('naddr1');
}

/**
 * Extract a display-friendly slug from an existing review d-tag.
 * For new slug-format d-tags: return as-is (e.g. "cafe-de-flore-x7k")
 * For old format d-tags: extract what we can (e.g. "review-1779196698207-mbfnk4cke" -> "review-mbfnk4cke")
 */
export function getReviewSlug(dTag: string): string {
  return dTag;
}