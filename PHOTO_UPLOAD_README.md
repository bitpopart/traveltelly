# PhotoUpload Component

A React component for uploading up to 3 photos with automatic GPS extraction from the first photo's EXIF data.

## Features

- **Multi-photo upload**: Upload up to 3 photos (configurable)
- **Automatic GPS extraction**: Extracts GPS coordinates from the first photo's EXIF data
- **File validation**: Supports JPEG, PNG, WebP, TIFF, HEIC formats with 10MB size limit
- **Upload progress**: Real-time upload status with loading indicators
- **Preview**: Image previews with remove functionality
- **Error handling**: Comprehensive error handling and user feedback
- **Responsive design**: Works on desktop and mobile devices

## Usage

### Basic Usage

```tsx
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { type GPSCoordinates } from '@/lib/exifUtils';

function MyComponent() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [gps, setGps] = useState<GPSCoordinates | null>(null);

  return (
    <PhotoUpload
      onPhotosChange={setPhotos}
      onGPSExtracted={setGps}
      maxPhotos={3}
    />
  );
}
```

### Form Integration Example

```tsx
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { useNostrPublish } from '@/hooks/useNostrPublish';

function CreatePostForm() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);
  const { mutate: createEvent } = useNostrPublish();

  const handleSubmit = () => {
    // Get uploaded photo URLs
    const uploadedPhotos = photos.filter(photo => photo.uploaded && photo.url);
    const photoUrls = uploadedPhotos.map(photo => photo.url!);

    // Create content with photos
    let content = description;
    if (photoUrls.length > 0) {
      content += '\n\n' + photoUrls.join('\n');
    }

    // Create tags with GPS coordinates
    const tags: string[][] = [['title', title]];
    if (gpsCoordinates) {
      tags.push(['g', `${gpsCoordinates.latitude},${gpsCoordinates.longitude}`]);
    }

    // Add photo URLs as imeta tags (NIP-94)
    photoUrls.forEach(url => {
      tags.push(['imeta', `url ${url}`]);
    });

    createEvent({ kind: 1, content, tags });
  };

  return (
    <form onSubmit={handleSubmit}>
      <PhotoUpload
        onPhotosChange={setPhotos}
        onGPSExtracted={setGpsCoordinates}
        maxPhotos={3}
      />
      {/* Other form fields */}
    </form>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPhotosChange` | `(photos: UploadedPhoto[]) => void` | - | Callback when photos array changes |
| `onGPSExtracted` | `(coordinates: GPSCoordinates) => void` | - | Callback when GPS coordinates are extracted |
| `maxPhotos` | `number` | `3` | Maximum number of photos allowed |
| `className` | `string` | - | Additional CSS classes |

## Types

### UploadedPhoto

```tsx
interface UploadedPhoto {
  file: File;           // Original file object
  preview: string;      // Object URL for preview
  url?: string;         // Uploaded URL (after successful upload)
  uploading: boolean;   // Upload in progress
  uploaded: boolean;    // Upload completed successfully
  error?: string;       // Error message if upload failed
}
```

### GPSCoordinates

```tsx
interface GPSCoordinates {
  latitude: number;
  longitude: number;
}
```

## GPS Extraction

The component automatically extracts GPS coordinates from the first uploaded photo's EXIF data. This works with:

- **iPhone photos**: HEIC and JPEG formats with location services enabled
- **Camera photos**: JPEG and TIFF formats from cameras with GPS
- **Original files**: Not edited, compressed, or screenshots

### GPS Extraction Process

1. **File validation**: Checks if the file can contain EXIF data
2. **EXIF parsing**: Uses multiple parsing strategies for compatibility
3. **Coordinate extraction**: Handles various GPS data formats (DMS, decimal)
4. **Validation**: Verifies coordinates are within valid ranges
5. **Callback**: Triggers `onGPSExtracted` with coordinates

### Supported Formats for GPS

- ✅ JPEG/JPG (most common)
- ✅ TIFF/TIF
- ✅ HEIC (iPhone format)
- ✅ HEIF
- ❌ PNG (doesn't support EXIF)
- ❌ WebP (limited EXIF support)

## File Upload

Photos are uploaded using the Blossom protocol via the `useUploadFile` hook:

- **Storage**: Blossom servers (decentralized file storage)
- **Authentication**: Uses Nostr signer for authentication
- **Format**: Returns NIP-94 compatible tags
- **Size limit**: 10MB per file
- **Progress**: Real-time upload progress indicators

## Error Handling

The component handles various error scenarios:

- **Invalid file types**: Shows error for unsupported formats
- **File too large**: 10MB size limit with clear error message
- **Upload failures**: Retry functionality and error display
- **GPS extraction errors**: Graceful fallback with user feedback
- **No GPS data**: Clear messaging when photos lack location data

## Styling

The component uses Tailwind CSS and shadcn/ui components:

- **Responsive grid**: Adapts to screen size
- **Dark mode**: Full dark mode support
- **Hover states**: Interactive elements with hover effects
- **Loading states**: Skeleton loading and spinners
- **Status indicators**: Visual feedback for upload status

## Demo

Visit `/photo-upload-demo` to see the component in action with:

- **Standalone demo**: Basic component usage
- **Form integration**: Complete form example with Nostr publishing
- **Status monitoring**: Real-time GPS and upload status
- **Code examples**: Copy-paste ready code snippets

## Dependencies

- `@nostrify/nostrify`: File upload via Blossom
- `exifr`: EXIF data extraction
- `lucide-react`: Icons
- `@/components/ui/*`: shadcn/ui components
- `@/hooks/useUploadFile`: File upload hook
- `@/hooks/useToast`: Toast notifications

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **HEIC support**: Limited to Safari and some mobile browsers
- **File API**: Requires modern browser with File API support