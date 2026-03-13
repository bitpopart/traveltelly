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
  Package,
  Play,
  Apple,
  Code,
  ExternalLink,
  Info,
  FileCode2,
  Wrench,
  Zap,
  Palette,
  Globe,
  Settings,
  Store,
  Send,
  Copy,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PWAStatus } from '@/components/PWAStatus';
import { useZapstorePublish } from '@/hooks/useZapstorePublish';
import type { ZapstoreAppConfig, ZapstoreReleaseConfig, ZapstoreAssetConfig } from '@/hooks/useZapstorePublish';

export default function AppBuilder() {
  const { user } = useCurrentUser();
  const { toast } = useToast();

  // Admin check
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // PWA Configuration State
  const [config, setConfig] = useState({
    // Basic Info
    appName: 'TravelTelly',
    shortName: 'TravelTelly',
    description: 'Share your travel experiences and discover amazing places on Nostr',
    
    // URLs
    startUrl: '/',
    scope: '/',
    siteUrl: 'https://traveltelly.diy',
    
    // Display
    display: 'standalone',
    orientation: 'any',
    
    // Colors
    themeColor: '#b700d7',
    backgroundColor: '#f4f4f5',
    
    // Package Info (for Android)
    packageName: 'com.traveltelly.app',
    versionCode: '1',
    versionName: '1.0.0',
    
    // App Store Info
    bundleId: 'com.traveltelly.app',
    appStoreId: '',
    
    // Icons (URLs to existing icons)
    icon192: '/icon-192.png',
    icon512: '/icon-512.png',
    
    // Optional features
    enableNotifications: true,
    enableGeolocation: true,
    enableCamera: false,
    enableOffline: true,
  });

  const [generating, setGenerating] = useState(false);

  // Zapstore state
  const { publishApp, publishAsset, publishRelease } = useZapstorePublish();

  const [zapApp, setZapApp] = useState<ZapstoreAppConfig>({
    packageName: 'com.traveltelly.app',
    name: 'TravelTelly',
    summary: 'Share your travel experiences and discover amazing places on Nostr',
    description: 'TravelTelly is a decentralized travel platform built on the Nostr protocol. Share GPS-tagged reviews, travel stories, and trip reports. Buy and sell travel photography with Lightning payments.',
    icon: 'https://traveltelly.diy/icon-512.png',
    images: ['https://traveltelly.diy/screenshot1.png'],
    tags: ['travel', 'nostr', 'social', 'photography', 'maps'],
    license: 'MIT',
    repository: 'https://github.com/bitpopart/traveltelly',
    website: 'https://traveltelly.diy',
    supportedNips: ['01', '07', '23', '57', '99'],
    platforms: ['web'],
  });

  const [zapAsset, setZapAsset] = useState<ZapstoreAssetConfig>({
    packageName: 'com.traveltelly.app',
    version: '1.0.0',
    versionCode: '1',
    url: 'https://traveltelly.diy',
    mimeType: 'text/html',
    sha256: '',
    size: '',
    platform: 'web',
    apkCertHash: '',
    minPlatformVersion: '',
    targetPlatformVersion: '',
  });

  const [zapRelease, setZapRelease] = useState<ZapstoreReleaseConfig>({
    packageName: 'com.traveltelly.app',
    version: '1.0.0',
    channel: 'main',
    releaseNotes: 'Initial release of TravelTelly on Zapstore.',
    assetEventId: '',
  });

  const [publishedAssetId, setPublishedAssetId] = useState<string>('');
  const [publishStep, setPublishStep] = useState<'app' | 'asset' | 'release'>('app');
  const [hashingUrl, setHashingUrl] = useState(false);

  const updateZapApp = (key: keyof ZapstoreAppConfig, value: string | string[]) => {
    setZapApp(prev => ({ ...prev, [key]: value }));
  };
  const updateZapAsset = (key: keyof ZapstoreAssetConfig, value: string) => {
    setZapAsset(prev => ({ ...prev, [key]: value }));
  };
  const updateZapRelease = (key: keyof ZapstoreReleaseConfig, value: string) => {
    setZapRelease(prev => ({ ...prev, [key]: value }));
  };

  // Fetch URL and compute SHA-256 + byte size via CORS proxy
  const handleComputeHash = async () => {
    const url = zapAsset.url.trim();
    if (!url) {
      toast({ title: 'No URL', description: 'Enter an asset URL first.', variant: 'destructive' });
      return;
    }
    setHashingUrl(true);
    try {
      const proxyUrl = `https://proxy.shakespeare.diy/?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
      const buf = await res.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buf);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      setZapAsset(prev => ({
        ...prev,
        sha256: hashHex,
        size: String(buf.byteLength),
      }));
      toast({ title: '✅ Hash computed', description: `SHA-256: ${hashHex.slice(0, 16)}…` });
    } catch (err) {
      toast({ title: '❌ Hash failed', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setHashingUrl(false);
    }
  };

  const handlePublishApp = async () => {
    await publishApp.mutateAsync(zapApp);
  };

  const handlePublishAsset = async () => {
    const event = await publishAsset.mutateAsync(zapAsset);
    setPublishedAssetId(event.id);
    setZapRelease(prev => ({ ...prev, assetEventId: event.id }));
    setPublishStep('release');
  };

  const handlePublishRelease = async () => {
    await publishRelease.mutateAsync({
      ...zapRelease,
      assetEventId: zapRelease.assetEventId || publishedAssetId,
    });
  };

  const updateConfig = (key: string, value: string | boolean) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const generateManifest = () => {
    return JSON.stringify({
      name: config.appName,
      short_name: config.shortName,
      description: config.description,
      start_url: config.startUrl,
      scope: config.scope,
      display: config.display,
      orientation: config.orientation,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      icons: [
        {
          src: config.icon192,
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: config.icon512,
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ],
      screenshots: [],
      categories: ["travel", "social", "photo"],
      shortcuts: [
        {
          name: "Create Review",
          url: "/create-review",
          description: "Create a new travel review"
        },
        {
          name: "View Map",
          url: "/world-map",
          description: "Explore the world map"
        }
      ]
    }, null, 2);
  };

  const generateAssetLinks = () => {
    return JSON.stringify([
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: config.packageName,
          sha256_cert_fingerprints: [
            "YOUR_SHA256_FINGERPRINT_HERE"
          ]
        }
      }
    ], null, 2);
  };

  const generateAppleAppSiteAssociation = () => {
    return JSON.stringify({
      applinks: {
        apps: [],
        details: [
          {
            appID: `TEAMID.${config.bundleId}`,
            paths: ["*"]
          }
        ]
      }
    }, null, 2);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadManifest = () => {
    downloadFile('manifest.webmanifest', generateManifest());
    toast({
      title: "Manifest Downloaded",
      description: "manifest.webmanifest has been downloaded",
    });
  };

  const handleDownloadAssetLinks = () => {
    downloadFile('assetlinks.json', generateAssetLinks());
    toast({
      title: "Asset Links Downloaded",
      description: "assetlinks.json has been downloaded",
    });
  };

  const handleDownloadAppleAssociation = () => {
    downloadFile('apple-app-site-association', generateAppleAppSiteAssociation());
    toast({
      title: "Apple Association Downloaded",
      description: "apple-app-site-association has been downloaded",
    });
  };

  const handleGeneratePWA = async () => {
    setGenerating(true);
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "PWA Configuration Ready",
      description: "Download the files and follow the submission guide below",
    });
    
    setGenerating(false);
  };

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
              <Smartphone className="w-8 h-8" style={{ color: '#b700d7' }} />
              <h1 className="text-4xl font-bold">PWA App Builder</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Configure and build your Progressive Web App for Android & iOS App Stores
            </p>
          </div>

          {/* Info Alert */}
          <Alert className="mb-6" style={{ borderColor: '#b700d7' }}>
            <Info className="h-4 w-4" style={{ color: '#b700d7' }} />
            <AlertTitle>Progressive Web App (PWA)</AlertTitle>
            <AlertDescription>
              This tool generates configuration files for submitting your PWA to the Google Play Store and Apple App Store.
              No native code required - your web app runs in a native wrapper.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="config" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="config">
                <Settings className="mr-2 h-4 w-4" />
                Configuration
              </TabsTrigger>
              <TabsTrigger value="status">
                <Globe className="mr-2 h-4 w-4" />
                PWA Status
              </TabsTrigger>
              <TabsTrigger value="android">
                <Play className="mr-2 h-4 w-4" />
                Android
              </TabsTrigger>
              <TabsTrigger value="ios">
                <Apple className="mr-2 h-4 w-4" />
                iOS
              </TabsTrigger>
              <TabsTrigger value="guide">
                <FileCode2 className="mr-2 h-4 w-4" />
                Submission Guide
              </TabsTrigger>
              <TabsTrigger value="zapstore" className="relative">
                <Store className="mr-2 h-4 w-4" />
                Zapstore
                <Badge className="ml-1 text-xs px-1 py-0" style={{ backgroundColor: '#f7931a', color: 'white' }}>⚡</Badge>
              </TabsTrigger>
            </TabsList>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <CardDescription>
                    Configure your app's identity and description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="appName">App Name</Label>
                      <Input
                        id="appName"
                        value={config.appName}
                        onChange={(e) => updateConfig('appName', e.target.value)}
                        placeholder="TravelTelly"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shortName">Short Name</Label>
                      <Input
                        id="shortName"
                        value={config.shortName}
                        onChange={(e) => updateConfig('shortName', e.target.value)}
                        placeholder="TravelTelly"
                        maxLength={12}
                      />
                      <p className="text-xs text-muted-foreground">Max 12 characters for home screen</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={config.description}
                      onChange={(e) => updateConfig('description', e.target.value)}
                      placeholder="Describe your app..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Website URL</Label>
                    <Input
                      id="siteUrl"
                      value={config.siteUrl}
                      onChange={(e) => updateConfig('siteUrl', e.target.value)}
                      placeholder="https://traveltelly.diy"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Display Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Display & Appearance
                  </CardTitle>
                  <CardDescription>
                    Configure how your app looks and behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="themeColor">Theme Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="themeColor"
                          type="color"
                          value={config.themeColor}
                          onChange={(e) => updateConfig('themeColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={config.themeColor}
                          onChange={(e) => updateConfig('themeColor', e.target.value)}
                          placeholder="#b700d7"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="backgroundColor">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="backgroundColor"
                          type="color"
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          value={config.backgroundColor}
                          onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                          placeholder="#f4f4f5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="display">Display Mode</Label>
                      <Select value={config.display} onValueChange={(value) => updateConfig('display', value)}>
                        <SelectTrigger id="display">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standalone">Standalone (Recommended)</SelectItem>
                          <SelectItem value="fullscreen">Fullscreen</SelectItem>
                          <SelectItem value="minimal-ui">Minimal UI</SelectItem>
                          <SelectItem value="browser">Browser</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orientation">Orientation</Label>
                      <Select value={config.orientation} onValueChange={(value) => updateConfig('orientation', value)}>
                        <SelectTrigger id="orientation">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any (Recommended)</SelectItem>
                          <SelectItem value="portrait">Portrait</SelectItem>
                          <SelectItem value="landscape">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Package Information
                  </CardTitle>
                  <CardDescription>
                    Platform-specific identifiers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="packageName">Android Package Name</Label>
                    <Input
                      id="packageName"
                      value={config.packageName}
                      onChange={(e) => updateConfig('packageName', e.target.value)}
                      placeholder="com.traveltelly.app"
                    />
                    <p className="text-xs text-muted-foreground">Must be unique on Google Play Store</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="versionCode">Version Code</Label>
                      <Input
                        id="versionCode"
                        value={config.versionCode}
                        onChange={(e) => updateConfig('versionCode', e.target.value)}
                        placeholder="1"
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="versionName">Version Name</Label>
                      <Input
                        id="versionName"
                        value={config.versionName}
                        onChange={(e) => updateConfig('versionName', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bundleId">iOS Bundle ID</Label>
                    <Input
                      id="bundleId"
                      value={config.bundleId}
                      onChange={(e) => updateConfig('bundleId', e.target.value)}
                      placeholder="com.traveltelly.app"
                    />
                    <p className="text-xs text-muted-foreground">Must match your Apple Developer account</p>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleGeneratePWA} 
                    disabled={generating}
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: '#b700d7' }}
                  >
                    {generating ? (
                      <>
                        <Wrench className="mr-2 h-5 w-5 animate-spin" />
                        Generating Configuration...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-5 w-5" />
                        Generate PWA Configuration
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PWA Status Tab */}
            <TabsContent value="status" className="space-y-6">
              <PWAStatus />
            </TabsContent>

            {/* Android Tab */}
            <TabsContent value="android" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-green-600" />
                    Android App Package
                  </CardTitle>
                  <CardDescription>
                    Generate files needed for Google Play Store submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>What you'll need:</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Google Play Console account ($25 one-time fee)</li>
                        <li>Web Manifest file (generated below)</li>
                        <li>Digital Asset Links file (for TWA)</li>
                        <li>App icons (192x192 and 512x512)</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Web App Manifest</h3>
                        <p className="text-sm text-muted-foreground">manifest.webmanifest</p>
                      </div>
                      <Button onClick={handleDownloadManifest} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Digital Asset Links</h3>
                        <p className="text-sm text-muted-foreground">assetlinks.json</p>
                      </div>
                      <Button onClick={handleDownloadAssetLinks} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Using PWABuilder (Recommended)</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">PWABuilder.com</a></li>
                        <li>Enter your website URL: <code className="bg-blue-100 px-1 rounded">{config.siteUrl}</code></li>
                        <li>Click "Package for Stores" → "Android"</li>
                        <li>Choose "Trusted Web Activity" (TWA)</li>
                        <li>Upload to Google Play Console</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <Alert className="bg-purple-50 border-purple-200">
                    <Info className="h-4 w-4 text-purple-600" />
                    <AlertTitle className="text-purple-900">Alternative: Bubblewrap</AlertTitle>
                    <AlertDescription className="text-purple-800">
                      <p className="mt-2">Command-line tool for building TWAs:</p>
                      <pre className="bg-purple-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                        npx @bubblewrap/cli init --manifest={config.siteUrl}/manifest.webmanifest
                      </pre>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Tab */}
            <TabsContent value="ios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5" />
                    iOS App Package
                  </CardTitle>
                  <CardDescription>
                    Generate files needed for Apple App Store submission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>What you'll need:</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Apple Developer account ($99/year)</li>
                        <li>Web Manifest file (generated below)</li>
                        <li>Apple App Site Association file</li>
                        <li>App icons and launch screens</li>
                      </ul>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Web App Manifest</h3>
                        <p className="text-sm text-muted-foreground">manifest.webmanifest</p>
                      </div>
                      <Button onClick={handleDownloadManifest} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Apple App Site Association</h3>
                        <p className="text-sm text-muted-foreground">apple-app-site-association</p>
                      </div>
                      <Button onClick={handleDownloadAppleAssociation} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Using PWABuilder (Recommended)</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      <ol className="list-decimal list-inside space-y-2 mt-2">
                        <li>Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">PWABuilder.com</a></li>
                        <li>Enter your website URL: <code className="bg-blue-100 px-1 rounded">{config.siteUrl}</code></li>
                        <li>Click "Package for Stores" → "iOS"</li>
                        <li>Download the generated Xcode project</li>
                        <li>Open in Xcode and submit to App Store Connect</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription>
                      Apple has strict guidelines for web-based apps. Ensure your PWA:
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>Works offline with Service Workers</li>
                        <li>Has native-like UI and interactions</li>
                        <li>Provides unique value beyond a website</li>
                        <li>Uses platform-specific features where possible</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Submission Guide Tab */}
            <TabsContent value="guide" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode2 className="w-5 h-5" />
                    Step-by-Step Submission Guide
                  </CardTitle>
                  <CardDescription>
                    Complete guide to submitting your PWA to app stores
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Prerequisites */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      Prerequisites
                    </h3>
                    <div className="space-y-2 pl-7">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Your PWA must be live and accessible via HTTPS</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Valid SSL certificate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Required</Badge>
                        <span>Service Worker for offline functionality</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Recommended</Badge>
                        <span>Web App Manifest with all required fields</span>
                      </div>
                    </div>
                  </div>

                  {/* Google Play Store */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      Google Play Store (Android)
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">1. Create Developer Account</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Visit <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer" className="underline">Google Play Console</a></li>
                          <li>• Pay $25 one-time registration fee</li>
                          <li>• Complete verification process</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">2. Generate TWA Package</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Use PWABuilder or Bubblewrap (see Android tab)</li>
                          <li>• Upload assetlinks.json to <code>/.well-known/assetlinks.json</code></li>
                          <li>• Generate signed APK or AAB file</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">3. Create App Listing</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Upload app bundle (AAB file)</li>
                          <li>• Add screenshots (phone, tablet, optional)</li>
                          <li>• Write store description</li>
                          <li>• Set content rating</li>
                          <li>• Configure pricing and distribution</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">4. Submit for Review</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Review takes 1-7 days typically</li>
                          <li>• Address any policy violations</li>
                          <li>• App goes live after approval</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Apple App Store */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      Apple App Store (iOS)
                    </h3>
                    <div className="space-y-3 pl-7">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">1. Join Apple Developer Program</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Visit <a href="https://developer.apple.com" target="_blank" rel="noopener noreferrer" className="underline">developer.apple.com</a></li>
                          <li>• Pay $99/year membership fee</li>
                          <li>• Complete enrollment verification</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">2. Generate iOS Package</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Use PWABuilder to generate Xcode project</li>
                          <li>• Upload apple-app-site-association to <code>/.well-known/</code></li>
                          <li>• Configure app icons and launch screens</li>
                          <li>• Requires macOS with Xcode installed</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">3. App Store Connect</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Create new app in App Store Connect</li>
                          <li>• Configure bundle ID: <code className="text-xs">{config.bundleId}</code></li>
                          <li>• Add screenshots (iPhone, iPad optional)</li>
                          <li>• Write app description and keywords</li>
                          <li>• Set privacy policy URL</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1">4. Submit for Review</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Upload IPA via Xcode or Transporter</li>
                          <li>• Review takes 1-3 days typically</li>
                          <li>• Apple has stricter guidelines than Google</li>
                          <li>• Must provide value beyond mobile website</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Resources */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5" />
                      Helpful Resources
                    </h3>
                    <div className="space-y-2 pl-7">
                      <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        PWABuilder - Automated PWA to App Store
                      </a>
                      <a href="https://github.com/GoogleChromeLabs/bubblewrap" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Bubblewrap - Google's TWA CLI Tool
                      </a>
                      <a href="https://web.dev/progressive-web-apps/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        web.dev - PWA Documentation
                      </a>
                      <a href="https://developer.android.com/training/articles/app-links" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Android App Links Verification
                      </a>
                      <a href="https://developer.apple.com/documentation/xcode/supporting-associated-domains" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
                        <ExternalLink className="w-4 h-4" />
                        Apple Universal Links Setup
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Zapstore Tab */}
            <TabsContent value="zapstore" className="space-y-6">

              {/* Header Card */}
              <Card style={{ borderColor: '#f7931a', background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Store className="w-6 h-6" style={{ color: '#f7931a' }} />
                    <span>Publish to Zapstore</span>
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>⚡ Lightning App Store</Badge>
                  </CardTitle>
                  <CardDescription>
                    Publish TravelTelly to <a href="https://zapstore.dev" target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#f7931a' }}>Zapstore.dev</a> — the decentralized Nostr-native app store.
                    Sign and publish NIP-82 events to <code>relay.zapstore.dev</code> using your Nostr identity.
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* How it works */}
              <Alert style={{ borderColor: '#f7931a', backgroundColor: '#fff7ed' }}>
                <Info className="h-4 w-4" style={{ color: '#f7931a' }} />
                <AlertTitle>3-Step Publishing Process</AlertTitle>
                <AlertDescription>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className={publishStep === 'app' ? 'border-orange-500 text-orange-700 bg-orange-50' : 'bg-green-50 border-green-500 text-green-700'}>
                      1. App Metadata (kind 32267)
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={publishStep === 'asset' ? 'border-orange-500 text-orange-700 bg-orange-50' : publishedAssetId ? 'bg-green-50 border-green-500 text-green-700' : ''}>
                      2. Asset Info (kind 3063)
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline" className={publishStep === 'release' ? 'border-orange-500 text-orange-700 bg-orange-50' : ''}>
                      3. Release (kind 30063)
                    </Badge>
                  </div>
                  <p className="text-xs mt-2 text-muted-foreground">Publish in order: App → Asset → Release. All events are signed by your Nostr identity.</p>
                </AlertDescription>
              </Alert>

              {/* STEP 1 — App Metadata */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 1</Badge>
                    App Metadata
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 32267</code>
                  </CardTitle>
                  <CardDescription>
                    Publishes your app's identity to Zapstore — name, icon, description, categories, and supported platforms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name (d tag)</Label>
                      <Input
                        value={zapApp.packageName}
                        onChange={(e) => updateZapApp('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                      <p className="text-xs text-muted-foreground">Unique identifier e.g. com.yourapp.id</p>
                    </div>
                    <div className="space-y-2">
                      <Label>App Name</Label>
                      <Input
                        value={zapApp.name}
                        onChange={(e) => updateZapApp('name', e.target.value)}
                        placeholder="TravelTelly"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Summary (one-liner)</Label>
                    <Input
                      value={zapApp.summary}
                      onChange={(e) => updateZapApp('summary', e.target.value)}
                      placeholder="Short description of your app"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Full Description (Markdown supported)</Label>
                    <Textarea
                      value={zapApp.description}
                      onChange={(e) => updateZapApp('description', e.target.value)}
                      rows={4}
                      placeholder="Full app description..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Icon URL</Label>
                      <Input
                        value={zapApp.icon}
                        onChange={(e) => updateZapApp('icon', e.target.value)}
                        placeholder="https://traveltelly.diy/icon-512.png"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>License (SPDX)</Label>
                      <Input
                        value={zapApp.license}
                        onChange={(e) => updateZapApp('license', e.target.value)}
                        placeholder="MIT"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Repository URL</Label>
                      <Input
                        value={zapApp.repository}
                        onChange={(e) => updateZapApp('repository', e.target.value)}
                        placeholder="https://github.com/bitpopart/traveltelly"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Website URL</Label>
                      <Input
                        value={zapApp.website}
                        onChange={(e) => updateZapApp('website', e.target.value)}
                        placeholder="https://traveltelly.diy"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Screenshot URLs (one per line)</Label>
                    <Textarea
                      value={zapApp.images.join('\n')}
                      onChange={(e) => updateZapApp('images', e.target.value.split('\n').filter(Boolean))}
                      rows={3}
                      placeholder="https://traveltelly.diy/screenshot1.png&#10;https://traveltelly.diy/screenshot2.png"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category Tags (comma-separated)</Label>
                      <Input
                        value={zapApp.tags.join(', ')}
                        onChange={(e) => updateZapApp('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="travel, nostr, photography"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Platforms (comma-separated)</Label>
                      <Input
                        value={zapApp.platforms.join(', ')}
                        onChange={(e) => updateZapApp('platforms', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                        placeholder="web, android-arm64-v8a"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Supported NIPs (comma-separated, for Nostr clients)</Label>
                    <Input
                      value={zapApp.supportedNips.join(', ')}
                      onChange={(e) => updateZapApp('supportedNips', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
                      placeholder="01, 07, 23, 57, 99"
                    />
                  </div>

                  <Button
                    onClick={handlePublishApp}
                    disabled={publishApp.isPending || !user}
                    className="w-full"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishApp.isPending ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Publishing App Metadata...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Publish App Metadata (kind 32267)</>
                    )}
                  </Button>

                  {publishApp.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">App Metadata Published!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-green-100 px-1 rounded break-all">{publishApp.data?.id}</code>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(publishApp.data?.id ?? '')}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="mt-1">Now proceed to publish the Asset in Step 2.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {publishApp.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>App Publish Failed</AlertTitle>
                      <AlertDescription>
                        <p className="font-mono text-xs break-all mt-1">{(publishApp.error as Error)?.message}</p>
                        <p className="mt-2 text-xs">Tip: Check the browser console for relay NOTICE messages.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* STEP 2 — Asset */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 2</Badge>
                    Software Asset
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 3063</code>
                  </CardTitle>
                  <CardDescription>
                    Describes the binary or web asset — URL, hash, size, platform. For PWAs use <code>text/html</code> as MIME type.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={zapAsset.packageName}
                        onChange={(e) => updateZapAsset('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={zapAsset.version}
                        onChange={(e) => updateZapAsset('version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version Code</Label>
                      <Input
                        value={zapAsset.versionCode}
                        onChange={(e) => updateZapAsset('versionCode', e.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Asset URL</Label>
                      <Input
                        value={zapAsset.url}
                        onChange={(e) => updateZapAsset('url', e.target.value)}
                        placeholder="https://traveltelly.diy or URL to APK"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>MIME Type</Label>
                      <Select value={zapAsset.mimeType} onValueChange={(v) => updateZapAsset('mimeType', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text/html">text/html (PWA / Web App)</SelectItem>
                          <SelectItem value="application/vnd.android.package-archive">application/vnd.android.package-archive (APK)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* SHA-256 + auto-compute */}
                  <div className="space-y-2">
                    <Label>
                      SHA-256 Hash <span className="text-red-500 text-xs font-semibold">* required by relay</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        value={zapAsset.sha256}
                        onChange={(e) => updateZapAsset('sha256', e.target.value)}
                        placeholder="e3b0c44298fc1c149afbf4c8996fb924..."
                        className={!zapAsset.sha256 ? 'border-red-300' : 'border-green-400'}
                        readOnly={hashingUrl}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleComputeHash}
                        disabled={hashingUrl || !zapAsset.url}
                        className="shrink-0 whitespace-nowrap"
                        title="Fetch URL and compute SHA-256 automatically"
                      >
                        {hashingUrl
                          ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Computing…</>
                          : <><RefreshCw className="mr-2 h-4 w-4" />Auto-compute</>
                        }
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click <strong>Auto-compute</strong> to fetch the URL and calculate the hash automatically. Required for all asset types.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>File Size (bytes) <span className="text-muted-foreground text-xs">(auto-filled by compute)</span></Label>
                    <Input
                      value={zapAsset.size}
                      onChange={(e) => updateZapAsset('size', e.target.value)}
                      placeholder="auto-filled after computing hash"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Platform</Label>
                    <Select value={zapAsset.platform} onValueChange={(v) => updateZapAsset('platform', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="web">web (PWA)</SelectItem>
                        <SelectItem value="android-arm64-v8a">android-arm64-v8a</SelectItem>
                        <SelectItem value="android-universal">android-universal</SelectItem>
                        <SelectItem value="android-armeabi-v7a">android-armeabi-v7a</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {zapAsset.mimeType === 'application/vnd.android.package-archive' && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>APK Certificate Hash</Label>
                        <Input
                          value={zapAsset.apkCertHash}
                          onChange={(e) => updateZapAsset('apkCertHash', e.target.value)}
                          placeholder="SHA-256 fingerprint"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Min Android SDK</Label>
                        <Input
                          value={zapAsset.minPlatformVersion}
                          onChange={(e) => updateZapAsset('minPlatformVersion', e.target.value)}
                          placeholder="21"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Android SDK</Label>
                        <Input
                          value={zapAsset.targetPlatformVersion}
                          onChange={(e) => updateZapAsset('targetPlatformVersion', e.target.value)}
                          placeholder="34"
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handlePublishAsset}
                    disabled={publishAsset.isPending || !user}
                    className="w-full"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishAsset.isPending ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Publishing Asset...</>
                    ) : (
                      <><Send className="mr-2 h-4 w-4" />Publish Asset (kind 3063)</>
                    )}
                  </Button>

                  {publishAsset.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Asset Published!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-green-100 px-1 rounded break-all">{publishedAssetId}</code>
                          <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(publishedAssetId)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="mt-1">Asset event ID copied to Release form. Now publish the Release in Step 3.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                  {publishAsset.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Asset Publish Failed</AlertTitle>
                      <AlertDescription>
                        <p className="font-mono text-xs break-all mt-1">{(publishAsset.error as Error)?.message}</p>
                        <p className="mt-2 text-xs">Tip: Check the browser console for relay NOTICE messages with more details.</p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* STEP 3 — Release */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge style={{ backgroundColor: '#f7931a', color: 'white' }}>Step 3</Badge>
                    Software Release
                    <code className="text-xs text-muted-foreground bg-muted px-1 rounded">kind: 30063</code>
                  </CardTitle>
                  <CardDescription>
                    Ties together the app and asset into a versioned release with release notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Package Name</Label>
                      <Input
                        value={zapRelease.packageName}
                        onChange={(e) => updateZapRelease('packageName', e.target.value)}
                        placeholder="com.traveltelly.app"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Version</Label>
                      <Input
                        value={zapRelease.version}
                        onChange={(e) => updateZapRelease('version', e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Channel</Label>
                      <Select value={zapRelease.channel} onValueChange={(v) => updateZapRelease('channel', v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="main">main (stable)</SelectItem>
                          <SelectItem value="beta">beta</SelectItem>
                          <SelectItem value="nightly">nightly</SelectItem>
                          <SelectItem value="dev">dev</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Asset Event ID (from Step 2)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={zapRelease.assetEventId}
                        onChange={(e) => updateZapRelease('assetEventId', e.target.value)}
                        placeholder="Automatically filled after Step 2..."
                      />
                      {publishedAssetId && (
                        <Button variant="outline" size="sm" onClick={() => updateZapRelease('assetEventId', publishedAssetId)}>
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-filled when you complete Step 2, or paste manually</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Release Notes</Label>
                    <Textarea
                      value={zapRelease.releaseNotes}
                      onChange={(e) => updateZapRelease('releaseNotes', e.target.value)}
                      rows={4}
                      placeholder="What's new in this release..."
                    />
                  </div>

                  <Button
                    onClick={handlePublishRelease}
                    disabled={publishRelease.isPending || !user}
                    className="w-full"
                    size="lg"
                    style={{ backgroundColor: '#f7931a' }}
                  >
                    {publishRelease.isPending ? (
                      <><RefreshCw className="mr-2 h-5 w-5 animate-spin" />Publishing Release...</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" />Publish Release to Zapstore (kind 30063)</>
                    )}
                  </Button>

                  {publishRelease.isSuccess && (
                    <Alert className="bg-green-50 border-green-500">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">🎉 Release Published to Zapstore!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-green-100 px-1 rounded break-all">{publishRelease.data?.id}</code>
                        </div>
                        <p className="mt-2">
                          TravelTelly is now listed on{' '}
                          <a href={`https://zapstore.dev/app/${zapRelease.packageName}`} target="_blank" rel="noopener noreferrer" className="underline font-semibold" style={{ color: '#f7931a' }}>
                            zapstore.dev ↗
                          </a>
                        </p>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Resources & Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Zapstore Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <a href="https://zapstore.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline" style={{ color: '#f7931a' }}>
                    <Store className="w-4 h-4" />
                    zapstore.dev — Browse the Nostr app store
                  </a>
                  <a href="https://github.com/zapstore/zsp" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <Code className="w-4 h-4" />
                    github.com/zapstore/zsp — CLI publishing tool
                  </a>
                  <a href="https://github.com/zapstore/zapstore" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                    <ExternalLink className="w-4 h-4" />
                    github.com/zapstore/zapstore — Android app source
                  </a>
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground font-semibold mb-1">NIP-82 Event Kinds Used:</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div><code>32267</code> — Software Application (app metadata, addressable)</div>
                      <div><code>3063</code> — Software Asset (binary/PWA details, regular)</div>
                      <div><code>30063</code> — Software Release (version + release notes, addressable)</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Published to: <code>wss://relay.zapstore.dev</code></p>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
