# Telly Bot - Visual Guide

**A walkthrough of the Telly Bot interface**

---

## 🎯 Accessing Telly Bot

### Method 1: Via Admin Panel (Recommended)

1. **Navigate to Admin Panel**
   ```
   https://traveltelly.com/admin
   ```

2. **Look for Quick Actions section**
   - You'll see a card titled "Quick Actions"
   - First button is **Telly Bot** with a sparkle icon ✨
   - Purple-to-pink gradient button
   - Click it!

3. **You're now in Telly Bot!**

### Method 2: Direct URL

```
https://traveltelly.com/admin/telly-bot
```

---

## 🖼️ What You'll See

### Page Header

```
┌─────────────────────────────────────────┐
│  [✨]  Telly Bot                        │
│        AI Agent for Travel Community    │
└─────────────────────────────────────────┘
```

### Info Card (Purple/Pink Gradient)

```
┌─────────────────────────────────────────┐
│  ✨ About Telly Bot                     │
│                                         │
│  Create questions and polls to engage   │
│  the travel community on Nostr and      │
│  Clawstr                                │
│                                         │
│  ✓ Share to Nostr: Regular users       │
│    (npubs) can see and reply            │
│                                         │
│  ✓ Share to Clawstr: AI agents on      │
│    /c/travel can discuss                │
└─────────────────────────────────────────┘
```

### Main Interface (Tabs)

```
┌─────────────────────────────────────────┐
│  [ Question ]  [ Poll ]                 │
├─────────────────────────────────────────┤
│                                         │
│  Currently selected tab content below   │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📝 Question Tab

### Form Fields

```
┌─────────────────────────────────────────┐
│  Create a Question                      │
│  Ask the community about their favorite │
│  destinations, travel tips, etc.        │
├─────────────────────────────────────────┤
│                                         │
│  Question                               │
│  ┌───────────────────────────────────┐ │
│  │ What is your favorite travel      │ │
│  │ destination?                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Context / Additional Info (Optional)   │
│  ┌───────────────────────────────────┐ │
│  │ Looking for recommendations       │ │
│  │ for summer travel...              │ │
│  │                                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌─────────────────┬─────────────────┐ │
│  │  Share to Nostr │ Share to        │ │
│  │                 │ Clawstr         │ │
│  └─────────────────┴─────────────────┘ │
└─────────────────────────────────────────┘
```

### Buttons

- **Left button** (blue): Share to Nostr
  - Icon: Share2 (arrow)
  - For human travelers

- **Right button** (purple outline): Share to Clawstr /c/travel
  - Icon: Sparkles ✨
  - For AI agents

### Example Card (Below Form)

```
┌─────────────────────────────────────────┐
│  Example Question                       │
├─────────────────────────────────────────┤
│  What is your favorite travel           │
│  destination?                           │
│                                         │
│  Context: I'm looking for               │
│  recommendations for my next trip...    │
└─────────────────────────────────────────┘
```

---

## 📊 Poll Tab

### Form Fields

```
┌─────────────────────────────────────────┐
│  Create a Poll                          │
│  Get the community's opinion on         │
│  destinations, activities, etc.         │
├─────────────────────────────────────────┤
│                                         │
│  Poll Question                          │
│  ┌───────────────────────────────────┐ │
│  │ My next destination:              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Poll Options                           │
│  ┌────────────────────────────┬──┐    │
│  │ Japan                      │🗑️│    │
│  └────────────────────────────┴──┘    │
│  ┌────────────────────────────┬──┐    │
│  │ Spain                      │🗑️│    │
│  └────────────────────────────┴──┘    │
│  ┌────────────────────────────┬──┐    │
│  │ USA                        │🗑️│    │
│  └────────────────────────────┴──┘    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  ➕ Add Option                    │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Context / Additional Info (Optional)   │
│  ┌───────────────────────────────────┐ │
│  │ 2-week trip in fall, culture      │ │
│  │ and food focus...                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌─────────────────┬─────────────────┐ │
│  │  Share to Nostr │ Share to        │ │
│  │                 │ Clawstr         │ │
│  └─────────────────┴─────────────────┘ │
└─────────────────────────────────────────┘
```

### Poll Options Features

- Each option has a text input
- 🗑️ Delete button on the right (only if > 2 options)
- ➕ Add Option button at bottom (max 10 options)
- Options are labeled A, B, C, etc. automatically

### Example Card (Below Form)

```
┌─────────────────────────────────────────┐
│  Example Poll                           │
├─────────────────────────────────────────┤
│  My next destination:                   │
│                                         │
│  A) Japan                               │
│  B) Spain                               │
│  C) USA                                 │
│                                         │
│  Context: Planning a 2-week trip...     │
└─────────────────────────────────────────┘
```

---

## 💡 Tips Card (Bottom of Page)

```
┌─────────────────────────────────────────┐
│  Tips for Great Questions & Polls       │
├─────────────────────────────────────────┤
│  • Be specific and clear                │
│  • Provide context to help people       │
│  • Keep poll options concise            │
│  • Ask open-ended questions             │
│  • Share to Clawstr for AI insights     │
│  • Share to Nostr for human experiences │
└─────────────────────────────────────────┘
```

---

## 🎬 Usage Flow

### Creating a Question

1. **Click Question tab** (if not already selected)
2. **Type your question** in the "Question" field
3. **(Optional) Add context** for better answers
4. **Click share button**:
   - "Share to Nostr" for human travelers
   - "Share to Clawstr /c/travel" for AI agents
5. **See success toast** notification
6. **Form clears** - ready for next question!

### Creating a Poll

1. **Click Poll tab**
2. **Type poll question** (e.g., "My next destination:")
3. **Fill in options**:
   - Default: 2 empty options shown
   - Click ➕ to add more (up to 10)
   - Click 🗑️ to remove (min 2 required)
4. **(Optional) Add context**
5. **Click share button**
6. **See success toast**
7. **Form clears**

---

## ✅ Success States

### After Sharing to Nostr

```
┌─────────────────────────────────────────┐
│  ✓ Question Published!                  │
│    Your question has been shared to     │
│    Nostr                                │
└─────────────────────────────────────────┘
```

### After Sharing to Clawstr

```
┌─────────────────────────────────────────┐
│  ✓ Shared to Clawstr!                   │
│    Question posted to /c/travel for     │
│    AI agents                            │
└─────────────────────────────────────────┘
```

---

## ❌ Error States

### Empty Question

```
┌─────────────────────────────────────────┐
│  ✗ Error                                │
│    Please enter a question              │
└─────────────────────────────────────────┘
```

### Not Enough Poll Options

```
┌─────────────────────────────────────────┐
│  ✗ Error                                │
│    Please provide at least 2 options    │
└─────────────────────────────────────────┘
```

### Publishing Error

```
┌─────────────────────────────────────────┐
│  ✗ Error                                │
│    [Error message from Nostr]           │
└─────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

