/**
 * trainingDataset.ts
 *
 * Builds a ZIP dataset of full-resolution marketplace photos for LLM / AI
 * model training. Every image is embedded with descriptive XMP/EXIF metadata
 * (title, description, keywords, location) and accompanied by a
 * machine-readable manifest (JSON + CSV) that maps each image filename to all
 * of its metadata — exactly what a multimodal training pipeline needs.
 *
 * Entitlement (the unlimited-download subscription) is enforced by the calling
 * UI; this module only performs the fetch/archive work on the products it is
 * handed.
 */
import JSZip from 'jszip';
import { embedMetadataIntoJpeg } from './imageMetadataWriter';
import type { MarketplaceProduct } from '@/hooks/useMarketplaceProducts';

export interface TrainingDatasetProgress {
  total: number;
  done: number;
  current: string;
}

export interface TrainingImageRecord {
  id: string;
  file: string;
  title: string;
  caption: string;
  keywords: string[];
  location: string;
  continent: string;
  country: string;
  seller: string;
  license: string;
  source_url: string;
}

const LICENSE_TEXT = `TravelTelly Stock Media — LLM / AI Training Dataset
========================================================
Source:    https://traveltelly.com/marketplace
License:   Included with the TravelTelly unlimited download subscription.
Rights:    Royalty-free, commercial usage rights for the subscribing user.
Attribution:
  Descriptive metadata (title, caption, keywords, location) is embedded into
  each JPEG as XMP/EXIF and is also provided in manifest.json and manifest.csv.
  The manifest is the authoritative machine-readable index; use it to pair each
  image file with its caption for training.

This dataset is provided for LLM / multimodal model training and research.
Respect the license terms and the original creators.
`;

export function isVideoLike(product: MarketplaceProduct): boolean {
  return product.mediaType === 'video' || /\.(mp4|webm|mov|m4v|avi|mkv)/i.test(product.images[0] || '');
}

/** Derive a filesystem extension from the source image URL (falls back to .jpg). */
function extFromUrl(url: string): string {
  const m = url.match(/\.(jpe?g|png|gif|webp|svg|avif|bmp|tiff?|heic|heif)(?:\?|$)/i);
  if (!m) return '.jpg';
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? '.jpg' : `.${ext}`;
}

/** Collision-safe filename stem derived from a product title. */
function uniqueStem(base: string, used: Map<string, number>): string {
  const clean = (base || 'photo')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
    .toLowerCase()
    .slice(0, 60);
  const key = clean || 'photo';
  const n = used.get(key) ?? 0;
  used.set(key, n + 1);
  return n === 0 ? key : `${key}_${n + 1}`;
}

function csvCell(value: string): string {
  const s = String(value ?? '');
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function toCsv(rows: TrainingImageRecord[]): string {
  const cols: Array<keyof TrainingImageRecord> = [
    'id', 'file', 'title', 'caption', 'keywords', 'location',
    'continent', 'country', 'seller', 'license', 'source_url',
  ];
  const header = cols.join(',');
  const lines = rows.map((r) =>
    cols
      .map((c) => csvCell(c === 'keywords' ? r.keywords.join('|') : String(r[c] ?? '')))
      .join(',')
  );
  return [header, ...lines].join('\n');
}

/**
 * Fetch every photo's full-resolution original, embed metadata, and bundle
 * them with manifest.json / manifest.csv / LICENSE.md into a ZIP that is
 * downloaded by the browser. Resolves once the download is triggered.
 */
export async function buildTrainingDatasetZip(
  products: MarketplaceProduct[],
  onProgress?: (p: TrainingDatasetProgress) => void,
): Promise<void> {
  const zip = new JSZip();
  const photos = products.filter((p) => p.images.length > 0 && !isVideoLike(p));
  const total = photos.length;
  const used = new Map<string, number>();
  const manifest: TrainingImageRecord[] = [];

  for (let i = 0; i < photos.length; i++) {
    const product = photos[i];
    const imageUrl = product.images[0];
    onProgress?.({ total, done: i, current: product.title });

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const file = new File([blob], 'photo', { type: blob.type || 'image/jpeg' });

      const keywords = product.event.tags
        .filter(([name]) => name === 't' || name === 'category')
        .map(([, val]) => val)
        .filter(Boolean);

      const enriched = await embedMetadataIntoJpeg(file, {
        title: product.title,
        description: product.description,
        keywords,
        city: product.location,
        country: product.country,
      });

      const filename = `${uniqueStem(product.title, used)}${extFromUrl(imageUrl)}`;
      zip.file(filename, enriched);

      manifest.push({
        id: product.id,
        file: filename,
        title: product.title,
        caption: product.description,
        keywords,
        location: product.location || '',
        continent: product.continent || '',
        country: product.country || '',
        seller: product.seller.pubkey,
        license: 'TravelTelly unlimited subscription',
        source_url: imageUrl,
      });
    } catch (err) {
      console.error(`[LLMTraining] Failed for "${product.title}":`, err);
      // Keep going with the remaining images — one bad URL must not abort the set.
    }
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('manifest.csv', toCsv(manifest));
  zip.file('LICENSE.md', `# License\n\n${LICENSE_TEXT}`);

  onProgress?.({ total, done: total, current: '' });

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `traveltelly_llm_training_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`[LLMTraining] bundled ${manifest.length} photos into a training dataset`);
}
