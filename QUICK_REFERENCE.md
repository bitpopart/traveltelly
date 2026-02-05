# Traveltelly Quick Reference

Cheat sheet for common tasks and commands.

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Deploy to production
npm run deploy
```

---

## File Locations

| What | Where |
|------|-------|
| Homepage | `src/pages/Index.tsx` |
| Reviews feed | `src/pages/Reviews.tsx` |
| Review card | `src/components/cards/ReviewCard.tsx` |
| Review hook | `src/hooks/useLatestReview.ts` |
| Create review | `src/components/CreateReviewForm.tsx` |
| Admin panel | `src/pages/AdminPanel.tsx` |
| Customer management | `src/components/CustomerManagement.tsx` |
| Marketplace | `src/pages/Marketplace.tsx` |
| Guest portal | `src/pages/GuestPortal.tsx` |
| Navigation | `src/components/Navigation.tsx` |
| Routing | `src/AppRouter.tsx` |
| Protocol docs | `NIP.md` |

---

## URL Routes

| URL | Page | Purpose |
|-----|------|---------|
| `/` | Index | Homepage |
| `/reviews` | Reviews | Reviews feed |
| `/review/:naddr` | ReviewDetail | Single review |
| `/stories` | Stories | Stories feed |
| `/story/:naddr` | StoryDetail | Single story |
| `/trips` | Trips | Trips feed |
| `/trip/:naddr` | TripDetail | Single trip |
| `/marketplace` | Marketplace | Stock media |
| `/media/preview/:naddr` | MediaPreview | Media detail |
| `/guest-portal` | GuestPortal | Guest customer portal |
| `/admin` | AdminPanel | Admin dashboard |
| `/create-review` | CreateReview | Create new review |
| `/:location` | LocationPage | Location content |

---

## Nostr Event Kinds

| Kind | Type | Purpose |
|------|------|---------|
| `34879` | Addressable | Reviews |
| `30023` | Addressable | Stories (NIP-23) |
| `30025` | Addressable | Trips |
| `30402` | Addressable | Stock media (NIP-99) |
| `30078` | Addressable | Customer records (admin only) |
| `30079` | Addressable | Purchase records |
| `31922` | Addressable | Date-based events (NIP-52) |
| `31923` | Addressable | Time-based events (NIP-52) |
| `1` | Regular | Notes |
| `7` | Regular | Reactions (NIP-25) |

---

## Common Hooks

### Data Fetching
```typescript
useLatestReview()         // Latest review
useLatestReviews(n)       // Last n reviews
useLatestStory()          // Latest story
useLatestStories(n)       // Last n stories
useLatestTrip()           // Latest trip
useLatestTrips(n)         // Last n trips
useLatestStockMedia()     // Latest stock media
useLatestStockMediaItems(n) // Last n stock media

useReviewCount()          // Total reviews
useStoryCount()           // Total stories
useTripCount()            // Total trips
useStockMediaCount()      // Total stock media
```

### User & Auth
```typescript
useCurrentUser()          // Get logged-in user
useAuthor(pubkey)         // Get user profile
useNostrPublish()         // Publish events
```

### Customer Management
```typescript
useCustomers()            // All customers (admin)
useCustomer(email)        // Specific customer
useCreateCustomer()       // Create/update customer
useCustomerAccess(email)  // Check customer access
useCustomerSession()      // Guest session state
```

### Other
```typescript
useNostr()                // Nostr query/publish
useAppContext()           // Global app state
useTheme()                // Theme management
useToast()                // Toast notifications
```

---

## Component Patterns

### Query and Display
```typescript
const { data, isLoading } = useLatestReviews(10);

return (
  <div>
    {isLoading && <Skeleton />}
    {data?.map((item) => <Card key={item.id} item={item} />)}
  </div>
);
```

### Publish Event
```typescript
const { mutate: createEvent, isPending } = useNostrPublish();

createEvent({
  kind: 30023,
  content: data.content,
  tags: [
    ['d', crypto.randomUUID()],
    ['title', data.title],
  ],
});
```

### Login Gate
```typescript
const { user } = useCurrentUser();

if (!user) {
  return <LoginArea />;
}

