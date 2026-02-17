# AI Chat Setup - Quick Start Guide

Get real Claude AI working in 15 minutes! This guide shows you how to replace the demo AI chat with real Claude Opus 4.6.

## Overview

Currently, the AI chat shows **mock responses** for demo purposes. Follow these 4 steps to enable **real AI**:

1. Get Anthropic API key (5 min)
2. Create backend function (3 min)
3. Update frontend code (2 min)
4. Configure & deploy (5 min)

**Total Time**: ~15 minutes  
**Cost**: Pay-as-you-go (starting at ~$0.02/message)

---

## Prerequisites

- Netlify deployment configured
- Basic command line knowledge
- Credit card for Anthropic API (required for API access)

---

## Step 1: Get Anthropic API Key (5 min)

### 1.1 Sign Up for Anthropic

1. Visit: https://console.anthropic.com/
2. Click "Sign Up" and create an account
3. Complete email verification

### 1.2 Add Credits

1. Go to **Settings** → **Billing**
2. Add a credit card
3. Add $10-20 to start (you can set spending limits)
4. **Set a budget limit** (recommended: $20/month to start)

### 1.3 Create API Key

1. Go to **Settings** → **API Keys**
2. Click **"Create Key"**
3. Name it `traveltelly-ai` (or any name you prefer)
4. Copy the key (starts with `sk-ant-api03-...`)
5. **Save it securely** - you won't see it again!

**Security Note**: Never commit API keys to git or share them publicly.

---

## Step 2: Create Backend Function (3 min)

Create a new file: `netlify/functions/ai-chat.mjs`

```javascript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async (req, context) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, model = 'claude-opus-4-20250514' } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Anthropic API
    const response = await anthropic.messages.create({
      model,
      max_tokens: 4096,
      messages: messages.map(msg => ({
        role: msg.role === 'system' ? 'assistant' : msg.role,
        content: msg.content,
      })),
      system: 'You are a helpful AI assistant for Traveltelly, a travel community platform. Help users with travel content, photography tips, destination recommendations, and Traveltelly features.',
    });

    // Return response
    return new Response(
      JSON.stringify({
        content: response.content[0].text,
        usage: response.usage,
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI Chat Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process AI request' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
```

**What this does**:
- Creates a serverless function that proxies requests to Anthropic
- Keeps your API key secure on the server
- Formats messages for Claude
- Returns AI responses to the frontend

---

## Step 3: Update Frontend (2 min)

Replace the `handleSendMessage` function in `src/components/ClawChat.tsx`:

### 3.1 Find this code (around line 132):

```typescript
const handleSendMessage = async () => {
  // ... existing mock implementation
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock AI response
  const aiResponse: Message = {
    role: 'assistant',
    content: getMockResponse(inputMessage),
    timestamp: Date.now(),
  };
  // ... rest of mock code
};
```

### 3.2 Replace with:

```typescript
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
  
  const currentMessages = [...messages, userMessage];
  setMessages(currentMessages);
  setInputMessage('');
  setIsLoading(true);

  try {
    // Call backend function
    const response = await fetch('/.netlify/functions/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: currentMessages
          .filter(m => m.role !== 'system')
          .map(m => ({ role: m.role, content: m.content })),
        model: mapModelToAnthropicId(selectedModel),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    
    // Add AI response
    const aiResponse: Message = {
      role: 'assistant',
      content: data.content,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, aiResponse]);
    setCredits(prev => prev - model.costPerMessage);
    
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

// Helper function to map UI model names to Anthropic model IDs
const mapModelToAnthropicId = (modelId: string): string => {
  const modelMap: Record<string, string> = {
    'claude-opus-4.6': 'claude-opus-4-20250514',
    'claude-sonnet-4.5': 'claude-sonnet-4-20250514',
    'claude-haiku-4': 'claude-4-haiku-20250107',
  };
  return modelMap[modelId] || 'claude-opus-4-20250514';
};
```

**What changed**:
- Replaced mock response with real API call
- Calls backend function at `/.netlify/functions/ai-chat`
- Sends conversation history for context
- Maps UI model names to Anthropic model IDs

---

## Step 4: Configure & Deploy (5 min)

### 4.1 Install Anthropic SDK

```bash
npm install @anthropic-ai/sdk
```

### 4.2 Set Environment Variable in Netlify

**Option A: Using Netlify CLI** (recommended)

