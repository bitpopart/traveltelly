/**
 * Social Media Planner — publish endpoint (Netlify Function).
 *
 * The Admin Panel "Social Media Planner" calls this to post TravelTelly media
 * out to X (Twitter), Facebook and Instagram. Platform credentials are secrets
 * that live ONLY in the server environment (Netlify env vars) — never in the
 * browser bundle.
 *
 * Endpoints:
 *   GET  /api/social-publish            → { backendOnline, x, facebook, instagram }
 *                                       (booleans only — no secrets ever leak)
 *   POST /api/social-publish            → { ok } and platform result
 *      body: { platform: 'x'|'facebook'|'instagram', text, imageUrl?, url? }
 *
 * Required env vars (set in Netlify → Site → Environment variables):
 *   X (Twitter):  X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
 *                 (Create: https://developer.x.com → Project → "Keys and tokens" →
 *                  Read and Write app permissions, OAuth 1.0a tokens)
 *   Facebook:     FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN
 *                 (Create a Meta app: https://developers.facebook.com → App →
 *                  add "Facebook Login"/"Pages" product → get a long-lived
 *                  Page Access Token via the Graph API Explorer with the
 *                  pages_manage_posts permission)
 *   Instagram:    IG_BUSINESS_ID, reuse FB_PAGE_ACCESS_TOKEN
 *                 (IG must be a Business/Professional account linked to the
 *                  FB page; token needs instagram_basic +
 *                  instagram_content_publish)
 *
 * Notes / platform constraints:
 *   - X uses OAuth 1.0a (HMAC-SHA1) with the v1.1 chunked media upload +
 *     POST /2/tweets.
 *   - Facebook posts a photo (with message) or a plain message.
 *   - Instagram publishes instantly via the Content Publishing API. Meta only
 *     allows *scheduled* posts for partner-whitelisted apps, so "post now" is
 *     the supported mode.
 *   - The image is fetched server-side from imageUrl and re-hosted as X media /
 *     referenced by URL for FB & IG — the client never handles tokens.
 */
export const config = { path: '/api/social-publish' };

import crypto from 'node:crypto';

const X_UPLOAD = 'https://upload.twitter.com/1.1/media/upload.json';
const X_TWEETS = 'https://api.x.com/2/tweets';
const FB_BASE = 'https://graph.facebook.com/v21.0';
const MAX_CHUNK = 5 * 1024 * 1024; // X media APPEND chunk size (5 MiB)

// ---------------------------------------------------------------------------
// Small JSON + CORS helpers (same style as create-payment-intent.mjs)
// ---------------------------------------------------------------------------

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function fail(status, error) {
  return json(status, { ok: false, error });
}

function qs(params) {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) usp.set(k, String(v));
  }
  return usp.toString();
}

