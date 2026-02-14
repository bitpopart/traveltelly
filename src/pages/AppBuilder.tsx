import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { nip19 } from 'nostr-tools';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Download,
  Upload,
  Package,
  Play,
  Apple,
  Code,
  Github,
  ExternalLink,
  Info,
  Terminal,
  FileCode2,
  Wrench,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';

export default function AppBuilder() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Admin check
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // Configuration
  const [appName, setAppName] = useState('TravelTelly');
  const [appId, setAppId] = useState('com.traveltelly.app');
  const [appDescription, setAppDescription] = useState('Discover and share travel experiences with GPS-tagged reviews, stories, and stock photography on a decentralized platform.');

  if (!isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                This page is only accessible to the Traveltelly admin.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Admin Panel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin Panel
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-8 h-8 text-orange-500" />
              <h1 className="text-4xl font-bold">App Builder</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Build Android and iOS apps using Capacitor
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertTitle>React + Capacitor = Native Apps</AlertTitle>
            <AlertDescription>
              Traveltelly is a React web application. Capacitor converts your web app into native Android and iOS applications.
              This guide is based on the <a href="https://gitlab.com/chad.curtis/espy" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Espy project</a> workflow.
            </AlertDescription>
          </Alert>

          {/* Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                App Configuration
              </CardTitle>
              <CardDescription>
                Configure your app details before building
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="appName">App Name</Label>
                  <Input
                    id="appName"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="TravelTelly"
                  />
                </div>
                <div>
                  <Label htmlFor="appId">App ID (Bundle Identifier)</Label>
                  <Input
                    id="appId"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="com.traveltelly.app"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reverse domain notation (e.g., com.yourcompany.appname)
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="description">App Description</Label>
                <Textarea
                  id="description"
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Build Tabs */}
          <Tabs defaultValue="android" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iOS
              </TabsTrigger>
            </TabsList>

            {/* Android Tab */}
            <TabsContent value="android" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-600" />
                    Android Build Guide
                  </CardTitle>
                  <CardDescription>
                    Build signed APK for Android devices and publish to Zapstore
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequisites */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Prerequisites
                    </h3>
                    <div className="space-y-2 ml-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Node.js & npm installed</p>
                          <p className="text-sm text-muted-foreground">Required for building the web assets</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Android Studio installed</p>
                          <p className="text-sm text-muted-foreground">Download from <a href="https://developer.android.com/studio" target="_blank" rel="noopener noreferrer" className="underline">developer.android.com/studio</a></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Java JDK 17+ installed</p>
                          <p className="text-sm text-muted-foreground">Comes with Android Studio or install separately</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Capacitor CLI installed</p>
                          <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">npm install -D @capacitor/cli @capacitor/core @capacitor/android</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Steps */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Initial Setup
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">1. Create Capacitor Config</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">capacitor.config.ts</code> in project root:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${appId}',
  appName: '${appName}',
  webDir: 'dist',
  server: {
    hostname: 'traveltelly.com',
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#ffffff'
  }
};

export default config;`}
                        </pre>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Initialize Android Platform</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npx cap add android</code>
                        <p className="text-sm text-muted-foreground mt-1">This creates the <code className="bg-muted px-1 rounded">android/</code> directory</p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Generate App Icons</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">scripts/generate-icons.sh</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`#!/bin/bash
# Generate Android icons from your logo
# Place your logo as public/icon.png (1024x1024)

