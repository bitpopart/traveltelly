/**
 * Self-contained bolt11 (BIP-0353) decode helpers — no npm deps.
 * Used by the Netlify functions to extract a Lightning invoice's payment hash
 * so the server can cryptographically verify a WebLN payment (preimage) before
 * granting a download. Verified against the `bolt11` reference decoder.
 */
const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function polymod(values) {
  let chk = 1;
  for (let v of values) {
    const b = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((b >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function hrpExpand(hrp) {
  const out = [];
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) >> 5);
  out.push(0);
  for (let i = 0; i < hrp.length; i++) out.push(hrp.charCodeAt(i) & 31);
  return out;
}

/**
 * Decode bech32 and return { hrp, words } (5-bit words, checksum excluded).
 * Throws on invalid checksum / charset.
 */
export function bech32Decode(str) {
  const s = str.toLowerCase();
  const pos = s.lastIndexOf('1');
  if (pos < 1 || pos + 7 > s.length) throw new Error('invalid bech32 string');
  const hrp = s.slice(0, pos);
  const dataPart = s.slice(pos + 1);
  const values = [];
  for (const c of dataPart) {
    const v = CHARSET.indexOf(c);
    if (v === -1) throw new Error('invalid bech32 character');
    values.push(v);
  }
  const check = polymod(hrpExpand(hrp).concat(values));
  if (check !== 1) throw new Error('invalid bech32 checksum');
  const words = values.slice(0, values.length - 6);
  return { hrp, words };
}

function wordsToIntBE(ws) {
  let out = 0;
  for (const w of ws) out = out * 32 + w;
  return out;
}

/** Convert 5-bit words to 8-bit bytes (big-endian, right-padded). */
function convert5to8(data) {
  let value = 0;
  let bits = 0;
  const out = [];
  for (const d of data) {
    value = (value << 5) | d;
    bits += 5;
    while (bits >= 8) {
      bits -= 8;
      out.push((value >> bits) & 0xff);
    }
  }
  if (bits > 0) out.push((value << (8 - bits)) & 0xff);
  return out;
}

/** Decode a field's 5-bit words into bytes, trimming bech32 right-padding. */
function wordsToBytes(ws, trim) {
  let buf = Buffer.from(convert5to8(ws));
  if (trim && (ws.length * 5) % 8 !== 0) buf = buf.subarray(0, buf.length - 1);
  return buf;
}

const TAG_CODES = {
  1: 'payment_hash',
  16: 'payment_secret',
  13: 'description',
  19: 'payee_node_key',
  23: 'purpose_commit_hash',
  6: 'expire_time',
  24: 'min_final_cltv_expiry',
  9: 'fallback_address',
  3: 'routing_info',
  5: 'feature_bits',
};

function parseFields(dataWords) {
  // dataWords here excludes the signature (caller slices it off).
  // First 7 words = unix timestamp (35 bits).
  const timestamp = wordsToIntBE(dataWords.slice(0, 7));
  let w = dataWords.slice(7);
  const tags = [];
  while (w.length > 0) {
    const tagCode = w[0].toString();
    w = w.slice(1);
    const tagLength = wordsToIntBE(w.slice(0, 2));
    w = w.slice(2);
    const tagWords = w.slice(0, tagLength);
    w = w.slice(tagLength);
    const name = TAG_CODES[tagCode];
    let data;
    if (tagCode === '1' || tagCode === '16' || tagCode === '19' || tagCode === '23') {
      data = wordsToBytes(tagWords, true).toString('hex');
    } else if (tagCode === '13') {
      data = wordsToBytes(tagWords, true).toString('utf8');
    } else if (tagCode === '6' || tagCode === '24') {
      data = wordsToIntBE(tagWords);
    } else {
      data = null;
    }
    tags.push({ tagCode: Number(tagCode), name, data });
  }
  return { timestamp, tags };
}

/**
 * Extract payment info from a bolt11 invoice.
 * Returns { paymentHash (hex), millisatoshis, timestamp, tags }.
 */
export function decodeInvoice(bolt11) {
  if (typeof bolt11 !== 'string' || !/^ln/i.test(bolt11)) {
    throw new Error('Not a lightning payment request');
  }
  const { hrp, words } = bech32Decode(bolt11);
  if (words.length <= 104) throw new Error('Invoice too short');
  const dataWords = words.slice(0, words.length - 104); // drop signature
  const { timestamp, tags } = parseFields(dataWords);
  const paymentTag = tags.find((t) => t.tagCode === 1 && t.data);
  if (!paymentTag) throw new Error('Invoice has no payment hash');
  return {
    paymentHash: paymentTag.data,
    millisatoshis: null,
    timestamp,
    tags,
  };
}
