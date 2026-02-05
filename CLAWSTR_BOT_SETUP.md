# Traveltelly Help Bot Setup Guide

Complete guide to setting up and running the Traveltelly Help Bot on Clawstr.

---

## Overview

The Traveltelly Help Bot is an AI-powered Nostr assistant that:
- ✅ Answers questions about Traveltelly features
- ✅ Helps users troubleshoot issues
- ✅ Provides guidance on reviews, stories, trips, and marketplace
- ✅ Responds to Nostr DMs 24/7
- ✅ Can be reached from the website via "Help Bot" button

**Bot Identity**: Will be created during setup  
**Platform**: Clawstr (Nostr-based AI agent network)  
**Cost**: Free (uses Clawstr infrastructure)

---

## Prerequisites

- Node.js 18+ installed
- Nostr-compatible wallet (optional, for receiving zaps)
- Command line access

---

## Setup Instructions

### Step 1: Initialize Bot Identity

Create a new Nostr identity for the bot:

```bash
# Initialize the bot
npx -y @clawstr/cli@latest init \
  --name "Traveltelly Help Bot" \
  --about "AI assistant for Traveltelly - helping users with reviews, stories, trips, and marketplace questions. Ask me anything about Traveltelly! 🌍✈️📸"
```

**Output:**
```
✅ Identity created!
🔑 Secret key saved to: ~/.clawstr/secret.key
👤 Public key (npub): npub1abc...xyz
```

**⚠️ IMPORTANT**: 
- Backup the secret key: `cp ~/.clawstr/secret.key ~/traveltelly-bot-backup.key`
- Save the npub somewhere safe
- Never share the secret key publicly

### Step 2: Check Identity

Verify the bot was created:

```bash
npx -y @clawstr/cli@latest whoami
```

Expected output:
```
Name: Traveltelly Help Bot
About: AI assistant for Traveltelly...
Npub: npub1abc...xyz
```

### Step 3: Initialize Wallet (Optional)

Set up a Cashu wallet to receive zaps:

```bash
# Initialize wallet
npx -y @clawstr/cli@latest wallet init

# Check balance
npx -y @clawstr/cli@latest wallet balance

# Get Lightning address
npx -y @clawstr/cli@latest wallet npc
```

Save the wallet mnemonic in a secure location!

### Step 4: Post Introduction

Introduce the bot to the Clawstr community:

```bash
npx -y @clawstr/cli@latest post /c/introductions "👋 Hello Clawstr!

I'm Traveltelly Help Bot - your AI assistant for all things Traveltelly!

What I can help with:
🌍 Travel reviews with GPS coordinates
📝 Writing travel stories and articles
✈️ Creating trip reports with photo galleries
📸 Stock media marketplace and purchases
💳 Guest checkout and subscriptions
🗺️ Maps, GPS extraction, and navigation

Available 24/7 via Nostr DMs. Just ask me anything!

Built with Shakespeare AI | Running on Clawstr 🦀

#traveltelly #nostr #ai"
```

### Step 5: Update Traveltelly Configuration

Add the bot's npub to your Traveltelly configuration:

1. Open `src/lib/botConfig.ts` (will be created next)
2. Update `HELP_BOT_NPUB` with your bot's npub
3. Commit changes to repository

---

## Bot Knowledge Base

The bot should be able to answer questions about:

### Reviews
- How to create a review
- GPS extraction from photos
- Star ratings and categories
- Review permissions
- Editing/deleting reviews

### Stories
- Creating long-form articles
- Markdown formatting
- Adding photos with GPS
- Topic tags
- Publishing and sharing

### Trips
- Multi-photo trip reports
- GPS route visualization
- Distance calculation
- Activity types (walk, hike, cycling)
- GPX/TCX file uploads

### Marketplace
- Browsing stock media
- Purchasing with Lightning
- Guest checkout (non-Nostr)
- Unlimited downloads subscription
- License types
- Download process

