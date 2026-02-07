# Social Media Integration - xNostr-Style Sync

**Sync X/Twitter and Instagram content to Nostr automatically**

---

## 🌟 Overview

The Social Media page (formerly "Share Scheduler") now includes **xNostr-style sync functionality** for bridging your X/Twitter and Instagram content to Nostr.

**Location**: `/admin/share-scheduler` (Admin → Social Media)

---

## ✨ Features (Inspired by xNostr)

### 1. **Bulk Import**
- Import all existing X/Twitter or Instagram posts to Nostr
- Preserve your content history
- One-click migration

### 2. **Automatic Sync**
- Set custom sync interval (5, 15, 30, 60, or 360 minutes)
- Automatically fetch new posts
- Convert to Nostr format
- Publish with your signature

### 3. **Auto-Post to Nostr**
- NIP-46 remote signing integration
- Automatic publication to Nostr relays
- No manual intervention needed
- Your keys stay secure

### 4. **Blossom Media Upload**
- Upload images/videos to Blossom servers
- Decentralized media storage
- Maintain media ownership
- CDN-like performance

---

## 🎯 How It Works

### X/Twitter → Nostr

1. **Connect Account**: Link your X/Twitter account
2. **Configure Sync**: Set interval and preferences
3. **Bulk Import** (optional): Import existing tweets
4. **Auto-Sync**: New tweets automatically posted to Nostr
5. **Media Upload**: Images/videos uploaded to Blossom
6. **Signature**: You sign all events (NIP-46)

### Instagram → Nostr

1. **Connect Account**: Link your Instagram account
2. **Configure Sync**: Set interval and preferences
3. **Bulk Import** (optional): Import existing posts
4. **Auto-Sync**: New posts automatically shared to Nostr
5. **Media Upload**: Photos/videos to Blossom
6. **Signature**: You sign all events (NIP-46)

---

## 📊 Sync Configuration

### Available Settings

| Setting | Options | Description |
|---------|---------|-------------|
| **Bulk Import** | On/Off | Import all existing posts |
| **Auto-Sync** | On/Off | Enable automatic syncing |
| **Sync Interval** | 5, 15, 30, 60, 360 min | How often to check for new posts |
| **Auto-Post** | On/Off | Automatically publish to Nostr |
| **Blossom Upload** | On/Off | Upload media to Blossom |

### Recommended Settings

**For Active Posters**:
- Sync Interval: 15 minutes
- Auto-Post: Enabled
- Blossom Upload: Enabled

**For Occasional Posters**:
- Sync Interval: 60 minutes
- Auto-Post: Enabled
- Blossom Upload: Enabled

**For Bulk Migration**:
- Bulk Import: Enabled (once)
- Auto-Sync: Disabled (until ready)

---

## 💰 Pricing (Future)

Similar to xNostr pricing structure:

### Standard - $25/month
- **2 accounts** total (X + Instagram)
- Automatic sync (customizable interval)
- Auto-post to Nostr
- Blossom media upload
- Unlimited post sync
- Bulk import

### Professional - $40/month
- **5 accounts** total (X + Instagram)
- Everything in Standard
- Faster sync (5, 15, 30 min)
- Priority support
- Early access to new features

### Business - $60/month
- **10 accounts** total (X + Instagram)
- Everything in Professional
- Dedicated account manager
- Custom feature requests
- Extended history sync

**Payment**: Lightning ⚡ (instant) or Bitcoin on-chain

---

## 🔐 Security & Privacy

### How Your Keys Stay Safe

1. **NIP-46 Remote Signing**:
   - Your private keys never leave your device
   - Each event is signed by you
   - Full control over what gets published

2. **OAuth Integration**:
   - X/Instagram login via OAuth
   - No password storage
   - Revocable access tokens

3. **Secure Backend**:
   - API keys encrypted
   - No content storage
   - Process and forward only

### What We Access

**From X/Twitter**:
- ✅ Read tweets and media
- ✅ User profile info
- ❌ Cannot post on your behalf
- ❌ Cannot DM anyone
- ❌ Cannot follow/unfollow

**From Instagram**:
- ✅ Read posts and media
- ✅ User profile info
- ❌ Cannot post on your behalf
- ❌ Cannot comment
- ❌ Cannot like/follow

**To Nostr**:
- ✅ Publish with your signature
- ✅ Upload media to Blossom
- ✅ Full event control
- ✅ You own everything

---

## 🚀 Current Status

### ✅ UI Complete
- xNostr-style interface added
- Feature cards displayed
- Configuration preview
- Pricing information
- Beautiful design matching xNostr

