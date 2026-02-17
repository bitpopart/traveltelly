import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { extractGPSFromImage } from '@/lib/exifUtils';
import { compressImage, COMPRESSION_PRESETS } from '@/lib/imageCompression';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { MapPin, Pencil, Trash2, Camera, X, Upload, Loader2, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TripCategoryManager } from './TripCategoryManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

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

interface TripEvent extends NostrEvent {
  kind: 30025;
}

interface PhotoWithGPS {
  file?: File;
  url: string;
  lat?: number;
  lon?: number;
  timestamp?: number;
  uploading?: boolean;
  uploaded?: boolean;
  uploadedUrl?: string;
}

function validateTripEvent(event: NostrEvent): event is TripEvent {
  if (event.kind !== 30025) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  
  if (!d || !title) {
    return false;
  }

  // Filter out template/placeholder content
  const lowerContent = event.content.toLowerCase();
  const lowerTitle = title.toLowerCase();
  
  const placeholderKeywords = [
    'lorem ipsum',
    'placeholder',
    'template',
    'sample trip',
    'example trip',
    'test trip',
    'demo trip',
    'dolor sit amet',
  ];

  // Check if content or title contains placeholder keywords
  const hasPlaceholder = placeholderKeywords.some(keyword => 
    lowerContent.includes(keyword) || lowerTitle.includes(keyword)
  );

  if (hasPlaceholder) {
    return false;
  }

  return true;
}

interface TripCardProps {
  trip: TripEvent;
  onEdit: (trip: TripEvent) => void;
  onDelete: (trip: TripEvent) => void;
}