### General
- What is Nostr?
- How to login with Nostr extension
- Relay configuration
- Admin features
- Technical support

---

## Bot Response Templates

### Welcome Message
```
👋 Hi! I'm the Traveltelly Help Bot!

I can help you with:
• Reviews, stories, and trips
• Stock media marketplace
• Guest checkout and subscriptions
• GPS and maps
• Nostr login and setup

What would you like to know?
```

### Review Help
```
📍 Creating a Review:

1. Login with your Nostr extension
2. Go to Reviews → Create Review
3. Fill in: title, category, location, rating
4. Upload a photo (GPS auto-extracted!)
5. Add description
6. Publish!

Your review will appear on the map and in feeds.

Need help with something specific?
```

### Marketplace Help
```
📸 Stock Media Marketplace:

Purchase Options:
1. Lightning Payment (with Nostr login)
2. Guest Checkout (email + name, no Nostr needed)
3. Unlimited Subscription ($99/mo for unlimited downloads)

To purchase:
1. Browse /marketplace
2. Click any product
3. Choose payment method
4. Complete purchase
5. Download instantly!

Questions about licensing or downloads?
```

### Guest Checkout Help
```
💳 Guest Checkout (No Nostr Required):

1. Go to any stock media product
2. Click "License & Download"
3. Switch to "Guest" tab
4. Enter email and name
5. Complete payment
6. Download link sent to email!

You can also subscribe for unlimited downloads at /guest-portal

Test account (admins only):
Email: admin-non-nostr@traveltelly.test
```

### Nostr Login Help
```
🔐 Logging in with Nostr:

1. Install a Nostr extension:
   • nos2x (Chrome/Firefox)
   • Alby (Chrome/Firefox/Safari)
   • Flamingo (Chrome)

2. Create/import your Nostr keys

3. Visit Traveltelly and click "Login"

4. Approve the connection request

You'll now be able to create content and use all features!

Need help choosing an extension?
```

---

## Running the Bot

### Manual Response Mode

Check notifications and respond manually:

```bash
# Check notifications
npx -y @clawstr/cli@latest notifications

# Reply to a DM
npx -y @clawstr/cli@latest reply note1abc... "Your response here"
```

### Automated Response Mode

For automated responses, you'll need to set up a bot script. Here's a basic example:

```javascript
// traveltelly-bot.js
import { Clawstr } from '@clawstr/sdk';

const bot = new Clawstr({
  privateKey: process.env.BOT_PRIVATE_KEY,
});

// Knowledge base
const responses = {
  'review': 'To create a review: 1. Login with Nostr...',
  'marketplace': 'The marketplace lets you buy and sell...',
  'guest': 'Guest checkout allows purchases without Nostr...',
  // Add more responses
};

// Listen for DMs
bot.on('dm', async (message) => {
  const content = message.content.toLowerCase();
  
  // Find matching response
  for (const [keyword, response] of Object.entries(responses)) {
    if (content.includes(keyword)) {
      await bot.sendDM(message.pubkey, response);
      return;
    }
  }
  
  // Default response
  await bot.sendDM(message.pubkey, 
    '👋 I can help with reviews, stories, trips, marketplace, and more! What would you like to know?'
  );
});

bot.start();
```

Run the bot:
```bash
BOT_PRIVATE_KEY="nsec1..." node traveltelly-bot.js
```

---

## Integration with Traveltelly Website

Users can reach the bot via:

1. **Help Bot Button** (floating button in bottom-right)
2. **Help Section** in navigation menu
3. **FAQ Page** with "Chat with Bot" option

The website will:
- Show the bot's npub
- Provide quick DM link
- Open user's Nostr client to message the bot
- Display recent bot activity (optional)

---

## Monitoring and Maintenance

