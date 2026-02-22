# Featured Travelers - Debugging Guide

## Issue
Featured travelers added in admin panel don't appear on the /community page.

## Step-by-Step Debugging

### Step 1: Add a Featured Traveler

1. **Go to Admin Panel**: `/admin`
2. **Click "Community" tab**
3. **Scroll to "Featured Travelers" section**
4. **Add a traveler**:
   - Paste an npub (e.g., `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`)
   - Leave profile URL empty for now
   - Click "Add Traveler"
5. **Click "Save All Changes"** at the top of the page
6. **Check Console** - should see:
   ```
   💾 Saving community data to Nostr: {...}
   👥 Featured travelers being saved: 1 [{npub: "npub1...", profileUrl: undefined}]
   ✅ Community data published successfully
   ```

### Step 2: Verify Data Saved to Nostr

After saving, the data should be published as a kind 30079 event with this structure:

```json
{
  "kind": 30079,
  "content": "{
    \"faqs\": [...],
    \"forumText\": \"...\",
    \"forumHashtags\": [...],
    \"usefulLinks\": [...],
    \"ctaTitle\": \"...\",
    \"ctaDescription\": \"...\",
    \"ctaBadges\": [...],
    \"location\": \"...\",
    \"featuredTravelers\": [
      {
        \"npub\": \"npub1abc...\",
        \"profileUrl\": null
      }
    ]
  }",
  "tags": [
    ["d", "community-page"],
    ["title", "TravelTelly Community Page Content"],
    ["alt", "Community page configuration for TravelTelly"]
  ]
}
```

### Step 3: View Community Page

1. **Navigate to** `/community`
2. **Open DevTools → Console** (F12)
3. **Look for these logs**:

**Expected Logs (if working)**:
```
🔍 Fetching community data (kind 30079)...
📥 Community events found: 1
📄 Event content: {"faqs":[...],"featuredTravelers":[{"npub":"npub1..."}]}
✅ Parsed community data: {faqs: Array(5), featuredTravelers: Array(1), ...}
👥 Community Data: {faqs: Array(5), featuredTravelers: Array(1), ...}
👥 Featured Travelers: [{npub: "npub1...", profileUrl: undefined}]
🎨 Rendering featured travelers section. Count: 1
👤 Rendering traveler 0: {npub: "npub1...", profileUrl: undefined}
🎨 Rendering FeaturedTravelerAvatar for: npub1abc...
✅ Decoded pubkey: 7d33ba57
👤 Author data: {displayName: "TravelTelly", picture: "https://..."}
```

**Problem Scenarios**:

#### Scenario A: No Events Found
```
🔍 Fetching community data (kind 30079)...
📥 Community events found: 0
⚠️ No community data found on relay
👥 Community Data: null
👥 Featured Travelers: []
```

**Cause**: Data not on current relay or not published yet

**Solutions**:
1. Verify you clicked "Save All Changes" in admin panel
2. Check if you're on the same relay (use RelaySelector)
3. Try refreshing the page
4. Try a different relay

#### Scenario B: Events Found But No Featured Travelers
```
🔍 Fetching community data (kind 30079)...
📥 Community events found: 1
✅ Parsed community data: {faqs: Array(5), ...}
👥 Featured Travelers: []
```

**Cause**: Event doesn't have featuredTravelers in JSON

**Solutions**:
1. Go back to admin panel
2. Re-add the traveler
3. Click "Save All Changes" again
4. Check console shows: `👥 Featured travelers being saved: 1`

#### Scenario C: Featured Travelers in Data But Not Rendering
```
👥 Featured Travelers: [{npub: "npub1..."}]
🎨 Rendering featured travelers section. Count: 1
👤 Rendering traveler 0: {npub: "npub1..."}
❌ Failed to decode npub: npub1... Error: ...
```

**Cause**: Invalid npub format

**Solutions**:
1. Verify the npub is complete and valid
2. Should start with `npub1`
3. Should be 63 characters long
4. Re-enter the npub in admin panel

