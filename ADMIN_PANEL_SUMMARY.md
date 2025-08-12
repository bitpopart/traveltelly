# Traveltelly Admin Panel - Stock Media Permissions Management

## Overview

I've successfully created a comprehensive admin panel for managing stock media permissions and user requests in the Traveltelly application. The system is specifically designed for the admin npub `npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642`.

## Features Implemented

### 1. Admin Panel (`/admin`)
- **Dual-tab interface**: Review Permissions + Stock Media Permissions
- **Admin-only access**: Restricted to the specific Traveltelly admin npub
- **Quick actions**: Links to hide/remove reviews, marketplace, and settings
- **Responsive design**: Works on desktop and mobile devices

### 2. Stock Media Permission Management
- **Permission Requests**: Users can request upload permissions with portfolio and experience details
- **Grant/Block System**: Admin can approve or block requests with optional reasons
- **User Management**: View granted users and blocked users in separate tabs
- **Revoke Permissions**: Admin can revoke previously granted permissions

### 3. User Permission Request System (`/stock-media-permissions`)
- **Request Form**: Users can submit detailed permission requests
- **Portfolio Integration**: Optional portfolio URL field for showcasing work
- **Experience Details**: Optional field for photography experience
- **Status Display**: Shows current permission status and admin status

### 4. Settings Integration
- **Permissions Tab**: Added to user settings for easy access to permission requests
- **Status Cards**: Visual indicators for admin status, upload permissions, and account status

## Technical Implementation

### Custom Nostr Event Kinds
- **Kind 31492**: Stock media permission requests (addressable events)
- **Kind 30384**: Permission grants, blocks, and revocations (replaceable events)

### Event Structure

#### Permission Request (Kind 31492)
```json
{
  "kind": 31492,
  "content": "Reason for requesting permission",
  "tags": [
    ["d", "stock-media-permission-timestamp"],
    ["request_type", "stock_media_permission"],
    ["portfolio", "https://portfolio-url.com"],
    ["experience", "Photography experience details"],
    ["alt", "Request for stock media upload permission"]
  ]
}
```

#### Permission Grant (Kind 30384)
```json
{
  "kind": 30384,
  "content": "Permission granted",
  "tags": [
    ["d", "stock-media-grant-user_pubkey"],
    ["grant_type", "stock_media_permission"],
    ["p", "user_pubkey"],
    ["e", "original_request_id"],
    ["alt", "Stock media upload permission granted"]
  ]
}
```

### React Components Created
1. **`StockMediaPermissionManager`**: Admin interface for managing permissions
2. **`StockMediaPermissionRequest`**: User interface for requesting permissions
3. **`StockMediaPermissions`**: Dedicated page for permission management

### React Hooks Created
- **`useStockMediaPermissions`**: Check user permission status
- **`useStockMediaPermissionRequests`**: Fetch all permission requests (admin only)
- **`useSubmitStockMediaPermissionRequest`**: Submit permission requests
- **`useGrantStockMediaPermission`**: Grant permissions (admin only)
- **`useBlockStockMediaRequest`**: Block permission requests (admin only)
- **`useRevokeStockMediaPermission`**: Revoke existing permissions (admin only)

## User Experience

### For Regular Users
1. **Request Process**: Visit `/stock-media-permissions` or Settings > Permissions tab
2. **Form Submission**: Fill out reason, optional portfolio, and experience
3. **Status Tracking**: See current permission status and admin decision
4. **Clear Feedback**: Visual indicators and status cards

### For Admin (npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642)
1. **Admin Panel Access**: Automatic admin panel link in navigation
2. **Request Management**: View all pending requests with user details
3. **Decision Making**: Grant or block requests with optional reasons
4. **User Oversight**: Manage granted and blocked users
5. **Permission Control**: Revoke permissions when necessary

## Security Features

- **Admin Verification**: Double-checks admin npub for security
- **Permission Validation**: Validates event structure and required tags
- **Access Control**: Admin-only functions are properly restricted
- **Event Filtering**: Filters out invalid or malformed events

## Navigation Integration

- **Main Page**: "Upload Permissions" button for logged-in users
- **Settings**: Dedicated "Permissions" tab
- **Admin Panel**: Accessible via navigation for admin users
- **Breadcrumbs**: Clear navigation paths with back buttons

## Documentation

- **NIP.md Updated**: Added comprehensive documentation of the permission system
- **Event Schemas**: Detailed event structure documentation
- **Admin Configuration**: Clear admin npub specification

## Quality Assurance

- **TypeScript**: Full type safety with proper interfaces
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Skeleton loading for better UX
- **Responsive Design**: Mobile-friendly interface
- **Accessibility**: Proper ARIA labels and semantic HTML

## Future Enhancements

The system is designed to be extensible for future features like:
- Community-based moderation
- Reputation scoring
- Automated content quality checks
- Multi-admin support
- Permission expiration dates

This implementation provides a solid foundation for managing stock media permissions while maintaining the decentralized nature of the Nostr protocol.