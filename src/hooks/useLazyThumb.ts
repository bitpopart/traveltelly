import { useEffect, useRef, useState } from 'react';

/**
 * Lightweight lazy-load hook for grid thumbnails.
 * Only loads the image once the element scrolls within `rootMargin` of the
 * viewport. Priority items load immediately.
 */
export function useLazyThumb(priority = false, rootMargin = '600px') {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (priority || shouldLoad) return;

    // IntersectionObserver may not exist in very old environments — just load.
    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin, threshold: 0.01 }
    );

    const el = ref.current;
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [priority, shouldLoad, rootMargin]);

  return { ref, shouldLoad };
}