import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { extractGPSFromImage } from '@/lib/exifUtils';
import { compressImage, COMPRESSION_PRESETS } from '@/lib/imageCompression';
import { Camera, MapPin, Upload, X, Loader2 } from 'lucide-react';
import * as geohash from 'ngeohash';

interface PhotoFile {
  file: File;
  url: string;
  uploading?: boolean;
  uploaded?: boolean;
  uploadedUrl?: string;
}

interface CheckInFormProps {
  onSuccess?: () => void;
}

export function CheckInForm({ onSuccess }: CheckInFormProps = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutate: publishCheckIn, isPending } = useNostrPublish();
  
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(null);

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: PhotoFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      
      // Extract GPS data from first photo if we don't have coordinates yet
      if (!gpsCoords && i === 0) {
        try {
          const gpsData = await extractGPSFromImage(originalFile);
          if (gpsData?.lat && gpsData?.lon) {
            setGpsCoords({ lat: gpsData.lat, lon: gpsData.lon });
          }
        } catch (error) {
          console.error('Error extracting GPS from', originalFile.name, error);
        }
      }

      // Compress image
      let file = originalFile;
      try {
        file = await compressImage(originalFile, COMPRESSION_PRESETS.thumbnail);
      } catch (error) {
        console.error('Error compressing image, using original:', error);
        file = originalFile;
      }

      const photoUrl = URL.createObjectURL(file);
      newPhotos.push({
        file,
        url: photoUrl,
        uploading: false,
        uploaded: false,
      });
    }

    setPhotos([...photos, ...newPhotos]);
    setIsProcessing(false);

    toast({
      title: 'Photos added',
      description: `${newPhotos.length} photo(s) ready to upload`,
    });
  };

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    URL.revokeObjectURL(newPhotos[index].url);
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  // Get current location from browser
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not available',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsCoords({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setIsProcessing(false);
        toast({
          title: 'Location set',
          description: 'Your current location has been captured',
        });
      },
      (error) => {
        setIsProcessing(false);
        toast({
          title: 'Location error',
          description: error.message,
          variant: 'destructive',
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location.trim()) {
      toast({
        title: 'Location required',
        description: 'Please enter your location',
        variant: 'destructive',
      });
      return;
    }

    if (!gpsCoords) {
      toast({
        title: 'GPS coordinates required',
        description: 'Please add a photo with GPS data or use your current location',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Upload photos first
      const uploadedPhotoUrls: string[] = [];
      for (const photo of photos) {
        try {
          const tags = await uploadFile(photo.file);
          const uploadedUrl = tags[0]?.[1];
          if (uploadedUrl) {
            uploadedPhotoUrls.push(uploadedUrl);
          }
        } catch (error) {
          console.error('Error uploading photo:', error);
          toast({
            title: 'Photo upload failed',
            description: 'Some photos could not be uploaded',
            variant: 'destructive',
          });
        }
      }

      // Generate geohash with precision 6 (~1.2km x 0.6km area)
      const geohashStr = geohash.encode(gpsCoords.lat, gpsCoords.lon, 6);

      // Create check-in event
      const eventTags: string[][] = [
        ['d', `checkin-${Date.now()}`],
        ['location', location],
        ['g', geohashStr],
        ['t', 'travel'],
        ['alt', `Check-in at ${location}`],
      ];

      // Add photo tags
      uploadedPhotoUrls.forEach(url => {
        eventTags.push(['image', url]);
      });

      publishCheckIn(
        {
          kind: 30026,
          content: description,
          tags: eventTags,
        },
        {
          onSuccess: () => {
            setIsProcessing(false);
            toast({
              title: 'Check-in posted!',
              description: 'Your location has been shared',
            });
            
            // Clean up
            photos.forEach(photo => URL.revokeObjectURL(photo.url));
            
            if (onSuccess) {
              onSuccess();
            } else {
              navigate('/my-travels');
            }
          },
          onError: (error) => {
            setIsProcessing(false);
            toast({
              title: 'Failed to post check-in',
              description: error instanceof Error ? error.message : 'Unknown error',
              variant: 'destructive',
            });
          },
        }
      );
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create check-in',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location">Where are you? *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Barcelona, Spain"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the city or area you're in
            </p>
          </div>

          <div>
            <Label>GPS Coordinates</Label>
            <div className="flex items-center gap-2 mt-1">
              {gpsCoords ? (
                <p className="text-sm text-muted-foreground">
                  📍 Location captured ({gpsCoords.lat.toFixed(4)}, {gpsCoords.lon.toFixed(4)})
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No location set - add a photo with GPS or use current location
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isProcessing}
              >
                <MapPin className="w-4 h-4 mr-1" />
                Use Current Location
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share what you're doing or experiencing..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photos (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="photos">Add Photos</Label>
            <div className="mt-2">
              <label
                htmlFor="photos"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload photos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    GPS data will be extracted from the first photo
                  </p>
                </div>
                <input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  disabled={isProcessing}
                />
              </label>
            </div>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()}
          disabled={isPending || isProcessing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || isProcessing || !location.trim() || !gpsCoords}
          className="bg-[#ffcc00] text-black hover:bg-[#ffcc00]/90"
        >
          {isPending || isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Post Check-In
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
