import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useNostrPublish } from './useNostrPublish';
import { useCurrentUser } from './useCurrentUser';
import { useToast } from './useToast';

export interface ScheduledPost {
  id: string;
  type: 'review' | 'story' | 'trip' | 'stock-media' | 'custom';
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  hashtags: string;
  scheduledTime: number; // Unix timestamp
  status: 'pending' | 'published' | 'failed';
  createdAt: number;
}

const STORAGE_KEY = 'traveltelly_scheduled_posts';

export function useScheduledPosts() {
  const [scheduledPosts, setScheduledPosts] = useLocalStorage<ScheduledPost[]>(STORAGE_KEY, []);
  const { mutate: createEvent } = useNostrPublish();
  const { user } = useCurrentUser();
  const { toast } = useToast();

  const addScheduledPost = useCallback((post: ScheduledPost) => {
    setScheduledPosts((prev) => {
      // If editing existing post, replace it
      const filtered = prev.filter(p => p.id !== post.id);
      return [...filtered, post].sort((a, b) => a.scheduledTime - b.scheduledTime);
    });
  }, [setScheduledPosts]);

  const removeScheduledPost = useCallback((postId: string) => {
    setScheduledPosts((prev) => prev.filter(p => p.id !== postId));
  }, [setScheduledPosts]);

  const updatePostStatus = useCallback((postId: string, status: ScheduledPost['status']) => {
    setScheduledPosts((prev) =>
      prev.map(p => p.id === postId ? { ...p, status } : p)
    );
  }, [setScheduledPosts]);

  const publishPost = useCallback((post: ScheduledPost) => {
    if (!user) {
      updatePostStatus(post.id, 'failed');
      return;
    }

    try {
      // Build post content similar to review share
      const typeEmojis = {
        review: '⭐',
        story: '📖',
        trip: '🗺️',
        'stock-media': '📸',
        custom: '🔗',
      };

      const emoji = typeEmojis[post.type];
      let content = `${emoji} ${post.title}\n`;

      if (post.description) {
        content += `\n${post.description}\n`;
      }

      // Add image URL
      if (post.imageUrl) {
        content += `\n${post.imageUrl}\n`;
      }

      // Add clickable URL
      content += `\n🔗 ${post.url}`;

      // Add hashtags
      let hashtagsText = '#travel #traveltelly';
      if (post.hashtags) {
        const hashtagList = post.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        if (hashtagList.length > 0) {
          hashtagsText += ' #' + hashtagList.join(' #');
        }
      }

      content += `\n\n${hashtagsText}`;

      // Build tags
      const tags: string[][] = [
        ['t', 'travel'],
        ['t', 'traveltelly'],
      ];

      if (post.imageUrl) {
        tags.push(['image', post.imageUrl]);
      }

      if (post.url) {
        tags.push(['r', post.url]);
      }

      // Add hashtags to tags
      if (post.hashtags) {
        const hashtagList = post.hashtags
          .split(',')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0);

        hashtagList.forEach(tag => {
          tags.push(['t', tag]);
        });
      }

      // Publish to Nostr
      createEvent({
        kind: 1,
        content,
        tags,
      }, {
        onSuccess: () => {
          updatePostStatus(post.id, 'published');
          toast({
            title: 'Post published!',
            description: `"${post.title}" has been shared to Nostr`,
          });
        },
        onError: () => {
          updatePostStatus(post.id, 'failed');
          toast({
            title: 'Failed to publish',
            description: `"${post.title}" could not be published`,
            variant: 'destructive',
          });
        },
      });
    } catch (error) {
      console.error('Error publishing scheduled post:', error);
      updatePostStatus(post.id, 'failed');
    }
  }, [user, createEvent, updatePostStatus, toast]);

  // Scheduler effect - checks every minute for posts to publish
  useEffect(() => {
    const checkScheduledPosts = () => {
      const now = Math.floor(Date.now() / 1000);
      const postsToPublish = scheduledPosts.filter(
        post => post.status === 'pending' && post.scheduledTime <= now
      );

      postsToPublish.forEach(post => {
        console.log(`📤 Publishing scheduled post: ${post.title}`);
        publishPost(post);
      });
    };

    // Check immediately on mount
    checkScheduledPosts();

    // Then check every minute
    const interval = setInterval(checkScheduledPosts, 60000);

    return () => clearInterval(interval);
  }, [scheduledPosts, publishPost]);

  return {
    scheduledPosts,
    addScheduledPost,
    removeScheduledPost,
    updatePostStatus,
  };
}