### 🔄 Implementation Pending
- [ ] X/Twitter OAuth integration
- [ ] Instagram OAuth integration
- [ ] Bulk import functionality
- [ ] Auto-sync scheduler
- [ ] NIP-46 remote signing
- [ ] Blossom upload integration
- [ ] Payment system (Lightning)
- [ ] Account management

---

## 🛠️ Technical Implementation (Next Steps)

### Step 1: X/Twitter OAuth

```typescript
// Install Twitter API client
npm install twitter-api-v2

// Backend endpoint
import { TwitterApi } from 'twitter-api-v2';

export async function connectTwitter(userId: string) {
  const client = new TwitterApi({
    appKey: process.env.TWITTER_API_KEY,
    appSecret: process.env.TWITTER_API_SECRET,
  });

  const authLink = await client.generateAuthLink(
    `${process.env.SITE_URL}/callback/twitter`
  );

  return authLink.url;
}

// Fetch tweets
export async function fetchTweets(userId: string, accessToken: string) {
  const client = new TwitterApi(accessToken);
  const tweets = await client.v2.userTimeline(userId, {
    max_results: 100,
    'tweet.fields': ['created_at', 'attachments'],
    'media.fields': ['url', 'preview_image_url'],
  });

  return tweets.data;
}
```

### Step 2: Instagram Integration

```typescript
// Instagram Basic Display API
npm install instagram-basic-display

import Instagram from 'instagram-basic-display';

export async function connectInstagram() {
  const ig = new Instagram({
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
    redirectUri: `${process.env.SITE_URL}/callback/instagram`,
  });

  return ig.getAuthorizationUrl();
}

export async function fetchInstagramPosts(accessToken: string) {
  const response = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&access_token=${accessToken}`
  );
  
  return response.json();
}
```

### Step 3: Convert to Nostr

```typescript
// Convert tweet to Nostr event
export function tweetToNostrEvent(tweet: any, userPubkey: string) {
  return {
    kind: 1,
    created_at: Math.floor(new Date(tweet.created_at).getTime() / 1000),
    tags: [
      ['client', 'traveltelly'],
      ['t', 'twitter-sync'],
      ['r', tweet.url, 'mention'],
    ],
    content: tweet.text,
    pubkey: userPubkey,
  };
}

// Convert Instagram post to Nostr
export function instagramToNostrEvent(post: any, userPubkey: string, imageUrl: string) {
  return {
    kind: 1,
    created_at: Math.floor(new Date(post.timestamp).getTime() / 1000),
    tags: [
      ['client', 'traveltelly'],
      ['t', 'instagram-sync'],
      ['image', imageUrl],
      ['imeta', `url ${imageUrl}`],
      ['r', post.permalink, 'mention'],
    ],
    content: post.caption || '',
    pubkey: userPubkey,
  };
}
```

### Step 4: NIP-46 Remote Signing

```typescript
// Set up remote signer
import { nip46 } from 'nostr-tools';

export async function setupRemoteSigner(userPubkey: string) {
  // Connect to user's remote signer
  const signer = await nip46.connect({
    relayUrls: ['wss://relay.nsec.app'],
    targetPubkey: userPubkey,
  });

  return signer;
}

// Sign and publish with remote signer
export async function publishWithRemoteSigner(
  event: any,
  signer: any
) {
  const signedEvent = await signer.signEvent(event);
  await nostr.event(signedEvent);
}
```

### Step 5: Blossom Upload

```typescript
// Upload media to Blossom
import { uploadToBlossom } from '@/hooks/useUploadFile';

