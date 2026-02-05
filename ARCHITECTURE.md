# Traveltelly Architecture Guide

This document helps AI assistants (Shakespeare) and developers quickly understand the codebase structure and locate issues.

## 📁 Project Structure

```
/projects/traveltelly/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── cards/          # Shared card components (ReviewCard, StoryCard, TripCard, MediaCard)
│   │   ├── auth/           # Authentication components (LoginArea, LoginDialog, AccountSwitcher)
│   │   ├── ui/             # shadcn/ui components (48+ components)
│   │   └── ...             # Other components (Navigation, Footer, Maps, Forms, etc.)
│   ├── pages/              # Route pages (one file per URL route)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and helpers
│   └── contexts/           # React context providers
├── public/                 # Static assets
└── dist/                   # Build output (generated)
```

## 🗺️ Page Organization

The site is organized into 5 main sections, each with its own dedicated page:

### 1. **Home (Index)** - `/`
- **File**: `src/pages/Index.tsx`
- **Purpose**: Homepage with overview of all sections
- **Features**:
  - Latest content from all categories (reviews, stories, trips, stock media)
  - Interactive world map with review markers
  - Location tag cloud for filtering
  - Quick action buttons for creating content
  - Auto-refreshes every 30 seconds

### 2. **Reviews** - `/reviews`
- **File**: `src/pages/Reviews.tsx`
- **Purpose**: Browse and search all travel reviews
- **Features**:
  - Grid/list view of reviews
  - Filtering by category, rating, location
  - Search functionality
  - Admin review management

### 3. **Stories** - `/stories`
- **File**: `src/pages/Stories.tsx`
- **Purpose**: Long-form travel articles and blog posts
- **Features**:
  - Article feed with thumbnails
  - Rich text editor for creating stories
  - Photo galleries with GPS data
  - Topic tag filtering

### 4. **Trips** - `/trips`
- **File**: `src/pages/Trips.tsx`
- **Purpose**: Multi-photo trip reports with GPS routes
- **Features**:
  - Trip galleries with route maps
  - Chronological photo ordering
  - Date range filtering
  - GPS-tracked journeys

### 5. **Marketplace** - `/marketplace`
- **File**: `src/pages/Marketplace.tsx`
- **Purpose**: Stock media and digital assets marketplace
- **Features**:
  - Product listings with pricing
  - Lightning payments
  - Category filtering (photos, videos, graphics, etc.)
  - Shopping cart and order management
  - Guest checkout (no Nostr required)
  - Unlimited downloads subscription

## 🧩 Shared Components

### Card Components (`src/components/cards/`)

Reusable card components used across multiple pages:

- **ReviewCard.tsx** - Displays a review with rating, category, location, author
- **StoryCard.tsx** - Displays a story/article with summary and tags
- **TripCard.tsx** - Displays a trip with dates and photo count
- **MediaCard.tsx** - Displays stock media product with pricing

**Why separate files?**
- ✅ **Modularity**: One component per file
- ✅ **Reusability**: Can be used in multiple pages
- ✅ **Performance**: Each component is memoized with React.memo
- ✅ **Debugging**: Easy to find and fix issues in specific components
- ✅ **Isolation**: Bug in one component won't break the whole site

**Usage:**
```typescript
import { ReviewCard, StoryCard, TripCard, MediaCard } from '@/components/cards';

<ReviewCard review={reviewData} />
```

## 🛣️ Routing Structure

All routes use clean, intuitive URLs:

| URL Pattern | Page File | Description |
|------------|-----------|-------------|
| `/` | `Index.tsx` | Homepage |
| `/reviews` | `Reviews.tsx` | All reviews |
| `/review/:naddr` | `ReviewDetail.tsx` | Single review |
| `/stories` | `Stories.tsx` | All stories |
| `/story/:naddr` | `StoryDetail.tsx` | Single story |
| `/trips` | `Trips.tsx` | All trips |
| `/trip/:naddr` | `TripDetail.tsx` | Single trip |
| `/marketplace` | `Marketplace.tsx` | Stock media marketplace |
| `/media/preview/:naddr` | `MediaPreview.tsx` | Single media item |
| `/guest-portal` | `GuestPortal.tsx` | Non-Nostr customer portal |
| `/create-review` | `CreateReview.tsx` | Create new review |
| `/admin` | `AdminPanel.tsx` | Admin dashboard |
| `/:location` | `LocationPage.tsx` | Location-specific content |

