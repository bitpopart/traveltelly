# Admin Access Control

The Traveltelly admin panel is restricted to **only** the specific Traveltelly npub:

```
npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642
```

## Security Implementation

### Multiple Layers of Protection

1. **Hook-Level Check**: `useReviewPermissions()` validates user against admin hex
2. **Component-Level Check**: AdminPanel component double-checks admin status
3. **UI-Level Check**: Admin panel link only shows for authorized admin
4. **Query-Level Check**: Permission requests only load for admin user

### Admin Detection Process

```typescript
// Convert npub to hex for internal comparison
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = npubToHex(ADMIN_NPUB);

// Check if current user is the Traveltelly admin
const isAdmin = user?.pubkey === ADMIN_HEX;
```

### Access Points Protected

1. **Admin Panel Link**: Only visible to Traveltelly admin on homepage
2. **Admin Panel Route** (`/admin`): Shows "Access Denied" for non-admin users
3. **Permission Requests**: Only loads data for admin user
4. **Grant/Block Actions**: Only available to admin user

### Visual Indicators

- **Admin Panel Button**: Orange-themed button only visible to admin
- **Access Denied Page**: Clear message for unauthorized access attempts
- **Debug Logging**: Development console shows admin check details

### Error Handling

If a non-admin user tries to access admin features:

- **Homepage**: Admin panel link is hidden
- **Direct URL Access**: Shows "Access Denied" message with back button
- **API Calls**: Permission request queries are disabled
- **Actions**: Grant/block mutations are not available

## Testing Admin Access

### For Admin User (Traveltelly npub)
1. Login with the Traveltelly npub
2. See "Admin Panel" button on homepage
3. Click to access `/admin` route
4. View and manage permission requests
5. Grant or block user requests

### For Regular Users
1. Login with any other npub
2. No "Admin Panel" button visible
3. Direct access to `/admin` shows "Access Denied"
4. Cannot perform admin actions

## Development Debugging

In development mode, the console shows admin check details:

```javascript
console.log('🔐 Admin Check:', {
  userPubkey: user.pubkey,
  adminHex: ADMIN_HEX,
  isAdmin,
  adminNpub: ADMIN_NPUB,
});
```

This helps verify that the admin detection is working correctly during development.

## Security Benefits

- **Single Point of Control**: Only one specific npub can manage permissions
- **No Privilege Escalation**: No way for users to gain admin access
- **Transparent**: Admin status is clearly indicated in UI
- **Fail-Safe**: Multiple checks ensure unauthorized access is prevented
- **Auditable**: All admin actions are recorded on Nostr network