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
    const imageTagNames = ['image', 'img', 'photo', 'picture', 'url', 'imeta'];
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
        // Check if content contains URLs (more comprehensive regex)
        const urlRegex = /https?:\/\/[^\s)]+\.(jpg|jpeg|png|gif|webp|svg|tiff|tif|heic|heif|bmp)/gi;
        const urlMatches = event.content.match(urlRegex);
        if (urlMatches) {
          contentImages = urlMatches;
        }
      }
    }

    // Combine tag images and content images, remove duplicates
    const allImages = [...new Set([...images, ...contentImages])].filter(Boolean);

    // Debug: Log all tags and content to see what's available
    console.log('🏷️ All tags for event:', event.tags);
    console.log('📄 Event content:', event.content);
    console.log('🖼️ Found tag images:', images);
    console.log('🖼️ Found content images:', contentImages);
    console.log('🖼️ All combined images:', allImages);

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
    queryKey: ['marketplace-products', options, authorizedUploaders],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Query specifically for authorized uploaders' media
      const authorizedAuthors = Array.from(authorizedUploaders || []);
      console.log('🔍 Marketplace querying media from authorized authors:', authorizedAuthors);

      // Build filter for classified listings
      const filter: NostrFilter = {
        kinds: [30402], // NIP-99 classified listings
        authors: authorizedAuthors, // Only query for authorized authors
        limit: 100,
      };

      // Add category filter if specified
      if (options.category) {
        filter['#t'] = [options.category];
      }

      // Add seller filter if specified
      if (options.seller) {
        filter.authors = [options.seller];
      }

      // Debug: Also query specifically for Traveltelly admin
      const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
      let adminHex = '';
      try {
        const decoded = nip19.decode(ADMIN_NPUB);
        adminHex = decoded.data as string;
        console.log('🔍 Admin hex:', adminHex);
      } catch (e) {
        console.error('Failed to decode admin npub:', e);
      }

      const events = await nostr.query([filter], { signal });

      // Also specifically query for admin events to debug
      if (adminHex) {
        const adminEvents = await nostr.query([{
          kinds: [30402],
          authors: [adminHex],
          limit: 50
        }], { signal });
        console.log('🔍 Admin specific events found:', adminEvents.length);
        if (adminEvents.length > 0) {
          console.log('🔍 Admin event sample:', adminEvents[0]);
        }
      }

      // Debug: Log events to see what we're getting
      console.log('🔍 Marketplace Debug - Total events found:', events.length);
      console.log('🔍 Current relay:', typeof nostr.relay);
      if (events.length > 0) {
        console.log('🔍 Sample event:', events[0]);
        console.log('🔍 Sample event tags:', events[0].tags);
        const imageTagsInSample = events[0].tags.filter(([name]) => ['image', 'img', 'photo', 'picture', 'url', 'imeta'].includes(name));
        console.log('🔍 All image-related tags in sample:', imageTagsInSample);

        // Log each event's image tags
        events.slice(0, 3).forEach((event, idx) => {
          const imageTags = event.tags.filter(([name]) => ['image', 'img', 'photo', 'picture', 'url', 'imeta'].includes(name));
          console.log(`🔍 Event ${idx + 1} image tags:`, imageTags);
        });
      }

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

          if (isDeleted) {
            console.log('🗑️ Filtering out deleted product:', product.title, 'Status:', product.status);
            return false;
          }
          return true;
        })
        .map(product => {
          // Debug: Log parsed products to see image data
          if (product.images.length > 0) {
            console.log('🖼️ Product with images:', product.title, 'Images:', product.images);
          } else {
            console.log('❌ Product without images:', product.title);
          }
          return product;
        })
        .filter(product => {
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

      return products;
    },
    enabled: !!authorizedUploaders && authorizedUploaders.size > 0, // Only run when we have authorized uploaders
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}