**Benefits of Clean URLs:**
- ✅ Easy to navigate directly in browser
- ✅ Bookmarkable and shareable
- ✅ SEO-friendly
- ✅ Clear structure for debugging

## 💳 Non-Nostr Customer System

Traveltelly supports purchases without Nostr accounts:

### Guest Checkout
- **URL**: `/guest-portal`
- **Purpose**: Email-based purchases and subscriptions
- **Features**:
  - Individual item purchases
  - Unlimited downloads subscription
  - Session management via localStorage
  - Lightning and fiat payment support

### Customer Data Schema
- **Kind 30078**: Customer records (admin-only, replaceable)
- **Kind 30079**: Purchase records
- **Subscription Types**: none, unlimited, test
- **Storage**: Nostr events published by admin

### Test Account
For admin testing without payment:
- **Email**: `admin-non-nostr@traveltelly.test`
- **Name**: Admin Non-Nostr
- **Access**: Unlimited free downloads
- **Auto-created**: When admin visits admin panel

### Admin Customer Management
- Located in Admin Panel → "Customers" tab
- View all non-Nostr customers
- Manage subscriptions
- Track purchase history
- Add/edit customers manually

**See**: `NON_NOSTR_CUSTOMERS.md` for complete documentation

## 🔧 Key Hooks

### Data Fetching Hooks (`src/hooks/`)

- **useLatestReview()** - Fetch latest review with image
- **useLatestReviews()** - Fetch last 3 reviews with images
- **useLatestStory()** - Fetch latest story with image
- **useLatestStories()** - Fetch last 3 stories
- **useLatestTrip()** - Fetch latest trip
- **useLatestTrips()** - Fetch last 3 trips
- **useLatestStockMedia()** - Fetch latest stock media product
- **useLatestStockMediaItems()** - Fetch last 3 stock media items
- **useReviewCount()** - Get total review count
- **useStoryCount()** - Get total story count
- **useTripCount()** - Get total trip count
- **useStockMediaCount()** - Get total stock media count

### Customer Management Hooks

- **useCustomers()** - Fetch all non-Nostr customers (admin only)
- **useCustomer(email)** - Fetch specific customer by email
- **useCreateCustomer()** - Create/update customer records
- **useCustomerAccess(email)** - Check if customer has unlimited access
- **useCustomerSession()** - Manage guest session in localStorage
- **useInitializeTestCustomer()** - Auto-create test account

All hooks auto-refresh every 30 seconds and use smart caching.

## 🐛 Debugging Guide for AI/Shakespeare

### Finding Issues by Section

When a user reports a problem, identify which section it affects:

1. **Homepage issues** → Check `src/pages/Index.tsx`
2. **Review display/listing issues** → Check `src/pages/Reviews.tsx` or `src/components/cards/ReviewCard.tsx`
3. **Story display/listing issues** → Check `src/pages/Stories.tsx` or `src/components/cards/StoryCard.tsx`
4. **Trip display/listing issues** → Check `src/pages/Trips.tsx` or `src/components/cards/TripCard.tsx`
5. **Marketplace issues** → Check `src/pages/Marketplace.tsx` or `src/components/cards/MediaCard.tsx`
6. **Guest checkout issues** → Check `src/components/GuestCheckout.tsx` or `src/pages/GuestPortal.tsx`
7. **Customer management issues** → Check `src/components/CustomerManagement.tsx`
8. **Map issues** → Check map components in `src/components/` (AllAdminReviewsMap, ReviewsMap, TripMap, etc.)
9. **Upload/form issues** → Check form components (CreateReviewForm, CreateArticleForm, PhotoUpload, etc.)

### Common Issue Patterns

**Problem: Cards not displaying**
- Check the appropriate card component in `src/components/cards/`
- Verify the hook is fetching data (check browser console)
- Ensure Nostr relay is connected

**Problem: Guest checkout not working**
- Check `src/components/GuestCheckout.tsx`
- Verify localStorage permissions
- Check customer hooks in `src/hooks/useCustomers.ts`
- Ensure admin account is publishing customer records

**Problem: Test account not appearing**
- Check `src/hooks/useInitializeTestCustomer.ts`
- Verify admin is logged in
- Check console for test account creation logs
- Try clicking "Create Test Account" in Customer Management

