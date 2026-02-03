import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Calendar, ExternalLink, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/useToast';
import type { NostrEvent } from '@nostrify/nostrify';

interface VideoPlayerDialogProps {
  video: NostrEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VideoPlayerDialog({ video, open, onOpenChange }: VideoPlayerDialogProps) {
  const author = useAuthor(video.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(video.pubkey);
  const profileImage = metadata?.picture;
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  const title = video.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Video';
  const summary = video.tags.find(([name]) => name === 'summary')?.[1];
  const identifier = video.tags.find(([name]) => name === 'd')?.[1] || '';

  // Parse imeta tag for video metadata (NIP-71)
  const imetaTag = video.tags.find(([name]) => name === 'imeta');
  let videoUrl = '';
  let thumb = '';
  let duration = '';
  let dimensions = '';

  if (imetaTag) {
    for (let i = 1; i < imetaTag.length; i++) {
      const part = imetaTag[i];
      if (part.startsWith('url ')) {
        videoUrl = part.substring(4);
      } else if (part.startsWith('image ')) {
        thumb = part.substring(6);
      } else if (part.startsWith('duration ')) {
        const durationSec = parseFloat(part.substring(9));
        const minutes = Math.floor(durationSec / 60);
        const seconds = Math.floor(durationSec % 60);
        duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else if (part.startsWith('dim ')) {
        dimensions = part.substring(4);
      }
    }
  }

  // Detect video orientation from dimensions or video element
  useEffect(() => {
    if (dimensions) {
      const [width, height] = dimensions.split('x').map(Number);
      setIsPortrait(height > width);
    }
  }, [dimensions]);

  // Also detect when video loads
  const handleVideoLoad = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      setIsPortrait(video.videoHeight > video.videoWidth);
    }
  };

  // Fallback to legacy tags
  if (!videoUrl) {
    videoUrl = video.tags.find(([name]) => name === 'url')?.[1] || '';
  }
  if (!thumb) {
    thumb = video.tags.find(([name]) => name === 'thumb')?.[1] || '';
  }
  if (!duration) {
    duration = video.tags.find(([name]) => name === 'duration')?.[1] || '';
  }

  const topicTags = video.tags
    .filter(([name]) => name === 't')
    .map(([, value]) => value)
    .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0 && !['travel', 'traveltelly'].includes(tag))
    .slice(0, 5);

  const naddr = nip19.naddrEncode({
    kind: video.kind,
    pubkey: video.pubkey,
    identifier,
  });

  const handleShareToDevine = () => {
    // Create devine.video share URL
    const devineUrl = `https://www.devine.video/share?url=${encodeURIComponent(videoUrl)}&title=${encodeURIComponent(title)}`;
    
    // Open in new window
    window.open(devineUrl, '_blank', 'noopener,noreferrer');
    
    toast({
      title: 'Opening devine.video',
      description: 'Share your video to your devine.video account',
    });
  };

  // Determine dialog size based on orientation
  const dialogClassName = isPortrait 
    ? "max-w-md max-h-[90vh] overflow-y-auto p-0" 
    : "max-w-4xl max-h-[90vh] overflow-y-auto p-0";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={dialogClassName}>
        {/* Video Player */}
        {videoUrl && (
          <div className={`${isPortrait ? 'aspect-[9/16]' : 'aspect-video'} bg-black relative`}>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={thumb}
              controls
              autoPlay
              preload="metadata"
              playsInline
              onLoadedMetadata={handleVideoLoad}
              className="w-full h-full"
            />
            
            {/* Share to devine.video button */}
            <div className="absolute bottom-4 right-4">
              <Button
                onClick={handleShareToDevine}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share to devine
              </Button>
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          {/* Header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          </DialogHeader>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profileImage} alt={displayName} />
                <AvatarFallback className="text-xs">
                  {displayName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{displayName}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(video.created_at * 1000), { addSuffix: true })}</span>
                  {duration && (
                    <>
                      <span>•</span>
                      <span>{duration}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Link to={`/video/${naddr}`} onClick={() => onOpenChange(false)}>
              <Button variant="outline" size="sm">
                <ExternalLink className="w-4 h-4 mr-2" />
                Full Page
              </Button>
            </Link>
          </div>

          {/* Description */}
          {summary && (
            <div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}

          {/* Tags */}
          {topicTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topicTags.map((tag, index) => (
                <Badge key={`${tag}-${index}`} variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
