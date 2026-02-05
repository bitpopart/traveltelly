# Traveltelly Newsletter System

Complete guide to the newsletter subscription and management system.

---

## Overview

Traveltelly includes a full-featured newsletter system that allows:
- **Users** to subscribe via email
- **Admin** to generate beautiful newsletters automatically
- **Publishing** to email, Nostr, and Clawstr simultaneously

All subscriber data is stored as Nostr events (kind 30080) for decentralized management.

---

## For Users: Subscribe to Newsletter

### Where to Subscribe

**Footer**: Every page has an inline subscription form at the bottom

**How to Subscribe:**
1. Scroll to the footer
2. Enter your email address
3. (Optional) Enter your name
4. Click "Subscribe"
5. ✅ Confirmation message appears

**What You'll Receive:**
- Latest travel reviews with GPS
- New travel stories and articles
- Recent trip reports
- New stock media listings
- Featured links and announcements

**Frequency:** When admin sends newsletters (typically weekly/monthly)

---

## For Admin: Newsletter Management

### Accessing Newsletter Manager

1. Login as admin
2. Go to `/admin`
3. Click the "Newsletter" tab
4. Newsletter Manager opens with two tabs:
   - **Compose Newsletter** - Create and send
   - **Subscribers** - Manage subscriber list

---

### Compose Newsletter

#### Auto-Generate Newsletter

**Button:** "Regenerate" (top-right)

**What it does:**
- Fetches latest 3 reviews
- Fetches latest 3 stories
- Fetches latest 3 trips
- Fetches latest 3 stock media items
- Auto-populates newsletter content

**Newsletter includes for each item:**
- Thumbnail image
- Title (clickable link)
- Description/content preview
- Metadata (rating, location, price, etc.)

#### Customize Content

**Remove Items:**
- Click X button on any item to remove it
- Newsletter updates automatically

**Add Introduction Text:**
1. Type in "Introduction Text" field
2. Appears at top of newsletter
3. Example: "Happy holidays! Here's what's new this month..."

**Add Featured Links:**
1. Enter link title (e.g., "New Feature Announcement")
2. Enter URL (e.g., "https://traveltelly.com/blog/...")
3. Click "Add Link"
4. Links appear in highlighted section
5. Remove with X button

#### Preview & Send

**Preview:**
- See all selected content organized by section
- Color-coded: Reviews (blue), Stories (green), Trips (yellow), Media (pink)
- Review before sending

**Send Newsletter:**
1. Click "Send Newsletter" button
2. Newsletter is:
   - ✅ Published to Nostr (kind 1)
   - ✅ Shared to Clawstr /c/travel
   - ✅ Email HTML copied to console
3. Success message appears
4. Copy email HTML from browser console
5. Paste into email service (Mailchimp, SendGrid, etc.)
6. Send to subscribers

**Copy Email HTML:**
- Click "📋 Copy Email HTML" button
- HTML copied to clipboard
- Ready to paste into email service

---

### Manage Subscribers

**Tab:** "Subscribers" tab

**View All Subscribers:**
- See all active subscribers
- Email address
- Name (if provided)
- Subscription date
- Source (where they subscribed)

**Remove Subscriber:**
1. Find subscriber in list
2. Click trash icon
3. Confirm removal
4. Status updated to "unsubscribed"
5. Won't receive future newsletters

**Subscriber Count:**
- Displayed in tab title
- Shows only active subscribers
- Updates in real-time

---

## Newsletter Content Structure

### Email Template

