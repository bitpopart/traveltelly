# TravelBot - Automated Content Curator

## Overview

**TravelBot** is an automated Nostr bot that curates and shares the best travel content from TravelTelly, similar to the Thai **Siamstr bot** pattern. It monitors reviews, stories, and trips, then periodically posts curated collections with hashtags `#travel` and `#photography`.

## Access

**Location**: https://www.traveltelly.com/admin/telly-bot → "Auto Bot" tab

**Admin Only**: Only the TravelTelly admin can access and configure the bot.

---

## How TravelBot Works

### 1. Content Monitoring

TravelBot continuously monitors three types of content:

- **Reviews** (kind 34879) - GPS-tagged location reviews
- **Stories** (kind 30023) - Long-form travel articles
- **Trips** (kind 30025) - Multi-photo journey documentation

### 2. Automated Posting

Every configured interval (default: 2 hours), TravelBot:

1. **Filters** content from the last 24 hours
2. **Selects** the top posts (default: 10 posts)
3. **Creates** a curated collection with nevent links
4. **Mines** proof-of-work nonce for visibility
5. **Publishes** to Nostr with hashtags

### 3. Proof-of-Work (PoW)

TravelBot uses the same PoW mining technique as the Thai Siamstr bot:

- **Target difficulty**: 21 (configurable)
- **Mining algorithm**: SHA-256 hash with leading zero bits
- **Purpose**: Increases visibility and prevents spam filtering

---

## Bot Post Format

```
[BOT]
Good afternoon! ☀️ TravelBot has curated posts you might have missed!

https://example.com/image.jpg

Review of Rung Aroon Coffee Bar - 5 stars
nostr:nevent1qqs8v6aajkpeamkrh8ccugw0muaye7flc9kk6e528lfvp0kdut0wy0c...
https://www.traveltelly.com/review/naddr1...

Journey through Thailand
nostr:nevent1qqs0wn04h5a8km6nqtpznvgl29vm7pvtn2zu2yv2768qqh6xr7t8h6q...
https://www.traveltelly.com/story/naddr1...

#travel #photography #traveltelly
```

### Components

| Part | Description |
|------|-------------|
| `[BOT]` | Bot identifier (no post number) |
| Greeting | Time-based greeting (morning/afternoon/evening) |
| Image URL | First image from curated posts (for preview) |
| Title | Post title (review/story/trip name) |
| `nostr:nevent1...` | NIP-19 encoded event references |
| TravelTelly URL | Clickable link to view on TravelTelly |
| Hashtags | `#travel #photography #traveltelly` |
| Image tags | Hidden NIP-92 image metadata tags |
| Website tag | Hidden `r` tag with TravelTelly URL |
| Nonce tag | Hidden PoW nonce in event tags |

---

## Configuration

### Enable/Disable Bot

Toggle the "Enable TravelBot" switch to start or stop automated posting.

### Post Interval

**Default**: 120 minutes (2 hours)  
**Range**: 30 - 1440 minutes  
**Purpose**: How often the bot posts curated collections

**Recommended values:**
- **30-60 min**: High activity periods
- **120 min**: Standard (recommended)
- **180-360 min**: Low activity or sparse content

### Posts Per Batch

**Default**: 10 posts  
**Range**: 5 - 20 posts  
**Purpose**: How many events to include in each bot message

**Guidelines:**
- **5-8 posts**: Cleaner, more focused
- **10 posts**: Balanced (recommended)
- **15-20 posts**: Maximum curation, but longer posts

### Proof-of-Work Difficulty

**Default**: 21  
**Range**: 0 - 30  
**Purpose**: Mining difficulty for visibility

**Difficulty levels:**
- **0**: No PoW (instant posting, less visible)
- **15-18**: Light PoW (1-5 seconds)
- **21**: Standard (10-30 seconds) ✅ **Recommended**
- **25+**: Heavy PoW (1+ minutes, maximum visibility)

**Note**: Higher difficulty = longer mining time but better visibility

### Hashtags

**Default**: `travel, photography, traveltelly`  
**Format**: Comma-separated list  
**Purpose**: Tag posts for discoverability

