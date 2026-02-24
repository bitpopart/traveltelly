# Infinite Pagination Implementation

## Overview

Implemented infinite pagination for the homepage image grid to significantly improve loading performance and reduce bandwidth usage.

## Changes Made

### 1. New Hook: `useInfiniteImages` 

**File**: `/src/hooks/useInfiniteImages.ts`

- **Purpose**: Load images in paginated batches instead of all at once
- **Page Size**: ~10-20 images per page (fetches 5 events of each type: reviews, trips, stories, stock media)
- **Ultra-Optimized for Mobile**: Minimal page size for instant mobile loading
- **Pagination Strategy**: Uses `until` parameter to fetch older events on subsequent pages
- **Query Optimization**: All content types are queried in parallel using a single `nostr.query()` call with multiple filters
- **Fast Timeout**: 2-second timeout for quick mobile response

**Key Features**:
- First page includes TravelTelly Tour posts
- Subsequent pages use timestamp-based pagination
- Validates all images to ensure only real hosting services (no placeholders)
- Sorts images by creation time (newest first)

### 2. Updated Homepage: `Index.tsx`

**Changes**:
- Replaced `useAllImages()` with `useInfiniteImages()`
- Flattens paginated data from `infiniteImagesData.pages`
- **Mobile Layout**: Single column grid (`grid-cols-1`) for better mobile experience
- **Desktop Layout**: 3-4 column grid (`md:grid-cols-3 lg:grid-cols-4`)
- Added "Load More" button at the end of the image grid
- Shows loading spinner while fetching next page
- Button only appears when `hasNextPage` is true
- **Priority Loading**: 
  - **First image ALWAYS loads first** with `loading="eager"` and no blur effect
  - First 3 images on mobile get priority loading
  - First 10 images on desktop get priority loading
- **Mobile Skeleton**: Shows only 5 placeholders on mobile (vs 10 on desktop)

### 3. Performance Improvements

**Before**:
- Initial load: Up to 600 events (150 × 4 content types)
- All images loaded immediately
- High bandwidth on initial page load
- Slower initial render
- 2-column grid on mobile (more images to load)
- No priority loading

**After**:
- Initial load: ~10-20 events (5 × 4 content types + tour items)
- Images loaded in batches of ~10-20 per page
- **95%+ reduction** in initial bandwidth
- **Instant first image loading** with highest priority
- Much faster initial render
- User can load more on demand
- **1-column grid on mobile** (less bandwidth, faster loading)
- 2-second query timeout for quick mobile response

## User Experience

### Mobile (Single Column)
1. **Initial View**: 
   - **First image loads instantly** with highest priority
   - Homepage loads ~5-10 images total in a single column
   - First 3 images load with priority (no blur, eager loading)
2. **Scroll Down**: User sees "Load More" button
3. **Click "Load More"**: Next batch of ~5-10 images loads
4. **Repeat**: Continue loading more images as needed

### Desktop (Multi-Column)
1. **Initial View**: 
   - First image loads instantly
   - Homepage loads ~10-20 images in 3-4 columns
   - First 10 images load with priority
2. **Scroll Down**: User sees "Load More" button
3. **Click "Load More"**: Next batch loads
4. **Repeat**: Continue loading more images as needed

## Technical Details

### Query Strategy

Each page fetches 5 events from each content type (ultra-optimized for mobile):
```typescript
const filters = [
  { kinds: [34879], authors: [...], limit: 5, until: pageParam }, // Reviews
  { kinds: [30025], authors: [ADMIN], limit: 5, until: pageParam }, // Trips
  { kinds: [30023], authors: [ADMIN], limit: 5, until: pageParam }, // Stories
  { kinds: [30402], authors: [...], limit: 5, until: pageParam }, // Stock Media
];

// With 2-second timeout for fast mobile response
const abortSignal = AbortSignal.any([signal, AbortSignal.timeout(2000)]);
```

### Image Extraction

- Reviews: 1 image per event
- Stories: 1 image per event
- Trips: Multiple images per event (all extracted)
- Stock Media: 1 image per event
- Tour Posts: All images + videos (first page only)

### Pagination Parameter

The `until` parameter is set to the `created_at` timestamp of the oldest event in the previous page, ensuring chronological pagination without gaps or duplicates.

## Benefits

✅ **Ultra-Fast Initial Load**: 95%+ reduction in data fetched on first view (600 → 10-20 events)
✅ **Instant First Image**: First image always loads with highest priority
✅ **Better Performance**: Smaller initial bundle, faster rendering
✅ **Reduced Bandwidth**: Only load what the user sees
✅ **Scalable**: Works efficiently even with thousands of images
✅ **User Control**: Users decide how much content to load
✅ **Mobile Super-Optimized**: 
  - **First image loads instantly** with eager loading
  - Single column layout for easier browsing
  - Ultra-small page size (~5-10 images) for instant loading
  - Priority loading for first 3 images (no blur)
  - 2-second timeout for fast response
  - Only 5 skeleton placeholders for faster perceived loading
  - Perfect for slow 2G/3G connections

## Backward Compatibility

The old `useAllImages` hook is still available and can be used in other parts of the application if needed. The infinite pagination is only applied to the homepage image grid.

## Future Enhancements

Potential improvements for the future:

1. **Infinite Scroll**: Replace "Load More" button with automatic loading on scroll
2. **Virtualization**: Use virtual scrolling for extremely large image lists
3. **Intersection Observer**: Automatically load next page when user approaches end
4. **Prefetching**: Preload next page before user clicks "Load More"

## Testing

### Desktop Testing
1. Open the homepage in image grid view
2. Check browser DevTools Network tab
3. Observe initial query loads ~40-50 events instead of 600
4. Verify 3-4 column grid layout
5. Scroll to bottom and click "Load More"
6. Verify additional ~40-50 events are loaded
7. Repeat to confirm pagination continues correctly

### Mobile Testing
1. Open in mobile view or resize browser to mobile width
2. Verify **single column** grid layout
3. Check that initial load is ~10-20 events (not 600)
4. **Confirm first image appears instantly** before other images
5. Verify only 5 skeleton placeholders appear during loading
6. Confirm first 3 images load with priority (no blur effect)
7. Scroll to "Load More" button
8. Click and verify next batch loads quickly (~5-10 images)
9. Test on actual mobile device with slow 2G/3G connection
10. Measure time-to-first-image (should be < 1 second on 3G)