```
┌─────────────────────────────────────────┐
│   🌍 Traveltelly Newsletter             │
│   Latest travel content from around     │
│   the world                             │
├─────────────────────────────────────────┤
│ [Custom Introduction Text]              │
│                                         │
│ 📍 LATEST REVIEWS                       │
│ ┌───────────────────────────────────┐   │
│ │ [Thumbnail]                       │   │
│ │ Review Title (clickable)          │   │
│ │ ⭐ 5/5 • cafe                     │   │
│ │ 📍 San Francisco, CA              │   │
│ │ Description...                    │   │
│ └───────────────────────────────────┘   │
│ [2 more reviews...]                     │
│                                         │
│ 📝 LATEST STORIES                       │
│ [3 stories with thumbnails...]          │
│                                         │
│ ✈️ LATEST TRIPS                         │
│ [3 trips with thumbnails...]            │
│                                         │
│ 📸 NEW STOCK MEDIA                      │
│ [3 media items with thumbnails...]      │
│                                         │
│ 🔗 FEATURED LINKS                       │
│ • Link Title → URL                      │
│ • Another Link → URL                    │
│                                         │
│ ──────────────────────────────────────  │
│ You're receiving this because you       │
│ subscribed to Traveltelly newsletter.   │
│                                         │
│ Visit Traveltelly • Unsubscribe         │
│ 🌍 Travel the world ✈️📸               │
└─────────────────────────────────────────┘
```

### Nostr Post (Kind 1)

```
📬 Traveltelly Newsletter - February 5, 2026

[Custom text if added]

📍 LATEST REVIEWS
1. Blue Bottle Coffee
2. Golden Gate Park
3. Mission Burrito

📝 LATEST STORIES
1. My Tokyo Adventure
2. Hiking in Patagonia
3. Food Tour of Italy

✈️ LATEST TRIPS
1. Yosemite Valley Hike
2. Pacific Coast Road Trip
3. Iceland Ring Road

📸 NEW STOCK MEDIA
1. Sunset Over Mountains
2. Urban Street Photography
3. Beach Landscape

🔗 FEATURED LINKS
• Link Title: URL

🌍 Visit Traveltelly: https://traveltelly.com

#traveltelly #newsletter #travel
```

### Clawstr Post (Kind 1111)

```
📬 Traveltelly Newsletter - Feb 5, 2026

Latest travel content:
📍 3 Reviews
📝 3 Stories
✈️ 3 Trips
📸 3 Stock Media

[Custom text or default message]

Full newsletter: https://traveltelly.com

#traveltelly #newsletter #travel
```

---

## Data Schema

### Subscriber Event (Kind 30080)

**Published by:** Admin only  
**Identifier:** `subscriber-{email}`  
**Replaceable:** Yes (latest status wins)

**Required Tags:**
- `d`: Unique identifier
- `email`: Subscriber email address
- `status`: active | unsubscribed

**Optional Tags:**
- `name`: Subscriber name
- `source`: Subscription source (footer, homepage, etc.)

**Example:**
```json
{
  "kind": 30080,
  "pubkey": "admin_hex_pubkey",
  "content": "",
  "tags": [
    ["d", "subscriber-john@example.com"],
    ["email", "john@example.com"],
    ["name", "John Doe"],
    ["status", "active"],
    ["source", "footer"],
    ["alt", "Newsletter subscriber: john@example.com"]
  ]
}
```

---

## Usage Guide

### User Subscription Flow

1. **User visits Traveltelly**
2. **Scrolls to footer**
3. **Sees "Subscribe" form**
4. **Enters email** (and optional name)
5. **Clicks "Subscribe"**
6. **✅ Success message** appears
7. **Admin is notified** (subscriber event published)

### Admin Newsletter Flow

1. **Admin goes to** `/admin` → "Newsletter" tab
2. **Reviews auto-generated content** (latest 3 of each type)
3. **Edits content:**
   - Remove unwanted items
   - Add custom intro text
   - Add featured links
4. **Checks subscriber list** (Subscribers tab)
5. **Clicks "Send Newsletter"**
6. **Newsletter is:**
   - Published to Nostr
   - Shared to Clawstr
   - Email HTML in console
7. **Admin copies HTML** and pastes into email service
8. **Sends to subscribers** via email service

---

## Email Service Integration

### Recommended Services

**For Small Lists (< 1000):**
- **Mailchimp** - Free tier available
- **SendGrid** - Free tier: 100 emails/day
- **Brevo** (formerly Sendinblue) - Free tier: 300 emails/day