**Always included**: `#travel` and `#photography`

**Additional suggestions:**
- Location-specific: `japan`, `europe`, `asia`
- Activity-specific: `hiking`, `beach`, `citytrip`
- Theme-specific: `foodie`, `adventure`, `luxury`

---

## Manual Posting

Click **"Post Now"** to immediately create and publish a bot post without waiting for the scheduled interval.

**Requirements:**
- At least 1 post from the last 24 hours
- User must be logged in
- User must be admin

---

## Bot Statistics

### Total Posts
Running count of all bot posts published.

### Available Content
Total number of reviews, stories, and trips available.

**Breakdown:**
- Reviews: GPS-tagged location reviews
- Stories: Long-form travel articles
- Trips: Multi-photo journeys

### Last Post
Timestamp of the most recent bot post.

### Next Post
Scheduled time for the next automatic post (only when bot is enabled).

---

## Technical Details

### Event Structure

```json
{
  "kind": 1,
  "content": "[BOT]\nGreeting...\n\nhttps://image.jpg\n\nTitle\nnostr:nevent1...\nhttps://www.traveltelly.com/review/...\n\n#travel #photography",
  "tags": [
    ["t", "travel"],
    ["t", "photography"],
    ["t", "traveltelly"],
    ["image", "https://example.com/image.jpg"],
    ["imeta", "url https://example.com/image.jpg"],
    ["r", "https://www.traveltelly.com", "web"],
    ["nonce", "682784", "21"]
  ],
  "created_at": 1770354032,
  "pubkey": "7d33ba57d8a6e8869a1f1d5215254597594ac0dbfeb01b690def8c461b82db35",
  "id": "0000008e7b5190d31b83be4cdf082869d6bf12d1339fc186b462a123601a1d25",
  "sig": "..."
}
```

### Proof-of-Work Mining

The bot uses the same PoW algorithm as the Thai Siamstr bot:

```typescript
const mineNonce = async (event, targetDifficulty) => {
  let nonce = 0;
  
  while (nonce < 1000000) {
    const testEvent = {
      ...event,
      tags: [...event.tags, ['nonce', nonce.toString(), targetDifficulty.toString()]]
    };
    
    const id = await computeEventId(testEvent);
    
    // Count leading zeros in binary
    const leadingZeros = countLeadingZeros(id);
    
    if (leadingZeros >= targetDifficulty) {
      return nonce.toString();
    }
    
    nonce++;
  }
  
  return '0'; // Fallback
};
```

### NIP-19 Event Encoding

The bot creates `nevent1...` references using NIP-19:

```typescript
import { nip19 } from 'nostr-tools';

const nevent = nip19.neventEncode({
  id: event.id,
  author: event.pubkey,
  kind: event.kind,
});

// Result: nevent1qqs8v6aajkpeamkrh8ccugw0muaye7flc9kk6e528lfvp0kdut0wy0c...
```

These `nevent` references are rendered as clickable links in most Nostr clients.

---

## Comparison: Thai Siamstr Bot vs TravelBot

| Feature | Siamstr Bot | TravelBot |
|---------|-------------|-----------|
| **Platform** | Nostr | Nostr |
| **Purpose** | Curate Thai content | Curate travel content |
| **Hashtags** | `#siamstr` | `#travel #photography` |
| **Content Type** | General notes | Reviews, Stories, Trips |
| **PoW Difficulty** | 21 | 21 (configurable) |
| **Post Format** | `[BOT] N` + nevents | `[BOT]` + titles + images + URLs |
| **Images** | No | Yes (NIP-92 image tags) |
| **Clickable URLs** | No | Yes (TravelTelly links) |
| **Interval** | ~2 hours | Configurable (30-1440 min) |
| **Language** | Thai greeting | English greeting |
| **Admin Panel** | External script | Built-in TravelTelly UI |

---

## Best Practices

### ✅ Do's

- **Keep intervals balanced** - 2 hours is optimal for most cases
- **Monitor content availability** - Ensure fresh content before enabling
- **Use standard PoW (21)** - Balance between visibility and speed
- **Add relevant hashtags** - Improve discoverability without spam
- **Check stats regularly** - Monitor bot performance and engagement