```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set the API key
netlify env:set ANTHROPIC_API_KEY "sk-ant-api03-YOUR-KEY-HERE"
```

**Option B: Using Netlify Dashboard**

1. Go to your site in Netlify dashboard
2. Click **Site configuration** → **Environment variables**
3. Click **Add a variable**
4. Key: `ANTHROPIC_API_KEY`
5. Value: `sk-ant-api03-...` (your API key)
6. Click **Create variable**

### 4.3 Deploy

```bash
# Build and deploy
npm run build
netlify deploy --prod

# Or use git push if you have continuous deployment
git add .
git commit -m "Enable real AI chat with Claude"
git push
```

### 4.4 Test It!

1. Visit your deployed site
2. Go to `/admin/telly-bot`
3. Click the **AI Chat** tab
4. Send a message
5. You should get a real Claude response! 🎉

---

## Model Selection & Costs

### Available Models

| Model | Speed | Quality | Cost/1K tokens | Best For |
|-------|-------|---------|----------------|----------|
| **Claude Opus 4.6** | Slow | Best | $15 in / $75 out | Complex reasoning, long content |
| **Claude Sonnet 4.5** | Fast | Great | $3 in / $15 out | Most tasks, balanced |
| **Claude Haiku 4** | Fastest | Good | $0.25 in / $1.25 out | Simple queries, testing |

### Rough Cost Per Message

- **Haiku**: ~$0.02/message
- **Sonnet**: ~$0.10/message  
- **Opus**: ~$0.30/message

**💡 Tip**: Start with **Haiku** for testing, then upgrade to **Sonnet** or **Opus** when you need better quality.

---

## Troubleshooting

### Error: "Invalid API key"

- Double-check your API key is correct
- Make sure it starts with `sk-ant-api03-`
- Verify environment variable is set in Netlify

### Error: "Billing setup required"

- Add credits to your Anthropic account
- Verify your credit card is active
- Check spending limits aren't at $0

### Error: "Function not found"

- Make sure file is at `netlify/functions/ai-chat.mjs`
- File must use `.mjs` extension (ES modules)
- Redeploy after creating the function

### Error: "Module not found: @anthropic-ai/sdk"

- Run `npm install @anthropic-ai/sdk`
- Commit package.json and package-lock.json
- Redeploy

### Chat still shows mock responses

- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors
- Verify deployment succeeded

---

## Security Best Practices

### ✅ Do:

- Store API key in environment variables
- Set spending limits in Anthropic dashboard
- Use backend function to proxy requests
- Monitor usage regularly

### ❌ Don't:

- Commit API keys to git
- Share keys publicly
- Hardcode keys in frontend code
- Leave unlimited spending enabled

---

## Next Steps

### Add Credit System

Replace the mock credits with real credit tracking:

1. Create a Nostr event kind for credit balances (kind 30078)
2. Store credits per user (keyed by npub)
3. Deduct credits on each AI call
4. Allow purchasing more credits

### Add Rate Limiting

Prevent abuse:

```javascript
// In netlify/functions/ai-chat.mjs
const rateLimit = new Map();

export default async (req, context) => {
  const userIp = req.headers.get('x-forwarded-for');
  const lastCall = rateLimit.get(userIp);
  
  // Allow 10 requests per minute
  if (lastCall && Date.now() - lastCall < 6000) {
    return new Response('Rate limit exceeded', { status: 429 });
  }
  
  rateLimit.set(userIp, Date.now());
  // ... rest of function
};
```

### Add Conversation History

Store conversations in Nostr:

- Use addressable events (kind 30078)
- One event per conversation
- Tag with selected npub
- Load history on component mount

---

## Support

- **Issues**: https://github.com/bitpopart/traveltelly/issues
- **Anthropic Docs**: https://docs.anthropic.com/
- **Netlify Functions**: https://docs.netlify.com/functions/overview/

---

## Summary

You now have real Claude AI integrated! 🎉

- ✅ Real Claude Opus 4.6 responses
- ✅ Secure API key storage
- ✅ Multiple model support
- ✅ Pay-as-you-go pricing

**Total Setup Time**: ~15 minutes  
**Starting Cost**: ~$0.02-0.30 per message

Ready to enhance your AI chat even more? Check out:
- [START_HERE_AI_CHAT.md](./START_HERE_AI_CHAT.md) - Full feature overview
- [AI_CHAT_README.md](./AI_CHAT_README.md) - Technical documentation
