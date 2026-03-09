/**
 * Image Metadata Writer
 *
 * Embeds title, description, keywords, GPS and location data into a JPEG file
 * by writing a fresh EXIF/IPTC APP1 segment from scratch and prepending it to
 * the stripped JPEG bytes.
 *
 * This approach is completely reliable in all browsers because:
 * 1. We read the file as an ArrayBuffer (no base64 conversion issues)
 * 2. We build the EXIF bytes manually — no piexifjs load() crash risk
 * 3. We strip any existing APP1/APP13 markers to avoid conflicts
 * 4. We re-insert SOI + our new APP1 + the rest of the image bytes
 *
 * Supported fields (written into IFD0 / GPS IFD):
 *   - ImageDescription  (0x010E)  → title + city + country
 *   - XPTitle           (0x9C9B)  → title (UTF-16LE, Windows)
 *   - XPComment         (0x9C9C)  → description (UTF-16LE)
 *   - XPKeywords        (0x9C9E)  → keywords joined by "; " (UTF-16LE)
 *   - GPSLatitudeRef / GPSLatitude
 *   - GPSLongitudeRef  / GPSLongitude
 *
 * For non-JPEG files the original file is returned unchanged (EXIF is a JPEG
 * concept; PNG/WebP use separate metadata specs).
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

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Embed metadata into a JPEG and return an enriched Blob.
 * For non-JPEG files the original File is returned unchanged.
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
    console.warn('EXIF embedding only supports JPEG; returning original file.');
    return file;
  }

  try {
    const originalBytes = new Uint8Array(await file.arrayBuffer());

    // Validate JPEG magic bytes (FF D8)
    if (originalBytes[0] !== 0xff || originalBytes[1] !== 0xd8) {
      console.warn('File does not appear to be a valid JPEG.');
      return file;
    }

    // Build our EXIF APP1 segment
    const exifApp1 = buildExifApp1(metadata);

    // Strip any existing APP1 (EXIF) and APP13 (IPTC/Photoshop) markers from
    // the original bytes so we don't end up with duplicates.
    const strippedBody = stripAppMarkers(originalBytes, [0xe1, 0xed]);

    // Re-assemble: SOI (FF D8) + our APP1 + rest of image (skipping original SOI)
    const result = new Uint8Array(2 + exifApp1.length + strippedBody.length - 2);
    result[0] = 0xff;
    result[1] = 0xd8; // SOI
    result.set(exifApp1, 2);
    result.set(strippedBody.subarray(2), 2 + exifApp1.length); // skip original SOI

    return new Blob([result], { type: 'image/jpeg' });
  } catch (err) {
    console.error('embedMetadataIntoJpeg failed:', err);
    return file; // safe fallback
  }
}

// ─── JPEG marker stripping ────────────────────────────────────────────────────

/**
 * Return a copy of jpegBytes with all APP segments whose marker second-byte
 * matches one of `markers` removed.
 * e.g. markers = [0xe1] removes all APP1 segments.
 */
function stripAppMarkers(jpegBytes: Uint8Array, markers: number[]): Uint8Array {
  const out: number[] = [0xff, 0xd8]; // keep SOI
  let i = 2; // start after SOI

  while (i < jpegBytes.length - 1) {
    if (jpegBytes[i] !== 0xff) {
      // Not a marker — copy remaining bytes verbatim
      out.push(...jpegBytes.subarray(i));
      break;
    }

    const marker = jpegBytes[i + 1];

    // SOI / EOI / RST markers have no length field
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      out.push(0xff, marker);
      i += 2;
      continue;
    }

    // All other markers: length is the next 2 bytes (big-endian, includes itself)
    const segLen = (jpegBytes[i + 2] << 8) | jpegBytes[i + 3];

    if (markers.includes(marker)) {
      // Skip this segment entirely
      i += 2 + segLen;
    } else {
      // Keep this segment
      out.push(...jpegBytes.subarray(i, i + 2 + segLen));
      i += 2 + segLen;
    }
  }

  return new Uint8Array(out);
}

