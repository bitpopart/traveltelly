import { useState, useCallback, useRef } from 'react';
import { FileText } from 'lucide-react';
import { nip19 } from 'nostr-tools';
import { useNavigate } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

interface WrittenStoryThumbnailGridProps {
  stories: NostrEvent[];
}

interface WrittenStoryItemProps {
  story: NostrEvent;
  priority?: boolean;
}

function WrittenStoryItem({ story, priority = false }: WrittenStoryItemProps) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
  const image = story.tags.find(([name]) => name === 'image')?.[1] || '';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1] || '';
  const htmlPageUrl = story.tags.find(([name]) => name === 'brand_site')?.[1] || '';
  const isHtmlPage = !!htmlPageUrl;

  const identifierRaw = story.tags.find(([name]) => name === 'd')?.[1];
  const identifier = typeof identifierRaw === 'string' && identifierRaw.length > 0 ? identifierRaw : null;

  const handleMouseEnter = useCallback(() => {
    hoverTimerRef.current = setTimeout(() => setHovered(true), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    setHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!identifier) return;
    const naddr = nip19.naddrEncode({ kind: story.kind, pubkey: story.pubkey, identifier });
    navigate(isHtmlPage ? `/story-page/${naddr}` : `/story/${naddr}`);
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
      {hasImage ? (
        <>
          {/* Low-res placeholder shown until image loads */}
          {!loaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20 animate-pulse" />
          )}
          <img
            src={image}
            alt={title}
            width={300}
            height={300}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        </>
      ) : (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-800/20">
          <FileText className="w-8 h-8 text-green-400 dark:text-green-500 opacity-60" />
        </div>
      )}

      {/* Hover overlay */}
      <div className={`absolute inset-0 flex flex-col justify-between p-1.5 transition-opacity duration-150 ${hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <div className="relative mt-auto">
          <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight drop-shadow">{title}</p>
          {summary && (
            <p className="text-white/70 text-[9px] mt-0.5 line-clamp-1 leading-tight">{summary}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function WrittenStoryThumbnailGrid({ stories }: WrittenStoryThumbnailGridProps) {
  // Calculate columns per row based on breakpoints (lg=6, md=5, sm=4, base=3)
  // Eagerly load first 2 rows (12 items covers lg breakpoint's first 2 rows)
  const EAGER_COUNT = 12;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0.5 md:gap-1">
      {stories.map((story, i) => (
        <WrittenStoryItem key={story.id} story={story} priority={i < EAGER_COUNT} />
      ))}
    </div>
  );
}
