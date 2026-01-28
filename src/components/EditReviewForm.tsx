import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useReviewCategories } from '@/hooks/useReviewCategories';
import { useUploadFile } from '@/hooks/useUploadFile';
import { Star, Save, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { NostrEvent } from '@nostrify/nostrify';

const editReviewSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  rating: z.number().min(1).max(5),
  category: z.string().min(1, 'Category is required'),
  location: z.string().optional(),
  moreInfoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

interface EditReviewFormProps {
  review: NostrEvent;
  onSave: () => void;
  onCancel: () => void;
}

export function EditReviewForm({ review, onSave, onCancel }: EditReviewFormProps) {
  const { mutate: createEvent, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  const { data: categories } = useReviewCategories();
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  // Extract current review data
  const currentTitle = review.tags.find(([name]) => name === 'title')?.[1] || '';
  const currentRating = parseInt(review.tags.find(([name]) => name === 'rating')?.[1] || '5');
  const currentCategory = review.tags.find(([name]) => name === 'category')?.[1] || '';
  const currentLocation = review.tags.find(([name]) => name === 'location')?.[1] || '';
  const currentMoreInfoUrl = review.tags.find(([name]) => name === 'more_info_url')?.[1] || '';
  const currentImages = review.tags.filter(([name]) => name === 'image').map(([, url]) => url);
  const currentHashtags = review.tags.filter(([name]) => name === 't').map(([, tag]) => tag);
  const dTag = review.tags.find(([name]) => name === 'd')?.[1] || '';

  const form = useForm({
    resolver: zodResolver(editReviewSchema),
    defaultValues: {
      title: currentTitle,
      content: review.content,
      rating: currentRating,
      category: currentCategory,
      location: currentLocation,
      moreInfoUrl: currentMoreInfoUrl,
    },
  });

  // Initialize hashtags and photos
  useEffect(() => {
    setHashtags(currentHashtags);
    setPhotos(currentImages);
  }, [currentHashtags, currentImages]);

  const addHashtag = () => {
    const tag = newHashtag.trim().toLowerCase().replace(/^#/, '');
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
      setNewHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file',
          description: 'Please select an image file',
          variant: 'destructive',
        });
        continue;
      }

      try {
        setUploadingIndex(photos.length);
        const [[, url]] = await uploadFile(file);
        setPhotos([...photos, url]);
        toast({
          title: 'Photo uploaded',
          description: 'Your photo has been uploaded successfully.',
        });
      } catch {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload photo. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setUploadingIndex(null);
      }
    }

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: z.infer<typeof editReviewSchema>) => {
    try {
      // Build tags array
      const tags: string[][] = [
        ['d', dTag], // Keep the same d tag for replacement
        ['title', data.title],
        ['rating', data.rating.toString()],
        ['category', data.category],
        ['alt', `Review of ${data.title} - ${data.rating} stars`],
      ];

      if (data.location) {
        tags.push(['location', data.location]);
      }

      if (data.moreInfoUrl) {
        tags.push(['more_info_url', data.moreInfoUrl]);
      }

      // Add all photos
      photos.forEach(url => {
        tags.push(['image', url]);
      });

      // Add hashtags
      hashtags.forEach(tag => {
        tags.push(['t', tag]);
      });

      // Keep existing geohash if present
      const geohash = review.tags.find(([name]) => name === 'g')?.[1];
      if (geohash) {
        tags.push(['g', geohash]);
      }

      createEvent({
        kind: 34879,
        content: data.content || '',
        tags,
      });

      toast({
        title: 'Review updated',
        description: 'Your review has been updated successfully.',
      });

      onSave();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update review. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Group categories by group
  const groupedCategories = categories?.reduce((acc, category) => {
    const group = category.group || 'Other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(category);
    return acc;
  }, {} as Record<string, typeof categories>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Edit Review</span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...form.register('title')}
              placeholder="Place or business name"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Rating */}
          <div>
            <Label>Rating *</Label>
            <div className="flex items-center space-x-2 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => form.setValue('rating', star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= form.watch('rating')
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {form.watch('rating')} star{form.watch('rating') !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={form.watch('category')}
              onValueChange={(value) => form.setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(groupedCategories).map(([group, groupCategories]) => (
                  <div key={group}>
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      {group}
                    </div>
                    {groupCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Review Content</Label>
            <Textarea
              id="content"
              {...form.register('content')}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="Address or location description"
            />
          </div>

          {/* More Info URL */}
          <div>
            <Label htmlFor="moreInfoUrl">Website or More Info URL</Label>
            <Input
              id="moreInfoUrl"
              {...form.register('moreInfoUrl')}
              placeholder="https://example.com"
            />
            {form.formState.errors.moreInfoUrl && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.moreInfoUrl.message}
              </p>
            )}
          </div>

          {/* Photos */}
          <div>
            <Label>Photos</Label>
            <div className="mt-2 space-y-4">
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {photos.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-muted group">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-md">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                  {uploadingIndex !== null && (
                    <div className="aspect-square rounded-lg border bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
                        <p className="text-xs text-muted-foreground mt-2">Uploading...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploading}
                  />
                  <div className="flex items-center space-x-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted transition-colors">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {photos.length === 0 ? 'Add photos' : 'Add more photos'}
                    </span>
                  </div>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                The first photo will be used as the main image. You can upload multiple photos.
              </p>
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <Label>Hashtags</Label>
            <div className="flex space-x-2 mt-2">
              <Input
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                placeholder="Add hashtag"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addHashtag}
              >
                Add
              </Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isPending ? 'Updating Review...' : 'Update Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}