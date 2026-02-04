import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

/**
 * Hook to coordinate refreshing all index page content
 * This invalidates all the relevant query caches to force a refresh
 */
export function useIndexRefresh() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Invalidate all queries related to latest items and counts
      await Promise.all([
        // Latest items
        queryClient.invalidateQueries({ queryKey: ['latest-review-with-image'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-reviews-with-images'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-story-with-image'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-stories-with-images'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-stock-media-with-image'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-stock-media-items-with-images'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-trip-with-image'] }),
        queryClient.invalidateQueries({ queryKey: ['latest-trips-with-images'] }),
        
        // Counts
        queryClient.invalidateQueries({ queryKey: ['story-count'] }),
        queryClient.invalidateQueries({ queryKey: ['stock-media-count'] }),
        queryClient.invalidateQueries({ queryKey: ['trip-count'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-reviews'] }),
        
        // Map data
        queryClient.invalidateQueries({ queryKey: ['admin-reviews-map'] }),
        queryClient.invalidateQueries({ queryKey: ['review-locations'] }),
        
        // Location tags
        queryClient.invalidateQueries({ queryKey: ['location-tags'] }),
      ]);

      console.log('✅ Index page refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing index page:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return {
    refreshAll,
    isRefreshing,
  };
}