npx @capacitor/assets generate --android`}
                        </pre>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">bash scripts/generate-icons.sh</code>
                      </div>
                    </div>
                  </div>

                  {/* Keystore Setup */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileCode2 className="w-5 h-5" />
                      Create Signing Keystore
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">1. Generate Keystore</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`keytool -genkey -v -keystore android/app/my-upload-key.keystore \\
  -alias upload -keyalg RSA -keysize 2048 -validity 10000`}
                        </pre>
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Save the password securely! You'll need it for every build.
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Create Key Properties File</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">android/key.properties</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=upload
storeFile=my-upload-key.keystore`}
                        </pre>
                        <Alert className="mt-2" variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-sm">
                            Never commit <code className="bg-muted px-1 rounded">key.properties</code> to git! Add it to <code className="bg-muted px-1 rounded">.gitignore</code>
                          </AlertDescription>
                        </Alert>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Update build.gradle</p>
                        <p className="text-sm text-muted-foreground mb-2">Add to <code className="bg-muted px-1 rounded">android/app/build.gradle</code> (before android block):</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Build Script */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Build APK Script
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">Create <code className="bg-muted px-1 rounded">scripts/build-apk.sh</code></p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
{`#!/bin/bash
set -e

echo "🔨 Building TravelTelly APK"

# CalVer versioning
VERSION_CODE=$(date +%Y%m%d)
VERSION_NAME=$(date +%Y.%m.%d)

# Update version in build.gradle
sed -i "s/versionCode [0-9]*/versionCode \${VERSION_CODE}/" android/app/build.gradle
sed -i "s/versionName \\"[^\\"]*\\"/versionName \\"\${VERSION_NAME}\\"/" android/app/build.gradle

# Build web assets
echo "Building web assets..."
npm run build

# Generate icons
echo "Generating Android icons..."
bash scripts/generate-icons.sh

# Sync to Capacitor
echo "Syncing to Capacitor..."
npx cap sync android

# Build signed APK
echo "Building signed release APK..."
cd android && ./gradlew assembleRelease && cd ..

# Copy APK to downloads
mkdir -p downloads
cp android/app/build/outputs/apk/release/app-release.apk downloads/traveltelly.apk

echo "✅ APK built successfully!"
echo "Location: downloads/traveltelly.apk"
ls -lh downloads/traveltelly.apk`}
                        </pre>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Make it executable and run</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">chmod +x scripts/build-apk.sh</code>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">./scripts/build-apk.sh</code>
                      </div>

                      <div>
                        <p className="font-medium mb-2">Add to package.json scripts</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`"scripts": {
  "build:apk": "bash scripts/build-apk.sh",
  "publish:zapstore": "bash scripts/publish-zapstore.sh"
}`}
                        </pre>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">npm run build:apk</code>
                      </div>
                    </div>
                  </div>

                  {/* Zapstore Publishing */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      Publish to Zapstore
                    </h3>
                    <div className="space-y-4 ml-7">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>What is Zapstore?</AlertTitle>
                        <AlertDescription className="text-sm">
                          Zapstore is a decentralized app store built on Nostr. Apps are published as Nostr events, requiring no approval process. Users install apps directly from your Nostr identity.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <p className="font-medium mb-2">1. Install Go (if not already installed)</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Visit <a href="https://go.dev/dl/" target="_blank" rel="noopener noreferrer" className="underline">go.dev/dl</a></li>
                          <li>Download installer for your OS</li>
                          <li>Verify installation: <code className="bg-muted px-1 rounded">go version</code></li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Install Zapstore Publisher (zsp)</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">go install github.com/zapstore/zsp@latest</code>
                        <p className="text-sm text-muted-foreground mt-1">The <code className="bg-muted px-1 rounded">zsp</code> command should now be available in your terminal</p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Ensure APK is Built</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npm run build:apk</code>
                        <p className="text-sm text-muted-foreground mt-1">This creates <code className="bg-muted px-1 rounded">downloads/traveltelly.apk</code></p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Create zapstore.yaml Configuration</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">zapstore.yaml</code> in your project root:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto max-h-96">
{`# Source code repository
repository: https://github.com/bitpopart/traveltelly

# Use local APK from downloads directory
release_source: ./downloads/traveltelly.apk

# APP METADATA
name: ${appName}

summary: Travel reviews, stories & stock media

description: |
  ${appDescription}

tags:
  - nostr
  - travel
  - photography
  - reviews
  - marketplace

license: MIT

website: https://traveltelly.com

# NOSTR-SPECIFIC
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
  - "99"  # Classified listings`}
                        </pre>
                      </div>

                      <div>
                        <p className="font-medium mb-2">5. Install Nostr Browser Extension</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Install a NIP-07 signer extension (Alby, nos2x, Flamingo, etc.)</li>
                          <li>Make sure you're logged in with your publishing account</li>
                          <li><strong>Important:</strong> Use the same npub you want listed as the app publisher</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">6. Create Publish Script (Optional but Recommended)</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">scripts/publish-zapstore.sh</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`#!/bin/bash
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
echo "View at: https://zap.store"`}
                        </pre>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">chmod +x scripts/publish-zapstore.sh</code>
                      </div>

                      <div>
                        <p className="font-medium mb-2">7. Add npm Script</p>
                        <p className="text-sm text-muted-foreground mb-2">Add to <code className="bg-muted px-1 rounded">package.json</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`"scripts": {
  "build:apk": "bash scripts/build-apk.sh",
  "publish:zapstore": "bash scripts/publish-zapstore.sh"
}`}
                        </pre>
                      </div>

                      <div>
                        <p className="font-medium mb-2">8. Publish to Zapstore</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npm run publish:zapstore</code>
                        <p className="text-sm text-muted-foreground mt-2">Or manually:</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">SIGN_WITH=browser zsp publish zapstore.yaml</code>
                      </div>

                      <div>
                        <p className="font-medium mb-2">9. Sign with Browser Extension</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>zsp will open your browser automatically</li>
                          <li>Your Nostr extension will prompt for signature</li>
                          <li>Approve the signature request</li>
                          <li>The event will be published to Zapstore relays</li>
                          <li>You'll see confirmation in terminal</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">10. Verify Publication</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Visit <a href="https://zap.store" target="_blank" rel="noopener noreferrer" className="underline">zap.store</a></li>
                          <li>Search for "{appName}"</li>
                          <li>Or search by your npub to see all your published apps</li>
                          <li>App should appear within minutes</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">11. Share Your App</p>
                        <p className="text-sm text-muted-foreground mb-2">Users can install via:</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Zapstore app:</strong> Search for "{appName}"</li>
                          <li><strong>Direct link:</strong> Share your app's Zapstore URL</li>
                          <li><strong>Nostr:</strong> Post about your app with #zapstore tag</li>
                        </ul>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Updating Your App</AlertTitle>
                        <AlertDescription className="text-sm">
                          To publish updates, rebuild your APK with a new version code, then run <code className="bg-muted px-1 rounded">npm run publish:zapstore</code> again. Zapstore will automatically detect the new version.
                        </AlertDescription>
                      </Alert>

                      <Alert className="mt-4">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Benefits of Zapstore</AlertTitle>
                        <AlertDescription className="text-sm space-y-1">
                          <p>✅ No approval process - publish instantly</p>
                          <p>✅ No registration fees - completely free</p>
                          <p>✅ Decentralized - no single point of failure</p>
                          <p>✅ Censorship resistant - published on Nostr</p>
                          <p>✅ Updates propagate automatically via Nostr relays</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  {/* Testing */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Testing Your APK
                    </h3>
                    <div className="space-y-2 ml-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Enable USB Debugging on your Android device</p>
                          <p className="text-sm text-muted-foreground">Settings → Developer Options → USB Debugging</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Install via ADB</p>
                          <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">adb install downloads/traveltelly.apk</code>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Or transfer APK to device and install manually</p>
                          <p className="text-sm text-muted-foreground">You may need to enable "Install from Unknown Sources"</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Play Store Submission */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      Submit to Google Play Store
                    </h3>
                    <div className="space-y-4 ml-7">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Note:</strong> Google Play requires an AAB (Android App Bundle) file, not an APK. You'll need to generate an AAB for Play Store submission.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <p className="font-medium mb-2">1. Build AAB Instead of APK</p>
                        <p className="text-sm text-muted-foreground mb-2">Update your build script to generate AAB:</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">cd android && ./gradlew bundleRelease && cd ..</code>
                        <p className="text-sm text-muted-foreground mt-1">AAB location: <code className="bg-muted px-1 rounded">android/app/build/outputs/bundle/release/app-release.aab</code></p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Create Google Play Console Account</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Visit <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="underline">Google Play Console</a></li>
                          <li>Pay one-time $25 registration fee</li>
                          <li>Complete account setup and verification</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Create Your App</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Click "Create app" in Play Console</li>
                          <li>Enter app name: <strong>{appName}</strong></li>
                          <li>Select default language</li>
                          <li>Choose "App" (not "Game")</li>
                          <li>Select "Free" or "Paid"</li>
                          <li>Agree to declarations and create</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Set Up App Store Listing</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Navigate to "Main store listing"</li>
                          <li>Add short description (80 chars max)</li>
                          <li>Add full description (4000 chars max)</li>
                          <li>Upload app icon (512x512 PNG)</li>
                          <li>Upload feature graphic (1024x500 PNG)</li>
                          <li>Upload screenshots (at least 2, up to 8)</li>
                          <li>Choose app category: "Travel & Local"</li>
                          <li>Add contact email and privacy policy URL</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">5. Content Rating</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to "Content rating" section</li>
                          <li>Click "Start questionnaire"</li>
                          <li>Select category: "Social"</li>
                          <li>Answer content questions honestly</li>
                          <li>Submit questionnaire to get rating</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">6. Upload App Bundle</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to "Production" → "Releases"</li>
                          <li>Click "Create new release"</li>
                          <li>Upload your AAB file</li>
                          <li>Add release name (e.g., "1.0.0")</li>
                          <li>Add release notes describing your app</li>
                          <li>Save and continue</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">7. Complete Required Sections</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>App content:</strong> Privacy policy, ads declaration, target audience</li>
                          <li><strong>Data safety:</strong> Describe data collection and usage</li>
                          <li><strong>App access:</strong> Add demo accounts if login required</li>
                          <li><strong>Pricing & distribution:</strong> Select countries and set free/paid</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">8. Submit for Review</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Review all sections - ensure all have green checkmarks</li>
                          <li>Click "Send X items for review"</li>
                          <li>Confirm submission</li>
                          <li>Review typically takes 3-7 days</li>
                          <li>You'll receive email updates on review status</li>
                        </ul>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>After Approval</AlertTitle>
                        <AlertDescription className="text-sm">
                          Once approved, your app will be published to Google Play Store. Users can find it by searching "{appName}" or via direct link.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Resources & Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a 
                    href="https://capacitorjs.com/docs/android" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Capacitor Android Documentation
                  </a>
                  <a 
                    href="https://gitlab.com/chad.curtis/espy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Espy - Reference Nostr App Project
                  </a>
                  <a 
                    href="https://zap.store" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Zapstore - Nostr App Store
                  </a>
                  <a 
                    href="https://developer.android.com/studio/publish/app-signing" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Android App Signing Documentation
                  </a>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Tab */}
            <TabsContent value="ios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    iOS Build Guide
                  </CardTitle>
                  <CardDescription>
                    Build signed IPA for iOS devices and TestFlight
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequisites */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Prerequisites
                    </h3>
                    <div className="space-y-2 ml-7">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">macOS computer</p>
                          <p className="text-sm text-muted-foreground">Required for Xcode and iOS builds</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Xcode installed</p>
                          <p className="text-sm text-muted-foreground">Download from Mac App Store (free)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Apple Developer Account</p>
                          <p className="text-sm text-muted-foreground">$99/year - <a href="https://developer.apple.com/programs/" target="_blank" rel="noopener noreferrer" className="underline">developer.apple.com/programs</a></p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">CocoaPods installed</p>
                          <code className="text-sm bg-muted px-2 py-1 rounded block mt-1">sudo gem install cocoapods</code>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Setup Steps */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Initial Setup
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">1. Initialize iOS Platform</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npx cap add ios</code>
                        <p className="text-sm text-muted-foreground mt-1">This creates the <code className="bg-muted px-1 rounded">ios/</code> directory</p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Update Capacitor Config</p>
                        <p className="text-sm text-muted-foreground mb-2">Add iOS config to <code className="bg-muted px-1 rounded">capacitor.config.ts</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`const config: CapacitorConfig = {
  // ... existing config ...
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#ffffff'
  }
};`}
                        </pre>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Generate App Icons</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npx @capacitor/assets generate --ios</code>
                        <p className="text-sm text-muted-foreground mt-1">Place your logo as <code className="bg-muted px-1 rounded">public/icon.png</code> (1024x1024)</p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Build and Sync</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npm run build</code>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">npx cap sync ios</code>
                      </div>

                      <div>
                        <p className="font-medium mb-2">5. Open in Xcode</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">npx cap open ios</code>
                      </div>
                    </div>
                  </div>

                  {/* Xcode Configuration */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Xcode Configuration
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">1. Set Bundle Identifier</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Select your project in the navigator</li>
                          <li>Select the target (App)</li>
                          <li>Go to "General" tab</li>
                          <li>Set Bundle Identifier: <code className="bg-muted px-1 rounded">{appId}</code></li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Configure Signing</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to "Signing & Capabilities" tab</li>
                          <li>Select your Team (Apple Developer account)</li>
                          <li>Enable "Automatically manage signing"</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Set App Name & Version</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Display Name: <code className="bg-muted px-1 rounded">{appName}</code></li>
                          <li>Version: 1.0.0</li>
                          <li>Build: 1</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Set Deployment Target</p>
                        <p className="text-sm text-muted-foreground">Minimum iOS version: 13.0 or higher</p>
                      </div>
                    </div>
                  </div>

                  {/* Building */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Terminal className="w-5 h-5" />
                      Building for Release
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">1. Create Archive</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>In Xcode menu: Product → Archive</li>
                          <li>Wait for build to complete</li>
                          <li>Organizer window will open automatically</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Distribute to TestFlight</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Click "Distribute App" in Organizer</li>
                          <li>Select "App Store Connect"</li>
                          <li>Choose "Upload"</li>
                          <li>Follow the prompts to upload</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. TestFlight Beta Testing</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="underline">App Store Connect</a></li>
                          <li>Select your app</li>
                          <li>Go to TestFlight tab</li>
                          <li>Add internal or external testers</li>
                          <li>Testers will receive TestFlight invite</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Submit to App Store</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>After testing, go to App Store tab</li>
                          <li>Create new version</li>
                          <li>Fill in app information and screenshots</li>
                          <li>Submit for review</li>
                          <li>Review typically takes 1-3 days</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Build Script */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileCode2 className="w-5 h-5" />
                      Automated Build Script (Optional)
                    </h3>
                    <div className="space-y-4 ml-7">
                      <div>
                        <p className="font-medium mb-2">Create <code className="bg-muted px-1 rounded">scripts/build-ios.sh</code></p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`#!/bin/bash
set -e

echo "🍎 Building TravelTelly iOS App"

# Build web assets
echo "Building web assets..."
npm run build

# Generate icons
echo "Generating iOS icons..."
npx @capacitor/assets generate --ios

# Sync to Capacitor
echo "Syncing to Capacitor..."
npx cap sync ios

# Open in Xcode
echo "Opening Xcode..."
npx cap open ios

echo "✅ Ready to build in Xcode!"
echo "Use Product → Archive to create release build"`}
                        </pre>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">chmod +x scripts/build-ios.sh</code>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">./scripts/build-ios.sh</code>
                      </div>
                    </div>
                  </div>

                  {/* App Store Submission */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Upload className="w-5 h-5 text-blue-600" />
                      Submit to Apple App Store
                    </h3>
                    <div className="space-y-4 ml-7">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Prerequisites:</strong> You must have created an archive in Xcode (Product → Archive) before you can submit to the App Store.
                        </AlertDescription>
                      </Alert>

                      <div>
                        <p className="font-medium mb-2">1. Join Apple Developer Program</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Visit <a href="https://developer.apple.com/programs/" target="_blank" rel="noopener noreferrer" className="underline">Apple Developer Program</a></li>
                          <li>Enroll for $99/year</li>
                          <li>Complete verification (can take 24-48 hours)</li>
                          <li>Sign in to <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="underline">App Store Connect</a></li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Create App Record in App Store Connect</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Go to <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="underline">App Store Connect</a></li>
                          <li>Click "My Apps" → "+" → "New App"</li>
                          <li>Select "iOS"</li>
                          <li>Enter app name: <strong>{appName}</strong></li>
                          <li>Select primary language</li>
                          <li>Enter Bundle ID: <code className="bg-muted px-1 rounded">{appId}</code></li>
                          <li>Enter SKU (unique identifier, e.g., "traveltelly-001")</li>
                          <li>Select "Full Access" for user access</li>
                          <li>Click "Create"</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">3. Upload Build via Xcode</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>In Xcode Organizer, select your archive</li>
                          <li>Click "Distribute App"</li>
                          <li>Select "App Store Connect"</li>
                          <li>Choose "Upload"</li>
                          <li>Select distribution certificate and provisioning profile</li>
                          <li>Review and click "Upload"</li>
                          <li>Wait for processing (10-30 minutes)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">4. Add App Information</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>In App Store Connect, go to your app</li>
                          <li><strong>Subtitle:</strong> Short tagline (30 chars)</li>
                          <li><strong>Description:</strong> Full app description (4000 chars max)</li>
                          <li><strong>Keywords:</strong> Search keywords (100 chars, comma-separated)</li>
                          <li><strong>Support URL:</strong> https://traveltelly.com</li>
                          <li><strong>Marketing URL:</strong> (optional) https://traveltelly.com</li>
                          <li><strong>Privacy Policy URL:</strong> Required URL to your privacy policy</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">5. Upload Screenshots</p>
                        <p className="text-sm text-muted-foreground mb-2">Required sizes (you can use Xcode Simulator):</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>6.7" Display</strong> (iPhone 15 Pro Max): 1290 x 2796 pixels (3-10 images)</li>
                          <li><strong>5.5" Display</strong> (iPhone 8 Plus): 1242 x 2208 pixels (3-10 images)</li>
                          <li>Optionally add iPad screenshots if supporting tablets</li>
                          <li>First 3 screenshots are shown in search results</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">6. App Icon</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Upload 1024x1024 PNG (no transparency)</li>
                          <li>This is your App Store icon (separate from app icon in bundle)</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">7. Age Rating</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Click "Edit" next to Age Rating</li>
                          <li>Answer questionnaire about content</li>
                          <li>Review assigned rating and confirm</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">8. Pricing and Availability</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Select "Free" or set price tier</li>
                          <li>Choose availability date (can be "Make available immediately")</li>
                          <li>Select countries/regions for distribution</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">9. App Privacy</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Click "Set Up App Privacy"</li>
                          <li>Declare data collection practices</li>
                          <li>Specify data types collected (location, photos, etc.)</li>
                          <li>Explain how data is used</li>
                          <li>Indicate if data is linked to user identity</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">10. Select Build and Submit</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Scroll to "Build" section</li>
                          <li>Click "+" to select your uploaded build</li>
                          <li>Choose the build from the list</li>
                          <li>Add "What's New in This Version" notes</li>
                          <li>Review all sections for completeness</li>
                          <li>Click "Add for Review"</li>
                          <li>Answer additional questions if prompted</li>
                          <li>Click "Submit for Review"</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-medium mb-2">11. Review Process</p>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li><strong>Waiting for Review:</strong> Can take 1-3 days</li>
                          <li><strong>In Review:</strong> Usually 24-48 hours</li>
                          <li><strong>Rejected:</strong> Address issues and resubmit</li>
                          <li><strong>Ready for Sale:</strong> App is live on App Store!</li>
                          <li>You'll receive email notifications at each stage</li>
                        </ul>
                      </div>

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertTitle>Common Rejection Reasons</AlertTitle>
                        <AlertDescription className="text-sm space-y-1">
                          <p>• Crashes or bugs during testing</p>
                          <p>• Missing privacy policy or incomplete App Privacy section</p>
                          <p>• UI issues or poor user experience</p>
                          <p>• Misleading app description or screenshots</p>
                          <p>• Missing required permissions explanations</p>
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>

                  {/* Important Notes */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important Notes</AlertTitle>
                    <AlertDescription className="space-y-2 text-sm">
                      <p>• iOS builds can only be created on macOS with Xcode</p>
                      <p>• You need an Apple Developer account ($99/year)</p>
                      <p>• App Store review process takes 1-3 days</p>
                      <p>• TestFlight allows up to 10,000 beta testers</p>
                      <p>• Keep your provisioning profiles up to date</p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Github className="w-5 h-5" />
                    Resources & Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a 
                    href="https://capacitorjs.com/docs/ios" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Capacitor iOS Documentation
                  </a>
                  <a 
                    href="https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Apple - Distributing Your App
                  </a>
                  <a 
                    href="https://developer.apple.com/testflight/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    TestFlight Documentation
                  </a>
                  <a 
                    href="https://appstoreconnect.apple.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    App Store Connect
                  </a>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
