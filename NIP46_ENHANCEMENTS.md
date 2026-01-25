# NIP-46 Remote Signer Enhancements

This document describes the enhanced NIP-46 (Nostr Connect) login experience implemented in TravelTelly, inspired by modern implementations like ZapTrax.

## Features

### 🖥️ Desktop Experience
- **QR Code Login**: Display a scannable QR code containing a `nostrconnect://` URI
- **Visual Feedback**: Clear instructions and modern UI for scanning with mobile apps
- **Fallback Option**: Manual bunker URI input for advanced users

### 📱 Mobile Experience
- **One-Tap Login**: Direct deep links to popular mobile signers
- **Supported Signers**:
  - Nostrum (iOS & Android)
  - Amber (Android)
  - Any NIP-46 compatible signer
- **Fallback Option**: Manual bunker URI input

## How It Works

### Client-Initiated Connection Flow

1. **URI Generation**: When the login dialog opens, a `nostrconnect://` URI is generated containing:
   - Client public key (ephemeral keypair)
   - Relay URLs for communication
   - Secret for connection verification
   - App name and URL

2. **Desktop**: The URI is encoded as a QR code for users to scan with their mobile signer app

3. **Mobile**: The URI is used to create deep links that open directly in signer apps

4. **Connection**: The signer app scans/opens the URI and initiates the NIP-46 connection

### Bunker URI Support

Traditional `bunker://` URIs are still supported for:
- Users who already have a bunker connection configured
- Advanced users who prefer manual configuration
- Services like Primal that provide bunker URIs

## Implementation Details

### Components Modified
- `LoginDialog.tsx`: Added NIP-46 tab with responsive design
  - Mobile: One-tap buttons with deep links
  - Desktop: QR code with manual fallback

### Dependencies Added
- `qrcode.react`: QR code generation for desktop
- `nostr-tools`: For generating client keypairs

### Deep Link Schemes
- Nostrum: `nostrum://`
- Amber: `amber:`
- Generic: `nostrconnect://`

## User Experience

### For Desktop Users
1. Click "Login" button
2. Navigate to "Bunker" tab
3. Scan the QR code with their mobile signer app
4. Approve the connection on their phone
5. Automatically logged in

### For Mobile Users
1. Click "Login" button
2. Navigate to "Bunker" tab
3. Tap one of the "Open in..." buttons
4. Their signer app opens automatically
5. Approve the connection
6. Return to the app, automatically logged in

## Security Considerations

- Ephemeral client keypairs are generated per session
- Secrets are used for connection verification
- Session data is stored in sessionStorage (cleared on tab close)
- All communication is encrypted using NIP-44

## Compatible Signers

This implementation works with any NIP-46 compatible remote signer, including:

- **Nostrum**: Mobile reference implementation (iOS & Android)
- **Amber**: Android signer
- **nsec.app**: Web-based signer
- **Primal**: Built-in remote signing
- Any other NIP-46 compliant signer

## Future Enhancements

Potential improvements for the future:
- Auto-detect successful connection and close dialog
- Remember preferred signer for returning users
- Show connection status in real-time
- Support for NIP-05 discovery of remote signers
- WebSocket connection monitoring