// ─── EXIF APP1 builder ────────────────────────────────────────────────────────

/**
 * Build a complete JPEG APP1 segment containing an EXIF header with IFD0 and
 * GPS sub-IFD populated from `metadata`.
 *
 * Binary layout:
 *   FF E1          APP1 marker
 *   LL LL          segment length (big-endian, includes these 2 bytes)
 *   45 78 69 66 00 00   "Exif\0\0"
 *   [TIFF header + IFDs]
 */
function buildExifApp1(metadata: MetadataToEmbed): Uint8Array {
  // ── Collect IFD0 entries ──────────────────────────────────────────────────

  const ifd0Entries: IFDEntry[] = [];

  // ImageDescription (ASCII): title – city – country
  const fullTitle = [metadata.title, metadata.city, metadata.country]
    .filter(Boolean)
    .join(' - ');
  if (fullTitle) {
    ifd0Entries.push(makeAsciiEntry(0x010e, fullTitle));
  }

  // XPTitle (BYTE, UTF-16LE)
  if (metadata.title) {
    ifd0Entries.push(makeUtf16Entry(0x9c9b, metadata.title));
  }

  // XPComment (BYTE, UTF-16LE)
  if (metadata.description) {
    ifd0Entries.push(makeUtf16Entry(0x9c9c, metadata.description));
  }

  // XPKeywords (BYTE, UTF-16LE)
  if (metadata.keywords && metadata.keywords.length > 0) {
    ifd0Entries.push(makeUtf16Entry(0x9c9e, metadata.keywords.join('; ')));
  }

  // ── GPS IFD entries ───────────────────────────────────────────────────────

  const gpsEntries: IFDEntry[] = [];

  if (
    metadata.latitude !== undefined &&
    metadata.longitude !== undefined &&
    !isNaN(metadata.latitude) &&
    !isNaN(metadata.longitude)
  ) {
    // GPSVersionID: 2.3.0.0
    gpsEntries.push({ tag: 0x0000, type: 1, count: 4, value: new Uint8Array([2, 3, 0, 0]) });
    // GPSLatitudeRef
    gpsEntries.push(makeAsciiEntry(0x0001, metadata.latitude >= 0 ? 'N' : 'S'));
    // GPSLatitude
    gpsEntries.push(makeDmsRationalEntry(0x0002, metadata.latitude));
    // GPSLongitudeRef
    gpsEntries.push(makeAsciiEntry(0x0003, metadata.longitude >= 0 ? 'E' : 'W'));
    // GPSLongitude
    gpsEntries.push(makeDmsRationalEntry(0x0004, metadata.longitude));
  }

  // ── Assemble TIFF block ───────────────────────────────────────────────────

  const tiffBytes = assembleTiff(ifd0Entries, gpsEntries);

  // ── Wrap in APP1 ──────────────────────────────────────────────────────────

  // APP1 payload = "Exif\0\0" (6 bytes) + tiff bytes
  const exifHeader = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // "Exif\0\0"
  const payloadLen = exifHeader.length + tiffBytes.length;

  // APP1 segment = FF E1 + 2-byte length (includes length bytes) + payload
  const app1 = new Uint8Array(4 + payloadLen);
  app1[0] = 0xff;
  app1[1] = 0xe1; // APP1 marker
  app1[2] = ((payloadLen + 2) >> 8) & 0xff;
  app1[3] = (payloadLen + 2) & 0xff;
  app1.set(exifHeader, 4);
  app1.set(tiffBytes, 4 + exifHeader.length);

  return app1;
}

// ─── TIFF assembler ───────────────────────────────────────────────────────────

interface IFDEntry {
  tag: number;
  type: number; // TIFF type: 1=BYTE, 2=ASCII, 7=UNDEFINED, 10=SRATIONAL, 5=RATIONAL
  count: number;
  value: Uint8Array;
}

