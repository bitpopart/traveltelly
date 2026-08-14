/** Shared HTTP helpers for the payment/order functions. */

export function corsHeaders(origin) {
  const allowed = [
    'https://www.traveltelly.com',
    'https://traveltelly.com',
    'https://traveltelly.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ];
  const use = allowed.includes(origin) || /\.traveltelly\.com$/.test(origin || '')
    ? origin
    : 'https://traveltelly.netlify.app';
  return {
    'Access-Control-Allow-Origin': use,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-rizful-signature, x-webhook-secret',
    'Vary': 'Origin',
  };
}

export function json(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

export function preflight(req) {
  return req.method === 'OPTIONS';
}

// 204 No Content MUST NOT carry a body — the standard Response constructor
// rejects a 204 with any body and Netlify surfaces it as a 502 to the
// browser's CORS preflight. Always return the preflight with a null body.
export function preflightResponse(origin) {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function readJson(req) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

export function cryptoRandomId(prefix) {
  const rand =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}
