# AI Chat Assistant - Start Here

**NowClaw-style AI chat interface for Traveltelly admins**

## What is This?

The AI Chat Assistant is a NowClaw-inspired chat interface built into Traveltelly's admin panel. It provides:

- 🤖 **Claude AI Integration** - Real Claude Opus 4.6 (or other models)
- 👥 **Multi-Account Support** - Switch between different Nostr npubs
- 💬 **Conversation History** - Keep track of your AI conversations
- ⚙️ **Model Selection** - Choose between Claude, GPT-4, and more
- 💰 **Credit System** - Track AI usage costs

## Where to Find It

**URL**: `https://traveltelly.com/admin/telly-bot`

Click the **"AI Chat"** tab (4th tab, with the sparkle icon ✨)

---

## Current Status: Demo Mode

Right now, the AI chat shows **mock responses** to demonstrate the UI. To enable real AI:

👉 **Follow**: [AI_SETUP_QUICKSTART.md](./AI_SETUP_QUICKSTART.md) (15 minutes)

---

## Features

### 1. Multi-Account Management 👥

Switch between different Nostr accounts to chat with AI:

- **Active Account Display** - See which npub you're using
- **Account Switcher** - Click your avatar to switch accounts
- **Add More Accounts** - Login with different Nostr extensions
- **Per-Account History** - Each account has its own chat history (when implemented)

**How to use**:
1. Click your avatar/name in the top-right of the AI Chat card
2. See all your logged-in Nostr accounts
3. Click "Switch" on any account to make it active
4. The AI will now respond in the context of that account

### 2. AI Model Selection 🧠

Choose the right AI model for your needs:

| Model | Quality | Speed | Cost | Best For |
|-------|---------|-------|------|----------|
| **Claude Opus 4.6** | ⭐⭐⭐⭐⭐ | 🐢 Slow | 💰💰💰 | Complex analysis, creative writing |
| **Claude Sonnet 4.5** | ⭐⭐⭐⭐ | 🏃 Fast | 💰💰 | Most tasks, balanced |
| **Claude Haiku 4** | ⭐⭐⭐ | ⚡ Fastest | 💰 | Quick questions, simple tasks |
| **GPT-4 Turbo** | ⭐⭐⭐⭐ | 🏃 Fast | 💰💰💰 | Vision tasks, images |

**How to change models**:
1. Click the ⚙️ Settings icon
2. Select a different model from the dropdown
3. Click "Done"
4. Your next message uses the new model

### 3. Credit System 💰

Track and manage AI usage:

- **Credit Display** - See remaining credits in real-time
- **Per-Message Cost** - Different models cost different amounts
- **Usage Tracking** - Know how many credits each message uses
- **Low Balance Warning** - Get notified when credits are low

**Demo Credits**: 100 free credits to try the interface

### 4. Smart Conversation 💬

The AI assistant knows about Traveltelly:

- **Travel Reviews** - Help writing reviews for cafes, hotels, attractions
- **Story Creation** - Assistance with long-form travel content
- **Trip Reports** - Guidance on documenting journeys with GPS routes
- **Photography Tips** - Advice on travel photography and composition
- **Stock Media** - Help with marketplace listings and licensing
- **Traveltelly Features** - Explain how to use GPS extraction, maps, etc.

**Sample Prompts**:
- "Help me write a travel review for a cafe I visited"
- "Suggest destinations for photography enthusiasts"
- "How do I create an engaging trip report?"
- "Best practices for travel blogging"
- "Ideas for travel-themed social media posts"

### 5. Conversation Management 🗂️

Keep your chats organized:

- **Chat History** - Scroll through past messages
- **Timestamps** - See when each message was sent
- **Clear Chat** - Start fresh anytime (Settings → Clear Chat)
- **Auto-scroll** - Automatically scrolls to latest message

---

## Quick Setup Guide

### Step 1: Access the Chat

