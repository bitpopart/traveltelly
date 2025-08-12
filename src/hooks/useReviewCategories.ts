import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useNostrPublish } from './useNostrPublish';
import { useToast } from './useToast';
import type { NostrEvent } from '@nostrify/nostrify';

export interface ReviewCategory {
  value: string;
  label: string;
  group: string;
  emoji?: string;
}

// Default categories as fallback
const DEFAULT_CATEGORIES: ReviewCategory[] = [
  { value: 'grocery-store', label: '🛒 Grocery Store', group: 'Shops & Stores' },
  { value: 'clothing-store', label: '👕 Clothing Store', group: 'Shops & Stores' },
  { value: 'electronics-store', label: '📱 Electronics Store', group: 'Shops & Stores' },
  { value: 'convenience-store', label: '🏪 Convenience Store', group: 'Shops & Stores' },
  { value: 'restaurant', label: '🍽️ Restaurant', group: 'Food & Drink' },
  { value: 'cafe', label: '☕ Café', group: 'Food & Drink' },
  { value: 'fast-food', label: '🍔 Fast Food', group: 'Food & Drink' },
  { value: 'bar-pub', label: '🍺 Bar / Pub', group: 'Food & Drink' },
  { value: 'hotel', label: '🏨 Hotel', group: 'Places' },
  { value: 'motel', label: '🏨 Motel', group: 'Places' },
  { value: 'hostel', label: '🏠 Hostel', group: 'Places' },
  { value: 'landmarks', label: '🏛️ Landmarks', group: 'Places' },
];

function validateCategoryEvent(event: NostrEvent): boolean {
  if (event.kind !== 37539) return false;

  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];

  return !!(d && title);
}

export function useReviewCategories() {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['review-categories'],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);

      try {
        const events = await nostr.query([{
          kinds: [37539],
          '#d': ['review-categories'],
          limit: 1
        }], { signal });

        const validEvents = events.filter(validateCategoryEvent);

        if (validEvents.length === 0) {
          console.log('No custom categories found, using defaults');
          return DEFAULT_CATEGORIES;
        }

        const latestEvent = validEvents.sort((a, b) => b.created_at - a.created_at)[0];

        try {
          const categories = JSON.parse(latestEvent.content) as ReviewCategory[];

          // Validate the structure
          if (Array.isArray(categories) && categories.every(cat =>
            cat.value && cat.label && cat.group
          )) {
            console.log(`Loaded ${categories.length} custom categories`);
            return categories;
          } else {
            console.warn('Invalid category structure, using defaults');
            return DEFAULT_CATEGORIES;
          }
        } catch (error) {
          console.error('Error parsing categories:', error);
          return DEFAULT_CATEGORIES;
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        return DEFAULT_CATEGORIES;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpdateCategories() {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categories: ReviewCategory[]) => {
      // Validate categories
      if (!Array.isArray(categories) || categories.length === 0) {
        throw new Error('Categories must be a non-empty array');
      }

      for (const category of categories) {
        if (!category.value || !category.label || !category.group) {
          throw new Error('Each category must have value, label, and group');
        }
      }

      // Create the category event
      const tags: string[][] = [
        ['d', 'review-categories'],
        ['title', 'Review Categories'],
        ['alt', 'Review category definitions for the review system'],
      ];

      return new Promise<void>((resolve, reject) => {
        try {
          createEvent({
            kind: 37539,
            content: JSON.stringify(categories, null, 2),
            tags,
          });

          // Give some time for the event to be published
          setTimeout(() => {
            resolve();
          }, 1000);
        } catch (error) {
          reject(error);
        }
      });
    },
    onSuccess: () => {
      toast({
        title: 'Categories updated!',
        description: 'Review categories have been successfully updated.',
      });

      // Invalidate and refetch categories after a short delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['review-categories'] });
      }, 1500);
    },
    onError: (error) => {
      console.error('Error updating categories:', error);
      toast({
        title: 'Failed to update categories',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useAddCategory() {
  const { data: categories = [] } = useReviewCategories();
  const updateCategories = useUpdateCategories();

  return useMutation({
    mutationFn: async (newCategory: ReviewCategory) => {
      // Check if category value already exists
      if (categories.some(cat => cat.value === newCategory.value)) {
        throw new Error('A category with this value already exists');
      }

      const updatedCategories = [...categories, newCategory];
      return updateCategories.mutateAsync(updatedCategories);
    },
  });
}

export function useRemoveCategory() {
  const { data: categories = [] } = useReviewCategories();
  const updateCategories = useUpdateCategories();

  return useMutation({
    mutationFn: async (categoryValue: string) => {
      const updatedCategories = categories.filter(cat => cat.value !== categoryValue);

      if (updatedCategories.length === categories.length) {
        throw new Error('Category not found');
      }

      return updateCategories.mutateAsync(updatedCategories);
    },
  });
}