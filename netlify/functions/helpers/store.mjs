/**
 * Durable order persistence for the purchase/download gateway.
 *
 * Uses Netlify Blobs (managed key/value store) so records survive across
 * function invocations — required because Netlify Functions runtimes are
 * ephemeral. Each order is stored under `order:<orderId>` and indexed by
 * payment hash under `ph:<paymentHash>` so a webhook/Rizful settle event can
 * resolve the order.
 */
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'traveltelly-orders';

let _store;
function store() {
  if (!_store) _store = getStore({ name: STORE_NAME });
  return _store;
}

export async function getOrder(orderId) {
  if (!orderId) return null;
  const raw = await store().get(`order:${orderId}`, { type: 'text' });
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function setOrder(order) {
  if (!order || !order.orderId) throw new Error('Order requires an orderId');
  await store().set(`order:${order.orderId}`, JSON.stringify(order));
  if (order.paymentHash) {
    await store().set(`ph:${order.paymentHash}`, order.orderId);
  }
}

export async function orderIdByPaymentHash(paymentHash) {
  if (!paymentHash) return null;
  return store().get(`ph:${paymentHash}`, { type: 'text' });
}
