import React, { useState } from 'react';
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { PhotoUploadExample } from '@/components/PhotoUploadExample';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Image, FileText } from 'lucide-react';
import { type GPSCoordinates } from '@/lib/exifUtils';

export function PhotoUploadDemo() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);

  const handlePhotosChange = (newPhotos: UploadedPhoto[]) => {
    setPhotos(newPhotos);
  };

  const handleGPSExtracted = (coordinates: GPSCoordinates) => {
    setGpsCoordinates(coordinates);
  };

  const uploadedPhotos = photos.filter(photo => photo.uploaded);
  const uploadedUrls = uploadedPhotos.map(photo => photo.url).filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Photo Upload Demo</h1>
          <p className="text-muted-foreground">
            Upload up to 3 photos with automatic GPS extraction from the first photo
          </p>
        </div>

        {/* Demo Tabs */}
        <Tabs defaultValue="standalone" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standalone" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Standalone Component
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Form Example
            </TabsTrigger>
          </TabsList>

          <TabsContent value="standalone" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Standalone PhotoUpload Component</CardTitle>
              </CardHeader>
              <CardContent>
                <PhotoUpload
                  onPhotosChange={handlePhotosChange}
                  onGPSExtracted={handleGPSExtracted}
                  maxPhotos={3}
                />
              </CardContent>
            </Card>

            {/* Status Cards for Standalone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GPS Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="w-5 h-5" />
                    GPS Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {gpsCoordinates ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Extracted
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <p><strong>Latitude:</strong> {gpsCoordinates.latitude.toFixed(6)}</p>
                        <p><strong>Longitude:</strong> {gpsCoordinates.longitude.toFixed(6)}</p>
                      </div>
                      <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                        <p className="font-medium mb-1">Coordinates:</p>
                        <code>{gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}</code>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <MapPin className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No GPS data extracted yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a photo with location data to see coordinates
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upload Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Image className="w-5 h-5" />
                    Upload Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Photos selected:</span>
                      <Badge variant="outline">{photos.length}/3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Photos uploaded:</span>
                      <Badge variant={uploadedPhotos.length === photos.length && photos.length > 0 ? "default" : "secondary"}>
                        {uploadedPhotos.length}/{photos.length}
                      </Badge>
                    </div>
                    {uploadedUrls.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium mb-2">Uploaded URLs:</p>
                        <div className="space-y-1">
                          {uploadedUrls.map((url, index) => (
                            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 break-all"
                              >
                                {url}
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <PhotoUploadExample />
          </TabsContent>
        </Tabs>



        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle>Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Here's how to use the PhotoUpload component in your own code:
              </p>
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm overflow-x-auto">
{`import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { type GPSCoordinates } from '@/lib/exifUtils';

function MyComponent() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [gps, setGps] = useState<GPSCoordinates | null>(null);

  return (
    <PhotoUpload
      onPhotosChange={setPhotos}
      onGPSExtracted={setGps}
      maxPhotos={3}
    />
  );
}`}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Photo Upload</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Upload up to 3 photos</li>
                  <li>• Support for JPEG, PNG, WebP, TIFF, HEIC</li>
                  <li>• 10MB file size limit per photo</li>
                  <li>• Drag & drop or click to upload</li>
                  <li>• Real-time upload progress</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">GPS Extraction</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Automatic GPS extraction from first photo</li>
                  <li>• Support for EXIF data in JPEG/TIFF/HEIC</li>
                  <li>• Handles various coordinate formats</li>
                  <li>• Coordinate validation and verification</li>
                  <li>• Detailed extraction logging</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}