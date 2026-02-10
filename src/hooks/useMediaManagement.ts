import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { useNostrPublish } from './useNostrPublish';
import { useToast } from './useToast';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import type { NostrEvent } from '@nostrify/nostrify';
import type { MarketplaceProduct } from './useMarketplaceProducts';

export interface MediaManagementFilters {
  search?: string;
  category?: string;
  status?: 'all' | 'active' | 'inactive' | 'flagged';
  seller?: string;
  dateRange?: 'all' | 'today' | 'week' | 'month';
}

function validateMediaEvent(event: NostrEvent): boolean {
  // Check if it's a classified listing kind
  if (![30402].includes(event.kind)) return false;

  // Check for required tags according to NIP-99
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const price = event.tags.find(([name]) => name === 'price');

  // All marketplace products require 'd', 'title', and 'price' tags
  if (!d || !title || !price || price.length < 3) return false;

  // Price tag should have at least [price, amount, currency]
  const [, amount, currency] = price;
  if (!amount || !currency) return false;

  // Amount should be a valid number
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) return false;

  return true;
}

function parseMediaEvent(event: NostrEvent): MarketplaceProduct {
  const d = event.tags.find(([name]) => name === 'd')?.[1] || '';
  const title = event.tags.find(([name]) => name === 'title')?.[1] || '';
  const summary = event.tags.find(([name]) => name === 'summary')?.[1];
  const description = summary || event.content || '';
  const price = event.tags.find(([name]) => name === 'price');
  const category = event.tags.find(([name]) => name === 't')?.[1] || 'other';
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  const status = event.tags.find(([name]) => name === 'status')?.[1] || 'active';
  // Get all image tags - check multiple possible tag names
  const imageTagNames = ['image', 'img', 'photo', 'picture', 'url'];
  const images = event.tags
    .filter(([name]) => imageTagNames.includes(name))
    .map(([, url]) => url)
    .filter(Boolean);

  // Also check content field for URLs or JSON with images
  let contentImages: string[] = [];
  if (event.content) {
    try {
      // Try to parse as JSON
      const contentJson = JSON.parse(event.content);
      if (contentJson.images && Array.isArray(contentJson.images)) {
        contentImages = contentJson.images;
      } else if (contentJson.image) {
        contentImages = [contentJson.image];
      }
    } catch {
      // Check if content contains URLs
      const urlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|svg)/gi;
      const urlMatches = event.content.match(urlRegex);
      if (urlMatches) {
        contentImages = urlMatches;
      }
    }
  }

  // Combine tag images and content images
  const allImages = [...images, ...contentImages].filter(Boolean);

  // Debug: Log all tags and content to see what's available
  console.log('🏷️ All tags for event:', event.tags);
  console.log('📄 Event content:', event.content);
  console.log('🖼️ Found tag images:', images);
  console.log('🖼️ Found content images:', contentImages);
  console.log('🖼️ All combined images:', allImages);

  const [, amount, currency] = price || ['', '0', 'USD'];

  return {
    id: d,
    title,
    description,
    price: amount,
    currency,
    images: allImages,
    category,
    location,
    seller: {
      pubkey: event.pubkey,
    },
    status: status as 'active' | 'sold' | 'inactive' | 'deleted',
    createdAt: event.created_at,
    event,
  };
}

