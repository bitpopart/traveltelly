/**
 * POST /api/verify-payment — turn a PENDING order into PAID only when the
 * server can prove payment settled.
 *
 * Two proof sources are supported:
 *  1. WebLN preimage (cryptographic): the buyer pays in-browser via WebLN,
 *     which returns the preimage whose sha256 must equal the invoice's payment
 *     hash. This is real, unforgeable proof available to anyone with the bolt11.
 *  2. Rizful invoice reconciliation: for buyers who pay by QR / wallet app (no
 *     WebLN preimage available), the server asks the receiving wallet backend.
 *     Configure RIZFUL_LNBITS_BASE + RIZFUL_LNBITS_KEY (LNBits-style API) or
 *     point Rizful's settle webhook at /api/webhook/rizful (which marks PAID).
 *
 * If no proof is available the order stays PENDING and we never grant a
 * download to an unverified purchase.
 */
import { createHash } from 'node:crypto';
import { getOrder, setOrder } from './helpers/store.mjs';
import { json, preflight, preflightResponse, readJson } from './helpers/http.mjs';

export const config = { path: '/api/verify-payment' };

function preimageMatches(preimageHex, paymentHash) {
  const preimage = String(preimageHex || '');
  if (!/^[0-9a-fA-F]{64}$/.test(preimage)) return false;
  const digest = createHash('sha256').update(Buffer.from(preimage, 'hex')).digest('hex');
  return digest === String(paymentHash).toLowerCase();
}

/** Ask the receiving wallet backend whether an invoice has settled. */
async function reconcileViaRizful(order) {
  const base = process.env.RIZFUL_LNBITS_BASE;
  const key = process.env.RIZFUL_LNBITS_KEY;
  if (!base || !key || !order.paymentHash) return { reconciled: false };
  try {
    // LNBits-style admin/invoice-read key against the wallet that owns the address
    const r = await fetch(`${base.replace(/\/$/, '')}/api/v1/payments/${order.paymentHash}`, {
      headers: { 'X-Api-Key': key, 'Accept': 'application/json' },
    });
    const data = await r.json().catch(() => ({}));
    return { reconciled: true, paid: !!data.paid };
  } catch {
    return { reconciled: false };
  }
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  if (preflight(req)) return preflightResponse(origin);
  if (req.method !== 'POST') return json(405, { error: { message: 'Method not allowed.' } }, origin);

  const body = await readJson(req);
  const orderId = String(body?.orderId || '');
  if (!orderId) return json(400, { error: { message: 'orderId is required.' } }, origin);

  const order = await getOrder(orderId);
  if (!order) return json(404, { error: { message: 'Order not found.' } }, origin);

  if (order.status === 'PAID') {
    return json(200, { orderId, status: 'PAID', paid: true }, origin);
  }

  let verified = false;
  let verifiedBy = null;

  // 1) WebLN preimage proof
  if (preimageMatches(body?.preimage, order.paymentHash)) {
    verified = true;
    verifiedBy = 'webln';
  }

  // 2) Rizful backend reconciliation (non-WebLN payers)
  if (!verified) {
    const rec = await reconcileViaRizful(order);
    if (rec.reconciled && rec.paid) {
      verified = true;
      verifiedBy = 'rizful';
    } else if (!rec.reconciled) {
      return json(200, {
        orderId,
        status: order.status,
        paid: false,
        verification: 'unavailable',
        reason:
          'No WebLN proof was provided and no Rizful reconciliation is configured yet, ' +
          'so this purchase cannot be auto-verified. It stays PENDING until Rizful ' +
          'confirms settlement (webhook) or an admin confirms it.',
      }, origin);
    }
  }

  if (verified) {
    order.status = 'PAID';
    order.paidAt = Date.now();
    order.verifiedBy = verifiedBy;
    await setOrder(order);
    return json(200, { orderId, status: 'PAID', paid: true, verifiedBy }, origin);
  }

  return json(200, { orderId, status: 'PENDING', paid: false }, origin);
}
