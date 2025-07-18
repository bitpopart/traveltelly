import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { useUploadFile } from '@/hooks/useUploadFile';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { PermissionGate } from '@/components/PermissionGate';
import { Camera, MapPin, Star, Upload, Loader2, Zap } from 'lucide-react';
import { LocationMap } from '@/components/LocationMap';
import { extractGPSFromImage, canContainEXIF } from '@/lib/exifUtils';
import { useNavigate } from 'react-router-dom';
import { GPSDebugger } from '@/components/GPSDebugger';
import * as geohash from 'ngeohash';
import { testGeohashAccuracy, getGeohashPrecisionInfo } from '@/lib/geohashTest';
import { trackCoordinates, analyzeCoordinateDrift } from '@/lib/coordinateVerification';

const reviewSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().optional(),
  rating: z.number().min(1).max(5),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  moreInfoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  hashtags: z.string().optional(),
  lightning: z.boolean().default(false),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface LocationData {
  lat: number;
  lng: number;
  address?: string;
}

const categories = [
  { value: 'grocery-store', label: '🛒 Grocery Store', group: 'Shops & Stores' },
  { value: 'clothing-store', label: '👕 Clothing Store', group: 'Shops & Stores' },
  { value: 'electronics-store', label: '📱 Electronics Store', group: 'Shops & Stores' },
  { value: 'convenience-store', label: '🏪 Convenience Store', group: 'Shops & Stores' },

  { value: 'restaurant', label: '🍽️ Restaurant', group: 'Food & Drink' },
  { value: 'cafe', label: '☕ Café', group: 'Food & Drink' },
  { value: 'fast-food', label: '🍔 Fast Food', group: 'Food & Drink' },
  { value: 'bar-pub', label: '🍺 Bar / Pub', group: 'Food & Drink' },

  { value: 'hotel', label: '🏨 Hotel', group: 'Places' },
  { value: 'motel', label: '🏨 Motel', group: 'Places' },
  { value: 'hostel', label: '🏠 Hostel', group: 'Places' },
  { value: 'landmarks', label: '🏛️ Landmarks', group: 'Places' },

  { value: 'bank', label: '🏦 Bank', group: 'Services' },
  { value: 'salon-spa', label: '💅 Salon / Spa', group: 'Services' },
  { value: 'car-repair', label: '🔧 Car Repair', group: 'Services' },
  { value: 'laundry', label: '🧺 Laundry', group: 'Services' },

  { value: 'hospital', label: '🏥 Hospital', group: 'Health' },
  { value: 'clinic', label: '🏥 Clinic', group: 'Health' },
  { value: 'pharmacy', label: '💊 Pharmacy', group: 'Health' },
  { value: 'dentist', label: '🦷 Dentist', group: 'Health' },

  { value: 'park', label: '🌳 Park', group: 'Outdoor & Fun' },
  { value: 'beach', label: '🏖️ Beach', group: 'Outdoor & Fun' },
  { value: 'playground', label: '🛝 Playground', group: 'Outdoor & Fun' },
  { value: 'hiking-trail', label: '🥾 Hiking Trail', group: 'Outdoor & Fun' },
  { value: 'cycling-trail', label: '🚴 Cycling Trail', group: 'Outdoor & Fun' },

  { value: 'museum', label: '🏛️ Museum', group: 'Entertainment' },
  { value: 'movie-theater', label: '🎬 Movie Theater', group: 'Entertainment' },
  { value: 'zoo', label: '🦁 Zoo', group: 'Entertainment' },
  { value: 'music-venue', label: '🎵 Music Venue', group: 'Entertainment' },

  { value: 'school', label: '🏫 School', group: 'Education & Public' },
  { value: 'library', label: '📚 Library', group: 'Education & Public' },
  { value: 'post-office', label: '📮 Post Office', group: 'Education & Public' },
  { value: 'police-station', label: '👮 Police Station', group: 'Education & Public' },

  { value: 'gas-station', label: '⛽ Gas Station', group: 'Transport' },
  { value: 'bus-stop', label: '🚌 Bus Stop', group: 'Transport' },
  { value: 'train-station', label: '🚂 Train Station', group: 'Transport' },
  { value: 'parking-lot', label: '🅿️ Parking Lot', group: 'Transport' },

  { value: 'church', label: '⛪ Church', group: 'Religious' },
  { value: 'mosque', label: '🕌 Mosque', group: 'Religious' },
  { value: 'temple', label: '🛕 Temple', group: 'Religious' },
  { value: 'synagogue', label: '✡️ Synagogue', group: 'Religious' },
  { value: 'shrine', label: '⛩️ Shrine', group: 'Religious' },
];

