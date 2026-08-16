# Social Media Planner

Admin Panel → **Social Media Planner** (`/admin/share-scheduler`).

Submit TravelTelly media (reviews, stories/videos, trips, stock products) from
the site to your social channels:

- **Nostr** — instantly and fully working (signed kind-1 notes via the
  site's connected Nostr account; scheduling supported).
- **X (Twitter)** — instant posting via the `/api/social-publish` Netlify
  function (OAuth 1.0a, media upload + POST /2/tweets).
- **Facebook** — photo/message posts to your Page via the Graph API.
- **Instagram** — instant posts via the Content Publishing API (Business
  account required; Meta only allows *scheduled* posts for partners, so
  posting is instant-only, the queue below works as a reminder list).

## How to use

1. Open **Admin Panel → Social Media Planner** (admin account only).
2. In any platform tab, use **Pick media from the site** to fill the form with
   an existing review/story/trip/stock product, or paste a TravelTelly URL and
   auto-fill.
3. Edit the text/hashtags, then either:
   - **Post now** (needs the backend configured — see below), or
   - schedule it, or use **Copy text / Open composer** to post manually with
     the text pre-filled.

## Enabling live posting (X / Facebook / Instagram)

The keys never live in the browser. Set these in **Netlify → Site →
Environment variables** (this repo deploys via `netlify.toml`; the function is
`netlify/functions/social-publish.mjs`, endpoint `/api/social-publish`):

| Platform | Env vars | Where to get them |
|----------|----------|-------------------|
| X | `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | developer.x.com → Project → Keys & tokens (Read & Write) |
| Facebook | `FB_PAGE_ID`, `FB_PAGE_ACCESS_TOKEN` | developers.facebook.com → Meta app → Graph API Explorer (pages_manage_posts) |
| Instagram | `IG_BUSINESS_ID`, `FB_PAGE_ACCESS_TOKEN` | Same Meta app; IG account must be Business linked to the page (instagram_basic + instagram_content_publish) |

Status checks: `GET /api/social-publish` returns booleans per platform; the
planner shows a green **Ready to post** badge once configured.

> The live site currently runs on GitHub Pages, which cannot run Netlify
> functions. Until the Netlify site for this repo is deployed again, the
> planner shows "backend offline" and you can still publish via the composer
> shortcut buttons. Nostr publishing is unaffected.
