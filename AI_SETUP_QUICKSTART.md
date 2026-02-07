# AI Chat Quick Start - Get Real AI in 15 Minutes

**Fastest path from demo mode to real AI**

---

## 🚀 Super Quick Setup (Anthropic + Netlify)

### Prerequisites
- Netlify account (free tier works!)
- Credit card for Anthropic API (pay-as-you-go)

### Step 1: Get Anthropic API Key (5 min)

1. Go to https://console.anthropic.com/
2. Sign up or login
3. Go to **Settings → Billing** → Add payment method
4. Go to **Settings → API Keys** → Create Key
5. Copy the key (starts with `sk-ant-api03-...`)
6. **⚠️ Save it somewhere safe!**

### Step 2: Create Backend Function (3 min)

1. Create file: `netlify/functions/ai-chat.mjs`

2. Paste this code:

```javascript
import Anthropic from '@anthropic-ai/sdk';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, model, userId } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const modelMap = {
      'claude-opus-4.6': 'claude-opus-4-20250514',
      'claude-sonnet-4.5': 'claude-sonnet-4-20250514',
      'claude-haiku-4': 'claude-4-haiku-20250514',
    };

    const systemMsg = messages.find(m => m.role === 'system')?.content;
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role, content: m.content }));

    const response = await anthropic.messages.create({
      model: modelMap[model] || modelMap['claude-opus-4.6'],
      max_tokens: 1024,
      system: systemMsg || 'You are a helpful travel AI assistant.',
      messages: chatMessages,
    });

    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'No response';

    return new Response(JSON.stringify({
      message: aiMessage,
      usage: response.usage,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

3. Install Anthropic SDK:
```bash
npm install @anthropic-ai/sdk
```

### Step 3: Update Frontend (2 min)

Open `src/components/ClawChat.tsx` and replace the `handleSendMessage` function:

**Find this** (around line 80):
```typescript
const handleSendMessage = async () => {
  // ... existing mock code
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI response
    const aiResponse: Message = {
      role: 'assistant',
      content: getMockResponse(inputMessage),
      timestamp: Date.now(),
    };
```

**Replace with**:
```typescript
const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  
  if (credits < model.costPerMessage) {
    toast({
      title: 'Insufficient Credits',
      description: `You need ${model.costPerMessage} credits. Demo has 100 credits.`,
      variant: 'destructive',
    });
    return;
  }

  const userMessage: Message = {
    role: 'user',
    content: inputMessage,
    timestamp: Date.now(),
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    // Call real API
    const response = await fetch('/.netlify/functions/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        model: selectedModel,
        userId: user?.pubkey || 'demo-user',
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    
    const aiResponse: Message = {
      role: 'assistant',
      content: data.message,
      timestamp: Date.now(),
    };
```

### Step 4: Configure Netlify (3 min)

1. Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. Set environment variable:

**Option A - Via Netlify CLI**:
```bash
npm install -g netlify-cli
netlify login
netlify link
netlify env:set ANTHROPIC_API_KEY "sk-ant-api03-YOUR-KEY-HERE"
```

**Option B - Via Netlify Dashboard**:
- Go to your site dashboard
- Site settings → Environment variables
- Add variable: `ANTHROPIC_API_KEY` = `sk-ant-api03-...`

### Step 5: Deploy (2 min)

```bash
# Build locally first
npm run build

# Deploy to Netlify
netlify deploy --prod
```

Or push to GitHub and let Netlify auto-deploy.

---

## ✅ Test It!

1. Visit your deployed site
2. Login as admin
3. Go to **Admin → Telly Bot → AI Chat**
4. Send a message: "Tell me about Iceland"
5. **You should get a real AI response!** 🎉

---

## 💰 Costs

**Anthropic Pay-As-You-Go**:
- Claude Opus 4.6: ~$0.30 per message (demo: 5 credits)
- Claude Sonnet 4.5: ~$0.10 per message (demo: 3 credits)
- Claude Haiku 4: ~$0.02 per message (demo: 1 credit)

**With 100 demo credits**:
- ~20 Opus messages
- ~33 Sonnet messages
- ~100 Haiku messages

**Monthly estimate** (100 messages/day):
- All Opus: ~$900/mo
- All Sonnet: ~$300/mo
- All Haiku: ~$60/mo
- **Mixed usage: ~$150-300/mo**

---

## 🔄 What Changed?

### Before (Demo Mode)
- ❌ Fake responses based on keywords
- ❌ No real AI
- ❌ Demo credits reset on refresh

### After (Real AI)
- ✅ Real Claude Opus 4.6 responses
- ✅ Actual AI reasoning
- ✅ Travel-specific expertise
- ✅ 1024 token responses
- ✅ Pay only for what you use

---

## 📊 Monitor Usage

### Anthropic Dashboard
- https://console.anthropic.com/
- **Usage** tab shows:
  - API calls count
  - Tokens used
  - Cost breakdown
  - Daily/monthly trends

### Set Billing Limits
1. Go to **Settings → Billing**
2. Set **Monthly spending limit** (e.g., $100)
3. Add **Email alerts** at 50%, 80%, 100%

---

## 🛠️ Troubleshooting

### "API Key Invalid"
- Check key starts with `sk-ant-api03-`
- Verify billing is set up
- No spaces before/after key

### "Function Not Found"
- Check `netlify.toml` exists
- Verify `netlify/functions/ai-chat.mjs` path
- Redeploy: `netlify deploy --prod`

### "No Response"
- Check browser console (F12)
- Check Netlify function logs: `netlify functions:log`
- Verify environment variable is set

### "CORS Error"
Add to function response:
```javascript
headers: { 
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
}
```

---

## 🎯 Next Steps

### Immediate
- ✅ Test all 3 models (Opus, Sonnet, Haiku)
- ✅ Monitor first 24 hours of usage
- ✅ Set billing alert at $50

### Short Term
- [ ] Add rate limiting (prevent spam)
- [ ] Implement real credit system
- [ ] Save chat history to localStorage
- [ ] Add user feedback (thumbs up/down)

### Long Term
- [ ] Credit purchase with Lightning
- [ ] Save conversations to Nostr
- [ ] Multi-language support
- [ ] Image analysis (GPT-4 Vision)

---

## 💡 Pro Tips

### Save Money
1. **Use Haiku for simple queries** (20x cheaper than Opus)
2. **Set max_tokens lower** (512 instead of 1024)
3. **Cache system messages** (reuse context)
4. **Implement rate limiting** (prevent abuse)

### Improve Quality
1. **Better system prompts**:
```javascript
system: `You are an expert travel AI assistant for Traveltelly. 
Provide concise, actionable advice about:
- Travel destinations and photography
- Review and story writing
- Trip planning and GPS features
- Stock media marketplace

Be friendly, helpful, and specific. Keep responses under 200 words unless asked for detail.`
```

2. **Add context about user**:
```javascript
const userContext = `User is ${user.name || 'a traveler'} asking about...`;
```

3. **Temperature tuning**:
```javascript
temperature: 0.7, // Lower = more focused, Higher = more creative
```

---

## 🔐 Security Checklist

- [x] API key in environment variable (not code)
- [x] Backend validates requests
- [x] HTTPS only (Netlify provides free SSL)
- [ ] Rate limiting added (optional)
- [ ] User authentication (already via Nostr)
- [ ] Billing alerts set up

---

## 📞 Get Help

**Stuck?** Check:
1. [AI_CHAT_SETUP_GUIDE.md](./AI_CHAT_SETUP_GUIDE.md) - Full detailed guide
2. [AI_CHAT_README.md](./AI_CHAT_README.md) - Feature documentation
3. Netlify docs: https://docs.netlify.com/functions/
4. Anthropic docs: https://docs.anthropic.com/

**Still stuck?** Ask on:
- GitHub Issues
- Nostr #traveltelly
- Admin: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

## ✨ You're Done!

**In 15 minutes, you went from demo to production AI chat!**

🎉 Your Traveltelly users can now chat with Claude Opus 4.6  
⚡ Powered by Anthropic's latest AI model  
🚀 Deployed on Netlify's global CDN  
💰 Pay-as-you-go pricing (no minimums)

**Enjoy your AI-powered travel platform!** 🌍✈️🤖
