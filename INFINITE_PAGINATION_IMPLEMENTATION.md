# Infinite Pagination Implementation

## Overview

Implemented infinite pagination for the homepage image grid to significantly improve loading performance and reduce bandwidth usage.

## Changes Made

### 1. New Hook: `useInfiniteImages` 

**File**: `/src/hooks/useInfiniteImages.ts`

- **Purpose**: Load images in paginated batches instead of all at once
- **Page Size**: ~20 images per page (fetches 20 events of each type: reviews, trips, stories, stock media)
- **Pagination Strategy**: Uses `until` parameter to fetch older events on subsequent pages
- **Query Optimization**: All content types are queried in parallel using a single `nostr.query()` call with multiple filters

**Key Features**:
- First page includes TravelTelly Tour posts
- Subsequent pages use timestamp-based pagination
- Validates all images to ensure only real hosting services (no placeholders)
- Sorts images by creation time (newest first)

### 2. Updated Homepage: `Index.tsx`

**Changes**:
- Replaced `useAllImages()` with `useInfiniteImages()`
- Flattens paginated data from `infiniteImagesData.pages`
- Added "Load More" button at the end of the image grid
- Shows loading spinner while fetching next page
- Button only appears when `hasNextPage` is true

### 3. Performance Improvements

**Before**:
- Initial load: Up to 600 events (150 × 4 content types)
- All images loaded immediately
- High bandwidth on initial page load
- Slower initial render

**After**:
- Initial load: ~80-100 events (20 × 4 content types + tour items)
- Images loaded in batches of ~20 per page
- 75-85% reduction in initial bandwidth
- Much faster initial render
- User can load more on demand

## User Experience

1. **Initial View**: Homepage loads ~20 images instantly (mix of all content types)
2. **Scroll Down**: User sees "Load More" button
3. **Click "Load More"**: Next batch of ~20 images loads
4. **Repeat**: Continue loading more images as needed

## Technical Details

### Query Strategy

Each page fetches 20 events from each content type:
```typescript
const filters = [
  { kinds: [34879], authors: [...], limit: 20, until: pageParam }, // Reviews
  { kinds: [30025], authors: [ADMIN], limit: 20, until: pageParam }, // Trips
  { kinds: [30023], authors: [ADMIN], limit: 20, until: pageParam }, // Stories
  { kinds: [30402], authors: [...], limit: 20, until: pageParam }, // Stock Media
];
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

✅ **Faster Initial Load**: 75-85% reduction in data fetched on first view
✅ **Better Performance**: Smaller initial bundle, faster rendering
✅ **Reduced Bandwidth**: Only load what the user sees
✅ **Scalable**: Works efficiently even with thousands of images
✅ **User Control**: Users decide how much content to load
✅ **Mobile Friendly**: Especially beneficial on slower connections

## Backward Compatibility

The old `useAllImages` hook is still available and can be used in other parts of the application if needed. The infinite pagination is only applied to the homepage image grid.

## Future Enhancements

Potential improvements for the future:

1. **Infinite Scroll**: Replace "Load More" button with automatic loading on scroll
2. **Virtualization**: Use virtual scrolling for extremely large image lists
3. **Intersection Observer**: Automatically load next page when user approaches end
4. **Prefetching**: Preload next page before user clicks "Load More"

## Testing

To verify the implementation:

1. Open the homepage in image grid view
2. Check browser DevTools Network tab
3. Observe initial query loads ~80-100 events instead of 600
4. Scroll to bottom and click "Load More"
5. Verify additional ~80-100 events are loaded
6. Repeat to confirm pagination continues correctly
