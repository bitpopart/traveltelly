# 📸 Nostr Stock Media Marketplace

A decentralized stock media marketplace built on Nostr with dual payment support for Lightning and fiat currencies. Buy and sell royalty-free photos, videos, audio, graphics, and digital assets with instant delivery.

## 🌟 Key Features

### 📱 **Modern Interface**
- Clean, responsive design optimized for stock media browsing
- Category-based filtering (photos, videos, audio, graphics, illustrations, templates, 3D models)
- Advanced search with real-time results
- Portfolio management for creators

### ⚡ **Dual Payment System**
- **Lightning Network**: Instant Bitcoin payments for crypto-priced assets
- **Stripe Integration**: Traditional card/bank payments for fiat currencies
- Automatic payment confirmation and license delivery

### 🔐 **Decentralized & Secure**
- Built on Nostr protocol - no central authority
- End-to-end encrypted communication between buyers and creators
- Nostr key-based authentication
- Instant digital asset delivery

### 🎨 **Creator-Focused**
- Portfolio dashboard with analytics
- Sales tracking and performance metrics
- Easy upload process with metadata management
- Flexible pricing in crypto or fiat

## 🚀 Getting Started

### For Buyers (Licensing Stock Media)

1. **Browse**: Visit `/marketplace` to explore available stock media
2. **Search**: Use filters to find specific types of content
3. **Login**: Connect your Nostr account to license content
4. **Purchase**: Choose Lightning (for BTC/SATS) or Stripe (for USD/EUR/etc.)
5. **Download**: Receive instant access via encrypted download links

### For Creators (Selling Stock Media)

1. **Login**: Connect your Nostr account
2. **Upload**: Click "Upload Media" to list new assets
3. **Price**: Set pricing in Bitcoin or fiat currency
4. **Manage**: Track performance in your portfolio dashboard
5. **Deliver**: Automatic delivery system sends download links to buyers

## 💳 Payment Methods

### Lightning Network ⚡
- **Best for**: Bitcoin-priced assets (BTC/SATS)
- **Benefits**: Instant, low fees, cryptographically secure
- **Requirements**: Lightning address in creator profile (lud16/lud06)

### Stripe Integration 💳
- **Best for**: Fiat-priced assets (USD, EUR, GBP, CAD, AUD)
- **Benefits**: Familiar payment flow, wide acceptance
- **Requirements**: Stripe configuration (VITE_STRIPE_PUBLISHABLE_KEY)

## 🛠 Technical Architecture

### Nostr Standards Used
- **NIP-99**: Classified listings for stock media assets
- **NIP-57**: Lightning Zaps for Bitcoin payments
- **NIP-04/44**: Encrypted messaging for license delivery
- **NIP-15**: Marketplace message structure

### Components
- **Marketplace Page**: Browse and search stock media
- **Portfolio Dashboard**: Creator analytics and management
- **Payment System**: Dual Lightning/Stripe integration
- **License Management**: Encrypted delivery system

## 📊 Pages & Routes

- `/marketplace` - Main stock media marketplace
- `/marketplace/orders` - Purchase history and downloads
- `/marketplace/portfolio` - Creator dashboard and analytics
- Upload dialog accessible from any marketplace page

## 🎯 Media Categories

- **📸 Photos**: High-resolution photography
- **🎥 Videos**: Stock footage and motion graphics
- **🎵 Audio**: Music, sound effects, ambient tracks
- **🎨 Graphics**: Vector graphics and digital art
- **✏️ Illustrations**: Digital illustrations and artwork
- **📄 Templates**: Design templates and layouts
- **🧊 3D Models**: Three-dimensional assets

## 🔧 Configuration

### Environment Variables
```bash
# Stripe (for fiat payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Creator Setup
Add Lightning address to Nostr profile:
```json
{
  "lud16": "creator@domain.com",
  "lud06": "lnurl..."
}
```

## 🌐 Decentralized Benefits

1. **No Platform Fees**: Direct creator-to-buyer transactions
2. **Global Access**: Available anywhere Nostr is accessible
3. **Censorship Resistant**: No central authority can remove content
4. **Interoperable**: Works with any NIP-99 compatible client
5. **Creator Ownership**: Full control over content and pricing

## 🚀 Future Roadmap

- [ ] **Advanced Licensing**: Commercial, extended, and exclusive licenses
- [ ] **AI Tagging**: Automatic content categorization and search
- [ ] **Portfolio Analytics**: Advanced creator insights and metrics
- [ ] **Royalty Sharing**: Revenue splits for collaborative works
- [ ] **Mobile App**: Native mobile experience
- [ ] **Multi-sig Escrow**: Enhanced security for high-value transactions

## 🎨 Design Philosophy

The marketplace is designed specifically for stock media with:
- **Visual-first interface** optimized for media browsing
- **Creator-centric features** for portfolio management
- **Instant delivery** perfect for digital assets
- **Professional licensing** with clear usage rights
- **Global accessibility** via decentralized infrastructure

## 📄 License & Usage

This implementation follows Nostr standards and is designed to be interoperable with other NIP-99 compatible marketplaces. The codebase is open source, and the marketplace operates without central control.

---

**Built with**: React, TypeScript, Nostr, Lightning Network, Stripe, TailwindCSS, and shadcn/ui

**Vibed with**: [MKStack](https://soapbox.pub/mkstack)