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
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);

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

    // Log file info for debugging
    console.log('Selected video file:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

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
    
    // Create object URL for the video
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    // Load video to get duration and dimensions
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      const duration = video.duration;
      setVideoDuration(duration);
      setVideoDimensions({
        width: video.videoWidth,
        height: video.videoHeight,
      });
      console.log('Video metadata loaded:', {
        duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
      });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = (e) => {
      console.error('Error loading video metadata:', e);
      toast({
        title: 'Video error',
        description: 'Could not load video metadata. File may be corrupted.',
        variant: 'destructive',
      });
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

  const generateThumbnailFromVideo = async () => {
    if (!videoPreview || !videoRef.current) {
      toast({
        title: 'No video loaded',
        description: 'Please upload a video first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const video = videoRef.current;
      
      // Ensure video metadata is loaded
      if (!video.duration || video.duration === 0 || isNaN(video.duration)) {
        toast({
          title: 'Video still loading',
          description: 'Please wait for the video to fully load',
          variant: 'destructive',
        });
        return;
      }

      // Check if video has valid dimensions
      if (!video.videoWidth || !video.videoHeight) {
        toast({
          title: 'Invalid video',
          description: 'Cannot determine video dimensions',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Generating thumbnail...',
        description: 'Please wait',
      });

      // Seek to 25% of video duration for a better frame (or 1 second, whichever is less)
      const seekTime = Math.min(video.duration * 0.25, 1);
      
      // Wait for seek to complete
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Seek timeout'));
        }, 5000);

        video.onseeked = () => {
          clearTimeout(timeout);
          resolve();
        };

        video.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Video error during seek'));
        };

        video.currentTime = seekTime;
      });

      // Small delay to ensure frame is rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create a canvas to capture the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.85 // Quality
        );
      });

      // Create file from blob
      const thumbnailFileName = `thumbnail-${Date.now()}.jpg`;
      const file = new File([blob], thumbnailFileName, { type: 'image/jpeg' });

      // Set the thumbnail
      setThumbnailFile(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);

      toast({
        title: 'Thumbnail generated!',
        description: 'Video thumbnail created successfully',
      });

      // Reset video to start
      video.currentTime = 0;
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      toast({
        title: 'Failed to generate thumbnail',
        description: error instanceof Error ? error.message : 'Please try uploading a custom thumbnail instead',
        variant: 'destructive',
      });
    }
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

      // Determine if video is portrait or landscape based on dimensions
      const isPortrait = videoDimensions ? videoDimensions.height > videoDimensions.width : false;
      const videoKind = isPortrait ? 34236 : 34235; // 34236 for portrait (short), 34235 for landscape (normal)

      // Build imeta tag according to NIP-71
      const imetaTag = ['imeta'];
      
      // Add dimensions
      if (videoDimensions) {
        imetaTag.push(`dim ${videoDimensions.width}x${videoDimensions.height}`);
      }
      
      // Add URL
      imetaTag.push(`url ${videoUrl}`);
      
      // Add mime type
      imetaTag.push(`m ${videoFile.type}`);
      
      // Add thumbnail
      if (thumbnailUrl) {
        imetaTag.push(`image ${thumbnailUrl}`);
      }
      
      // Add duration in seconds
      if (videoDuration) {
        imetaTag.push(`duration ${videoDuration.toFixed(3)}`);
      }

      // Build tags according to NIP-71 format
      const tags: string[][] = [
        ['d', identifier],
        ['title', formData.title.trim()],
        ['published_at', Math.floor(Date.now() / 1000).toString()],
        ['alt', `Video: ${formData.title.trim()}`],
        imetaTag,
      ];

      if (formData.summary.trim()) {
        tags.push(['summary', formData.summary.trim()]);
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
        kind: videoKind, // NIP-71: 34235 for landscape, 34236 for portrait
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
          Share your travel adventures in video format using NIP-71 (Kind 34235 landscape / 34236 portrait).
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
            NIP-71
          </Badge>
          <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20">
            Kinds 34235/34236
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
                <div className="space-y-3">
                  <div className="relative inline-block max-w-full">
                    <video
                      ref={videoRef}
                      src={videoPreview}
                      controls
                      preload="metadata"
                      playsInline
                      muted
                      className="max-w-md w-auto max-h-80 rounded-lg bg-black"
                      style={{ display: 'block' }}
                      onLoadedMetadata={(e) => {
                        const video = e.currentTarget;
                        console.log('Video loaded:', {
                          duration: video.duration,
                          width: video.videoWidth,
                          height: video.videoHeight
                        });
                      }}
                      onError={(e) => {
                        console.error('Video load error:', e);
                        const video = e.currentTarget;
                        const error = video.error;
                        let errorMessage = 'Failed to load video preview';
                        
                        if (error) {
                          switch (error.code) {
                            case error.MEDIA_ERR_ABORTED:
                              errorMessage = 'Video loading was aborted';
                              break;
                            case error.MEDIA_ERR_NETWORK:
                              errorMessage = 'Network error while loading video';
                              break;
                            case error.MEDIA_ERR_DECODE:
                              errorMessage = 'Video format not supported or file corrupted';
                              break;
                            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                              errorMessage = 'Video format not supported by browser';
                              break;
                          }
                          console.error('Video error details:', {
                            code: error.code,
                            message: error.message
                          });
                        }
                        
                        toast({
                          title: 'Video load error',
                          description: errorMessage,
                          variant: 'destructive',
                        });
                      }}
                    >
                      {videoFile && <source src={videoPreview} type={videoFile.type} />}
                    </video>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview('');
                        setVideoDuration(0);
                        setVideoDimensions(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {videoFile && (
                    <p className="text-xs text-muted-foreground">
                      {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                      {videoDuration > 0 && ` • ${Math.floor(videoDuration / 60)}:${(Math.floor(videoDuration) % 60).toString().padStart(2, '0')}`}
                      {videoDimensions && ` • ${videoDimensions.width}x${videoDimensions.height}`}
                      {videoDimensions && (
                        <Badge variant="outline" className="ml-2">
                          {videoDimensions.height > videoDimensions.width ? 'Portrait' : 'Landscape'}
                        </Badge>
                      )}
                    </p>
                  )}
                </div>
              )}
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="thumbnail">Thumbnail (optional)</Label>
              {videoPreview && !thumbnailPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateThumbnailFromVideo}
                  className="text-xs"
                >
                  <Video className="w-3 h-3 mr-1" />
                  Generate from Video
                </Button>
              )}
            </div>
            <div className="mt-2">
              {!thumbnailPreview ? (
                <div>
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Click to upload thumbnail image
                    </p>
                  </div>
                  {videoPreview && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Or use the "Generate from Video" button above to auto-create a thumbnail
                    </p>
                  )}
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
                  {thumbnailFile && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
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

          {/* NIP-71 info */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">NIP-71 Video Events</p>
              <p className="text-xs text-muted-foreground">
                Your video will use Kind 34235 (landscape) or 34236 (portrait) automatically based on dimensions.
                This makes it compatible with Nostr video platforms like divine.video, Flare, and others.
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
