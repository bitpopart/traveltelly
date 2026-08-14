/**
 * GET /api/order-status?orderId= — server-authoritative status for the
 * DownloadPage. Replaces the old client-only localStorage check so downloads
 * are gated on the server-side PAID record.
 */
import { getOrder } from './helpers/store.mjs';
import { json, preflight, preflightResponse } from './helpers/http.mjs';

export const config = { path: '/api/order-status' };

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  if (preflight(req)) return preflightResponse(origin);
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json(405, { error: { message: 'Method not allowed.' } }, origin);
  }

  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') || '';
  if (!orderId) return json(400, { error: { message: 'orderId is required.' } }, origin);

  const order = await getOrder(orderId);
  if (!order) return json(404, { error: { message: 'Order not found.' } }, origin);

  return json(200, {
    orderId: order.orderId,
    status: order.status,
    paymentMethod: order.paymentMethod,
    productTitle: order.productTitle,
    amountSats: order.amountSats,
    currency: order.currency,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    verifiedBy: order.verifiedBy,
    buyerEmail: order.buyerEmail,
    buyerName: order.buyerName,
    images: Array.isArray(order.images) ? order.images : [],
  }, origin);
}