**Problem: Data not refreshing**
- Check the corresponding `useLatest*` hook in `src/hooks/useLatestItems.ts`
- Verify auto-refresh is working (30-second interval)
- Check relay connection

**Problem: Routing/navigation broken**
- Check `src/AppRouter.tsx` for route configuration
- Ensure URL pattern matches the route definition
- Verify page component is imported correctly

**Problem: Upload not working**
- Check form components (CreateReviewForm, CreateProductDialog, etc.)
- Verify user is logged in (use `useCurrentUser()`)
- Check Blossom server configuration

## ⚡ Performance Optimizations

### Index Page Optimizations

1. **Reduced query limits** (faster loads):
   - Reviews: 20 events
   - Stories: 15 events  
   - Trips: 15 events
   - Stock Media: 50 events

2. **Reduced timeouts** (better UX):
   - 2-second timeout per query
   - Prevents slow relays from blocking page load

3. **React.memo** on all card components:
   - Prevents unnecessary re-renders
   - Improves scroll performance
   - Better mobile battery life

4. **Smart caching**:
   - 2-5 minute stale times
   - 5-10 minute garbage collection
   - Auto-refresh every 30 seconds

### Image Optimizations

- **OptimizedImage component** handles:
  - Lazy loading
  - Blur-up placeholders
  - Thumbnail generation
  - Responsive sizing

## 📝 File Naming Conventions

- **Pages**: PascalCase (e.g., `Index.tsx`, `Reviews.tsx`)
- **Components**: PascalCase (e.g., `ReviewCard.tsx`, `Navigation.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useLatestReview.ts`)
- **Utils**: camelCase (e.g., `exifUtils.ts`, `mapConfig.ts`)

## 🎨 Styling

- **Framework**: TailwindCSS 3.x
- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **Colors**: Custom color scheme:
  - Reviews: #27b0ff (blue)
  - Stories: #b2d235 (green)
  - Trips: #ffcc00 (yellow)
  - Stock Media: #ec1a58 (pink)
  - Dark: #393636
  - Nostr: #b700d7 (purple)
  - Lightning: #ff9500 (orange)

## 🔐 Admin Features

- **Admin NPub**: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`
- **Admin Hex**: `7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35`

Admin-only features:
- Review permissions management
- Mass media upload
- Analytics dashboard
- Event management
- Share scheduler
- **Customer management** (non-Nostr customers)

## 📦 Key Dependencies

- **React** 18.x - UI framework
- **TailwindCSS** 3.x - Styling
- **Nostrify** - Nostr protocol integration
- **TanStack Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Leaflet** - Interactive maps
- **exifr** - Photo metadata extraction
- **date-fns** - Date formatting

## 🚀 Build & Development

- **Dev Server**: `npm run dev`
- **Build**: `npm run build`
- **Preview**: `npm run preview`

The build process:
1. Vite bundles all code
2. TailwindCSS processes styles
3. Output to `/dist` directory
4. Ready for deployment

## 🆘 Quick Reference for Common Tasks

### Adding a new content type
1. Create page file in `src/pages/`
2. Create card component in `src/components/cards/`
3. Create hook in `src/hooks/` for data fetching
4. Add route to `src/AppRouter.tsx`
5. Add navigation link in `src/components/Navigation.tsx`
6. Update this ARCHITECTURE.md

### Fixing a card display issue
1. Locate the card component in `src/components/cards/`
2. Check the props interface
3. Verify data structure from the hook
4. Test with React DevTools

### Debugging Nostr queries
1. Open browser console
2. Look for query logs (search for "query", "EXIF", or emoji icons)
3. Check relay connection in RelaySelector
4. Verify event structure matches expected format

### Testing guest checkout
1. Go to `/guest-portal`
2. Use test email: `admin-non-nostr@traveltelly.test`
3. Verify unlimited access is granted
4. Test download flow in marketplace

## 📚 Additional Documentation

- **CONTEXT.md** - AI system prompt and project overview
- **NIP.md** - Custom Nostr protocol definitions
- **INDEX_OPTIMIZATION.md** - Homepage performance optimizations
- **NON_NOSTR_CUSTOMERS.md** - Guest checkout and subscription system
- **README.md** - General project information
