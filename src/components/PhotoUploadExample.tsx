import React, { useState } from 'react';
import { PhotoUpload, type UploadedPhoto } from '@/components/PhotoUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { type GPSCoordinates } from '@/lib/exifUtils';
import { MapPin, Send } from 'lucide-react';

export function PhotoUploadExample() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [gpsCoordinates, setGpsCoordinates] = useState<GPSCoordinates | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending: isPublishing } = useNostrPublish();
  const { toast } = useToast();

  const handlePhotosChange = (newPhotos: UploadedPhoto[]) => {
    setPhotos(newPhotos);
  };

  const handleGPSExtracted = (coordinates: GPSCoordinates) => {
    setGpsCoordinates(coordinates);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to publish posts.',
        variant: 'destructive',
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your post.',
        variant: 'destructive',
      });
      return;
    }

    // Get uploaded photo URLs
    const uploadedPhotos = photos.filter(photo => photo.uploaded && photo.url);
    const photoUrls = uploadedPhotos.map(photo => photo.url!);

    // Create content with photos
    let content = description.trim();
    if (photoUrls.length > 0) {
      content += (content ? '\n\n' : '') + photoUrls.join('\n');
    }

    // Create tags
    const tags: string[][] = [
      ['title', title],
      ['alt', `Post: ${title}`],
    ];

    // Add GPS coordinates if available
    if (gpsCoordinates) {
      tags.push(['g', `${gpsCoordinates.latitude},${gpsCoordinates.longitude}`]);
    }

    // Add photo URLs as imeta tags (NIP-94)
    photoUrls.forEach(url => {
      tags.push(['imeta', `url ${url}`]);
    });

    // Publish the event
    createEvent({
      kind: 1, // Regular note
      content,
      tags,
    });

    toast({
      title: 'Post published!',
      description: `Your post with ${photoUrls.length} photo${photoUrls.length !== 1 ? 's' : ''} has been published.`,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPhotos([]);
    setGpsCoordinates(null);
  };

  const uploadedPhotos = photos.filter(photo => photo.uploaded);
  const allPhotosUploaded = photos.length > 0 && photos.every(photo => photo.uploaded);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Post with Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <PhotoUpload
            onPhotosChange={handlePhotosChange}
            onGPSExtracted={handleGPSExtracted}
            maxPhotos={3}
          />

          {/* GPS Status */}
          {gpsCoordinates && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <MapPin className="w-4 h-4" />
                Location: {gpsCoordinates.latitude.toFixed(6)}, {gpsCoordinates.longitude.toFixed(6)}
              </div>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your post"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a description..."
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={!user || isPublishing || (photos.length > 0 && !allPhotosUploaded)}
          >
            {isPublishing ? (
              'Publishing...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Publish Post
                {uploadedPhotos.length > 0 && ` with ${uploadedPhotos.length} photo${uploadedPhotos.length !== 1 ? 's' : ''}`}
              </>
            )}
          </Button>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              Please log in to publish posts
            </p>
          )}

          {photos.length > 0 && !allPhotosUploaded && (
            <p className="text-sm text-muted-foreground text-center">
              Please upload all photos before publishing
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}