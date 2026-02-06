# TravelTelly Native App Builder

## Overview

The **Native App Builder** (`/admin/app-builder`) is an admin tool for generating React Native + Expo mobile apps based on the **Olas architecture** by Pablo F7z.

## What is Olas?

**Olas** is a picture-first decentralized social media app built on Nostr with:

- **React Native + Expo** - Cross-platform mobile framework
- **NDK (Nostr Development Kit)** - Full Nostr protocol integration
- **Expo Camera** - In-app camera with filters and effects
- **Blossom Uploads** - Decentralized file storage (NIP-96)
- **Lightning Zaps** - Bitcoin micropayments (NIP-57)
- **Cashu Wallet** - Optional ecash integration
- **Offline Storage** - Expo SQLite for caching
- **Push Notifications** - Real-time Nostr event alerts

### Olas Repositories

- **Main (React Native)**: https://github.com/pablof7z/olas
- **iOS Native**: https://github.com/pablof7z/olas-ios

---

## Why Olas for TravelTelly?

TravelTelly's features map perfectly to Olas's architecture:

| TravelTelly Feature | Olas Equivalent |
|---------------------|-----------------|
| GPS-tagged reviews | Picture posts with geohash tags |
| Travel stories | Long-form articles (NIP-23) |
| Stock media marketplace | Media uploads with Lightning payments |
| Trip routes | Geo-tagged photo collections |
| Photo uploads with GPS | Expo Camera + EXIF extraction |
| Lightning payments | NIP-57 zaps + Cashu wallet |
| Nostr relays | NDK relay pool |
| Decentralized storage | Blossom servers (NIP-96) |

---

## Architecture Readiness

TravelTelly already has:

✅ **Nostr Integration** - Using Nostrify (web), can port to NDK (mobile)  
✅ **Blossom Uploads** - NIP-96 file servers configured  
✅ **Lightning Zaps** - NIP-57 payments implemented  
✅ **NIP-44 Encryption** - DM encryption ready  
✅ **Geohashing** - GPS coordinates for reviews/trips  

Still needed:

⚠️ **React Native Conversion** - Convert React components to RN  
⚠️ **Expo SDK Setup** - Camera, Image Picker, Maps, Notifications  
⚠️ **Offline Storage** - Expo SQLite for event caching  
⚠️ **Push Notifications** - FCM/APNs integration  
⚠️ **NIP-55 Signer** - Remote signing with Amber/nsecBunker  

---

## Generated Project Structure

The App Builder generates an Expo project with this structure:

```
traveltelly-mobile/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Bottom tab navigation
│   │   ├── index.tsx      # Home feed
│   │   ├── explore.tsx    # Discover content
│   │   ├── camera.tsx     # Photo capture
│   │   ├── wallet.tsx     # Lightning/Cashu
│   │   └── profile.tsx    # User profile
│   ├── review/[naddr].tsx # Review detail
│   ├── story/[naddr].tsx  # Story detail
│   └── trip/[naddr].tsx   # Trip detail
├── components/            # Reusable UI components
├── hooks/                 # NDK hooks (useNDK, useAuthor, etc.)
├── lib/                   # Utilities (geohash, nip19, etc.)
├── stores/                # Zustand state management
├── theme/                 # TailwindCSS + NativeWind config
├── app.json               # Expo configuration
├── eas.json               # Expo Application Services config
├── package.json           # Dependencies (NDK, Expo modules)
└── README.md              # Setup instructions
```

---

## Key Dependencies (from Olas)

### Nostr Protocol
```json
{
  "@nostr-dev-kit/ndk": "^2.14.18",
  "@nostr-dev-kit/ndk-hooks": "^1.1.44",
  "@nostr-dev-kit/ndk-mobile": "^0.8.12",
  "nostr-tools": "^2.12.0"
}
```

### Expo Modules
```json
{
  "expo-camera": "~16.1.6",
  "expo-image-picker": "~16.1.4",
  "expo-image-manipulator": "~13.1.7",
  "expo-location": "~17.1.6",
  "expo-maps": "~0.10.0",
  "expo-notifications": "~0.31.2",
  "expo-sqlite": "~15.2.10",
  "expo-secure-store": "~14.2.3",
  "expo-nip55": "^0.1.7"
}
```

### Image Processing
```json
{
  "react-native-blurhash": "^2.1.1",
  "react-native-compressor": "^1.11.0",
  "@shopify/react-native-skia": "v2.0.0-next.4",
  "react-native-color-matrix-image-filters": "^7.0.2"
}
```

### Bitcoin/Lightning
```json
{
  "@cashu/cashu-ts": "^2.4.2",
  "react-native-qrcode-svg": "^6.3.15"
}
```

### UI Framework
```json
{
  "nativewind": "^4.1.23",
  "tailwindcss": "^3.4.17",
  "react-native-reanimated": "~3.17.5",
  "@shopify/flash-list": "1.7.6"
}
```

---

## Building for Android

### Prerequisites
1. **Google Play Console Account** ($25 one-time fee)
2. **EAS CLI** installed: `npm install -g eas-cli`
3. **Expo Account** (free)

### Steps

1. **Login to EAS**
   ```bash
   eas login
   ```

