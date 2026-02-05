/**
 * Traveltelly Help Bot Configuration
 * 
 * This file contains the configuration for the Clawstr-based help bot.
 * The bot assists users with questions about Traveltelly features.
 */

/**
 * Bot's Nostr public key (npub format)
 * 
 * 🚨 SETUP REQUIRED - The bot won't work until you complete these steps:
 * 
 * 1. Run in terminal:
 *    npx -y @clawstr/cli@latest init --name "Traveltelly Help Bot"
 * 
 * 2. Copy the npub from output (starts with npub1...)
 * 
 * 3. Replace the placeholder below with your REAL bot npub
 * 
 * 4. Rebuild: npm run build
 * 
 * See SETUP_BOT_NOW.md for quick 5-minute setup guide
 * See CLAWSTR_BOT_SETUP.md for detailed instructions
 */
export const HELP_BOT_NPUB = 'npub1traveltellybot...'; // 🚨 UPDATE THIS with your actual bot npub!

/**
 * Bot profile information
 */
export const BOT_INFO = {
  name: 'Traveltelly Help Bot',
  about: 'AI assistant for Traveltelly - helping users with reviews, stories, trips, and marketplace questions. Ask me anything! 🌍✈️📸',
  picture: '/bot-avatar.png', // Optional: add a bot avatar to /public
  nip05: 'bot@traveltelly.diy', // Optional: set up NIP-05 verification
};

/**
 * Quick help topics the bot can assist with
 */
export const HELP_TOPICS = [
  {
    id: 'reviews',
    icon: '📍',
    title: 'Reviews',
    description: 'How to create and manage reviews',
    keywords: ['review', 'rating', 'gps', 'location', 'category'],
  },
  {
    id: 'stories',
    icon: '📝',
    title: 'Stories',
    description: 'Writing travel articles and blogs',
    keywords: ['story', 'article', 'blog', 'markdown', 'publish'],
  },
  {
    id: 'trips',
    icon: '✈️',
    title: 'Trips',
    description: 'Creating trip reports with photos',
    keywords: ['trip', 'journey', 'route', 'gpx', 'photos'],
  },
  {
    id: 'marketplace',
    icon: '📸',
    title: 'Marketplace',
    description: 'Buying and selling stock media',
    keywords: ['marketplace', 'stock', 'media', 'buy', 'sell', 'purchase'],
  },
  {
    id: 'guest-checkout',
    icon: '💳',
    title: 'Guest Checkout',
    description: 'Purchasing without Nostr account',
    keywords: ['guest', 'checkout', 'email', 'purchase', 'subscription'],
  },
  {
    id: 'nostr',
    icon: '🔐',
    title: 'Nostr Login',
    description: 'How to login with Nostr extension',
    keywords: ['nostr', 'login', 'extension', 'nos2x', 'alby', 'keys'],
  },
  {
    id: 'maps',
    icon: '🗺️',
    title: 'Maps & GPS',
    description: 'GPS extraction and map features',
    keywords: ['map', 'gps', 'coordinates', 'exif', 'location'],
  },
  {
    id: 'admin',
    icon: '⚙️',
    title: 'Admin Features',
    description: 'Customer management and permissions',
    keywords: ['admin', 'customer', 'permission', 'manage', 'dashboard'],
  },
];

/**
 * FAQ responses for common questions
 */