/**
 * Assemble a little-endian TIFF block containing IFD0 (with an optional GPS
 * sub-IFD pointer) and a GPS IFD.
 *
 * TIFF layout (little-endian "II"):
 *   Offset 0  : "II" (0x49 0x49) — little-endian marker
 *   Offset 2  : 0x2A 0x00        — TIFF magic
 *   Offset 4  : 0x08 0x00 0x00 0x00  — offset to IFD0 (always 8)
 *   [IFD0]
 *   [GPS IFD]  (if any GPS entries)
 *   [value heap for large values]
 */
function assembleTiff(ifd0Entries: IFDEntry[], gpsEntries: IFDEntry[]): Uint8Array {
  // We'll build into a dynamic byte array
  const bytes: number[] = [];

  // ── TIFF header (8 bytes) ─────────────────────────────────────────────────
  bytes.push(0x49, 0x49); // "II" little-endian
  bytes.push(0x2a, 0x00); // TIFF magic
  bytes.push(0x08, 0x00, 0x00, 0x00); // IFD0 offset = 8

  // If we have GPS entries, we'll add a GPS IFD pointer to IFD0
  const hasGps = gpsEntries.length > 0;

  // A placeholder IFD0 entry for GPS pointer (tag 0x8825)
  const GPS_TAG = 0x8825;

  // All IFD0 entries sorted by tag (TIFF spec requirement)
  const allIfd0 = [...ifd0Entries];
  if (hasGps) {
    // Placeholder — we'll fill in the GPS IFD offset later
    allIfd0.push({ tag: GPS_TAG, type: 4 /* LONG */, count: 1, value: u32LE(0) });
  }
  allIfd0.sort((a, b) => a.tag - b.tag);

  // IFD0 starts at offset 8 (right after TIFF header)
  // IFD structure: 2-byte count + count × 12-byte entries + 4-byte next-IFD offset (0)
  const ifd0EntryCount = allIfd0.length;
  const ifd0Size = 2 + ifd0EntryCount * 12 + 4;
  const ifd0Start = 8;

  // Value heap starts right after IFD0
  let heapOffset = ifd0Start + ifd0Size;

  // If GPS IFD follows, it sits right after the IFD0 value heap (computed below)
  // We need a two-pass approach: first calculate heap size for IFD0, then place GPS IFD.

  // ── Compute IFD0 value heap ───────────────────────────────────────────────

  type EntryLayout = { entry: IFDEntry; inlineOrOffset: number; inHeap: boolean };
  const ifd0Layout: EntryLayout[] = allIfd0.map((e) => {
    const size = e.value.length;
    if (size <= 4) {
      return { entry: e, inlineOrOffset: 0, inHeap: false };
    }
    const offset = heapOffset;
    heapOffset += size;
    // Pad to even boundary
    if (heapOffset % 2 !== 0) heapOffset++;
    return { entry: e, inlineOrOffset: offset, inHeap: true };
  });

  // GPS IFD starts after IFD0 heap
  const gpsIfdStart = heapOffset;

  // ── Fix GPS pointer in IFD0 layout ───────────────────────────────────────

  if (hasGps) {
    const gpsPtrLayout = ifd0Layout.find((l) => l.entry.tag === GPS_TAG);
    if (gpsPtrLayout) {
      gpsPtrLayout.entry.value = u32LE(gpsIfdStart);
    }
  }

  // ── Write IFD0 ───────────────────────────────────────────────────────────

  bytes.push(...u16LE(ifd0EntryCount));

  for (const layout of ifd0Layout) {
    const e = layout.entry;
    bytes.push(...u16LE(e.tag));
    bytes.push(...u16LE(e.type));
    bytes.push(...u32LE(e.count));

    if (!layout.inHeap) {
      // Inline: pad to 4 bytes
      const padded = new Uint8Array(4);
      padded.set(e.value.subarray(0, 4));
      bytes.push(...padded);
    } else {
      bytes.push(...u32LE(layout.inlineOrOffset));
    }
  }

  // Next IFD offset = 0 (no IFD1)
  bytes.push(0, 0, 0, 0);

  // ── Write IFD0 heap values ────────────────────────────────────────────────

  for (const layout of ifd0Layout) {
    if (!layout.inHeap) continue;
    bytes.push(...layout.entry.value);
    if (layout.entry.value.length % 2 !== 0) bytes.push(0); // pad
  }

  // ── Write GPS IFD ─────────────────────────────────────────────────────────

  if (hasGps) {
    const gpsSorted = [...gpsEntries].sort((a, b) => a.tag - b.tag);
    const gpsEntryCount = gpsSorted.length;
    const gpsIfdSize = 2 + gpsEntryCount * 12 + 4;
    let gpsHeapOffset = gpsIfdStart + gpsIfdSize;

    type GpsLayout = EntryLayout;
    const gpsLayout: GpsLayout[] = gpsSorted.map((e) => {
      const size = e.value.length;
      if (size <= 4) {
        return { entry: e, inlineOrOffset: 0, inHeap: false };
      }
      const offset = gpsHeapOffset;
      gpsHeapOffset += size;
      if (gpsHeapOffset % 2 !== 0) gpsHeapOffset++;
      return { entry: e, inlineOrOffset: offset, inHeap: true };
    });

    bytes.push(...u16LE(gpsEntryCount));

    for (const layout of gpsLayout) {
      const e = layout.entry;
      bytes.push(...u16LE(e.tag));
      bytes.push(...u16LE(e.type));
      bytes.push(...u32LE(e.count));

      if (!layout.inHeap) {
        const padded = new Uint8Array(4);
        padded.set(e.value.subarray(0, 4));
        bytes.push(...padded);
      } else {
        bytes.push(...u32LE(layout.inlineOrOffset));
      }
    }

    // Next IFD offset = 0
    bytes.push(0, 0, 0, 0);

    // GPS heap values
    for (const layout of gpsLayout) {
      if (!layout.inHeap) continue;
      bytes.push(...layout.entry.value);
      if (layout.entry.value.length % 2 !== 0) bytes.push(0);
    }
  }

  return new Uint8Array(bytes);
}

