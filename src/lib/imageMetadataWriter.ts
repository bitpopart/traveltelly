/**
 * Image Metadata Writer — pure browser EXIF injector, zero dependencies.
 *
 * How it works:
 *   1. Read the JPEG as an ArrayBuffer.
 *   2. Build a brand-new EXIF APP1 segment (TIFF little-endian layout).
 *   3. Walk the original JPEG and copy every segment EXCEPT any existing
 *      APP1 (0xFFE1) — so we never have duplicate EXIF.
 *   4. Output:  FF D8  +  our new APP1  +  every other original segment.
 *
 * Fields written (all universally recognised):
 *   IFD0  0x010E  ImageDescription  ASCII      title – city – country
 *   IFD0  0x013B  Artist            ASCII      "Traveltelly"
 *   IFD0  0x8298  Copyright         ASCII      city + country
 *   IFD0  0x9C9B  XPTitle           UTF-16LE   title          (Windows)
 *   IFD0  0x9C9C  XPComment         UTF-16LE   description    (Windows)
 *   IFD0  0x9C9E  XPKeywords        UTF-16LE   tags           (Windows)
 *   GPS   0x0001  GPSLatitudeRef
 *   GPS   0x0002  GPSLatitude       RATIONAL
 *   GPS   0x0003  GPSLongitudeRef
 *   GPS   0x0004  GPSLongitude      RATIONAL
 *   GPS   0x0012  GPSMapDatum       ASCII      "WGS-84"
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

// ─── public entry point ───────────────────────────────────────────────────────

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
    console.warn('[EXIF] Non-JPEG file — returning unchanged.');
    return file;
  }

  try {
    const src = new Uint8Array(await file.arrayBuffer());

    // validate JPEG SOI
    if (src[0] !== 0xff || src[1] !== 0xd8) {
      console.warn('[EXIF] Not a valid JPEG — returning unchanged.');
      return file;
    }

    const app1 = buildApp1(meta);
    const stripped = stripApp1(src);           // remove old EXIF APP1 segments
    const out = concat([
      new Uint8Array([0xff, 0xd8]),             // SOI
      app1,                                     // our new EXIF
      stripped.subarray(2),                     // rest of image (skip original SOI)
    ]);

    console.log(`[EXIF] Written OK — ${out.length} bytes`);
    return new Blob([out], { type: 'image/jpeg' });
  } catch (err) {
    console.error('[EXIF] Failed:', err);
    return file;
  }
}

// ─── concat helper ────────────────────────────────────────────────────────────

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

// ─── strip existing APP1 segments from a JPEG ────────────────────────────────

function stripApp1(src: Uint8Array): Uint8Array {
  const parts: Uint8Array[] = [];
  parts.push(new Uint8Array([0xff, 0xd8])); // SOI always first
  let i = 2;
  while (i < src.length - 1) {
    if (src[i] !== 0xff) { parts.push(src.subarray(i)); break; }
    const marker = src[i + 1];
    // markers with no length field
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      parts.push(new Uint8Array([0xff, marker]));
      i += 2;
      continue;
    }
    const segLen = (src[i + 2] << 8) | src[i + 3]; // includes the 2 length bytes
    if (marker === 0xe1) {
      // skip — this is APP1 (EXIF or XMP)
      i += 2 + segLen;
    } else {
      parts.push(src.subarray(i, i + 2 + segLen));
      i += 2 + segLen;
    }
  }
  return concat(parts);
}

// ─── build FF E1 APP1 segment ─────────────────────────────────────────────────

function buildApp1(meta: MetadataToEmbed): Uint8Array {
  const tiff = buildTiff(meta);
  // APP1 = FF E1 + 2-byte length (big-endian, includes these 2 bytes) + "Exif\0\0" + tiff
  const exifHeader = asciiBytes('Exif\0\0');
  const payloadSize = exifHeader.length + tiff.length;
  const seg = new Uint8Array(4 + payloadSize);
  const dv = new DataView(seg.buffer);
  dv.setUint8(0, 0xff);
  dv.setUint8(1, 0xe1);
  dv.setUint16(2, payloadSize + 2, false); // big-endian, includes itself
  seg.set(exifHeader, 4);
  seg.set(tiff, 4 + exifHeader.length);
  return seg;
}

// ─── build TIFF block ─────────────────────────────────────────────────────────

function buildTiff(meta: MetadataToEmbed): Uint8Array {
  /*
   * TIFF little-endian layout:
   *   0x00  "II" (LE marker)
   *   0x02  0x2A 0x00 (TIFF magic)
   *   0x04  uint32 offset to IFD0 = 8
   *   0x08  IFD0 entries
   *   ...   IFD0 value heap
   *   ...   GPS IFD entries (if any)
   *   ...   GPS value heap
   */

  // ── collect IFD0 field entries ────────────────────────────────────────────

  const ifd0Fields: Field[] = [];

  const titleLine = [meta.title, meta.city, meta.country].filter(Boolean).join(' - ');
  if (titleLine)        ifd0Fields.push(asciiField(0x010e, titleLine));
  if (meta.title)       ifd0Fields.push(asciiField(0x013b, 'Traveltelly'));
  if (meta.city || meta.country)
                        ifd0Fields.push(asciiField(0x8298, [meta.city, meta.country].filter(Boolean).join(', ')));
  if (meta.title)       ifd0Fields.push(utf16Field(0x9c9b, meta.title));
  if (meta.description) ifd0Fields.push(utf16Field(0x9c9c, meta.description));
  if (meta.keywords?.length)
                        ifd0Fields.push(utf16Field(0x9c9e, meta.keywords.join('; ')));

  // GPS pointer placeholder (tag 0x8825, type LONG, count 1) — value filled later
  const gpsFields: Field[] = [];
  const hasGps =
    meta.latitude  != null && !isNaN(meta.latitude) &&
    meta.longitude != null && !isNaN(meta.longitude);

  if (hasGps) {
    gpsFields.push(asciiField(0x0001, meta.latitude! >= 0 ? 'N\0' : 'S\0'));
    gpsFields.push(rationalField(0x0002, dms(meta.latitude!)));
    gpsFields.push(asciiField(0x0003, meta.longitude! >= 0 ? 'E\0' : 'W\0'));
    gpsFields.push(rationalField(0x0004, dms(meta.longitude!)));
    gpsFields.push(asciiField(0x0012, 'WGS-84\0'));
  }

  // ── layout calculation ────────────────────────────────────────────────────
  // TIFF header: 8 bytes
  // IFD0: 2 + n*12 + 4 bytes  (+ optional GPS pointer entry adds 12 bytes)
  // IFD0 value heap
  // GPS IFD: 2 + m*12 + 4 bytes
  // GPS value heap

  const tiffHeaderSize = 8;
  const ifd0Count = ifd0Fields.length + (hasGps ? 1 : 0);
  const ifd0BlockSize = 2 + ifd0Count * 12 + 4;
  const ifd0Start = tiffHeaderSize; // = 8

  // compute IFD0 heap
  let cursor = ifd0Start + ifd0BlockSize;
  const ifd0Heap: HeapEntry[] = [];
  for (const f of ifd0Fields) {
    if (f.data.length > 4) {
      ifd0Heap.push({ field: f, offset: cursor });
      cursor += f.data.length;
      if (cursor & 1) cursor++; // word-align
    }
  }

  // GPS IFD starts here
  const gpsIfdStart = cursor;
  const gpsCount = gpsFields.length;
  const gpsBlockSize = hasGps ? 2 + gpsCount * 12 + 4 : 0;

  // compute GPS heap
  let gpsCursor = gpsIfdStart + gpsBlockSize;
  const gpsHeap: HeapEntry[] = [];
  if (hasGps) {
    for (const f of gpsFields) {
      if (f.data.length > 4) {
        gpsHeap.push({ field: f, offset: gpsCursor });
        gpsCursor += f.data.length;
        if (gpsCursor & 1) gpsCursor++;
      }
    }
  }

  const totalSize = gpsCursor;
  const buf = new Uint8Array(totalSize);
  const dv = new DataView(buf.buffer);

  // ── write TIFF header ─────────────────────────────────────────────────────
  buf[0] = 0x49; buf[1] = 0x49;          // "II" little-endian
  dv.setUint16(2, 0x002a, true);          // TIFF magic
  dv.setUint32(4, ifd0Start, true);       // offset to IFD0

  // ── write IFD0 ────────────────────────────────────────────────────────────
  let pos = ifd0Start;
  dv.setUint16(pos, ifd0Count, true); pos += 2;

  // regular IFD0 fields (sorted by tag as TIFF spec requires)
  const allIfd0 = [...ifd0Fields].sort((a, b) => a.tag - b.tag);

  for (const f of allIfd0) {
    const heap = ifd0Heap.find(h => h.field === f);
    writeIfdEntry(dv, pos, f, heap?.offset);
    pos += 12;
  }

  // GPS sub-IFD pointer
  if (hasGps) {
    dv.setUint16(pos,     0x8825, true); // tag
    dv.setUint16(pos + 2, 4,      true); // type LONG
    dv.setUint32(pos + 4, 1,      true); // count
    dv.setUint32(pos + 8, gpsIfdStart, true); // value = offset to GPS IFD
    pos += 12;
  }

  dv.setUint32(pos, 0, true); pos += 4; // next IFD offset = 0

  // write IFD0 heap
  for (const h of ifd0Heap) {
    buf.set(h.field.data, h.offset);
  }

  // ── write GPS IFD ─────────────────────────────────────────────────────────
  if (hasGps) {
    pos = gpsIfdStart;
    dv.setUint16(pos, gpsCount, true); pos += 2;

    const gpsAllSorted = [...gpsFields].sort((a, b) => a.tag - b.tag);
    for (const f of gpsAllSorted) {
      const heap = gpsHeap.find(h => h.field === f);
      writeIfdEntry(dv, pos, f, heap?.offset);
      pos += 12;
    }
    dv.setUint32(pos, 0, true); // next IFD = 0

    for (const h of gpsHeap) {
      buf.set(h.field.data, h.offset);
    }
  }

  return buf;
}

