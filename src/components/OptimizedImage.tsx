import React, { useState, useEffect, useRef } from 'react';
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
      // Clear existing params and add optimized ones for faster loading
      urlObj.search = '';
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('q', quality.toString());
      // Add format hint for better compression
      urlObj.searchParams.set('f', 'webp');
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
      // Clear existing params and request very small size for blur placeholder
      urlObj.search = '';
      urlObj.searchParams.set('w', '20'); // Even smaller for ultra-fast load
      urlObj.searchParams.set('q', '20'); // Very low quality for tiny file size
      urlObj.searchParams.set('f', 'webp'); // Force WebP for smallest size
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
  const [shouldLoad, setShouldLoad] = useState(priority); // Only load immediately if priority
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs - use aggressive optimization for thumbnails
  const width = thumbnail ? 400 : 800; // Optimized sizes for thumbnails
  const quality = thumbnail ? 70 : 80; // Balanced quality for thumbnails
  const thumbnailUrl = getThumbnailUrl(src, width, quality);
  const blurUrl = blurUp ? getBlurPlaceholderUrl(src) : null;

  // Intersection Observer for lazy loading non-priority images
  useEffect(() => {
    if (priority || shouldLoad) return; // Skip if already marked to load

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    );

    if (imgRef.current?.parentElement) {
      observer.observe(imgRef.current.parentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority, shouldLoad]);

  // Preload priority images
  useEffect(() => {
    if (priority && thumbnailUrl) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = thumbnailUrl;
      document.head.appendChild(link);
      
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [priority, thumbnailUrl]);

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
      {/* Blur placeholder image (loads immediately - very small file ~1-2KB) */}
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
      
      {/* Main optimized image - only loads when shouldLoad is true */}
      {shouldLoad && (
        <img
          ref={imgRef}
          src={thumbnailUrl}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-150',
            isLoaded ? 'opacity-100' : 'opacity-0',
            aspectRatio ? 'absolute inset-0 w-full h-full object-cover' : className
          )}
          {...props}
        />
      )}

      {/* Loading skeleton - only show if no blur-up and nothing loaded yet */}
      {!blurLoaded && !isError && !blurUp && !shouldLoad && (
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
