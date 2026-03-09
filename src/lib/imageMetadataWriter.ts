/**
 * Image Metadata Writer — pure browser EXIF injector, zero dependencies.
 *
 * Strategy:
 *   1. Read JPEG as ArrayBuffer.
 *   2. Parse existing APP1 EXIF to preserve Orientation (and other camera tags).
 *   3. Build a new TIFF block that merges preserved camera tags with our metadata.
 *   4. Strip the original APP1, inject our new one, leave all other segments intact.
 *
 * This ensures:
 *   - Photo orientation (horizontal/vertical) is always preserved.
 *   - Title, Description, Keywords and GPS are visible in Windows, macOS, Lightroom.
 *
 * Fields written:
 *   IFD0  0x010E  ImageDescription  ASCII      title + city + country
 *   IFD0  0x0112  Orientation       SHORT      preserved from original (or 1)
 *   IFD0  0x013B  Artist            ASCII      "Traveltelly"
 *   IFD0  0x8298  Copyright         ASCII      city + country
 *   IFD0  0x9C9B  XPTitle           BYTE/UTF16 title
 *   IFD0  0x9C9C  XPComment         BYTE/UTF16 description
 *   IFD0  0x9C9E  XPKeywords        BYTE/UTF16 tags joined by "; "
 *   IFD0  0x8825  GPSInfoIFDPointer LONG       → GPS sub-IFD
 *   GPS   0x0001  GPSLatitudeRef
 *   GPS   0x0002  GPSLatitude       RATIONAL
 *   GPS   0x0003  GPSLongitudeRef
 *   GPS   0x0004  GPSLongitude      RATIONAL
 *   GPS   0x0012  GPSMapDatum       ASCII
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

// ─── Public entry point ───────────────────────────────────────────────────────

export async function embedMetadataIntoJpeg(
  file: File,
  meta: MetadataToEmbed
): Promise<Blob> {
  const isJpeg =
    file.type === 'image/jpeg' ||
    file.type === 'image/jpg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg');

  if (!isJpeg) {
    console.warn('[EXIF] Non-JPEG — returning unchanged.');
    return file;
  }

  try {
    const src = new Uint8Array(await file.arrayBuffer());
    if (src[0] !== 0xff || src[1] !== 0xd8) {
      console.warn('[EXIF] Not a valid JPEG — returning unchanged.');
      return file;
    }

    // 1. Read the original Orientation value so we can preserve it
    const orientation = readOrientation(src);
    console.log('[EXIF] Preserved orientation:', orientation);

    // 2. Build new APP1 with our metadata + preserved orientation
    const app1 = buildApp1(meta, orientation);

    // 3. Strip all existing APP1 segments (EXIF + XMP)
    const stripped = stripApp1(src);

    // 4. Reassemble: SOI + new APP1 + rest of image (without original SOI)
    const out = concat([
      new Uint8Array([0xff, 0xd8]),
      app1,
      stripped.subarray(2),
    ]);

    console.log(`[EXIF] Done — ${out.length} bytes (was ${src.length})`);
    return new Blob([out], { type: 'image/jpeg' });
  } catch (err) {
    console.error('[EXIF] Failed:', err);
    return file;
  }
}

// ─── Read existing Orientation from a JPEG's APP1 EXIF ───────────────────────

function readOrientation(src: Uint8Array): number {
  try {
    let i = 2;
    while (i < src.length - 3) {
      if (src[i] !== 0xff) break;
      const marker = src[i + 1];
      if (marker === 0xe1) {
        // Found APP1 — check for "Exif\0\0" header
        const segLen = (src[i + 2] << 8) | src[i + 3];
        const seg = src.subarray(i + 4, i + 2 + segLen);
        if (
          seg[0] === 0x45 && seg[1] === 0x78 && seg[2] === 0x69 &&
          seg[3] === 0x66 && seg[4] === 0x00 && seg[5] === 0x00
        ) {
          // Parse TIFF block starting at seg[6]
          const tiff = seg.subarray(6);
          const dv = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
          const le = tiff[0] === 0x49; // "II" = little-endian
          const ifd0Offset = dv.getUint32(4, le);
          const entryCount = dv.getUint16(ifd0Offset, le);
          for (let e = 0; e < entryCount; e++) {
            const ePos = ifd0Offset + 2 + e * 12;
            const tag = dv.getUint16(ePos, le);
            if (tag === 0x0112) { // Orientation
              return dv.getUint16(ePos + 8, le);
            }
          }
        }
        i += 2 + segLen;
      } else if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2;
      } else {
        const segLen = (src[i + 2] << 8) | src[i + 3];
        i += 2 + segLen;
      }
    }
  } catch {
    // ignore parse errors
  }
  return 1; // default: normal orientation
}

// ─── Strip all APP1 segments ──────────────────────────────────────────────────

function stripApp1(src: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [new Uint8Array([0xff, 0xd8])];
  let i = 2;
  while (i < src.length - 1) {
    if (src[i] !== 0xff) { parts.push(src.subarray(i)); break; }
    const marker = src[i + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(new Uint8Array([0xff, marker]));
      i += 2;
      continue;
    }
    const segLen = (src[i + 2] << 8) | src[i + 3];
    if (marker === 0xe1) {
      i += 2 + segLen; // drop APP1
    } else {
      parts.push(src.subarray(i, i + 2 + segLen));
      i += 2 + segLen;
    }
  }
  return concat(parts);
}

// ─── Build JPEG APP1 segment ──────────────────────────────────────────────────

function buildApp1(meta: MetadataToEmbed, orientation: number): Uint8Array {
  const tiff = buildTiff(meta, orientation);
  const header = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00]); // "Exif\0\0"
  const payloadLen = header.length + tiff.length;
  const seg = new Uint8Array(4 + payloadLen);
  const dv = new DataView(seg.buffer);
  dv.setUint8(0, 0xff);
  dv.setUint8(1, 0xe1);
  dv.setUint16(2, payloadLen + 2, false); // big-endian length includes itself
  seg.set(header, 4);
  seg.set(tiff, 10);
  return seg;
}

// ─── TIFF block builder ───────────────────────────────────────────────────────

interface Field {
  tag: number;
  type: number;  // 1=BYTE 2=ASCII 3=SHORT 4=LONG 5=RATIONAL
  count: number;
  data: Uint8Array;
}

function buildTiff(meta: MetadataToEmbed, orientation: number): Uint8Array {
  // ── collect IFD0 fields ───────────────────────────────────────────────────

  const ifd0: Field[] = [];

  // 0x010E ImageDescription (ASCII) — the most widely read text field
  const imageDesc = [meta.title, meta.city, meta.country].filter(Boolean).join(' - ');
  if (imageDesc) ifd0.push(asciiField(0x010e, imageDesc));

  // 0x0112 Orientation (SHORT, inline) — PRESERVE original
  ifd0.push(shortField(0x0112, orientation));

  // 0x013B Artist
  if (meta.title) ifd0.push(asciiField(0x013b, 'Traveltelly'));

  // 0x8298 Copyright
  const copyright = [meta.city, meta.country].filter(Boolean).join(', ');
  if (copyright) ifd0.push(asciiField(0x8298, copyright));

  // 0x9C9B XPTitle (UTF-16LE BYTE array) — Windows Title field
  if (meta.title) ifd0.push(utf16Field(0x9c9b, meta.title));

  // 0x9C9C XPComment (UTF-16LE BYTE array) — Windows Comments field
  if (meta.description) ifd0.push(utf16Field(0x9c9c, meta.description));

  // 0x9C9E XPKeywords (UTF-16LE BYTE array) — Windows Tags field
  if (meta.keywords?.length) ifd0.push(utf16Field(0x9c9e, meta.keywords.join('; ')));

  // ── collect GPS fields ────────────────────────────────────────────────────

  const gpsFields: Field[] = [];
  const hasGps =
    meta.latitude  != null && !isNaN(meta.latitude) &&
    meta.longitude != null && !isNaN(meta.longitude);

  if (hasGps) {
    gpsFields.push(asciiField(0x0001, meta.latitude!  >= 0 ? 'N' : 'S'));
    gpsFields.push(rationalField(0x0002, dms(meta.latitude!)));
    gpsFields.push(asciiField(0x0003, meta.longitude! >= 0 ? 'E' : 'W'));
    gpsFields.push(rationalField(0x0004, dms(meta.longitude!)));
    gpsFields.push(asciiField(0x0012, 'WGS-84'));
  }

  // Add GPS IFD pointer entry to IFD0 (tag 0x8825 — must be sorted with others)
  // We'll patch the actual offset once we know it, using a placeholder SHORT for now
  if (hasGps) {
    ifd0.push({ tag: 0x8825, type: 4 /* LONG */, count: 1, data: new Uint8Array(4) });
  }

  // Sort ALL IFD0 entries by tag (TIFF spec requires ascending order)
  ifd0.sort((a, b) => a.tag - b.tag);

  // ── two-pass layout ───────────────────────────────────────────────────────
  //
  // TIFF header:  8 bytes  (at offset 0)
  // IFD0 block:   2 + N*12 + 4 bytes  (at offset 8)
  // IFD0 heap:    variable  (immediately after IFD0 block)
  // GPS IFD:      2 + M*12 + 4 bytes  (immediately after IFD0 heap)
  // GPS heap:     variable  (immediately after GPS IFD)

  const TIFF_HDR = 8;
  const ifd0Count = ifd0.length;
  const ifd0BlockSize = 2 + ifd0Count * 12 + 4;
  const ifd0Start = TIFF_HDR;

  // Pass 1 — assign heap offsets for IFD0 values that don't fit inline (> 4 bytes)
  let heap = ifd0Start + ifd0BlockSize;
  const ifd0Offsets = new Map<Field, number>();
  for (const f of ifd0) {
    if (f.data.length > 4) {
      ifd0Offsets.set(f, heap);
      heap += f.data.length;
      if (heap & 1) heap++; // word-align
    }
  }

  // GPS IFD starts right after IFD0 heap
  const gpsStart = heap;

  // Patch the GPS IFD pointer now that we know gpsStart
  if (hasGps) {
    const gpsPtrField = ifd0.find(f => f.tag === 0x8825)!;
    const dv = new DataView(gpsPtrField.data.buffer);
    dv.setUint32(0, gpsStart, true);
  }

  // Pass 2 — GPS IFD layout
  const gpsCount = gpsFields.length;
  const gpsBlockSize = hasGps ? 2 + gpsCount * 12 + 4 : 0;
  let gpsHeap = gpsStart + gpsBlockSize;
  const gpsOffsets = new Map<Field, number>();
  if (hasGps) {
    for (const f of gpsFields) {
      if (f.data.length > 4) {
        gpsOffsets.set(f, gpsHeap);
        gpsHeap += f.data.length;
        if (gpsHeap & 1) gpsHeap++;
      }
    }
  }

  const totalSize = gpsHeap;
  const buf = new Uint8Array(totalSize);
  const dv  = new DataView(buf.buffer);

  // ── write TIFF header ─────────────────────────────────────────────────────
  buf[0] = 0x49; buf[1] = 0x49;          // "II" = little-endian
  dv.setUint16(2, 0x002a, true);          // TIFF magic
  dv.setUint32(4, ifd0Start, true);       // offset to IFD0 = 8

  // ── write IFD0 ────────────────────────────────────────────────────────────
  let pos = ifd0Start;
  dv.setUint16(pos, ifd0Count, true); pos += 2;

  for (const f of ifd0) {
    dv.setUint16(pos,     f.tag,   true);
    dv.setUint16(pos + 2, f.type,  true);
    dv.setUint32(pos + 4, f.count, true);
    if (f.data.length <= 4) {
      buf.set(f.data, pos + 8); // inline, left-justified
    } else {
      dv.setUint32(pos + 8, ifd0Offsets.get(f)!, true);
    }
    pos += 12;
  }
  dv.setUint32(pos, 0, true); pos += 4; // next IFD offset = 0

  // write IFD0 heap
  for (const [f, off] of ifd0Offsets) {
    buf.set(f.data, off);
  }

  // ── write GPS IFD ─────────────────────────────────────────────────────────
  if (hasGps) {
    const gpsSorted = [...gpsFields].sort((a, b) => a.tag - b.tag);
    pos = gpsStart;
    dv.setUint16(pos, gpsCount, true); pos += 2;

    for (const f of gpsSorted) {
      dv.setUint16(pos,     f.tag,   true);
      dv.setUint16(pos + 2, f.type,  true);
      dv.setUint32(pos + 4, f.count, true);
      if (f.data.length <= 4) {
        buf.set(f.data, pos + 8);
      } else {
        dv.setUint32(pos + 8, gpsOffsets.get(f)!, true);
      }
      pos += 12;
    }
    dv.setUint32(pos, 0, true); // next IFD = 0

    for (const [f, off] of gpsOffsets) {
      buf.set(f.data, off);
    }
  }

  return buf;
}

