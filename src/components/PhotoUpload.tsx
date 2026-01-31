import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Camera, Upload, Loader2, X, MapPin } from 'lucide-react';
import { extractGPSFromImage, canContainEXIF, type GPSCoordinates, extractPhotoMetadata, type PhotoMetadata } from '@/lib/exifUtils';
import { compressImage, COMPRESSION_PRESETS } from '@/lib/imageCompression';

interface PhotoUploadProps {
  onPhotosChange?: (photos: UploadedPhoto[]) => void;
  onGPSExtracted?: (coordinates: GPSCoordinates) => void;
  onMetadataExtracted?: (metadata: PhotoMetadata) => void;
  maxPhotos?: number;
  className?: string;
}

export interface UploadedPhoto {
  file: File;
  preview: string;
  url?: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

export function PhotoUpload({ 
  onPhotosChange, 
  onGPSExtracted,
  onMetadataExtracted, 
  maxPhotos = 3,
  className 
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [extractingGPS, setExtractingGPS] = useState(false);
  const [gpsExtracted, setGpsExtracted] = useState(false);

  const { mutateAsync: uploadFile } = useUploadFile();
  const { toast } = useToast();

  const updatePhotos = useCallback((newPhotos: UploadedPhoto[]) => {
    setPhotos(newPhotos);
    onPhotosChange?.(newPhotos);
  }, [onPhotosChange]);

  const extractGPSFromFirstPhoto = useCallback(async (file: File) => {
    if (gpsExtracted) return; // Only extract GPS from the first photo

    setExtractingGPS(true);

    try {
      if (!canContainEXIF(file)) {
        toast({
          title: 'GPS extraction not supported',
          description: 'GPS data can only be extracted from JPEG/TIFF/HEIC images.',
          variant: 'destructive',
        });
        return;
      }

      const coordinates = await extractGPSFromImage(file);

      if (coordinates) {
        setGpsExtracted(true);
        onGPSExtracted?.(coordinates);
        toast({
          title: 'Location extracted!',
          description: `GPS coordinates found: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`,
        });
      } else {
        toast({
          title: 'No GPS data found',
          description: 'The photo doesn\'t contain location data.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error extracting GPS from photo:', error);
      toast({
        title: 'Could not read photo metadata',
        description: 'Unable to extract GPS data from photo.',
        variant: 'destructive',
      });
    } finally {
      setExtractingGPS(false);
    }
  }, [gpsExtracted, onGPSExtracted, toast]);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: 'Too many photos',
        description: `You can only upload up to ${maxPhotos} photos.`,
        variant: 'destructive',
      });
      return;
    }

    // Create photo objects with previews
    const newPhotos: UploadedPhoto[] = [];
    
    for (const originalFile of files) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/tiff', 'image/tif', 'image/heic', 'image/heif'];
      if (!validTypes.includes(originalFile.type.toLowerCase()) && 
          !originalFile.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|tiff|tif|heic|heif)$/)) {
        toast({
          title: 'Invalid file type',
          description: `${originalFile.name} is not a supported image format.`,
          variant: 'destructive',
        });
        continue;
      }

      // Check file size (10MB limit for original)
      if (originalFile.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${originalFile.name} is larger than 10MB.`,
          variant: 'destructive',
        });
        continue;
      }

      // Extract metadata from first photo (before compression)
      let shouldExtractMetadata = photos.length === 0 && newPhotos.length === 0;
      if (shouldExtractMetadata) {
        try {
          console.log('🔍 Extracting full metadata from first photo...');
          const metadata = await extractPhotoMetadata(originalFile);
          if (onMetadataExtracted) {
            onMetadataExtracted(metadata);
          }
          // Also call GPS callback for backward compatibility
          if (metadata.gps && onGPSExtracted) {
            onGPSExtracted(metadata.gps);
          }
        } catch (error) {
          console.error('Error extracting metadata:', error);
          // Fallback to GPS-only extraction
          await extractGPSFromFirstPhoto(originalFile);
        }
      }

      // Compress image for faster viewing (use story preset for better quality)
      let file = originalFile;
      try {
        file = await compressImage(originalFile, COMPRESSION_PRESETS.story);
        console.log(`Story photo compressed: ${originalFile.name} - ${(((originalFile.size - file.size) / originalFile.size) * 100).toFixed(0)}% reduction`);
      } catch (error) {
        console.error('Error compressing image, using original:', error);
        file = originalFile;
      }

      const preview = URL.createObjectURL(file);
      newPhotos.push({
        file,
        preview,
        uploading: false,
        uploaded: false,
      });
    }

    if (newPhotos.length === 0) return;

    const updatedPhotos = [...photos, ...newPhotos];
    updatePhotos(updatedPhotos);

    // Clear the input
    event.target.value = '';
  }, [photos, maxPhotos, toast, updatePhotos, extractGPSFromFirstPhoto]);

  const uploadPhoto = useCallback(async (index: number) => {
    const photo = photos[index];
    if (!photo || photo.uploading || photo.uploaded) return;

    const updatedPhotos = [...photos];
    updatedPhotos[index] = { ...photo, uploading: true };
    updatePhotos(updatedPhotos);

    try {
      const [[_, url]] = await uploadFile(photo.file);
      updatedPhotos[index] = { 
        ...photo, 
        uploading: false, 
        uploaded: true, 
        url 
      };
      updatePhotos(updatedPhotos);

      toast({
        title: 'Photo uploaded',
        description: `${photo.file.name} has been uploaded successfully.`,
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      updatedPhotos[index] = { 
        ...photo, 
        uploading: false, 
        error: 'Upload failed' 
      };
      updatePhotos(updatedPhotos);

      toast({
        title: 'Upload failed',
        description: `Failed to upload ${photo.file.name}. Please try again.`,
        variant: 'destructive',
      });
    }
  }, [photos, uploadFile, updatePhotos, toast]);

  const uploadAllPhotos = useCallback(async () => {
    const promises = photos.map((_, index) => uploadPhoto(index));
    await Promise.all(promises);
  }, [photos, uploadPhoto]);

  const removePhoto = useCallback((index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    updatePhotos(updatedPhotos);

    // Clean up preview URL
    URL.revokeObjectURL(photos[index].preview);
  }, [photos, updatePhotos]);

  const canAddMore = photos.length < maxPhotos;
  const hasPhotos = photos.length > 0;
  const allUploaded = photos.every(photo => photo.uploaded);
  const anyUploading = photos.some(photo => photo.uploading);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Upload Photos {maxPhotos > 1 && `(up to ${maxPhotos})`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        {canAddMore && (
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 mb-2 text-gray-500 dark:text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> photos
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {photos.length === 0 
                    ? 'GPS location will be extracted from the first photo'
                    : `${maxPhotos - photos.length} more photo${maxPhotos - photos.length !== 1 ? 's' : ''} allowed`
                  }
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/tiff,image/tif,image/heic,image/heif"
                multiple
                onChange={handleFileSelect}
              />
            </label>
          </div>
        )}

        {/* GPS Extraction Status */}
        {extractingGPS && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <MapPin className="w-4 h-4" />
              Extracting GPS location from first photo...
            </div>
          </div>
        )}

        {gpsExtracted && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <MapPin className="w-4 h-4" />
              GPS location extracted from first photo
            </div>
          </div>
        )}

        {/* Photo Previews */}
        {hasPhotos && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100 dark:bg-gray-800">
                    <img
                      src={photo.preview}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      disabled={photo.uploading}
                    >
                      <X className="w-3 h-3" />
                    </button>

                    {/* Upload status overlay */}
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <div className="text-white text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                          <p className="text-sm">Uploading...</p>
                        </div>
                      </div>
                    )}

                    {photo.uploaded && (
                      <div className="absolute top-2 left-2 p-1 bg-green-500 text-white rounded-full">
                        <Camera className="w-3 h-3" />
                      </div>
                    )}

                    {photo.error && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <p className="text-red-600 text-sm font-medium">{photo.error}</p>
                      </div>
                    )}
                  </div>

                  {/* Photo info */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <p className="truncate">{photo.file.name}</p>
                    <p>{(photo.file.size / 1024 / 1024).toFixed(1)} MB</p>
                    {index === 0 && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        GPS source
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Actions */}
            {!allUploaded && (
              <div className="flex gap-2">
                <Button
                  onClick={uploadAllPhotos}
                  disabled={anyUploading}
                  className="flex-1"
                >
                  {anyUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload All Photos
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Upload Summary */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
              {allUploaded && (
                <span className="text-green-600 dark:text-green-400 ml-2">
                  • All uploaded
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tips */}
        {photos.length === 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> For automatic GPS extraction, use photos taken with:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 ml-4 list-disc">
              <li>Location services enabled on your phone/camera</li>
              <li>Original HEIC/JPEG files (not edited or compressed)</li>
              <li>Photos taken directly from camera apps (not screenshots)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}