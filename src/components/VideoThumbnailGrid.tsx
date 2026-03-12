import { useState, useRef, useCallback } from 'react';
import { Play, Volume2, VolumeX, Maximize2, X, Share2, Radio, Loader2 } from 'lucide-react';
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
  let dimensions = '';

  if (imetaTag) {
    for (let i = 1; i < imetaTag.length; i++) {
      const part = imetaTag[i];
      if (part.startsWith('url ')) videoUrl = part.substring(4);
      else if (part.startsWith('image ')) thumb = part.substring(6);
      else if (part.startsWith('dim ')) dimensions = part.substring(4);
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

  const isPortrait = dimensions
    ? (() => { const [w, h] = dimensions.split('x').map(Number); return h > w; })()
    : false;

  const title = video.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Video';

  return { thumb, videoUrl, duration, isPortrait, title, dimensions };
}

function VideoItem({ video }: VideoItemProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const { user } = useCurrentUser();
  const { mutate: rebroadcast, isPending: isRebroadcasting } = useRebroadcast();

  const { thumb, videoUrl, duration, isPortrait, title } = extractVideoMeta(video);

  const isDivineVideo = video.kind === 21 || video.kind === 22;
  const isOwnPost = user?.pubkey === video.pubkey;

  // Aspect ratio: portrait videos get 9/16, landscape get 16/9
  const aspectClass = isPortrait ? 'aspect-[9/16]' : 'aspect-video';

  // Check if thumb itself is a video (when no separate image thumbnail)
  const isVideoThumb = thumb && (
    thumb.endsWith('.webm') || thumb.endsWith('.mp4') || thumb.endsWith('.mov') ||
    thumb.includes('.webm?') || thumb.includes('.mp4?') || thumb.includes('.mov?')
  );

  const handlePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(true);
    setTimeout(() => {
      videoRef.current?.play().catch(() => {});
    }, 50);
  }, []);

  const handleStop = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setPlaying(false);
    setFullscreen(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted(m => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  }, []);

  const openFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreen(true);
  }, []);

  const closeFullscreen = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreen(false);
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
        toast({
          title: '⚡ Boosted to Nostr!',
          description: `Sent to ${succeeded.length} of ${total} relays.`,
        });
      },
      onError: () => {
        toast({ title: 'Boost failed', description: 'Could not rebroadcast.', variant: 'destructive' });
      },
    });
  }, [video, rebroadcast, toast]);

  return (
    <>
      {/* Fullscreen overlay */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={closeFullscreen}
        >
          <video
            src={videoUrl}
            poster={isVideoThumb ? undefined : thumb}
            controls
            autoPlay
            playsInline
            muted={muted}
            className={`max-h-screen ${isPortrait ? 'max-w-sm w-full' : 'max-w-full w-full'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={closeFullscreen}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black/90 z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Thumbnail card */}
      <div
        className={`relative group overflow-hidden rounded-lg bg-black cursor-pointer ${aspectClass}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={playing ? undefined : handlePlay}
      >
        {/* Thumbnail image (when not playing) */}
        {!playing && (
          <>
            {isVideoThumb ? (
              <video
                src={videoUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : thumb ? (
              <img
                src={thumb}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <Play className="w-10 h-10 text-gray-500" />
              </div>
            )}

            {/* Play button overlay */}
            <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-80'}`}>
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <Play className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Duration badge */}
            {duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                {duration}
              </div>
            )}

            {/* Title on hover */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
              <p className="text-white text-xs font-medium line-clamp-2">{title}</p>
            </div>

            {/* Action buttons on hover */}
            {hovered && (
              <div className="absolute top-2 right-2 flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={handleShareToDivine}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                  title="Open on divine.video"
                >
                  <Share2 className="w-2.5 h-2.5" />
                  <span>divine</span>
                </button>
                {isDivineVideo && isOwnPost && (
                  <button
                    onClick={handleBoost}
                    disabled={isRebroadcasting}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5"
                    title="Boost to Nostr"
                  >
                    {isRebroadcasting ? (
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    ) : (
                      <Radio className="w-2.5 h-2.5" />
                    )}
                    <span>{isRebroadcasting ? '…' : 'Boost'}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Inline video player (when playing) */}
        {playing && (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              poster={isVideoThumb ? undefined : thumb}
              autoPlay
              playsInline
              muted={muted}
              loop
              className="w-full h-full object-cover"
              onEnded={() => setPlaying(false)}
            />

            {/* Video controls overlay */}
            <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2">
              {/* Top controls */}
              <div className="flex justify-end gap-1">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90"
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={openFullscreen}
                  className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleStop}
                  className="p-1.5 rounded-full bg-black/70 text-white hover:bg-black/90"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bottom: title */}
              <div className="bg-gradient-to-t from-black/70 to-transparent pt-4 -mx-2 -mb-2 px-2 pb-2">
                <p className="text-white text-xs font-medium line-clamp-1">{title}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function VideoThumbnailGrid({ videos }: VideoThumbnailGridProps) {
  // Separate portrait and landscape videos for a mixed grid
  // Portrait (9:16) get narrower columns, landscape (16:9) get wider ones
  // Use a uniform grid but allow portrait items to be naturally taller

  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 md:gap-3 space-y-2 md:space-y-3">
      {videos.map((video) => {
        const { isPortrait } = extractVideoMeta(video);
        return (
          <div key={video.id} className={`break-inside-avoid ${isPortrait ? 'aspect-[9/16]' : 'aspect-video'}`}>
            <VideoItem video={video} />
          </div>
        );
      })}
    </div>
  );
}