#### Scenario D: Decoded But No Avatar
```
✅ Decoded pubkey: 7d33ba57
👤 Author data: {displayName: "npub1abc...", picture: undefined}
```

**Cause**: User profile not found on relay or no profile picture

**Result**: Avatar will show with initials fallback (first 2 letters of name)

### Step 4: Verify Rendering

If all logs show correctly but you still don't see avatars:

1. **Check if section exists in DOM**:
   - Open DevTools → Elements
   - Search for "Featured Travelers"
   - Should find the card with purple gradient

2. **Check if avatars are hidden**:
   - Look for avatar elements
   - Check if they have `display: none` or `visibility: hidden`
   - Check for CSS issues

3. **Force refresh**:
   - Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear cache if needed

### Step 5: Test with Multiple Travelers

Add 2-3 travelers to verify:
1. Each should appear in admin list
2. Each should save when clicking "Save All Changes"
3. Each should render on /community page
4. Avatars should be in a horizontal row

## Common Issues & Solutions

### Issue: "No featured travelers yet" in Admin Panel After Adding

**Cause**: You added the traveler but didn't see it in the list

**Check**:
- Did you click "Add Traveler" button?
- Did you see the toast: "Traveler Added ✅"?
- Is the npub valid (starts with npub1)?

**Solution**: 
- Try adding again
- Check console for validation errors

### Issue: Traveler Shows in Admin But Not on Frontend

**Causes**:
1. Didn't click "Save All Changes"
2. Data not published to relay
3. Frontend on different relay
4. Cache issue

**Solutions**:
1. Go back to admin → Community tab
2. Verify traveler is still in the list
3. Click "Save All Changes" again
4. Wait for success toast
5. Switch to same relay on /community page
6. Hard refresh the page

### Issue: Avatar Shows But No Name

**Cause**: Profile metadata not found

**Expected Behavior**: 
- If no metadata found, shows generated name (e.g., "npub1abc...")
- If metadata found, shows `name` or `display_name`

**Not an Error**: This is normal for users without profile metadata

## Expected Behavior

### When Working Correctly

**Admin Panel** (`/admin` → Community):
- "Featured Travelers" section visible
- Can add npubs
- Shows count in summary (e.g., "2 Travelers")
- Save button publishes to Nostr

**Community Page** (`/community`):
- Purple gradient card appears below header
- Avatars displayed in horizontal row
- Names below avatars
- UserPlus icon badge on each avatar
- Hover effect: avatar scales up
- Click: Opens Nostr profile on Primal

### Visual Layout

```
┌─────────────────────────────────────────────┐
│         Featured Travelers                  │
├─────────────────────────────────────────────┤
│                                             │
│     [Avatar]    [Avatar]    [Avatar]       │
│     TravelTelly  Alice       Bob            │
│                                             │
│          Click to follow on Nostr           │
└─────────────────────────────────────────────┘
```

## Data Flow

1. **Admin adds traveler** → State updated
2. **Admin clicks Save** → Event published (kind 30079)
3. **Event published to relay** → JSON content includes featuredTravelers array
4. **User visits /community** → Query fetches kind 30079
5. **Data parsed** → featuredTravelers extracted
6. **Component renders** → Avatars displayed
7. **useAuthor fetches metadata** → Names and pictures loaded

## Quick Test

Run this in the admin panel after adding a traveler:

1. Add traveler with npub: `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`
2. Click "Save All Changes"
3. Open /community in new tab
4. Open console
5. Should see traveler rendered

## Next Steps

**Please do the following**:

1. **In Admin Panel**:
   - Add a featured traveler (use your own npub or mine)
   - Click "Save All Changes"
   - Open DevTools console
   - Look for: `👥 Featured travelers being saved: X`
   - Take screenshot if you see any errors

2. **On Community Page**:
   - Navigate to `/community`
   - Open DevTools console
   - Look for all the logs starting with 🔍, 📥, 👥, 🎨
   - Take screenshot of console
   - Tell me what you see

The console logs will tell us exactly where it's failing!
