import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent, NostrFilter } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';

export interface MarketplaceProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  currency: string;
  images: string[];
  category: string; // Keep for backward compatibility (media type)
  mediaType?: string; // New: photos, videos, audio, etc.
  contentCategory?: string; // New: Animals, Business, Travel, etc.
  location?: string;
  seller: {
    pubkey: string;
    name?: string;
    picture?: string;
  };
  status: 'active' | 'sold' | 'inactive' | 'deleted';
  createdAt: number;
  event: NostrEvent;
}

interface UseMarketplaceProductsOptions {
  search?: string;
  category?: string;
  seller?: string;
  limit?: number;
  freeOnly?: boolean;
}

function validateMarketplaceProduct(event: NostrEvent): boolean {
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

function parseMarketplaceProduct(event: NostrEvent): MarketplaceProduct | null {
  try {
    const d = event.tags.find(([name]) => name === 'd')?.[1];
    const title = event.tags.find(([name]) => name === 'title')?.[1];
    const summary = event.tags.find(([name]) => name === 'summary')?.[1];
    const price = event.tags.find(([name]) => name === 'price');
    const location = event.tags.find(([name]) => name === 'location')?.[1];
    const status = event.tags.find(([name]) => name === 'status')?.[1] as 'active' | 'sold' | 'inactive' | 'deleted' || 'active';

    // Get all image tags - check multiple possible tag names
    const imageTagNames = ['image', 'img', 'photo', 'picture', 'url'];
    const imageTags = event.tags.filter(([name]) => imageTagNames.includes(name));
    const images = imageTags.map(([, url]) => url).filter(Boolean);
    
    // Handle imeta tags separately (NIP-94 format: ["imeta", "url https://..."])
    const imetaTags = event.tags.filter(([name]) => name === 'imeta');
    const imetaImages = imetaTags
      .map(([, value]) => {
        // Parse "url https://..." format
        const urlMatch = value?.match(/url\s+(.+)/);
        return urlMatch ? urlMatch[1] : null;
      })
      .filter(Boolean) as string[];
    

    
    // Combine regular images with imeta images
    const allTagImages = [...images, ...imetaImages];

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
        // Check if content contains URLs (more comprehensive regex)
        const urlRegex = /https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp|svg|tiff|tif|heic|heif|bmp)/gi;
        const urlMatches = event.content.match(urlRegex);
        if (urlMatches) {
          contentImages = urlMatches;
        }
      }
    }

    // Combine tag images (including imeta) and content images, remove duplicates
    const allImages = [...new Set([...allTagImages, ...contentImages])].filter(Boolean);



    // Get media types from 't' tags (photos, videos, etc.)
    const mediaTypes = event.tags
      .filter(([name]) => name === 't')
      .map(([, mediaType]) => mediaType)
      .filter(Boolean);

    // Get content categories from 'category' tags (Animals, Business, etc.)
    const contentCategories = event.tags
      .filter(([name]) => name === 'category')
      .map(([, category]) => category)
      .filter(Boolean);

    if (!d || !title || !price) return null;

    const [, amount, currency] = price;
    if (!amount || !currency) return null;

    return {
      id: d,
      title,
      description: summary || event.content || '',
      price: amount,
      currency: currency.toUpperCase(),
      images: allImages,
      category: mediaTypes[0] || 'other', // Keep this for backward compatibility
      mediaType: mediaTypes[0] || 'other',
      contentCategory: contentCategories[0] || '',
      location,
      seller: {
        pubkey: event.pubkey,
      },
      status,
      createdAt: event.created_at,
      event,
    };
  } catch (error) {
    console.error('Error parsing marketplace product:', error);
    return null;
  }
}

export function useMarketplaceProducts(options: UseMarketplaceProductsOptions = {}) {
  const { nostr } = useNostr();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();
  


  return useQuery({
    queryKey: ['marketplace-products', JSON.stringify(options), Array.from(authorizedUploaders || [])],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      
      if (authorizedAuthors.length === 0) {
        return [];
      }

      // Build filter for classified listings
      const filter: NostrFilter = {
        kinds: [30402],
        authors: authorizedAuthors,
        limit: 1000, // Fetch all products for proper filtering
      };

      // Add category filter if specified
      if (options.category) {
        filter['#t'] = [options.category];
      }

      // Add seller filter if specified
      if (options.seller) {
        filter.authors = [options.seller];
      }

      const events = await nostr.query([filter], { signal });

      // Filter and parse events
      const products = events
        .filter(validateMarketplaceProduct)
        .map(parseMarketplaceProduct)
        .filter((product): product is MarketplaceProduct => product !== null)
        .filter(product => {
          // Filter out deleted products with multiple checks
          const isDeleted =
            product.status === 'deleted' ||
            product.description?.startsWith('[DELETED]') ||
            product.description?.startsWith('[ADMIN DELETED]') ||
            product.description?.startsWith('[TOMBSTONE]') ||
            product.event.tags.some(tag => tag[0] === 'deleted' && tag[1] === 'true') ||
            product.event.tags.some(tag => tag[0] === 'admin_deleted' && tag[1] === 'true') ||
            product.event.tags.some(tag => tag[0] === 'tombstone' && tag[1] === 'true');

          return !isDeleted;
        })
        .filter(product => {
          // Free items filter
          if (options.freeOnly) {
            const isFree = product.event.tags.some(tag => tag[0] === 'free' && tag[1] === 'true');
            if (!isFree) return false;
          }
          
          // Client-side search filtering
          if (options.search) {
            const searchLower = options.search.toLowerCase();
            return (
              product.title.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower) ||
              product.category.toLowerCase().includes(searchLower)
            );
          }
          return true;
        })
        .sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first

      // Apply limit after all filtering if specified
      const finalProducts = options.limit ? products.slice(0, options.limit) : products;

      return finalProducts;
    },
    // Don't use enabled check - handle empty case inside queryFn instead
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}