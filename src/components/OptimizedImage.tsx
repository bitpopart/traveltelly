import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  /** Enable blur-up effect with low quality placeholder */
  blurUp?: boolean;
  /** Skip lazy loading for above-the-fold images */
  priority?: boolean;
  /** Aspect ratio for placeholder (e.g., "16/9", "1/1", "4/3") */
  aspectRatio?: string;
  /** Use thumbnail optimization (smaller size, lower quality for cards/feeds) */
  thumbnail?: boolean;
}

/**
 * Generates a thumbnail URL from a Blossom server image URL
 * Blossom supports automatic resizing via query parameters
 */
function getThumbnailUrl(url: string, width: number = 600, quality: number = 75): string {
  try {
    // Check if it's a Blossom server URL (nostr.build, satellite.earth, etc.)
    const urlObj = new URL(url);
    
    // Common Blossom server domains that support resizing
    const blossomDomains = ['nostr.build', 'satellite.earth', 'void.cat', 'nostrcheck.me', 'blossom.primal.net'];
    const isBlossomServer = blossomDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (isBlossomServer) {
      // Add width and quality parameters for faster loading
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      return urlObj.toString();
    }
    
    // For non-Blossom URLs, return original
    return url;
  } catch {
    // If URL parsing fails, return original
    return url;
  }
}

/**
 * Generates a tiny blur placeholder URL (very low quality, ~10-20px wide)
 */
function getBlurPlaceholderUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const blossomDomains = ['nostr.build', 'satellite.earth', 'void.cat', 'nostrcheck.me', 'blossom.primal.net'];
    const isBlossomServer = blossomDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (isBlossomServer) {
      // Request very small size for blur placeholder
      urlObj.searchParams.set('w', '40');
      urlObj.searchParams.set('q', '30'); // Very low quality for tiny file size
      return urlObj.toString();
    }
    
    return url;
  } catch {
    return url;
  }
}

export function OptimizedImage({
  src,
  alt,
  className,
  blurUp = true,
  priority = false,
  aspectRatio,
  thumbnail = false,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [blurLoaded, setBlurLoaded] = useState(false);

  // Generate optimized URLs - use aggressive optimization for thumbnails
  const width = thumbnail ? 300 : 600; // Much smaller for thumbnails
  const quality = thumbnail ? 60 : 75; // Lower quality for thumbnails
  const thumbnailUrl = getThumbnailUrl(src, width, quality);
  const blurUrl = blurUp ? getBlurPlaceholderUrl(src) : null;

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = () => {
    setIsError(true);
  };

  // Wrapper style for aspect ratio placeholder
  const wrapperStyle = aspectRatio ? {
    aspectRatio: aspectRatio,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  } : undefined;

  const imageContent = (
    <>
      {/* Blur placeholder image (loads first, very small file) */}
      {blurUp && blurUrl && !isError && (
        <img
          src={blurUrl}
          alt=""
          aria-hidden="true"
          onLoad={() => setBlurLoaded(true)}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-150',
            isLoaded ? 'opacity-0' : 'opacity-100',
            aspectRatio ? '' : className
          )}
          style={{ 
            filter: 'blur(20px)', 
            transform: 'scale(1.1)',
          }}
        />
      )}
      
      {/* Main optimized image */}
      <img
        src={thumbnailUrl}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-150',
          isLoaded ? 'opacity-100' : 'opacity-0',
          aspectRatio ? 'absolute inset-0 w-full h-full object-cover' : className
        )}
        {...props}
      />

      {/* Loading skeleton - only show if blur hasn't loaded yet */}
      {!blurLoaded && !isError && !blurUp && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse',
          aspectRatio && 'w-full h-full'
        )} />
      )}

      {/* Error state */}
      {isError && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center',
          aspectRatio && 'w-full h-full'
        )}>
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </>
  );

  if (aspectRatio) {
    return (
      <div style={wrapperStyle}>
        {imageContent}
      </div>
    );
  }

  return <>{imageContent}</>;
}
