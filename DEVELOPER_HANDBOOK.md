# Traveltelly Developer Handbook

A practical guide for developers and AI assistants working on Traveltelly.

Version: 2.0  
Last Updated: February 5, 2026

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Codebase Navigation](#codebase-navigation)
4. [Working with Nostr](#working-with-nostr)
5. [Adding Features](#adding-features)
6. [Testing & Debugging](#testing--debugging)
7. [Performance Best Practices](#performance-best-practices)
8. [Common Patterns](#common-patterns)
9. [Git Workflow](#git-workflow)
10. [Deployment](#deployment)

---

## Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: For version control
- **Nostr Extension**: nos2x, Alby, or similar (for testing login)
- **Code Editor**: VS Code recommended

### Initial Setup

```bash
# Clone repository
git clone https://github.com/bitpopart/traveltelly.git
cd traveltelly

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, run tests (optional)
npm test
```

### Project Scripts

```bash
npm run dev      # Start dev server (auto-installs deps)
npm run build    # Build for production
npm test         # Run all tests (TypeScript, ESLint, Vitest, build)
npm run deploy   # Deploy to production (requires Nostr login)
```

### Environment Setup

The project uses default configuration, but you can customize:

1. Create `.env.local` (optional):
```env
VITE_DEFAULT_RELAY=wss://relay.nostr.band
VITE_CORS_PROXY=https://proxy.shakespeare.diy/?url=
```

2. Update `src/contexts/AppContext.tsx` for defaults

---

## Development Environment

### Recommended VS Code Extensions

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **GitLens** - Git integration
- **Nostr Tools** - Nostr event inspection

### File Structure Overview

```
src/
├── components/           # UI components
│   ├── cards/           # Content cards (ReviewCard, StoryCard, etc.)
│   ├── auth/            # Authentication (LoginArea, LoginDialog)
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Other components (maps, forms, navigation)
├── pages/               # Route pages (one per URL)
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
├── contexts/            # React context providers
├── test/                # Test utilities
└── main.tsx             # App entry point
```

### Understanding the Stack

- **React 18**: UI framework with hooks and concurrent rendering
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Unstyled, accessible UI components
- **Nostrify**: Nostr protocol library
- **TanStack Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Leaflet**: Interactive maps
- **Vite**: Build tool and dev server

---

## Codebase Navigation

### Finding Code by Feature

**Want to modify**: Look in:
- Homepage → `src/pages/Index.tsx`
- Reviews feed → `src/pages/Reviews.tsx`
- Review card display → `src/components/cards/ReviewCard.tsx`
- Review detail page → `src/pages/ReviewDetail.tsx`
- Review creation form → `src/components/CreateReviewForm.tsx`
- Review data fetching → `src/hooks/useLatestReview.ts`

**Pattern**: `Page → Card Component → Hook → Nostr Query`

### Component Hierarchy

```
App (src/App.tsx)
  └── NostrLoginProvider
       └── QueryClientProvider
            └── AppProvider
                 └── BrowserRouter
                      └── AppRouter
                           └── Routes (pages)
```

### Data Flow

```
User Interaction
  ↓
Page Component
  ↓
Custom Hook (useLatest*)
  ↓
useNostr + useQuery
  ↓
Nostr Relay
  ↓
Events
  ↓
Transform/Validate
  ↓
UI Update
```

### Import Aliases

The project uses `@/` as an alias for `src/`:

```typescript
import { Button } from '@/components/ui/button';
import { useLatestReview } from '@/hooks/useLatestReview';
import { cn } from '@/lib/utils';
```

---

## Working with Nostr

### Basic Nostr Concepts

- **Event**: A JSON object signed by a private key
- **Kind**: Event type number (1 = note, 30023 = article, etc.)
- **Tags**: Metadata array (["e", "event_id"], ["p", "pubkey"])
- **NIP**: Nostr Implementation Possibility (protocol spec)
- **Relay**: Server that stores and serves events

### Querying Nostr Data

**Pattern**: Use `useNostr` + `useQuery` in custom hooks

```typescript
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';

function useLatestReview() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-review'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      
      const events = await nostr.query(
        [{ kinds: [34879], limit: 1 }],
        { signal }
      );

      return events[0];
    },
    staleTime: 2 * 60 * 1000,    // 2 minutes
    gcTime: 5 * 60 * 1000,        // 5 minutes
  });
}
```

**Key Points**:
- Always use AbortSignal with timeout
- Set appropriate staleTime and gcTime
- Return transformed data if needed
- Handle errors gracefully

### Publishing Nostr Events

**Pattern**: Use `useNostrPublish` hook

```typescript
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';

function CreateReviewForm() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useNostrPublish();

  const handleSubmit = (data) => {
    createEvent({
      kind: 34879,
      content: data.description,
      tags: [
        ['d', crypto.randomUUID()],
        ['title', data.title],
        ['rating', data.rating.toString()],
        ['category', data.category],
        ['location', data.location],
        ['g', geohashEncode(data.lat, data.lon)],
        ['image', data.imageUrl],
      ],
    });
  };

  if (!user) {
    return <LoginArea />;
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Publishing...' : 'Publish Review'}
      </Button>
    </form>
  );
}
```

**Key Points**:
- Check user login before showing form
- Use `useNostrPublish` for all event publishing
- Add proper tags for queryability
- Show loading state while publishing

### Event Validation

**Always validate events** with required tags/fields:

```typescript
function validateReview(event: NostrEvent): boolean {
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  
  if (!d || !title || !rating) return false;
  
  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) return false;
  
  return true;
}

// In query hook
const validEvents = events.filter(validateReview);
```

### Nostr Best Practices

✅ **Do**:
- Use filter tags (`#t`, `#g`, `#p`) for relay-level filtering
- Set timeouts on all queries (2-3 seconds)
- Validate events before displaying
- Cache aggressively with TanStack Query
- Use `d` tags for replaceable/addressable events

❌ **Don't**:
- Query without timeouts
- Filter in JavaScript when relay can filter
- Use multi-letter tags for categories (use `t` tag)
- Create new kinds when existing NIPs work
- Publish without checking user login

**See**: `CONTEXT.md` for complete Nostr guidelines

---

## Adding Features

### Adding a New Content Type

**Example**: Adding a "Place" content type

#### 1. Define Event Schema

Edit `NIP.md`:

```markdown
## Place System (Custom Kind 30026)

Places are points of interest with descriptions and photos.

{
  "kind": 30026,
  "content": "Place description",
  "tags": [
    ["d", "place-unique-id"],
    ["title", "Place Name"],
    ["location", "Address"],
    ["g", "geohash"],
    ["image", "photo_url"],
    ["category", "museum"],
    ["alt", "Place: Museum of Art"]
  ]
}
```

#### 2. Create Card Component

`src/components/cards/PlaceCard.tsx`:

```typescript
import { memo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { OptimizedImage } from '@/components/OptimizedImage';
import { MapPin } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface PlaceCardProps {
  place: {
    image?: string;
    title: string;
    naddr: string;
    event: NostrEvent;
  };
}

export const PlaceCard = memo(function PlaceCard({ place }: PlaceCardProps) {
  const location = place.event.tags.find(([name]) => name === 'location')?.[1];
  const category = place.event.tags.find(([name]) => name === 'category')?.[1];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <a href={`/place/${place.naddr}`}>
        {place.image && (
          <OptimizedImage
            src={place.image}
            alt={place.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardHeader>
          <h3 className="font-semibold text-lg">{place.title}</h3>
        </CardHeader>
        <CardContent>
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </div>
          )}
          {category && (
            <span className="text-xs bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
              {category}
            </span>
          )}
        </CardContent>
      </a>
    </Card>
  );
});
```

Export in `src/components/cards/index.ts`:

```typescript
export { PlaceCard } from './PlaceCard';
```

#### 3. Create Data Hook

`src/hooks/useLatestPlaces.ts`:

```typescript
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';

interface Place {
  image?: string;
  title: string;
  naddr: string;
  event: NostrEvent;
}

export function useLatestPlaces(limit: number = 10) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['latest-places', limit],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      
      const events = await nostr.query(
        [{ kinds: [30026], limit }],
        { signal }
      );

      const places: Place[] = events.map((event) => {
        const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
        const image = event.tags.find(([name]) => name === 'image')?.[1];
        
        // Generate naddr for addressable events
        const d = event.tags.find(([name]) => name === 'd')?.[1];
        const naddr = `naddr1...`; // Use proper naddr encoding

        return { image, title, naddr, event };
      });

      return places;
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
```

#### 4. Create Page

`src/pages/Places.tsx`:

```typescript
import { PlaceCard } from '@/components/cards';
import { useLatestPlaces } from '@/hooks/useLatestPlaces';
import { Skeleton } from '@/components/ui/skeleton';

export default function Places() {
  const { data: places, isLoading } = useLatestPlaces(20);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Places</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full" />
        ))}
        
        {places?.map((place) => (
          <PlaceCard key={place.naddr} place={place} />
        ))}
      </div>
    </div>
  );
}
```

#### 5. Add Route

`src/AppRouter.tsx`:

```typescript
import Places from '@/pages/Places';

// Add route before the catch-all route
<Route path="/places" element={<Places />} />
```

#### 6. Add Navigation

`src/components/Navigation.tsx`:

```typescript
<NavigationMenuItem>
  <Link to="/places">
    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
      Places
    </NavigationMenuLink>
  </Link>
</NavigationMenuItem>
```

#### 7. Update Documentation

Update `ARCHITECTURE.md` and `MASTER_GUIDE.md` with new content type.

### Adding a UI Component

**Use shadcn/ui** when possible:

```bash
# Add a new shadcn/ui component
npx shadcn-ui@latest add [component-name]
```

**Custom components** should:
- Live in `src/components/`
- Use TypeScript with proper types
- Follow PascalCase naming
- Include JSDoc comments
- Use Tailwind for styling
- Export as default or named export

---

## Testing & Debugging

### Running Tests

```bash
# All tests
npm test

# TypeScript only
npx tsc -p tsconfig.app.json --noEmit

# ESLint only
npx eslint

# Vitest only
npx vitest run

# Build only
npm run build
```

### Writing Tests

**Example**: Testing a component

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TestApp } from '@/test/TestApp';
import { PlaceCard } from './PlaceCard';

describe('PlaceCard', () => {
  it('renders place title and location', () => {
    const place = {
      title: 'Museum of Art',
      naddr: 'naddr1...',
      event: {
        kind: 30026,
        tags: [
          ['title', 'Museum of Art'],
          ['location', '123 Main St'],
        ],
      },
    };

    render(
      <TestApp>
        <PlaceCard place={place} />
      </TestApp>
    );

    expect(screen.getByText('Museum of Art')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
  });
});
```

### Debugging Nostr Queries

**Browser Console** logs all queries:

```
🔍 Query filters: [{"kinds":[34879],"limit":10}]
📥 Received 10 events
⏱️ Query completed in 342ms
```

**Debug checklist**:
1. Check relay connection (RelaySelector in UI)
2. Verify query filters in console
3. Check event count received
4. Inspect event structure in DevTools
5. Try different relay
6. Check timeout settings

### Common Issues

**Issue**: "Events not loading"
- Check relay connection
- Verify query filters
- Check timeout (increase if needed)
- Try different relay

**Issue**: "Events load but don't display"
- Check validation function
- Verify required tags exist
- Check data transformation
- Inspect browser console

**Issue**: "Publishing fails"
- Check user is logged in
- Verify Nostr extension works
- Check event structure
- Check relay accepts event kinds

---

## Performance Best Practices

### Query Optimization

✅ **Do**:
```typescript
// Combine related queries
const events = await nostr.query([
  { kinds: [1, 6, 16], '#e': [eventId] }
], { signal });

// Use timeouts
const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);

// Cache aggressively
staleTime: 2 * 60 * 1000,
gcTime: 5 * 60 * 1000,
```

❌ **Don't**:
```typescript
// Multiple separate queries
const notes = await nostr.query([{ kinds: [1] }]);
const reposts = await nostr.query([{ kinds: [6] }]);

// No timeout
const events = await nostr.query([{ kinds: [1] }]);

// No caching
staleTime: 0,
```

### Component Optimization

✅ **Use React.memo** for cards:

```typescript
export const PlaceCard = memo(function PlaceCard({ place }: PlaceCardProps) {
  // component code
});
```

✅ **Lazy load images**:

```typescript
<OptimizedImage
  src={imageUrl}
  alt={title}
  loading="lazy"
/>
```

✅ **Use proper loading states**:

```typescript
{isLoading && <Skeleton />}
{data && <Content data={data} />}
```

### Bundle Optimization

- Keep dependencies minimal
- Use dynamic imports for large features
- Avoid importing entire libraries
- Tree-shake unused code

---

## Common Patterns

### Pattern: Fetch and Display List

```typescript
// Hook
export function useLatestItems() {
  const { nostr } = useNostr();
  return useQuery({
    queryKey: ['items'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      return await nostr.query([{ kinds: [30000], limit: 10 }], { signal });
    },
  });
}

// Page
export default function ItemsPage() {
  const { data: items, isLoading } = useLatestItems();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {isLoading && <Skeleton />}
      {items?.map((item) => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}
```

### Pattern: Create Form with Login

```typescript
export function CreateItemForm() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useNostrPublish();

  if (!user) {
    return <LoginArea />;
  }

  const handleSubmit = (data) => {
    createEvent({
      kind: 30000,
      content: data.content,
      tags: [['d', crypto.randomUUID()], ['title', data.title]],
    });
  };

  return <form onSubmit={handleSubmit}>{/* fields */}</form>;
}
```

### Pattern: Detail Page with naddr

```typescript
export default function ItemDetail() {
  const { naddr } = useParams();
  const { nostr } = useNostr();

  const { data: item } = useQuery({
    queryKey: ['item', naddr],
    queryFn: async (c) => {
      const decoded = nip19.decode(naddr);
      if (decoded.type !== 'naddr') throw new Error('Invalid naddr');
      
      const { kind, pubkey, identifier } = decoded.data;
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
      
      const [event] = await nostr.query([{
        kinds: [kind],
        authors: [pubkey],
        '#d': [identifier],
      }], { signal });
      
      return event;
    },
  });

  if (!item) return <div>Loading...</div>;

  return <div>{/* item content */}</div>;
}
```

---

## Git Workflow

### Branching Strategy

- `main` - Production branch
- `dev` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

### Commit Messages

Use conventional commits:

```
feat: add places content type
fix: resolve GPS extraction issue
docs: update ARCHITECTURE.md
style: format navigation component
refactor: extract card components
test: add PlaceCard tests
chore: update dependencies
```

### Pull Request Process

1. Create feature branch from `dev`
2. Make changes
3. Run `npm test` (must pass)
4. Commit with descriptive message
5. Push to remote
6. Open PR to `dev`
7. Review and merge

---

## Deployment

### Build for Production

```bash
npm run build
```

Output: `dist/` directory

### Deploy with Nostr

```bash
npm run deploy
```

Requirements:
- Logged into Nostr
- Repository configured in settings

### Manual Deployment

1. Build: `npm run build`
2. Upload `dist/` to hosting:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static host

### Environment Variables

Production environment variables (if needed):

```env
VITE_DEFAULT_RELAY=wss://relay.nostr.band
VITE_CORS_PROXY=https://proxy.shakespeare.diy/?url=
```

---

## Additional Resources

- **ARCHITECTURE.md** - Detailed codebase structure
- **NIP.md** - Custom Nostr protocols
- **MASTER_GUIDE.md** - Complete project overview
- **CONTEXT.md** - AI system prompt (MKStack guidelines)
- **NON_NOSTR_CUSTOMERS.md** - Guest checkout implementation

---

## Getting Help

**Documentation**: Start with `MASTER_GUIDE.md`

**Issues**: Check existing issues on GitHub

**Community**: Nostr tag `#traveltelly`

**Maintainer**: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

**Happy coding! 🚀**