async function fbGraphPost(path, params) {
  const url = `${FB_BASE}${path}?${qs(params)}`;
  const res = await fetch(url, { method: 'POST', headers: { Accept: 'application/json' } });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.error) {
    const msg = data && data.error && data.error.message
      ? `Meta API ${res.status}: ${data.error.message}`
      : `Meta API error (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---------------------------------------------------------------------------
// X (Twitter) — OAuth 1.0a HMAC-SHA1
// ---------------------------------------------------------------------------

function rfc3986(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    '%' + c.charCodeAt(0).toString(16).toUpperCase(),
  );
}

function oauthHeader(method, url, params, creds) {
  const oauth = {
    oauth_consumer_key: creds.consumerKey,
    oauth_nonce: crypto.randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.token,
    oauth_version: '1.0',
  };
  const all = { ...oauth, ...params };
  const base = Object.keys(all)
    .sort()
    .map((k) => `${rfc3986(k)}=${rfc3986(all[k])}`)
    .join('&');
  const signatureBase = `${method}&${rfc3986(url)}&${rfc3986(base)}`;
  const key = `${rfc3986(creds.consumerSecret)}&${rfc3986(creds.tokenSecret)}`;
  oauth.oauth_signature = crypto.createHmac('sha1', key).update(signatureBase).digest('base64');
  return (
    'OAuth ' +
    Object.entries(oauth)
      .map(([k, v]) => `${rfc3986(k)}="${rfc3986(v)}"`)
      .join(', ')
  );
}

async function xFetch(method, urlString, creds, params, body, contentType) {
  const res = await fetch(urlString, {
    method,
    headers: {
      Authorization: oauthHeader(method, urlString.split('?')[0], params, creds),
      ...(contentType ? { 'Content-Type': contentType } : {}),
      Accept: 'application/json',
    },
    body,
  });
  const text = await res.text();
  let data = null;
  try { data = JSON.parse(text); } catch { data = null; }
  if (!res.ok) {
    const twitterErr = data && data.errors && data.errors[0]
      ? `${data.errors[0].code}: ${data.errors[0].message}`
      : data && data.detail
        ? data.detail
        : `X API error (HTTP ${res.status})`;
    throw new Error(`X (Twitter) ${twitterErr}`);
  }
  return data;
}

async function xUploadMedia(imageUrl, creds) {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`Downloading image failed (HTTP ${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const total = buf.length;

  // Detect a sensible media type from the URL, default JPEG.
  const cleanUrl = imageUrl.split('?')[0].toLowerCase();
  const mediaType = cleanUrl.endsWith('.png') ? 'image/png'
    : cleanUrl.endsWith('.gif') ? 'image/gif'
    : cleanUrl.endsWith('.webp') ? 'image/webp'
    : 'image/jpeg';

  // 1) INIT
  const initParams = { command: 'INIT', media_type: mediaType, total_bytes: total };
  const initUrl = `${X_UPLOAD}?${qs(initParams)}`;
  const init = await xFetch('POST', initUrl, creds, initParams, undefined, undefined);
  const mediaId = String(init.media_id_string || init.media_id);
  if (!mediaId) throw new Error('X upload INIT failed (no media_id)');

  // 2) APPEND in ≤5 MiB chunks (raw binary body, params signed in URL)
  for (let index = 0, offset = 0; offset < total; index++, offset += MAX_CHUNK) {
    const chunk = buf.subarray(offset, Math.min(offset + MAX_CHUNK, total));
    const params = { command: 'APPEND', media_id: mediaId, segment_index: index };
    const url = `${X_UPLOAD}?${qs(params)}`;
    await xFetch('POST', url, creds, params, chunk, 'application/octet-stream');
  }

  // 3) FINALIZE (and wait out processing if the API asks us to)
  const finParams = { command: 'FINALIZE', media_id: mediaId };
  let fin = await xFetch('POST', `${X_UPLOAD}?${qs(finParams)}`, creds, finParams, undefined, undefined);
  for (let i = 0; i < 5 && fin && fin.processing_info && fin.processing_info.state === 'pending'; i++) {
    const wait = Math.min((fin.processing_info.check_after_secs || 2) * 1000, 10000);
    await new Promise((r) => setTimeout(r, wait));
    const statusParams = { command: 'STATUS', media_id: mediaId };
    fin = await xFetch('POST', `${X_UPLOAD}?${qs(statusParams)}`, creds, statusParams, undefined, undefined);
  }
  if (fin && fin.processing_info && fin.processing_info.state === 'failed') {
    throw new Error('X upload processing failed');
  }
  return String(mediaId);
}

async function publishX(body) {
  const creds = {
    consumerKey: process.env.X_API_KEY,
    consumerSecret: process.env.X_API_SECRET,
    token: process.env.X_ACCESS_TOKEN,
    tokenSecret: process.env.X_ACCESS_TOKEN_SECRET,
  };
  if (!creds.consumerKey || !creds.consumerSecret || !creds.token || !creds.tokenSecret) {
    throw new Error('X is not configured (missing X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET)');
  }

  const text = (body.text || '').trim();
  const mediaIds = [];
  if (body.imageUrl) {
    const id = await xUploadMedia(body.imageUrl, creds);
    mediaIds.push(id);
  }

  const payload = { text };
  if (mediaIds.length) payload.media = { media_ids: mediaIds };

  const created = await xFetch('POST', X_TWEETS, creds, {}, JSON.stringify(payload), 'application/json');
  const tweetId = created && (created.data && created.data.id);
  return {
    ok: true,
    platform: 'x',
    id: tweetId || null,
    url: tweetId ? `https://twitter.com/i/status/${tweetId}` : null,
  };
}

// ---------------------------------------------------------------------------
// Facebook — Graph API (photo post or message post)
// ---------------------------------------------------------------------------

async function publishFacebook(body) {
  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!pageId || !token) {
    throw new Error('Facebook is not configured (missing FB_PAGE_ID / FB_PAGE_ACCESS_TOKEN)');
  }
  const text = (body.text || '').trim();
  if (!text) throw new Error('Facebook post needs text');

  if (body.imageUrl) {
    const data = await fbGraphPost(`/${pageId}/photos`, {
      url: body.imageUrl,
      message: text,
      access_token: token,
    });
    return { ok: true, platform: 'facebook', id: data.id || null };
  }
  const data = await fbGraphPost(`/${pageId}/feed`, { message: text, access_token: token });
  return { ok: true, platform: 'facebook', id: data.id || null };
}

// ---------------------------------------------------------------------------
// Instagram — Content Publishing API (instant)
// ---------------------------------------------------------------------------

async function publishInstagram(body) {
  const igId = process.env.IG_BUSINESS_ID;
  const token = process.env.FB_PAGE_ACCESS_TOKEN;
  if (!igId || !token) {
    throw new Error('Instagram is not configured (missing IG_BUSINESS_ID / FB_PAGE_ACCESS_TOKEN)');
  }
  const text = (body.text || '').trim();
  if (!body.imageUrl) throw new Error('Instagram posts need a media image (imageUrl)');
  if (!text) throw new Error('Instagram post caption is required');

  const container = await fbGraphPost(`/${igId}/media`, {
    caption: text,
    image_url: body.imageUrl,
    access_token: token,
  });
  if (!container.id) throw new Error('Instagram container creation failed');

  const published = await fbGraphPost(`/${igId}/media_publish`, {
    creation_id: container.id,
    access_token: token,
  });

  return {
    ok: true,
    platform: 'instagram',
    id: published.id || container.id || null,
    url: published.permalink || null,
  };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(req) {
  const url = new URL(req.url);

  if (req.method === 'OPTIONS') return json(200, { ok: true });
  if (req.method === 'GET') {
    return json(200, {
      backendOnline: true,
      x: !!(process.env.X_API_KEY && process.env.X_API_SECRET && process.env.X_ACCESS_TOKEN && process.env.X_ACCESS_TOKEN_SECRET),
      facebook: !!(process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN),
      instagram: !!(process.env.IG_BUSINESS_ID && process.env.FB_PAGE_ACCESS_TOKEN),
    });
  }
  if (req.method !== 'POST') return json(405, { ok: false, error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { ok: false, error: 'Invalid JSON body' });
  }

  try {
    switch (body.platform) {
      case 'x': return json(200, await publishX(body));
      case 'facebook': return json(200, await publishFacebook(body));
      case 'instagram': return json(200, await publishInstagram(body));
      default: return json(400, { ok: false, error: `Unknown platform: ${body.platform}` });
    }
  } catch (err) {
    return json(500, { ok: false, error: err && err.message ? err.message : 'Publish failed' });
  }
}