### ❌ Don'ts

- **Don't set intervals too short** - Avoid spam (minimum 30 minutes)
- **Don't use excessive PoW** - Difficulty 25+ takes minutes to mine
- **Don't add too many hashtags** - Keep it focused (3-5 tags max)
- **Don't enable with no content** - Bot will fail if no recent posts
- **Don't forget to disable** - Turn off during maintenance or low activity

---

## Troubleshooting

### Bot Not Posting

**Possible causes:**
- ✅ Bot is disabled (check toggle)
- ✅ No content from last 24 hours
- ✅ User not logged in
- ✅ User is not admin
- ✅ Interval hasn't elapsed yet

**Solution**: Check status card and content availability stats.

### Mining Takes Too Long

**Possible causes:**
- PoW difficulty set too high (25+)

**Solution**: Reduce difficulty to 21 or lower.

### Posts Not Visible

**Possible causes:**
- PoW difficulty set too low (0-10)
- Relays not accepting events

**Solution**: Increase difficulty to 21 and check relay connectivity.

### "No Recent Content" Error

**Possible causes:**
- No posts in last 24 hours
- Content not tagged with `#traveltelly`

**Solution**: Wait for new content or create some posts manually.

---

## Reference Example

This is the exact bot post format from the Thai Siamstr bot that inspired TravelBot:

```json
{
  "created_at": 1770354032,
  "kind": 1,
  "id": "0000008e7b5190d31b83be4cdf082869d6bf12d1339fc186b462a123601a1d25",
  "content": "[BOT] 935206\nสวัสดีตอนเที่ยง น้องวัวได้รวบรวมโน๊ตที่ท่านอาจจะพลาดไป ลองไปชมกันเลย!\n\nnostr:nevent1qqs8v6aajkpeamkrh8ccugw0muaye7flc9kk6e528lfvp0kdut0wy0cpzamhxue69uhhyetvv9ujuumfv9khxarj9e3k7mgprpmhxue69uhhyetvv9ujumn0w3hhx6rf9emkjm30qy2hwumn8ghj7un9d3shjtnyv9kh2uewd9hj7qgwwaehxw309ahx7uewd3hkctcpzemhxue69uhkummnw3ex2mrfw3jhxtn0wfnj7qg3waehxw309ahx7um5wgh8w6twv5hszjl7jq\n...\n#siamstr",
  "sig": "d6367c2e34a4d8fd4ce83ba58201b875b7b81ea8efd87930b945e48e8d091789267ed996d04e2da4170e944d154797689a2d5603a290ef46134f3ad48da92539",
  "pubkey": "58f5a23008ba5a8730a435f68f18da0b10ce538c6e2aa5a1b7812076304d59f7",
  "tags": [
    ["t", "siamstr"],
    ["nonce", "682784", "21"]
  ]
}
```

**Key observations:**
- Event ID starts with `00000` (PoW success)
- Nonce value: `682784` (took 682,784 iterations)
- Difficulty: `21` (21 leading zero bits)
- Contains multiple `nevent1...` references
- Single hashtag `#siamstr`

---

## NPub Reference

**Thai Siamstr Bot**: [nprofile1qqs93adzxqyt5k58xzjrta50rrdqkyxw2wxxu2495xmczgrkxpx4naczt6v4w](https://primal.net/p/nprofile1qqs93adzxqyt5k58xzjrta50rrdqkyxw2wxxu2495xmczgrkxpx4naczt6v4w)

**TravelBot**: Posts from `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642` (TravelTelly admin)

---

## Usage Summary

1. **Navigate** to https://www.traveltelly.com/admin/telly-bot
2. **Click** "Auto Bot" tab
3. **Configure** interval, posts per batch, and PoW difficulty
4. **Enable** the bot with the toggle switch
5. **Monitor** stats and content availability
6. **Adjust** settings based on performance

The bot will automatically curate and share the best TravelTelly content with the Nostr community! 🤖✈️📸

---

**Built with inspiration from the Thai Siamstr bot** 🙏