function TripCard({ trip, onEdit, onDelete }: TripCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
  const summary = trip.tags.find(([name]) => name === 'summary')?.[1];
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || 'trip';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1];
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const images = trip.tags.filter(([name]) => name === 'image').map(([, url]) => url);
  const hashtags = trip.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  const categoryEmojis: Record<string, string> = {
    walk: '🚶',
    hike: '🥾',
    cycling: '🚴',
    running: '🏃',
    'road-trip': '🚗',
    flight: '✈️',
    train: '🚂',
    boat: '⛵',
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(trip.created_at * 1000), { addSuffix: true })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(trip)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">
              {categoryEmojis[category] || '🗺️'} {category}
            </Badge>
            {distance && (
              <Badge variant="outline">
                📏 {distance} {distanceUnit}
              </Badge>
            )}
            <Badge variant="outline">
              <Camera className="w-3 h-3 mr-1" />
              {images.length} photos
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {images.length > 0 && (
            <div className="mb-3">
              <OptimizedImage
                src={images[0]}
                alt={title}
                className="w-full h-48 object-cover rounded-lg"
                blurUp={true}
                thumbnail={true}
              />
            </div>
          )}

          {summary && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {summary}
            </p>
          )}

          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {hashtags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onDelete(trip);
                setShowDeleteDialog(false);
              }}
            >
              Delete Trip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AdminTripManager() {
  const { nostr } = useNostr();
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutateAsync: uploadFile } = useUploadFile();
  const { mutate: publish, isPending: isPublishing } = useNostrPublish();
  
  const [editingTrip, setEditingTrip] = useState<TripEvent | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Edit form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [photos, setPhotos] = useState<PhotoWithGPS[]>([]);
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

  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-trips', ADMIN_HEX],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query([{
        kinds: [30025],
        authors: [ADMIN_HEX],
        limit: 100,
      }], { signal });

      return events.filter(validateTripEvent).sort((a, b) => b.created_at - a.created_at);
    },
    enabled: !!user && user.pubkey === ADMIN_HEX,
  });

  const handleEdit = (trip: TripEvent) => {
    setEditingTrip(trip);
    setTitle(trip.tags.find(([name]) => name === 'title')?.[1] || '');
    setDescription(trip.tags.find(([name]) => name === 'summary')?.[1] || '');
    setCategory(trip.tags.find(([name]) => name === 'category')?.[1] || '');
    
    const existingTags = trip.tags
      .filter(([name]) => name === 't')
      .map(([, tag]) => tag)
      .join(', ');
    setTags(existingTags);

    const existingPhotos = trip.tags
      .filter(([name]) => name === 'image')
      .map(tag => ({
        url: tag[1],
        lat: tag[2] ? parseFloat(tag[2]) : undefined,
        lon: tag[3] ? parseFloat(tag[3]) : undefined,
        timestamp: tag[4] ? parseInt(tag[4]) : undefined,
        uploaded: true,
        uploadedUrl: tag[1],
      }));
    setPhotos(existingPhotos);

    setIsEditDialogOpen(true);
  };

  const handleDelete = (trip: TripEvent) => {
    const dTag = trip.tags.find(([name]) => name === 'd')?.[1];
    if (!dTag) return;

    // Create deletion event (kind 5)
    publish({
      kind: 5,
      content: 'Deleted trip',
      tags: [
        ['e', trip.id],
        ['k', '30025'],
      ],
    });

    toast({
      title: 'Trip deleted',
      description: 'The trip has been removed',
    });

    setTimeout(() => refetch(), 1000);
  };

  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newPhotos: PhotoWithGPS[] = [];

    for (let i = 0; i < files.length; i++) {
      const originalFile = files[i];
      
      let gpsData;
      try {
        gpsData = await extractGPSFromImage(originalFile);
      } catch (error) {
        console.error('Error extracting GPS:', error);
      }

      let file = originalFile;
      try {
        file = await compressImage(originalFile, COMPRESSION_PRESETS.trip);
      } catch (error) {
        console.error('Error compressing image:', error);
        file = originalFile;
      }
      
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

    toast({
      title: 'Photos added',
      description: `${newPhotos.length} photo(s) added to trip`,
    });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...photos];
    if (newPhotos[index].url.startsWith('blob:')) {
      URL.revokeObjectURL(newPhotos[index].url);
    }
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  const calculateDistance = (photos: PhotoWithGPS[]): number => {
    const photosWithGPS = photos.filter(p => p.lat && p.lon);
    if (photosWithGPS.length < 2) return 0;

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

      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      totalDistance += R * c;
    }

    return Math.round(totalDistance * 100) / 100;
  };

  const handleSave = async () => {
    if (!editingTrip || !title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Upload new photos
      const uploadedPhotos: PhotoWithGPS[] = [];
      for (const photo of photos) {
        if (photo.uploaded && photo.uploadedUrl) {
          uploadedPhotos.push(photo);
        } else if (photo.file) {
          const [[, url]] = await uploadFile(photo.file);
          uploadedPhotos.push({
            ...photo,
            uploadedUrl: url,
            uploaded: true,
          });
        }
      }

      const distance = calculateDistance(uploadedPhotos);
      const dTag = editingTrip.tags.find(([name]) => name === 'd')?.[1] || `trip-${Date.now()}`;

      const eventTags: string[][] = [
        ['d', dTag],
        ['title', title],
        ['summary', description],
        ['category', category],
        ['distance', distance.toString()],
        ['distance_unit', 'km'],
      ];

      uploadedPhotos.forEach(photo => {
        const imageTag = ['image', photo.uploadedUrl || ''];
        if (photo.lat) imageTag.push(photo.lat.toString());
        if (photo.lon) imageTag.push(photo.lon.toString());
        if (photo.timestamp) imageTag.push(photo.timestamp.toString());
        eventTags.push(imageTag);
      });

      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      tagArray.forEach(tag => {
        eventTags.push(['t', tag]);
      });

      eventTags.push(['alt', `${title} - ${category} trip with ${uploadedPhotos.length} photos`]);

      publish({
        kind: 30025,
        content: description,
        tags: eventTags,
      });

      toast({
        title: 'Trip updated',
        description: 'Your changes have been saved',
      });

      setIsEditDialogOpen(false);
      setTimeout(() => refetch(), 1000);

    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to update trip',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.pubkey !== ADMIN_HEX) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Admin access required</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      <Tabs defaultValue="manage-trips" className="w-full">
        <TabsList>
          <TabsTrigger value="manage-trips">Manage Trips</TabsTrigger>
          <TabsTrigger value="trip-categories">Trip Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="manage-trips" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                {trips.length} trip{trips.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {trips.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trips found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trips.map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trip-categories" className="mt-6">
          <TripCategoryManager />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Trip title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Trip description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-category">
                  <SelectValue placeholder="Select category" />
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

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., travel, adventure, nature"
              />
            </div>

            <div className="space-y-2">
              <Label>Photos</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic"
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                  className="hidden"
                  id="edit-photo-upload"
                  disabled={isProcessing}
                />
                <label htmlFor="edit-photo-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Add more photos</p>
                  </div>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo.uploadedUrl || photo.url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {photo.lat && photo.lon && (
                        <div className="absolute bottom-1 left-1 bg-green-600 text-white px-1 py-0.5 rounded text-xs">
                          <MapPin className="w-3 h-3 inline" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isProcessing || isPublishing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isProcessing || isPublishing}
              >
                {(isProcessing || isPublishing) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