**For Large Lists:**
- **ConvertKit** - Creator-focused
- **EmailOctopus** - Affordable pricing
- **Amazon SES** - Pay as you go

### How to Send

1. **Generate newsletter** in admin panel
2. **Click "Send Newsletter"**
3. **Open browser console** (F12)
4. **Find** "Email HTML:" log
5. **Copy the HTML**
6. **Paste into email service:**
   - Mailchimp: Create campaign → Design → Code your own
   - SendGrid: Marketing → Create Single Send → Code editor
   - Other services: Use HTML editor option
7. **Add subscriber emails** from Traveltelly admin
8. **Send campaign**

---

## Features

### Subscription Form

✅ **Email validation**  
✅ **Optional name field**  
✅ **Source tracking**  
✅ **Success confirmation**  
✅ **Error handling**  
✅ **Loading states**  
✅ **Inline variant** (footer)  
✅ **Card variant** (dedicated pages)  

### Newsletter Manager

✅ **Auto-generate** from latest content  
✅ **Edit/remove** items  
✅ **Custom intro text**  
✅ **Featured links**  
✅ **Subscriber management**  
✅ **Email HTML generation**  
✅ **Nostr publishing**  
✅ **Clawstr sharing**  
✅ **One-click copy**  

### Email Template

✅ **Responsive design**  
✅ **Color-coded sections**  
✅ **Thumbnail images**  
✅ **Clickable links**  
✅ **Unsubscribe link**  
✅ **Professional styling**  
✅ **Mobile-friendly**  

---

## Testing

### Test Subscription

1. Scroll to footer on any Traveltelly page
2. Enter test email: `test@example.com`
3. Enter name: "Test User"
4. Click "Subscribe"
5. ✅ See success message
6. Go to `/admin` → Newsletter tab → Subscribers
7. Verify subscriber appears in list

### Test Newsletter Generation

1. Go to `/admin` → Newsletter tab
2. Click "Regenerate" (or wait for auto-generation)
3. Review content sections:
   - Reviews (should show 3)
   - Stories (should show 3)
   - Trips (should show 3)
   - Stock Media (should show 3)
4. Remove an item (click X)
5. Add custom text
6. Add a featured link
7. Click "Copy Email HTML"
8. Paste into text editor to verify HTML

### Test Publishing

1. In Newsletter Manager
2. Click "Send Newsletter"
3. Check browser console for:
   - Recipient list
   - Email HTML
4. Verify Nostr post published
5. Check Clawstr for post

---

## Troubleshooting

### "No subscribers" message

**Problem:** Subscriber list is empty

**Solution:**
- Have someone subscribe via footer
- Or manually add test subscriber (admin panel)

### Newsletter not auto-generating

**Problem:** Content sections are empty

**Solution:**
- Click "Regenerate" button
- Ensure there's published content (reviews, stories, trips, media)
- Check browser console for errors

### Can't copy email HTML

**Problem:** Copy button doesn't work

**Solution:**
- Open browser console (F12)
- Find "Email HTML:" log
- Manually copy the HTML
- Or click "Copy Email HTML" button again

### Subscriber not appearing

**Problem:** User subscribed but not in list

**Solution:**
- Refresh the Subscribers tab
- Check Nostr relay connection
- Verify admin permissions
- Check browser console for errors

---

## Future Enhancements

### Planned Features

- 🔜 Automatic email sending (backend integration)
- 🔜 Newsletter templates (multiple designs)
- 🔜 Scheduled newsletters
- 🔜 A/B testing
- 🔜 Analytics (open rate, click rate)
- 🔜 Subscriber import/export
- 🔜 Newsletter archive
- 🔜 RSS feed generation

### Backend Integration Options

For automatic email sending, consider:
- **Cloudflare Workers** with email routing
- **Netlify Functions** with SendGrid
- **Railway** with Nodemailer
- **Custom backend** with any email service

---

## Security & Privacy

