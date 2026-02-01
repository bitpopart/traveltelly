import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { nip19 } from 'nostr-tools';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Download, AlertCircle, Image as ImageIcon } from 'lucide-react';
import * as geohash from 'ngeohash';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

interface CSVRow {
  title: string;
  description: string;
  price: string;
  currency: string;
  mediaType: string;
  category: string;
  location: string;
  latitude: string;
  longitude: string;
  keywords: string;
  imageUrls: string; // Comma-separated image URLs or paths
}

interface UploadItem {
  rowIndex: number;
  data: CSVRow;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  eventId?: string;
}

const CSV_TEMPLATE = `title,description,price,currency,mediaType,category,location,latitude,longitude,keywords,imageUrls
"Sunset Over Mountains","Beautiful sunset landscape photography",25,USD,photos,Landscape,"Yosemite National Park",37.865101,-119.538330,"sunset,mountains,nature,landscape","https://example.com/image1.jpg,https://example.com/image2.jpg"
"Urban Street Scene","City street photography with vibrant colors",15,EUR,photos,Travel,"Paris, France",48.856614,2.352222,"urban,street,city,architecture","https://example.com/city.jpg"
"Business Meeting","Corporate team collaboration photo",30,USD,photos,Business,"New York, NY",40.712776,-74.005974,"business,meeting,corporate,team","https://example.com/meeting.jpg"`;

