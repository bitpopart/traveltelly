import { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { useNostr } from '@nostrify/react';
import { extractPhotoMetadata, type PhotoMetadata } from '@/lib/exifUtils';
import { CONTINENTS, getCountriesByContinent } from '@/lib/geoData';
import { nip19 } from 'nostr-tools';
import { Upload, FileText, CheckCircle2, XCircle, Loader2, Download, AlertCircle, Image as ImageIcon, X, FileUp, Edit2, Save, CheckSquare, Square, Repeat, Globe2, FolderTree } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import * as geohash from 'ngeohash';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';

const MEDIA_TYPES = ['photos', 'videos', 'audio', 'graphics', 'templates', '3d-models', 'fonts', 'presets'];

const CATEGORIES = [
  'Animals',
  'Buildings and Architecture',
  'Business',
  'Drinks',
  'The Environment',
  'States of Mind',
  'Food',
  'Graphic Resources',
  'Hobbies and Leisure',
  'Industry',
  'Landscape',
  'Lifestyle',
  'People',
  'Plants and Flowers',
  'Culture and Religion',
  'Science',
  'Social Issues',
  'Sports',
  'Technology',
  'Transport',
  'Travel',
];

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'BTC', name: 'Bitcoin' },
  { code: 'SATS', name: 'Satoshis' },
];

interface UploadItem {
  id: string;
  file: File;
  previewUrl?: string; // Thumbnail preview URL
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
  imageUrl?: string;
  status: 'pending' | 'extracting' | 'ready' | 'uploading' | 'completed' | 'error';
  error?: string;
  isEditing?: boolean;
  metadata?: PhotoMetadata;
  continent: string;
  country: string;
}

const CSV_TEMPLATE = `title,description,price,currency,mediaType,category,location,latitude,longitude,keywords,continent,country,filename
"Sunset Over Mountains","Beautiful sunset landscape photography",25,USD,photos,Landscape,"Yosemite National Park",37.865101,-119.538330,"sunset,mountains,nature,landscape",north-america,US,"sunset1.jpg"
"Urban Street Scene","City street photography with vibrant colors",15,EUR,photos,Travel,"Paris, France",48.856614,2.352222,"urban,street,city,architecture",europe,FR,"paris-street.jpg"
"Business Meeting","Corporate team collaboration photo",30,USD,photos,Business,"New York, NY",40.712776,-74.005974,"business,meeting,corporate,team",north-america,US,"meeting.jpg"`;

