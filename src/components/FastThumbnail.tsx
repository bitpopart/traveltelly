import React from 'react';
import { cn } from '@/lib/utils';

interface FastThumbnailProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  /** Skip lazy loading for first few images */
  priority?: boolean;
}

/**
 * Ultra-fast thumbnail component optimized for mobile image grids
 * - Uses native lazy loading (browser-optimized)
 * - Minimal thumbnail sizes for instant loading
 * - No blur effects (faster render)
 * - Simple, predictable behavior
 */
export function FastThumbnail({
  src,
  alt,
  className,
  priority = false,
  ...props
}: FastThumbnailProps) {
  // Detect mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Generate thumbnail URL
  const thumbnailUrl = getThumbnailUrl(src, isMobile);

  return (
    <img
      src={thumbnailUrl}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      className={cn('w-full h-full object-cover', className)}
      {...props}
    />
  );
}

/**
 * Generate optimized thumbnail URL
 * Mobile: 200px width, Desktop: 400px width
 * Only applies to hosts that support it (nostr.build)
 */
function getThumbnailUrl(url: string, isMobile: boolean): string {
  try {
    const urlObj = new URL(url);
    
    // Only apply resize to nostr.build (most reliable)
    if (urlObj.hostname.includes('nostr.build')) {
      const width = isMobile ? 200 : 400;
      if (!urlObj.searchParams.has('w')) {
        urlObj.searchParams.set('w', width.toString());
      }
      return urlObj.toString();
    }
    
    // For all other hosts, use original URL
    // This ensures compatibility and fast loading
    return url;
  } catch {
    return url;
  }
}
