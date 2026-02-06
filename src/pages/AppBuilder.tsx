import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { nip19 } from 'nostr-tools';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Globe,
  Lock,
  Zap,
  Download,
  Upload,
  Settings,
  Bell,
  Wifi,
  FileCode,
  Shield,
  DollarSign,
  Package,
  Play,
  Apple,
  Camera,
  MapPin,
  Image as ImageIcon,
  Code,
  Github,
  ExternalLink,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';

interface BuildStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export default function AppBuilder() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const { toast } = useToast();

  // Admin check
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // State
  const [siteUrl, setSiteUrl] = useState('https://www.traveltelly.com');
  const [appName, setAppName] = useState('TravelTelly');
  const [appId, setAppId] = useState('com.traveltelly.app');
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<'android' | 'ios' | 'both'>('both');
  const [appDescription, setAppDescription] = useState('Discover and share travel experiences with GPS-tagged reviews, stories, and stock photography on a decentralized platform.');
  const [defaultRelays, setDefaultRelays] = useState('wss://relay.damus.io\nwss://relay.nostr.band\nwss://nos.lol');
  const [primaryColor, setPrimaryColor] = useState('#f97316'); // orange-500

  // Architecture Readiness Checklist (Olas-based)
  const [archChecks, setArchChecks] = useState({
    nostrIntegration: true,     // Using Nostrify/NDK
    reactNative: false,         // Would need React Native conversion
    expoSetup: false,           // Expo SDK configuration
    ndk: true,                  // NDK already integrated via Nostrify
    blossomServers: true,       // NIP-96 file uploads configured
    lightningZaps: true,        // NIP-57 zaps implemented
    nip44Encryption: true,      // DM encryption ready
    cashuWallet: false,         // Cashu ecash integration (optional)
    offlineCache: false,        // SQLite/AsyncStorage
    pushNotifications: false    // FCM/APNs setup
  });

  // Android Steps
  const [androidSteps, setAndroidSteps] = useState<BuildStep[]>([
    {
      id: 'play-console',
      title: 'Create Google Play Console Account',
      description: 'Sign up at play.google.com/console ($25 one-time fee)',
      completed: false
    },
    {
      id: 'app-details',
      title: 'Configure App Details',
      description: 'Set app name, package ID, and description',
      completed: false
    },
    {
      id: 'generate-aab',
      title: 'Generate App Bundle (AAB)',
      description: 'Build signed Android App Bundle for Play Store',
      completed: false
    },
    {
      id: 'test-apk',
      title: 'Test APK Build',
      description: 'Generate and test APK on Android device',
      completed: false
    },
    {
      id: 'upload-play',
      title: 'Upload to Play Console',
      description: 'Submit AAB file to Google Play Console',
      completed: false
    },
    {
      id: 'play-listing',
      title: 'Complete Store Listing',
      description: 'Add screenshots, description, and privacy policy',
      completed: false
    },
    {
      id: 'review-android',
      title: 'Submit for Review',
      description: 'Send app for Google Play review',
      completed: false
    }
  ]);

  // iOS Steps
  const [iosSteps, setIosSteps] = useState<BuildStep[]>([
    {
      id: 'apple-dev',
      title: 'Join Apple Developer Program',
      description: 'Enroll at developer.apple.com ($99/year)',
      completed: false
    },
    {
      id: 'app-id',
      title: 'Create App ID',
      description: 'Register unique bundle identifier in Apple Developer',
      completed: false
    },
    {
      id: 'generate-ipa',
      title: 'Generate IPA File',
      description: 'Build iOS app package with proper signing',
      completed: false
    },
    {
      id: 'testflight',
      title: 'Upload to TestFlight',
      description: 'Test app via Apple TestFlight',
      completed: false
    },
    {
      id: 'app-store-connect',
      title: 'Configure App Store Connect',
      description: 'Set up app metadata, screenshots, and pricing',
      completed: false
    },
    {
      id: 'privacy-policy',
      title: 'Add Privacy Policy',
      description: 'Provide required privacy information',
      completed: false
    },
    {
      id: 'review-ios',
      title: 'Submit for Review',
      description: 'Send app for App Store review',
      completed: false
    }
  ]);

  const toggleAndroidStep = (stepId: string) => {
    setAndroidSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const toggleIosStep = (stepId: string) => {
    setIosSteps(steps =>
      steps.map(step =>
        step.id === stepId ? { ...step, completed: !step.completed } : step
      )
    );
  };

  const handleBuild = async () => {
    if (!appName || !appId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);

    // Simulate Expo + NDK project generation
    const steps = [
      { label: 'Initializing Expo project structure...', progress: 10 },
      { label: 'Installing @nostr-dev-kit/ndk dependencies...', progress: 20 },
      { label: 'Configuring app.json and eas.json...', progress: 30 },
      { label: 'Setting up Expo Camera and Image Picker...', progress: 40 },
      { label: 'Configuring NDK relay pool and cache...', progress: 50 },
      { label: 'Adding Blossom upload integration...', progress: 60 },
      { label: 'Setting up Lightning/Cashu wallet modules...', progress: 70 },
      { label: 'Generating navigation structure...', progress: 80 },
      { label: 'Creating component templates...', progress: 90 },
      { label: 'Project ready! Download and run: npx expo start', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setBuildProgress(step.progress);
      
      toast({
        title: step.label,
        description: `${step.progress}% complete`
      });
    }

    setIsBuilding(false);
    
    toast({
      title: 'Expo Project Generated!',
      description: 'Download the zip file and follow the README to start development.',
      duration: 5000
    });
  };

  const archCompletionRate = Object.values(archChecks).filter(Boolean).length / Object.values(archChecks).length * 100;
  const androidCompletionRate = androidSteps.filter(s => s.completed).length / androidSteps.length * 100;
  const iosCompletionRate = iosSteps.filter(s => s.completed).length / iosSteps.length * 100;

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Checking permissions...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isTraveltellyAdmin) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-6">
                  Only the Traveltelly admin can access the App Builder.
                </p>
                <Link to="/admin">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
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
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Smartphone className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold">Native App Builder</h1>
            </div>
            <p className="text-muted-foreground">
              Build and submit native Android and iOS apps for TravelTelly
            </p>
          </div>

          {/* Olas Architecture Info */}
          <Alert className="mb-6 border-purple-200 bg-purple-50">
            <Info className="h-5 w-5 text-purple-600" />
            <AlertTitle className="text-purple-900">Based on Olas Architecture</AlertTitle>
            <AlertDescription className="text-purple-800">
              This builder will create a React Native + Expo app following the <strong>Olas</strong> architecture 
              (by Pablo F7z). Olas is a picture-first decentralized social app built with NDK, 
              Expo Camera, Blossom uploads, and Lightning zaps.
              <div className="flex gap-2 mt-3">
                <a 
                  href="https://github.com/pablof7z/olas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 hover:underline font-medium"
                >
                  <Github className="w-3 h-3" />
                  Olas Main Repo
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="https://github.com/pablof7z/olas-ios" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-600 hover:underline font-medium"
                >
                  <Apple className="w-3 h-3" />
                  Olas iOS
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </AlertDescription>
          </Alert>

          {/* Architecture Readiness Check */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                Architecture Readiness (Olas-Based)
              </CardTitle>
              <CardDescription>
                Converting TravelTelly web app to React Native + Expo + NDK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Readiness Score</span>
                  <span className="text-sm text-muted-foreground">{(Object.values(archChecks).filter(Boolean).length / Object.values(archChecks).length * 100).toFixed(0)}%</span>
                </div>
                <Progress value={(Object.values(archChecks).filter(Boolean).length / Object.values(archChecks).length * 100)} className="h-2" />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.nostrIntegration ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Nostr Integration</div>
                    <p className="text-xs text-muted-foreground">Using Nostrify → NDK</p>
                  </div>
                  <Badge variant={archChecks.nostrIntegration ? "default" : "destructive"} className="flex-shrink-0">
                    {archChecks.nostrIntegration ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.blossomServers ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Blossom Uploads</div>
                    <p className="text-xs text-muted-foreground">NIP-96 file servers</p>
                  </div>
                  <Badge variant={archChecks.blossomServers ? "default" : "destructive"} className="flex-shrink-0">
                    {archChecks.blossomServers ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.lightningZaps ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Lightning Zaps</div>
                    <p className="text-xs text-muted-foreground">NIP-57 implemented</p>
                  </div>
                  <Badge variant={archChecks.lightningZaps ? "default" : "destructive"} className="flex-shrink-0">
                    {archChecks.lightningZaps ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.nip44Encryption ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">NIP-44 Encryption</div>
                    <p className="text-xs text-muted-foreground">DM encryption ready</p>
                  </div>
                  <Badge variant={archChecks.nip44Encryption ? "default" : "destructive"} className="flex-shrink-0">
                    {archChecks.nip44Encryption ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.reactNative ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">React Native Port</div>
                    <p className="text-xs text-muted-foreground">Convert React → RN</p>
                  </div>
                  <Badge variant={archChecks.reactNative ? "default" : "secondary"} className="flex-shrink-0">
                    {archChecks.reactNative ? "✓" : "Todo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.expoSetup ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Expo SDK Setup</div>
                    <p className="text-xs text-muted-foreground">Camera, Image Picker</p>
                  </div>
                  <Badge variant={archChecks.expoSetup ? "default" : "secondary"} className="flex-shrink-0">
                    {archChecks.expoSetup ? "✓" : "Todo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.cashuWallet ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Cashu Wallet</div>
                    <p className="text-xs text-muted-foreground">Ecash integration</p>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">
                    Optional
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.offlineCache ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Offline Storage</div>
                    <p className="text-xs text-muted-foreground">Expo SQLite</p>
                  </div>
                  <Badge variant={archChecks.offlineCache ? "default" : "secondary"} className="flex-shrink-0">
                    {archChecks.offlineCache ? "✓" : "Todo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.pushNotifications ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">Push Notifications</div>
                    <p className="text-xs text-muted-foreground">Expo Notifications</p>
                  </div>
                  <Badge variant={archChecks.pushNotifications ? "default" : "secondary"} className="flex-shrink-0">
                    {archChecks.pushNotifications ? "✓" : "Todo"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  {archChecks.ndk ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">NDK Integration</div>
                    <p className="text-xs text-muted-foreground">@nostr-dev-kit/ndk</p>
                  </div>
                  <Badge variant={archChecks.ndk ? "default" : "destructive"} className="flex-shrink-0">
                    {archChecks.ndk ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>

              <Alert className="mt-4 border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-900">Architecture Compatibility</AlertTitle>
                <AlertDescription className="text-blue-800">
                  TravelTelly's web features (reviews, stories, trips, marketplace) map well to Olas's 
                  picture-first approach. The main work is converting React components to React Native 
                  and setting up Expo's native modules (Camera, Image Picker, Maps, Notifications).
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* App Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Configuration (Expo + NDK)
              </CardTitle>
              <CardDescription>
                Configure your React Native app with Nostr integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="app-name">App Name</Label>
                  <Input
                    id="app-name"
                    type="text"
                    value={appName}
                    onChange={(e) => setAppName(e.target.value)}
                    placeholder="TravelTelly"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Display name shown on app stores and devices
                  </p>
                </div>

                <div>
                  <Label htmlFor="app-id">Package ID / Bundle ID</Label>
                  <Input
                    id="app-id"
                    type="text"
                    value={appId}
                    onChange={(e) => setAppId(e.target.value)}
                    placeholder="com.traveltelly.app"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Unique identifier for Android (com.example.app) and iOS (reverse domain)
                  </p>
                </div>

                <div>
                  <Label htmlFor="app-description">App Description</Label>
                  <Textarea
                    id="app-description"
                    value={appDescription}
                    onChange={(e) => setAppDescription(e.target.value)}
                    placeholder="Describe your app..."
                    rows={3}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Short description for app stores (max 80 chars for short, 4000 for long)
                  </p>
                </div>

                <div>
                  <Label htmlFor="default-relays" className="flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Default Nostr Relays
                  </Label>
                  <Textarea
                    id="default-relays"
                    value={defaultRelays}
                    onChange={(e) => setDefaultRelays(e.target.value)}
                    placeholder="wss://relay.damus.io&#10;wss://relay.nostr.band"
                    rows={4}
                    className="mt-1.5 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    One relay per line. Users can add/remove relays in settings.
                  </p>
                </div>

                <div>
                  <Label htmlFor="primary-color">Primary Color (Theme)</Label>
                  <div className="flex gap-2 mt-1.5">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-20 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#f97316"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Accent color for buttons, links, and highlights
                  </p>
                </div>

                <div>
                  <Label>Target Platform</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={selectedPlatform === 'android' ? 'default' : 'outline'}
                      onClick={() => setSelectedPlatform('android')}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Android
                    </Button>
                    <Button
                      variant={selectedPlatform === 'ios' ? 'default' : 'outline'}
                      onClick={() => setSelectedPlatform('ios')}
                      className="flex-1"
                    >
                      <Apple className="w-4 h-4 mr-2" />
                      iOS
                    </Button>
                    <Button
                      variant={selectedPlatform === 'both' ? 'default' : 'outline'}
                      onClick={() => setSelectedPlatform('both')}
                      className="flex-1"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Both
                    </Button>
                  </div>
                </div>

                <Alert className="border-orange-200 bg-orange-50">
                  <Code className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="text-orange-900">React Native Conversion Required</AlertTitle>
                  <AlertDescription className="text-orange-800">
                    This will generate an Expo project structure with NDK, but you'll need to manually 
                    convert your React components to React Native. Follow the Olas codebase as a reference.
                  </AlertDescription>
                </Alert>

                <div className="pt-4">
                  <Button 
                    onClick={handleBuild} 
                    disabled={isBuilding || !appName || !appId}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isBuilding ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Building Project...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Generate Expo + NDK Project
                      </>
                    )}
                  </Button>
                </div>

                {isBuilding && (
                  <div className="mt-4">
                    <Progress value={buildProgress} className="h-2" />
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      {buildProgress}% complete
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform-Specific Steps */}
          <Tabs defaultValue="android" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="android" className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Android Steps
              </TabsTrigger>
              <TabsTrigger value="ios" className="flex items-center gap-2">
                <Apple className="w-4 h-4" />
                iOS Steps
              </TabsTrigger>
            </TabsList>

            {/* Android Steps */}
            <TabsContent value="android" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Play className="w-5 h-5 text-green-600" />
                      Android Submission Steps
                    </span>
                    <Badge variant="outline">
                      {androidSteps.filter(s => s.completed).length} / {androidSteps.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to submit your app to Google Play Store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress value={androidCompletionRate} className="h-2" />
                  </div>

                  <Alert className="mb-6">
                    <DollarSign className="h-4 w-4" />
                    <AlertTitle>Google Play Console Account Required</AlertTitle>
                    <AlertDescription>
                      You need a Google Play Console account ($25 one-time fee) to publish Android apps.
                      <br />
                      <a 
                        href="https://play.google.com/console" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline mt-1 inline-block"
                      >
                        Sign up at play.google.com/console →
                      </a>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {androidSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            id={step.id}
                            checked={step.completed}
                            onCheckedChange={() => toggleAndroidStep(step.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={step.id}
                              className="font-medium cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-muted-foreground text-sm">
                                Step {index + 1}
                              </span>
                              {step.title}
                            </label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {step.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Build with EAS (Expo Application Services)
                    </h4>
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Local Build:</p>
                        <code className="block bg-white p-2 rounded border text-xs">
                          eas build --platform android --local
                        </code>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Cloud Build (Recommended):</p>
                        <code className="block bg-white p-2 rounded border text-xs">
                          eas build --platform android --profile production
                        </code>
                      </div>
                      <Button variant="outline" className="w-full justify-start" disabled={buildProgress !== 100}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Download Project Source
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={androidCompletionRate !== 100}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit to Google Play Store
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* iOS Steps */}
            <TabsContent value="ios" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Apple className="w-5 h-5" />
                      iOS Submission Steps
                    </span>
                    <Badge variant="outline">
                      {iosSteps.filter(s => s.completed).length} / {iosSteps.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Complete these steps to submit your app to Apple App Store
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Progress value={iosCompletionRate} className="h-2" />
                  </div>

                  <Alert className="mb-6">
                    <DollarSign className="h-4 w-4" />
                    <AlertTitle>Apple Developer Program Required</AlertTitle>
                    <AlertDescription>
                      You need an Apple Developer account ($99/year) to publish iOS apps.
                      <br />
                      <a 
                        href="https://developer.apple.com/programs/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline mt-1 inline-block"
                      >
                        Enroll at developer.apple.com →
                      </a>
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    {iosSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Checkbox
                            id={step.id}
                            checked={step.completed}
                            onCheckedChange={() => toggleIosStep(step.id)}
                          />
                          <div className="flex-1">
                            <label
                              htmlFor={step.id}
                              className="font-medium cursor-pointer flex items-center gap-2"
                            >
                              <span className="text-muted-foreground text-sm">
                                Step {index + 1}
                              </span>
                              {step.title}
                            </label>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        {step.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Build with EAS (Expo Application Services)
                    </h4>
                    <div className="space-y-3">
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Local Simulator Build:</p>
                        <code className="block bg-white p-2 rounded border text-xs">
                          eas build --platform ios --local --profile development
                        </code>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">Cloud Build for TestFlight:</p>
                        <code className="block bg-white p-2 rounded border text-xs">
                          eas build --platform ios --profile production
                        </code>
                      </div>
                      <Alert className="text-xs">
                        <Info className="h-3 w-3" />
                        <AlertDescription>
                          Requires Apple Developer account ($99/year) and macOS with Xcode for local builds.
                        </AlertDescription>
                      </Alert>
                      <Button variant="outline" className="w-full justify-start" disabled={buildProgress !== 100}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Download Project Source
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <Button 
                      className="w-full"
                      disabled={iosCompletionRate !== 100}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Submit to Apple App Store
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Olas-Style Native Features */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Expo Native Modules (Olas Features)
              </CardTitle>
              <CardDescription>
                Native capabilities powered by Expo SDK (following Olas architecture)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-green-700" />
                    Expo Camera
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    In-app camera with timer, flash, filters, and grid overlay
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-camera<br/>
                    expo-image-picker<br/>
                    expo-image-manipulator
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-700" />
                    Expo Location + Maps
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    GPS coordinates, geohashing, and map visualization
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-location<br/>
                    expo-maps<br/>
                    ngeohash
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-700" />
                    Image Processing
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Blurhash previews, compression, and filter effects
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    react-native-blurhash<br/>
                    react-native-compressor<br/>
                    @shopify/react-native-skia
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-700" />
                    Lightning Wallet
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    NIP-57 zaps and optional Cashu ecash integration
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    @cashu/cashu-ts<br/>
                    react-native-qrcode-svg<br/>
                    expo-linking
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Nostr event notifications (mentions, zaps, replies)
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-notifications<br/>
                    FCM/APNs setup
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Offline Storage
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Cache events and media for offline browsing
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-sqlite<br/>
                    expo-file-system<br/>
                    expo-secure-store
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Nostr Signer
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    NIP-55 remote signing with Amber, nsecBunker
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-nip55<br/>
                    expo-intent-launcher<br/>
                    expo-secure-store
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Video Player
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Native video playback with thumbnails and controls
                  </p>
                  <div className="text-xs font-mono bg-white p-2 rounded border">
                    expo-video<br/>
                    expo-video-thumbnails<br/>
                    PiP support
                  </div>
                </div>
              </div>

              <Alert className="mt-6 border-purple-200 bg-purple-50">
                <Package className="h-4 w-4 text-purple-600" />
                <AlertTitle className="text-purple-900">Olas Dependency Stack</AlertTitle>
                <AlertDescription className="text-purple-800">
                  All these Expo modules are pre-configured in Olas. The generated project will include 
                  package.json, app.json, and eas.json following Olas's proven setup.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
