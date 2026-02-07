# Twitter/X Sync to Nostr - Complete Guide

**Automatic Twitter-to-Nostr sync powered by Nostr.Band**

Based on: https://github.com/nostrband/nostr-twitter-bot-ui

---

## 🐦 Overview

The Twitter Sync feature automatically cross-posts your tweets to Nostr using the **Nostr.Band Twitter Bot** infrastructure.

**Location**: Admin → Social Media → Twitter tab

---

## ✨ Features

### 🔄 Automatic Sync
- **Real-time**: New tweets appear on Nostr automatically
- **Secure**: NIP-46 remote signing keeps keys safe
- **Media**: Images and videos are included
- **Open Source**: Powered by Nostr.Band

### 🔐 Secure Connection
- **Account Verification**: Prove you own the Twitter account
- **NIP-46 Signing**: Private keys never exposed
- **Relay Control**: Choose public or custom relays
- **Full Control**: Disconnect anytime

### 📊 History Tracking
- **View Synced Tweets**: See which tweets were posted to Nostr
- **Status Monitoring**: Track sync success/failures
- **Time Tracking**: When each tweet was synced
- **Link Preservation**: Original tweet links included

---

## 🚀 Quick Start

### Step 1: Access Twitter Sync

1. Login as admin
2. Go to **Admin → Social Media**
3. Click **"Twitter"** tab
4. You'll see the Twitter Sync interface at the top

### Step 2: Connect Your Twitter Account

1. **Enter Username**: Type your Twitter/X username (without @)
   ```
   Example: "traveltelly" not "@traveltelly"
   ```

2. **Choose Publishing Mode**:
   - **Public Relays** (recommended): Posts to default Nostr relays
   - **Specific Relays**: Choose custom relays

3. **Click "Next"**

### Step 3: Verify Account Ownership

1. **Post Verification Tweet**:
   - Click "Post Verification Tweet" button
   - Twitter opens with pre-filled text
   - Post the tweet

2. **Copy Tweet Link**:
   - After posting, copy the tweet URL
   - Format: `https://twitter.com/yourusername/status/1234567890`

3. **Paste Link**:
   - Paste into "Verification Tweet Link" field
   - Click "Verify & Connect"

### Step 4: Start Syncing! ✅

- Your Twitter account is now connected
- New tweets will automatically sync to Nostr
- View sync history anytime
- Manage settings or disconnect

---

## 🔧 Configuration Options

### Publishing Mode

#### Public Relays (Recommended)
**What**: Posts to Nostr.Band's default relay list
**Relays**:
- wss://relay.nostr.band
- wss://nos.lol
- wss://relay.damus.io
- wss://relay.exit.pub
- wss://nostr.mutinywallet.com
- wss://nostr.mom

**Best for**: Most users, maximum reach

#### Specific Relays
**What**: Posts only to relays you choose
**Options**: Add any wss:// relay URL
**Quick Add**: Preset relays available

**Best for**: Privacy, niche communities, relay testing

---

## 🛠️ How It Works (Technical)

### Architecture

```
Your Twitter Account
        ↓
Nostr.Band Backend (https://api.xtonostr.com)
        ↓ Fetches new tweets
        ↓ Converts to Nostr events
        ↓ Requests your signature (NIP-46)
Your Nostr Signer (nsec.app, Alby, etc.)
        ↓ You approve signature
        ↓ Signed event returned
Nostr.Band Backend
        ↓ Publishes to relays
Nostr Network
```

### Backend API (Nostr.Band)

**Endpoint**: `https://api.xtonostr.com`

**Key Operations**:
1. **Add User**: `POST /add`
   - Registers Twitter username
   - Sets up sync configuration
   - Verifies account ownership

2. **Fetch Tweets**: Backend periodically checks Twitter
3. **Convert to Nostr**: Tweets → Nostr kind 1 events
4. **Request Signature**: NIP-46 remote signing
5. **Publish**: Signed events to configured relays

