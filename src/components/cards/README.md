# Card Components

Reusable card components for displaying content items across different pages.

## Components

### ReviewCard
Displays a travel review with rating, category, location, and author information.

**Used in**: Index, Reviews, LocationContentGrid

**Props:**
```typescript
interface ReviewCardProps {
  review: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}
```

### StoryCard
Displays a travel story/article with summary, location, and topic tags.

**Used in**: Index, Stories, LocationContentGrid

**Props:**
```typescript
interface StoryCardProps {
  story: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}
```

### TripCard
Displays a trip report with dates, photo count, and summary.

**Used in**: Index, Trips

**Props:**
```typescript
interface TripCardProps {
  trip: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}
```

### MediaCard
Displays a stock media product with pricing and media type.

**Used in**: Index, Marketplace

**Props:**
```typescript
interface MediaCardProps {
  media: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}
```

## Usage

```typescript
import { ReviewCard, StoryCard, TripCard, MediaCard } from '@/components/cards';

function MyPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.naddr} review={review} />
      ))}
    </div>
  );
}
```

## Performance

All card components are wrapped with `React.memo` to prevent unnecessary re-renders and improve scroll performance.

## Debugging

If a card is not displaying properly:
1. Check the component file in this directory
2. Verify the Nostr event has the required tags
3. Check browser console for errors
4. Ensure the image URL is valid
