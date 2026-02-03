import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type SocialPlatform = 'twitter' | 'instagram' | 'facebook';

export interface SocialScheduledPost {
  id: string;
  platform: SocialPlatform;
  type: 'review' | 'story' | 'trip' | 'stock-media' | 'custom';
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  hashtags: string;
  scheduledTime: number; // Unix timestamp
  status: 'pending' | 'ready' | 'posted-manually';
  createdAt: number;
}

const STORAGE_KEY = 'traveltelly_social_scheduled_posts';

export function useSocialScheduledPosts() {
  const [socialScheduledPosts, setSocialScheduledPosts] = useLocalStorage<SocialScheduledPost[]>(STORAGE_KEY, []);

  const addSocialScheduledPost = useCallback((post: SocialScheduledPost) => {
    setSocialScheduledPosts((prev) => {
      // If editing existing post, replace it
      const filtered = prev.filter(p => p.id !== post.id);
      return [...filtered, post].sort((a, b) => a.scheduledTime - b.scheduledTime);
    });
  }, [setSocialScheduledPosts]);

  const removeSocialScheduledPost = useCallback((postId: string) => {
    setSocialScheduledPosts((prev) => prev.filter(p => p.id !== postId));
  }, [setSocialScheduledPosts]);

  const updateSocialPostStatus = useCallback((postId: string, status: SocialScheduledPost['status']) => {
    setSocialScheduledPosts((prev) =>
      prev.map(p => p.id === postId ? { ...p, status } : p)
    );
  }, [setSocialScheduledPosts]);

  const markAsReady = useCallback((postId: string) => {
    updateSocialPostStatus(postId, 'ready');
  }, [updateSocialPostStatus]);

  const markAsPosted = useCallback((postId: string) => {
    updateSocialPostStatus(postId, 'posted-manually');
  }, [updateSocialPostStatus]);

  return {
    socialScheduledPosts,
    addSocialScheduledPost,
    removeSocialScheduledPost,
    updateSocialPostStatus,
    markAsReady,
    markAsPosted,
  };
}
