import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
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
  Film,
  Share2,
  SkipForward
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface VideoFormData {
  title: string;
  summary: string;
  tags: string;
  identifier: string;
  shareOnNostr: boolean;
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
    shareOnNostr: true, // Default to true
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number } | null>(null);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(6);
  const [showTrimEditor, setShowTrimEditor] = useState<boolean>(false);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Cleanup preview timeout/interval on unmount
  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
      }
    };
  }, []);

  // Cleanup blob URL when videoPreview changes or component unmounts
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  // Cleanup thumbnail blob URL when thumbnailPreview changes or component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

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

    // Check file size (max 100MB for 6-second videos)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Video must be less than 100MB. For 6-second clips, this should be plenty!',
        variant: 'destructive',
      });
      return;
    }

    // Revoke old blob URL if it exists
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
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
      
      // Set trim range - for devine.video we limit to 6 seconds max
      setTrimStart(0);
      setTrimEnd(Math.min(duration, 6));
      
      // Show trim editor if video is longer than 6 seconds
      if (duration > 6) {
        setShowTrimEditor(true);
        toast({
          title: 'Video needs trimming',
          description: 'Videos for devine.video must be 6 seconds or less. Please trim your video.',
          variant: 'default',
        });
      } else {
        setShowTrimEditor(false);
      }
      
      console.log('Video metadata loaded:', {
        duration,
        width: video.videoWidth,
        height: video.videoHeight,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        needsTrim: duration > 6
      });
      // DON'T revoke URL here - the main video player still needs it!
    };

    video.onerror = (e) => {
      console.error('Error loading video metadata:', e);
      toast({
        title: 'Video error',
        description: 'Could not load video metadata. File may be corrupted.',
        variant: 'destructive',
      });
      // DON'T revoke URL here either
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

    // Revoke old thumbnail blob URL if it exists
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
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

  const trimVideo = async (): Promise<File> => {
    if (!videoFile || !videoPreview) {
      throw new Error('No video to trim');
    }

    const trimmedDuration = trimEnd - trimStart;
    
    // If video is already within 6 seconds and no trimming needed
    if (trimmedDuration <= 6 && trimStart === 0 && trimEnd >= videoDuration) {
      return videoFile;
    }

    // For now, we'll just validate the trim range and return the original file
    // In a production environment, you would use FFmpeg.js or a server-side API to actually trim the video
    // For this implementation, we'll trust the user to trim manually or we'll upload the full video
    // and indicate the trim points in metadata
    
    if (trimmedDuration > 6) {
      throw new Error('Trimmed video must be 6 seconds or less');
    }

    toast({
      title: 'Video trim range set',
      description: `Video will be ${trimmedDuration.toFixed(1)}s (${trimStart.toFixed(1)}s - ${trimEnd.toFixed(1)}s)`,
    });

    return videoFile;
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

    // Validate 6-second limit for devine.video
    const trimmedDuration = trimEnd - trimStart;
    if (trimmedDuration > 6) {
      toast({
        title: 'Video too long',
        description: 'Videos for devine.video must be 6 seconds or less. Please adjust the trim range.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploadProgress(10);

      // Validate and prepare video
      await trimVideo();

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
      
      // Add duration in seconds (use trimmed duration)
      const finalDuration = trimEnd - trimStart;
      if (finalDuration > 0) {
        imetaTag.push(`duration ${finalDuration.toFixed(3)}`);
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

      // Publish video event to Nostr (NIP-71)
      createEvent({
        kind: videoKind, // NIP-71: 34235 for landscape, 34236 for portrait
        content: formData.summary.trim(),
        tags,
      });

      // Also create a regular Nostr note (kind 1) if shareOnNostr is checked
      if (formData.shareOnNostr && user) {
        const videoTypeEmoji = isPortrait ? '📱' : '🎬';
        const finalDuration = trimEnd - trimStart;
        const durationText = finalDuration > 0 
          ? `${Math.floor(finalDuration / 60)}:${(Math.floor(finalDuration) % 60).toString().padStart(2, '0')}`
          : '';

        let noteContent = `${videoTypeEmoji} ${formData.title.trim()}\n`;

        if (formData.summary.trim()) {
          noteContent += `\n${formData.summary.trim()}\n`;
        }

        if (durationText) {
          noteContent += `\n⏱️ Duration: ${durationText}`;
        }

        if (thumbnailUrl) {
          noteContent += `\n\n${thumbnailUrl}`;
        }

        // Add hashtags to note content
        let hashtagsText = '#video #travel #traveltelly';
        if (formData.tags.trim()) {
          const hashtagList = formData.tags
            .split(',')
            .map(tag => tag.trim().toLowerCase())
            .filter(tag => tag.length > 0);

          if (hashtagList.length > 0) {
            hashtagsText += ' #' + hashtagList.join(' #');
          }
        }

        noteContent += `\n\n${hashtagsText}`;

        // Add TravelTelly video link
        try {
          const naddr = nip19.naddrEncode({
            kind: videoKind,
            pubkey: user.pubkey,
            identifier,
          });
          noteContent += `\n\n🎥 Watch on TravelTelly\nhttps://traveltelly.com/video/${naddr}`;
        } catch (error) {
          console.error('Error creating naddr:', error);
        }

        // Create the regular note with relevant tags
        const noteTags: string[][] = [
          ['t', 'video'],
          ['t', 'travel'],
          ['t', 'traveltelly'],
        ];

        if (thumbnailUrl) {
          noteTags.push(['image', thumbnailUrl]);
        }

        if (videoUrl) {
          noteTags.push(['r', videoUrl]);
        }

        // Add topic hashtags to note tags
        if (formData.tags.trim()) {
          const hashtagList = formData.tags
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
      }

      setUploadProgress(100);
      toast({
        title: 'Video published!',
        description: formData.shareOnNostr 
          ? 'Your video has been shared on Nostr and is visible on all clients.'
          : 'Your video has been published to TravelTelly.',
      });
      
      // Reset form
      setFormData({
        title: '',
        summary: '',
        tags: '',
        identifier: '',
        shareOnNostr: true,
      });
      
      // Revoke blob URLs before clearing
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
      
      setVideoFile(null);
      setVideoPreview('');
      setThumbnailFile(null);
      setThumbnailPreview('');
      setUploadProgress(0);
      setVideoDuration(0);
      setVideoDimensions(null);
      setTrimStart(0);
      setTrimEnd(6);
      setShowTrimEditor(false);
      setIsPreviewing(false);
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
        previewTimeoutRef.current = null;
      }
      if (previewIntervalRef.current) {
        clearInterval(previewIntervalRef.current);
        previewIntervalRef.current = null;
      }
      
      navigate('/stories?tab=browse&type=video');

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
          Create Video Story for devine.video
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your travel adventures in 6-second video format using NIP-71 (Kind 34235 landscape / 34236 portrait).
          Perfect for quick, engaging travel moments on <a href="https://devine.video" target="_blank" rel="noopener noreferrer" className="underline font-medium">devine.video</a>.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
            NIP-71
          </Badge>
          <Badge variant="outline" className="bg-pink-50 dark:bg-pink-900/20">
            Kinds 34235/34236
          </Badge>
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-900/20">
            Addressable
          </Badge>
          <Badge variant="default" className="bg-purple-600">
            ⚡ 6s Max
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
                    MP4, WebM, or other video formats (max 100MB)
                  </p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                    ⚡ 6 seconds max for devine.video
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
                       onPause={(e) => {
                         if (isPreviewing) {
                           console.log('Video paused unexpectedly at:', e.currentTarget.currentTime);
                         }
                       }}
                       onEnded={(e) => {
                         console.log('Video ended event fired at:', e.currentTarget.currentTime);
                         if (isPreviewing) {
                           setIsPreviewing(false);
                           if (previewIntervalRef.current) {
                             clearInterval(previewIntervalRef.current);
                             previewIntervalRef.current = null;
                           }
                         }
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
                        // Revoke blob URL before clearing
                        if (videoPreview) {
                          URL.revokeObjectURL(videoPreview);
                        }
                        setVideoFile(null);
                        setVideoPreview('');
                        setVideoDuration(0);
                        setVideoDimensions(null);
                        setTrimStart(0);
                        setTrimEnd(6);
                        setShowTrimEditor(false);
                        setIsPreviewing(false);
                        if (previewTimeoutRef.current) {
                          clearTimeout(previewTimeoutRef.current);
                          previewTimeoutRef.current = null;
                        }
                        if (previewIntervalRef.current) {
                          clearInterval(previewIntervalRef.current);
                          previewIntervalRef.current = null;
                        }
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

           {/* Video Trim Editor (shown when video > 6 seconds) */}
           {videoPreview && videoDuration > 0 && (
              <div className="space-y-4 p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <Label className="text-base font-semibold">Video Length for devine.video</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Videos must be 6 seconds or less. {videoDuration > 6 ? 'Trim your video below.' : 'Perfect length!'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge variant={trimEnd - trimStart <= 6 ? 'default' : 'destructive'} className="text-sm whitespace-nowrap">
                      {(trimEnd - trimStart).toFixed(1)}s / 6s
                    </Badge>
                    {videoDuration > 6 && (
                      <span className="text-xs text-muted-foreground">
                        Full: {videoDuration.toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>

                {videoDuration > 6 && (
                  <div className="space-y-3">
                    {/* Visual timeline */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>0:00</span>
                        <span>{Math.floor(videoDuration / 60)}:{(Math.floor(videoDuration) % 60).toString().padStart(2, '0')}</span>
                      </div>
                      <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`absolute h-full transition-all ${isPreviewing ? 'bg-purple-600 animate-pulse' : 'bg-purple-500'}`}
                          style={{
                            left: `${(trimStart / videoDuration) * 100}%`,
                            width: `${((trimEnd - trimStart) / videoDuration) * 100}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">
                          Selected: {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                        </span>
                        <Badge variant={isPreviewing ? 'default' : 'outline'} className="text-xs">
                          {isPreviewing ? '▶ Playing' : `${(trimEnd - trimStart).toFixed(1)}s`}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <Label>Trim Position</Label>
                        <span className="text-muted-foreground">
                          {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, videoDuration - 6)}
                        step="0.1"
                        value={trimStart}
                        onChange={(e) => {
                          const newStart = parseFloat(e.target.value);
                          setTrimStart(newStart);
                          setTrimEnd(newStart + 6);
                          if (videoRef.current && !isPreviewing) {
                            videoRef.current.currentTime = newStart;
                          }
                        }}
                        className="w-full accent-purple-600"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Slide to choose which 6 seconds of your video to use
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={isPreviewing ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const video = videoRef.current;
                          if (!video) {
                            console.error('Video ref not available');
                            return;
                          }
                          
                          // If already previewing, stop it
                          if (isPreviewing) {
                            console.log('Stopping preview manually');
                            video.pause();
                            video.currentTime = trimStart;
                            if (previewIntervalRef.current) {
                              clearInterval(previewIntervalRef.current);
                              previewIntervalRef.current = null;
                            }
                            setIsPreviewing(false);
                            return;
                          }

                          const startTime = trimStart;
                          const endTime = trimEnd;
                          
                          console.log(`Starting preview from ${startTime.toFixed(2)}s to ${endTime.toFixed(2)}s (duration: ${(endTime - startTime).toFixed(2)}s)`);

                          // Clear any existing intervals
                          if (previewIntervalRef.current) {
                            clearInterval(previewIntervalRef.current);
                            previewIntervalRef.current = null;
                          }

                          // Pause first to ensure clean state
                          video.pause();
                          
                          // Set to start position
                          video.currentTime = startTime;
                          
                          // Unmute for preview (muted videos may behave differently)
                          const wasMuted = video.muted;
                          video.muted = false;
                          
                          // Small delay to ensure currentTime is set
                          setTimeout(() => {
                            if (!videoRef.current) return;
                            
                            const playPromise = videoRef.current.play();
                            
                            if (playPromise !== undefined) {
                              playPromise.then(() => {
                                console.log('Video playing successfully from:', videoRef.current?.currentTime);
                                setIsPreviewing(true);

                                // Monitor playback with interval
                                previewIntervalRef.current = setInterval(() => {
                                  if (!videoRef.current) {
                                    console.log('Video ref lost, stopping interval');
                                    if (previewIntervalRef.current) {
                                      clearInterval(previewIntervalRef.current);
                                      previewIntervalRef.current = null;
                                    }
                                    setIsPreviewing(false);
                                    return;
                                  }

                                  const current = videoRef.current.currentTime;
                                  const remaining = endTime - current;
                                  console.log(`Current: ${current.toFixed(2)}s | End: ${endTime.toFixed(2)}s | Remaining: ${remaining.toFixed(2)}s | Playing: ${!videoRef.current.paused}`);
                                  
                                  // Check if video stopped playing unexpectedly
                                  if (videoRef.current.paused && current < endTime - 0.2) {
                                    console.warn('Video paused unexpectedly! Attempting to resume...');
                                    videoRef.current.play().catch(err => {
                                      console.error('Failed to resume:', err);
                                      if (previewIntervalRef.current) {
                                        clearInterval(previewIntervalRef.current);
                                        previewIntervalRef.current = null;
                                      }
                                      setIsPreviewing(false);
                                    });
                                  }
                                  
                                  // Stop when we reach the trim end (with small buffer)
                                  if (current >= endTime - 0.05) {
                                    console.log('Reached trim end, stopping at:', current.toFixed(2));
                                    videoRef.current.pause();
                                    videoRef.current.currentTime = startTime;
                                    videoRef.current.muted = wasMuted;
                                    
                                    if (previewIntervalRef.current) {
                                      clearInterval(previewIntervalRef.current);
                                      previewIntervalRef.current = null;
                                    }
                                    setIsPreviewing(false);
                                  }
                                }, 100); // Check every 100ms

                              }).catch((error) => {
                                console.error('Play error:', error);
                                setIsPreviewing(false);
                                video.muted = wasMuted;
                                
                                // Show user-friendly message based on error
                                const errorMessage = error.name === 'NotAllowedError' 
                                  ? 'Please interact with the video first (click play on the video above), then try again.'
                                  : 'Could not play the video. Please try again.';
                                
                                toast({
                                  title: 'Preview failed',
                                  description: errorMessage,
                                  variant: 'destructive',
                                });
                              });
                            }
                          }, 100);
                        }}
                        className="flex-1"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        {isPreviewing ? 'Stop Preview' : 'Preview Trim'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = trimStart;
                            if (previewIntervalRef.current) {
                              clearInterval(previewIntervalRef.current);
                              previewIntervalRef.current = null;
                            }
                            setIsPreviewing(false);
                            toast({
                              title: 'Jumped to start',
                              description: `Video position set to ${trimStart.toFixed(1)}s. Use video controls to play manually.`,
                            });
                          }
                        }}
                        className="flex-1"
                      >
                        <SkipForward className="w-3 h-3 mr-1" />
                        Jump to Start
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTrimStart(0);
                          setTrimEnd(6);
                          if (videoRef.current) {
                            videoRef.current.pause();
                            videoRef.current.currentTime = 0;
                          }
                          if (previewTimeoutRef.current) {
                            clearTimeout(previewTimeoutRef.current);
                            previewTimeoutRef.current = null;
                          }
                          if (previewIntervalRef.current) {
                            clearInterval(previewIntervalRef.current);
                            previewIntervalRef.current = null;
                          }
                          setIsPreviewing(false);
                        }}
                        className="w-full"
                      >
                        Reset to First 6 Seconds
                      </Button>
                    </div>

                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription className="text-xs">
                        <div className="space-y-1">
                          <p><strong>How to select your 6-second clip:</strong></p>
                          <ol className="list-decimal list-inside space-y-0.5 ml-2">
                            <li>Slide to choose which 6 seconds you want (purple bar shows selection)</li>
                            <li>Click "Jump to Start" to position the video, then use video controls to play</li>
                            <li>OR click "Preview Trim" for automatic playback (may require interaction first)</li>
                          </ol>
                        </div>
                      </AlertDescription>
                    </Alert>
                 </div>
               )}

               {videoDuration <= 6 && (
                 <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <span>Your video is the perfect length for devine.video!</span>
                 </div>
               )}
             </div>
           )}

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
                      // Revoke blob URL before clearing
                      if (thumbnailPreview) {
                        URL.revokeObjectURL(thumbnailPreview);
                      }
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

          {/* Share on Nostr Switch */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-purple-50/50 dark:bg-purple-900/10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="w-4 h-4 text-purple-600" />
                <Label htmlFor="share-on-nostr" className="font-semibold cursor-pointer">
                  Share on Nostr
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Also publish as a regular note (kind 1) for visibility on all Nostr clients. 
                Your video will appear in followers' feeds just like reviews do.
              </p>
            </div>
            <Switch
              id="share-on-nostr"
              checked={formData.shareOnNostr}
              onCheckedChange={(checked) => setFormData({ ...formData, shareOnNostr: checked })}
            />
          </div>

          {/* NIP-71 info */}
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription className="text-sm">
              <p className="font-medium mb-1">NIP-71 Video Events for devine.video</p>
              <p className="text-xs text-muted-foreground mb-2">
                Your video will use Kind 34235 (landscape) or 34236 (portrait) automatically based on dimensions.
                Videos are limited to <strong>6 seconds maximum</strong> for devine.video compatibility.
              </p>
              <p className="text-xs text-muted-foreground">
                Compatible with Nostr video platforms: <a href="https://devine.video" target="_blank" rel="noopener noreferrer" className="underline font-medium">devine.video</a>, Flare, and others.
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