1. Login as admin (npub: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`)
2. Go to `/admin/telly-bot`
3. Click **"AI Chat"** tab

### Step 2: Try It Out (Demo Mode)

The interface currently shows **mock responses**:

1. Type a message in the input box
2. Press Enter or click "Send"
3. Get a demo response (not real AI)
4. Credits are deducted (but this is fake demo credits)

### Step 3: Enable Real AI (Optional)

Follow the [AI_SETUP_QUICKSTART.md](./AI_SETUP_QUICKSTART.md) guide to connect real Claude AI.

**You'll need**:
- Anthropic API key (~5 min to get)
- Netlify deployment
- ~15 minutes total setup time

---

## Architecture

### How It Works

```
┌─────────────┐
│   Browser   │
│  (React UI) │
└──────┬──────┘
       │ 1. User sends message
       ▼
┌─────────────────────────────┐
│  ClawChat Component         │
│  - Manages UI state         │
│  - Handles account switching│
│  - Tracks credits           │
└──────┬──────────────────────┘
       │ 2. POST to backend function
       ▼
┌─────────────────────────────┐
│  Netlify Function           │
│  /ai-chat.mjs               │
│  - Validates request        │
│  - Calls Anthropic API      │
│  - Returns AI response      │
└──────┬──────────────────────┘
       │ 3. Call Anthropic API
       ▼
┌─────────────────────────────┐
│  Anthropic API              │
│  - Claude Opus/Sonnet/Haiku │
│  - Processes request        │
│  - Returns completion       │
└─────────────────────────────┘
```

### Components

**Frontend** (`src/components/ClawChat.tsx`):
- React component with chat UI
- Manages conversation state
- Handles account switching
- Credit tracking (demo)
- Model selection

**Backend** (`netlify/functions/ai-chat.mjs`):
- Serverless function
- Proxies requests to Anthropic
- Keeps API key secure
- Formats messages for Claude

**State Management**:
- `useState` for messages, inputs, settings
- `useLoggedInAccounts` for Nostr accounts
- Local storage for preferences (future)

---

## NowClaw Comparison

This implementation is inspired by [NowClaw](https://nowclaw.com/) but tailored for Traveltelly:

### Similarities ✅

- **Clean chat interface** - Similar minimal design
- **Model selection** - Choose between AI models
- **Credit system** - Track usage costs
- **Real-time chat** - Instant responses
- **Settings panel** - Configure preferences

### Differences 🔄

- **Multi-npub support** - Switch between Nostr accounts
- **Travel-focused** - Pre-configured for travel content
- **Admin-only** - Restricted to Traveltelly admin
- **Custom branding** - Purple/pink gradient theme
- **Sample prompts** - Travel-specific suggestions

### Enhancements 🚀

- **Account manager** - Visual account switching UI
- **Setup guide** - In-app instructions for enabling AI
- **Cost transparency** - Show costs upfront
- **Nostr integration** - Uses Nostr accounts for identity

---

## Customization

### Change Theme Colors

Edit `src/components/ClawChat.tsx`:

```tsx
// Purple/pink gradient (current)
className="bg-gradient-to-r from-purple-600 to-pink-600"

// Blue gradient
className="bg-gradient-to-r from-blue-600 to-indigo-600"

// Green gradient
className="bg-gradient-to-r from-emerald-600 to-teal-600"
```

### Add New AI Models

Edit the `AI_MODELS` array:

```typescript
const AI_MODELS: AIModel[] = [
  // ... existing models
  {
    id: 'custom-model',
    name: 'Custom Model',
    provider: 'Provider Name',
    description: 'Model description',
    costPerMessage: 2,
    featured: false,
  },
];
```

Then update the backend function to handle the new model.

### Change Sample Prompts

Edit the `SAMPLE_PROMPTS` array:

```typescript
const SAMPLE_PROMPTS = [
  "Your custom prompt here",
  "Another custom prompt",
  // ...
];
```

### Customize System Prompt

Edit the backend function (`netlify/functions/ai-chat.mjs`):

```javascript
system: 'Your custom system prompt here...'
```

---

## Roadmap

### Planned Features

- [ ] **Real Credit System** - Store credits in Nostr events (kind 30078)
- [ ] **Conversation History** - Save chats to Nostr (addressable events)
- [ ] **Credit Purchase** - Buy credits with Lightning/Bitcoin
- [ ] **Rate Limiting** - Prevent abuse
- [ ] **Usage Analytics** - Track AI usage per user
- [ ] **Share Conversations** - Export chats as Nostr events
- [ ] **Voice Input** - Speak instead of type
- [ ] **Image Analysis** - Upload photos for AI to analyze
- [ ] **Markdown Support** - Render formatted responses
- [ ] **Code Highlighting** - Syntax highlighting for code blocks

### Future Enhancements

- [ ] **Public Access** - Allow non-admins to use (with credit limits)
- [ ] **Team Collaboration** - Share conversations with team
- [ ] **Custom Instructions** - Per-user system prompts
- [ ] **Conversation Templates** - Pre-made prompt templates
- [ ] **API Webhooks** - Trigger actions from AI responses
- [ ] **Multi-modal** - Support images, voice, video
- [ ] **Plugin System** - Extend AI capabilities

---

## FAQ

### Q: Is this live/production-ready?

**A**: The UI is ready, but currently shows demo responses. Follow the [setup guide](./AI_SETUP_QUICKSTART.md) to enable real AI.

### Q: How much does it cost?

**A**: Depends on model choice:
- Claude Haiku: ~$0.02/message (cheapest)
- Claude Sonnet: ~$0.10/message (balanced)
- Claude Opus: ~$0.30/message (best quality)

You pay Anthropic directly (no markup).

### Q: Can I use my own AI provider?

**A**: Yes! You can modify the backend function to call any AI API (OpenAI, Cohere, Replicate, etc.)

### Q: Is it secure?

**A**: Yes, if properly configured:
- API keys stored in environment variables (not in code)
- Backend function proxies requests (keys never exposed to browser)
- HTTPS for all traffic
- Nostr accounts for authentication

### Q: Can non-admins use it?

**A**: Currently admin-only. You could remove the admin check to allow all users, but add:
- Rate limiting
- Credit system
- Abuse prevention

### Q: Does it work offline?

**A**: No, requires internet to call Anthropic API.

### Q: Can I customize the AI's personality?

**A**: Yes! Edit the system prompt in the backend function.

### Q: Does conversation history persist?

**A**: Not yet. Planned feature - will store in Nostr events.

### Q: Can I export conversations?

**A**: Not yet. Planned feature - export as Nostr events or JSON.

---

## Support

- **Setup Issues**: See [AI_SETUP_QUICKSTART.md](./AI_SETUP_QUICKSTART.md)
- **Technical Docs**: See [AI_CHAT_README.md](./AI_CHAT_README.md)
- **Bug Reports**: https://github.com/bitpopart/traveltelly/issues
- **Anthropic Help**: https://docs.anthropic.com/

---

## Credits

Inspired by [NowClaw](https://nowclaw.com/) - a beautiful AI chat interface.

Built with:
- React 18
- TailwindCSS
- shadcn/ui
- Anthropic Claude
- Nostr protocol
- Netlify Functions

---

**Ready to get started?**

1. 👉 Try the demo: `/admin/telly-bot` → "AI Chat" tab
2. 👉 Enable real AI: [AI_SETUP_QUICKSTART.md](./AI_SETUP_QUICKSTART.md)
3. 👉 Learn more: [AI_CHAT_README.md](./AI_CHAT_README.md)
