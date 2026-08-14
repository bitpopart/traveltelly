/**
 * POST /api/orders — server-side purchase order + Lightning invoice creation.
 *
 * The old flow created the invoice in the browser and marked a purchase
 * "verified" in localStorage on a button press — forgeable and not real proof.
 * This endpoint moves order creation and Invoice generation server-side so the
 * server holds the authoritative order record (including the bolt11 payment
 * hash) that the download gateway checks before serving files.
 */
import { decodeInvoice } from './helpers/bolt11.mjs';
import { setOrder, getOrder } from './helpers/store.mjs';
import { json, preflight, preflightResponse, readJson, cryptoRandomId } from './helpers/http.mjs';

export const config = { path: '/api/orders' };

const LIGHTNING_ADDRESS = process.env.RIZFUL_LIGHTNING_ADDRESS || 'bitpopart@rizful.com';

async function resolveLNURL(address) {
  const [username, domain] = String(address).split('@');
  const url = `https://${domain}/.well-known/lnurlp/${username}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Cannot reach Lightning address (${r.status})`);
  const data = await r.json();
  if (data.tag !== 'payRequest') throw new Error('Invalid LNURL response');
  return data;
}

async function createInvoice(lnurl, amountMsat, comment) {
  const callbackUrl = `${lnurl.callback}?amount=${amountMsat}&comment=${encodeURIComponent(comment)}`;
  const r = await fetch(callbackUrl);
  const data = await r.json().catch(() => ({}));
  if (!r.ok || !data.pr) throw new Error(data.reason || 'Could not generate Lightning invoice');
  return data.pr;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  if (preflight(req)) return preflightResponse(origin);
  if (req.method !== 'POST') return json(405, { error: { message: 'Method not allowed.' } }, origin);

  const body = await readJson(req);
  const amountSats = Number(body?.amountSats);
  const productId = String(body?.productId || '').trim();
  const productTitle = String(body?.productTitle || '').trim();
  const buyerEmail = String(body?.buyerEmail || '').trim().toLowerCase();
  const images = Array.isArray(body?.images) ? body.images.filter((u) => typeof u === 'string') : [];

  if (!Number.isInteger(amountSats) || amountSats <= 0) {
    return json(400, { error: { message: 'A valid positive amount (in sats) is required.' } }, origin);
  }
  if (!productId || !productTitle || !buyerEmail) {
    return json(400, { error: { message: 'productId, productTitle and buyerEmail are required.' } }, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
    return json(400, { error: { message: 'A valid email address is required.' } }, origin);
  }

  try {
    const lnurl = await resolveLNURL(LIGHTNING_ADDRESS);
    const amountMsat = amountSats * 1000;
    if (amountMsat < lnurl.minSendable || amountMsat > lnurl.maxSendable) {
      return json(400, {
        error: {
          message: `Amount (${amountSats} sats) out of range for this Lightning address. ` +
            `Min: ${lnurl.minSendable / 1000}, Max: ${lnurl.maxSendable / 1000} sats.`,
        },
      }, origin);
    }

    const comment = `TravelTelly: ${productTitle}${
      body?.buyerName ? ` | ${body.buyerName}` : ''
    } (${buyerEmail})${body?.message ? ` — ${body.message}` : ''}`;

    const invoice = await createInvoice(lnurl, amountMsat, comment);
    const { paymentHash } = decodeInvoice(invoice);

    const order = {
      orderId: cryptoRandomId('ord'),
      paymentMethod: 'lightning',
      status: 'PENDING',
      paymentHash,
      invoice,
      amountSats,
      currency: 'SATS',
      productId,
      productTitle,
      buyerEmail,
      buyerName: String(body?.buyerName || '').trim() || undefined,
      message: String(body?.message || '').trim() || undefined,
      images,
      seller: body?.seller,
      mediaType: body?.mediaType,
      contentCategory: body?.contentCategory,
      description: String(body?.description || '').slice(0, 2000),
      category: body?.category,
      createdAt: Date.now(),
      paidAt: null,
      verifiedBy: null,
    };

    await setOrder(order);

    return json(201, {
      orderId: order.orderId,
      invoice,
      paymentHash,
      amountSats,
      status: order.status,
    }, origin);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Could not create order.';
    return json(502, { error: { message: msg } }, origin);
  }
}
