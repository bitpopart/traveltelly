# TravelTelly Marketplace - Troubleshooting Guide

## Issues Fixed

### 1. Multiple Images Not Showing

**Problem**: When uploading multiple images to a media listing, only the first image or no images were displayed in the preview.

**Root Causes**:
- Limited image tag detection (only checking 'image' tags)
- Missing support for various image tag formats
- Duplicate images not being filtered
- Content field image URLs not being parsed properly

**Solutions Implemented**:

#### Enhanced Image Tag Detection
```typescript
// Before: Only checked basic image tags
const imageTagNames = ['image', 'img', 'photo', 'picture', 'url'];

// After: Comprehensive image tag support
const imageTagNames = ['image', 'img', 'photo', 'picture', 'url', 'imeta'];
```

#### Improved Content Parsing
```typescript
// Enhanced regex for URL detection in content
const urlRegex = /https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp|svg|tiff|tif|heic|heif|bmp)/gi;

// Remove duplicates from combined sources
const allImages = [...new Set([...images, ...contentImages])].filter(Boolean);
```

#### Debug Information Added
- Development mode debug panel showing:
  - Number of images found
  - All image URLs
  - Image tags in the event
  - Current image index

### 2. Edit Functionality Issues

**Problem**: Users couldn't properly edit their media listings, and changes weren't reflected immediately.

**Root Causes**:
- Page reload instead of proper data refetch
- Image tags not being preserved during edits
- Poor user feedback during edit operations

**Solutions Implemented**:

#### Proper Data Refetch
```typescript
// Before: Crude page reload
window.location.reload();

// After: Elegant data refetch
const { refetch } = useMarketplaceProducts();
onUpdate={() => refetch()}
```

#### Enhanced Image Preservation
```typescript
// Preserve all image-related tags during edit
...product.event.tags.filter(([name]) => 
  ['image', 'img', 'photo', 'picture', 'url', 'imeta'].includes(name)
)
```

#### Improved Edit Dialog
- Visual display of current images
- Better form validation
- Real-time preview updates
- Toast notifications for user feedback

### 3. Image Navigation and Display

**Problem**: Image navigation could break with multiple images, and error handling was poor.

**Solutions Implemented**:

#### Bounds Checking
```typescript
// Ensure currentImageIndex stays within bounds
React.useEffect(() => {
  if (product?.images.length && currentImageIndex >= product.images.length) {
    setCurrentImageIndex(0);
  }
}, [product?.images.length, currentImageIndex]);
```

#### Better Error Handling
```typescript
// Graceful image loading failure handling
<img
  onError={(e) => {
    console.error('Failed to load image:', imageUrl);
    e.currentTarget.style.display = 'none';
    e.currentTarget.nextElementSibling?.classList.remove('hidden');
  }}
/>
```

## How to Test Multiple Image Upload

### 1. Create a New Media Listing
1. Go to `/marketplace`
2. Click "Upload Media"
3. Fill in the form details
4. In the "Media Files & Preview" section, upload multiple images (up to 5)
5. Submit the listing

### 2. Verify Multiple Images Display
1. Click on the thumbnail of your newly created listing
2. You should see:
   - Image navigation arrows (if more than 1 image)
   - Image counter (e.g., "2 / 3")
   - Thumbnail strip below the main image
   - All images should be navigable

### 3. Test Edit Functionality
1. While viewing your own media preview, click "Edit Media"
2. The edit dialog should show:
   - Visual thumbnails of all current images
   - All form fields pre-populated
   - Ability to modify title, description, price, etc.
3. Make changes and save
4. Verify changes appear immediately without page reload

## Debug Information

### Development Mode Features
When running in development mode (`NODE_ENV=development`), the media preview page shows a debug panel with:

- **Product ID**: Unique identifier for the listing
- **Event ID**: Nostr event ID
- **Images found**: Total number of images detected
- **Image URLs**: Complete list of all image URLs
- **Image tags in event**: All image-related tags from the Nostr event
- **Current image index**: Which image is currently displayed
- **Ownership status**: Whether you own this media

### Console Logging
The application logs detailed information to the browser console:

```
🖼️ MediaPreview Debug - Product images: [array of URLs]
🖼️ MediaPreview Debug - Product event tags: [all event tags]
🔍 Marketplace Debug - Total events found: X
🔍 All image-related tags in sample: [image tags]
```

## Common Issues and Solutions

### Issue: "No images showing despite upload"
**Check**:
1. Open browser console and look for image loading errors
2. Verify the debug panel shows the correct number of images
3. Check if image URLs are accessible (try opening them directly)

**Solution**: Images might be uploaded to a server that's temporarily unavailable. Try re-uploading or using a different image hosting service.

### Issue: "Edit button not showing"
**Check**:
1. Ensure you're logged in with the same account that created the media
2. Check the debug panel to confirm ownership status

**Solution**: The edit button only appears for media you own. Make sure you're logged in with the correct Nostr account.

### Issue: "Changes not saving"
**Check**:
1. Look for error messages in toast notifications
2. Check browser console for network errors
3. Verify your Nostr signer is working properly

**Solution**: Try refreshing the page and attempting the edit again. Ensure your Nostr extension/signer is connected and functioning.

### Issue: "Images not navigating properly"
**Check**:
1. Verify multiple images are actually uploaded (check debug panel)
2. Look for JavaScript errors in console

**Solution**: The navigation arrows only appear when there are multiple images. If you see the arrows but navigation doesn't work, try refreshing the page.

## Technical Implementation Details

### Image Storage
- Images are uploaded via the `useUploadFile` hook
- URLs are stored as `['image', url]` tags in NIP-99 events
- Multiple images create multiple image tags

### Event Structure
```json
{
  "kind": 30402,
  "tags": [
    ["d", "product_id"],
    ["title", "Product Title"],
    ["image", "https://example.com/image1.jpg"],
    ["image", "https://example.com/image2.jpg"],
    ["image", "https://example.com/image3.jpg"]
  ]
}
```

### Data Flow
1. **Upload**: PhotoUpload → CreateProductDialog → Nostr Event
2. **Display**: Nostr Query → parseMarketplaceProduct → MediaPreview
3. **Edit**: EditMediaDialog → Updated Nostr Event → Data Refetch

This comprehensive fix ensures that multiple image uploads work correctly, edit functionality is robust, and users get proper feedback throughout the process.