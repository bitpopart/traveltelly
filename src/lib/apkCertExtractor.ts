/**
 * Extract the APK signing certificate SHA-256 fingerprint in the browser.
 *
 * Strategy (tries each in order):
 *  1. v1 JAR signing: META-INF/*.RSA / *.DSA / *.EC — PKCS#7 SignedData DER
 *  2. v2/v3 APK Signing Block: scan for the magic "APK Sig Block 42" before
 *     the Central Directory, find signer block (ID 0x7109871a), parse signer
 *     certificate chain from it.
 *
 * Cert fingerprint = SHA-256(raw DER bytes of X.509 cert) — same as zsp Go.
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function u16le(b: Uint8Array, o: number): number { return b[o] | (b[o+1] << 8); }
function u32le(b: Uint8Array, o: number): number { return (b[o] | (b[o+1]<<8) | (b[o+2]<<16) | (b[o+3]<<24)) >>> 0; }
function u64leHi(b: Uint8Array, o: number): number { return u32le(b, o+4); }  // high 32-bits (enough for size checks)
function hexOf(buf: Uint8Array): string {
  return Array.from(buf).map(x => x.toString(16).padStart(2,'0')).join('');
}

// ─── ZIP: find only the META-INF sig files + Central Directory offset ─────────

interface SigEntry { name: string; data: Uint8Array; }

async function findSigFilesInZip(buf: ArrayBuffer): Promise<{ sigFiles: SigEntry[]; cdOffset: number }> {
  const b = new Uint8Array(buf);
  const len = b.length;

  // --- Find EOCD (search backwards, allow up to 64K comment) ---
  let eocd = -1;
  for (let i = len - 22; i >= Math.max(0, len - 22 - 65535); i--) {
    if (b[i]===0x50 && b[i+1]===0x4b && b[i+2]===0x05 && b[i+3]===0x06) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a ZIP (EOCD not found)');

  const cdOffset = u32le(b, eocd + 16);
  const cdEntries = u16le(b, eocd + 10);

  // --- Walk Central Directory ---
  const sigFiles: SigEntry[] = [];
  let pos = cdOffset;

  for (let i = 0; i < cdEntries; i++) {
    if (pos + 46 > len) break;
    if (b[pos]!==0x50||b[pos+1]!==0x4b||b[pos+2]!==0x01||b[pos+3]!==0x02) break;

    const compMethod = u16le(b, pos + 10);
    const compSize   = u32le(b, pos + 20);
    const nameLen    = u16le(b, pos + 28);
    const extraLen   = u16le(b, pos + 30);
    const commentLen = u16le(b, pos + 32);
    const localOff   = u32le(b, pos + 42);

    const name = new TextDecoder().decode(b.slice(pos + 46, pos + 46 + nameLen));

    // Only read META-INF sig files — everything else we skip
    const upper = name.toUpperCase();
    const isSigFile = upper.startsWith('META-INF/') &&
      (upper.endsWith('.RSA') || upper.endsWith('.DSA') || upper.endsWith('.EC') || upper.endsWith('.SF'));

    if (isSigFile) {
      // Parse local file header to find data start
      if (localOff + 30 <= len &&
          b[localOff]===0x50&&b[localOff+1]===0x4b&&b[localOff+2]===0x03&&b[localOff+3]===0x04) {
        const lNameLen  = u16le(b, localOff + 26);
        const lExtraLen = u16le(b, localOff + 28);
        const dataStart = localOff + 30 + lNameLen + lExtraLen;
        const rawData   = b.slice(dataStart, dataStart + compSize);

        let data: Uint8Array;
        if (compMethod === 0) {
          data = rawData;
        } else if (compMethod === 8) {
          try {
            data = await inflate(rawData);
          } catch {
            pos += 46 + nameLen + extraLen + commentLen;
            continue;
          }
        } else {
          pos += 46 + nameLen + extraLen + commentLen;
          continue;
        }

        sigFiles.push({ name, data });
      }
    }

    pos += 46 + nameLen + extraLen + commentLen;
  }

  return { sigFiles, cdOffset };
}

async function inflate(compressed: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  const done = (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
  })();
  await writer.write(compressed);
  await writer.close();
  await done;
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

// ─── DER helpers ─────────────────────────────────────────────────────────────

interface TLV { tag: number; vStart: number; vLen: number; end: number; }

function readTLV(b: Uint8Array, pos: number): TLV {
  if (pos >= b.length) throw new Error(`DER read out of bounds at ${pos}`);
  const tag = b[pos];
  let lenByte = b[pos + 1];
  let vLen: number;
  let vStart: number;
  if ((lenByte & 0x80) === 0) {
    vLen = lenByte; vStart = pos + 2;
  } else {
    const n = lenByte & 0x7f;
    if (n === 0 || n > 4) throw new Error(`Unsupported DER length encoding at ${pos}`);
    vLen = 0;
    for (let i = 0; i < n; i++) vLen = (vLen << 8) | b[pos + 2 + i];
    vStart = pos + 2 + n;
  }
  return { tag, vStart, vLen, end: vStart + vLen };
}

/**
 * Extract raw DER bytes of the first X.509 certificate from a PKCS#7
 * SignedData blob. Handles both the nested [0] EXPLICIT and inline layouts.
 *
 * PKCS#7 ContentInfo ::= SEQUENCE {
 *   contentType  OID,        -- 1.2.840.113549.1.7.2
 *   content  [0] EXPLICIT {
 *     SignedData ::= SEQUENCE {
 *       version     INTEGER,
 *       digestAlgs  SET,
 *       encapCI     SEQUENCE,
 *       certificates [0] IMPLICIT OPTIONAL { Certificate... }
 *       ...
 *     }
 *   }
 * }
 */
