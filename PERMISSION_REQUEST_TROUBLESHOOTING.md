# Permission Request Troubleshooting Guide

## Issue
Permission requests submitted by users don't appear in the admin panel's "Review Permission Requests" section.

## Debugging Steps

### 1. Check Console Logs (Open Browser DevTools → Console)

When you visit the Admin Panel and click on "Review Permissions" tab, you should see logs like:

```
🎯 usePermissionRequests hook called: {hasUser: true, userPubkey: "7d33ba57", isAdmin: true}
🔍 Querying permission requests...
🔌 Current relay URLs: [...]
📥 Raw permission request events (all kind 31491): 5 [...]
Event 0: {id: "abc...", kind: 31491, pubkey: "xyz...", tags: [...]}
✅ Valid permission request found: {id: "abc12345", d: "review-permission-...", requestType: "review_permission"}
📥 Permission grants: 2 [...]
👥 Already granted pubkeys: ["abc123...", "def456..."]
⏳ Pending requests: 3 [...]
```

### 2. Possible Issues and Solutions

#### A. Hook Not Executing
**Symptoms**: No console logs at all

**Check**:
- Are you logged in as admin? (npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642)
- Did you navigate to `/admin` and click "Review Permissions" tab?

**Solution**: Make sure you're logged in with the correct admin account using a Nostr extension.

#### B. No Events Found
**Symptoms**: `📥 Raw permission request events: 0 []`

**Possible Causes**:
1. **Relay doesn't have the events**
   - Events were published to a different relay
   - Relay sync issue

2. **User submitted to wrong kind**
   - Should be kind 31491
   - Check if user used correct form

**Solutions**:
- Click the "Refresh" button in the admin panel
- Try switching relays (use RelaySelector)
- Have user resubmit the request
- Check if the submission form is working (test yourself with another npub)

#### C. Events Found But Fail Validation
**Symptoms**: `📥 Raw permission request events: 2` but `✅ Valid permission requests: 0`

**Check Console for**:
```
❌ Validation failed: missing 'd' tag in event abc12345
❌ Validation failed: missing 'request_type' tag in event def67890
❌ Validation failed: wrong request_type 'stock_media_permission', expected 'review_permission'
```

**Required Event Structure**:
```json
{
  "kind": 31491,
  "content": "Reason for requesting permission",
  "tags": [
    ["d", "review-permission-1234567890123"],
    ["request_type", "review_permission"],
    ["alt", "Request for review posting permission"]
  ]
}
```

**Solution**: Event structure issue - check the PermissionRequestForm component

#### D. Events Filtered by Existing Grants
**Symptoms**: 
- `✅ Valid permission requests: 3`
- `👥 Already granted pubkeys: ["abc...", "def...", "ghi..."]`
- `⏳ Pending requests: 0`

**Meaning**: The requests exist but users already have permission granted

**Check**: Look at the grant events (kind 30383) - user's pubkey might already be in the `p` tag

**Solution**: This is correct behavior - already granted users won't show in pending list

### 3. Manual Testing Steps

#### Step 1: Test Permission Request Submission
1. Log out from admin account
2. Log in with a test npub (different from admin)
3. Go to a page that requires permission (e.g., `/reviews/create`)
4. You should see a form to request permission
5. Fill in the reason and submit
6. Check console for: `📤 Submitting permission request:`

#### Step 2: Check Admin Panel
1. Log back in as admin
2. Go to `/admin`
3. Click "Review Permissions" tab
4. Click "Refresh" button
5. Check console logs
6. Request should appear in the list

#### Step 3: Verify Event on Relay
You can manually check if the event exists on the relay using a Nostr client or tool:

**Query Parameters**:
```json
{
  "kinds": [31491],
  "limit": 50
}
```

**Expected Events**:
- Kind: 31491
- Has `d` tag
- Has `request_type` tag with value `review_permission`
- Content: User's reason for requesting

### 4. Using the Refresh Button

The admin panel now has a "Refresh" button:
- Click it to manually refetch permission requests
- Useful after switching relays
- Useful after a user just submitted a request
- Shows loading state while fetching

### 5. Common Problems

#### Problem: User submitted but nothing shows
1. Check if user published to correct relay
2. Try switching to different relay (Damus, Ditto, Primal)
3. Click Refresh button
4. Check console logs for errors

#### Problem: Shows "No pending permission requests" but user definitely submitted
1. Check if user's pubkey already has a grant (kind 30383)
2. Verify event exists on relay (use Nostr explorer)
3. Check event has correct tags
4. Verify you're on correct relay

#### Problem: Request appears then disappears
1. You likely granted permission
2. System filters out already-granted requests
3. This is correct behavior

### 6. Relay Compatibility

**Default Relay**: wss://relay.damus.io

**Alternative Relays**:
- wss://relay.ditto.pub
- wss://relay.primal.net

**Try This**:
1. Use the RelaySelector to switch relays
2. Click Refresh on each relay
3. See which relay has the permission request events
4. User might have submitted to a different relay

### 7. Testing with Different Accounts

**Test Accounts Needed**:
1. **Admin Account**: npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642
2. **Test User Account**: Any other Nostr account

**Steps**:
1. Create request with test account
2. Log out
3. Log in as admin
4. Check admin panel
5. Grant permission
6. Log back in as test user
7. Verify permission granted

### 8. Expected Behavior After Fix

Once working correctly, you should see:

**In Console (when viewing admin panel)**:
```
🎯 usePermissionRequests hook called: {hasUser: true, isAdmin: true}
🔍 Querying permission requests...
📥 Raw permission request events (all kind 31491): 3
Event 0: {...}
Event 1: {...}
Event 2: {...}
✅ Valid permission requests (with tag filter): 3
📥 Permission grants: 1
👥 Already granted pubkeys: ["abc123..."]
⏳ Pending requests: 2
```

**In Admin Panel**:
- Shows number badge with pending count
- Lists each request with user avatar/name
- Shows request reason
- "Grant Permission" and "Block Request" buttons
- Refresh button works

## Next Steps

1. **Check the console logs** - This is the most important step
2. **Look for the specific error messages** mentioned above
3. **Try the Refresh button** after submitting a test request
4. **Switch relays** if events aren't appearing
5. **Report back** what the console logs show

## Need Help?

If the issue persists, provide:
1. Screenshot of console logs from admin panel
2. Screenshot of "No pending requests" message
3. Confirm you submitted a request from a different npub
4. Which relay you're using
5. Any error messages in console
