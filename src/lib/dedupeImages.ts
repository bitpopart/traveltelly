export interface HasImage {
  image: string;
  type?: string;
}

/**
 * Dedupe a list of thumbnails by image URL, keeping the first occurrence but
 * preferring a non-marketplace entry when the same photo appears twice.
 *
 * Map pins (kind 34879) are auto-listed on /marketplace (kind 30402) with the
 * SAME image URL, so the homepage grid used to show the same photo twice —
 * once as the pin thumb and once as the marketplace thumb. `stock` is the
 * marketplace type; when a duplicate image is found and one entry is a
 * marketplace product, the non-marketplace one wins (the pin thumb stays).
 */
export function dedupeByImage<T extends HasImage>(items: T[]): T[] {
  const byImage = new Map<string, T>();
  for (const item of items) {
    const existing = byImage.get(item.image);
    if (!existing) {
      byImage.set(item.image, item);
      continue;
    }
    if (existing.type === 'stock' && item.type !== 'stock') {
      byImage.set(item.image, item);
    }
  }
  return Array.from(byImage.values());
}
