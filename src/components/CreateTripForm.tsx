import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { createClawstrPost } from '@/lib/clawstr';
import { extractGPSFromImage } from '@/lib/exifUtils';
import { compressImage, COMPRESSION_PRESETS } from '@/lib/imageCompression';
import { Camera, MapPin, Upload, X, FileUp, Info, Loader2 } from 'lucide-react';

interface TripCategory {
  value: string;
  label: string;
  emoji: string;
}

const DEFAULT_CATEGORIES: TripCategory[] = [
  { value: 'walk', label: 'Walk', emoji: '🚶' },
  { value: 'hike', label: 'Hike', emoji: '🥾' },
  { value: 'cycling', label: 'Cycling', emoji: '🚴' },
  { value: 'running', label: 'Running', emoji: '🏃' },
  { value: 'road-trip', label: 'Road Trip', emoji: '🚗' },
  { value: 'flight', label: 'Flight', emoji: '✈️' },
  { value: 'train', label: 'Train', emoji: '🚂' },
  { value: 'boat', label: 'Boat', emoji: '⛵' },
];

interface PhotoWithGPS {
  file: File;
  url: string;
  lat?: number;
  lon?: number;
  timestamp?: number;
  uploading?: boolean;
  uploaded?: boolean;
  uploadedUrl?: string;
}

interface CreateTripFormProps {
  onSuccess?: () => void;
}

