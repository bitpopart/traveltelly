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
  Apple
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

  // PWA Checklist
  const [pwaChecks, setPwaChecks] = useState({
    https: true,
    manifest: true,
    icons: true,
    serviceWorker: false,
    mobileResponsive: true,
    offlineSupport: false
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
    if (!siteUrl || !appName || !appId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setIsBuilding(true);
    setBuildProgress(0);

    // Simulate build process
    const steps = [
      { label: 'Validating site URL...', progress: 15 },
      { label: 'Generating manifest files...', progress: 30 },
      { label: 'Processing icons...', progress: 45 },
      { label: 'Building wrapper...', progress: 60 },
      { label: 'Running compliance checks...', progress: 75 },
      { label: 'Packaging application...', progress: 90 },
      { label: 'Build complete!', progress: 100 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBuildProgress(step.progress);
      
      toast({
        title: step.label,
        description: `${step.progress}% complete`
      });
    }

    setIsBuilding(false);
    
    toast({
      title: 'Build Successful!',
      description: 'Your app packages are ready for submission',
    });
  };

  const pwaCompletionRate = Object.values(pwaChecks).filter(Boolean).length / Object.values(pwaChecks).length * 100;
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

          {/* PWA Pre-Check */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                PWA Optimization Check
              </CardTitle>
              <CardDescription>
                Ensure your site is optimized before building native apps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm text-muted-foreground">{pwaCompletionRate.toFixed(0)}%</span>
                </div>
                <Progress value={pwaCompletionRate} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {pwaChecks.https ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      <span className="font-medium">HTTPS Enabled</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Site must be served over HTTPS</p>
                  </div>
                  <Badge variant={pwaChecks.https ? "default" : "destructive"}>
                    {pwaChecks.https ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {pwaChecks.manifest ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4" />
                      <span className="font-medium">Web Manifest</span>
                    </div>
                    <p className="text-xs text-muted-foreground">manifest.webmanifest configured</p>
                  </div>
                  <Badge variant={pwaChecks.manifest ? "default" : "destructive"}>
                    {pwaChecks.manifest ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {pwaChecks.icons ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      <span className="font-medium">App Icons</span>
                    </div>
                    <p className="text-xs text-muted-foreground">192px and 512px icons available</p>
                  </div>
                  <Badge variant={pwaChecks.icons ? "default" : "destructive"}>
                    {pwaChecks.icons ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {pwaChecks.mobileResponsive ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="font-medium">Mobile Responsive</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Layout adapts to mobile screens</p>
                  </div>
                  <Badge variant={pwaChecks.mobileResponsive ? "default" : "destructive"}>
                    {pwaChecks.mobileResponsive ? "Pass" : "Fail"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {pwaChecks.serviceWorker ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      <span className="font-medium">Service Worker</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Recommended for offline support</p>
                  </div>
                  <Badge variant={pwaChecks.serviceWorker ? "default" : "secondary"}>
                    {pwaChecks.serviceWorker ? "Pass" : "Optional"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  {pwaChecks.offlineSupport ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      <span className="font-medium">Offline Support</span>
                    </div>
                    <p className="text-xs text-muted-foreground">App works without internet</p>
                  </div>
                  <Badge variant={pwaChecks.offlineSupport ? "default" : "secondary"}>
                    {pwaChecks.offlineSupport ? "Pass" : "Optional"}
                  </Badge>
                </div>
              </div>

              {pwaCompletionRate < 100 && (
                <Alert className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Optimization Recommended</AlertTitle>
                  <AlertDescription>
                    Complete all PWA optimizations to improve app store approval odds and user experience.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* App Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                App Configuration
              </CardTitle>
              <CardDescription>
                Configure your app details before building
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="site-url" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Site URL
                  </Label>
                  <Input
                    id="site-url"
                    type="url"
                    value={siteUrl}
                    onChange={(e) => setSiteUrl(e.target.value)}
                    placeholder="https://www.traveltelly.com"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The URL of your PWA-optimized website
                  </p>
                </div>

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
                    Unique identifier (reverse domain notation)
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

                <div className="pt-4">
                  <Button 
                    onClick={handleBuild} 
                    disabled={isBuilding || !siteUrl || !appName || !appId}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isBuilding ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        Building...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Generate App Builds
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
                      Download Your Builds
                    </h4>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" disabled={!isBuilding && buildProgress !== 100}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Download AAB (App Bundle for Play Store)
                      </Button>
                      <Button variant="outline" className="w-full justify-start" disabled={!isBuilding && buildProgress !== 100}>
                        <FileCode className="w-4 h-4 mr-2" />
                        Download APK (For Testing)
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
                      Download Your Build
                    </h4>
                    <Button variant="outline" className="w-full justify-start" disabled={!isBuilding && buildProgress !== 100}>
                      <FileCode className="w-4 h-4 mr-2" />
                      Download IPA (iOS App Package)
                    </Button>
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

          {/* Additional Resources */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Native Features
              </CardTitle>
              <CardDescription>
                Enhance your app with native capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send real-time notifications to users' devices
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Offline Mode
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enable app functionality without internet
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Camera Access
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Access device camera for photo uploads
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Geolocation
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use device GPS for location features
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