// ─── IFD entry helpers ────────────────────────────────────────────────────────

/** ASCII entry: null-terminated string */
function makeAsciiEntry(tag: number, str: string): IFDEntry {
  const bytes = new Uint8Array(str.length + 1);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  bytes[str.length] = 0;
  return { tag, type: 2 /* ASCII */, count: bytes.length, value: bytes };
}

/** BYTE entry with UTF-16LE encoded string (Windows XP EXIF fields) */
function makeUtf16Entry(tag: number, str: string): IFDEntry {
  // UTF-16LE: 2 bytes per character + 2-byte null terminator
  const bytes = new Uint8Array((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    bytes[i * 2] = code & 0xff;
    bytes[i * 2 + 1] = (code >> 8) & 0xff;
  }
  // null terminator already zero from Uint8Array initialisation
  return { tag, type: 1 /* BYTE */, count: bytes.length, value: bytes };
}

/** RATIONAL entry for GPS DMS: [[deg,1],[min,1],[sec*100,100]] */
function makeDmsRationalEntry(tag: number, decimal: number): IFDEntry {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFloat = (abs - deg) * 60;
  const min = Math.floor(minFloat);
  const secFloat = (minFloat - min) * 60;
  const sec = Math.round(secFloat * 1000); // numerator with denominator 1000

  // 3 rationals × 8 bytes each = 24 bytes
  const buf = new Uint8Array(24);
  const view = new DataView(buf.buffer);
  view.setUint32(0, deg, true);
  view.setUint32(4, 1, true);
  view.setUint32(8, min, true);
  view.setUint32(12, 1, true);
  view.setUint32(16, sec, true);
  view.setUint32(20, 1000, true);

  return { tag, type: 5 /* RATIONAL */, count: 3, value: buf };
}

// ─── Little-endian helpers ────────────────────────────────────────────────────

function u16LE(v: number): number[] {
  return [v & 0xff, (v >> 8) & 0xff];
}

function u32LE(v: number): Uint8Array {
  const b = new Uint8Array(4);
  b[0] = v & 0xff;
  b[1] = (v >> 8) & 0xff;
  b[2] = (v >> 16) & 0xff;
  b[3] = (v >> 24) & 0xff;
  return b;
}
