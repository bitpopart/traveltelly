# Images Grid Configuration - PERMANENT SETUP

## ⚠️ CRITICAL: DO NOT CHANGE THIS CONFIGURATION

This document defines the **permanent configuration** for the TravelTelly images grid on the homepage.

---

## Homepage Default View

**Default View Mode:** `images` (NOT map)

**Location:** `/src/contexts/ViewModeContext.tsx`

```typescript
const [viewMode, setViewMode] = useState<ViewMode>('images');
```

**Do NOT change this to 'map'** - The homepage MUST open with images grid view.

---

## Navigation Toggle Order

**Icon Order (left to right):**
1. **Images Icon** 📸 (default active)
2. **Globe/Map Icon** 🌍 (optional view)

**Location:** `/src/components/Navigation.tsx`

Both desktop and mobile navigation have the same order. Icons are swapped so images come first.

---

## Content Types Displayed

The images grid MUST show ALL 5 content types:

1. **Reviews** (kind 34879)
   - Icon: Blue star ⭐
   - Color: `#27b0ff`
   - Link: `/review/{naddr}`

2. **Stories** (kind 30023)
   - Icon: Green book 📖
   - Color: `#b2d235`
   - Link: `/story/{naddr}`

3. **Trips** (kind 30025)
   - Icon: Yellow map pin 📍
   - Color: `#ffcc00`
   - Link: `/trip/{naddr}`

4. **Stock Media** (kind 30402)
   - Icon: Pink camera 📸
   - Color: `#ec1a58`
   - Link: `/media/preview/{naddr}`

5. **TravelTelly Tour** (kind 1)
   - Icon: Purple globe 🌍
   - Color: `#9333ea`
   - Link: `/tour-feed/{eventId}`
   - Special: Admin's curated travel posts

---

## Performance Requirements

### Query Configuration

**All queries run in PARALLEL** using `Promise.all()`:
- Reviews: limit 150
- Trips: limit 150
- Stories: limit 150
- Stock Media: limit 150

**Timeout:** 3 seconds for all queries combined

**Location:** `/src/hooks/useAllImages.ts`

```typescript
const [reviewEvents, tripEvents, storyEvents, stockEvents] = await Promise.all([
  // All 4 queries run simultaneously
]);
```

### Sorting

**Sort Order:** Newest first (by `created_at`)

```typescript
images.sort((a, b) => b.created_at - a.created_at);
```

**DO NOT use random shuffle** - It's slow and causes inconsistent display.

### Image Loading

**Priority Loading:**
- First 12 images: `priority={true}` (eager loading)
- Remaining images: `priority={false}` (lazy loading with 300px rootMargin)

**All images use:**
- `blurUp={true}` - Blur placeholder for instant visual feedback
- `thumbnail={true}` - Optimized smaller version
- `aspectRatio="1/1"` - Square grid layout

---

## Image Optimization Settings

**Location:** `/src/components/OptimizedImage.tsx`

### Thumbnail Settings
- Width: 400px
- Quality: 75%
- Lazy load root margin: 300px (start loading before visible)

### Blur Placeholder
- Width: 20px
- Quality: 20%
- Loading: eager (instant display)
- Fetch Priority: high

### Mobile Optimization
- Thumbnails load immediately: `shouldLoad = priority || thumbnail`
- Blur placeholders load eagerly
- Intersection Observer triggers 300px before viewport
- Fallback to original URL if thumbnail fails

---

## Service Worker Image Handling

**Version:** 2.0.1+

**Trusted CDN Domains:**
- nostr.build
- image.nostr.build
- void.cat
- satellite.earth
- blossom.primal.net
- primal.net
- nostrcheck.me

**Image Detection:**
- By file extension: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- By request destination: `image`
- Both methods used for mobile compatibility

**Caching:**
- Strategy: Cache images with size limit
- Max cached images: 50
- CORS mode: enabled
- Credentials: omit

---

## TravelTelly Tour Integration

**Hook:** `useTravelTellyTour()`

**Query:**
- Kind: 1 (regular notes)
- Author: Admin only (`npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`)
- Tag: `#t: ['traveltelly-tour']`
- Limit: 50