### NIP-46 Remote Signing

**Bunker URL Format**:
```
bunker://{your-pubkey}?relay=wss://relay.nsec.app
```

**How it works**:
1. Backend creates unsigned event
2. Sends signing request to your signer (nsec.app, Alby)
3. You approve on your device
4. Signed event returned to backend
5. Backend publishes to Nostr

**Security**: Your private key never leaves your device!

### Verification Tweet

**Format**:
```
Verifying my account on nostr

My Public key: "npub1..."
```

**Purpose**: Proves you own both Twitter and Nostr accounts

**Process**:
1. Tweet posted with your npub
2. Backend fetches tweet via Twitter API
3. Verifies tweet contains correct npub
4. Activates sync if match

---

## 📊 Sync Event Format

### Tweet → Nostr Event

**Original Tweet**:
```
Just visited an amazing cafe in Tokyo! ☕️🇯🇵

Best matcha latte ever! 

#travel #tokyo #coffee
```

**Nostr Event** (kind 1):
```json
{
  "kind": 1,
  "content": "Just visited an amazing cafe in Tokyo! ☕️🇯🇵\n\nBest matcha latte ever!\n\n#travel #tokyo #coffee\n\nhttps://twitter.com/yourusername/status/123...",
  "tags": [
    ["client", "nostr-twitter-bot"],
    ["t", "travel"],
    ["t", "tokyo"],
    ["t", "coffee"],
    ["r", "https://twitter.com/yourusername/status/123...", "mention"]
  ],
  "created_at": 1234567890,
  "pubkey": "your-pubkey-hex"
}
```

**With Media**:
```json
{
  "kind": 1,
  "content": "...\nhttps://pbs.twimg.com/media/...",
  "tags": [
    ["image", "https://pbs.twimg.com/media/..."],
    ["imeta", "url https://pbs.twimg.com/media/..."],
    ...
  ]
}
```

---

## 🎯 Use Cases

### Travel Blogger
**Scenario**: Active on Twitter with travel tips, syncing to Nostr

**Setup**:
1. Connect @travelblogger account
2. Enable public relay publishing
3. Tweets auto-sync every few minutes
4. Nostr followers see Twitter content
5. Gradual audience migration

**Result**: Build Nostr presence while maintaining Twitter

### Photographer
**Scenario**: Share photos on Twitter, want Nostr backup

**Setup**:
1. Connect @photographer account
2. Enable Blossom media upload (future)
3. Photos synced with high quality
4. Both platforms stay updated

**Result**: Content preserved on decentralized network

### Travel Brand
**Scenario**: Multi-platform presence, centralize on Nostr

**Setup**:
1. Connect @travelbrand account
2. Custom relays for brand community
3. Auto-sync announcements
4. Engage both audiences

**Result**: Unified social strategy

---

## 📱 User Interface

### Not Connected State

```
┌─────────────────────────────────────────────┐
│ 🐦 Cross-post your tweets to Nostr          │
│ [by Nostr.Band badge]                       │
│                                              │
│ Your Nostr Profile                          │
│ [Avatar] Name                                │
│ npub1...                                     │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Connect Your Twitter Account                │
│                                              │
│ Twitter Username:                           │
│ [@____________] [Next →]                    │
│                                              │
│ Publishing Mode:                             │
│ ○ To default public relays (recommended)    │
│ ○ To specific relays                        │
│                                              │
│ ℹ️ How Twitter Sync Works:                  │
│ 1. Enter username & configure               │
│ 2. Verify account with tweet                │
│ 3. Tweets auto-sync to Nostr                │
│ 4. NIP-46 keeps keys secure                 │
└─────────────────────────────────────────────┘
```

### Verification State