export function AdminMassUpload() {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState(-1);
  const [isDragging, setIsDragging] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditPrice, setBulkEditPrice] = useState('');
  const [bulkEditCurrency, setBulkEditCurrency] = useState('USD');
  const [bulkEditCategory, setBulkEditCategory] = useState('__KEEP_UNCHANGED__');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);
  
  const { user } = useCurrentUser();
  const { nostr } = useNostr();
  const { mutateAsync: publishEvent } = useNostrPublish();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = user?.pubkey === nip19.decode(ADMIN_NPUB).data;

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      uploadItems.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [uploadItems]);

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

  const extractMetadataFromFiles = async (files: File[]) => {
    setIsExtracting(true);
    const newItems: UploadItem[] = [];

    for (const file of files) {
      const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create preview URL for images
      const previewUrl = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined;

      // Create initial item
      const item: UploadItem = {
        id: itemId,
        file,
        previewUrl,
        title: '',
        description: '',
        price: '0.99',
        currency: 'USD',
        mediaType: file.type.startsWith('video/') ? 'videos' : 'photos',
        category: 'building-architecture',
        location: '',
        latitude: '',
        longitude: '',
        keywords: '',
        status: 'extracting',
        continent: '',
        country: '',
      };

      setUploadItems(prev => [...prev, item]);

      try {
        // Extract metadata from photo
        const metadata = await extractPhotoMetadata(file);
        
        // Update item with extracted metadata
        // Normalize the filename to properly handle special characters
        const normalizedFilename = file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ')     // Replace dashes and underscores with spaces
          .normalize('NFC');          // Normalize Unicode characters
        
        item.title = metadata.title || normalizedFilename;
        item.description = metadata.description || '';
        item.keywords = metadata.keywords?.join(', ') || '';
        item.metadata = metadata;
        
        // Set GPS if available
        if (metadata.gps) {
          item.latitude = metadata.gps.latitude.toString();
          item.longitude = metadata.gps.longitude.toString();
        }
        
        item.status = 'ready';
        
        console.log(`📸 Extracted metadata for ${file.name}:`, metadata);
      } catch (error) {
        console.error(`Error extracting metadata from ${file.name}:`, error);
        // Still create item but with basic info
        // Normalize the filename to properly handle special characters
        const normalizedFilename = file.name
          .replace(/\.[^/.]+$/, '') // Remove extension
          .replace(/[-_]/g, ' ')     // Replace dashes and underscores with spaces
          .normalize('NFC');          // Normalize Unicode characters
        
        item.title = normalizedFilename;
        item.status = 'ready';
      }

      // Update the item in state
      setUploadItems(prev => prev.map(i => i.id === itemId ? item : i));
    }

    setIsExtracting(false);
    
    toast({
      title: 'Metadata Extracted',
      description: `Processed ${files.length} files. Review and edit details before uploading.`,
    });
  };

  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    // Filter only image and video files
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length !== files.length) {
      toast({
        title: 'Some Files Skipped',
        description: 'Only image and video files are supported.',
        variant: 'destructive',
      });
    }

    if (validFiles.length === 0) return;

    // Extract metadata from all files
    await extractMetadataFromFiles(validFiles);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const parseCSV = (text: string): Record<string, string>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV file is empty or missing data');
    }

    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

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

      const row: Record<string, string> = {};
      header.forEach((key, idx) => {
        row[key] = values[idx] || '';
      });

      rows.push(row);
    }

    return rows;
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const csvData = parseCSV(text);
        
        // Match CSV data with existing items by filename
        setUploadItems(prev => prev.map(item => {
          const matchingRow = csvData.find(row => 
            row.filename && item.file.name === row.filename.trim()
          );
          
          if (matchingRow) {
            return {
              ...item,
              title: matchingRow.title || item.title,
              description: matchingRow.description || item.description,
              price: matchingRow.price || item.price,
              currency: matchingRow.currency || item.currency,
              mediaType: matchingRow.mediaType || item.mediaType,
              category: matchingRow.category || item.category,
              location: matchingRow.location || item.location,
              latitude: matchingRow.latitude || item.latitude,
              longitude: matchingRow.longitude || item.longitude,
              keywords: matchingRow.keywords || item.keywords,
              continent: matchingRow.continent || item.continent,
              country: matchingRow.country || item.country,
            };
          }
          return item;
        }));

        toast({
          title: 'CSV Imported',
          description: 'CSV data has been matched with uploaded files.',
        });
      } catch (error) {
        toast({
          title: 'CSV Import Error',
          description: error instanceof Error ? error.message : 'Failed to parse CSV',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  };

  const updateItem = (id: string, updates: Partial<UploadItem>) => {
    setUploadItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => prev.filter(item => item.id !== id));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allItemIds = uploadItems.map(item => item.id);
    setSelectedItems(new Set(allItemIds));
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  const applyBulkEdit = () => {
    const updates: Partial<UploadItem> = {};
    
    if (bulkEditPrice) {
      updates.price = bulkEditPrice;
    }
    if (bulkEditCurrency) {
      updates.currency = bulkEditCurrency;
    }
    if (bulkEditCategory && bulkEditCategory !== '__KEEP_UNCHANGED__') {
      updates.category = bulkEditCategory;
    }

    setUploadItems(prev => prev.map(item => {
      if (selectedItems.has(item.id)) {
        return { ...item, ...updates };
      }
      return item;
    }));

    setShowBulkEdit(false);
    setBulkEditPrice('');
    setBulkEditCategory('__KEEP_UNCHANGED__');
    
    toast({
      title: 'Bulk Edit Applied',
      description: `Updated ${selectedItems.size} items.`,
    });
  };

  const unlockItem = (id: string) => {
    updateItem(id, { status: 'ready' });
  };

  const validateItem = (item: UploadItem): string | null => {
    if (!item.title?.trim()) return 'Title is required';
    if (!item.description?.trim()) return 'Description is required';
    if (!item.price?.trim()) return 'Price is required';
    if (!item.currency?.trim()) return 'Currency is required';
    if (!item.mediaType?.trim()) return 'Media Type is required';
    if (!item.category?.trim()) return 'Category is required';
    if (!item.continent?.trim()) return 'Continent is required (for organizing media)';
    if (!item.country?.trim()) return 'Country is required (for organizing media)';

    const price = parseFloat(item.price);
    if (isNaN(price) || price <= 0) return 'Price must be a valid positive number';

    return null;
  };

  const uploadSingleItem = async (item: UploadItem): Promise<void> => {
    // Validate
    const validationError = validateItem(item);
    if (validationError) {
      throw new Error(validationError);
    }

    // Upload file to Blossom
    const result = await uploadFile(item.file);
    const imageUrl = result[0][1];

    // Build tags for NIP-99 classified listing
    const productId = `mass_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tags: string[][] = [
      ['d', productId],
      ['title', item.title],
      ['summary', item.description.slice(0, 200)],
      ['price', item.price, item.currency.toUpperCase()],
      ['t', item.mediaType],
      ['category', item.category],
      ['status', 'active'],
      ['published_at', Math.floor(Date.now() / 1000).toString()],
      ['image', imageUrl],
    ];

    // Add geographical organization tags
    if (item.continent?.trim()) {
      tags.push(['continent', item.continent.trim()]);
    }
    if (item.country?.trim()) {
      tags.push(['country', item.country.trim()]);
    }
    if (item.continent?.trim() && item.country?.trim()) {
      tags.push(['geo_folder', `${item.continent.trim()}/${item.country.trim()}`]);
    }

    // Add location if provided
    if (item.location?.trim()) {
      tags.push(['location', item.location.trim()]);
    }

    // Add keywords as tags
    if (item.keywords?.trim()) {
      const keywordList = item.keywords
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
      
      keywordList.forEach(keyword => {
        tags.push(['t', keyword.toLowerCase()]);
      });
    }

    // Add geohash if coordinates provided
    if (item.latitude?.trim() && item.longitude?.trim()) {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);
      
      if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
        const hash = geohash.encode(lat, lng, 8);
        tags.push(['g', hash]);
      }
    }

    // Publish event
    await publishEvent({
      kind: 30402,
      content: item.description,
      tags,
    });
  };

  // Batch upload and sign all events at once
  const uploadAndSignBatch = async (items: UploadItem[]) => {
    if (!user) throw new Error("User not logged in");

    // Step 1: Upload all files to Blossom first
    const uploadResults: Array<{ item: UploadItem; imageUrl: string; productId: string; tags: string[][] }> = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setCurrentUploadIndex(i);
      updateItem(item.id, { status: 'uploading' });

      try {
        // Validate
        const validationError = validateItem(item);
        if (validationError) {
          throw new Error(validationError);
        }

        // Upload file to Blossom
        const result = await uploadFile(item.file);
        const imageUrl = result[0][1];

        // Build tags for NIP-99 classified listing
        const productId = `mass_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tags: string[][] = [
          ['d', productId],
          ['title', item.title],
          ['summary', item.description.slice(0, 200)],
          ['price', item.price, item.currency.toUpperCase()],
          ['t', item.mediaType],
          ['category', item.category],
          ['status', 'active'],
          ['published_at', Math.floor(Date.now() / 1000).toString()],
          ['image', imageUrl],
        ];

        // Add location if provided
        if (item.location?.trim()) {
          tags.push(['location', item.location.trim()]);
        }

        // Add keywords as tags
        if (item.keywords?.trim()) {
          const keywordList = item.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean);
          
          keywordList.forEach(keyword => {
            tags.push(['t', keyword.toLowerCase()]);
          });
        }

        // Add geohash if coordinates provided
        if (item.latitude?.trim() && item.longitude?.trim()) {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);
          
          if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            const hash = geohash.encode(lat, lng, 8);
            tags.push(['g', hash]);
          }
        }

        // Add geographical organization tags
        if (item.continent?.trim()) {
          tags.push(['continent', item.continent.trim()]);
        }
        if (item.country?.trim()) {
          tags.push(['country', item.country.trim()]);
        }
        if (item.continent?.trim() && item.country?.trim()) {
          tags.push(['geo_folder', `${item.continent.trim()}/${item.country.trim()}`]);
        }

        uploadResults.push({ item, imageUrl, productId, tags });
        updateItem(item.id, { status: 'ready' }); // Mark as ready for signing
      } catch (error) {
        console.error(`Error uploading item ${i + 1}:`, error);
        updateItem(item.id, { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }
    }

    // Step 2: Sign all events in rapid succession
    toast({
      title: 'Files Uploaded',
      description: `All ${uploadResults.length} files uploaded. Now signing ${uploadResults.length} Nostr events. Please approve all signature requests in your extension.`,
      duration: 5000,
    });

    const signedEvents: Array<{ item: UploadItem; event: any }> = [];
    
    for (let i = 0; i < uploadResults.length; i++) {
      const { item, tags } = uploadResults[i];
      setCurrentUploadIndex(items.indexOf(item));
      updateItem(item.id, { status: 'uploading' }); // Reuse 'uploading' status for signing

      try {
        // Add client tag
        const finalTags = [...tags];
        if (location.protocol === "https:" && !finalTags.some(([name]) => name === "client")) {
          finalTags.push(["client", location.hostname]);
        }

        // Sign the event
        const event = await user.signer.signEvent({
          kind: 30402,
          content: item.description,
          tags: finalTags,
          created_at: Math.floor(Date.now() / 1000),
        });

        signedEvents.push({ item, event });
      } catch (error) {
        console.error(`Error signing event ${i + 1}:`, error);
        updateItem(item.id, { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Signing failed'
        });
      }
    }

    // Step 3: Publish all signed events
    toast({
      title: 'Events Signed',
      description: `${signedEvents.length} events signed. Now publishing to relays...`,
    });

    for (let i = 0; i < signedEvents.length; i++) {
      const { item, event } = signedEvents[i];
      setCurrentUploadIndex(items.indexOf(item));

      try {
        await nostr.event(event, { signal: AbortSignal.timeout(5000) });
        updateItem(item.id, { status: 'completed' });
      } catch (error) {
        console.error(`Error publishing event ${i + 1}:`, error);
        updateItem(item.id, { 
          status: 'error',
          error: error instanceof Error ? error.message : 'Publishing failed'
        });
      }
    }
  };

  const handleStartUpload = async () => {
    if (uploadItems.length === 0) {
      toast({
        title: 'No Items to Upload',
        description: 'Please upload some files first.',
        variant: 'destructive',
      });
      return;
    }

    // Check if all items are ready
    const notReady = uploadItems.filter(item => item.status !== 'ready');
    if (notReady.length > 0) {
      toast({
        title: 'Items Not Ready',
        description: `${notReady.length} items are still being processed. Please wait.`,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Use batch upload and signing
      await uploadAndSignBatch(uploadItems);
    } catch (error) {
      console.error('Batch upload error:', error);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'An error occurred during batch upload',
        variant: 'destructive',
      });
    }

    setCurrentUploadIndex(-1);
    setIsProcessing(false);
    
    const completed = uploadItems.filter(it => it.status === 'completed').length;
    const failed = uploadItems.filter(it => it.status === 'error').length;
    
    toast({
      title: 'Upload Complete',
      description: `Successfully uploaded ${completed} items. ${failed > 0 ? `${failed} failed.` : ''} Page will refresh in 2 seconds...`,
    });

    // Refresh the page after 2 seconds to reset the form
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  const handleReset = () => {
    setUploadItems([]);
    setCurrentUploadIndex(-1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (csvInputRef.current) {
      csvInputRef.current.value = '';
    }
  };

  const completedCount = uploadItems.filter(it => it.status === 'completed').length;
  const errorCount = uploadItems.filter(it => it.status === 'error').length;
  const readyCount = uploadItems.filter(it => it.status === 'ready').length;
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
            Upload files and auto-extract metadata, or import CSV for bulk data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Files Upload */}
          <div className="space-y-3">
            <Label htmlFor="image-files">Upload Image/Video Files</Label>
            
            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <FileUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm font-medium mb-2">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Metadata will be automatically extracted from photos (title, description, keywords, GPS)
              </p>
              <Input
                ref={fileInputRef}
                id="image-files"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleImageFilesChange}
                disabled={isProcessing || isExtracting}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Extracting Metadata...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Select Files
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Optional CSV Import */}
          {uploadItems.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Optional: Import CSV Data</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCsvUpload(!showCsvUpload)}
                  >
                    {showCsvUpload ? 'Hide' : 'Show'} CSV Import
                  </Button>
                </div>
                
                {showCsvUpload && (
                  <div className="space-y-3 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Button 
                      variant="outline" 
                      onClick={handleDownloadTemplate}
                      className="w-full"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV Template
                    </Button>
                    
                    <Input
                      ref={csvInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCSVImport}
                      disabled={isProcessing}
                    />
                    
                    <p className="text-xs text-muted-foreground">
                      CSV data will override auto-extracted metadata for matched files (by filename)
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-semibold">How it works:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Upload files:</strong> Drag & drop or select your images/videos</li>
                  <li><strong>Auto-extract:</strong> Title, description, keywords, and GPS from EXIF/IPTC metadata</li>
                  <li><strong>Review & Edit:</strong> Check and modify the extracted data</li>
                  <li><strong>Optional CSV:</strong> Import CSV to override or fill missing data</li>
                  <li><strong>Upload:</strong> Files are uploaded to Blossom and published to marketplace</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Category Guide */}
      {uploadItems.length > 0 && uploadItems.some(item => !item.category) && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold text-blue-900 dark:text-blue-100">📖 How to Choose Category:</p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Look at each photo thumbnail and select the category based on <strong>what's shown in the photo</strong>:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-blue-800 dark:text-blue-200 mt-2">
                <div>• People/portraits → <strong>People</strong></div>
                <div>• Mountains/ocean → <strong>Landscape</strong></div>
                <div>• Buildings/monuments → <strong>Buildings and Architecture</strong></div>
                <div>• Food/meals → <strong>Food</strong></div>
                <div>• Coffee/beverages → <strong>Drinks</strong></div>
                <div>• Animals/pets → <strong>Animals</strong></div>
                <div>• Cities/streets → <strong>Travel</strong></div>
                <div>• Office/meetings → <strong>Business</strong></div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Queue */}
      {uploadItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>
              {uploadItems.length} items • {readyCount} ready • {completedCount} completed
              {uploadItems.filter(item => !item.category).length > 0 && (
                <span className="text-orange-600 ml-2">
                  • {uploadItems.filter(item => !item.category).length} need category
                </span>
              )}
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
              {readyCount > 0 && (
                <Badge variant="default" className="bg-blue-600">
                  {readyCount} Ready
                </Badge>
              )}
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

            {/* Bulk Actions */}
            {uploadItems.length > 0 && (
              <Card className="border-dashed">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectedItems.size === uploadItems.length ? deselectAll : selectAll}
                      >
                        {selectedItems.size === uploadItems.length ? (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-4 h-4 mr-2" />
                            Select All
                          </>
                        )}
                      </Button>
                      {selectedItems.size > 0 && (
                        <span className="text-sm text-muted-foreground">
                          {selectedItems.size} selected
                        </span>
                      )}
                    </div>
                    
                    {selectedItems.size > 0 && (
                      <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
                        <DialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <Repeat className="w-4 h-4 mr-2" />
                            Bulk Edit ({selectedItems.size})
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Bulk Edit {selectedItems.size} Items</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Price (leave empty to keep unchanged)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 25"
                                value={bulkEditPrice}
                                onChange={(e) => setBulkEditPrice(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Currency</Label>
                              <Select value={bulkEditCurrency} onValueChange={setBulkEditCurrency}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {CURRENCIES.map((curr) => (
                                    <SelectItem key={curr.code} value={curr.code}>
                                      {curr.code} - {curr.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Category</Label>
                              <Select value={bulkEditCategory} onValueChange={setBulkEditCategory}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__KEEP_UNCHANGED__">Keep unchanged</SelectItem>
                                  {CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowBulkEdit(false)}>
                              Cancel
                            </Button>
                            <Button onClick={applyBulkEdit}>
                              Apply to {selectedItems.size} Items
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            <div className="max-h-[600px] overflow-y-auto space-y-3 border rounded-lg p-4">
              {uploadItems.map((item) => (
                <Card
                  key={item.id}
                  className={`${
                    item.status === 'extracting' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200' :
                    item.status === 'uploading' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' :
                    item.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border-green-200' :
                    item.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200' :
                    ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedItems.has(item.id)}
                            onCheckedChange={() => toggleItemSelection(item.id)}
                            disabled={isProcessing}
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="text-sm font-medium truncate">{item.file.name}</span>
                            </div>
                            {!item.category && item.status === 'ready' && (
                              <span className="text-xs text-orange-600 font-medium">
                                ⚠️ Category required
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.status === 'extracting' && (
                            <Badge variant="default" className="bg-purple-600">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Extracting
                            </Badge>
                          )}
                          {item.status === 'ready' && !item.isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateItem(item.id, { isEditing: true })}
                              disabled={isProcessing}
                            >
                              <Edit2 className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                          )}
                          {item.status === 'ready' && item.isEditing && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateItem(item.id, { isEditing: false })}
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </Button>
                          )}
                          {item.status === 'uploading' && (
                            <Badge variant="default" className="bg-blue-600">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Uploading
                            </Badge>
                          )}
                          {item.status === 'completed' && (
                            <>
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Done
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unlockItem(item.id)}
                                title="Unlock to edit again"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {item.status === 'error' && (
                            <>
                              <Badge variant="destructive">
                                <XCircle className="w-3 h-3 mr-1" />
                                Failed
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => unlockItem(item.id)}
                                title="Unlock to retry"
                              >
                                <Repeat className="w-3 h-3" />
                              </Button>
                            </>
                          )}
                          {!isProcessing && item.status !== 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Thumbnail Preview - Always show */}
                      {item.previewUrl && (
                        <div className="flex justify-center pt-2">
                          <img 
                            src={item.previewUrl} 
                            alt={item.title || 'Preview'} 
                            className="w-full max-w-sm h-56 object-cover rounded-lg border shadow-sm"
                          />
                        </div>
                      )}

                      {/* Editable Fields */}
                      {(item.status === 'ready' || item.status === 'error') && item.isEditing && (
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="col-span-2">
                            <Label className="text-xs">Title</Label>
                            <Input
                              value={item.title}
                              onChange={(e) => updateItem(item.id, { title: e.target.value })}
                              placeholder="Product title"
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Description</Label>
                            <Textarea
                              value={item.description}
                              onChange={(e) => updateItem(item.id, { description: e.target.value })}
                              placeholder="Product description"
                              rows={2}
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Price</Label>
                            <Input
                              value={item.price}
                              onChange={(e) => updateItem(item.id, { price: e.target.value })}
                              type="number"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Currency</Label>
                            <Select value={item.currency} onValueChange={(value) => updateItem(item.id, { currency: value })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CURRENCIES.map((curr) => (
                                  <SelectItem key={curr.code} value={curr.code}>
                                    {curr.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Media Type</Label>
                            <Select value={item.mediaType} onValueChange={(value) => updateItem(item.id, { mediaType: value })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MEDIA_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    <span className="capitalize">{type}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">
                              Category 
                              <span className="text-muted-foreground ml-1">(What's in the photo?)</span>
                            </Label>
                            <Select value={item.category} onValueChange={(value) => updateItem(item.id, { category: value })}>
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select what's in the photo" />
                              </SelectTrigger>
                              <SelectContent className="max-h-64">
                                {CATEGORIES.map((cat) => (
                                  <SelectItem key={cat} value={cat}>
                                    {cat}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!item.category && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Required: Choose what's shown in this photo
                              </p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Keywords (comma-separated)</Label>
                            <Input
                              value={item.keywords}
                              onChange={(e) => updateItem(item.id, { keywords: e.target.value })}
                              placeholder="keyword1, keyword2, keyword3"
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs">Location (optional)</Label>
                            <Input
                              value={item.location}
                              onChange={(e) => updateItem(item.id, { location: e.target.value })}
                              placeholder="City, Country"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Latitude (optional)</Label>
                            <Input
                              value={item.latitude}
                              onChange={(e) => updateItem(item.id, { latitude: e.target.value })}
                              type="number"
                              step="0.000001"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Longitude (optional)</Label>
                            <Input
                              value={item.longitude}
                              onChange={(e) => updateItem(item.id, { longitude: e.target.value })}
                              type="number"
                              step="0.000001"
                              className="text-sm"
                            />
                          </div>
                          
                          {/* Geographical Organization Section */}
                          <div className="col-span-2 mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2 mb-3">
                              <FolderTree className="w-4 h-4 text-blue-600" />
                              <Label className="text-xs font-semibold">Geographical Organization (Required)</Label>
                            </div>
                            <p className="text-xs text-muted-foreground mb-3">
                              📁 Organize: World → Continent → Country → Your File
                            </p>
                          </div>
                          
                          <div>
                            <Label className="text-xs">Continent *</Label>
                            <Select 
                              value={item.continent} 
                              onValueChange={(value) => {
                                updateItem(item.id, { continent: value, country: '' });
                              }}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select continent" />
                              </SelectTrigger>
                              <SelectContent>
                                {CONTINENTS.map((continent) => (
                                  <SelectItem key={continent.value} value={continent.value}>
                                    {continent.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!item.continent && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Required for organization
                              </p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-xs">Country *</Label>
                            <Select 
                              value={item.country} 
                              onValueChange={(value) => updateItem(item.id, { country: value })}
                              disabled={!item.continent}
                            >
                              <SelectTrigger className="text-sm">
                                <SelectValue placeholder={item.continent ? "Select country" : "Select continent first"} />
                              </SelectTrigger>
                              <SelectContent>
                                {item.continent && getCountriesByContinent(item.continent).map((country) => (
                                  <SelectItem key={country.value} value={country.value}>
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {!item.country && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⚠️ Required for organization
                              </p>
                            )}
                          </div>
                          
                          {item.continent && item.country && (
                            <div className="col-span-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                              <div className="flex items-center gap-2 text-xs text-green-900 dark:text-green-100">
                                <Globe2 className="w-3 h-3" />
                                <span className="font-medium">
                                  📂 {CONTINENTS.find(c => c.value === item.continent)?.label} → {getCountriesByContinent(item.continent).find(c => c.value === item.country)?.label}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Summary View */}
                      {(item.status === 'ready' || item.status === 'completed' || item.status === 'error') && !item.isEditing && (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                          {item.title && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Title:</span>
                              <p className="font-medium truncate">{item.title}</p>
                            </div>
                          )}
                          {item.description && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Description:</span>
                              <p className="line-clamp-2">{item.description}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-medium">{item.price} {item.currency}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Category:</span>
                            {item.category ? (
                              <p className="font-medium">{item.category}</p>
                            ) : (
                              <p className="text-orange-600 font-medium">⚠️ Not set - Click Edit</p>
                            )}
                          </div>
                          {item.keywords && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Keywords:</span>
                              <p className="truncate">{item.keywords}</p>
                            </div>
                          )}
                          {(item.latitude && item.longitude) && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">GPS:</span>
                              <p className="text-green-600">
                                {parseFloat(item.latitude).toFixed(6)}, {parseFloat(item.longitude).toFixed(6)}
                              </p>
                            </div>
                          )}
                          {(item.continent || item.country) && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Geo Folder:</span>
                              {item.continent && item.country ? (
                                <div className="flex items-center gap-1 text-green-600 font-medium">
                                  <Globe2 className="w-3 h-3" />
                                  <p>
                                    📂 {CONTINENTS.find(c => c.value === item.continent)?.label} → {getCountriesByContinent(item.continent).find(c => c.value === item.country)?.label}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-orange-600 font-medium">⚠️ Not set - Click Edit</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {item.error && (
                        <p className="text-xs text-red-600 mt-2">{item.error}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                disabled={isProcessing || readyCount === 0 || isExtracting}
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
                    Upload {readyCount} Items
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
