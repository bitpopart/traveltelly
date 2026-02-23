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
    const blossomDomains = [
      'nostr.build', 
      'image.nostr.build',
      'satellite.earth', 
      'void.cat', 
      'nostrcheck.me', 
      'blossom.primal.net',
      'primal.net'
    ];
    const isBlossomServer = blossomDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (isBlossomServer) {
      // For nostr.build and image.nostr.build, use their specific thumbnail format
      if (urlObj.hostname.includes('nostr.build')) {
        // For image.nostr.build or nostr.build, just add width parameter
        if (!urlObj.searchParams.has('w')) {
          urlObj.searchParams.set('w', width.toString());
        }
        // Don't add quality param for nostr.build - they handle it automatically
        return urlObj.toString();
      }
      
      // For other Blossom servers, use standard params
      urlObj.search = '';
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
 * Generates a tiny blur placeholder URL (very low quality, ~10-15px wide)
 */
function getBlurPlaceholderUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const blossomDomains = ['nostr.build', 'image.nostr.build', 'satellite.earth', 'void.cat', 'nostrcheck.me', 'blossom.primal.net'];
    const isBlossomServer = blossomDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (isBlossomServer) {
      // For nostr.build, use their thumbnail format
      if (urlObj.hostname.includes('nostr.build')) {
        if (!urlObj.searchParams.has('w')) {
          urlObj.searchParams.set('w', '15'); // Tiny size for instant blur load
        }
        return urlObj.toString();
      }
      
      // For other Blossom servers
      urlObj.search = '';
      urlObj.searchParams.set('w', '15');
      urlObj.searchParams.set('q', '15');
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
  // On mobile, load more aggressively - load immediately if thumbnail or priority
  const [shouldLoad, setShouldLoad] = useState(priority || thumbnail); 
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Detect mobile for ultra-optimized thumbnails
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Generate optimized URLs - MUCH smaller on mobile for fast loading
  // Mobile: 150px (ultra-tiny), Desktop: 400px
  const width = thumbnail ? (isMobile ? 150 : 400) : 800;
  // Mobile: 50% quality (smallest files), Desktop: 75%
  const quality = thumbnail ? (isMobile ? 50 : 75) : 80;
  const thumbnailUrl = getThumbnailUrl(src, width, quality);
  const blurUrl = blurUp ? getBlurPlaceholderUrl(src) : null;

  // Intersection Observer for lazy loading non-priority images
  useEffect(() => {
    if (priority || shouldLoad) return; // Skip if already marked to load

    // Mobile: 800px margin for ultra-early loading (aggressive prefetch)
    // Desktop: 400px margin
    const margin = isMobile ? '800px' : '400px';

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
        rootMargin: margin,
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
  }, [priority, shouldLoad, isMobile]);

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
    console.error('Image failed to load:', thumbnailUrl);
    setIsError(true);
    
    // On mobile, try loading the original URL if thumbnail fails
    if (thumbnail && thumbnailUrl !== src && imgRef.current) {
      console.log('Retrying with original URL:', src);
      imgRef.current.src = src;
    }
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
          loading="eager"
          fetchPriority="high"
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
          loading={priority || thumbnail ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority || thumbnail ? 'high' : 'auto'}
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
