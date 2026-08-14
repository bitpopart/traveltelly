/**
 * POST /api/webhook/rizful — Rizful settles an invoice async.
 *
 * For buyers who pay via QR / wallet app (no WebLN preimage), Rizful is the
 * only party that knows the payment settled. Point Rizful's payment callback
 * at this endpoint (or forward from a Netlify build hook): when it supplies the
 * invoice payment hash and/or the preimage that hash to our server-held order,
 * the order flips PENDING -> PAID and the download gateway opens.
 *
 * Payload accepted (any of these shapes):
 *   { "payment_hash": "…32-byte-hex…" }
 *   { "paymentHash": "…" }
 *   { "preimage": "…32-byte-hex…" }    -> hash verified against the order
 *
 * Protected by either a Bearer token or x-webhook-secret header equal to
 * RIZFUL_WEBHOOK_SECRET, or an HMAC-SHA256 signature in x-rizful-signature.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { getOrder, setOrder, orderIdByPaymentHash } from './helpers/store.mjs';
import { json, preflight, preflightResponse, readJson } from './helpers/http.mjs';

export const config = { path: '/api/webhook/rizful' };

function hashHex(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function authorize(req, body) {
  const secret = process.env.RIZFUL_WEBHOOK_SECRET;
  if (!secret) return true; // no secret configured: allow (documented, see README)
  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer /i, '');
  const hdr = req.headers.get('x-webhook-secret') || '';
  if (bearer && timingSafeEqual(Buffer.from(bearer), Buffer.from(secret))) return true;
  if (hdr && timingSafeEqual(Buffer.from(hdr), Buffer.from(secret))) return true;
  const sig = req.headers.get('x-rizful-signature');
  if (sig) {
    const raw = typeof body === 'string' ? body : JSON.stringify(body || {});
    const expected = createHmac('sha256', secret).update(raw).digest('hex');
    try {
      if (timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return true;
    } catch { /* fall through */ }
  }
  return false;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  if (preflight(req)) return preflightResponse(origin);
  if (req.method !== 'POST') return json(405, { error: { message: 'Method not allowed.' } }, origin);

  const rawBody = await req.text();
  const body = safeParse(rawBody);

  if (!(await authorize(req, rawBody))) {
    return json(401, { error: { message: 'Unauthorized.' } }, origin);
  }

  const paymentHash = String(body?.payment_hash || body?.paymentHash || '').toLowerCase();
  const preimage = String(body?.preimage || '');

  let order = null;
  if (paymentHash) order = await getOrder(await orderIdByPaymentHash(paymentHash));
  if (!order && preimage) {
    // resolve by preimage -> hash -> order
    const hash = hashHex(Buffer.from(preimage, 'hex'));
    order = await getOrder(await orderIdByPaymentHash(hash));
  }
  if (!order) return json(404, { error: { message: 'No pending order matches this payment.' } }, origin);

  if (preimage && !paymentHash) {
    // verify the supplied preimage against the order's real payment hash
    if (!/^[0-9a-fA-F]{64}$/.test(preimage) || hashHex(Buffer.from(preimage, 'hex')) !== order.paymentHash) {
      return json(400, { error: { message: 'Preimage does not match this order.' } }, origin);
    }
  }

  order.status = 'PAID';
  order.paidAt = Date.now();
  order.verifiedBy = 'rizful-webhook';
  await setOrder(order);

  return json(200, { ok: true, orderId: order.orderId, status: 'PAID' }, origin);
}

function safeParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
