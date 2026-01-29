import { useState, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import { nip19 } from 'nostr-tools';
import { 
  Shield, 
  ArrowLeft, 
  Upload, 
  Download, 
  MapPin, 
  Camera, 
  Star,
  Coffee,
  Utensils,
  FileImage,
  Eye,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MarkerConfig {
  name: string;
  file: string;
  description: string;
  icon: typeof MapPin;
  color: string;
  category: string;
}

const markerConfigs: MarkerConfig[] = [
  {
    name: 'Review Marker',
    file: 'main-marker.svg',
    description: 'Default marker for reviews with rating display',
    icon: Star,
    color: '#27b0ff',
    category: 'review'
  },
  {
    name: 'Cafe Marker',
    file: 'cafe-marker.svg',
    description: 'Marker for cafe category with coffee cup icon',
    icon: Coffee,
    color: '#27b0ff',
    category: 'cafe'
  },
  {
    name: 'Restaurant Marker',
    file: 'restaurant-marker.svg',
    description: 'Marker for restaurant category with fork and knife icon',
    icon: Utensils,
    color: '#27b0ff',
    category: 'restaurant'
  },
  {
    name: 'Stock Media Marker',
    file: 'stock-media-marker-new.svg',
    description: 'Marker for stock media with camera and yellow star',
    icon: FileImage,
    color: '#ce1313',
    category: 'stock-media'
  }
];

export default function MapMarkerEditor() {
  const { user } = useCurrentUser();
  const { isAdmin, isCheckingPermission } = useReviewPermissions();
  const [selectedMarker, setSelectedMarker] = useState<MarkerConfig | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Double-check that this is specifically the admin npub
  const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
  const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;
  const isAuthorizedAdmin = user?.pubkey === ADMIN_HEX;

  if (isCheckingPermission) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card>
              <CardContent className="py-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">Checking admin permissions...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin || !isAuthorizedAdmin) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-8 text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-red-600" />
                <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
                <p className="text-muted-foreground mb-6">
                  Only authorized admins can access the map marker editor.
                </p>
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (marker: MarkerConfig) => {
    if (!fileInputRef.current?.files?.[0]) {
      setUploadStatus({ success: false, message: 'No file selected' });
      return;
    }

    const file = fileInputRef.current.files[0];
    
    // Validate file type
    if (!file.type.includes('svg')) {
      setUploadStatus({ success: false, message: 'Only SVG files are supported' });
      return;
    }

    // In a real implementation, this would upload to the server
    // For now, we'll just show instructions
    setUploadStatus({ 
      success: true, 
      message: `To update ${marker.name}, replace /public/${marker.file} with your new SVG file and rebuild the project.` 
    });

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadMarker = (marker: MarkerConfig) => {
    // Create a link to download the marker
    const link = document.createElement('a');
    link.href = `/${marker.file}`;
    link.download = marker.file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen dark:from-gray-900 dark:to-gray-800" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/admin">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin Panel
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold">Map Marker Editor</h1>
            </div>
            <p className="text-muted-foreground">
              Manage and customize map markers for reviews, categories, and stock media
            </p>
          </div>

          {/* Status Message */}
          {uploadStatus && (
            <Card className={`mb-6 ${uploadStatus.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  {uploadStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <p className={uploadStatus.success ? 'text-green-900' : 'text-red-900'}>
                    {uploadStatus.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">How to Update Markers</h3>
                  <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                    <li>Download the current marker SVG for reference</li>
                    <li>Create or edit your SVG file (maintain viewBox and structure)</li>
                    <li>Replace the file in <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">/public/</code> directory</li>
                    <li>Rebuild the project to see changes on the map</li>
                  </ol>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                    💡 <strong>Tip:</strong> Keep the same viewBox dimensions and anchor points for consistent sizing.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Marker Management Tabs */}
          <Tabs defaultValue="markers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="markers">
                <MapPin className="w-4 h-4 mr-2" />
                Manage Markers
              </TabsTrigger>
              <TabsTrigger value="guidelines">
                <Info className="w-4 h-4 mr-2" />
                Design Guidelines
              </TabsTrigger>
            </TabsList>

            <TabsContent value="markers" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {markerConfigs.map((marker) => {
                  const Icon = marker.icon;
                  return (
                    <Card key={marker.file} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${marker.color}20` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: marker.color }} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{marker.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">{marker.category}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{marker.description}</p>
                        
                        {/* Preview */}
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4 flex items-center justify-center">
                          <img 
                            src={`/${marker.file}`} 
                            alt={marker.name}
                            className="h-24 object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/main-marker.svg';
                            }}
                          />
                        </div>

                        <div className="text-xs text-muted-foreground mb-4 font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          /public/{marker.file}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadMarker(marker)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedMarker(marker);
                              fileInputRef.current?.click();
                            }}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Replace
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                className="hidden"
                onChange={() => selectedMarker && handleFileUpload(selectedMarker)}
              />
            </TabsContent>

            <TabsContent value="guidelines" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marker Design Guidelines</CardTitle>
                  <CardDescription>
                    Follow these guidelines to ensure your custom markers work properly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      ViewBox & Dimensions
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                      <li>Review markers use viewBox: <code>0 0 76.12 113.81</code></li>
                      <li>Stock media markers use viewBox: <code>0 0 72.61 100.72</code></li>
                      <li>Icon size on map: 42x62 pixels (reviews), 40x55 pixels (stock media)</li>
                      <li>Maintain aspect ratio for consistent appearance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Anchor Points
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                      <li>Icon anchor should be at the bottom center (pin tip)</li>
                      <li>Review markers: <code>iconAnchor: [21, 62]</code></li>
                      <li>Stock media: <code>iconAnchor: [20, 55]</code></li>
                      <li>This ensures the marker points to the exact location</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      Color & Style
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                      <li>Review markers: Blue base <code>#27b0ff</code>, yellow star <code>#fc0</code></li>
                      <li>Stock media: Red base <code>#ce1313</code>, yellow star <code>#fc0</code></li>
                      <li>Include drop shadow for depth: <code>feGaussianBlur stdDeviation="2"</code></li>
                      <li>White (#fff) for inner content/icons for visibility</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Icon Elements
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                      <li>Keep icon elements simple and recognizable</li>
                      <li>Use white fill for icons inside the marker circle</li>
                      <li>Text/rating should be centered in the white circle</li>
                      <li>Category markers can have custom icons (coffee cup, fork/knife, etc.)</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">
                      ⚠️ Important Notes
                    </h3>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 ml-6 list-disc">
                      <li>Always test markers at different zoom levels</li>
                      <li>Ensure text/numbers remain readable when scaled</li>
                      <li>Avoid overly complex paths (impacts performance)</li>
                      <li>Use semantic file names (e.g., cafe-marker.svg, restaurant-marker.svg)</li>
                      <li>After updating, clear browser cache to see changes</li>
                    </ul>
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