export const FAQ_RESPONSES = {
  // Reviews
  'create-review': {
    question: 'How do I create a review?',
    answer: `To create a review:

1. Login with your Nostr extension
2. Navigate to Reviews → Create Review
3. Fill in:
   • Title
   • Category (cafe, restaurant, hotel, etc.)
   • Location
   • Star rating (1-5)
   • Description
4. Upload a photo (GPS auto-extracted from EXIF!)
5. Click "Publish Review"

Your review will appear on the map and in feeds instantly!`,
  },
  
  'gps-extraction': {
    question: 'How does GPS extraction work?',
    answer: `GPS extraction is automatic:

1. Upload a photo taken with your phone/camera
2. We read the EXIF metadata from the file
3. GPS coordinates are extracted if available
4. Location is encoded as a geohash
5. Your review appears on the map!

Supported formats: JPEG, HEIC, PNG (with EXIF data)

No GPS in photo? You can manually add coordinates.`,
  },

  // Marketplace
  'marketplace-purchase': {
    question: 'How do I purchase stock media?',
    answer: `To purchase stock media:

Option 1 - Lightning Payment (Nostr users):
1. Browse /marketplace
2. Click any product
3. Click "License & Download" → Lightning tab
4. Pay with your Lightning wallet
5. Download instantly!

Option 2 - Guest Checkout (no Nostr needed):
1. Browse /marketplace
2. Click any product
3. Click "License & Download" → Guest tab
4. Enter email and name
5. Complete payment
6. Download link sent to email!`,
  },

  'unlimited-subscription': {
    question: 'What is the unlimited downloads subscription?',
    answer: `Unlimited Downloads Subscription:

• $99/month
• Unlimited access to ALL stock media
• Commercial usage rights included
• No per-item charges
• Cancel anytime

Perfect for content creators, publishers, and agencies!

Subscribe at: /guest-portal`,
  },

  // Guest Checkout
  'guest-checkout': {
    question: 'Can I purchase without a Nostr account?',
    answer: `Yes! Guest Checkout allows purchases without Nostr:

1. Visit any stock media product
2. Click "License & Download"
3. Switch to "Guest" tab
4. Enter your email and name
5. Complete payment (Lightning or fiat)
6. Download instantly!

Your purchase history is saved to your email.

You can also subscribe for unlimited downloads at /guest-portal`,
  },

  // Nostr
  'nostr-login': {
    question: 'How do I login with Nostr?',
    answer: `To login with Nostr:

1. Install a Nostr extension:
   • nos2x (Chrome/Firefox) - Simple
   • Alby (Chrome/Firefox/Safari) - With Lightning wallet
   • Flamingo (Chrome) - Privacy-focused

2. Create or import your Nostr keys in the extension

3. Visit Traveltelly and click "Login"

4. Approve the connection request

Done! You can now create reviews, stories, and trips.

New to Nostr? Learn more at /what-is-nostr`,
  },

  // Trips
  'create-trip': {
    question: 'How do I create a trip report?',
    answer: `To create a trip report:

1. Login with Nostr
2. Navigate to Trips → Create Trip
3. Upload multiple photos with GPS data
4. Optional: Upload GPX/TCX file for exact route
5. Set trip category (walk, hike, cycling)
6. Add title and description
7. Publish!

The map will show your route connecting the photos chronologically.

Distance is calculated automatically from GPS coordinates.`,
  },

  // Stories
  'create-story': {
    question: 'How do I write a travel story?',
    answer: `To write a travel story:

1. Login with Nostr
2. Navigate to Stories → Create Story
3. Write in Markdown format
4. Add photos (GPS auto-extracted)
5. Add topic tags
6. Preview your story
7. Publish!

Stories support:
• Rich text formatting (Markdown)
• Photo galleries
• GPS-tagged images
• Topic tags for discovery
• Comments from readers`,
  },
};

/**
 * Bot greeting message
 */
export const BOT_GREETING = `👋 Hi! I'm the Traveltelly Help Bot!

I can help you with:
• Creating reviews, stories, and trips
• Stock media marketplace and purchases
• Guest checkout and subscriptions  
• GPS extraction and maps
• Nostr login and setup
• Admin features

What would you like to know?`;

/**
 * Quick action buttons for common questions
 */
export const QUICK_ACTIONS = [
  { label: 'Create Review', topic: 'reviews' },
  { label: 'Buy Stock Media', topic: 'marketplace' },
  { label: 'Guest Checkout', topic: 'guest-checkout' },
  { label: 'Nostr Login', topic: 'nostr' },
  { label: 'Create Trip', topic: 'trips' },
  { label: 'Write Story', topic: 'stories' },
];

/**
 * Get DM link to bot
 */
export function getBotDMLink(npub: string = HELP_BOT_NPUB): string {
  return `https://snort.social/messages/${npub}`;
}

/**
 * Get bot profile link
 */
export function getBotProfileLink(npub: string = HELP_BOT_NPUB): string {
  return `https://snort.social/p/${npub}`;
}