export function CreateTripForm({ onSuccess }: CreateTripFormProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutate: publishTrip, isPending } = useNostrPublish();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [photos, setPhotos] = useState<PhotoWithGPS[]>([]);
  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [categories, setCategories] = useState<TripCategory[]>(DEFAULT_CATEGORIES);

  // Load categories from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('trip-categories');
    if (stored) {
      try {
        setCategories(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading trip categories:', error);
      }
    }
  }, []);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: PhotoWithGPS[] = [];

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      
      // Extract GPS data from original file first (before compression)
      let gpsData;
      try {
        gpsData = await extractGPSFromImage(originalFile);
      } catch (error) {
        console.error('Error extracting GPS from', originalFile.name, error);
      }

      // Compress image for faster viewing
      let file = originalFile;
      try {
        file = await compressImage(originalFile, COMPRESSION_PRESETS.trip);
      } catch (error) {
        console.error('Error compressing image, using original:', error);
        file = originalFile;
      }
      
      // Create preview URL from compressed file
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        file,
        url,
        lat: gpsData?.latitude,
        lon: gpsData?.longitude,
        timestamp: gpsData?.timestamp,
      });
    }

    setPhotos([...photos, ...newPhotos]);
    setIsProcessing(false);

    // Count photos with GPS
    const withGPS = newPhotos.filter(p => p.lat && p.lon).length;
    if (withGPS > 0) {
      toast({
        title: 'Photos added!',
        description: `${withGPS} of ${newPhotos.length} photos have GPS data`,
      });
    } else {
      toast({
        title: 'Photos added',
        description: 'No GPS data found in photos. You can upload a GPX file instead.',
        variant: 'default',
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].url);
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const handleGpxUpload = (file: File | null) => {
    if (file && (file.name.endsWith('.gpx') || file.name.endsWith('.tcx'))) {
      setGpxFile(file);
      toast({
        title: 'Route file uploaded',
        description: `${file.name} will be used for route visualization`,
      });
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please upload a .gpx or .tcx file',
        variant: 'destructive',
      });
    }
  };

  const calculateDistance = (photos: PhotoWithGPS[]): number => {
    const photosWithGPS = photos.filter(p => p.lat && p.lon);
    if (photosWithGPS.length < 2) return 0;

    // Sort by timestamp if available
    const sorted = [...photosWithGPS].sort((a, b) => {
      if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
      return 0;
    });

    let totalDistance = 0;
    for (let i = 0; i < sorted.length - 1; i++) {
      const lat1 = sorted[i].lat!;
      const lon1 = sorted[i].lon!;
      const lat2 = sorted[i + 1].lat!;
      const lon2 = sorted[i + 1].lon!;

      // Haversine formula for distance
      const R = 6371; // Earth's radius in km
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      totalDistance += distance;
    }

    return Math.round(totalDistance * 100) / 100; // Round to 2 decimals
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a trip title',
        variant: 'destructive',
      });
      return;
    }

    if (!category) {
      toast({
        title: 'Category required',
        description: 'Please select a trip category',
        variant: 'destructive',
      });
      return;
    }

    if (photos.length === 0) {
      toast({
        title: 'Photos required',
        description: 'Please upload at least one photo',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Upload all photos
      const uploadedPhotos: PhotoWithGPS[] = [];
      for (const photo of photos) {
        const [[, uploadedUrl]] = await uploadFile(photo.file);
        uploadedPhotos.push({
          ...photo,
          uploadedUrl,
          uploaded: true,
        });
      }

      // Upload GPX file if provided
      let gpxUrl = '';
      if (gpxFile) {
        const [[, url]] = await uploadFile(gpxFile);
        gpxUrl = url;
      }

      // Calculate distance
      const distance = calculateDistance(uploadedPhotos);

      // Create tags
      const tags: string[][] = [
        ['d', `trip-${Date.now()}`],
        ['title', title],
        ['summary', description || ''],
        ['category', category],
        ['distance', distance.toString()],
        ['distance_unit', 'km'],
      ];

      // Add photo tags with GPS data
      uploadedPhotos.forEach(photo => {
        const imageTag = ['image', photo.uploadedUrl || ''];
        if (photo.lat) imageTag.push(photo.lat.toString());
        if (photo.lon) imageTag.push(photo.lon.toString());
        if (photo.timestamp) imageTag.push(photo.timestamp.toString());
        tags.push(imageTag);
      });

      // Add GPX file if uploaded
      if (gpxUrl) {
        tags.push(['gpx', gpxUrl]);
      }

      // Add hashtags
      tags.push(['t', 'travel']);
      tags.push(['t', 'trip']);
      tags.push(['t', category]);

      // Add alt tag
      tags.push(['alt', `${title} - ${category} trip with ${photos.length} photos`]);

      // Publish trip
      publishTrip({
        kind: 30025,
        content: description,
        tags,
      });

      toast({
        title: 'Trip published!',
        description: 'Your trip has been shared to Nostr successfully',
      });

      // Call onSuccess callback if provided (for dialog) - MUST be called before navigation
      if (onSuccess) {
        onSuccess();
      }

      // Also share to Clawstr automatically
      const activityEmoji = category === 'hike' ? '🥾' : category === 'cycling' ? '🚴' : '🚶';
      const distanceText = distance ? ` • ${distance.toFixed(1)} km` : '';
      const clawstrContent = `✈️ ${title}

${activityEmoji} ${category}${distanceText}
📸 ${photos.length} photos with GPS route

${description}

#travel #trip #traveltelly`;

      const clawstrEvent = createClawstrPost(
        clawstrContent,
        'https://clawstr.com/c/travel',
        [
          ['t', 'trip'],
          ['t', 'travel'],
          ['t', category],
        ]
      );

      publishTrip(clawstrEvent);

      // Navigate to trips page
      setTimeout(() => {
        navigate('/trips');
      }, 1000);

    } catch (error) {
      console.error('Error publishing trip:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photos or publish trip',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const photosWithGPS = photos.filter(p => p.lat && p.lon).length;
  const estimatedDistance = calculateDistance(photos);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Trip Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g., Hiking in Yosemite"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Share details about your trip..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
        />
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-red-500">*</span>
        </Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select trip type" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.emoji} {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Photos
          </CardTitle>
          <CardDescription>
            GPS location will be extracted automatically from iPhone photos (HEIC/JPEG) and placed on the map
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              accept="image/*,.heic"
              onChange={(e) => handlePhotoUpload(e.target.files)}
              className="hidden"
              id="photo-upload"
              disabled={isProcessing}
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Click to upload photos</p>
              <p className="text-sm text-muted-foreground">
                JPEG, PNG, HEIC supported
              </p>
            </label>
          </div>

          {photos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">
                  {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                  {photosWithGPS > 0 && (
                    <span className="text-green-600 ml-2">
                      ({photosWithGPS} with GPS data)
                    </span>
                  )}
                </p>
                {estimatedDistance > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Estimated distance: <strong>{estimatedDistance} km</strong>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    {photo.lat && photo.lon && (
                      <div className="absolute bottom-2 left-2">
                        <MapPin className="w-4 h-4 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GPX Upload */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileUp className="w-5 h-5" />
            Optional: Upload GPX or TCX File
          </CardTitle>
          <CardDescription>
            For more accurate route tracking, upload your GPS track file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".gpx,.tcx"
              onChange={(e) => handleGpxUpload(e.target.files?.[0] || null)}
              className="hidden"
              id="gpx-upload"
            />
            <label htmlFor="gpx-upload">
              <Button type="button" variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {gpxFile ? gpxFile.name : 'Choose GPX/TCX File'}
                </span>
              </Button>
            </label>
            {gpxFile && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setGpxFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> The route is created from the photos uploaded and is not the exact route made. 
              It shows you only the points of interest. For exact routes, upload a GPX or TCX file.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/trips')}
          disabled={isPending || isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || isProcessing || photos.length === 0}
          style={{ backgroundColor: '#ffcc00', color: '#000' }}
          className="hover:opacity-90"
        >
          {(isPending || isProcessing) && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}
          Publish Trip
        </Button>
      </div>
    </form>
  );
}