**Images Extraction:**
- Searches for URLs in content field
- Validates against allowed domains
- Adds both images and videos
- Each media item gets its own grid tile

**IMPORTANT:** Tour items MUST be included in `useAllImages` queryKey:
```typescript
queryKey: ['all-images', user?.pubkey, isContributor, tourItems?.length]
```

---

## Image Validation

**Only real image hosting services allowed:**

✅ Whitelist domains:
- nostr.build
- void.cat
- satellite.earth
- nostrcheck.me
- blossom.primal.net
- image.nostr.build
- i.nostr.build
- media.nostr.band

❌ Blocked patterns:
- placeholder services
- localhost
- data URLs
- blob URLs
- example.com

**Function:** `isValidImageUrl()` in `/src/hooks/useAllImages.ts`

---

## Grid Layout

**CSS Grid:**
- Mobile: 2 columns
- Tablet: 3 columns
- Desktop: 4 columns
- Gap: 1px (mobile), 2px (desktop)

**Each Tile:**
- Aspect ratio: 1:1 (square)
- Hover effect: Scale 105%
- Icon overlay: Top right corner
- Icon size: 40px circle
- Icon colors: Match content type

---

## Checklist for Developers

Before making ANY changes to the images grid, verify:

- [ ] Default view mode is 'images' (NOT 'map')
- [ ] Images icon comes FIRST in navigation toggle
- [ ] All 5 content types are included in useAllImages
- [ ] Tour items in queryKey dependencies
- [ ] Queries run in parallel with Promise.all
- [ ] Sort by created_at (NOT random)
- [ ] First 12 images have priority={true}
- [ ] All thumbnails use thumbnail={true}
- [ ] Service Worker allows all trusted CDN domains
- [ ] Image validation uses isValidImageUrl()

---

## Testing Checklist

After any changes, test:

- [ ] Open homepage on mobile → sees images grid immediately
- [ ] Scroll down → images load smoothly with blur placeholders
- [ ] All 5 content types visible (check icon colors)
- [ ] TravelTelly Tour items appear in grid
- [ ] Click each type → navigates to correct page
- [ ] Toggle to map view → map appears
- [ ] Toggle back to images → grid reappears
- [ ] Check browser console for image counts breakdown

---

## Common Mistakes to Avoid

❌ **DON'T:** Change default view to 'map'
❌ **DON'T:** Remove tour items from queryKey
❌ **DON'T:** Use random shuffle (slow!)
❌ **DON'T:** Run queries sequentially (use Promise.all)
❌ **DON'T:** Remove image validation
❌ **DON'T:** Block CDN domains in Service Worker
❌ **DON'T:** Set all images to lazy loading (first 12 need priority)

✅ **DO:** Keep default as 'images'
✅ **DO:** Include all 5 content types
✅ **DO:** Use parallel queries
✅ **DO:** Sort by created_at
✅ **DO:** Validate image URLs
✅ **DO:** Use priority loading for first 12 images
✅ **DO:** Test on mobile after changes

---

## Performance Benchmarks

**Target Performance:**
- Initial load: < 3 seconds
- First 12 images visible: < 1 second (with blur placeholders)
- All queries complete: < 3 seconds
- Images grid renders: < 500ms after data loads

**Actual Performance (optimized):**
- Parallel queries: ~1-2 seconds
- First 12 images: Instant (priority + eager loading)
- Blur placeholders: Instant (< 100ms)
- Full grid render: < 300ms

---

## Support

If images aren't showing:

1. Check browser console for logs
2. Look for "ALL IMAGES BREAKDOWN" message
3. Verify counts for each content type
4. Check Service Worker isn't blocking images
5. Verify relay has content (try switching relays)

For code questions, refer to:
- `/src/hooks/useAllImages.ts` - Main data fetching
- `/src/pages/Index.tsx` - Grid rendering
- `/src/components/OptimizedImage.tsx` - Image component
- `/public/sw.js` - Service Worker caching

---

**This configuration is PERMANENT and should not be changed without explicit user request.**
