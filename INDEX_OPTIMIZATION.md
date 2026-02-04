# Index Page Optimization Guide

## Auto-Refresh Features

The Traveltelly index page (homepage) now includes comprehensive auto-refresh functionality to keep content fresh and up-to-date.

### Automatic Background Refresh

All content on the index page automatically refreshes in the background every **30 seconds**:

- ✅ **Reviews** - Latest reviews and review counts
- ✅ **Stories** - Latest travel stories  
- ✅ **Trips** - Latest trip reports
- ✅ **Stock Media** - Latest marketplace items
- ✅ **Review Map** - All review locations on the map
- ✅ **Location Tags** - Location tag cloud

This ensures that when new content is uploaded anywhere in the system (reviews, trips, stories, stock media), it will appear on the homepage within 30 seconds without requiring a manual refresh.

### Manual Refresh Button

A **"Refresh" button** is prominently displayed in the header section, allowing users to manually trigger an immediate refresh of all content.

**Features:**
- Refreshes all queries simultaneously
- Shows spinning animation during refresh
- Disabled while refresh is in progress
- Provides immediate visual feedback

## Performance Optimizations

### 1. Reduced Query Timeouts
- Reduced AJAX timeout from 3s → 2s for faster response
- Helps prevent slow relays from blocking the page load

### 2. Reduced Query Limits
- Reviews: 30 → 20 events per query
- Stories: 20 → 15 events per query  
- Trips: 20 → 15 events per query
- Stock Media: Still fetches 50 for better variety

These reduced limits mean:
- ✅ Faster initial page load
- ✅ Less bandwidth usage
- ✅ Better mobile performance
- ✅ Still shows latest content reliably

### 3. React.memo Optimization
All card components are now wrapped with `React.memo`:
- `ReviewCard`
- `StoryCard`
- `TripCard`
- `MediaCard`

**Benefits:**
- Prevents unnecessary re-renders
- Improves scroll performance
- Reduces CPU usage on mobile devices
- Better battery life on mobile

### 4. Smart Caching Strategy

**Stale Time Configuration:**
- Reviews: 5 minutes
- Stories: 5 minutes
- Stock Media: 2 minutes (more dynamic content)
- Trips: 5 minutes

**Garbage Collection Time:**
- Most queries: 5-10 minutes
- Keeps cached data available for quick navigation

### 5. Query Coordination
The `useIndexRefresh` hook coordinates all refreshes:
- Invalidates all relevant query caches simultaneously
- Prevents race conditions
- Ensures consistent state across the page

## Technical Implementation

### New Hook: `useIndexRefresh`

```typescript
import { useIndexRefresh } from '@/hooks/useIndexRefresh';

const { refreshAll, isRefreshing } = useIndexRefresh();

// Trigger manual refresh
<Button onClick={refreshAll} disabled={isRefreshing}>
  <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
  Refresh
</Button>
```

**What it refreshes:**
- Latest reviews with images
- Latest stories with images
- Latest stock media with images
- Latest trips with images
- All count queries
- Map location data
- Location tag cloud

### Auto-Refresh Configuration

All data hooks use TanStack Query's `refetchInterval` option:

```typescript
useQuery({
  queryKey: ['latest-reviews'],
  queryFn: fetchReviews,
  refetchInterval: 30000, // 30 seconds
  refetchOnMount: true,
  refetchOnWindowFocus: true,
})
```

## User Experience

### When New Content is Uploaded

**Scenario:** Admin uploads a new review with GPS coordinates

1. **0 seconds:** Review is published to Nostr relays
2. **0-30 seconds:** Background auto-refresh picks up the new review
3. **Immediate:** New review appears on homepage
4. **Immediate:** Review count increments
5. **Immediate:** New marker appears on map
6. **Immediate:** Location tag may appear in tag cloud

### Mobile Performance

The optimizations ensure the homepage loads quickly even on slow mobile connections:
- ✅ Reduced query limits = less data transfer
- ✅ Shorter timeouts = faster failure recovery
- ✅ React.memo = smoother scrolling
- ✅ Smart caching = instant navigation

## Monitoring

Console logs show refresh activity:
```
✅ Index page refreshed successfully
📸 Stock media items query: X total events
✅ Active stock media count: X
```

## Future Enhancements

Potential improvements:
- [ ] Visual "New Content Available" notification badge
- [ ] Configurable refresh interval in user settings
- [ ] Pause auto-refresh when tab is not visible (save bandwidth)
- [ ] Progressive loading for very slow connections
- [ ] WebSocket-based real-time updates (if relay supports)