export async function uploadSocialMedia(mediaUrl: string, userSigner: any) {
  // Fetch media from X/Instagram
  const response = await fetch(mediaUrl);
  const blob = await response.blob();
  
  // Convert to File
  const file = new File([blob], 'media.jpg', { type: blob.type });
  
  // Upload to Blossom
  const tags = await uploadToBlossom(file, userSigner);
  
  return tags[0][1]; // Return Blossom URL
}
```

---

## 📱 User Interface

### Sync Card (Twitter/Instagram Only)

When you open Twitter or Instagram tabs, you'll see:

```
┌─────────────────────────────────────────────────────┐
│ 🐦 Sync Twitter/X to Nostr         [xNostr-Style] │
│                                                      │
│ Automatically sync your content to Nostr in real-time │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐        │
│ │ ✅ Bulk Import    │  │ ✅ Auto-Sync     │        │
│ │ Import all posts │  │ Every 60 minutes │        │
│ └──────────────────┘  └──────────────────┘        │
│                                                      │
│ ┌──────────────────┐  ┌──────────────────┐        │
│ │ ✅ Auto-Post      │  │ ✅ Blossom       │        │
│ │ NIP-46 signing   │  │ Media upload     │        │
│ └──────────────────┘  └──────────────────┘        │
│                                                      │
│ Configuration:                                       │
│ ┌──────────────────────────────────────────┐       │
│ │ ✅ Bulk Import          [Import All →]   │       │
│ │ ⏰ Sync Interval        [1 hour ▼]       │       │
│ │ ⚡ Auto-Post to Nostr   [Disabled]       │       │
│ │ 📷 Blossom Upload       [Disabled]       │       │
│ └──────────────────────────────────────────┘       │
│                                                      │
│ Plans: $25-60/mo • Lightning payments ⚡            │
│                                                      │
│ [Connect Twitter/X →]                                │
│                                                      │
│ 💡 Inspired by xNostr      [Visit xNostr →]        │
└──────────────────────────────────────────────────────┘
```

### Manual Scheduler (All Platforms)

Below the sync card, the original scheduler interface remains:
- Schedule individual posts
- Auto-fill from Traveltelly URLs
- Character count tracking
- Ready-to-post queue
- Posted history

---

## 🎯 Use Cases

### Content Creator with X Audience
**Scenario**: Travel photographer with 10K followers on X, wants to build Nostr presence

**Solution**:
1. Connect X account via sync
2. Enable bulk import (migrate 1000+ tweets)
3. Set auto-sync to 15 minutes
4. Enable auto-post to Nostr
5. Upload media to Blossom

**Result**: X followers discover you on Nostr via cross-posts, gradual audience migration

### Instagram Travel Influencer
**Scenario**: Travel blogger with 50K Instagram followers, new to Nostr

**Solution**:
1. Connect Instagram via sync
2. Bulk import top 100 posts
3. Set auto-sync to 30 minutes
4. Enable Blossom for photo storage
5. Maintain both platforms

**Result**: Build Nostr presence while keeping Instagram audience engaged

### Multi-Platform Strategy
**Scenario**: Travel brand active on X, Instagram, and Facebook

**Solution**:
1. Connect all 3 platforms
2. Use Professional plan (5 accounts)
3. Auto-sync all platforms
4. Centralize on Nostr
5. Cross-promote

**Result**: Unified presence across centralized and decentralized platforms

---

## 🔧 Development Roadmap

### Phase 1: OAuth Integration (4-6 weeks)
- [ ] X/Twitter OAuth implementation
- [ ] Instagram OAuth implementation
- [ ] Account connection UI
- [ ] Token management
- [ ] Revoke access functionality

### Phase 2: Bulk Import (2-3 weeks)
- [ ] Fetch historical posts API
- [ ] Convert to Nostr format
- [ ] Batch publishing
- [ ] Progress tracking
- [ ] Error handling

### Phase 3: Auto-Sync (3-4 weeks)
- [ ] Polling scheduler (5-360 min intervals)
- [ ] Webhook listeners (if available)
- [ ] Delta detection (only new posts)
- [ ] Rate limiting
- [ ] Retry logic

### Phase 4: NIP-46 Remote Signing (2-3 weeks)
- [ ] Remote signer connection
- [ ] Event signing flow
- [ ] Permission management
- [ ] Revocation handling

### Phase 5: Blossom Integration (1-2 weeks)
- [ ] Media download from X/Instagram
- [ ] Upload to Blossom servers
- [ ] CDN integration
- [ ] Fallback handling

### Phase 6: Payment System (3-4 weeks)
- [ ] Lightning payment integration
- [ ] Subscription management
- [ ] Invoice generation
- [ ] Webhook handling
- [ ] Account limits

**Total Estimated Time**: 15-22 weeks (3.5-5 months)

---

## 💡 Current Implementation

### ✅ What's Built (UI Complete)

1. **Sync Card UI**:
   - Feature showcase (4 cards)
   - Connect account button
   - Configuration preview
   - Pricing information
   - xNostr link

2. **Configuration UI**:
   - Bulk import toggle
   - Sync interval selector
   - Auto-post status
   - Blossom upload status

3. **Platform-Specific**:
   - Twitter tab with X branding
   - Instagram tab with IG branding
   - Platform colors and icons
   - Character limits

### 🔄 What's Pending (Backend)

1. **OAuth Integration**: Connect X/Instagram accounts
2. **API Calls**: Fetch posts from platforms
3. **Data Conversion**: Transform to Nostr events
4. **Remote Signing**: NIP-46 implementation
5. **Media Upload**: Blossom integration
6. **Payment System**: Lightning subscriptions

---

## 🎨 Design Highlights

### Color Coding

**Twitter**: `#1DA1F2` (Twitter blue)
- Border, icon, and accent colors
- Consistent with X branding

