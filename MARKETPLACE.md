# Nostr Stock Media Marketplace

A decentralized stock media marketplace built on Nostr with dual payment support for Lightning and fiat currencies.

## Features

### 📸 Stock Media Listings
- Create stock media listings using NIP-99 classified listings
- Support for multiple media types (photos, videos, audio, graphics, illustrations, templates, 3D models)
- Preview image uploads via Blossom servers
- Location-based content (where media was created)
- Real-time updates across the Nostr network

### ⚡ Lightning Payments
- Instant Bitcoin payments via Lightning Network
- Uses NIP-57 Lightning Zaps for payment processing
- WebLN support for seamless wallet integration
- Automatic payment confirmations on Nostr

### 💳 Fiat Payments
- Traditional payment methods via Stripe integration
- Support for USD, EUR, GBP, CAD, AUD
- Secure card processing
- Email receipts and confirmations

### 🔐 Security & Privacy
- End-to-end encrypted order communication (NIP-44/NIP-04)
- Nostr key-based authentication
- No central marketplace authority
- Direct peer-to-peer transactions

## Getting Started

### For Buyers

1. **Browse Media**: Visit `/marketplace` to see available stock media
2. **Login**: Connect your Nostr account to license content
3. **Choose Payment Method**:
   - Lightning for Bitcoin-priced assets
   - Stripe for fiat-priced assets
4. **Complete License**: Follow the payment flow
5. **Download Content**: Access files via encrypted download links
6. **Track Purchases**: Check `/marketplace/orders` for license status

### For Creators

1. **Login**: Connect your Nostr account
2. **Upload Media**: Click "Upload Media" to create new listings
3. **Set Pricing**: Choose Bitcoin (BTC/SATS) or fiat currency
4. **Manage Portfolio**: Track performance at `/marketplace/portfolio`
5. **Deliver Content**: Send download links via encrypted messages

## Payment Methods

### Lightning Network (⚡)
- **Currencies**: BTC, SATS
- **Process**: NIP-57 Lightning Zaps
- **Requirements**: Lightning address in seller profile (lud16/lud06)
- **Benefits**: Instant, low fees, cryptographically secure

### Stripe Integration (💳)
- **Currencies**: USD, EUR, GBP, CAD, AUD
- **Process**: Traditional card/bank payments
- **Requirements**: Stripe configuration
- **Benefits**: Familiar payment flow, wide acceptance

## Technical Implementation

### Standards Used
- **NIP-99**: Classified listings for stock media
- **NIP-57**: Lightning Zaps for Bitcoin payments
- **NIP-04/44**: Encrypted direct messages for licensing
- **NIP-15**: Marketplace message structure reference

### Architecture
- **Frontend**: React with TypeScript
- **Payments**: Lightning Network + Stripe
- **Storage**: Decentralized via Nostr relays
- **Images**: Blossom file servers

## Configuration

### Environment Variables
```bash
# Stripe (optional - for fiat payments)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Lightning Setup
Creators need Lightning addresses in their Nostr profiles:
- `lud16`: Lightning address (user@domain.com)
- `lud06`: LNURL-pay address

## Development

### Running Locally
```bash
npm install
npm run dev
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

## Roadmap

- [ ] Multi-signature escrow for high-value licenses
- [ ] Reputation system using NIP-58 badges for creators
- [ ] Advanced licensing options (commercial, extended, exclusive)
- [ ] AI-powered content tagging and search
- [ ] Portfolio analytics and sales insights
- [ ] Mobile app support
- [ ] Additional payment methods (other cryptocurrencies)
- [ ] Royalty sharing for collaborative works
- [ ] Automated content delivery system

## Contributing

This marketplace implementation follows Nostr standards and is designed to be interoperable with other NIP-99 compatible clients. Contributions are welcome!

## License

Open source - see project license for details.