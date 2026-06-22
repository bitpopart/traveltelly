import { useState, useCallback, useRef } from 'react';
import { FileText, Globe, Loader2 } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

interface WrittenStoryThumbnailGridProps {
  stories: NostrEvent[];
}

interface WrittenStoryItemProps {
  story: NostrEvent;
}

function WrittenStoryItem({ story }: WrittenStoryItemProps) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
  const image = story.tags.find(([name]) => name === 'image')?.[1] || '';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1] || '';

  // Check if this story has an HTML page (brand_site tag)
  const htmlPageUrl = story.tags.find(([name]) => name === 'brand_site')?.[1] || '';
  const isHtmlPage = !!htmlPageUrl;

  // Build naddr for navigation
  const identifierRaw = story.tags.find(([name]) => name === 'd')?.[1];
  const identifier = typeof identifierRaw === 'string' && identifierRaw.length > 0 ? identifierRaw : null;

  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => {
      setHovered(true);
    }, 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!identifier) return;

    const naddr = nip19.naddrEncode({
      kind: story.kind,
      pubkey: story.pubkey,
      identifier,
    });

    if (isHtmlPage) {
      // Navigate to the full HTML page view
      navigate(`/story-page/${naddr}`);
    } else {
      // Navigate to the regular story detail page
      navigate(`/story/${naddr}`);
    }
  }, [story, identifier, isHtmlPage, navigate]);

  if (!identifier) return null;

  const hasImage = image && !imgError;

  return (
    <div
      className="relative aspect-square overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-800 cursor-pointer group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Thumbnail image or fallback */}
      {hasImage ? (
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
          <FileText className="w-8 h-8 text-green-400 dark:text-green-500 opacity-60" />
        </div>
      )}

      {/* HTML page badge */}
      {isHtmlPage && (
        <div className="absolute top-1.5 left-1.5 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 font-medium">
          <Globe className="w-2.5 h-2.5" />
          <span>HTML</span>
        </div>
      )}

      {/* Hover overlay with title */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-1.5 transition-opacity duration-150 ${
          hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Bottom title */}
        <div className="relative mt-auto">
          <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight drop-shadow">
            {title}
          </p>
          {summary && (
            <p className="text-white/70 text-[9px] mt-0.5 line-clamp-1 leading-tight">
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WrittenStoryThumbnailGrid({ stories }: WrittenStoryThumbnailGridProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
      {stories.map((story) => (
        <WrittenStoryItem key={story.id} story={story} />
      ))}
    </div>
  );
}
