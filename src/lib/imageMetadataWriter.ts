/**
 * Image Metadata Writer — pure browser EXIF injector, zero dependencies.
 *
 * Approach: hardcoded, flat two-region layout to eliminate offset bugs.
 *
 * TIFF layout (all little-endian):
 *   Offset 0     : TIFF header (8 bytes)
 *   Offset 8     : IFD0  (2 + N*12 + 4 bytes)
 *   Offset 8+ifd : value heap (long values that don't fit in 4 bytes)
 *
 * We write exactly these IFD0 tags (sorted ascending):
 *   0x010E  ImageDescription  ASCII   title – city – country
 *   0x0112  Orientation       SHORT   (preserved from original)
 *   0x9C9B  XPTitle           BYTE    UTF-16LE
 *   0x9C9C  XPComment         BYTE    UTF-16LE
 *   0x9C9E  XPKeywords        BYTE    UTF-16LE
 *
 * No GPS sub-IFD in this version (to keep the layout simple and proven).
 * GPS is already preserved if the original photo had it (we keep all non-APP1 segments).
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

// ─── Public API ───────────────────────────────────────────────────────────────

export async function embedMetadataIntoJpeg(
  file: File,
  meta: MetadataToEmbed
): Promise<Blob> {
  console.log('[EXIF] called for:', file.name, file.type, file.size, 'bytes');

  try {
    const buf = new Uint8Array(await file.arrayBuffer());

    if (buf[0] !== 0xff || buf[1] !== 0xd8) {
      console.warn('[EXIF] not a JPEG, returning original');
      return file;
    }

    const orientation = readOrientation(buf);
    console.log('[EXIF] original orientation:', orientation);

    const app1 = makeApp1(meta, orientation);
    console.log('[EXIF] app1 segment size:', app1.length);

    const stripped = removeApp1(buf);
    console.log('[EXIF] stripped jpeg size:', stripped.length);

    // output = SOI + new APP1 + rest (skipping original SOI)
    const out = new Uint8Array(2 + app1.length + stripped.length - 2);
    out[0] = 0xff; out[1] = 0xd8;
    out.set(app1, 2);
    out.set(stripped.subarray(2), 2 + app1.length);

    console.log('[EXIF] output size:', out.length);
    return new Blob([out], { type: 'image/jpeg' });
  } catch (err) {
    console.error('[EXIF] error:', err);
    return file;
  }
}

// ─── Read Orientation from existing EXIF ────────────────────────────────────

function readOrientation(src: Uint8Array): number {
  let i = 2;
  while (i + 3 < src.length) {
    if (src[i] !== 0xff) break;
    const marker = src[i + 1];
    if (marker === 0xd9) break;
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = (src[i + 2] << 8) | src[i + 3];
    if (marker === 0xe1 && len > 10) {
      const s = i + 4;
      // Check "Exif\0\0"
      if (src[s] === 0x45 && src[s+1] === 0x78 && src[s+2] === 0x69 &&
          src[s+3] === 0x66 && src[s+4] === 0x00 && src[s+5] === 0x00) {
        const t = s + 6; // TIFF start
        if (t + 8 < src.length) {
          const le = src[t] === 0x49;
          const dv = new DataView(src.buffer, src.byteOffset + t);
          const ifd0off = dv.getUint32(4, le);
          if (ifd0off + 2 <= dv.byteLength) {
            const n = dv.getUint16(ifd0off, le);
            for (let e = 0; e < n; e++) {
              const ep = ifd0off + 2 + e * 12;
              if (ep + 10 > dv.byteLength) break;
              if (dv.getUint16(ep, le) === 0x0112) {
                return dv.getUint16(ep + 8, le) || 1;
              }
            }
          }
        }
      }
    }
    i += 2 + len;
  }
  return 1;
}

// ─── Remove all APP1 segments ─────────────────────────────────────────────────

function removeApp1(src: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [src.subarray(0, 2)]; // keep SOI
  let i = 2;
  while (i + 1 < src.length) {
    if (src[i] !== 0xff) { chunks.push(src.subarray(i)); break; }
    const m = src[i + 1];
    if (m === 0xd9) { chunks.push(src.subarray(i, i + 2)); break; }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) {
      chunks.push(src.subarray(i, i + 2)); i += 2; continue;
    }
    if (i + 3 >= src.length) break;
    const len = (src[i + 2] << 8) | src[i + 3];
    if (m === 0xe1) {
      i += 2 + len; // skip
    } else {
      chunks.push(src.subarray(i, i + 2 + len));
      i += 2 + len;
    }
  }
  let total = 0; for (const c of chunks) total += c.length;
  const out = new Uint8Array(total); let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

// ─── Build complete APP1 segment ─────────────────────────────────────────────

function makeApp1(meta: MetadataToEmbed, orientation: number): Uint8Array {
  const tiff = makeTiff(meta, orientation);

  // APP1 = FF E1 + uint16BE(length) + "Exif\0\0" + tiff
  // length field includes itself (2 bytes) + "Exif\0\0" (6 bytes) + tiff
  const length = 2 + 6 + tiff.length;
  const seg = new Uint8Array(2 + length);
  seg[0] = 0xff; seg[1] = 0xe1;
  seg[2] = (length >> 8) & 0xff;
  seg[3] = length & 0xff;
  seg[4] = 0x45; seg[5] = 0x78; seg[6] = 0x69; seg[7] = 0x66; // Exif
  seg[8] = 0x00; seg[9] = 0x00; // padding
  seg.set(tiff, 10);
  return seg;
}

// ─── Build TIFF block ─────────────────────────────────────────────────────────

function makeTiff(meta: MetadataToEmbed, orientation: number): Uint8Array {
  // Prepare all string values we want to write
  const imageDesc = ascii([meta.title, meta.city, meta.country].filter(Boolean).join(' - '));
  const xpTitle   = meta.title       ? utf16(meta.title)                         : null;
  const xpComment = meta.description ? utf16(meta.description)                   : null;
  const xpKeyword = meta.keywords?.length ? utf16(meta.keywords.join('; '))      : null;

  // Each IFD entry is 12 bytes: tag(2) type(2) count(4) value/offset(4)
  // Collect which entries we'll write and whether their value goes in the heap
  type Row = { tag: number; type: number; count: number; bytes: Uint8Array | null; inline16?: number; inline32?: number };
  const rows: Row[] = [];

  if (imageDesc.length > 0)
    rows.push({ tag: 0x010e, type: 2 /* ASCII */, count: imageDesc.length, bytes: imageDesc });

  // Orientation: SHORT inline
  rows.push({ tag: 0x0112, type: 3 /* SHORT */, count: 1, bytes: null, inline16: orientation });

  if (xpTitle)
    rows.push({ tag: 0x9c9b, type: 1 /* BYTE */, count: xpTitle.length,   bytes: xpTitle });
  if (xpComment)
    rows.push({ tag: 0x9c9c, type: 1 /* BYTE */, count: xpComment.length, bytes: xpComment });
  if (xpKeyword)
    rows.push({ tag: 0x9c9e, type: 1 /* BYTE */, count: xpKeyword.length, bytes: xpKeyword });

  // TIFF spec: entries must be sorted by tag ascending
  rows.sort((a, b) => a.tag - b.tag);

  // Layout:
  //   0        TIFF header (8 bytes): "II" + 0x002A + IFD0_OFFSET(4)
  //   8        IFD0: uint16 entry_count + rows * 12 + uint32 next_ifd(0)
  //   8+ifdSz  value heap (strings / arrays that don't fit in 4 bytes)

  const IFD0_OFFSET = 8;
  const IFD0_SIZE   = 2 + rows.length * 12 + 4;
  let heapOff = IFD0_OFFSET + IFD0_SIZE;

  // Assign heap offsets
  const heapOffsets = new Map<Row, number>();
  for (const r of rows) {
    if (r.bytes && r.bytes.length > 4) {
      heapOffsets.set(r, heapOff);
      heapOff += r.bytes.length;
      if (heapOff & 1) heapOff++; // word-align
    }
  }

  const totalSize = heapOff;
  const buf = new Uint8Array(totalSize);
  const dv  = new DataView(buf.buffer);

  // ── TIFF header ────────────────────────────────────────────────────────────
  buf[0] = 0x49; buf[1] = 0x49;          // "II" = LE
  dv.setUint16(2, 42,          true);     // TIFF magic
  dv.setUint32(4, IFD0_OFFSET, true);     // offset to IFD0

  // ── IFD0 ──────────────────────────────────────────────────────────────────
  let pos = IFD0_OFFSET;
  dv.setUint16(pos, rows.length, true); pos += 2;

  for (const r of rows) {
    dv.setUint16(pos,     r.tag,   true);
    dv.setUint16(pos + 2, r.type,  true);
    dv.setUint32(pos + 4, r.count, true);

    if (r.bytes === null) {
      // Inline SHORT
      if (r.inline16 !== undefined) dv.setUint16(pos + 8, r.inline16, true);
      else if (r.inline32 !== undefined) dv.setUint32(pos + 8, r.inline32, true);
    } else if (r.bytes.length <= 4) {
      // Inline bytes (left-justified)
      buf.set(r.bytes, pos + 8);
    } else {
      // Heap offset
      dv.setUint32(pos + 8, heapOffsets.get(r)!, true);
    }
    pos += 12;
  }
  dv.setUint32(pos, 0, true); // next IFD = 0

  // ── Heap ──────────────────────────────────────────────────────────────────
  for (const [r, off] of heapOffsets) {
    buf.set(r.bytes!, off);
  }

  return buf;
}

// ─── Encoding helpers ─────────────────────────────────────────────────────────

/** ASCII bytes, null-terminated. */
function ascii(str: string): Uint8Array {
  if (!str) return new Uint8Array(0);
  const b = new Uint8Array(str.length + 1);
  for (let i = 0; i < str.length; i++) b[i] = str.charCodeAt(i) & 0xff;
  return b;
}

/** UTF-16LE bytes with 2-byte null terminator. */
function utf16(str: string): Uint8Array {
  const b = new Uint8Array((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    b[i * 2]     = c & 0xff;
    b[i * 2 + 1] = (c >> 8) & 0xff;
  }
  return b;
}
