/**
 * adminBulkDownload.ts
 *
 * Fetches multiple marketplace photos, embeds XMP/EXIF metadata into each
 * JPEG, then bundles them into a single ZIP file and triggers a browser download.
 */
import JSZip from 'jszip';
import { embedMetadataIntoJpeg } from './imageMetadataWriter';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

export interface BulkDownloadProgress {
  total: number;
  done: number;
  current: string;
}

export async function adminBulkDownload(
  products: MarketplaceProduct[],
  onProgress?: (p: BulkDownloadProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const total = products.length;

  // Track filenames to avoid collisions (e.g. two photos with the same title)
  const usedNames = new Map<string, number>();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imageUrl = product.images[0];

    onProgress?.({ total, done: i, current: product.title });

    if (!imageUrl) continue; // skip products without an image

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });

      // Extract `t` tags as keywords
      const keywords = product.event.tags
        .filter(([name]) => name === 't')
        .map(([, val]) => val)
        .filter(Boolean);

      const enrichedBlob = await embedMetadataIntoJpeg(file, {
        title: product.title,
        description: product.description,
        keywords,
      });

      // Build a unique, safe filename
      const base = product.title
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .toLowerCase()
        .slice(0, 60);

      const count = usedNames.get(base) ?? 0;
      usedNames.set(base, count + 1);
      const filename = count === 0 ? `${base}.jpg` : `${base}_${count + 1}.jpg`;

      zip.file(filename, enrichedBlob);
    } catch (err) {
      console.error(`[BulkDownload] Failed for "${product.title}":`, err);
      // Continue with remaining files; don't abort the whole batch
    }
  }

  onProgress?.({ total, done: total, current: '' });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traveltelly_photos_${Date.now()}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