// ─── IFD helpers ──────────────────────────────────────────────────────────────

interface Field {
  tag: number;
  type: number;  // 1=BYTE 2=ASCII 5=RATIONAL 7=UNDEFINED
  count: number;
  data: Uint8Array;
}

interface HeapEntry { field: Field; offset: number; }

function writeIfdEntry(dv: DataView, pos: number, f: Field, heapOffset?: number) {
  dv.setUint16(pos,     f.tag,   true);
  dv.setUint16(pos + 2, f.type,  true);
  dv.setUint32(pos + 4, f.count, true);
  if (f.data.length <= 4) {
    // inline — left-justified in the 4-byte value field
    for (let i = 0; i < f.data.length; i++) {
      dv.setUint8(pos + 8 + i, f.data[i]);
    }
  } else {
    dv.setUint32(pos + 8, heapOffset!, true);
  }
}

function asciiField(tag: number, str: string): Field {
  const data = new Uint8Array(str.length + (str.endsWith('\0') ? 0 : 1));
  for (let i = 0; i < str.length; i++) data[i] = str.charCodeAt(i) & 0xff;
  // last byte already 0 from Uint8Array init
  return { tag, type: 2, count: data.length, data };
}

function utf16Field(tag: number, str: string): Field {
  // UTF-16LE with null terminator
  const data = new Uint8Array((str.length + 1) * 2);
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    data[i * 2]     = c & 0xff;
    data[i * 2 + 1] = (c >> 8) & 0xff;
  }
  return { tag, type: 1 /* BYTE */, count: data.length, data };
}

function rationalField(tag: number, rationals: Array<[number, number]>): Field {
  const data = new Uint8Array(rationals.length * 8);
  const dv = new DataView(data.buffer);
  for (let i = 0; i < rationals.length; i++) {
    dv.setUint32(i * 8,     rationals[i][0], true);
    dv.setUint32(i * 8 + 4, rationals[i][1], true);
  }
  return { tag, type: 5 /* RATIONAL */, count: rationals.length, data };
}

// ─── GPS DMS ──────────────────────────────────────────────────────────────────

function dms(decimal: number): Array<[number, number]> {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = Math.round((minFull - min) * 60 * 10000);
  return [[deg, 1], [min, 1], [sec, 10000]];
}

// ─── tiny helpers ─────────────────────────────────────────────────────────────

function asciiBytes(str: string): Uint8Array {
  const b = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) b[i] = str.charCodeAt(i);
  return b;
}
