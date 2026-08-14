/**
 * GET /api/download?orderId=&url=&name= — protected download proxy.
 *
 * Serves a product file's bytes ONLY when the order is in the server-side PAID
 * state. The requested `url` must exactly match one of the files recorded on
 * the order (allowlist) to prevent arbitrary/SSRF fetches. This replaces the
 * old flow where the browser fetched the raw Blossom URL after a client-side
 * "verified" flag.
 */
import { getOrder } from './helpers/store.mjs';
import { json, preflight, preflightResponse } from './helpers/http.mjs';

export const config = { path: '/api/download' };

function contentDispositionName(name) {
  // RFC 5987 encoding so filenames with spaces/unicode download correctly
  const ascii = String(name || 'download').replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name || 'download')}`;
}

export default async function handler(req) {
  const origin = req.headers.get('origin') || '';
  if (preflight(req)) return preflightResponse(origin);
  if (req.method !== 'GET') return json(405, { error: { message: 'Method not allowed.' } }, origin);

  const url = new URL(req.url);
  const orderId = url.searchParams.get('orderId') || '';
  const fileUrl = url.searchParams.get('url') || '';
  const fileName = url.searchParams.get('name') || 'download';

  if (!orderId || !fileUrl) {
    return json(400, { error: { message: 'orderId and url are required.' } }, origin);
  }

  const order = await getOrder(orderId);
  if (!order) return json(404, { error: { message: 'Order not found.' } }, origin);

  if (order.status !== 'PAID') {
    return json(403, { error: { message: 'Payment not verified yet.', code: 'PAYMENT_REQUIRED' } }, origin);
  }

  // Allowlist: the file must be one recorded on the order.
  const allowed = Array.isArray(order.images) ? order.images : [];
  if (!allowed.includes(fileUrl)) {
    return json(403, { error: { message: 'File is not part of this order.', code: 'NOT_IN_ORDER' } }, origin);
  }

  let upstream;
  try {
    upstream = await fetch(fileUrl);
  } catch {
    return json(502, { error: { message: 'Could not fetch the file.' } }, origin);
  }
  if (!upstream.ok || !upstream.body) {
    return json(502, { error: { message: 'File unavailable upstream.' } }, origin);
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
  const headers = {
    'Content-Type': contentType,
    'Content-Disposition': contentDispositionName(fileName),
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Expose-Headers': 'Content-Disposition, Content-Length',
    'Cache-Control': 'private, max-age=60',
  };
  return new Response(upstream.body, { headers });
}