function encodeGeohash(lat: number, lng: number, precision = 8): string {
  try {
    const encoded = geohash.encode(lat, lng, precision);
    console.log(`🗺️ Encoding geohash: lat=${lat}, lng=${lng}, precision=${precision} → ${encoded}`);
    return encoded;
  } catch (error) {
    console.error('Error encoding geohash:', lat, lng, error);
    throw error;
  }
}

function CreateReviewFormContent() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [extractingLocation, setExtractingLocation] = useState(false);

  // Test geohash accuracy in development
  React.useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('🧪 Running geohash accuracy tests...');
      getGeohashPrecisionInfo();
      testGeohashAccuracy();
    }
  }, []);

  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { mutate: createEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      lightning: false,
    },
  });

  const extractLocationFromExif = useCallback(async (file: File) => {
    setExtractingLocation(true);

    // Check if file can contain EXIF data
    if (!canContainEXIF(file)) {
      toast({
        title: 'File type not supported',
        description: 'GPS data can only be extracted from JPEG/TIFF images. Please select location manually.',
        variant: 'destructive',
      });
      setShowMap(true);
      setExtractingLocation(false);
      return;
    }

    try {
      const coordinates = await extractGPSFromImage(file);

      if (coordinates) {
        console.log(`📍 Original GPS coordinates from photo: lat=${coordinates.latitude}, lng=${coordinates.longitude}`);

        // Track coordinates from photo
        trackCoordinates('PHOTO_COORDINATES', coordinates.latitude, coordinates.longitude, 'Photo EXIF data');

        const locationData: LocationData = {
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        };

        // Try to get address from reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${locationData.lat}&lon=${locationData.lng}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          if (data.display_name) {
            locationData.address = data.display_name;
            form.setValue('location', data.display_name);
          }
        } catch (error) {
          console.warn('Failed to get address:', error);
        }

        setLocation(locationData);
        setShowMap(true); // Show map with extracted location
        toast({
          title: 'Location extracted!',
          description: `GPS coordinates found: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
        });
      } else {
        toast({
          title: 'No GPS data found in photo',
          description: 'The photo doesn\'t contain location data. Please select location manually on the map.',
          variant: 'destructive',
        });
        setShowMap(true);
      }
    } catch (error) {
      console.error('Error extracting GPS from photo:', error);
      toast({
        title: 'Could not read photo metadata',
        description: 'Unable to extract GPS data from photo. Please select location manually on the map.',
        variant: 'destructive',
      });
      setShowMap(true);
    } finally {
      setExtractingLocation(false);
    }
  }, [form, toast]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract location from EXIF
    await extractLocationFromExif(file);
  }, [extractLocationFromExif]);

  const handleLocationSelect = useCallback((lat: number, lng: number) => {
    console.log(`🗺️ Manual location selected: lat=${lat}, lng=${lng}`);

    // Track manual location selection
    trackCoordinates('MANUAL_SELECTION', lat, lng, 'User map selection');

    setLocation({ lat, lng });
    setShowMap(false);

    // Try to get address
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    )
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          form.setValue('location', data.display_name);
        }
      })
      .catch(console.warn);
  }, [form]);

  const onSubmit = async (data: ReviewFormData) => {
    try {
      let imageUrl = '';

      // Upload image if selected
      if (selectedFile) {
        const [[_, url]] = await uploadFile(selectedFile);
        imageUrl = url;
      }

      // Create review event
      const tags: string[][] = [
        ['d', `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`],
        ['title', data.title],
        ['rating', data.rating.toString()],
        ['category', data.category],
        ['alt', `Review of ${data.title} - ${data.rating} stars`],
      ];

      if (data.description) {
        tags.push(['description', data.description]);
      }

      if (data.location) {
        tags.push(['location', data.location]);
      }

      if (location) {
        console.log(`📍 Storing location: lat=${location.lat}, lng=${location.lng}`);

        // Track coordinates before encoding
        trackCoordinates('PRE_ENCODING', location.lat, location.lng, 'Before geohash encoding');

        const geohashStr = encodeGeohash(location.lat, location.lng);
        console.log('Encoding location:', location, '→ geohash:', geohashStr);
        tags.push(['g', geohashStr]);

        // Test decode to verify accuracy
        const testDecode = geohash.decode(geohashStr);
        console.log(`🔍 Verification decode: ${geohashStr} → lat=${testDecode.latitude}, lng=${testDecode.longitude}`);

        // Track coordinates after encoding/decoding
        trackCoordinates('POST_ENCODING', testDecode.latitude, testDecode.longitude, 'After geohash round-trip');

        const latDiff = Math.abs(location.lat - testDecode.latitude);
        const lngDiff = Math.abs(location.lng - testDecode.longitude);
        console.log(`📏 Coordinate differences: lat=${latDiff.toFixed(8)}, lng=${lngDiff.toFixed(8)}`);

        // Analyze drift so far
        analyzeCoordinateDrift();
      }

      if (imageUrl) {
        tags.push(['image', imageUrl]);
      }

      if (data.moreInfoUrl && data.moreInfoUrl.trim()) {
        tags.push(['r', data.moreInfoUrl.trim()]);
      }

      // Process hashtags
      if (data.hashtags && data.hashtags.trim()) {
        const hashtagList = data.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        hashtagList.forEach(hashtag => {
          tags.push(['t', hashtag]);
        });
      }

      tags.push(['lightning', data.lightning ? 'yes' : 'no']);
      tags.push(['published_at', Math.floor(Date.now() / 1000).toString()]);

      // Create the structured review event (kind 34879)
      createEvent({
        kind: 34879,
        content: data.content || '',
        tags,
      });

      // Also create a regular Nostr note (kind 1) for visibility on standard clients
      const categoryEmojis: Record<string, string> = {
        'grocery-store': '🛒',
        'clothing-store': '👕',
        'electronics-store': '📱',
        'convenience-store': '🏪',
        'restaurant': '🍽️',
        'cafe': '☕',
        'fast-food': '🍔',
        'bar-pub': '🍺',
        'hotel': '🏨',
        'motel': '🏨',
        'hostel': '🏠',
        'landmarks': '🏛️',
        'bank': '🏦',
        'salon-spa': '💅',
        'car-repair': '🔧',
        'laundry': '🧺',
        'hospital': '🏥',
        'clinic': '🏥',
        'pharmacy': '💊',
        'dentist': '🦷',
        'park': '🌳',
        'beach': '🏖️',
        'playground': '🛝',
        'hiking-trail': '🥾',
        'cycling-trail': '🚴',
        'museum': '🏛️',
        'movie-theater': '🎬',
        'zoo': '🦁',
        'music-venue': '🎵',
        'school': '🏫',
        'library': '📚',
        'post-office': '📮',
        'police-station': '👮',
        'gas-station': '⛽',
        'bus-stop': '🚌',
        'train-station': '🚂',
        'parking-lot': '🅿️',
        'church': '⛪',
        'mosque': '🕌',
        'temple': '🛕',
        'synagogue': '✡️',
        'shrine': '⛩️'
      };

      // Create a human-readable note content
      const emoji = categoryEmojis[data.category] || '📍';
      const stars = '⭐'.repeat(data.rating);
      const locationText = data.location ? ` in ${data.location}` : '';

      let noteContent = `${emoji} ${data.title} - ${stars} (${data.rating}/5)\n`;

      if (data.description) {
        noteContent += `\n${data.description}\n`;
      }

      if (data.content) {
        noteContent += `\n${data.content}\n`;
      }

      noteContent += `\n📍 Location${locationText}`;
      noteContent += `\n🏷️ Category: ${data.category.replace('-', ' ')}`;

      if (data.moreInfoUrl && data.moreInfoUrl.trim()) {
        noteContent += `\n🔗 More info: ${data.moreInfoUrl.trim()}`;
      }

      if (imageUrl) {
        noteContent += `\n\n${imageUrl}`;
      }

      // Add hashtags to note content
      let hashtagsText = '#review #nostr #reviewstr';
      if (data.hashtags && data.hashtags.trim()) {
        const hashtagList = data.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        if (hashtagList.length > 0) {
          hashtagsText += ' #' + hashtagList.join(' #');
        }
      }

      noteContent += `\n\n${hashtagsText}`;

      // Create the regular note with relevant tags
      const noteTags: string[][] = [
        ['t', 'review'],
        ['t', 'reviewstr'],
        ['t', data.category],
      ];

      if (data.location) {
        noteTags.push(['location', data.location]);
      }

      if (location) {
        console.log(`📝 Adding geohash to note: lat=${location.lat}, lng=${location.lng}`);
        const geohashStr = encodeGeohash(location.lat, location.lng);
        noteTags.push(['g', geohashStr]);
      }

      if (imageUrl) {
        noteTags.push(['image', imageUrl]);
      }

      if (data.moreInfoUrl && data.moreInfoUrl.trim()) {
        noteTags.push(['r', data.moreInfoUrl.trim()]);
      }

      // Add hashtags to note tags
      if (data.hashtags && data.hashtags.trim()) {
        const hashtagList = data.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        hashtagList.forEach(hashtag => {
          noteTags.push(['t', hashtag]);
        });
      }

      // Publish the regular note
      createEvent({
        kind: 1,
        content: noteContent,
        tags: noteTags,
      });

      toast({
        title: 'Review published!',
        description: 'Your review has been shared on Nostr and is visible on all clients.',
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: 'Failed to publish review',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isSubmitting = isUploading || isPublishing;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Photo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> a photo
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      GPS location will be extracted automatically from iPhone photos (HEIC/JPEG) and placed on the map
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/tiff,image/tif,image/heic,image/heif,image/png,image/webp"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {extractingLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting GPS location from photo EXIF data...
              </div>
            )}

            {selectedFile && !extractingLocation && !location && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> For automatic GPS extraction, use photos taken with:
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4 list-disc">
                  <li>Location services enabled on your iPhone/camera</li>
                  <li>Original HEIC/JPEG files (not edited or compressed)</li>
                  <li>Photos taken directly from camera apps (not screenshots)</li>
                </ul>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  If no GPS data is found, you can manually select the location on the map below.
                </p>
                <details className="mt-2">
                  <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                    🔍 Debug: Check what EXIF data is available
                  </summary>
                  <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
                    Open browser console (F12) and re-upload your photo to see detailed GPS extraction logs.
                  </p>
                </details>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Address</Label>
            <Input
              id="location"
              placeholder="Enter location manually"
              {...form.register('location')}
            />
          </div>

          {location && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <div className="text-green-600 dark:text-green-400">
                  📍
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                    Location extracted from photo
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </p>
                  {location.address && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      Address: {location.address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {showMap ? 'Hide Map' : (location ? 'View/Change Location on Map' : 'Select Location on Map')}
            </Button>
          </div>

          {showMap && (
            <div className="h-96 rounded-lg overflow-hidden border">
              <LocationMap
                onLocationSelect={handleLocationSelect}
                initialLocation={location}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Details */}
      <Card>
        <CardHeader>
          <CardTitle>Review Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Place Name *</Label>
            <Input
              id="title"
              placeholder="e.g., Blue Bottle Coffee"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Brief Description</Label>
            <Input
              id="description"
              placeholder="e.g., Specialty coffee shop in downtown"
              {...form.register('description')}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select onValueChange={(value) => form.setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(
                  categories.reduce((groups, category) => {
                    const group = category.group;
                    if (!groups[group]) groups[group] = [];
                    groups[group].push(category);
                    return groups;
                  }, {} as Record<string, typeof categories>)
                ).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      {group}
                    </div>
                    {items.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <Label>Rating *</Label>
            <div className="flex items-center gap-2 mt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => form.setValue('rating', i + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < form.watch('rating')
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 hover:text-yellow-200'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {form.watch('rating')} star{form.watch('rating') !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Review Comment</Label>
            <Textarea
              id="content"
              placeholder="Share your experience..."
              rows={4}
              {...form.register('content')}
            />
          </div>

          <div>
            <Label htmlFor="moreInfoUrl">More Info URL</Label>
            <Input
              id="moreInfoUrl"
              type="url"
              placeholder="https://example.com (optional)"
              {...form.register('moreInfoUrl')}
            />
            {form.formState.errors.moreInfoUrl && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.moreInfoUrl.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Add a website, menu, or other relevant link
            </p>
          </div>

          <div>
            <Label htmlFor="hashtags">Hashtags</Label>
            <Input
              id="hashtags"
              placeholder="food, coffee, downtown (separate with commas)"
              {...form.register('hashtags')}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add relevant hashtags separated by commas (without # symbol)
            </p>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center space-x-3">
              <Switch
                id="lightning"
                checked={form.watch('lightning')}
                onCheckedChange={(checked) => form.setValue('lightning', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="lightning" className="flex items-center gap-2 font-medium">
                  <Zap className="w-4 h-4 text-yellow-600 fill-current" />
                  ⚡ Accept Lightning tips for this review
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Enable this to allow others to send you Bitcoin tips for helpful reviews
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Publishing Review...
          </>
        ) : (
          <>
            <Camera className="w-4 h-4 mr-2" />
            Publish Review
          </>
        )}
      </Button>

      {/* Debug tool for development */}
      {import.meta.env.DEV && <GPSDebugger />}
    </form>
  );
}

export function CreateReviewForm() {
  return (
    <PermissionGate>
      <CreateReviewFormContent />
    </PermissionGate>
  );
}