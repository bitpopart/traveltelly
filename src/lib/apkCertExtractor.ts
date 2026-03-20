/**
 * Extract the APK signing certificate SHA-256 fingerprint in the browser.
 *
 * An APK is a ZIP file. The signing certificate lives in:
 *   - v1 (JAR signing): META-INF/*.RSA or META-INF/*.DSA or META-INF/*.EC
 *     These are PKCS#7 / CMS SignedData structures (DER-encoded).
 *     The signing certificate is the first certificate in the SignedData.certificates field.
 *
 * The certificate fingerprint = SHA-256( raw DER bytes of the X.509 cert ).
 * This matches exactly what zsp's verifyCertificate() produces:
 *   fingerprint := sha256.Sum256(cert.Raw)
 *
 * We only handle v1 here because:
 * - All APKs (even v2/v3 signed) still embed v1 signatures for backwards compat
 * - PWABuilder-generated APKs are v1/v2 signed
 * - Parsing the APK Signature Block (v2/v3) requires more complex binary parsing
 *
 * No external libraries needed — we parse the ZIP and DER manually.
 */

/** Read a 4-byte little-endian uint32 from a DataView */
function readU32LE(view: DataView, offset: number): number {
  return view.getUint32(offset, true);
}

/** Read a 2-byte little-endian uint16 from a DataView */
function readU16LE(view: DataView, offset: number): number {
  return view.getUint16(offset, true);
}

// ─── ZIP Parser ───────────────────────────────────────────────────────────────

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

/**
 * Minimal ZIP parser. Reads the End-of-Central-Directory record to find all
 * file entries, then decompresses (stored or deflate) each one.
 */
async function parseZip(buf: ArrayBuffer): Promise<Map<string, ZipEntry>> {
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  const entries = new Map<string, ZipEntry>();

  // Find End of Central Directory (EOCD) signature: 0x06054b50
  // Search from end (allows for comment up to 64KB)
  const eocdSig = 0x06054b50;
  let eocdOffset = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65536); i--) {
    if (readU32LE(view, i) === eocdSig) {
      eocdOffset = i;
      break;
    }
  }
  if (eocdOffset < 0) throw new Error('Not a valid ZIP file (EOCD not found)');

  const cdOffset = readU32LE(view, eocdOffset + 16);
  const cdSize   = readU32LE(view, eocdOffset + 12);
  const numEntries = readU16LE(view, eocdOffset + 10);

  // Walk Central Directory
  let cdPos = cdOffset;
  const cdSig = 0x02014b50;
  const localSig = 0x04034b50;

  for (let i = 0; i < numEntries; i++) {
    if (cdPos + 46 > cdOffset + cdSize) break;
    if (readU32LE(view, cdPos) !== cdSig) break;

    const compMethod   = readU16LE(view, cdPos + 10);
    const compSize     = readU32LE(view, cdPos + 20);
    const uncompSize   = readU32LE(view, cdPos + 24);
    const nameLen      = readU16LE(view, cdPos + 28);
    const extraLen     = readU16LE(view, cdPos + 30);
    const commentLen   = readU16LE(view, cdPos + 32);
    const localOffset  = readU32LE(view, cdPos + 42);

    const nameBytes = bytes.slice(cdPos + 46, cdPos + 46 + nameLen);
    const name = new TextDecoder().decode(nameBytes);

    // Jump to local file header
    const lPos = localOffset;
    if (lPos + 30 > buf.byteLength || readU32LE(view, lPos) !== localSig) {
      cdPos += 46 + nameLen + extraLen + commentLen;
      continue;
    }
    const lNameLen  = readU16LE(view, lPos + 26);
    const lExtraLen = readU16LE(view, lPos + 28);
    const dataStart = lPos + 30 + lNameLen + lExtraLen;
    const compData  = bytes.slice(dataStart, dataStart + compSize);

    let data: Uint8Array;
    if (compMethod === 0) {
      // STORED
      data = compData;
    } else if (compMethod === 8) {
      // DEFLATE — use DecompressionStream if available, else skip
      try {
        const ds = new DecompressionStream('deflate-raw');
        const writer = ds.writable.getWriter();
        const reader = ds.readable.getReader();
        writer.write(compData);
        writer.close();
        const chunks: Uint8Array[] = [];
        let totalLen = 0;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          totalLen += value.length;
        }
        data = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
      } catch {
        // DecompressionStream not available or failed — skip this entry
        cdPos += 46 + nameLen + extraLen + commentLen;
        continue;
      }
    } else {
      // Unsupported compression — skip
      cdPos += 46 + nameLen + extraLen + commentLen;
      continue;
    }

    entries.set(name, { name, data });
    cdPos += 46 + nameLen + extraLen + commentLen;
  }

  return entries;
}

