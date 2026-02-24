# Infinite Pagination Implementation

## Overview

Implemented infinite pagination for the homepage image grid to significantly improve loading performance and reduce bandwidth usage.

## Changes Made

### 1. New Hook: `useInfiniteImages` 

**File**: `/src/hooks/useInfiniteImages.ts`

- **Purpose**: Load images in paginated batches instead of all at once
- **Page Size**: ~10 images per page (fetches 10 events of each type: reviews, trips, stories, stock media)
- **Optimized for Mobile**: Reduced page size for faster mobile loading
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
- **Mobile Layout**: Single column grid (`grid-cols-1`) for better mobile experience
- **Desktop Layout**: 3-4 column grid (`md:grid-cols-3 lg:grid-cols-4`)
- Added "Load More" button at the end of the image grid
- Shows loading spinner while fetching next page
- Button only appears when `hasNextPage` is true
- **Priority Loading**: First 5 images on mobile, 12 on desktop load with priority

### 3. Performance Improvements

**Before**:
- Initial load: Up to 600 events (150 × 4 content types)
- All images loaded immediately
- High bandwidth on initial page load
- Slower initial render
- 2-column grid on mobile (more images to load)

**After**:
- Initial load: ~40-50 events (10 × 4 content types + tour items)
- Images loaded in batches of ~10 per page
- **90%+ reduction** in initial bandwidth
- Much faster initial render
- User can load more on demand
- **1-column grid on mobile** (less bandwidth, faster loading)

## User Experience

### Mobile (Single Column)
1. **Initial View**: Homepage loads ~10 images instantly in a single column
2. **Scroll Down**: User sees "Load More" button
3. **Click "Load More"**: Next batch of ~10 images loads
4. **Repeat**: Continue loading more images as needed

### Desktop (Multi-Column)
1. **Initial View**: Homepage loads ~10-15 images in 3-4 columns
2. **Scroll Down**: User sees "Load More" button
3. **Click "Load More"**: Next batch loads
4. **Repeat**: Continue loading more images as needed

## Technical Details

### Query Strategy

Each page fetches 10 events from each content type (optimized for mobile):
```typescript
const filters = [
  { kinds: [34879], authors: [...], limit: 10, until: pageParam }, // Reviews
  { kinds: [30025], authors: [ADMIN], limit: 10, until: pageParam }, // Trips
  { kinds: [30023], authors: [ADMIN], limit: 10, until: pageParam }, // Stories
  { kinds: [30402], authors: [...], limit: 10, until: pageParam }, // Stock Media
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

✅ **Faster Initial Load**: 90%+ reduction in data fetched on first view
✅ **Better Performance**: Smaller initial bundle, faster rendering
✅ **Reduced Bandwidth**: Only load what the user sees
✅ **Scalable**: Works efficiently even with thousands of images
✅ **User Control**: Users decide how much content to load
✅ **Mobile Optimized**: 
  - Single column layout for easier browsing
  - Smaller page size (~10 images) for faster loading
  - Priority loading for first 5 images
  - Ideal for slower mobile connections

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
3. Check that initial load is ~40-50 events (not 600)
4. Confirm first 5 images load with priority (faster)
5. Scroll to "Load More" button
6. Click and verify next batch loads quickly
7. Test on actual mobile device with slow 3G/4G connection
