# Traveltelly - Master Documentation Guide

**A Nostr-Powered Travel Community Platform with Stock Media Marketplace**

Version: 2.0  
Last Updated: February 5, 2026  
Built with: Shakespeare AI, MKStack, React 18, TailwindCSS 3, Nostrify

---

## 📚 Table of Contents

1. [Quick Start](#quick-start)
2. [What is Traveltelly?](#what-is-traveltelly)
3. [Core Features](#core-features)
4. [Architecture Overview](#architecture-overview)
5. [Documentation Index](#documentation-index)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)
8. [Development Guide](#development-guide)
9. [Community & Support](#community--support)

---

## Quick Start

### For Users

1. **Visit**: https://traveltelly.diy (or your deployed URL)
2. **Explore**: Browse reviews, stories, trips, and stock media without an account
3. **Login**: Use Nostr login (NIP-07 extension) to create content
4. **Guest Purchase**: Buy stock media without Nostr using email checkout

### For Developers

```bash
# Clone the repository
git clone https://github.com/bitpopart/traveltelly.git
cd traveltelly

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

### For AI Assistants

Read these files in order:
1. `ARCHITECTURE.md` - Understand the codebase structure
2. `NIP.md` - Learn the Nostr event schemas
3. `NON_NOSTR_CUSTOMERS.md` - Understand guest checkout system
4. This file (`MASTER_GUIDE.md`) - Complete overview

---

## What is Traveltelly?

**Traveltelly** is a decentralized travel community platform built on Nostr that combines:

- 🌍 **Travel Reviews** - Location-based reviews with GPS coordinates and ratings
- 📝 **Travel Stories** - Long-form blog posts and articles (NIP-23)
- ✈️ **Trip Reports** - Multi-photo journey documentation with GPS routes
- 📸 **Stock Media Marketplace** - Buy and sell travel photos, videos, and graphics
- 💳 **Dual Authentication** - Nostr login OR email-based guest checkout
- ⚡ **Lightning Payments** - Bitcoin micropayments via Lightning Network

### Key Differentiators

- **Decentralized**: All data stored on Nostr relays (no central database)
- **Open Protocol**: Uses NIP-99, NIP-23, NIP-52, and custom kinds
- **Hybrid Auth**: Supports both Nostr and traditional email login
- **Lightning-Native**: Built-in Bitcoin payments for stock media
- **GPS-Powered**: Automatic coordinate extraction from photo EXIF data
- **Admin-Controlled**: Full visibility and control of all customer data

---

## Core Features

### 1. Reviews (Custom Kind 34879)

Location-based reviews with:
- ⭐ Star ratings (1-5)
- 📍 GPS coordinates (geohash encoded)
- 🏷️ Categories (cafe, restaurant, hotel, attraction, etc.)
- 📷 Photo attachments
- 👤 Author attribution

**See**: `NIP.md` for complete schema

### 2. Stories (NIP-23 / Kind 30023)

Long-form travel content:
- 📖 Markdown support
- 🖼️ Image galleries
- 🏷️ Topic tags
- 🔖 Bookmarking
- 💬 Comments (NIP-22)

**See**: `NIP23_IMPLEMENTATION.md` for details

### 3. Trips (Custom Kind 30025)

Multi-photo journey documentation:
- 🗺️ GPS route visualization
- 📸 Multiple photos with coordinates
- 📏 Distance tracking
- 📅 Date ranges
- 🚶 Activity types (walk, hike, cycling)

**See**: `NIP.md` for trip schema

### 4. Stock Media Marketplace (NIP-99 / Kind 30402)

Digital asset marketplace:
- 📸 Photos, videos, graphics
- 💰 Lightning payments
- 💳 Fiat payment option
- 🎫 License management
- 📊 Sales analytics
- 🔓 Guest checkout (no Nostr required)

**See**: `MARKETPLACE.md` and `NON_NOSTR_CUSTOMERS.md`

### 5. Non-Nostr Customer System

Email-based authentication for mainstream users:
- ✉️ Email + name login
- 💳 Guest checkout
- 📦 Unlimited downloads subscription ($99/mo)
- 🔐 Session management via localStorage
- 📊 Admin customer management panel

**Customer Data**: Stored as Nostr kind 30078 events (admin-only)

**See**: `NON_NOSTR_CUSTOMERS.md` for complete guide

---

## Architecture Overview

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS 3 + shadcn/ui
- **Build Tool**: Vite
- **Routing**: React Router 6
- **State Management**: TanStack Query
- **Protocol**: Nostr (Nostrify library)
- **Maps**: Leaflet + React Leaflet
- **Payments**: Lightning Network (NIP-57)

### Project Structure

```
/projects/traveltelly/
├── src/
│   ├── components/
│   │   ├── cards/              # Reusable content cards
│   │   │   ├── ReviewCard.tsx
│   │   │   ├── StoryCard.tsx
│   │   │   ├── TripCard.tsx
│   │   │   └── MediaCard.tsx
│   │   ├── auth/               # Login components
│   │   ├── ui/                 # shadcn/ui components (48+)
│   │   ├── GuestCheckout.tsx   # Guest purchase form
│   │   ├── GuestLogin.tsx      # Guest session management
│   │   ├── CustomerManagement.tsx  # Admin customer panel
│   │   └── ...                 # Maps, forms, navigation
│   ├── pages/
│   │   ├── Index.tsx           # Homepage
│   │   ├── Reviews.tsx         # Reviews feed
│   │   ├── Stories.tsx         # Stories feed
│   │   ├── Trips.tsx           # Trips feed
│   │   ├── Marketplace.tsx     # Stock media marketplace
│   │   ├── GuestPortal.tsx     # Guest customer portal
│   │   ├── AdminPanel.tsx      # Admin dashboard
│   │   └── ...                 # Detail pages, settings
│   ├── hooks/
│   │   ├── useLatestItems.ts   # Data fetching hooks
│   │   ├── useCustomers.ts     # Customer management hooks
│   │   ├── useAuthor.ts        # Profile data hooks
│   │   └── ...                 # 50+ custom hooks
│   ├── lib/
│   │   ├── customerSchema.ts   # Customer data types
│   │   ├── exifUtils.ts        # GPS extraction
│   │   └── ...                 # Utilities
│   └── contexts/
│       └── AppContext.tsx      # Global app state
├── public/                     # Static assets
└── dist/                       # Build output
```

**See**: `ARCHITECTURE.md` for detailed breakdown

### Data Flow

```
User Action → Hook (useNostr + TanStack Query) → Nostr Relay → Event → UI Update
                ↓
         Auto-refresh (30s)
```

### Page Organization

| URL | Page File | Purpose |
|-----|-----------|---------|
| `/` | `Index.tsx` | Homepage with all content types |
| `/reviews` | `Reviews.tsx` | Reviews feed |
| `/stories` | `Stories.tsx` | Stories feed |
| `/trips` | `Trips.tsx` | Trips feed |
| `/marketplace` | `Marketplace.tsx` | Stock media marketplace |
| `/guest-portal` | `GuestPortal.tsx` | Guest customer portal |
| `/admin` | `AdminPanel.tsx` | Admin dashboard |
| `/review/:naddr` | `ReviewDetail.tsx` | Single review |
| `/story/:naddr` | `StoryDetail.tsx` | Single story |
| `/trip/:naddr` | `TripDetail.tsx` | Single trip |
| `/media/preview/:naddr` | `MediaPreview.tsx` | Stock media detail |

**See**: `ARCHITECTURE.md` for complete routing table

---

## Documentation Index

Traveltelly has comprehensive documentation covering every aspect:

### Core Documentation

| File | Purpose | Audience |
|------|---------|----------|
| **MASTER_GUIDE.md** (this file) | Complete overview and index | Everyone |
| **ARCHITECTURE.md** | Codebase structure and organization | Developers, AI |
| **NIP.md** | Custom Nostr protocol definitions | Protocol developers |
| **README.md** | Project introduction | General audience |

### Feature Documentation

| File | Topic | When to Read |
|------|-------|--------------|
| **NON_NOSTR_CUSTOMERS.md** | Guest checkout system | Implementing email auth |
| **MARKETPLACE.md** | Stock media marketplace basics | Setting up marketplace |
| **MARKETPLACE_FEATURES.md** | Advanced marketplace features | Adding marketplace features |
| **NIP23_IMPLEMENTATION.md** | Long-form stories (NIP-23) | Working with articles |
| **CLAWSTR_INTEGRATION.md** | AI agent social network | Promoting your project |

### Implementation Guides

| File | Topic | When to Read |
|------|-------|--------------|
| **PHOTO_UPLOAD_README.md** | Photo upload with GPS extraction | Implementing image uploads |
| **GPS_CORRECTION_README.md** | Manual GPS coordinate editing | Adding GPS correction UI |
| **MAP_NAVIGATION_README.md** | Interactive map features | Working with maps |
| **INTERACTIVE_FEATURES.md** | Social features (likes, comments) | Adding engagement features |

### Admin & Management

| File | Topic | When to Read |
|------|-------|--------------|
| **ADMIN_ACCESS.md** | Admin permissions | Setting up admin accounts |
| **ADMIN_PANEL_SUMMARY.md** | Admin dashboard overview | Using admin features |
| **CATEGORY_MANAGEMENT_GUIDE.md** | Category system | Managing review categories |
| **PERMISSIONS.md** | Review permissions system | Controlling who can post |
| **CUSTOMER_MANAGEMENT.md** | Managing non-Nostr customers | Supporting guest users |

### Optimization & Performance

| File | Topic | When to Read |
|------|-------|--------------|
| **INDEX_OPTIMIZATION.md** | Homepage performance | Optimizing load times |
| **LOAD_MORE_IMPLEMENTATION.md** | Infinite scroll | Adding pagination |
| **IMPLEMENTATION_SUMMARY.md** | Recent improvements | Understanding latest changes |

### Troubleshooting

| File | Topic | When to Read |
|------|-------|--------------|
| **MARKETPLACE_TROUBLESHOOTING.md** | Marketplace debugging | Marketplace issues |
| **THUMBNAIL_TROUBLESHOOTING.md** | Image thumbnail issues | Image display problems |
| **PREVIEW_IMAGES_TROUBLESHOOTING.md** | Preview image issues | Image preview problems |
| **WHITE_PAGE_FIX_SUMMARY.md** | Blank page debugging | Site not loading |

### Development Tools

| File | Topic | When to Read |
|------|-------|--------------|
| **VERIFY_NIP46.md** | Remote signing verification | Testing NIP-46 support |
| **COMMENTS.md** | Comment system | Adding comments |
| **BRANDING_UPDATE.md** | Brand customization | Updating brand identity |

---

## Common Tasks

### Adding New Content

#### Create a Review
1. Login with Nostr
2. Navigate to "Reviews" → "Create Review"
3. Fill in: title, category, location, rating, description
4. Upload photo (GPS auto-extracted from EXIF)
5. Publish event (kind 34879)

#### Create a Story
1. Login with Nostr
2. Navigate to "Stories" → "Create Story"
3. Write in Markdown editor
4. Add photos and GPS data
5. Publish event (kind 30023)

#### Create a Trip
1. Login with Nostr
2. Navigate to "Trips" → "Create Trip"
3. Upload multiple photos (GPS auto-extracted)
4. Optional: Upload GPX/TCX file
5. Set category (walk, hike, cycling)
6. Publish event (kind 30025)

#### Upload Stock Media
1. Login with Nostr (must have upload permission)
2. Navigate to "Marketplace" → "Upload Media"
3. Upload file, set price, license, metadata
4. Publish event (kind 30402)

### Managing Customers (Admin)

#### View All Customers
1. Login as admin
2. Navigate to `/admin`
3. Click "Customers" tab
4. View list of all non-Nostr customers

#### Add Manual Customer
1. Admin Panel → Customers tab
2. Click "Add Customer"
3. Enter email, name, subscription type
4. Save (publishes kind 30078 event)

#### Manage Subscriptions
1. Find customer in Customers tab
2. Edit subscription type:
   - `none` - No subscription
   - `unlimited` - $99/mo unlimited downloads
   - `test` - Free unlimited (testing only)
3. Save changes

### Testing Features

#### Test Guest Checkout
1. Go to `/marketplace`
2. Click any product
3. Click "License & Download" → "Guest" tab
4. Use test account:
   - Email: `admin-non-nostr@traveltelly.test`
   - Name: Admin Non-Nostr
5. Submit → Download starts (no payment required for test account)

#### Test Nostr Purchase
1. Login with Nostr extension
2. Go to `/marketplace`
3. Click product → "License & Download" → "Lightning" tab
4. Generate invoice
5. Pay with Lightning wallet
6. Download after payment confirmation

---

## Troubleshooting

### Content Not Displaying

**Problem**: Reviews/stories/trips not showing up

**Solutions**:
1. Check relay connection (RelaySelector in UI)
2. Try different relay (Nostr.Band, Damus, Primal)
3. Check browser console for query errors
4. Verify events exist on relay using another Nostr client
5. Clear browser cache and reload

**See**: `ARCHITECTURE.md` → Debugging Guide

### Guest Checkout Not Working

**Problem**: Email login fails or downloads don't work

**Solutions**:
1. Check localStorage is enabled
2. Verify email format is valid
3. Check admin has published customer record (kind 30078)
4. Try test account: `admin-non-nostr@traveltelly.test`
5. Check browser console for session errors

**See**: `NON_NOSTR_CUSTOMERS.md` → Troubleshooting

### Maps Not Loading

**Problem**: Interactive maps show blank or broken

**Solutions**:
1. Check internet connection (Leaflet loads from CDN)
2. Verify GPS coordinates are valid
3. Check browser console for Leaflet errors
4. Ensure OpenStreetMap tiles are accessible
5. Try refreshing the page

**See**: `MAP_NAVIGATION_README.md`

### Image Upload Failing

**Problem**: Photo upload fails or GPS not extracted

**Solutions**:
1. Check file format (JPEG, HEIC, PNG supported)
2. Verify file size (< 10MB recommended)
3. Check photo has GPS EXIF data
4. Try different photo
5. Check Blossom server status

**See**: `PHOTO_UPLOAD_README.md`

### Blank/White Page

**Problem**: Site shows blank white page

**Solutions**:
1. Check browser console for JavaScript errors
2. Verify build completed successfully
3. Clear browser cache
4. Check React Router configuration
5. Ensure all dependencies installed

**See**: `WHITE_PAGE_FIX_SUMMARY.md`

### Special Characters Broken

**Problem**: International characters (Polish, French, German) display incorrectly

**Solutions**:
1. Check `exifUtils.ts` encoding handling
2. Verify UTF-8, ISO-8859-1, Windows-1252 fallbacks
3. Test with `exifUtils.test.ts`
4. Check browser console for encoding warnings

**See**: `IMPLEMENTATION_SUMMARY.md` → Special Character Support

---

## Development Guide

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/bitpopart/traveltelly.git
cd traveltelly

# Install dependencies
npm install

# Start dev server (auto-installs and runs Vite)
npm run dev

# Open browser to http://localhost:5173
```

### Development Workflow

1. **Make changes** to source files in `src/`
2. **See changes live** - Vite hot-reloads automatically
3. **Test locally** - Navigate to affected pages
4. **Check console** - Look for errors or warnings
5. **Build for production** - `npm run build`
6. **Deploy** - `npm run deploy` (requires Nostr login)

### Adding a New Feature

#### Example: Adding a New Content Type

1. **Define Nostr event kind** in `NIP.md`
2. **Create page component** in `src/pages/NewContentPage.tsx`
3. **Create card component** in `src/components/cards/NewContentCard.tsx`
4. **Create hooks** in `src/hooks/useLatestNewContent.ts`
5. **Add route** in `src/AppRouter.tsx`
6. **Add navigation** in `src/components/Navigation.tsx`
7. **Update ARCHITECTURE.md** with new sections
8. **Test thoroughly** across all views
9. **Commit changes** with descriptive message

**See**: `ARCHITECTURE.md` → Quick Reference for Common Tasks

### Code Style Guidelines

- **TypeScript**: Use strict types, avoid `any`
- **Components**: PascalCase, one component per file
- **Hooks**: camelCase with `use` prefix
- **Naming**: Descriptive names, avoid abbreviations
- **Comments**: Document complex logic, NIPs, and workarounds
- **Formatting**: Prettier defaults (2-space indent)

### Testing

```bash
# Run all tests
npm test

# Type checking only
npx tsc -p tsconfig.app.json --noEmit

# Linting only
npx eslint

# Build only
npm run build
```

**Note**: The `test` script runs all checks: TypeScript, ESLint, Vitest, and build

### Performance Optimization

**Current optimizations** (see `INDEX_OPTIMIZATION.md`):
- ✅ React.memo on all card components
- ✅ 2-second query timeouts
- ✅ Auto-refresh every 30 seconds
- ✅ Smart TanStack Query caching
- ✅ Lazy loading images
- ✅ Optimized query limits

**Future optimizations**:
- Virtual scrolling for long lists
- Service worker for offline support
- WebP image conversion
- CDN for static assets

---

## Community & Support

### Get Help

1. **Check documentation** - Start with this guide
2. **Search issues** - GitHub repository
3. **Ask on Nostr** - Use `#traveltelly` tag
4. **Contact admin** - `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`

### Contribute

**Ways to contribute**:
- 📝 Report bugs or suggest features
- 💻 Submit pull requests
- 📚 Improve documentation
- 🌍 Add translations
- 🎨 Design improvements
- 📸 Add content (reviews, stories, trips)

### Join Clawstr (AI Agents)

Traveltelly has an AI agent identity on Clawstr - a social network for AI agents on Nostr.

**See**: `CLAWSTR_INTEGRATION.md` for complete guide to:
- Setting up Traveltelly Bot identity
- Posting updates to AI community
- Engaging with other agents
- Zapping for value
- Building reputation

---

## Quick Reference

### Important Files

| File | Purpose |
|------|---------|
| `src/pages/Index.tsx` | Homepage |
| `src/components/cards/*` | Content display cards |
| `src/hooks/useLatestItems.ts` | Data fetching |
| `src/lib/customerSchema.ts` | Customer data types |
| `NIP.md` | Protocol definitions |
| `ARCHITECTURE.md` | Codebase guide |

### Important URLs

| URL | Purpose |
|-----|---------|
| `/` | Homepage |
| `/marketplace` | Stock media marketplace |
| `/guest-portal` | Guest customer portal |
| `/admin` | Admin dashboard |
| `/reviews` | Reviews feed |
| `/stories` | Stories feed |
| `/trips` | Trips feed |

### Test Accounts

| Type | Email | Access |
|------|-------|--------|
| Admin | Login with Nostr | Full access |
| Test Guest | `admin-non-nostr@traveltelly.test` | Free unlimited downloads |

### Admin Account

- **NPub**: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`
- **Hex**: `7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35`
- **Name**: traveltelly
- **NIP-05**: traveltelly@primal.net

### Color Scheme

- Reviews: `#27b0ff` (blue)
- Stories: `#b2d235` (green)
- Trips: `#ffcc00` (yellow)
- Stock Media: `#ec1a58` (pink)
- Nostr: `#b700d7` (purple)
- Lightning: `#ff9500` (orange)
- Dark: `#393636`

---

## Version History

### v2.0 (February 5, 2026)
- ✨ Guest checkout system
- ✨ Unlimited downloads subscription
- ✨ Admin customer management
- ✨ Test account auto-creation
- 🔧 Special character support in EXIF
- 🔧 Zoom controls on all maps
- 🔧 Index page auto-refresh
- 📚 Comprehensive documentation

### v1.0 (Initial Release)
- ✨ Reviews, stories, trips
- ✨ Stock media marketplace
- ✨ Lightning payments
- ✨ GPS extraction from photos
- ✨ Interactive maps
- ✨ Admin panel

**See**: `IMPLEMENTATION_SUMMARY.md` for detailed changelog

---

## Credits

- **Built with**: [Shakespeare AI](https://shakespeare.diy) - AI-powered website builder
- **Template**: [MKStack](https://soapbox.pub/mkstack) - Nostr client template
- **Protocol**: [Nostr](https://nostr.com) - Decentralized social protocol
- **Payments**: [Lightning Network](https://lightning.network) - Bitcoin Layer 2
- **Admin**: traveltelly (npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642)

---

## License

[Add your license information here]

---

**Need help?** Start with `ARCHITECTURE.md` for codebase navigation, or `NON_NOSTR_CUSTOMERS.md` for guest checkout guidance.

**For AI assistants**: Read `ARCHITECTURE.md` → `NIP.md` → this guide, in that order.

**For users**: Visit https://traveltelly.diy and start exploring! 🌍✈️📸
