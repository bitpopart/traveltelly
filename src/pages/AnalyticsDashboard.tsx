import { useState, useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { nip19 } from 'nostr-tools';
import {
  ArrowLeft,
  Shield,
  TrendingUp,
  Users,
  Eye,
  MapPin,
  Star,
  BookOpen,
  Camera,
  Globe,
  Clock,
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  MousePointer,
  Hash
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useReviewCount, useStoryCount, useTripCount, useStockMediaCount } from '@/hooks/useLatestItems';

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: string;
  topPages: { page: string; views: number }[];
  topCountries: { country: string; visitors: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  dailyStats: { date: string; views: number; visitors: number }[];
}

export default function AnalyticsDashboard() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isTraveltellyAdmin = user?.pubkey === ADMIN_HEX;

  // Content counts
  const reviewCount = useReviewCount();
  const storyCount = useStoryCount();
  const tripCount = useTripCount();
  const { data: stockMediaCount = 0 } = useStockMediaCount();

  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Mock analytics data - in production, this would come from Google Analytics API
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    pageViews: 0,
    uniqueVisitors: 0,
    avgSessionDuration: '0:00',
    bounceRate: '0%',
    topPages: [],
    topCountries: [],
    deviceBreakdown: [],
    dailyStats: [],
  });

  useEffect(() => {
    // Check if Google Analytics is available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      console.log('📊 Google Analytics is active (GA4: G-ZCR363T6JN)');
    }
  }, []);

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
                  Only the Traveltelly admin can access the Analytics Dashboard.
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link to="/admin">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Panel
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                  <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                </div>
                <p className="text-muted-foreground">
                  Track visitor data, content performance, and site metrics
                </p>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex gap-2">
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                >
                  7 Days
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                >
                  30 Days
                </Button>
                <Button
                  variant={timeRange === '90d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90d')}
                >
                  90 Days
                </Button>
              </div>
            </div>
          </div>

          {/* Content Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reviewCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Total published</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Stories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{storyCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Total published</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Trips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tripCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Total published</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Stock Media
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stockMediaCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Available items</p>
              </CardContent>
            </Card>
          </div>

          {/* Google Analytics Integration Info */}
          <Card className="mb-6 border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-purple-600" />
                Google Analytics Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">Status: ✅ Active</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Google Analytics 4 is installed and tracking (Property ID: G-ZCR363T6JN)
                    </p>
                    <Badge variant="outline" className="text-xs">
                      Tracking: Page views, Events, User behavior
                    </Badge>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border space-y-3">
                  <p className="text-sm font-semibold">View Detailed Analytics:</p>
                  
                  <div className="space-y-2 text-xs">
                    <p>1. Visit <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">Google Analytics Dashboard</a></p>
                    <p>2. Select property: <strong>TravelTelly (G-ZCR363T6JN)</strong></p>
                    <p>3. View real-time data, user demographics, and traffic sources</p>
                  </div>

                  <a 
                    href="https://analytics.google.com/analytics/web/#/p461825503/reports/intelligenthome" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full mt-2 bg-purple-600 hover:bg-purple-700">
                      <Globe className="w-4 h-4 mr-2" />
                      Open Google Analytics
                    </Button>
                  </a>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold mb-2 text-orange-900 dark:text-orange-100">
                    📊 Key Metrics Available in Google Analytics:
                  </p>
                  <ul className="text-xs space-y-1 text-orange-800 dark:text-orange-200">
                    <li>• Real-time visitor count and activity</li>
                    <li>• Daily/weekly/monthly page views and unique visitors</li>
                    <li>• Traffic sources (direct, social, search engines)</li>
                    <li>• User demographics (country, city, device, browser)</li>
                    <li>• Content performance (most viewed pages)</li>
                    <li>• User engagement (session duration, bounce rate)</li>
                    <li>• Conversion tracking and goals</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Page Views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Check Google Analytics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Unique Visitors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Check Google Analytics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Avg. Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Check Google Analytics
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Bounce Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">—</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Check Google Analytics
                </p>
              </CardContent>
            </Card>
          </div>

          {/* SEO Status */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                SEO Optimization Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Meta Tags</p>
                      <p className="text-xs text-muted-foreground">
                        Optimized with keywords, descriptions, and Open Graph
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Sitemap.xml</p>
                      <p className="text-xs text-muted-foreground">
                        All main sections indexed for search engines
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Robots.txt</p>
                      <p className="text-xs text-muted-foreground">
                        Configured to allow crawling of public content
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Structured Data</p>
                      <p className="text-xs text-muted-foreground">
                        JSON-LD schema for better search results
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Eye className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">Google Analytics</p>
                      <p className="text-xs text-muted-foreground">
                        GA4 tracking all user interactions
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CalendarIcon className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">HTTPS & PWA</p>
                      <p className="text-xs text-muted-foreground">
                        Secure and mobile-optimized
                      </p>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold mb-2">🔍 SEO Tools:</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <a 
                    href="https://search.google.com/search-console" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      Google Search Console
                    </Button>
                  </a>
                  <a 
                    href="https://www.traveltelly.com/sitemap.xml" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      View Sitemap
                    </Button>
                  </a>
                  <a 
                    href="https://www.traveltelly.com/robots.txt" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      View Robots.txt
                    </Button>
                  </a>
                  <a 
                    href="https://developers.google.com/speed/pagespeed/insights/?url=https://www.traveltelly.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      PageSpeed Insights
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keywords and Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="w-5 h-5" />
                SEO Keywords & Content Strategy
              </CardTitle>
              <CardDescription>
                Optimized for search engine visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-sm mb-2">Primary Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'travel reviews',
                      'travel stories',
                      'trip planning',
                      'travel photography',
                      'destination reviews',
                      'travel blog',
                      'travel itineraries',
                      'stock photos',
                      'nostr travel',
                      'bitcoin travel'
                    ].map(keyword => (
                      <Badge key={keyword} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-sm mb-2">Content Categories:</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span><strong>{reviewCount}</strong> location reviews with ratings</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <span><strong>{storyCount}</strong> travel stories and guides</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span><strong>{tripCount}</strong> trip itineraries</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Camera className="w-4 h-4 text-pink-600" />
                      <span><strong>{stockMediaCount}</strong> travel photos for sale</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border">
                  <p className="font-semibold text-sm mb-2">SEO Best Practices Implemented:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>✅ Semantic HTML5 structure</li>
                    <li>✅ Mobile-responsive design (PWA)</li>
                    <li>✅ Fast loading times (Vite optimization)</li>
                    <li>✅ Image optimization with lazy loading</li>
                    <li>✅ Clean URLs with meaningful paths</li>
                    <li>✅ Internal linking structure</li>
                    <li>✅ Social sharing metadata (Open Graph)</li>
                    <li>✅ HTTPS security</li>
                    <li>✅ Canonical URLs</li>
                    <li>✅ Alt text on all images</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
