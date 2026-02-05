# Traveltelly

**A Nostr-Powered Travel Community with Stock Media Marketplace**

[![Edit with Shakespeare](https://shakespeare.diy/badge.svg)](https://shakespeare.diy/clone?url=https%3A%2F%2Fgithub.com%2Fbitpopart%2Ftraveltelly)

---

## 🌍 What is Traveltelly?

Traveltelly is a decentralized travel platform built on the Nostr protocol that combines:

- **Travel Reviews** 📍 - Location-based reviews with GPS coordinates and star ratings
- **Travel Stories** 📝 - Long-form blog posts and articles
- **Trip Reports** ✈️ - Multi-photo journey documentation with GPS routes
- **Stock Media Marketplace** 📸 - Buy and sell travel photos, videos, and graphics
- **Lightning Payments** ⚡ - Bitcoin micropayments for stock media
- **Dual Authentication** 🔐 - Nostr login OR email-based guest checkout

All data is stored on decentralized Nostr relays with no central database.

---

## ✨ Key Features

### For Travelers
- Create GPS-tagged reviews with photos and ratings
- Write long-form travel stories with rich media
- Document trips with automatic route visualization
- Browse content by location, category, or author
- No account needed to browse (login required to post)

### For Photographers
- Sell stock photos, videos, and graphics
- Lightning-fast Bitcoin payments
- License management and tracking
- Portfolio showcase
- Analytics dashboard

### For Everyone
- Decentralized data (you own your content)
- No censorship or platform lock-in
- Open protocol (interoperable with all Nostr clients)
- Works with or without Nostr account
- Beautiful, responsive design

---

## 🚀 Quick Start

### For Users

**Visit**: https://traveltelly.diy

1. **Explore** - Browse reviews, stories, trips, and stock media (no account needed)
2. **Login** - Use a Nostr extension (nos2x, Alby) to create content
3. **Create** - Post reviews, write stories, document trips, or sell media
4. **Purchase** - Buy stock media with Lightning or as a guest with email

### For Developers

```bash
# Clone repository
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

**Read the docs**: Start with [`MASTER_GUIDE.md`](./MASTER_GUIDE.md) for complete overview

---

## 📚 Documentation

### Start Here
- **[MASTER_GUIDE.md](./MASTER_GUIDE.md)** - Complete project overview and documentation index
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Cheat sheet for common tasks
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Codebase structure and navigation guide

### For Developers
- **[DEVELOPER_HANDBOOK.md](./DEVELOPER_HANDBOOK.md)** - Practical development guide
- **[NIP.md](./NIP.md)** - Custom Nostr protocol definitions
- **[CONTEXT.md](./CONTEXT.md)** - MKStack template guidelines

### Feature Guides
- **[NON_NOSTR_CUSTOMERS.md](./NON_NOSTR_CUSTOMERS.md)** - Guest checkout system
- **[MARKETPLACE.md](./MARKETPLACE.md)** - Stock media marketplace
- **[MARKETPLACE_FEATURES.md](./MARKETPLACE_FEATURES.md)** - Advanced marketplace features
- **[CLAWSTR_INTEGRATION.md](./CLAWSTR_INTEGRATION.md)** - AI agent social network

### Implementation Details
- **[PHOTO_UPLOAD_README.md](./PHOTO_UPLOAD_README.md)** - Photo upload with GPS extraction
- **[MAP_NAVIGATION_README.md](./MAP_NAVIGATION_README.md)** - Interactive map features
- **[GPS_CORRECTION_README.md](./GPS_CORRECTION_README.md)** - Manual GPS editing
- **[INDEX_OPTIMIZATION.md](./INDEX_OPTIMIZATION.md)** - Performance optimizations

### Troubleshooting
- **[MARKETPLACE_TROUBLESHOOTING.md](./MARKETPLACE_TROUBLESHOOTING.md)** - Marketplace debugging
- **[THUMBNAIL_TROUBLESHOOTING.md](./THUMBNAIL_TROUBLESHOOTING.md)** - Image issues
- **[WHITE_PAGE_FIX_SUMMARY.md](./WHITE_PAGE_FIX_SUMMARY.md)** - Blank page problems

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS 3 + shadcn/ui
- **Build Tool**: Vite
- **Protocol**: Nostr (Nostrify library)
- **State**: TanStack Query
- **Maps**: Leaflet + React Leaflet
- **Routing**: React Router 6
- **Payments**: Lightning Network (NIP-57)

Built with [Shakespeare AI](https://shakespeare.diy) using the [MKStack template](https://soapbox.pub/mkstack).

---

## 🎯 Use Cases

### Travel Blogging
- Document your journeys with stories, photos, and GPS data
- Share recommendations and reviews
- Build a following on Nostr
- Monetize your photography

### Stock Photography
- Sell travel photos to publications and creators
- Set your own prices and licenses
- Receive instant Lightning payments
- Track sales and analytics

### Travel Planning
- Research destinations through reviews
- Find recommendations by location
- See GPS-tracked routes of trips
- Discover photographers' portfolios

### Community Building
- Connect with other travelers on Nostr
- Share experiences and tips
- Support creators with Lightning zaps
- Participate in decentralized social media

---

## 🔐 Authentication

Traveltelly supports two authentication methods:

### Nostr Login (Recommended)
- Full content creation and interaction
- Own your identity and data
- Works across all Nostr apps
- Lightning wallet integration

**Requirements**: Nostr extension (nos2x, Alby, Flamingo, etc.)

### Guest Checkout (Marketplace Only)
- Purchase stock media without Nostr
- Email + name authentication
- Lightning or fiat payment options
- Download history and subscriptions

**Use case**: Mainstream users who want to buy without learning Nostr

---

## 🌐 Nostr Protocol

Traveltelly uses several Nostr protocols:

- **NIP-23** - Long-form articles (kind 30023) for stories
- **NIP-99** - Classified listings (kind 30402) for stock media
- **NIP-52** - Calendar events (kind 31922/31923) for events
- **NIP-57** - Lightning zaps for payments
- **Custom kinds** - Reviews (34879), Trips (30025), Customers (30078)

All data is published to public Nostr relays and can be accessed by any Nostr client.

**See**: [`NIP.md`](./NIP.md) for complete protocol documentation

---

## 🎨 Features

### Reviews
- ⭐ 1-5 star ratings
- 📍 GPS coordinates (auto-extracted from photos)
- 🏷️ Categories (cafe, restaurant, hotel, attraction, etc.)
- 📷 Photo attachments
- 📝 Detailed descriptions

### Stories
- 📖 Markdown editor
- 🖼️ Image galleries with GPS
- 🏷️ Topic tags
- 💬 Comments
- 🔖 Bookmarking

### Trips
- 🗺️ GPS route visualization
- 📸 Multiple photos with coordinates
- 📏 Automatic distance calculation
- 📅 Date ranges
- 🚶 Activity types (walk, hike, cycling)

### Marketplace
- 📸 Photos, videos, graphics
- 💰 Lightning payments
- 💳 Guest checkout (email)
- 🎫 License management
- 📊 Sales analytics
- 🔓 Unlimited downloads subscription ($99/mo)

---

## 👤 Admin Features

Admin account has special capabilities:

- Review permissions management
- Customer management (non-Nostr users)
- Mass media upload
- Analytics dashboard
- Event management
- Share scheduler

**Admin NPub**: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`

---

## 🧪 Testing

### Test Accounts

**Guest Test Account**:
- Email: `admin-non-nostr@traveltelly.test`
- Name: Admin Non-Nostr
- Access: Free unlimited downloads

**Admin Account**:
- Login with Nostr extension using admin npub
- Full access to admin panel

### Running Tests

```bash
# All tests (TypeScript, ESLint, Vitest, build)
npm test

# Individual test types
npx tsc -p tsconfig.app.json --noEmit  # TypeScript
npx eslint                              # Linting
npx vitest run                          # Unit tests
npm run build                           # Build test
```

---

## 📦 Project Structure

```
traveltelly/
├── src/
│   ├── components/         # UI components
│   │   ├── cards/         # Content cards (Review, Story, Trip, Media)
│   │   ├── auth/          # Login components
│   │   ├── ui/            # shadcn/ui components (48+)
│   │   └── ...            # Maps, forms, navigation
│   ├── pages/             # Route pages
│   ├── hooks/             # Custom React hooks (50+)
│   ├── lib/               # Utilities and helpers
│   └── contexts/          # React context providers
├── public/                # Static assets
├── docs/                  # Documentation (*.md files)
└── dist/                  # Build output
```

**See**: [`ARCHITECTURE.md`](./ARCHITECTURE.md) for detailed breakdown

---

## 🤝 Contributing

Contributions welcome! Please:

1. Read [`DEVELOPER_HANDBOOK.md`](./DEVELOPER_HANDBOOK.md)
2. Check existing issues
3. Fork and create feature branch
4. Run `npm test` before submitting
5. Submit pull request with description

---

## 📄 License

[Add your license here]

---

## 🔗 Links

- **Live Site**: https://traveltelly.diy
- **Repository**: https://github.com/bitpopart/traveltelly
- **Shakespeare AI**: https://shakespeare.diy
- **MKStack Template**: https://soapbox.pub/mkstack
- **Nostr Protocol**: https://nostr.com
- **Admin Contact**: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

## 💡 Support

- **Help Bot** 🤖: Click the sparkle button on the website, or see [`CLAWSTR_BOT_SETUP.md`](./CLAWSTR_BOT_SETUP.md)
- **Documentation**: [`MASTER_GUIDE.md`](./MASTER_GUIDE.md)
- **Quick Help**: [`QUICK_REFERENCE.md`](./QUICK_REFERENCE.md)
- **Issues**: GitHub Issues
- **Nostr**: Tag `#traveltelly`

---

**Built with ❤️ using Shakespeare AI and the Nostr protocol**

🌍 Travel the world, share your experiences, own your data ✈️📸