2. **Configure Project**
   ```bash
   eas build:configure
   ```

3. **Build AAB (for Play Store)**
   ```bash
   eas build --platform android --profile production
   ```

4. **Build APK (for testing)**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

---

## Building for iOS

### Prerequisites
1. **Apple Developer Account** ($99/year)
2. **macOS with Xcode** (for local builds, optional)
3. **EAS CLI** installed

### Steps

1. **Configure iOS Bundle ID**
   ```bash
   eas build:configure
   ```

2. **Build for TestFlight**
   ```bash
   eas build --platform ios --profile production
   ```

3. **Build for Simulator (macOS only)**
   ```bash
   eas build --platform ios --profile development --local
   ```

4. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

---

## Development Workflow

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Expo Dev Server**
   ```bash
   npx expo start
   ```

3. **Run on iOS Simulator** (macOS only)
   ```bash
   npx expo run:ios
   ```

4. **Run on Android Emulator**
   ```bash
   npx expo run:android
   ```

5. **Scan QR Code** with Expo Go app for physical device testing

### Converting React Components to React Native

Key differences between web and mobile:

| Web (React) | Mobile (React Native) |
|-------------|----------------------|
| `<div>` | `<View>` |
| `<span>`, `<p>` | `<Text>` |
| `<img>` | `<Image>` or `<expo-image>` |
| `<button>` | `<Pressable>` or `<Button>` |
| `<input>` | `<TextInput>` |
| CSS classes | StyleSheet or NativeWind |
| `onClick` | `onPress` |
| React Router | Expo Router |
| `fetch()` | Same (works natively) |

### Example Conversion

**Web (React):**
```tsx
<div className="p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Hello</h1>
  <button onClick={handleClick}>Click me</button>
</div>
```

**Mobile (React Native + NativeWind):**
```tsx
<View className="p-4 bg-white rounded-lg shadow">
  <Text className="text-2xl font-bold">Hello</Text>
  <Pressable onPress={handleClick}>
    <Text className="text-blue-600">Click me</Text>
  </Pressable>
</View>
```

---

## NDK Integration

### Basic Setup

```typescript
import NDK from '@nostr-dev-kit/ndk';
import { NDKProvider } from '@nostr-dev-kit/ndk-hooks';

const ndk = new NDK({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol'
  ]
});

export default function App() {
  return (
    <NDKProvider ndk={ndk}>
      {/* Your app */}
    </NDKProvider>
  );
}
```

### Hooks

```typescript
import { useNDK } from '@nostr-dev-kit/ndk-hooks';

function MyComponent() {
  const { ndk } = useNDK();
  
  // Fetch events
  const events = await ndk.fetchEvents({
    kinds: [30023], // NIP-23 articles
    limit: 20
  });
  
  // Publish event
  const event = new NDKEvent(ndk);
  event.kind = 1;
  event.content = "Hello Nostr!";
  await event.publish();
}
```

---

## Camera Integration

```typescript
import { Camera } from 'expo-camera';
import { useState } from 'react';

function CameraScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      // Upload to Blossom, extract GPS, etc.
    }
  };

  return (
    <Camera 
      ref={ref => setCamera(ref)} 
      style={{ flex: 1 }}
    >
      <Pressable onPress={takePicture}>
        <Text>Take Photo</Text>
      </Pressable>
    </Camera>
  );
}
```

---

## Testing

### E2E Testing with Maestro

Olas includes Maestro tests. Example:

```yaml
# .maestro/flows/post_review.yaml
appId: com.traveltelly.app
---
- launchApp
- tapOn: "Camera"
- tapOn: "Capture"
- inputText: "Amazing sunset at Grand Canyon!"
- tapOn: "Add Location"
- tapOn: "Post Review"
- assertVisible: "Review posted successfully"
```

Run tests:
```bash
maestro test .maestro/flows
```

---

## App Store Submission Checklist

### Android (Google Play)

- [ ] Create Google Play Console account ($25)
- [ ] Configure app details (name, description, category)
- [ ] Generate AAB with `eas build`
- [ ] Create app listing with screenshots
- [ ] Add privacy policy URL
- [ ] Submit for review

### iOS (Apple App Store)

- [ ] Join Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer portal
- [ ] Generate IPA with `eas build`
- [ ] Upload to TestFlight for beta testing
- [ ] Configure App Store Connect metadata
- [ ] Add privacy policy and screenshots
- [ ] Submit for review

---

## Resources

### Olas
- **Main Repo**: https://github.com/pablof7z/olas
- **iOS Native**: https://github.com/pablof7z/olas-ios

### Expo
- **Documentation**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/

### NDK
- **NDK GitHub**: https://github.com/nostr-dev-kit/ndk
- **NDK Docs**: https://ndk.fyi

### Nostr
- **NIPs**: https://github.com/nostr-protocol/nips
- **Nostr Tools**: https://github.com/nbd-wtf/nostr-tools

---

## Support

For questions or issues with the Native App Builder:

1. Check the generated project's `README.md`
2. Review Olas source code as reference
3. Consult Expo documentation
4. Ask in TravelTelly admin panel

---

**Built with ❤️ using the Olas architecture**