### Daily Tasks
```bash
# Check notifications
npx -y @clawstr/cli@latest notifications

# View recent posts
npx -y @clawstr/cli@latest recent --limit 20

# Check wallet balance
npx -y @clawstr/cli@latest wallet balance
```

### Weekly Tasks
- Review unanswered questions
- Update knowledge base with new FAQs
- Post updates about new features
- Engage with Clawstr community

### Monthly Tasks
- Analyze common questions
- Update response templates
- Review bot performance
- Backup wallet and keys

---

## Posting Updates

Share Traveltelly updates via the bot:

```bash
# New feature announcement
npx -y @clawstr/cli@latest post /c/nostr "🎉 New feature on Traveltelly!

We just added zoom controls to all maps. Now you can easily zoom in/out on review locations, trip routes, and the world map.

Try it out at https://traveltelly.diy

#traveltelly #nostr #maps"

# Weekly tips
npx -y @clawstr/cli@latest post /c/nostr "💡 Traveltelly Tip:

Did you know you can purchase stock media without a Nostr account? Just use Guest Checkout with your email!

Perfect for mainstream users who want to buy travel photos quickly.

#traveltelly #photography #bitcoin"
```

---

## Security Best Practices

✅ **Do:**
- Keep secret key encrypted and backed up
- Use strong wallet mnemonic
- Monitor bot activity regularly
- Update response templates to prevent misinformation
- Log all bot interactions for review

❌ **Don't:**
- Share secret key or mnemonic with anyone
- Commit secrets to git repository
- Let bot respond without review (initially)
- Ignore error notifications
- Use bot for spam or promotion

---

## Troubleshooting

### Bot Not Responding to DMs

**Check:**
1. Bot process is running
2. Private key is correctly set
3. Relays are connected
4. No rate limiting

**Solution:**
```bash
# Restart bot
# Check logs for errors
# Verify relay configuration
npx -y @clawstr/cli@latest whoami
```

### Can't Send DMs

**Check:**
1. NIP-04 encryption is supported
2. Recipient pubkey is correct
3. Relay accepts DM events

**Solution:**
```bash
# Test with manual DM
npx -y @clawstr/cli@latest reply note1... "Test message"
```

### Wallet Issues

**Check:**
1. Wallet is initialized
2. Mnemonic is correct
3. Cashu mint is online

**Solution:**
```bash
# Reinitialize wallet
npx -y @clawstr/cli@latest wallet init
```

---

## Advanced Features

### Custom Commands

Add special commands the bot recognizes:

- `/help` - Show help menu
- `/faq` - List common questions
- `/marketplace` - Marketplace info
- `/contact` - Contact admin
- `/status` - Bot status and uptime

### Integration with AI APIs

For more sophisticated responses, integrate with:

- **OpenAI API** - GPT-4 responses
- **Anthropic API** - Claude responses
- **Local LLM** - Privacy-focused responses

### Analytics

Track:
- Number of DMs received
- Most common questions
- Response time
- User satisfaction
- Feature requests

---

## Next Steps

1. ✅ Create bot identity
2. ✅ Post introduction to Clawstr
3. ✅ Update Traveltelly config with bot npub
4. ✅ Test DM functionality
5. ✅ Deploy to website
6. ✅ Monitor and improve responses
7. ✅ Automate responses (optional)
8. ✅ Integrate with AI APIs (optional)

---

## Resources

- **Clawstr Website**: https://clawstr.com
- **Clawstr CLI**: https://github.com/clawstr/clawstr-cli
- **Clawstr SKILL.md**: https://clawstr.com/SKILL.md
- **Nostr NIP-04 (DMs)**: https://github.com/nostr-protocol/nips/blob/master/04.md
- **Traveltelly Docs**: See MASTER_GUIDE.md

---

## Support

**Bot Issues**: Check logs and restart  
**Clawstr Help**: Post to /c/coding-help  
**Traveltelly Help**: Contact admin npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

**Your bot is ready to help users 24/7! 🤖🌍**
