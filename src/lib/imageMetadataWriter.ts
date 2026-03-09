/**
 * imageMetadataWriter.ts
 *
 * Embeds metadata into a JPEG by injecting an XMP APP1 segment.
 * XMP is plain UTF-8 XML — no binary offset math, no TIFF IFD complexity.
 * It is read by Lightroom, Bridge, Windows Explorer, macOS, Google Photos, etc.
 *
 * We also write a minimal EXIF APP1 for the basic fields (title, description)
 * using the simplest possible structure.
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

// ─── Main export ──────────────────────────────────────────────────────────────

export async function embedMetadataIntoJpeg(
  file: File,
  meta: MetadataToEmbed
): Promise<Blob> {
  console.log('[META] embedMetadataIntoJpeg START', file.name, file.size);

  const bytes = new Uint8Array(await file.arrayBuffer());

  // Must be a JPEG
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    console.warn('[META] Not a JPEG, returning original');
    return file;
  }

  // 1. Strip existing APP1 and APP13 segments (old EXIF / IPTC / XMP)
  const clean = stripSegments(bytes, [0xe1, 0xed]);
  console.log('[META] stripped size:', clean.length);

  // 2. Build XMP APP1 segment (plain XML)
  const xmp = buildXmpSegment(meta);
  console.log('[META] XMP segment size:', xmp.length);

  // 3. Build minimal EXIF APP1 segment
  const exif = buildMinimalExifSegment(meta);
  console.log('[META] EXIF segment size:', exif.length);

  // 4. Reassemble: SOI + EXIF + XMP + rest
  const out = concat([
    clean.subarray(0, 2),           // SOI  (FF D8)
    exif,                           // our EXIF APP1
    xmp,                            // our XMP APP1
    clean.subarray(2),              // rest of the stripped JPEG
  ]);

  console.log('[META] output size:', out.length, '— done!');
  return new Blob([out], { type: 'image/jpeg' });
}

// ─── Strip JPEG segments by marker ───────────────────────────────────────────

function stripSegments(src: Uint8Array, markers: number[]): Uint8Array {
  const parts: Uint8Array[] = [src.subarray(0, 2)]; // keep SOI
  let i = 2;
  while (i + 1 < src.length) {
    if (src[i] !== 0xff) { parts.push(src.subarray(i)); break; }
    const m = src[i + 1];
    if (m === 0xd9) { parts.push(src.subarray(i, i + 2)); break; }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) {
      parts.push(src.subarray(i, i + 2)); i += 2; continue;
    }
    if (i + 3 >= src.length) break;
    const len = (src[i + 2] << 8) | src[i + 3]; // includes the 2 length bytes
    if (markers.includes(m)) {
      i += 2 + len; // skip this segment
    } else {
      parts.push(src.subarray(i, i + 2 + len));
      i += 2 + len;
    }
  }
  return concat(parts);
}

// ─── XMP segment (APP1 with xmlns header) ────────────────────────────────────

function buildXmpSegment(meta: MetadataToEmbed): Uint8Array {
  const title = esc(meta.title ?? '');
  const description = esc(meta.description ?? '');
  const city = esc(meta.city ?? '');
  const country = esc(meta.country ?? '');
  const keywords = (meta.keywords ?? []).map(esc);
  const lat = meta.latitude;
  const lon = meta.longitude;

  const bagItems = keywords.map(k => `<rdf:li>${k}</rdf:li>`).join('');
  const gpsXml = lat != null && lon != null && !isNaN(lat) && !isNaN(lon)
    ? `<exif:GPSLatitude>${dmsStr(lat)}${lat >= 0 ? 'N' : 'S'}</exif:GPSLatitude>
       <exif:GPSLongitude>${dmsStr(lon)}${lon >= 0 ? 'E' : 'W'}</exif:GPSLongitude>`
    : '';

  const xml = `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:xmp="http://ns.adobe.com/xap/1.0/"
      xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
      xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/"
      xmlns:exif="http://ns.adobe.com/exif/1.0/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${title}</rdf:li></rdf:Alt></dc:title>
      <dc:description><rdf:Alt><rdf:li xml:lang="x-default">${description}</rdf:li></rdf:Alt></dc:description>
      <dc:subject><rdf:Bag>${bagItems}</rdf:Bag></dc:subject>
      <photoshop:City>${city}</photoshop:City>
      <photoshop:Country>${country}</photoshop:Country>
      <Iptc4xmpCore:Location>${city}${city && country ? ', ' : ''}${country}</Iptc4xmpCore:Location>
      ${gpsXml}
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

  const ns = 'http://ns.adobe.com/xap/1.0/\0';
  const nsBytes = encodeUtf8(ns);
  const xmlBytes = encodeUtf8(xml);

  // APP1 = FF E1 + uint16BE(length) + namespace + xml
  const payloadLen = nsBytes.length + xmlBytes.length;
  const seg = new Uint8Array(4 + payloadLen);
  seg[0] = 0xff; seg[1] = 0xe1;
  seg[2] = ((payloadLen + 2) >> 8) & 0xff;
  seg[3] = (payloadLen + 2) & 0xff;
  seg.set(nsBytes, 4);
  seg.set(xmlBytes, 4 + nsBytes.length);
  return seg;
}

// ─── Minimal EXIF APP1 ────────────────────────────────────────────────────────
// Writes only ImageDescription (ASCII) — the single most-read field.
// Kept minimal to avoid any offset calculation bugs.

function buildMinimalExifSegment(meta: MetadataToEmbed): Uint8Array {
  const titleParts = [meta.title, meta.city, meta.country].filter(Boolean);
  const imageDesc = titleParts.join(' - ');
  if (!imageDesc) return new Uint8Array(0);

  // ASCII string null-terminated
  const str = imageDesc + '\0';
  const strLen = str.length;

  // TIFF header:   8 bytes  (offset 0 in TIFF)
  // IFD0 start:    8
  //   entry count: 2 bytes
  //   1 entry:    12 bytes
  //   next IFD:    4 bytes
  // Total IFD:    18 bytes  (offset 8)
  // Heap start:   26
  // String:       strLen bytes

  const TIFF_START = 0;
  const IFD0_START = 8;
  const HEAP_START = IFD0_START + 2 + 1 * 12 + 4; // = 26
  const TOTAL      = HEAP_START + strLen;

  const tiff = new Uint8Array(TOTAL);
  const dv   = new DataView(tiff.buffer);

  // TIFF header
  tiff[0] = 0x49; tiff[1] = 0x49;      // "II" LE
  dv.setUint16(2, 42,        true);     // magic
  dv.setUint32(4, IFD0_START, true);   // IFD0 offset

  // IFD0: 1 entry
  dv.setUint16(IFD0_START,      1,           true); // entry count
  dv.setUint16(IFD0_START + 2,  0x010e,      true); // tag: ImageDescription
  dv.setUint16(IFD0_START + 4,  2,           true); // type: ASCII
  dv.setUint32(IFD0_START + 6,  strLen,      true); // count
  dv.setUint32(IFD0_START + 10, HEAP_START,  true); // offset to string
  dv.setUint32(IFD0_START + 14, 0,           true); // next IFD = 0

  // String in heap
  for (let i = 0; i < strLen; i++) {
    tiff[HEAP_START + i] = str.charCodeAt(i) & 0xff;
  }

  // Wrap in APP1: FF E1 + length(BE) + "Exif\0\0" + tiff
  const exifHeader = [0x45, 0x78, 0x69, 0x66, 0x00, 0x00]; // Exif\0\0
  const payloadLen = exifHeader.length + tiff.length;
  const seg = new Uint8Array(4 + payloadLen);
  seg[0] = 0xff; seg[1] = 0xe1;
  seg[2] = ((payloadLen + 2) >> 8) & 0xff;
  seg[3] = (payloadLen + 2) & 0xff;
  for (let i = 0; i < exifHeader.length; i++) seg[4 + i] = exifHeader[i];
  seg.set(tiff, 4 + exifHeader.length);
  return seg;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function concat(parts: Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

function encodeUtf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function dmsStr(decimal: number): string {
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minFull = (abs - deg) * 60;
  const min = Math.floor(minFull);
  const sec = ((minFull - min) * 60).toFixed(2);
  return `${deg},${min},${sec}`;
}
