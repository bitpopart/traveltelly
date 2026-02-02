import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useUploadFile } from '@/hooks/useUploadFile';
import { useToast } from '@/hooks/useToast';
import {
  Video,
  Upload,
  Loader2,
  X,
  Play,
  AlertCircle,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VideoFormData {
  title: string;
  summary: string;
  tags: string;
  identifier: string;
}

export function CreateVideoStoryForm() {
  const { user } = useCurrentUser();
  const { mutate: createEvent, isPending } = useNostrPublish();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    summary: '',
    tags: '',
    identifier: '',
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState<string>('');

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a video file (MP4, WebM, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Check file size (max 500MB for now)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Video must be less than 500MB',
        variant: 'destructive',
      });
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    // Load video to get duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = Math.floor(video.duration);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      URL.revokeObjectURL(video.src);
    };
    video.src = url;
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setThumbnailFile(file);
    const url = URL.createObjectURL(file);
    setThumbnailPreview(url);
  };

  const generateIdentifier = () => {
    const timestamp = Date.now();
    const titleSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
    return titleSlug ? `${titleSlug}-${timestamp}` : `video-${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !videoFile) {
      toast({
        title: 'Missing required fields',
        description: 'Title and video are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadProgress(10);

      // Upload thumbnail first
      let thumbnailUrl = '';
      if (thumbnailFile) {
        setUploadProgress(20);
        const [[_, thumbUrl]] = await uploadFile(thumbnailFile);
        thumbnailUrl = thumbUrl;
        setUploadProgress(40);
      }

      // Upload video
      toast({
        title: 'Uploading video...',
        description: 'This may take a while depending on video size',
      });
      
      const [[__, videoUrl]] = await uploadFile(videoFile);
      setUploadProgress(80);

      const identifier = formData.identifier.trim() || generateIdentifier();

      // Build tags according to divine.video format (kind 34235)
      const tags: string[][] = [
        ['d', identifier],
        ['title', formData.title.trim()],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
        ['url', videoUrl],
        ['m', videoFile.type],
        ['alt', `Video: ${formData.title.trim()}`],
      ];

      if (formData.summary.trim()) {
        tags.push(['summary', formData.summary.trim()]);
      }

      if (thumbnailUrl) {
        tags.push(['thumb', thumbnailUrl]);
      }

      if (videoDuration) {
        tags.push(['duration', videoDuration]);
      }

      // Add video dimensions if available
      if (videoRef.current) {
        tags.push(['dim', `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`]);
      }

      // Add topic tags
      if (formData.tags.trim()) {
        const topicTags = formData.tags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        topicTags.forEach(tag => {
          tags.push(['t', tag]);
        });
      }

      // Always add travel-related tags
      tags.push(['t', 'travel']);
      tags.push(['t', 'traveltelly']);

      setUploadProgress(90);

      // Publish to Nostr
      createEvent({
        kind: 34235, // divine.video format
        content: formData.summary.trim(),
        tags,
      }, {
        onSuccess: () => {
          setUploadProgress(100);
          toast({
            title: 'Video story published!',
            description: 'Your travel video has been shared on Nostr.',
          });
          
          // Reset form
          setFormData({
            title: '',
            summary: '',
            tags: '',
            identifier: '',
          });
          setVideoFile(null);
          setVideoPreview('');
          setThumbnailFile(null);
          setThumbnailPreview('');
          setUploadProgress(0);
          setVideoDuration('');
          
          navigate('/stories?tab=browse&type=video');
        },
        onError: () => {
          toast({
            title: 'Failed to publish video',
            description: 'Please try again.',
            variant: 'destructive',
          });
          setUploadProgress(0);
        },
      });

    } catch (error) {
      console.error('Video upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload video. Please try again.',
        variant: 'destructive',
      });
      setUploadProgress(0);
    }
  };

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Video className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            Please log in to create video stories.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isSubmitting = isPending || isUploading || uploadProgress > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          Create Video Story
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your travel adventures in video format using the divine.video standard (Kind 34235).
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
            Kind 34235
          </Badge>
          <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20">
            Divine.video
          </Badge>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
            Addressable
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video Upload */}
          <div>
            <Label htmlFor="video">
              Video <span className="text-red-500">*</span>
            </Label>
            <div className="mt-2">
              {!videoPreview ? (
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors"
                >
                  <Film className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm font-medium mb-1">Click to upload video</p>
                  <p className="text-xs text-muted-foreground">
                    MP4, WebM, or other video formats (max 500MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <video
                    ref={videoRef}
                    src={videoPreview}
                    controls
                    className="w-full max-h-96 rounded-lg bg-black"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoPreview('');
                      setVideoDuration('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {videoFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      {videoDuration && ` • ${videoDuration}`}
                    </p>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
            <div className="mt-2">
              {!thumbnailPreview ? (
                <div
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                >
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload thumbnail image
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-full max-w-md rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setThumbnailFile(null);
                      setThumbnailPreview('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailSelect}
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter video title..."
              className="mt-1"
              required
            />
          </div>

          {/* Summary */}
          <div>
            <Label htmlFor="summary">Description (optional)</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Describe your video..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Topic Tags (optional)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="vlog, adventure, destination (comma-separated)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple tags with commas. "travel" and "traveltelly" tags are added automatically.
            </p>
          </div>

          {/* Identifier */}
          <div>
            <Label htmlFor="identifier">Video Identifier (optional)</Label>
            <Input
              id="identifier"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              placeholder="unique-video-id (auto-generated if empty)"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for this video. Used for editing and linking.
            </p>
          </div>

          {/* Divine.video info */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">Divine.video Compatible</p>
              <p className="text-xs text-muted-foreground">
                This video will be published in divine.video format (Kind 34235), making it compatible
                with divine.video and other Nostr video platforms.
              </p>
            </AlertDescription>
          </Alert>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.title.trim() || !videoFile}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Publishing...'}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Publish Video Story
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
