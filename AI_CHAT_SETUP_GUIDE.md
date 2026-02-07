# AI Chat Real Integration Setup Guide

**Complete instructions to connect real AI providers to Traveltelly AI Chat**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Choose Your AI Provider](#choose-your-ai-provider)
3. [Option 1: Anthropic (Claude) - Recommended](#option-1-anthropic-claude---recommended)
4. [Option 2: OpenAI (GPT-4)](#option-2-openai-gpt-4)
5. [Option 3: Clawstr AI](#option-3-clawstr-ai)
6. [Backend Setup](#backend-setup)
7. [Credit Purchase System](#credit-purchase-system)
8. [Environment Variables](#environment-variables)
9. [Deployment](#deployment)
10. [Testing](#testing)

---

## Overview

Currently, the AI Chat uses mock responses. This guide will help you integrate real AI providers.

### What You'll Need

- **AI Provider Account** (Anthropic/OpenAI/Clawstr)
- **API Keys** (keep these secret!)
- **Backend Server** (for API calls - security best practice)
- **Payment System** (for credit purchases - optional)

### Architecture

```
Frontend (React)
    ↓ HTTP Request
Backend API (Node.js/Cloudflare Worker/Netlify Function)
    ↓ API Call with Secret Key
AI Provider (Anthropic/OpenAI/Clawstr)
    ↓ Response
Backend API
    ↓ HTTP Response
Frontend (Display to user)
```

**Why Backend?** 
- ✅ Keep API keys secret (never expose to frontend)
- ✅ Rate limiting and usage tracking
- ✅ Credit system management
- ✅ Security and validation

---

## Choose Your AI Provider

### Comparison

| Provider | Best Model | Cost/1K tokens | Speed | Features |
|----------|-----------|----------------|-------|----------|
| **Anthropic** | Claude Opus 4.6 | ~$15/$75 | Fast | Best reasoning, latest |
| **OpenAI** | GPT-4 Turbo | ~$10/$30 | Fast | Vision, code |
| **Clawstr AI** | Various | Variable | Medium | Nostr-native, Bitcoin |

### Recommended: Anthropic Claude

**Why?**
- ✅ Latest Claude Opus 4.6 (best quality)
- ✅ Excellent for travel content
- ✅ Strong reasoning capabilities
- ✅ Better at creative writing
- ✅ Straightforward API

**When to Use Others:**
- **OpenAI**: Need vision/image analysis
- **Clawstr**: Want Nostr integration + Bitcoin payments

---

## Option 1: Anthropic (Claude) - Recommended

### Step 1: Get API Key

1. **Sign up**: https://console.anthropic.com/
2. **Add payment method**: Settings → Billing
3. **Create API key**: Settings → API Keys → Create Key
4. **Copy key**: Starts with `sk-ant-api03-...`
5. **⚠️ NEVER commit this to git!**

### Step 2: Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### Step 3: Create Backend API Endpoint

**For Cloudflare Workers** (`worker.ts`):

```typescript
import Anthropic from '@anthropic-ai/sdk';

interface Env {
  ANTHROPIC_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST to /api/ai/chat
    if (request.method !== 'POST' || !request.url.includes('/api/ai/chat')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const { messages, model, userId } = await request.json();

      // Validate request
      if (!messages || !model || !userId) {
        return new Response('Missing required fields', { status: 400 });
      }

      // Check user credits (implement your credit system here)
      // const credits = await getUserCredits(userId);
      // if (credits < getModelCost(model)) {
      //   return new Response('Insufficient credits', { status: 402 });
      // }

      // Initialize Anthropic client
      const anthropic = new Anthropic({
        apiKey: env.ANTHROPIC_API_KEY,
      });

      // Map model IDs to Anthropic model names
      const modelMap = {
        'claude-opus-4.6': 'claude-opus-4-20250514',
        'claude-sonnet-4.5': 'claude-sonnet-4-20250514',
        'claude-haiku-4': 'claude-4-haiku-20250514',
      };

      const anthropicModel = modelMap[model as keyof typeof modelMap] || modelMap['claude-opus-4.6'];

      // Convert messages to Anthropic format
      const anthropicMessages = messages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        }));

      // Add system message if any
      const systemMessage = messages.find((m: any) => m.role === 'system')?.content;

      // Call Anthropic API
      const response = await anthropic.messages.create({
        model: anthropicModel,
        max_tokens: 1024,
        system: systemMessage || 'You are a helpful AI assistant for Traveltelly, a travel platform. Help users with travel content, photography tips, destination recommendations, and platform features.',
        messages: anthropicMessages,
      });

      // Extract response text
      const aiMessage = response.content[0].type === 'text' 
        ? response.content[0].text 
        : 'Sorry, I could not generate a response.';

      // Deduct credits (implement your credit system here)
      // await deductCredits(userId, getModelCost(model));

      // Return response
      return new Response(JSON.stringify({
        message: aiMessage,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens,
        },
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('AI Chat Error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

**For Netlify Functions** (`netlify/functions/ai-chat.mjs`):

```javascript
import Anthropic from '@anthropic-ai/sdk';

export default async (req, context) => {
  // Only accept POST
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, model, userId } = await req.json();

    // Validate
    if (!messages || !model || !userId) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Model mapping
    const modelMap = {
      'claude-opus-4.6': 'claude-opus-4-20250514',
      'claude-sonnet-4.5': 'claude-sonnet-4-20250514',
      'claude-haiku-4': 'claude-4-haiku-20250514',
    };

    const anthropicModel = modelMap[model] || modelMap['claude-opus-4.6'];

    // Convert messages
    const anthropicMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

    const systemMessage = messages.find(m => m.role === 'system')?.content;

    // Call API
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: 1024,
      system: systemMessage || 'You are a helpful AI assistant for Traveltelly.',
      messages: anthropicMessages,
    });

    const aiMessage = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({
      message: aiMessage,
      usage: response.usage,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Step 4: Update Frontend to Call API

Edit `src/components/ClawChat.tsx`:

```typescript
// Replace the mock handleSendMessage function with:

const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;
  
  // Check credits
  if (credits < model.costPerMessage) {
    toast({
      title: 'Insufficient Credits',
      description: `You need ${model.costPerMessage} credits to use ${model.name}. Please purchase more credits.`,
      variant: 'destructive',
    });
    return;
  }

  // Add user message
  const userMessage: Message = {
    role: 'user',
    content: inputMessage,
    timestamp: Date.now(),
  };
  
  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    // Call your backend API
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        model: selectedModel,
        userId: user.pubkey, // Nostr public key for user identification
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get AI response');
    }

    const data = await response.json();
    
    // Add AI response
    const aiResponse: Message = {
      role: 'assistant',
      content: data.message,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, aiResponse]);
    
    // Deduct credits
    setCredits(prev => prev - model.costPerMessage);
    
    // Save to localStorage (or your database)
    localStorage.setItem(`credits_${user.pubkey}`, String(credits - model.costPerMessage));
    
    toast({
      title: 'Message Sent',
      description: `Used ${model.costPerMessage} credits`,
    });
    
  } catch (error) {
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to send message',
      variant: 'destructive',
    });
  } finally {
    setIsLoading(false);
  }
};
```

### Step 5: Configure Environment Variables

**Cloudflare Workers** (via dashboard):
1. Go to Workers & Pages → Your Worker
2. Settings → Variables
3. Add: `ANTHROPIC_API_KEY` = `sk-ant-api03-...`
4. Encrypt as secret

**Netlify** (via dashboard or CLI):
```bash
# Via Netlify CLI
netlify env:set ANTHROPIC_API_KEY "sk-ant-api03-..."

# Or via Netlify Dashboard:
# Site Settings → Environment Variables → Add Variable
```

### Step 6: Deploy and Test

```bash
# Build frontend
npm run build

# Deploy (method depends on your hosting)
# Cloudflare: wrangler deploy
# Netlify: netlify deploy --prod
```

---

## Option 2: OpenAI (GPT-4)

### Step 1: Get API Key

1. **Sign up**: https://platform.openai.com/
2. **Add payment**: Settings → Billing
3. **Create key**: API Keys → Create new secret key
4. **Copy key**: Starts with `sk-proj-...`

### Step 2: Install OpenAI SDK

```bash
npm install openai
```

### Step 3: Backend API (Cloudflare Worker)

```typescript
import OpenAI from 'openai';

interface Env {
  OPENAI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST' || !request.url.includes('/api/ai/chat')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const { messages, model, userId } = await request.json();

      if (!messages || !model || !userId) {
        return new Response('Missing required fields', { status: 400 });
      }

      const openai = new OpenAI({
        apiKey: env.OPENAI_API_KEY,
      });

      // Map to OpenAI models
      const modelMap = {
        'gpt-4-turbo': 'gpt-4-turbo-preview',
        'gpt-4': 'gpt-4',
        'gpt-3.5-turbo': 'gpt-3.5-turbo',
      };

      const openaiModel = modelMap[model as keyof typeof modelMap] || 'gpt-4-turbo-preview';

      // Call OpenAI
      const completion = await openai.chat.completions.create({
        model: openaiModel,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 1024,
        temperature: 0.7,
      });

      const aiMessage = completion.choices[0]?.message?.content || 'No response';

      return new Response(JSON.stringify({
        message: aiMessage,
        usage: completion.usage,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('OpenAI Error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal error' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

### Step 4: Frontend Update

Same as Anthropic - update the `handleSendMessage` function to call `/api/ai/chat`.

### Step 5: Environment Variable

Set `OPENAI_API_KEY` in your deployment platform.

---

## Option 3: Clawstr AI

### Step 1: Install Clawstr CLI

```bash
npm install -g @clawstr/cli
```

### Step 2: Initialize Clawstr Identity

```bash
# Initialize with your bot identity
npx @clawstr/cli init --name "Traveltelly AI Assistant"

# This creates a Nostr identity and saves the private key
# Output: npub1... (save this!)
```

### Step 3: Backend with Clawstr SDK

```bash
npm install @clawstr/sdk
```

```typescript
import { Clawstr } from '@clawstr/sdk';

interface Env {
  CLAWSTR_PRIVATE_KEY: string; // nsec... from init step
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST' || !request.url.includes('/api/ai/chat')) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const { messages, model, userId } = await request.json();

      // Initialize Clawstr client
      const clawstr = new Clawstr({
        privateKey: env.CLAWSTR_PRIVATE_KEY,
      });

      // Build prompt from messages
      const prompt = messages
        .map((m: any) => `${m.role}: ${m.content}`)
        .join('\n\n');

      // Send to Clawstr AI
      const response = await clawstr.ai.complete({
        prompt,
        model: model || 'claude-opus-4.6',
        maxTokens: 1024,
      });

      return new Response(JSON.stringify({
        message: response.content,
        usage: response.usage,
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (error) {
      console.error('Clawstr Error:', error);
      return new Response(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal error' 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  },
};
```

### Step 4: Purchase Clawstr Credits

```bash
# Get wallet address
npx @clawstr/cli wallet init

# Get Lightning address for purchasing credits
npx @clawstr/cli wallet address

# Purchase credits via Lightning (follow prompts)
```

---

## Backend Setup

### Choose Your Backend Platform

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Cloudflare Workers** | Fast, cheap, global | Learning curve | High traffic |
| **Netlify Functions** | Easy, generous free tier | Cold starts | Quick setup |
| **Vercel Functions** | Simple, Node.js native | Usage limits | Next.js sites |
| **Railway** | Full control, any runtime | More expensive | Complex apps |

### Cloudflare Workers Setup

1. **Install Wrangler**:
```bash
npm install -g wrangler
```

2. **Login**:
```bash
wrangler login
```

3. **Create Worker**:
```bash
# Create wrangler.toml in project root
```

```toml
name = "traveltelly-ai"
main = "worker.ts"
compatibility_date = "2024-01-01"

[vars]
# Non-secret variables

# Secret variables (set via dashboard or wrangler secret put)
# ANTHROPIC_API_KEY
# OPENAI_API_KEY
```

4. **Add Secrets**:
```bash
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted
```

5. **Deploy**:
```bash
wrangler deploy
```

### Netlify Functions Setup

1. **Create Function Directory**:
```bash
mkdir -p netlify/functions
```

2. **Create Function File**:
```bash
touch netlify/functions/ai-chat.mjs
```

3. **Add Environment Variable**:
```bash
netlify env:set ANTHROPIC_API_KEY "sk-ant-..."
```

4. **Update `netlify.toml`**:
```toml
[build]
  functions = "netlify/functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

5. **Deploy**:
```bash
netlify deploy --prod
```

---

## Credit Purchase System

### Option 1: Lightning Payment (Recommended for Nostr)

**Using BTCPay Server**:

1. **Install BTCPay SDK**:
```bash
npm install btcpay
```

2. **Create Credit Purchase Endpoint**:
```typescript
// netlify/functions/purchase-credits.mjs
import { BTCPayClient } from 'btcpay';

export default async (req) => {
  const { userId, creditPackage } = await req.json();

  // Credit packages
  const packages = {
    '100': { credits: 100, price: 10 },
    '500': { credits: 500, price: 40 },
    '1000': { credits: 1000, price: 70 },
  };

  const selected = packages[creditPackage];

  // Create BTCPay invoice
  const client = new BTCPayClient({
    host: process.env.BTCPAY_HOST,
    apiKey: process.env.BTCPAY_API_KEY,
  });

  const invoice = await client.createInvoice({
    amount: selected.price,
    currency: 'USD',
    metadata: {
      userId,
      credits: selected.credits,
      type: 'credit_purchase',
    },
  });

  return new Response(JSON.stringify({
    invoiceId: invoice.id,
    paymentUrl: invoice.checkoutLink,
    lightningInvoice: invoice.lightningInvoice,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

3. **Handle Webhook** (BTCPay sends when paid):
```typescript
// netlify/functions/btcpay-webhook.mjs
export default async (req) => {
  const event = await req.json();

  if (event.type === 'InvoiceSettled') {
    const { userId, credits } = event.metadata;

    // Add credits to user (implement your database)
    await addCredits(userId, credits);

    // Publish to Nostr (optional)
    // await publishCreditPurchase(userId, credits);
  }

  return new Response('OK');
};
```

### Option 2: Stripe (For Fiat Payments)

1. **Install Stripe**:
```bash
npm install stripe
```

2. **Create Checkout Session**:
```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async (req) => {
  const { userId, creditPackage } = await req.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${creditPackage} AI Credits`,
        },
        unit_amount: getPriceForPackage(creditPackage) * 100, // cents
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.SITE_URL}/credits/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.SITE_URL}/credits/cancel`,
    metadata: {
      userId,
      credits: creditPackage,
    },
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### Option 3: Nostr Wallet Connect (NWC)

Use NIP-47 for Lightning payments via Nostr:

```typescript
import { nip47 } from 'nostr-tools';

// User connects their wallet via NWC string
const walletConnectString = 'nostr+walletconnect://...';

// Create payment request
const invoice = await createLightningInvoice(amount);

// Send via NWC
await nip47.payInvoice(walletConnectString, invoice);
```

---

## Environment Variables

### Complete List

Create `.env.local` (add to `.gitignore`):

```bash
# AI Providers (choose one or more)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
CLAWSTR_PRIVATE_KEY=nsec1...

# Payment Systems
BTCPAY_HOST=https://your-btcpay.com
BTCPAY_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Database (for credit storage)
DATABASE_URL=postgresql://...

# Site Config
SITE_URL=https://traveltelly.diy
CORS_ORIGIN=https://traveltelly.diy

# Admin
ADMIN_PUBKEY=7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35
```

### Security Best Practices

✅ **Never commit `.env` files to git**
✅ **Use different keys for dev/prod**
✅ **Rotate keys regularly**
✅ **Monitor API usage**
✅ **Set up billing alerts**

---

## Deployment

### Cloudflare Workers

```bash
# Deploy worker
wrangler deploy

# Set secrets
wrangler secret put ANTHROPIC_API_KEY
wrangler secret put OPENAI_API_KEY

# View logs
wrangler tail
```

### Netlify

```bash
# Set environment variables
netlify env:set ANTHROPIC_API_KEY "sk-ant-..."

# Deploy
netlify deploy --prod

# View logs
netlify functions:log ai-chat
```

### Update Frontend API Endpoint

Edit `src/components/ClawChat.tsx`:

```typescript
// Development
const API_ENDPOINT = 'http://localhost:8788/api/ai/chat';

// Production (auto-detect)
const API_ENDPOINT = import.meta.env.PROD 
  ? '/api/ai/chat' // Uses your deployed backend
  : 'http://localhost:8788/api/ai/chat';

// Use in fetch:
const response = await fetch(API_ENDPOINT, {
  method: 'POST',
  // ...
});
```

---

## Testing

### Local Testing

1. **Start Backend Locally**:

**Cloudflare Workers**:
```bash
wrangler dev
# Runs on http://localhost:8787
```

**Netlify Functions**:
```bash
netlify dev
# Runs on http://localhost:8888
```

2. **Start Frontend**:
```bash
npm run dev
# Runs on http://localhost:5173
```

3. **Test Chat**:
- Navigate to `/admin/telly-bot`
- Click "AI Chat" tab
- Send a message
- Check browser console for API calls
- Check backend logs for errors

### Production Testing

1. **Deploy both frontend and backend**
2. **Test with small credit amount first**
3. **Monitor API usage dashboard**
4. **Check error logs**
5. **Verify credit deduction**

### Test Checklist

- [ ] AI response received
- [ ] Credits deducted correctly
- [ ] Error handling works
- [ ] Rate limiting active
- [ ] Messages persist
- [ ] Mobile responsive
- [ ] API keys secure (not in frontend)
- [ ] CORS configured correctly

---

## Cost Estimates

### Anthropic Claude Pricing

| Model | Input | Output | Est. Cost/Message |
|-------|-------|--------|-------------------|
| Opus 4.6 | $15/1M | $75/1M | $0.20 - $0.50 |
| Sonnet 4.5 | $3/1M | $15/1M | $0.05 - $0.15 |
| Haiku 4 | $0.25/1M | $1.25/1M | $0.01 - $0.03 |

### OpenAI GPT Pricing

| Model | Input | Output | Est. Cost/Message |
|-------|-------|--------|-------------------|
| GPT-4 Turbo | $10/1M | $30/1M | $0.10 - $0.30 |
| GPT-3.5 Turbo | $0.50/1M | $1.50/1M | $0.01 - $0.03 |

### Credit Pricing Strategy

**Example**:
- 1 credit = $0.10
- Claude Opus (5 credits) = $0.50/message
- Your cost: ~$0.30
- **Profit margin**: 40%

---

## Troubleshooting

### "API Key Invalid"

**Check**:
- Key is correct format
- Key has billing enabled
- Environment variable name matches
- No extra spaces in key

### "CORS Error"

**Fix**: Add CORS headers to backend response:
```typescript
headers: {
  'Access-Control-Allow-Origin': '*', // Or specific domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}
```

### "Rate Limited"

**Solutions**:
- Implement exponential backoff
- Add rate limiting per user
- Upgrade API plan
- Cache responses

### "Credit Not Deducted"

**Check**:
- Database connection
- Transaction completion
- Error in credit logic
- Browser localStorage sync

---

## Next Steps

1. ✅ Choose AI provider (Anthropic recommended)
2. ✅ Set up backend API endpoint
3. ✅ Configure environment variables
4. ✅ Update frontend to call real API
5. ✅ Deploy and test
6. ✅ Implement credit purchase system
7. ✅ Monitor usage and costs
8. ✅ Optimize prompts for better responses

---

## Support

**Issues**:
- Anthropic: https://docs.anthropic.com/
- OpenAI: https://platform.openai.com/docs
- Clawstr: https://clawstr.com/docs

**Community**:
- GitHub Issues
- Nostr #traveltelly
- Admin: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

**Ready to integrate real AI! 🚀 Choose your provider and follow the steps above.**