### Data Storage

- ✅ Subscribers stored as Nostr events (decentralized)
- ✅ Admin has full control and visibility
- ✅ No third-party data sharing
- ✅ Unsubscribe updates status (doesn't delete)
- ✅ Source tracking for transparency

### Privacy Considerations

- Email addresses visible only to admin
- Stored on public Nostr relays (admin events)
- Can export/delete subscriber data anytime
- GDPR-friendly (data portability, deletion)

---

## API Reference

### Hooks

```typescript
// Get all subscribers (admin only)
const { data: subscribers } = useNewsletterSubscribers();

// Subscribe to newsletter
const { mutate: subscribe } = useSubscribeToNewsletter();
subscribe({ email, name, source });

// Unsubscribe
const { mutate: unsubscribe } = useUnsubscribeFromNewsletter();
unsubscribe(email);
```

### Components

```typescript
// Subscription form (card variant)
<NewsletterSubscribe />

// Subscription form (inline variant)
<NewsletterSubscribe variant="inline" source="homepage" />

// Newsletter manager (admin only)
<NewsletterManager />
```

### Schema

```typescript
interface NewsletterSubscriber {
  email: string;
  name?: string;
  subscribedAt: number;
  status: 'active' | 'unsubscribed';
  source?: string;
}
```

---

## Example Newsletter

### Sample Email Content

**Subject:** Traveltelly Newsletter - February 5, 2026

**Body:**

> 🌍 **Traveltelly Newsletter**
> 
> Happy February! Here's what's new on Traveltelly this month:
> 
> **📍 LATEST REVIEWS**
> 
> 1. **Blue Bottle Coffee**  
>    ⭐⭐⭐⭐⭐ 5/5 • cafe  
>    📍 San Francisco, CA  
>    Amazing coffee and atmosphere! The baristas really know their craft.
> 
> 2. **Golden Gate Park**  
>    ⭐⭐⭐⭐⭐ 5/5 • park  
>    📍 San Francisco, CA  
>    Beautiful park perfect for a relaxing afternoon walk.
> 
> 3. **Mission Burrito**  
>    ⭐⭐⭐⭐ 4/5 • restaurant  
>    📍 San Francisco, CA  
>    Authentic Mexican food with generous portions!
> 
> **📝 LATEST STORIES**
> 
> [3 stories with summaries and links...]
> 
> **✈️ LATEST TRIPS**
> 
> [3 trips with details and links...]
> 
> **📸 NEW STOCK MEDIA**
> 
> [3 media items with prices and links...]
> 
> **🔗 FEATURED LINKS**
> 
> • Check out our new map feature: https://traveltelly.com
> • Join us on Nostr: https://nostr.com
> 
> ---
> 
> You're receiving this because you subscribed to Traveltelly newsletter.  
> Visit Traveltelly • Unsubscribe  
> 🌍 Travel the world, share your experiences, own your data ✈️📸

---

## Quick Reference

### Subscriber Actions

| Action | Method | Result |
|--------|--------|--------|
| Subscribe | Footer form → Enter email → Submit | Kind 30080 event published |
| Unsubscribe | Admin panel → Subscribers → Trash icon | Status updated to 'unsubscribed' |
| View list | Admin panel → Newsletter → Subscribers tab | See all active subscribers |

### Newsletter Actions

| Action | Location | Result |
|--------|----------|--------|
| Generate | Admin → Newsletter → Regenerate | Loads latest content |
| Edit text | Compose tab → Introduction field | Adds custom intro |
| Add link | Compose tab → Featured Links → Add | Adds link to newsletter |
| Remove item | Click X on item | Removes from newsletter |
| Copy HTML | Click "Copy Email HTML" | HTML in clipboard |
| Send | Click "Send Newsletter" | Publishes to Nostr + Clawstr |

---

## Support

**Questions?**
- Check this documentation
- Ask Traveltelly Help Bot (sparkle button)
- Contact admin: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642

---

**Start building your subscriber list today! 📧🌍**
