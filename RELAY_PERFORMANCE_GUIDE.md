# Relay Performance Analyzer Guide

## Overview
The Relay Performance Analyzer helps you find the fastest relay with the most content for TravelTelly.

## How It Works

### What It Tests
For each relay, it measures:
1. **Content Availability**
   - Number of reviews (kind 34879)
   - Number of stories (kind 30023)
   - Number of trips (kind 30025)
   - Total content items

2. **Performance**
   - Load time in milliseconds
   - Connection reliability

3. **Ranking**
   - Ranks relays by total content (primary)
   - Then by load speed (secondary)

### How to Use

#### Option 1: Using the Component Directly

Add the `RelayPerformance` component to any page:

```tsx
import { RelayPerformance } from '@/components/RelayPerformance';

function MyPage() {
  return (
    <div>
      <RelayPerformance />
    </div>
  );
}
```

#### Option 2: Using the Settings Page

1. Navigate to Settings
2. Add a new section for "Relay Performance"
3. Include the component in the settings UI

### Test Results

The analyzer shows:

#### Best Relay (Highlighted in Green)
- 🏆 Badge showing it's the top performer
- Total content count
- Load time
- Breakdown of content types
- Quick "Switch to {relay}" button

#### All Relays Ranked
Each relay shows:
- Ranking position (#1, #2, #3)
- Relay name
- Active indicator (if currently selected)
- Content count and load time
- Connection status
- Switch button (if not active)

### Example Results

```
🏆 Best Relay: Damus
📊 Total Content: 245 items
⚡ Load Time: 850ms
87 reviews • 95 stories • 63 trips
[Switch to Damus button]

#2 Primal
Content: 198 items
Speed: 920ms
72 reviews • 78 stories • 48 trips
[Switch to Primal button]

#3 Ditto
Content: 156 items
Speed: 1050ms
54 reviews • 62 stories • 40 trips
[Switch to Ditto button]
```

## Current Default Setup

### Default Relay
**wss://relay.damus.io** is set as the default relay.

### Available Relays
1. **Damus** - `wss://relay.damus.io` (default)
2. **Ditto** - `wss://relay.ditto.pub`
3. **Primal** - `wss://relay.primal.net`

### Using the RelaySelector

The existing RelaySelector lets you:
- See current active relay
- Select/deselect multiple relays
- Add custom relays
- View relay names and URLs

## When to Use Relay Performance Analyzer

### Use Cases

1. **First Time Setup**
   - Test all relays to find the best one
   - See which has the most TravelTelly content

2. **Slow Loading**
   - If homepage loads slowly
   - If images aren't appearing
   - If content seems outdated

3. **Connection Issues**
   - Test relay connectivity
   - Find working alternatives
   - Identify failed relays

4. **Regional Performance**
   - Different relays perform better in different regions
   - Test from your location

### Troubleshooting

**No Content Shown:**
- Relay might be down
- Try switching to the "Best Relay"
- Add custom relay if needed

**Slow Load Times:**
- Some relays are geographically far
- Switch to relay with lowest load time
- Consider your internet connection

**Connection Failed:**
- Relay might be temporarily down
- Try again in a few minutes
- Use alternative relay

## Technical Details

### Timeout
- Each relay has 3 seconds to respond
- Prevents long waits for unresponsive relays

### Query Limits
- Tests first 100 items per content type
- Enough to gauge content availability
- Fast enough for quick testing

### Caching
- Results are not cached
- Run test again for fresh results
- Network conditions may vary

### Concurrent Testing
- Tests relays sequentially (not parallel)
- Prevents network congestion
- More accurate load time measurements

## Adding to Admin Panel

To add this to the admin panel:

```tsx
// In AdminPage.tsx or similar
import { RelayPerformance } from '@/components/RelayPerformance';

function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Other admin components */}
      
      <RelayPerformance />
    </div>
  );
}
```

## Mobile Considerations

### Mobile Thumbnail Loading Fixed

The mobile thumbnail issue has been resolved:
- Increased thumbnail size: 200px → 400px
- Better quality: 60% → 75%
- Improved lazy loading: 50px → 100px margin
- Special nostr.build URL handling

### Performance on Mobile

The analyzer works on mobile but:
- May take longer on slow connections
- Test one relay at a time if needed
- Results help you choose best relay for your connection

## Best Practices

1. **Test Periodically**
   - Relay performance changes over time
   - Run test weekly or when experiencing issues

2. **Consider Content vs Speed**
   - More content = better for browsing
   - Faster speed = better for real-time updates
   - Analyzer balances both factors

3. **Try Multiple Relays**
   - Some relays excel at different content types
   - You can select multiple relays simultaneously

4. **Add Custom Relays**
   - Use RelaySelector to add custom relays
   - Then test them with the analyzer

## Future Enhancements

Potential improvements:
- Auto-test on page load
- Background monitoring
- Historical performance tracking
- Geographic relay suggestions
- Auto-switching on failure
- Content type-specific recommendations

## Conclusion

The Relay Performance Analyzer helps ensure you're always connected to the best relay for your needs, with the most content and fastest load times.