```
┌─────────────────────────────────────────────┐
│ ⚠️ Verification Required                    │
│                                              │
│ You must verify @username ownership         │
│                                              │
│ Step 1: Post Verification Tweet             │
│ [🐦 Post Verification Tweet →]              │
│                                              │
│ Step 2: Paste Tweet Link                    │
│ [https://twitter.com/user/status/...]      │
│                                              │
│ [Verify & Connect]                          │
└─────────────────────────────────────────────┘
```

### Connected State

```
┌─────────────────────────────────────────────┐
│ ✅ Twitter Account Connected                │
│ Your @username tweets are syncing to Nostr  │
│                                              │
│ 🐦 @username                                │
│ Auto-syncing to default public relays       │
│ [View History] [Settings]                   │
│                                              │
│ ⚡ Sync Active! Tweets auto-post to Nostr   │
│                                              │
│ Features:                                    │
│ ✅ Automatic Sync                            │
│ ✅ Secure Signing (NIP-46)                  │
│ ✅ Media Included                            │
│ ✅ Open Source                               │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security & Privacy

### What Access is Required?

**Twitter API** (Nostr.Band backend):
- ✅ Read your public tweets
- ✅ Read public media
- ❌ Cannot post on your behalf
- ❌ Cannot access DMs
- ❌ Cannot follow/unfollow

**Nostr Signer** (Your device):
- ✅ Sign events with your key
- ✅ You approve each batch
- ✅ Keys never leave your device
- ✅ Can revoke access anytime

### NIP-46 Security

**How your keys stay safe**:
1. Backend creates **unsigned** Nostr event
2. Sends signing request to your signer (nsec.app)
3. **You approve** on your device
4. Signed event returned to backend
5. Backend publishes to Nostr

**Your private key**: Never sent to backend, never exposed

### Account Verification

**Why needed**: Prevent impersonation
**How**: Post tweet with your npub
**What we check**: Tweet exists and contains your npub
**After verification**: Auto-sync activates

---

## 📈 Sync History

### View Your Sync History

Click **"View History"** button to see:
- All synced tweets
- Sync timestamps
- Success/failure status
- Original tweet links
- Nostr event IDs

**External Tool**: Opens https://nostr-twitter-bot-ui.vercel.app/{username}

### What You'll See

**Synced Tweet Entry**:
- Original tweet text
- Media (if any)
- Posted timestamp
- Nostr event link
- Twitter link
- Sync status (success/pending/failed)

---

## 🐛 Troubleshooting

### "Verification Failed"

**Possible causes**:
- Tweet not posted yet (wait a few seconds)
- Wrong tweet link pasted
- Tweet doesn't contain correct npub
- Twitter account private

**Solution**:
1. Ensure tweet is posted and public
2. Copy the exact tweet URL
3. Verify npub in tweet matches yours
4. Try again

### "Sync Not Working"

**Check**:
- Twitter account still connected?
- NIP-46 signer still approved?
- Relays online?
- Twitter account public?

**Solution**:
1. Check sync history for errors
2. Reconnect Twitter account
3. Re-approve NIP-46 access
4. Contact Nostr.Band support

### "No Tweets Appearing on Nostr"

**Check**:
- Recently tweeted? (sync may have delay)
- Tweets are public?
- Relays configured correctly?
- Check Nostr client

**Solution**:
1. Wait a few minutes for sync
2. Check your Nostr feed
3. Search for your npub on Nostr.Band
4. View sync history

---

## 🔧 Advanced Configuration

### Custom Relay Setup

**When to use**:
- Want to post to specific community relays
- Privacy-focused (avoid public relays)
- Testing new relays
- Niche audience targeting

**How to configure**:
1. Select "To specific relays" option
2. Click "Quick Add" for presets or
3. Enter custom relay URL (wss://...)
4. Add multiple relays as needed
5. Save configuration

### Disconnect Account

**To disconnect**:
1. Go to Twitter tab (if connected)
2. Click "Settings" button
3. Click disconnect option
4. Confirm action

**What happens**:
- Sync stops immediately
- Previous synced tweets remain on Nostr
- Can reconnect anytime
- History preserved

---

## 💰 Costs

### Nostr.Band Service

**Current**: Free (community service)
**Future**: May introduce premium tiers

### Alternative: Self-Host

**Option**: Run your own instance
**Repo**: https://github.com/nostrband/nostr-twitter-bot
**Requirements**:
- Twitter API access ($100/mo minimum)
- Server hosting
- NIP-46 signer setup

---

## 🔗 Related Services

### Nostr.Band
- **Website**: https://nostr.band
- **Purpose**: Nostr search and relay services
- **Twitter Bot**: Open-source sync infrastructure

### xNostr
- **Website**: https://xnostr.com
- **Purpose**: Premium X/Instagram → Nostr sync
- **Pricing**: $25-60/mo
- **Difference**: Paid service, more features

### Twitter API
- **Docs**: https://developer.twitter.com/
- **Access**: API keys required for self-hosting
- **Costs**: $100/mo minimum (Basic tier)

---

## 📊 Comparison: Twitter Sync Methods

| Feature | Nostr.Band (This) | xNostr | Self-Host |
|---------|------------------|--------|-----------|
| **Cost** | Free | $25-60/mo | $100+/mo |
| **Setup** | 5 minutes | Sign up | Hours/days |
| **Media** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Auto-Sync** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Custom Relays** | ✅ Yes | Limited | ✅ Yes |
| **Bulk Import** | ❌ No | ✅ Yes | ✅ Yes |
| **Support** | Community | Priority | DIY |
| **Control** | Medium | Low | Full |

**Recommendation**: Start with Nostr.Band (free), upgrade to xNostr if you need bulk import

---

## 🎯 Best Practices

### For New Users
1. **Start Simple**: Use public relays first
2. **Test with Few Tweets**: Verify sync works
3. **Check History**: Monitor first few syncs
4. **Gradually Promote**: Tell followers about Nostr
5. **Cross-Link**: Link Nostr profile in Twitter bio

### For Power Users
1. **Custom Relays**: Target your community
2. **Selective Sync**: Not all tweets need Nostr (future feature)
3. **Media Quality**: Consider Blossom for originals
4. **Analytics**: Track engagement on both platforms
5. **Audience Bridge**: Guide followers to Nostr

### For Privacy
1. **Review Tweets**: Check what will be synced
2. **Use Specific Relays**: Avoid public relays
3. **Separate Accounts**: Different Twitter for different topics
4. **Monitor Sync**: Check what's being posted
5. **Disconnect**: Stop sync if needed

---

## 📚 Event Schema

### Synced Tweet Event

**Kind**: 1 (text note)

**Tags**:
```typescript
[
  ["client", "nostr-twitter-bot"],      // Identifies source
  ["t", "hashtag1"],                     // Hashtags from tweet
  ["t", "hashtag2"],
  ["r", "https://twitter.com/.../status/...", "mention"], // Original tweet link
  ["image", "https://..."],              // If tweet has media
  ["imeta", "url https://..."],          // NIP-92 media metadata
]
```

**Content**:
- Original tweet text
- Original tweet URL (appended)
- Media URLs (if images/videos)

**Signature**: Your signature via NIP-46

---

## 🚨 Important Notes

### Rate Limits

**Twitter API**:
- Free tier: Very limited
- Basic tier: 10,000 tweets/month
- Nostr.Band handles this

**Nostr Relays**:
- Most relays: No limits for reading
- Some relays: Rate limit publishing
- Use default relays (well-maintained)

### Content Preservation

**What syncs**:
- ✅ Tweet text
- ✅ Media (images, videos)
- ✅ Hashtags
- ✅ Links

**What doesn't sync**:
- ❌ Replies (context lost)
- ❌ Quote tweets (future feature)
- ❌ Polls (no Nostr equivalent yet)
- ❌ Twitter Spaces

### Account Changes

**If you change Twitter username**:
- Must reconnect with new username
- Old synced tweets remain on Nostr
- History preserved

**If you delete Twitter account**:
- Sync stops automatically
- Nostr content persists
- Your content lives on!

---

## 🎓 FAQ

### "Do I need a Twitter API key?"
No! Nostr.Band handles the Twitter API access. You just provide your username.

### "Will this post TO Twitter?"
No. This is one-way: Twitter → Nostr. It reads tweets and posts to Nostr.

### "Can I sync old tweets?"
Currently no bulk import. Use xNostr ($25/mo) if you need historical tweets.

### "How long is the delay?"
Usually a few minutes. Backend checks Twitter periodically.

### "What if I tweet something I don't want on Nostr?"
Currently all public tweets sync. Future: selective sync. Workaround: Delete from Nostr manually.

### "Is this free forever?"
Nostr.Band currently free. May introduce premium tiers later. Always open-source!

### "Can I use multiple Twitter accounts?"
Yes! Connect each separately. Each gets its own sync configuration.

---

## 🔧 Troubleshooting

### Connection Issues

**Problem**: "Failed to connect account"

**Solutions**:
1. Check username is correct (no @)
2. Ensure Twitter account is public
3. Verify you posted verification tweet
4. Check tweet link is exact URL
5. Try again after a few minutes

### Signature Issues

**Problem**: "Signature request failed"

**Solutions**:
1. Check NIP-46 signer is running (nsec.app, Alby)
2. Re-login to signer
3. Approve signature request promptly
4. Check signer relay is online (wss://relay.nsec.app)

### Sync Delays

**Problem**: Tweets not appearing on Nostr quickly

**Expected**: 5-15 minute delay (backend polling)
**Check**: View sync history for status
**Solution**: Be patient, check history

---

## 📞 Support

### Nostr.Band
- **Website**: https://nostr.band
- **Twitter Bot UI**: https://nostr-twitter-bot-ui.vercel.app
- **GitHub**: https://github.com/nostrband/nostr-twitter-bot-ui
- **Support**: Tag @nostr.band on Nostr

### Traveltelly
- **Admin**: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642
- **Issues**: GitHub issues
- **Community**: Nostr #traveltelly

---

## 🚀 Next Steps

### After Connecting

1. **Tweet Something**: Post a new tweet on Twitter
2. **Wait 5-15 Minutes**: Backend will sync it
3. **Check Nostr**: View on any Nostr client
4. **Verify History**: Click "View History" button
5. **Promote**: Tell Twitter followers about your Nostr presence!

### Grow Your Nostr Audience

1. **Add Nostr Link**: Put npub or nostr.band link in Twitter bio
2. **Cross-Promote**: Occasionally mention Nostr on Twitter
3. **Engage on Both**: Reply on both platforms
4. **Exclusive Content**: Tease Nostr-only content
5. **Be Patient**: Audience migration takes time

---

## 🎉 Success Indicators

### You'll know it's working when:
1. ✅ Twitter account shows as "Connected"
2. ✅ New tweets appear on Nostr within 15 minutes
3. ✅ Sync history shows successful syncs
4. ✅ Media from tweets is included
5. ✅ Hashtags are preserved
6. ✅ Original tweet links in Nostr content

---

## 📖 Additional Resources

### Documentation
- **This Guide**: Complete Twitter sync documentation
- **SOCIAL_MEDIA_SYNC.md**: General social media features
- **NIP-46**: https://github.com/nostr-protocol/nips/blob/master/46.md

### Related Projects
- **Nostr.Band**: https://nostr.band
- **xNostr**: https://xnostr.com
- **nsec.app**: https://nsec.app (NIP-46 signer)

---

**Your Twitter content is now flowing to Nostr!** 🐦→⚡

**Visit**: Admin → Social Media → Twitter tab to get started! 🚀
