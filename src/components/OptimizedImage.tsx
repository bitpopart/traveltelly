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
      urlObj.searchParams.set('w', '10'); // Tiny size for instant load (was 20)
      urlObj.searchParams.set('q', '10'); // Minimal quality for tiny file size (was 20)
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
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Generate optimized URLs - use aggressive optimization for thumbnails
  const width = thumbnail ? 200 : 800; // Even smaller thumbnails for faster loading (was 300)
  const quality = thumbnail ? 60 : 80; // Lower quality for thumbnails (was 65)
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
        rootMargin: '50px', // Reduced from 200px - only load when very close to viewport
        threshold: 0.01,
      }
    );

    const element = containerRef.current;
    if (element) {
      observer.observe(element);
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
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-0' : 'opacity-100',
            aspectRatio ? '' : className
          )}
          style={{ 
            filter: 'blur(10px)',
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

      {/* No placeholders, no error states - just empty space or background color */}
    </>
  );

  if (aspectRatio) {
    return (
      <div ref={containerRef} style={wrapperStyle}>
        {imageContent}
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {imageContent}
    </div>
  );
}