export function AdminMassUpload() {
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = user?.pubkey === nip19.decode(ADMIN_NPUB).data;

  if (!user || !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Only the Traveltelly admin can access mass upload functionality.</p>
        </CardContent>
      </Card>
    );
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'marketplace-upload-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Template Downloaded',
      description: 'CSV template has been downloaded to your device.',
    });
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data');
    }

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    // Validate required headers
    const requiredHeaders = ['title', 'description', 'price', 'currency', 'mediaType', 'category'];
    const missingHeaders = requiredHeaders.filter(h => !header.includes(h));
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
    }

    // Parse rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parsing (handles quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      // Map values to object
      const row: Record<string, string> = {};
      header.forEach((key, idx) => {
        row[key] = values[idx] || '';
      });

      rows.push(row as CSVRow);
    }

    return rows;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setCSVFile(file);
    
    // Parse CSV file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        
        const items: UploadItem[] = rows.map((data, index) => ({
          rowIndex: index + 2, // +2 because row 1 is header, and arrays are 0-indexed
          data,
          status: 'pending',
        }));
        
        setUploadItems(items);
        toast({
          title: 'CSV Parsed Successfully',
          description: `Found ${items.length} items to upload.`,
        });
      } catch (error) {
        toast({
          title: 'CSV Parse Error',
          description: error instanceof Error ? error.message : 'Failed to parse CSV file',
          variant: 'destructive',
        });
        setCSVFile(null);
      }
    };
    reader.readAsText(file);
  };

  const validateRow = (row: CSVRow): string | null => {
    if (!row.title?.trim()) return 'Title is required';
    if (!row.description?.trim()) return 'Description is required';
    if (!row.price?.trim()) return 'Price is required';
    if (!row.currency?.trim()) return 'Currency is required';
    if (!row.mediaType?.trim()) return 'Media Type is required';
    if (!row.category?.trim()) return 'Category is required';

    const price = parseFloat(row.price);
    if (isNaN(price) || price <= 0) return 'Price must be a valid positive number';

    return null;
  };

  const processImageUrls = async (imageUrls: string): Promise<string[]> => {
    if (!imageUrls?.trim()) return [];
    
    // Split by comma and clean up URLs
    const urls = imageUrls.split(',').map(url => url.trim()).filter(Boolean);
    
    // For now, we'll use the URLs directly
    // In future, could add support for uploading local files
    return urls;
  };

  const uploadSingleItem = async (item: UploadItem): Promise<void> => {
    const { data } = item;
    
    // Validate row
    const validationError = validateRow(data);
    if (validationError) {
      throw new Error(validationError);
    }

    // Process image URLs
    const images = await processImageUrls(data.imageUrls);

    // Build tags for NIP-99 classified listing
    const productId = `mass_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tags: string[][] = [
      ['d', productId],
      ['title', data.title],
      ['summary', data.description.slice(0, 200)],
      ['price', data.price, data.currency.toUpperCase()],
      ['t', data.mediaType],
      ['category', data.category],
      ['status', 'active'],
      ['published_at', Math.floor(Date.now() / 1000).toString()],
    ];

    // Add location if provided
    if (data.location?.trim()) {
      tags.push(['location', data.location.trim()]);
    }

    // Add keywords as tags
    if (data.keywords?.trim()) {
      const keywordList = data.keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      
      keywordList.forEach(keyword => {
        tags.push(['t', keyword.toLowerCase()]);
      });
    }

    // Add geohash if coordinates provided
    if (data.latitude?.trim() && data.longitude?.trim()) {
      const lat = parseFloat(data.latitude);
      const lng = parseFloat(data.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const hash = geohash.encode(lat, lng, 8);
        tags.push(['g', hash]);
      }
    }

    // Add image tags
    images.forEach(imageUrl => {
      tags.push(['image', imageUrl]);
    });

    // Publish event
    await publishEvent({
      kind: 30402,
      content: data.description,
      tags,
    });
  };

  const handleStartUpload = async () => {
    if (uploadItems.length === 0) {
      toast({
        title: 'No Items to Upload',
        description: 'Please upload a CSV file first.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    for (let i = 0; i < uploadItems.length; i++) {
      const item = uploadItems[i];
      setCurrentUploadIndex(i);
      
      // Update status to uploading
      setUploadItems(prev => prev.map((it, idx) => 
        idx === i ? { ...it, status: 'uploading' } : it
      ));

      try {
        await uploadSingleItem(item);
        
        // Update status to completed
        setUploadItems(prev => prev.map((it, idx) => 
          idx === i ? { ...it, status: 'completed' } : it
        ));
      } catch (error) {
        console.error(`Error uploading item ${i + 1}:`, error);
        
        // Update status to error
        setUploadItems(prev => prev.map((it, idx) => 
          idx === i ? { 
            ...it, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : it
        ));
      }
    }

    setCurrentUploadIndex(-1);
    setIsProcessing(false);
    
    const completed = uploadItems.filter(it => it.status === 'completed').length;
    const failed = uploadItems.filter(it => it.status === 'error').length;
    
    toast({
      title: 'Upload Complete',
      description: `Successfully uploaded ${completed} items. ${failed > 0 ? `${failed} failed.` : ''}`,
    });
  };

  const handleReset = () => {
    setCSVFile(null);
    setUploadItems([]);
    setCurrentUploadIndex(-1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const completedCount = uploadItems.filter(it => it.status === 'completed').length;
  const errorCount = uploadItems.filter(it => it.status === 'error').length;
  const progress = uploadItems.length > 0 ? (completedCount / uploadItems.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Mass Upload Stock Media
          </CardTitle>
          <CardDescription>
            Upload multiple marketplace items at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="space-y-3">
            <Label>Step 1: Download CSV Template</Label>
            <Button 
              variant="outline" 
              onClick={handleDownloadTemplate}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
            <p className="text-sm text-muted-foreground">
              Download the template, fill in your product data, and upload it below.
            </p>
          </div>

          <Separator />

          {/* File Upload */}
          <div className="space-y-3">
            <Label htmlFor="csv-upload">Step 2: Upload Your CSV File</Label>
            <Input
              ref={fileInputRef}
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {csvFile && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <FileText className="w-4 h-4" />
                <span>{csvFile.name} ({uploadItems.length} items)</span>
              </div>
            )}
          </div>

          <Separator />

          {/* CSV Requirements */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">CSV Requirements:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Required fields:</strong> title, description, price, currency, mediaType, category</li>
                  <li><strong>Optional fields:</strong> location, latitude, longitude, keywords, imageUrls</li>
                  <li><strong>Keywords:</strong> Comma-separated tags for better discoverability</li>
                  <li><strong>Image URLs:</strong> Comma-separated URLs (must be publicly accessible)</li>
                  <li><strong>Coordinates:</strong> Latitude (-90 to 90), Longitude (-180 to 180)</li>
                  <li><strong>Currency:</strong> USD, EUR, GBP, CAD, AUD, BTC, SATS</li>
                  <li><strong>Media Type:</strong> photos, videos, audio, graphics, etc.</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>
              {uploadItems.length} items ready to upload
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing: {currentUploadIndex + 1} / {uploadItems.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-4">
              <Badge variant="secondary">
                {uploadItems.length} Total
              </Badge>
              {completedCount > 0 && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {completedCount} Completed
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="w-3 h-3 mr-1" />
                  {errorCount} Failed
                </Badge>
              )}
            </div>

            {/* Items List */}
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
              {uploadItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    item.status === 'uploading' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' :
                    item.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                    item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                    'bg-gray-50 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{item.data.title}</span>
                      {item.data.imageUrls && (
                        <Badge variant="outline" className="text-xs">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {item.data.imageUrls.split(',').length}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {item.data.price} {item.data.currency}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {item.data.mediaType}
                      </span>
                    </div>
                    {item.error && (
                      <p className="text-xs text-red-600 mt-1">{item.error}</p>
                    )}
                  </div>
                  <div>
                    {item.status === 'pending' && (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                    {item.status === 'uploading' && (
                      <Badge variant="default" className="bg-blue-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Uploading
                      </Badge>
                    )}
                    {item.status === 'completed' && (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    )}
                    {item.status === 'error' && (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isProcessing}
                className="flex-1"
              >
                Reset
              </Button>
              <Button
                onClick={handleStartUpload}
                disabled={isProcessing || uploadItems.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Upload
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
