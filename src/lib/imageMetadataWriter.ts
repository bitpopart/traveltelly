/**
 * Image Metadata Writer
 *
 * Embeds title, description, keywords and GPS into a JPEG using piexifjs.
 *
 * Key principle: we NEVER call piexif.load() (which crashes on many real-world
 * JPEGs that have no EXIF, malformed EXIF, etc.).
 * Instead we build the EXIF dict entirely from scratch, call dump() to get
 * the binary EXIF string, then insert() it into the JPEG data-URL.
 * piexif.insert() already strips any existing APP1/EXIF before writing ours.
 *
 * Fields written:
 *   IFD0  ImageDescription  (ASCII)     — title + city + country
 *   IFD0  XPTitle           (UTF-16LE)  — title       (Windows/Lightroom)
 *   IFD0  XPComment         (UTF-16LE)  — description (Windows/Lightroom)
 *   IFD0  XPKeywords        (UTF-16LE)  — tags joined by "; "
 *   GPS   GPSLatitudeRef / GPSLatitude
 *   GPS   GPSLongitudeRef / GPSLongitude
 */

export interface MetadataToEmbed {
  title?: string;
  description?: string;
  keywords?: string[];
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
}

// ─── EXIF tag constants (hardcoded to avoid IFD lookup issues) ────────────────

const TAG_ImageDescription = 0x010e;
const TAG_XPTitle          = 0x9c9b;
const TAG_XPComment        = 0x9c9c;
const TAG_XPKeywords       = 0x9c9e;
const GPS_LatitudeRef      = 1;
const GPS_Latitude         = 2;
const GPS_LongitudeRef     = 3;
const GPS_Longitude        = 4;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Encode a string as UTF-16LE bytes (required for Windows XP EXIF fields). */
function toUtf16LE(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes.push(code & 0xff, (code >> 8) & 0xff);
  }
  bytes.push(0, 0); // null terminator
  return bytes;
}

/** Convert decimal degrees to [[deg,1],[min,1],[sec*1000,1000]] rational array. */
function decimalToDMS(decimal: number): Array<[number, number]> {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60 * 1000);
  return [
    [deg, 1],
    [min, 1],
    [sec, 1000],
  ];
}

/** Read a File as a base64 data-URL. */
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/** Convert a base64 data-URL to a Blob. */
function dataURLtoBlob(dataURL: string, mimeType: string): Blob {
  const base64 = dataURL.split(',')[1];
  const bstr = atob(base64);
  const arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) arr[i] = bstr.charCodeAt(i);
  return new Blob([arr], { type: mimeType });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Embed metadata into a JPEG file and return an enriched Blob.
 * Non-JPEG files are returned unchanged (piexifjs is JPEG-only).
 */
export async function embedMetadataIntoJpeg(
  file: File,
  metadata: MetadataToEmbed
): Promise<Blob> {
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  if (!isJpeg) {
    console.warn('EXIF embedding only supports JPEG — returning original file.');
    return file;
  }

  try {
    // Dynamically import piexifjs to avoid SSR issues
    const piexif = await import('piexifjs').then((m) => m.default ?? m);

    // 1. Read file as data-URL
    const dataURL = await fileToDataURL(file);

    // 2. Build EXIF dicts from scratch (no piexif.load() call)
    const zeroth: Record<number, unknown> = {};
    const gpsIfd: Record<number, unknown> = {};

    // ── IFD0 ──────────────────────────────────────────────────────────────────
    const titleParts = [metadata.title, metadata.city, metadata.country].filter(Boolean);
    if (titleParts.length > 0) {
      zeroth[TAG_ImageDescription] = titleParts.join(' - ');
    }
    if (metadata.title) {
      zeroth[TAG_XPTitle] = toUtf16LE(metadata.title);
    }
    if (metadata.description) {
      zeroth[TAG_XPComment] = toUtf16LE(metadata.description);
    }
    if (metadata.keywords && metadata.keywords.length > 0) {
      zeroth[TAG_XPKeywords] = toUtf16LE(metadata.keywords.join('; '));
    }

    // ── GPS IFD ───────────────────────────────────────────────────────────────
    if (
      metadata.latitude  !== undefined && !isNaN(metadata.latitude) &&
      metadata.longitude !== undefined && !isNaN(metadata.longitude)
    ) {
      gpsIfd[GPS_LatitudeRef]  = metadata.latitude  >= 0 ? 'N' : 'S';
      gpsIfd[GPS_Latitude]     = decimalToDMS(metadata.latitude);
      gpsIfd[GPS_LongitudeRef] = metadata.longitude >= 0 ? 'E' : 'W';
      gpsIfd[GPS_Longitude]    = decimalToDMS(metadata.longitude);
    }

    // 3. Dump to binary EXIF string
    const exifObj = { '0th': zeroth, 'Exif': {}, 'GPS': gpsIfd, '1st': {} };
    const exifBytes: string = piexif.dump(exifObj);

    // 4. Insert into JPEG (piexif.insert strips existing EXIF automatically)
    const newDataURL: string = piexif.insert(exifBytes, dataURL);

    // 5. Convert back to Blob
    const blob = dataURLtoBlob(newDataURL, 'image/jpeg');
    console.log(`✅ EXIF embedded: ${blob.size} bytes`);
    return blob;

  } catch (err) {
    console.error('❌ embedMetadataIntoJpeg failed:', err);
    return file; // safe fallback — download still works
  }
}
