import { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, X, Share2, Radio, Loader2 } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useToast } from '@/hooks/useToast';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useRebroadcast } from '@/hooks/useRebroadcast';
import type { NostrEvent } from '@nostrify/nostrify';

interface VideoThumbnailGridProps {
  videos: NostrEvent[];
}

interface VideoItemProps {
  video: NostrEvent;
}

function extractVideoMeta(video: NostrEvent) {
  const imetaTag = video.tags.find(([name]) => name === 'imeta');
  let thumb = '';
  let videoUrl = '';
  let duration = '';

  if (imetaTag) {
    for (let i = 1; i < imetaTag.length; i++) {
      const part = imetaTag[i];
      if (part.startsWith('url ')) videoUrl = part.substring(4);
      else if (part.startsWith('image ')) thumb = part.substring(6);
      else if (part.startsWith('duration ')) {
        const sec = parseFloat(part.substring(9));
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        duration = `${m}:${s.toString().padStart(2, '0')}`;
      }
    }
  }

  // Fallback to legacy tags
  if (!videoUrl) videoUrl = video.tags.find(([name]) => name === 'url')?.[1] || '';
  if (!thumb) thumb = video.tags.find(([name]) => name === 'thumb')?.[1] || '';
  if (!duration) {
    const sec = parseFloat(video.tags.find(([name]) => name === 'duration')?.[1] || '0');
    if (sec > 0) {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      duration = `${m}:${s.toString().padStart(2, '0')}`;
    }
  }

  const title = video.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Video';

  // Check if thumb itself is a video file (no separate image thumbnail)
  const isVideoThumb = thumb && (
    thumb.endsWith('.webm') || thumb.endsWith('.mp4') || thumb.endsWith('.mov') ||
    thumb.includes('.webm?') || thumb.includes('.mp4?') || thumb.includes('.mov?')
  );

  return { thumb, videoUrl, duration, title, isVideoThumb };
}

export function VideoItem({ video }: VideoItemProps) {
  const [previewing, setPreviewing] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const previewRef = useRef<HTMLVideoElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { mutate: rebroadcast, isPending: isRebroadcasting } = useRebroadcast();

  const { thumb, videoUrl, duration, title, isVideoThumb } = extractVideoMeta(video);

  const isDivineVideo = video.kind === 21 || video.kind === 22;
  const isOwnPost = user?.pubkey === video.pubkey;

  // Mouse-enter: short delay then start muted preview
  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setPreviewing(true);
      // play after state update
      requestAnimationFrame(() => {
        previewRef.current?.play().catch(() => {});
      });
    }, 200);
  }, []);

  // Mouse-leave: cancel pending, stop preview
  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setPreviewing(false);
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
    }
  }, []);

  // Click: open fullscreen player
  const handleClick = useCallback(() => {
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreen(false);
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => {
      const next = !m;
      if (previewRef.current) previewRef.current.muted = next;
      return next;
    });
  }, []);

  const handleShareToDivine = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const dTag = video.tags.find(([name]) => name === 'd')?.[1];
    const nostrRef = dTag
      ? nip19.naddrEncode({ kind: video.kind, pubkey: video.pubkey, identifier: dTag })
      : nip19.neventEncode({ id: video.id, author: video.pubkey });
    window.open(`https://www.divine.video/${nostrRef}`, '_blank', 'noopener,noreferrer');
  }, [video]);

  const handleBoost = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    rebroadcast(video, {
      onSuccess: ({ succeeded, total }) => {
        toast({ title: '⚡ Boosted to Nostr!', description: `Sent to ${succeeded.length} of ${total} relays.` });
      },
      onError: () => {
        toast({ title: 'Boost failed', description: 'Could not rebroadcast.', variant: 'destructive' });
      },
    });
  }, [video, rebroadcast, toast]);

  return (
    <>
      {/* Fullscreen overlay — click outside to close */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <video
            src={videoUrl}
            poster={isVideoThumb ? undefined : (thumb || undefined)}
            controls
            autoPlay
            playsInline
            className="max-h-[90vh] max-w-[95vw] w-auto"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Square cell — always aspect-square */}
      <div
        className="relative aspect-square overflow-hidden rounded-sm bg-black cursor-pointer group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {/* Static thumbnail (always rendered, hidden behind video when previewing) */}
        {isVideoThumb ? (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : thumb ? (
          <img
            src={thumb}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gray-800" />
        )}

        {/* Muted preview video — overlays thumbnail on hover */}
        {videoUrl && !isVideoThumb && (
          <video
            ref={previewRef}
            src={videoUrl}
            muted={muted}
            playsInline
            loop
            preload="none"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${previewing ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Duration badge — always visible */}
        {duration && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[10px] px-1 py-0.5 rounded font-mono leading-none">
            {duration}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col justify-between p-1.5">
          {/* Top-right controls */}
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            {previewing && (
              <button
                onClick={toggleMute}
                className="p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                title={muted ? 'Unmute' : 'Mute'}
              >
                {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
              </button>
            )}
            <button
              onClick={handleShareToDivine}
              className="p-1 rounded-full bg-black/60 text-white hover:bg-purple-600/90"
              title="Open on divine.video"
            >
              <Share2 className="w-3 h-3" />
            </button>
            {isDivineVideo && isOwnPost && (
              <button
                onClick={handleBoost}
                disabled={isRebroadcasting}
                className="p-1 rounded-full bg-black/60 text-white hover:bg-orange-500/90 disabled:opacity-50"
                title="Boost to Nostr"
              >
                {isRebroadcasting
                  ? <Loader2 className="w-3 h-3 animate-spin" />
                  : <Radio className="w-3 h-3" />}
              </button>
            )}
          </div>

          {/* Bottom title gradient */}
          <div className="bg-gradient-to-t from-black/70 via-black/20 to-transparent -mx-1.5 -mb-1.5 px-2 pb-2 pt-6">
            <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight">{title}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function VideoThumbnailGrid({ videos }: VideoThumbnailGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
      {videos.map((video) => (
        <VideoItem key={video.id} video={video} />
      ))}
    </div>
  );
}
