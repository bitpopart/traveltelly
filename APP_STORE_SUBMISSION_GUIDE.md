# App Store Submission Guide

Complete step-by-step guide for submitting TravelTelly to Google Play Store, Apple App Store, and Zapstore.

**Access the interactive guide at:** https://www.traveltelly.com/admin/app-builder

---

## Table of Contents

1. [Google Play Store Submission](#google-play-store-submission)
2. [Apple App Store Submission](#apple-app-store-submission)
3. [Zapstore Submission](#zapstore-submission)
4. [Quick Reference](#quick-reference)

---

## Google Play Store Submission

### Prerequisites
- ✅ Google Play Console Account ($25 one-time fee)
- ✅ AAB file (Android App Bundle) generated
- ✅ Screenshots and app assets prepared

### Step 1: Build AAB File

```bash
# Build Android App Bundle (required for Play Store)
cd android && ./gradlew bundleRelease && cd ..
```

**Output location:** `android/app/build/outputs/bundle/release/app-release.aab`

### Step 2: Create Google Play Console Account

1. Visit [Google Play Console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Complete account setup and verification

### Step 3: Create Your App

1. Click **"Create app"** in Play Console
2. Enter app name: **TravelTelly**
3. Select default language
4. Choose **"App"** (not "Game")
5. Select **"Free"** or **"Paid"**
6. Agree to declarations and click **"Create"**

### Step 4: Set Up Store Listing

Navigate to **"Main store listing"** and complete:

**Required Fields:**
- **Short description** (80 chars max)
- **Full description** (4000 chars max)
- **App icon** (512x512 PNG)
- **Feature graphic** (1024x500 PNG)
- **Screenshots** (at least 2, up to 8)
  - Phone: 16:9 or 9:16 aspect ratio
  - Min dimension: 320px
  - Max dimension: 3840px
- **App category:** Travel & Local
- **Contact email**
- **Privacy policy URL**

### Step 5: Content Rating

1. Go to **"Content rating"** section
2. Click **"Start questionnaire"**
3. Select category: **"Social"**
4. Answer content questions honestly
5. Submit questionnaire to receive rating

### Step 6: Upload App Bundle

1. Go to **"Production"** → **"Releases"**
2. Click **"Create new release"**
3. Upload your `app-release.aab` file
4. Add release name (e.g., "1.0.0")
5. Add release notes describing your app
6. Click **"Save"** and **"Review release"**

### Step 7: Complete Required Sections

**App content:**
- Privacy policy URL
- Ads declaration (does your app have ads?)
- Target audience and content

**Data safety:**
- Describe what data you collect
- Explain how data is used
- Specify if data is shared with third parties
- Indicate if data is encrypted

**App access:**
- If login is required, provide demo account credentials
- Explain any special access requirements

**Pricing & distribution:**
- Select **"Free"** or set price
- Choose countries for distribution
- Confirm content guidelines compliance

### Step 8: Submit for Review

1. Review all sections - ensure green checkmarks on all required items
2. Click **"Send X items for review"**
3. Confirm submission
4. **Review time:** Typically 3-7 days
5. You'll receive email updates on review status

### Step 9: After Approval

- App will be published automatically (if set to "Make available immediately")
- Users can find it by searching "TravelTelly"
- Monitor reviews and ratings
- Update app regularly

### Common Rejection Reasons

- ❌ Incomplete store listing
- ❌ Missing or invalid privacy policy
- ❌ Crashes or bugs during testing
- ❌ Incomplete data safety section
- ❌ Misleading screenshots or description
- ❌ Violations of Google Play policies

---

## Apple App Store Submission

### Prerequisites
- ✅ macOS with Xcode installed
- ✅ Apple Developer Account ($99/year)
- ✅ App archive created in Xcode
- ✅ Screenshots and app assets prepared

### Step 1: Join Apple Developer Program

1. Visit [Apple Developer Program](https://developer.apple.com/programs/)
2. Enroll for $99/year
3. Complete verification (24-48 hours)
4. Sign in to [App Store Connect](https://appstoreconnect.apple.com)

### Step 2: Create App Record

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Select **"iOS"**
4. Enter app name: **TravelTelly**
5. Select primary language
6. Enter Bundle ID: `com.traveltelly.app`
7. Enter SKU: `traveltelly-001` (unique identifier)
8. Select **"Full Access"** for user access
9. Click **"Create"**

### Step 3: Upload Build via Xcode

1. In Xcode, select **Product** → **Archive**
2. Wait for archive to complete
3. Xcode Organizer will open automatically
4. Select your archive
5. Click **"Distribute App"**
6. Select **"App Store Connect"**
7. Choose **"Upload"**
8. Select distribution certificate and provisioning profile
9. Review and click **"Upload"**
10. Wait for processing (10-30 minutes)

### Step 4: Add App Information

In App Store Connect, complete:

**App Information:**
- **Name:** TravelTelly
- **Subtitle:** Short tagline (30 chars)
- **Category:** Primary = Travel, Secondary = Social Networking
- **Content Rights:** Check if you own all rights

**Description:**
- Full description (4000 chars max)
- Highlight key features
- Explain Nostr and decentralization benefits
- Include usage instructions

**Keywords:**
- Comma-separated (100 chars total)
- Examples: travel,nostr,reviews,photography,bitcoin,lightning,decentralized

**URLs:**
- **Support URL:** https://traveltelly.com
- **Marketing URL:** https://traveltelly.com (optional)
- **Privacy Policy URL:** (required) Your privacy policy URL

### Step 5: Upload Screenshots

**Required sizes:**

**iPhone 6.7" Display** (iPhone 15 Pro Max):
- Resolution: 1290 x 2796 pixels
- 3-10 screenshots required

**iPhone 5.5" Display** (iPhone 8 Plus):
- Resolution: 1242 x 2208 pixels
- 3-10 screenshots required

**Tips:**
- Use Xcode Simulator to capture screenshots
- First 3 screenshots shown in search results
- Show key features and functionality
- Add captions or text overlays for clarity

**App Icon:**
- 1024x1024 PNG
- No transparency
- No rounded corners (Apple adds them)

### Step 6: Age Rating

1. Click **"Edit"** next to Age Rating
2. Answer questionnaire about content:
   - Violence
   - Sexual content
   - Profanity
   - Gambling
   - Substance use
   - Medical/treatment info
3. Review assigned rating
4. Confirm rating

### Step 7: Pricing and Availability

- **Price:** Free or select price tier
- **Availability date:** "Make available immediately" or set date
- **Countries/regions:** Select distribution countries
- **Pre-order:** Enable if desired (optional)

### Step 8: App Privacy

Click **"Set Up App Privacy"** and declare:

**Data Collection:**
- Location (for GPS-tagged reviews)
- Photos (for review uploads)
- User content (reviews, stories, trips)
- Payment info (Lightning addresses)

**For each data type:**
- How it's used (app functionality, analytics, etc.)
- Whether it's linked to user identity
- Whether it's used for tracking
- Whether users can opt out

### Step 9: Select Build

1. Scroll to **"Build"** section
2. Click **"+"** to add build
3. Select uploaded build from list
4. Choose export compliance (usually "No" for travel apps)
5. Add **"What's New in This Version"** notes

### Step 10: Submit for Review

1. Review all sections for completeness
2. Click **"Add for Review"**
3. Answer additional questions if prompted:
   - Demo account (if login required)
   - Special instructions for reviewers
   - Notes about third-party content
4. Click **"Submit for Review"**

### Step 11: Review Process

**Status Timeline:**
- **Waiting for Review:** 1-3 days (can be hours or weeks)
- **In Review:** 24-48 hours
- **Rejected:** Address issues and resubmit
- **Pending Developer Release:** Approved, awaiting your release
- **Ready for Sale:** Live on App Store!

**Email notifications sent at each stage**

### Step 12: After Approval

- App appears on App Store
- Monitor reviews and ratings
- Respond to user feedback
- Plan updates and improvements

### Common Rejection Reasons

- ❌ Crashes or bugs during testing
- ❌ Missing or incomplete privacy policy
- ❌ Incomplete App Privacy section
- ❌ UI/UX issues or poor user experience
- ❌ Misleading description or screenshots
- ❌ Missing permissions explanations (location, camera, photos)
- ❌ Account login issues (no demo account provided)
- ❌ Violations of App Store Review Guidelines

### TestFlight Beta Testing (Recommended)

Before submitting to App Store, test with beta users:

1. Upload build to TestFlight (automatic after Xcode upload)
2. Go to **TestFlight** tab in App Store Connect
3. Add **Internal Testers** (up to 100, immediate access)
4. Add **External Testers** (up to 10,000, requires beta review)
5. Share invite link with testers
6. Collect feedback and fix issues
7. Then submit to App Store with confidence

---

## Zapstore Submission

### What is Zapstore?

Zapstore is a **decentralized app store** built on Nostr:
- ✅ **No approval process** - publish instantly
- ✅ **No fees** - completely free
- ✅ **Decentralized** - no central authority
- ✅ **Censorship resistant** - published on Nostr relays
- ✅ **Open source** - transparent and auditable

### Prerequisites
- ✅ APK file built and signed
- ✅ Go programming language installed
- ✅ Nostr browser extension (Alby, nos2x, Flamingo)
- ✅ Nostr account for publishing

### Step 1: Install Go

If not already installed:

1. Visit [go.dev/dl](https://go.dev/dl/)
2. Download installer for your OS
3. Install and verify:
   ```bash
   go version
   ```

### Step 2: Install Zapstore Publisher (zsp)

```bash
go install github.com/zapstore/zsp@latest
```

Verify installation:
```bash
zsp --version
```

### Step 3: Build Your APK

```bash
npm run build:apk
```

This creates: `downloads/traveltelly.apk`

### Step 4: Create zapstore.yaml

Create `zapstore.yaml` in project root:

```yaml
# Source code repository
repository: https://github.com/bitpopart/traveltelly

# APK file location
release_source: ./downloads/traveltelly.apk

# APP METADATA
name: TravelTelly

summary: GPS-tagged travel reviews, stories & stock media marketplace

description: |
  Discover and share travel experiences on a decentralized platform built on Nostr.
  
  Features:
  • GPS-tagged reviews with photos and star ratings
  • Long-form travel stories and articles
  • Trip reports with route visualization
  • Stock media marketplace with Lightning payments
  • All data stored on decentralized Nostr relays
  
  Built with Nostr, Lightning Network, and open protocols.

tags:
  - nostr
  - travel
  - photography
  - reviews
  - marketplace
  - lightning
  - bitcoin
  - decentralized

license: MIT

website: https://traveltelly.com

# NOSTR PROTOCOL SUPPORT
supported_nips:
  - "01"  # Basic protocol
  - "07"  # Browser signing
  - "17"  # Gift Wrapped DMs
  - "19"  # NIP-19 identifiers
  - "46"  # Remote signing
  - "55"  # Android signing (Amber)
  - "57"  # Lightning Zaps
  - "65"  # Relay list metadata
  - "94"  # File metadata
  - "96"  # Blossom file storage
  - "99"  # Classified listings
```

### Step 5: Install Nostr Browser Extension

1. Install one of these extensions:
   - **Alby** (recommended): [getalby.com](https://getalby.com)
   - **nos2x**: Chrome/Firefox extension
   - **Flamingo**: Chrome extension
2. Create or import your Nostr account
3. Make sure you're logged in

**Important:** The npub you're logged in with will be listed as the app publisher

### Step 6: Create Publish Script (Recommended)

Create `scripts/publish-zapstore.sh`:

```bash
#!/bin/bash
set -e

echo "📦 Publishing to Zapstore..."

# Check if APK exists
if [ ! -f "downloads/traveltelly.apk" ]; then
    echo "❌ APK not found. Building APK first..."
    npm run build:apk
fi

# Set signing method to browser (NIP-07)
export SIGN_WITH=browser

# Publish to Zapstore
zsp publish zapstore.yaml

echo "✅ Published to Zapstore!"
echo "View at: https://zap.store"
echo "Search for: TravelTelly"
```

Make executable:
```bash
chmod +x scripts/publish-zapstore.sh
```

### Step 7: Add npm Script

Add to `package.json`:

```json
{
  "scripts": {
    "build:apk": "bash scripts/build-apk.sh",
    "publish:zapstore": "bash scripts/publish-zapstore.sh"
  }
}
```

### Step 8: Publish to Zapstore

Run the publish script:
```bash
npm run publish:zapstore
```

Or manually:
```bash
SIGN_WITH=browser zsp publish zapstore.yaml
```

### Step 9: Sign with Browser Extension

1. **zsp** will open your browser automatically
2. Your Nostr extension will prompt for signature
3. **Approve** the signature request
4. The app release event will be published to Zapstore relays
5. Terminal will show confirmation

### Step 10: Verify Publication

1. Visit [zap.store](https://zap.store)
2. Search for **"TravelTelly"**
3. Or search by your npub to see all your apps
4. App should appear within minutes

### Step 11: Share Your App

**Users can install via:**

1. **Zapstore app** - Search for "TravelTelly"
2. **Direct link** - Share your app's Zapstore URL
3. **Nostr** - Post about your app with `#zapstore` tag

**Example Nostr post:**
```
🚀 TravelTelly is now on Zapstore!

GPS-tagged travel reviews, stories & stock media marketplace built on #Nostr

Download: https://zap.store/[your-app-url]

#zapstore #travel #photography #bitcoin #lightning
```

### Updating Your App

To publish updates:

1. Update version in `android/app/build.gradle`:
   ```gradle
   versionCode 20250214  // Increment this
   versionName "2025.02.14"  // Update this
   ```

2. Rebuild APK:
   ```bash
   npm run build:apk
   ```

3. Publish to Zapstore:
   ```bash
   npm run publish:zapstore
   ```

4. Zapstore automatically detects new version
5. Users receive update notifications

### Benefits of Zapstore

✅ **Instant publishing** - No waiting for approval  
✅ **Free forever** - No registration or listing fees  
✅ **Decentralized** - No single point of failure  
✅ **Censorship resistant** - Published on Nostr relays  
✅ **Automatic updates** - Propagate via Nostr protocol  
✅ **Transparent** - All releases are public Nostr events  
✅ **No gatekeepers** - You control your distribution  

### Zapstore vs Traditional App Stores

| Feature | Zapstore | Google Play | Apple App Store |
|---------|----------|-------------|-----------------|
| **Approval Process** | None | 3-7 days | 1-3 days |
| **Registration Fee** | Free | $25 one-time | $99/year |
| **Review Guidelines** | None | Extensive | Extensive |
| **Censorship Risk** | Very Low | Medium | High |
| **Update Speed** | Instant | Hours | Days |
| **Developer Control** | Full | Limited | Limited |
| **Discoverability** | Nostr network | High | Very High |

---

## Quick Reference

### Build Commands

```bash
# Build Android APK (for Zapstore, testing)
npm run build:apk

# Build Android AAB (for Google Play)
cd android && ./gradlew bundleRelease && cd ..

# Build iOS (opens Xcode)
npm run build:ios  # or: npx cap open ios
```

### Output Locations

```
Android APK:  downloads/traveltelly.apk
Android AAB:  android/app/build/outputs/bundle/release/app-release.aab
iOS Archive:  Created in Xcode Organizer
```

### Publishing Commands

```bash
# Publish to Zapstore
npm run publish:zapstore

# Manual Zapstore publish
SIGN_WITH=browser zsp publish zapstore.yaml
```

### Important URLs

- **Google Play Console:** https://play.google.com/console
- **Apple App Store Connect:** https://appstoreconnect.apple.com
- **Zapstore:** https://zap.store
- **Capacitor Docs:** https://capacitorjs.com
- **Zapstore Publisher (zsp):** https://github.com/zapstore/zsp

### Support Resources

- **Interactive Guide:** https://www.traveltelly.com/admin/app-builder
- **Capacitor Android:** https://capacitorjs.com/docs/android
- **Capacitor iOS:** https://capacitorjs.com/docs/ios
- **Google Play Policies:** https://play.google.com/about/developer-content-policy/
- **App Store Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Zapstore GitHub:** https://github.com/zapstore

---

## Recommended Submission Order

For first-time app publishers, we recommend this order:

### 1. Zapstore First (Fastest)
- ✅ No approval process
- ✅ Get app in users' hands immediately
- ✅ Gather early feedback
- ✅ Build confidence before traditional stores

### 2. Google Play Second (Easier)
- ✅ Less strict than Apple
- ✅ One-time $25 fee
- ✅ 3-7 day review process
- ✅ Good for Android majority

### 3. Apple App Store Third (Most Strict)
- ✅ Highest quality bar
- ✅ $99/year fee
- ✅ Use TestFlight first for beta testing
- ✅ Address any issues before submission

---

## Timeline Estimates

**Zapstore:**
- Setup: 30 minutes
- Publishing: 5 minutes
- Live: Immediate

**Google Play:**
- Setup: 2-3 hours
- Review: 3-7 days
- Total: ~1 week

**Apple App Store:**
- Setup: 3-4 hours
- Review: 1-3 days
- Total: ~1 week (plus $99/year)

---

## Tips for Success

### All Platforms
- ✅ Test thoroughly before submission
- ✅ Use high-quality screenshots
- ✅ Write clear, compelling descriptions
- ✅ Provide accurate app information
- ✅ Have a privacy policy URL ready
- ✅ Respond quickly to review feedback

### Google Play Specific
- ✅ Complete all required sections before submitting
- ✅ Use CalVer versioning (e.g., 2025.02.14)
- ✅ Test on multiple Android versions
- ✅ Provide clear data safety information

### Apple App Store Specific
- ✅ Use TestFlight for beta testing first
- ✅ Provide demo account if login required
- ✅ Write detailed reviewer notes
- ✅ Follow iOS Human Interface Guidelines
- ✅ Test on latest iOS version

### Zapstore Specific
- ✅ Use descriptive tags for discoverability
- ✅ List all supported NIPs accurately
- ✅ Share on Nostr to reach audience
- ✅ Update frequently via Nostr

---

**Questions?** Visit https://www.traveltelly.com/admin/app-builder for interactive guides and examples.

**Good luck with your submissions! 🚀**