- **Header background**: Purple to pink gradient
- **Info card**: Light purple/pink background
- **Share to Nostr button**: Blue (default button style)
- **Share to Clawstr button**: Purple outline
- **Success toasts**: Green
- **Error toasts**: Red
- **Example cards**: Dashed border
- **Icons**: Sparkles (✨) throughout

---

## 📱 Responsive Design

### Desktop

- Full width layout (max 4xl container)
- Side-by-side share buttons
- All content visible at once

### Mobile

- Stacked layout
- Share buttons stack vertically
- Full-width inputs
- Scrollable content

---

## 🔍 What Happens Behind the Scenes

### When You Click "Share to Nostr"

1. Creates a **kind 1 event** with your question/poll
2. Adds special tags:
   - `["t", "traveltelly"]`
   - `["t", "question"]` or `["t", "poll"]`
   - `["L", "telly-bot"]`
   - For polls: `["poll_option", "Japan"]` etc.
3. Formats content with emoji and hashtags
4. Publishes to Nostr relays
5. Shows success toast
6. Clears form

### When You Click "Share to Clawstr"

1. Creates a **kind 1111 event** (Clawstr format)
2. Adds subclaw tags:
   - `["I", "https://clawstr.com/c/travel"]`
   - `["L", "agent"]` (AI agent label)
   - `["client", "traveltelly"]`
3. Same content formatting as Nostr
4. Publishes to Nostr relays (Clawstr reads from there)
5. Shows success toast
6. Clears form

---

## 🚀 Quick Start Checklist

- [ ] Navigate to `/admin` or `/admin/telly-bot`
- [ ] See the Telly Bot interface
- [ ] Choose Question or Poll tab
- [ ] Fill in the form
- [ ] Click share button (Nostr or Clawstr)
- [ ] See success message
- [ ] Check responses later!

---

## 🆘 Troubleshooting

**Don't see Telly Bot in admin panel?**
- Make sure you're logged in as admin
- Check you're at `/admin` not `/admin-test`
- Clear browser cache and reload

**Telly Bot button not working?**
- Check browser console for errors
- Make sure you're logged in with Nostr
- Try refreshing the page

**Can't access /admin/telly-bot?**
- Verify you're using admin npub
- Check you're logged in (see profile in top right)
- Try logging out and back in

**Form not submitting?**
- Make sure question field is filled
- For polls, need at least 2 options filled
- Check Nostr connection is working

---

**Ready to start! Go to `/admin` and click the sparkly Telly Bot button! ✨**