return <Form />;
```

---

## Nostr Query Examples

### Simple Query
```typescript
const events = await nostr.query(
  [{ kinds: [1], limit: 10 }],
  { signal }
);
```

### Filter by Author
```typescript
const events = await nostr.query(
  [{ kinds: [30023], authors: [pubkey] }],
  { signal }
);
```

### Filter by Tag
```typescript
const events = await nostr.query(
  [{ kinds: [34879], '#t': ['cafe'] }],
  { signal }
);
```

### Addressable Event
```typescript
const events = await nostr.query(
  [{
    kinds: [30023],
    authors: [pubkey],
    '#d': [identifier],
  }],
  { signal }
);
```

### Multiple Filters
```typescript
const events = await nostr.query([
  { kinds: [1], authors: [pubkey] },
  { kinds: [6], '#e': [eventId] },
], { signal });
```

---

## TanStack Query Config

### Standard Configuration
```typescript
useQuery({
  queryKey: ['reviews'],
  queryFn: async (c) => {
    const signal = AbortSignal.any([c.signal, AbortSignal.timeout(2000)]);
    return await nostr.query([{ kinds: [34879] }], { signal });
  },
  staleTime: 2 * 60 * 1000,    // 2 minutes
  gcTime: 5 * 60 * 1000,        // 5 minutes
});
```

---

## shadcn/ui Components

### Available Components (48+)

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
```

Full list in `CONTEXT.md` or see `src/components/ui/`

---

## Test Account

### Guest Test Account
- **Email**: `admin-non-nostr@traveltelly.test`
- **Name**: Admin Non-Nostr
- **Access**: Free unlimited downloads
- **Auto-created**: When admin visits admin panel

### Admin Account
- **NPub**: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`
- **Hex**: `7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35`
- **Name**: traveltelly
- **NIP-05**: traveltelly@primal.net

---

## Color Scheme

```typescript
const colors = {
  reviews: '#27b0ff',      // Blue
  stories: '#b2d235',      // Green
  trips: '#ffcc00',        // Yellow
  stockMedia: '#ec1a58',   // Pink
  nostr: '#b700d7',        // Purple
  lightning: '#ff9500',    // Orange
  dark: '#393636',         // Dark gray
};
```

---

## Debugging Checklist

When something's not working:

1. ✅ Check browser console for errors
2. ✅ Verify relay connection (RelaySelector)
3. ✅ Check Nostr query filters
4. ✅ Inspect event structure in DevTools
5. ✅ Try different relay
6. ✅ Check user login status
7. ✅ Verify timeout settings
8. ✅ Clear browser cache
9. ✅ Check localStorage
10. ✅ Run `npm test`

---

## Performance Tips

### Query Optimization
- ✅ Use 2-second timeouts
- ✅ Combine related queries
- ✅ Filter at relay level (not client)
- ✅ Cache with staleTime/gcTime
- ✅ Use single-letter tags for filtering

### Component Optimization
- ✅ Wrap cards in React.memo
- ✅ Use lazy loading for images
- ✅ Show skeleton states while loading
- ✅ Avoid unnecessary re-renders
- ✅ Use proper key props in lists

---

## Git Commit Format

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Tests
- chore: Maintenance
```

---

## Import Aliases

```typescript
'@/components/*'   → 'src/components/*'
'@/hooks/*'        → 'src/hooks/*'
'@/lib/*'          → 'src/lib/*'
'@/pages/*'        → 'src/pages/*'
'@/contexts/*'     → 'src/contexts/*'
```

---

## Environment Variables

### Development (.env.local)
```env
VITE_DEFAULT_RELAY=wss://relay.nostr.band
VITE_CORS_PROXY=https://proxy.shakespeare.diy/?url=
```

### Access in Code
```typescript
const relay = import.meta.env.VITE_DEFAULT_RELAY;
```

---

## Documentation Index

**Start here**: 
- `MASTER_GUIDE.md` - Complete overview

**For developers**:
- `DEVELOPER_HANDBOOK.md` - Development guide
- `ARCHITECTURE.md` - Codebase structure

**For features**:
- `NON_NOSTR_CUSTOMERS.md` - Guest checkout
- `MARKETPLACE.md` - Stock media marketplace
- `NIP.md` - Nostr protocol definitions

**For troubleshooting**:
- Check specific `*_TROUBLESHOOTING.md` files

---

## Key Files to Understand

1. **`src/App.tsx`** - App setup with providers
2. **`src/AppRouter.tsx`** - Route configuration
3. **`src/pages/Index.tsx`** - Homepage implementation
4. **`src/hooks/useNostr.ts`** - Nostr integration
5. **`src/contexts/AppContext.tsx`** - Global state
6. **`NIP.md`** - Event schemas
7. **`ARCHITECTURE.md`** - Codebase guide

---

## Support

**Documentation**: `MASTER_GUIDE.md`

**Issues**: GitHub repository

**Nostr**: Tag `#traveltelly`

**Maintainer**: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

## Useful Links

- **Live Site**: https://traveltelly.diy
- **Repository**: https://github.com/bitpopart/traveltelly
- **Shakespeare**: https://shakespeare.diy
- **MKStack**: https://soapbox.pub/mkstack
- **Nostr**: https://nostr.com
- **NIPs**: https://github.com/nostr-protocol/nips

---

**Tip**: Keep this file open while coding for quick reference! 📌