export function useAllMediaAssets(filters: MediaManagementFilters = {}) {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['admin-media-assets', filters, authorizedUploaders],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      try {
        // Query specifically for authorized uploaders' media
        const authorizedAuthors = Array.from(authorizedUploaders || []);
        console.log('🔍 Querying media from authorized authors:', authorizedAuthors);

        const events = await nostr.query([{
          kinds: [30402],
          authors: authorizedAuthors, // Only query for authorized authors
          limit: 2000 // Increased to fetch all media assets
        }], { signal });

        // Debug: Log events to see what we're getting
        console.log('🔍 Media Management Debug - Total events found:', events.length);
        console.log('🔍 Current relay:', typeof nostr.relay);
        if (events.length > 0) {
          console.log('🔍 Sample event:', events[0]);
          console.log('🔍 Sample event tags:', events[0].tags);
          const imageTagsInSample = events[0].tags.filter(([name]) => name === 'image');
          console.log('🔍 Image tags in sample:', imageTagsInSample);
        }

        const validEvents = events.filter(validateMediaEvent);
        const products = validEvents.map(parseMediaEvent).filter(product => {
          // Filter out deleted products with multiple checks
          const isDeleted =
            product.status === 'deleted' ||
            product.description?.startsWith('[DELETED]') ||
            product.description?.startsWith('[ADMIN DELETED]') ||
            product.description?.startsWith('[TOMBSTONE]') ||
            product.event.tags.some(tag => tag[0] === 'deleted' && tag[1] === 'true') ||
            product.event.tags.some(tag => tag[0] === 'admin_deleted' && tag[1] === 'true') ||
            product.event.tags.some(tag => tag[0] === 'tombstone' && tag[1] === 'true');

          if (isDeleted) {
            console.log('🗑️ Admin panel filtering out deleted product:', product.title, 'Status:', product.status);
            return false;
          }
          return true;
        });

        // Debug: Log parsed products
        console.log('🔍 Parsed products:', products.length);
        products.forEach(product => {
          if (product.images.length > 0) {
            console.log('🖼️ Product with images:', product.title, 'Images:', product.images);
          } else {
            console.log('❌ Product without images:', product.title);
          }
        });

        // Apply filters
        let filteredProducts = products;

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower)
          );
        }

        if (filters.category && filters.category !== 'all') {
          filteredProducts = filteredProducts.filter(product =>
            product.category === filters.category
          );
        }

        if (filters.status && filters.status !== 'all') {
          if (filters.status === 'flagged') {
            // For now, consider inactive as flagged
            filteredProducts = filteredProducts.filter(product =>
              product.status === 'inactive'
            );
          } else {
            filteredProducts = filteredProducts.filter(product =>
              product.status === filters.status
            );
          }
        }

        if (filters.seller) {
          filteredProducts = filteredProducts.filter(product =>
            product.seller.pubkey === filters.seller
          );
        }

        if (filters.dateRange && filters.dateRange !== 'all') {
          const now = Date.now() / 1000;
          let cutoff = 0;

          switch (filters.dateRange) {
            case 'today':
              cutoff = now - (24 * 60 * 60);
              break;
            case 'week':
              cutoff = now - (7 * 24 * 60 * 60);
              break;
            case 'month':
              cutoff = now - (30 * 24 * 60 * 60);
              break;
          }

          filteredProducts = filteredProducts.filter(product =>
            product.createdAt >= cutoff
          );
        }

        // Sort by creation date (newest first)
        filteredProducts.sort((a, b) => b.createdAt - a.createdAt);

        return filteredProducts;
      } catch (error) {
        console.error('Error fetching media assets:', error);
        return [];
      }
    },
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0, // Only run when we have authorized uploaders
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateMediaStatus() {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, newStatus, reason }: {
      product: MarketplaceProduct;
      newStatus: 'active' | 'inactive' | 'flagged';
      reason?: string;
    }) => {
      // Create updated tags
      const updatedTags = product.event.tags.map(tag => {
        if (tag[0] === 'status') {
          return ['status', newStatus];
        }
        return tag;
      });

      // Add status tag if it doesn't exist
      if (!updatedTags.some(tag => tag[0] === 'status')) {
        updatedTags.push(['status', newStatus]);
      }

      // Add admin action tag
      updatedTags.push(['admin_action', `status_change_${newStatus}`]);
      updatedTags.push(['admin_timestamp', Math.floor(Date.now() / 1000).toString()]);

      if (reason) {
        updatedTags.push(['admin_reason', reason]);
      }

      return new Promise<void>((resolve, reject) => {
        try {
          createEvent({
            kind: 30402,
            content: product.event.content,
            tags: updatedTags,
          });

          setTimeout(() => {
            resolve();
          }, 1000);
        } catch (error) {
          reject(error);
        }
      });
    },
    onSuccess: (_, variables) => {
      const statusMessages = {
        active: 'Media asset activated',
        inactive: 'Media asset deactivated',
        flagged: 'Media asset flagged for review'
      };

      toast({
        title: 'Status Updated',
        description: statusMessages[variables.newStatus],
      });

      // Invalidate and refetch media assets
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      }, 1500);
    },
    onError: (error) => {
      console.error('Error updating media status:', error);
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteMediaAsset() {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, reason }: {
      product: MarketplaceProduct;
      reason: string;
    }) => {
      console.log('🗑️ Deleting single product:', product.title, 'Reason:', reason);

      try {
        // Create a deletion event (kind 5) for the original event
        if (product.event.id) {
          await new Promise<void>((resolve) => {
            createEvent({
              kind: 5,
              content: `Admin deletion: ${reason}`,
              tags: [
                ['e', product.event.id],
                ['k', '30402'], // Kind being deleted
              ],
            });

            setTimeout(resolve, 1000);
          });
          console.log('✅ Created deletion event for:', product.title);
        }

        // Also create a replacement event with deleted status
        await new Promise<void>((resolve) => {
          const deletedTags = product.event.tags.map(tag => {
            if (tag[0] === 'status') {
              return ['status', 'deleted'];
            }
            return tag;
          });

          // Add status tag if it doesn't exist
          if (!deletedTags.some(tag => tag[0] === 'status')) {
            deletedTags.push(['status', 'deleted']);
          }

          // Add admin deletion tags
          deletedTags.push(['admin_action', 'delete_media']);
          deletedTags.push(['admin_reason', reason]);
          deletedTags.push(['admin_timestamp', Math.floor(Date.now() / 1000).toString()]);

          createEvent({
            kind: 30402,
            content: '[DELETED] ' + product.event.content,
            tags: deletedTags,
          });

          setTimeout(resolve, 1000);
        });
        console.log('✅ Created replacement deleted event for:', product.title);
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log('✅ Single deletion succeeded');
      toast({
        title: 'Media Deleted',
        description: 'Media asset has been removed from the marketplace.',
      });

      // Force refresh after delay
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      }, 2000);
    },
    onError: (error) => {
      console.error('❌ Single deletion failed:', error);
      toast({
        title: 'Failed to delete media',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useEditMediaAsset() {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ product, updates }: {
      product: MarketplaceProduct;
      updates: Partial<MarketplaceProduct & { isFree?: boolean }>;
    }) => {
      // Create updated tags
      let updatedTags = product.event.tags
        .filter(tag => tag[0] !== 'free') // Remove existing free tags
        .map(tag => {
          switch (tag[0]) {
            case 'title':
              return ['title', updates.title || product.title];
            case 'description':
              return ['description', updates.description || product.description];
            case 'price':
              return ['price', updates.price || product.price, updates.currency || product.currency];
            case 't':
              return ['t', updates.category || product.category];
            default:
              return tag;
          }
        });

      // Add or remove free tag based on updates.isFree
      if (updates.isFree !== undefined) {
        if (updates.isFree) {
          updatedTags.push(['free', 'true']);
        }
        // If isFree is false, we already filtered it out above
      }

      // Add admin action tags
      updatedTags.push(['admin_action', 'edit_media']);
      updatedTags.push(['admin_timestamp', Math.floor(Date.now() / 1000).toString()]);

      return new Promise<void>((resolve, reject) => {
        try {
          createEvent({
            kind: 30402,
            content: product.event.content,
            tags: updatedTags,
          });

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
        title: 'Media Updated',
        description: 'Media asset has been successfully updated.',
      });

      // Invalidate and refetch media assets
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      }, 1500);
    },
    onError: (error) => {
      console.error('Error updating media asset:', error);
      toast({
        title: 'Failed to update media',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });
}

export function useBulkDeleteMediaAssets() {
  const { mutate: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ products }: { products: MarketplaceProduct[] }) => {
      console.log('🗑️ Starting AGGRESSIVE bulk deletion of', products.length, 'products');

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        console.log(`🗑️ AGGRESSIVELY deleting product ${i + 1}/${products.length}:`, {
          title: product.title,
          id: product.id,
          eventId: product.event.id,
          seller: product.seller.pubkey,
          tags: product.event.tags
        });

        try {
          // Strategy 1: Create multiple deletion events with different approaches
          if (product.event.id) {
            // Standard kind 5 deletion
            await new Promise<void>((resolve) => {
              createEvent({
                kind: 5,
                content: `ADMIN FORCE DELETE: ${product.title}`,
                tags: [
                  ['e', product.event.id],
                  ['k', '30402'],
                ],
              });
              setTimeout(resolve, 800);
            });
            console.log('✅ Created standard deletion event');

            // Addressable deletion using 'a' tag
            await new Promise<void>((resolve) => {
              createEvent({
                kind: 5,
                content: `ADMIN ADDRESSABLE DELETE: ${product.title}`,
                tags: [
                  ['a', `30402:${product.seller.pubkey}:${product.id}`],
                ],
              });
              setTimeout(resolve, 800);
            });
            console.log('✅ Created addressable deletion event');
          }

          // Strategy 2: Create replacement event with DELETED status
          await new Promise<void>((resolve) => {
            const deletedTags = [...product.event.tags];

            // Remove or update existing status
            const statusIndex = deletedTags.findIndex(tag => tag[0] === 'status');
            if (statusIndex >= 0) {
              deletedTags[statusIndex] = ['status', 'deleted'];
            } else {
              deletedTags.push(['status', 'deleted']);
            }

            // Add multiple deletion markers
            deletedTags.push(['deleted', 'true']);
            deletedTags.push(['admin_deleted', 'true']);
            deletedTags.push(['admin_action', 'force_delete']);
            deletedTags.push(['admin_timestamp', Math.floor(Date.now() / 1000).toString()]);
            deletedTags.push(['deletion_reason', 'admin_cleanup']);

            createEvent({
              kind: 30402,
              content: '[ADMIN DELETED] This content has been removed by administrator',
              tags: deletedTags,
            });

            setTimeout(resolve, 800);
          });
          console.log('✅ Created replacement DELETED event');

          // Strategy 3: Create a "tombstone" event
          await new Promise<void>((resolve) => {
            createEvent({
              kind: 30402,
              content: '[TOMBSTONE] Content removed',
              tags: [
                ['d', product.id],
                ['status', 'deleted'],
                ['deleted', 'true'],
                ['tombstone', 'true'],
                ['original_author', product.seller.pubkey],
                ['admin_action', 'tombstone'],
                ['admin_timestamp', Math.floor(Date.now() / 1000).toString()],
              ],
            });

            setTimeout(resolve, 800);
          });
          console.log('✅ Created tombstone event');

          // Add longer delay between products for relay processing
          if (i < products.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error('❌ Error in aggressive deletion for:', product.title, error);
        }
      }

      console.log('🎉 AGGRESSIVE bulk deletion completed');
    },
    onSuccess: (_, variables) => {
      console.log('✅ Aggressive bulk deletion mutation succeeded');
      toast({
        title: 'Aggressive Deletion Complete',
        description: `Aggressively processed ${variables.products.length} media assets with multiple deletion strategies.`,
      });

      // Force multiple refreshes to ensure cleanup
      setTimeout(() => {
        console.log('🔄 First refresh wave');
        queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      }, 2000);

      setTimeout(() => {
        console.log('🔄 Second refresh wave');
        queryClient.invalidateQueries({ queryKey: ['admin-media-assets'] });
        queryClient.invalidateQueries({ queryKey: ['marketplace-products'] });
      }, 5000);

      setTimeout(() => {
        console.log('🔄 Final page reload');
        window.location.reload();
      }, 8000);
    },
    onError: (error) => {
      console.error('❌ Aggressive bulk deletion failed:', error);
      toast({
        title: 'Aggressive Deletion Failed',
        description: error instanceof Error ? error.message : 'Failed to delete media assets. Try the nuclear option.',
        variant: 'destructive',
      });
    },
  });
}

export function useMediaStatistics() {
  const { data: allMedia = [] } = useAllMediaAssets();

  const stats = {
    total: allMedia.length,
    active: allMedia.filter(m => m.status === 'active').length,
    inactive: allMedia.filter(m => m.status === 'inactive').length,
    flagged: allMedia.filter(m => m.status === 'inactive').length, // Using inactive as flagged for now
    byCategory: allMedia.reduce((acc, media) => {
      acc[media.category] = (acc[media.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    recentUploads: allMedia.filter(m =>
      m.createdAt > (Date.now() / 1000) - (7 * 24 * 60 * 60) // Last 7 days
    ).length,
  };

  return stats;
}