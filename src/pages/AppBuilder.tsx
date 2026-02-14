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
                      <div>
                        <p className="font-medium mb-2">1. Install Zapstore Publisher (zsp)</p>
                        <code className="text-sm bg-muted px-2 py-1 rounded block">go install github.com/zapstore/zsp@latest</code>
                        <p className="text-sm text-muted-foreground mt-1">Requires Go to be installed: <a href="https://go.dev/dl/" target="_blank" rel="noopener noreferrer" className="underline">go.dev/dl</a></p>
                      </div>

                      <div>
                        <p className="font-medium mb-2">2. Create zapstore.yaml</p>
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
                        <p className="font-medium mb-2">3. Create Publish Script</p>
                        <p className="text-sm text-muted-foreground mb-2">Create <code className="bg-muted px-1 rounded">scripts/publish-zapstore.sh</code>:</p>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`#!/bin/bash
set -e

echo "📦 Publishing to Zapstore..."

# Check if APK exists
if [ ! -f "downloads/traveltelly.apk" ]; then
    echo "APK not found. Run: npm run build:apk"
    exit 1
fi

# Set signing method to browser (NIP-07)
export SIGN_WITH=browser

# Publish to Zapstore
zsp publish zapstore.yaml

echo "✅ Published to Zapstore!"
echo "View at: https://zap.store"`}
                        </pre>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">chmod +x scripts/publish-zapstore.sh</code>
                        <code className="text-sm bg-muted px-2 py-1 rounded block mt-2">npm run publish:zapstore</code>
                      </div>

                      <div>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Zapstore will open your browser for NIP-07 signing. Make sure you have a Nostr extension installed (Alby, nos2x, etc.)
                          </AlertDescription>
                        </Alert>
                      </div>
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