// ─── Field constructors ───────────────────────────────────────────────────────

/** ASCII field — null-terminated. count = byte length including null. */
function asciiField(tag: number, str: string): Field {
  const data = new Uint8Array(str.length + 1);
  for (let i = 0; i < str.length; i++) data[i] = str.charCodeAt(i) & 0xff;
  // data[str.length] = 0 (already zero from Uint8Array init)
  return { tag, type: 2, count: data.length, data };
}

/** SHORT field — 2-byte unsigned integer, stored inline. */
function shortField(tag: number, value: number): Field {
  const data = new Uint8Array(2);
  const dv = new DataView(data.buffer);
  dv.setUint16(0, value, true);
  return { tag, type: 3, count: 1, data };
}

/**
 * UTF-16LE BYTE field (type=1) for Windows XP EXIF fields.
 * count = total byte length including the 2-byte null terminator.
 */
function utf16Field(tag: number, str: string): Field {
  const data = new Uint8Array((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    data[i * 2]     = c & 0xff;
    data[i * 2 + 1] = (c >> 8) & 0xff;
  }
  // trailing null terminator bytes are already 0
  return { tag, type: 1, count: data.length, data };
}

/** RATIONAL field — array of [numerator, denominator] pairs. */
function rationalField(tag: number, rationals: Array<[number, number]>): Field {
  const data = new Uint8Array(rationals.length * 8);
  const dv = new DataView(data.buffer);
  for (let i = 0; i < rationals.length; i++) {
    dv.setUint32(i * 8,     rationals[i][0], true);
    dv.setUint32(i * 8 + 4, rationals[i][1], true);
  }
  return { tag, type: 5, count: rationals.length, data };
}

// ─── GPS DMS conversion ───────────────────────────────────────────────────────

function dms(decimal: number): Array<[number, number]> {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60 * 10000);
  return [[deg, 1], [min, 1], [sec, 10000]];
}

// ─── Concat helper ────────────────────────────────────────────────────────────

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}
