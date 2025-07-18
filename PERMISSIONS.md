# Review Permission System

This application implements a comprehensive permission system that controls who can post reviews on Traveltelly. Only authorized users can create review events, ensuring quality content and preventing spam.

## Overview

- **Admin Authority**: Only `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642` can grant permissions
- **Request-Based**: Users must request permission to post reviews
- **Approval Workflow**: Admin reviews and approves/blocks requests
- **Nostr-Native**: Uses custom Nostr events for permission management

## User Experience

### For Regular Users

1. **Attempt to Create Review**: User tries to access `/create-review`
2. **Permission Check**: System checks if user has permission
3. **Request Form**: If no permission, user sees request form
4. **Submit Request**: User provides reason for wanting to post reviews
5. **Wait for Approval**: Admin reviews the request
6. **Access Granted**: Once approved, user can post reviews

### For Admin

1. **Access Admin Panel**: Navigate to `/admin` (only visible to admin)
2. **View Requests**: See all pending permission requests
3. **Review Details**: Read user's reason and check their profile
4. **Make Decision**: Grant permission or block request
5. **Manage Users**: Track who has been granted access

## Technical Implementation

### Custom Event Kinds

- **Permission Request** (`kind:31491`): User requests to post reviews
- **Permission Grant** (`kind:30383`): Admin grants or blocks permission

### Components

- **PermissionGate**: Wraps create review form, checks permissions
- **PermissionRequestForm**: Form for users to request permission
- **AdminPermissionManager**: Admin interface for managing requests
- **AdminPanel**: Complete admin dashboard

### Hooks

- **useReviewPermissions**: Check if user has permission and admin status
- **usePermissionRequests**: Fetch pending requests (admin only)
- **useSubmitPermissionRequest**: Submit permission request
- **useGrantPermission**: Grant permission to user
- **useBlockRequest**: Block permission request

## Permission Events

### Request Event Structure

```json
{
  "kind": 31491,
  "content": "I'm a travel blogger with 5 years of experience visiting unique locations...",
  "tags": [
    ["d", "review-permission-1234567890"],
    ["request_type", "review_permission"],
    ["alt", "Request for review posting permission"]
  ],
  "pubkey": "user-pubkey",
  "created_at": 1234567890
}
```

### Grant Event Structure

```json
{
  "kind": 30383,
  "content": "Review posting permission granted",
  "tags": [
    ["d", "review-grant-user-pubkey"],
    ["grant_type", "review_permission"],
    ["p", "user-pubkey"],
    ["e", "request-event-id"],
    ["alt", "Review permission granted"]
  ],
  "pubkey": "admin-pubkey",
  "created_at": 1234567890
}
```

### Block Event Structure

```json
{
  "kind": 30383,
  "content": "Review posting permission blocked",
  "tags": [
    ["d", "review-block-user-pubkey"],
    ["grant_type", "review_permission_blocked"],
    ["p", "user-pubkey"],
    ["e", "request-event-id"],
    ["alt", "Review permission blocked"]
  ],
  "pubkey": "admin-pubkey",
  "created_at": 1234567890
}
```

## Query Patterns

### Check User Permission

```javascript
// Check if user has permission
const events = await nostr.query([{
  kinds: [30383],
  authors: [ADMIN_HEX],
  '#p': [userPubkey],
  '#grant_type': ['review_permission'],
  limit: 1,
}], { signal });
```

### Get Pending Requests

```javascript
// Get all permission requests
const requests = await nostr.query([{
  kinds: [31491],
  '#request_type': ['review_permission'],
  limit: 50,
}], { signal });

// Filter out already processed requests
const grants = await nostr.query([{
  kinds: [30383],
  authors: [ADMIN_HEX],
  '#grant_type': ['review_permission'],
  limit: 100,
}], { signal });
```

## Security Features

- **Admin-Only Access**: Only the designated admin can grant permissions
- **Request Validation**: All permission events are validated before processing
- **Duplicate Prevention**: System prevents duplicate grants/blocks
- **Audit Trail**: All permission decisions are recorded on Nostr

## User Interface

### Permission Gate

The `PermissionGate` component wraps the create review form and shows:

- **Loading State**: While checking permissions
- **Request Form**: If user needs to request permission
- **Process Explanation**: 3-step approval process
- **Navigation Options**: Links to browse existing reviews

### Admin Panel

The admin panel provides:

- **Request List**: All pending permission requests
- **User Profiles**: Display names and profile information
- **Request Details**: User's reason for requesting permission
- **Action Buttons**: Grant or block with one click
- **Real-time Updates**: Automatically refreshes when decisions are made

## Benefits

1. **Quality Control**: Ensures only serious users post reviews
2. **Spam Prevention**: Reduces low-quality or spam content
3. **Community Building**: Creates a curated community of reviewers
4. **Decentralized**: Uses Nostr events, no central database
5. **Transparent**: All decisions are public on the Nostr network
6. **Scalable**: Admin can efficiently manage many requests

## Future Enhancements

- **Multiple Admins**: Support for multiple admin pubkeys
- **Auto-Approval**: Criteria-based automatic approval
- **Reputation System**: Track user review quality over time
- **Temporary Permissions**: Time-limited review access
- **Category Permissions**: Different permissions for different review types