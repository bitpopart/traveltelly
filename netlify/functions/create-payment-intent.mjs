/**
 * Serverless Stripe Payment Intent creator (Netlify Functions).
 *
 * The client only ever holds the publishable key; the Stripe *secret* key
 * lives here in the server environment (STRIPE_SECRET_KEY) and is used to
 * create a real Payment Intent. This is the correct way to take card payments —
 * a secret key must never be shipped to the browser.
 *
 * Deploy: host on Netlify (this repo already has netlify.toml), set
 * STRIPE_SECRET_KEY in the Netlify env vars, and the marketplace card flow
 * will work end-to-end. Uses the Stripe REST API directly so there is no extra
 * npm dependency.
 */
export const config = { path: '/api/create-payment-intent' };

const STRIPE_API = 'https://api.stripe.com/v1/payment_intents';

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      // Allow the SPA origin to call this endpoint from a different host/port
      // during local dev. Same-origin calls are unaffected.
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function formEncode(obj) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) params.set(k, String(v));
  }
  return params.toString();
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return json(204, {});

  if (req.method !== 'POST') {
    return json(405, { error: { message: 'Method not allowed.' } });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('create-payment-intent: STRIPE_SECRET_KEY is not set');
    return json(503, { error: { message: 'Card checkout is not configured yet. Please use Lightning ⚡ instead.' } });
  }

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: { message: 'Invalid JSON body.' } });
  }

  const amount = Number(payload?.amount);
  const currency = String(payload?.currency || 'usd').toLowerCase();
  if (!Number.isInteger(amount) || amount <= 0) {
    return json(400, { error: { message: 'A valid positive amount (in cents) is required.' } });
  }

  try {
    const body = formEncode({
      amount,
      currency,
      'metadata[orderId]': payload?.metadata?.orderId || '',
      'metadata[productTitle]': payload?.metadata?.productTitle || '',
      'metadata[sellerPubkey]': payload?.metadata?.sellerPubkey || '',
    });

    const resp = await fetch(STRIPE_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Stripe create PaymentIntent error:', data?.error?.message || resp.status);
      return json(502, { error: { message: data?.error?.message || 'Stripe could not create the payment.' } });
    }

    return json(200, { id: data.id, client_secret: data.client_secret });
  } catch (err) {
    console.error('create-payment-intent exception:', err);
    return json(500, { error: { message: 'Card checkout failed. Please try again or use Lightning ⚡.' } });
  }
}