**Instagram**: `#E4405F` (Instagram gradient pink)
- Border, icon, and accent colors
- Matches Instagram aesthetic

### Feature Cards

Each feature card shows:
- ✅ Checkmark icon (purple)
- Feature name (bold)
- Description (muted text)
- Purple-to-pink gradient background
- Rounded corners with border

### xNostr Attribution

Bottom of sync card includes:
- External link icon
- "Inspired by xNostr" text
- "Visit xNostr" button
- Links to https://xnostr.com/

---

## 🧪 Testing (Demo Mode)

### Current Functionality

**✅ Works Now**:
- View sync UI on Twitter/Instagram tabs
- See feature descriptions
- Preview configuration options
- Adjust sync interval (UI only)
- Click "Connect" button (shows "Coming Soon" toast)
- Visit xNostr link

**⏳ Pending Real Integration**:
- Actually connect accounts
- Fetch real posts
- Sync to Nostr
- Upload media
- Payment processing

---

## 📊 Comparison: xNostr vs Traveltelly

### xNostr (Original)

**Focus**: Generic X/Instagram → Nostr sync
- Any content type
- No domain expertise
- Standalone service
- Paid subscription only

### Traveltelly Social Media (This Implementation)

**Focus**: Travel content sync + manual scheduler
- Travel-specific optimization
- Travel content expertise
- Integrated with Traveltelly platform
- Free manual scheduler + paid auto-sync

### Key Differences

| Feature | xNostr | Traveltelly |
|---------|--------|-------------|
| **Auto-Sync** | ✅ Yes | 🔄 Coming |
| **Bulk Import** | ✅ Yes | 🔄 Coming |
| **Manual Scheduler** | ❌ No | ✅ Yes |
| **Travel Content** | Generic | ✅ Optimized |
| **Platform Integration** | Standalone | ✅ Integrated |
| **Pricing** | $25-60/mo | Free + Premium |

---

## 🎯 Why Add This?

### Benefits for Traveltelly Users

1. **Audience Bridge**: Bring X/Instagram followers to Nostr
2. **Content Preservation**: Back up all posts to decentralized network
3. **Cross-Posting**: Maintain presence on multiple platforms
4. **Time Savings**: Automate content distribution
5. **Nostr Growth**: Build decentralized audience while keeping existing

### Benefits for Traveltelly Platform

1. **User Retention**: More reasons to use platform
2. **Content Volume**: More posts = more engagement
3. **Revenue Stream**: Subscription fees
4. **Competitive Edge**: Unique feature vs other travel platforms
5. **Network Effect**: More content attracts more users

---

## 📞 Support

### Documentation
- This file (`SOCIAL_MEDIA_SYNC.md`)
- `AI_CHAT_SETUP_GUIDE.md` (backend setup patterns)
- `MASTER_GUIDE.md` (platform overview)

### External Resources
- **xNostr**: https://xnostr.com/
- **Twitter API**: https://developer.twitter.com/
- **Instagram API**: https://developers.facebook.com/docs/instagram-basic-display-api
- **NIP-46**: https://github.com/nostr-protocol/nips/blob/master/46.md
- **Blossom**: https://github.com/hzrd149/blossom

### Community
- GitHub Issues for bugs
- Nostr #traveltelly for help
- Admin: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

## 🎉 Summary

### What Changed

1. ✅ **Page renamed**: "Share Scheduler" → "Social Media"
2. ✅ **xNostr-style UI added**: Sync cards for Twitter & Instagram
3. ✅ **Feature showcase**: 4 key features explained
4. ✅ **Configuration preview**: UI for sync settings
5. ✅ **Pricing displayed**: Premium plans outlined
6. ✅ **xNostr attribution**: Link to original service

### What's Next

**Short Term**:
- Implement OAuth integrations
- Build sync backend
- Test with real accounts

**Long Term**:
- Launch premium plans
- Add more platforms (Facebook, LinkedIn, TikTok)
- Advanced filtering and categorization
- Analytics dashboard

---

**Your Social Media page is now ready for xNostr-style sync implementation!** 🚀

**Try it**: Visit `/admin/share-scheduler` → Twitter or Instagram tabs 📱✨
