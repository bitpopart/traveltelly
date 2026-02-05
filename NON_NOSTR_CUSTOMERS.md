# Non-Nostr Customer System

Traveltelly now supports purchasing stock media without requiring a Nostr account. Customers can buy individual items or subscribe to unlimited downloads using email authentication.

## Features

### 1. Guest Checkout
- Purchase individual stock media items without Nostr
- Email + name authentication
- Lightning or fiat payment options
- Download link sent to email
- Session persistence in browser localStorage

### 2. Unlimited Downloads Subscription
- Monthly subscription ($99/month)
- Unlimited downloads of all stock media
- Commercial usage rights included
- Email-based authentication
- No Nostr account required

### 3. Test Account (Admin Only)
- **Email**: `admin-non-nostr@traveltelly.test`
- **Name**: Admin Non-Nostr
- **Access**: Unlimited free downloads
- **Purpose**: Admin testing without payment

## Architecture

### Data Storage

Customer data is stored using Nostr events (admin-only):

**Customer Records (Kind 30078)**
- Published by admin account only
- Replaceable (one record per email)
- Identified by email (d tag)
- Contains:
  - Email address
  - Customer name
  - Subscription type (none, unlimited, test)
  - Subscription expiry date
  - Purchase history metadata
  - Internal notes

**Purchase Records (Kind 30079)**
- Published by admin account
- Tracks individual purchases
- Links customer email to products
- Payment status tracking

### Session Management

Guest sessions are stored in browser localStorage:
```typescript
{
  email: "customer@example.com",
  name: "Customer Name"
}
```

## User Flows

### Flow 1: Individual Purchase (Guest)
1. User browses marketplace without logging in
2. Clicks "License & Download" on a product
3. Selects "Guest" payment tab
4. Enters name and email
5. Chooses payment method (Lightning or Fiat)
6. Completes payment
7. Download link sent to email
8. Session saved in browser for future purchases

### Flow 2: Unlimited Subscription (Guest)
1. User navigates to `/guest-portal`
2. Enters name and email
3. Chooses subscription payment method
4. Pays $99/month
5. Receives subscription confirmation
6. Can now download any stock media for free
7. Access persists via email login

### Flow 3: Test Account Access (Admin)
1. Admin opens `/guest-portal`
2. Enters test email: `admin-non-nostr@traveltelly.test`
3. Immediately logged in (no payment)
4. Has unlimited free downloads
5. Can test the complete purchase flow

## Admin Features

### Customer Management Panel

Located in Admin Panel → "Customers" tab

**Features:**
- View all non-Nostr customers
- See subscription status and expiry dates
- Edit customer details
- Add customers manually
- Track purchase history
- Add internal notes
- Create test accounts

**Statistics:**
- Total customers
- Active subscribers
- Test accounts count

### Automatic Test Account Creation

The test account is automatically created when admin visits the admin panel for the first time. This ensures it's always available for testing.

## Payment Integration

### Lightning Payments
- Existing Lightning infrastructure
- Instant settlement
- Low fees
- traveltelly@primal.net

### Fiat Payments (Future)
- Credit card via Stripe
- PayPal integration
- Bank transfers
- Multiple currencies

## API Endpoints Needed

**Note**: This implementation uses client-side Nostr events for storage. For production, you may want to add:

- Email delivery service for download links
- Payment processor integration (Stripe, BTCPay)
- Subscription management system
- Download link generation with expiry

## Security Considerations

1. **Email Verification**: Currently not implemented - add email verification for production
2. **Payment Verification**: Mock payments in demo - integrate real payment processors
3. **Download Links**: Should be signed URLs with expiration
4. **Data Privacy**: Customer data is stored in Nostr events (admin-only)

## Testing the System

### As Admin:
1. Go to `/admin` panel
2. Click "Customers" tab
3. Test account should be automatically created
4. Click "Create Test Account" to recreate if needed

### As Guest Customer:
1. Go to `/guest-portal`
2. Use test credentials:
   - Email: `admin-non-nostr@traveltelly.test`
   - (Name filled automatically)
3. Navigate to marketplace
4. Try to download any stock media
5. Should download immediately without payment

### Test Individual Purchase:
1. Go to `/marketplace`
2. Click on any product
3. Click "License & Download"
4. Switch to "Guest" tab
5. Enter email and name
6. Choose payment method
7. Submit (mock payment)

### Test Subscription:
1. Go to `/guest-portal`
2. Switch to "Subscription" tab
3. Enter email and name
4. Submit subscription form (mock payment)
5. Verify subscription status shows as active

## Files Added/Modified

**New Files:**
- `src/lib/customerSchema.ts` - Customer data types and validation
- `src/hooks/useCustomers.ts` - Customer data hooks
- `src/hooks/useInitializeTestCustomer.ts` - Auto-create test account
- `src/components/GuestCheckout.tsx` - Guest purchase form
- `src/components/GuestLogin.tsx` - Guest session management
- `src/components/UnlimitedSubscription.tsx` - Subscription form
- `src/components/CustomerManagement.tsx` - Admin customer panel
- `src/pages/GuestPortal.tsx` - Customer portal page
- `NON_NOSTR_CUSTOMERS.md` - This documentation

**Modified Files:**
- `src/components/PaymentDialog.tsx` - Added guest checkout tab
- `src/pages/AdminPanel.tsx` - Added Customers tab
- `src/pages/Marketplace.tsx` - Added subscription promotion card
- `src/AppRouter.tsx` - Added `/guest-portal` route

## Future Enhancements

- [ ] Real payment processing integration
- [ ] Email verification system
- [ ] Password reset for email-based accounts
- [ ] Purchase history tracking
- [ ] Download analytics
- [ ] Subscription renewal reminders
- [ ] Invoice generation
- [ ] Multi-currency support
- [ ] Refund handling
- [ ] Customer support ticketing