// ─── DER / ASN.1 Parser ───────────────────────────────────────────────────────

/**
 * Parse a DER tag+length, return { tag, valueStart, valueLen, nextOffset }.
 * Handles definite short (1-byte length) and definite long (multi-byte length).
 */
function derTL(buf: Uint8Array, offset: number): { tag: number; valueStart: number; valueLen: number; next: number } {
  const tag = buf[offset];
  let lenByte = buf[offset + 1];
  let valueStart: number;
  let valueLen: number;

  if ((lenByte & 0x80) === 0) {
    // Short form
    valueLen = lenByte;
    valueStart = offset + 2;
  } else {
    // Long form: next (lenByte & 0x7f) bytes are the length
    const numLenBytes = lenByte & 0x7f;
    valueLen = 0;
    for (let i = 0; i < numLenBytes; i++) {
      valueLen = (valueLen << 8) | buf[offset + 2 + i];
    }
    valueStart = offset + 2 + numLenBytes;
  }

  return { tag, valueStart, valueLen, next: valueStart + valueLen };
}

/**
 * Extract the raw DER bytes of the first X.509 certificate embedded in a
 * PKCS#7 / CMS SignedData structure (DER-encoded).
 *
 * PKCS#7 SignedData structure (simplified):
 *   SEQUENCE {
 *     OID (1.2.840.113549.1.7.2 = signedData)
 *     [0] EXPLICIT {
 *       SEQUENCE (SignedData) {
 *         INTEGER (version)
 *         SET (digestAlgorithms)
 *         SEQUENCE (encapContentInfo)
 *         [0] (certificates) {    <-- here
 *           SEQUENCE (Certificate) { ... }
 *         }
 *         ...
 *       }
 *     }
 *   }
 */
function extractCertFromPKCS7(der: Uint8Array): Uint8Array | null {
  try {
    // Outer SEQUENCE (ContentInfo)
    const outer = derTL(der, 0);
    if (outer.tag !== 0x30) return null;

    // OID
    const oid = derTL(der, outer.valueStart);
    // skip OID value

    // [0] EXPLICIT wrapper
    const ctx0 = derTL(der, oid.next);
    if ((ctx0.tag & 0xe0) !== 0xa0) return null;

    // SignedData SEQUENCE
    const sd = derTL(der, ctx0.valueStart);
    if (sd.tag !== 0x30) return null;

    // Walk SignedData fields: version, digestAlgorithms, encapContentInfo, [0] certs
    let pos = sd.valueStart;
    const sdEnd = sd.next;

    while (pos < sdEnd) {
      const field = derTL(der, pos);

      // [0] IMPLICIT = certificates (tag 0xa0)
      if (field.tag === 0xa0) {
        // First certificate inside [0]
        const certField = derTL(der, field.valueStart);
        if (certField.tag === 0x30) {
          // Return the raw DER bytes of this certificate SEQUENCE
          return der.slice(field.valueStart, certField.next);
        }
        break;
      }

      pos = field.next;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ApkCertResult {
  fingerprint: string;  // lowercase hex SHA-256 of cert DER bytes
  source: 'v1';
}

/**
 * Extract the signing certificate SHA-256 fingerprint from an APK File object.
 * Throws if the certificate cannot be found or parsed.
 */
export async function extractApkCertFingerprint(file: File): Promise<ApkCertResult> {
  const buf = await file.arrayBuffer();
  const entries = await parseZip(buf);

  // Find META-INF signature files (.RSA / .DSA / .EC)
  const sigFiles: ZipEntry[] = [];
  for (const [name, entry] of entries) {
    const upper = name.toUpperCase();
    if (upper.startsWith('META-INF/') && (upper.endsWith('.RSA') || upper.endsWith('.DSA') || upper.endsWith('.EC'))) {
      sigFiles.push(entry);
    }
  }

  if (sigFiles.length === 0) {
    throw new Error(
      'No v1 signature found in META-INF/ — APK may be v2/v3 only.\n' +
      'Open the APK as a ZIP, find META-INF/*.RSA, and paste the cert hash manually.'
    );
  }

  for (const sigFile of sigFiles) {
    const certDer = extractCertFromPKCS7(sigFile.data);
    if (!certDer) continue;

    const hashBuf = await crypto.subtle.digest('SHA-256', certDer);
    const hex = Array.from(new Uint8Array(hashBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return { fingerprint: hex, source: 'v1' };
  }

  throw new Error('Could not parse signing certificate from APK META-INF files.');
}
