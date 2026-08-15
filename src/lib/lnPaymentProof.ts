import { decode } from 'light-bolt11-decoder';

/**
 * Decode a BOLT11 invoice and return its payment hash (lowercase hex),
 * or null if the invoice can't be parsed.
 */
export function getInvoicePaymentHash(paymentRequest: string): string | null {
  try {
    const decoded = decode(paymentRequest);
    const section = decoded.sections.find((s) => s.name === 'payment_hash');
    return section && 'value' in section && typeof section.value === 'string'
      ? section.value.toLowerCase()
      : null;
  } catch {
    return null;
  }
}

function hexToBytes(hex: string): Uint8Array | null {
  const clean = hex.replace(/^0x/i, '').trim();
  if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) return null;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function sha256Hex(data: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify a Lightning payment preimage against an invoice's payment hash.
 *
 * The preimage is the cryptographic proof of payment: sha256(preimage) must
 * equal the payment hash embedded in the invoice. A preimage can only be
 * produced by the wallet that received/settled the payment, so this is the
 * light-weight way to confirm an invoice was actually paid without needing
 * access to the receiving node's API.
 */
export async function verifyPaymentPreimage(
  preimage: string,
  paymentHash: string
): Promise<boolean> {
  const bytes = hexToBytes(preimage);
  if (!bytes) return false;
  const digest = await sha256Hex(bytes);
  return digest === paymentHash.toLowerCase();
}