function extractCertFromPKCS7(der: Uint8Array): Uint8Array | null {
  try {
    // Level 0: outer SEQUENCE (ContentInfo)
    const ci = readTLV(der, 0);
    if (ci.tag !== 0x30) return null;

    // Level 1: OID contentType
    const oid = readTLV(der, ci.vStart);
    if (oid.tag !== 0x06) return null;

    // Level 1: [0] EXPLICIT content wrapper  (tag = 0xa0)
    let pos1 = oid.end;
    const wrapper = readTLV(der, pos1);
    if (wrapper.tag !== 0xa0) return null;

    // Level 2: SignedData SEQUENCE
    const sd = readTLV(der, wrapper.vStart);
    if (sd.tag !== 0x30) return null;

    // Walk SignedData children looking for [0] IMPLICIT certificates
    let pos2 = sd.vStart;
    while (pos2 < sd.end) {
      const child = readTLV(der, pos2);

      if (child.tag === 0xa0) {
        // Found [0] IMPLICIT certificates — first child should be a Certificate SEQUENCE
        let certPos = child.vStart;
        while (certPos < child.end) {
          const certTlv = readTLV(der, certPos);
          if (certTlv.tag === 0x30) {
            // Return the complete DER encoding (tag + length + value)
            return der.slice(certPos, certTlv.end);
          }
          certPos = certTlv.end;
        }
      }

      pos2 = child.end;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── v2/v3 APK Signing Block ─────────────────────────────────────────────────
// Layout (before Central Directory):
//   [size_of_block u64le]
//   [id-value pairs...]
//   [size_of_block u64le]  (repeated)
//   "APK Sig Block 42"     (16 bytes magic)
//
// ID 0x7109871a = APK Signature Scheme v2 Block
// Each signer has: signed data, signatures, public key (SubjectPublicKeyInfo DER)
//   — but we need the certificate, which is inside signed data:
//   signed data -> certificates -> [length-prefixed DER certs]

function extractCertFromSigningBlockV2(b: Uint8Array, cdOffset: number): Uint8Array | null {
  try {
    // Magic is 16 bytes ending at cdOffset: "APK Sig Block 42"
    if (cdOffset < 32) return null;
    const magic = b.slice(cdOffset - 16, cdOffset);
    const expected = new TextEncoder().encode('APK Sig Block 42');
    for (let i = 0; i < 16; i++) if (magic[i] !== expected[i]) return null;

    // Block size is 8 bytes before magic
    const blockSizeHi = u32le(b, cdOffset - 24);
    const blockSizeLo = u32le(b, cdOffset - 28);
    if (blockSizeHi !== 0) return null; // >4GB blocks not handled
    const blockSize = blockSizeLo;

    // Block starts at: cdOffset - 8 (size field) - 16 (magic) - (blockSize - 8)
    const blockStart = cdOffset - 8 - 16 - (blockSize - 8);
    if (blockStart < 0 || blockStart >= cdOffset) return null;

    // First 8 bytes of block = blockSize (again), skip them
    let pos = blockStart + 8;
    const blockEnd = cdOffset - 8 - 16; // before the trailing size+magic

    // Walk ID-value pairs
    while (pos + 12 <= blockEnd) {
      const pairSizeLo = u32le(b, pos);
      const pairSizeHi = u32le(b, pos + 4);
      if (pairSizeHi !== 0) break;
      const pairSize = pairSizeLo;
      if (pairSize < 4) break;

      const id = u32le(b, pos + 8);
      const valueStart = pos + 12;
      const valueEnd   = pos + 8 + pairSize; // pairSize includes the 4-byte ID

      if (id === 0x7109871a) {
        // APK Signature Scheme v2 block
        // signers: u32le count, then each signer is u32le len prefixed
        let sp = valueStart;
        const signersLen = u32le(b, sp); sp += 4;
        const signersEnd = sp + signersLen;

        // First signer
        if (sp + 4 <= signersEnd) {
          const signerLen = u32le(b, sp); sp += 4;
          const signerEnd = sp + signerLen;

          // signed data: u32le len, then signed data block
          if (sp + 4 <= signerEnd) {
            const sdLen = u32le(b, sp); sp += 4;
            const sdStart = sp;
            const sdEnd2 = sp + sdLen;

            // inside signed data: digests (len-prefixed), then certificates (len-prefixed)
            let sdp = sdStart;

            // skip digests block
            if (sdp + 4 <= sdEnd2) {
              const digestsLen = u32le(b, sdp); sdp += 4;
              sdp += digestsLen;
            }

            // certificates block
            if (sdp + 4 <= sdEnd2) {
              const certsLen = u32le(b, sdp); sdp += 4;
              const certsEnd = sdp + certsLen;

              // first cert: u32le len, then DER bytes
              if (sdp + 4 <= certsEnd) {
                const certLen = u32le(b, sdp); sdp += 4;
                if (certLen > 0 && sdp + certLen <= certsEnd) {
                  return b.slice(sdp, sdp + certLen);
                }
              }
            }
          }
        }
      }

      pos += 8 + pairSize;
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ApkCertResult {
  fingerprint: string;
  source: 'v1' | 'v2';
}

export async function extractApkCertFingerprint(file: File): Promise<ApkCertResult> {
  const buf = await file.arrayBuffer();
  const b = new Uint8Array(buf);

  // --- Try v1 (META-INF/*.RSA) ---
  let { sigFiles, cdOffset } = await findSigFilesInZip(buf);

  // Only look at .RSA / .DSA / .EC files (not .SF)
  const certFiles = sigFiles.filter(f => {
    const u = f.name.toUpperCase();
    return u.endsWith('.RSA') || u.endsWith('.DSA') || u.endsWith('.EC');
  });

  for (const sf of certFiles) {
    const certDer = extractCertFromPKCS7(sf.data);
    if (certDer && certDer.length > 0) {
      const hash = await crypto.subtle.digest('SHA-256', certDer);
      return { fingerprint: hexOf(new Uint8Array(hash)), source: 'v1' };
    }
  }

  // --- Try v2/v3 APK Signing Block ---
  const certDerV2 = extractCertFromSigningBlockV2(b, cdOffset);
  if (certDerV2 && certDerV2.length > 0) {
    const hash = await crypto.subtle.digest('SHA-256', certDerV2);
    return { fingerprint: hexOf(new Uint8Array(hash)), source: 'v2' };
  }

  // --- Nothing worked: surface a useful diagnostic ---
  const foundNames = sigFiles.map(f => f.name).join(', ');
  throw new Error(
    `Could not extract certificate from APK.\n` +
    `META-INF files found: ${foundNames || 'none'}\n\n` +
    `Please paste the cert hash manually.\n` +
    `Get it with: keytool -printcert -jarfile your.apk`
  );
}
