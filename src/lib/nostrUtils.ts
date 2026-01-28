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