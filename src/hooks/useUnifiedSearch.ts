import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { nip19 } from 'nostr-tools';
import { useAuthorizedReviewers } from '@/hooks/useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from '@/hooks/useStockMediaPermissions';

// The Traveltelly admin npub for stories
const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface SearchResult {
  id: string;
  type: 'review' | 'story' | 'media' | 'trip';
  title: string;
  content: string;
  tags: string[];
  author: string;
  createdAt: number;
  event: NostrEvent;
  // Type-specific fields
  rating?: number;
  category?: string;
  location?: string;
  price?: string;
  currency?: string;
  images?: string[];
  distance?: string;
  distanceUnit?: string;
}

// Validation functions
function validateReviewEvent(event: NostrEvent): boolean {
  if (event.kind !== 34879) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const rating = event.tags.find(([name]) => name === 'rating')?.[1];
  const category = event.tags.find(([name]) => name === 'category')?.[1];
  return !!(d && title && rating && category);
}

function validateStoryEvent(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  return !!(d && title && event.content.length > 100);
}

function validateMediaEvent(event: NostrEvent): boolean {
  if (event.kind !== 30402) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const price = event.tags.find(([name]) => name === 'price');
  if (!d || !title || !price || price.length < 3) return false;
  const [, amount, currency] = price;
  if (!amount || !currency) return false;
  const numAmount = parseFloat(amount);
  return !isNaN(numAmount) && numAmount > 0;
}

function validateTripEvent(event: NostrEvent): boolean {
  if (event.kind !== 30025) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  return !!(d && title);
}

// Parsing functions
function parseReviewEvent(event: NostrEvent): SearchResult {
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Review';
  const rating = parseInt(event.tags.find(([name]) => name === 'rating')?.[1] || '0');
  const category = event.tags.find(([name]) => name === 'category')?.[1] || '';
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  return {
    id: event.id,
    type: 'review',
    title,
    content: event.content,
    tags: hashtags,
    author: event.pubkey,
    createdAt: event.created_at,
    event,
    rating,
    category,
    location,
    images: image ? [image] : [],
  };
}

function parseStoryEvent(event: NostrEvent): SearchResult {
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
  const summary = event.tags.find(([name]) => name === 'summary')?.[1] || '';
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  return {
    id: event.id,
    type: 'story',
    title,
    content: summary || event.content.substring(0, 200) + '...',
    tags: hashtags,
    author: event.pubkey,
    createdAt: event.created_at,
    event,
    images: image ? [image] : [],
  };
}

function parseMediaEvent(event: NostrEvent): SearchResult {
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Media';
  const summary = event.tags.find(([name]) => name === 'summary')?.[1] || '';
  const price = event.tags.find(([name]) => name === 'price');
  const location = event.tags.find(([name]) => name === 'location')?.[1];
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);

  // Get images from various tag names
  const imageTagNames = ['image', 'img', 'photo', 'picture', 'url'];
  const images = event.tags
    .filter(([name]) => imageTagNames.includes(name))
    .map(([, url]) => url)
    .filter(Boolean);

  const [, amount, currency] = price || ['', '', ''];

  return {
    id: event.id,
    type: 'media',
    title,
    content: summary || event.content,
    tags: hashtags,
    author: event.pubkey,
    createdAt: event.created_at,
    event,
    price: amount,
    currency: currency?.toUpperCase(),
    location,
    images,
  };
}

function parseTripEvent(event: NostrEvent): SearchResult {
  const title = event.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Trip';
  const summary = event.tags.find(([name]) => name === 'summary')?.[1] || '';
  const category = event.tags.find(([name]) => name === 'category')?.[1] || 'trip';
  const distance = event.tags.find(([name]) => name === 'distance')?.[1];
  const distanceUnit = event.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);
  const images = event.tags.filter(([name]) => name === 'image').map(([, url]) => url);

  return {
    id: event.id,
    type: 'trip',
    title,
    content: summary || event.content,
    tags: hashtags,
    author: event.pubkey,
    createdAt: event.created_at,
    event,
    category,
    distance,
    distanceUnit,
    images,
  };
}

export function useUnifiedSearch(query: string) {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['unified-search', query, authorizedReviewers, authorizedUploaders],
    queryFn: async (c) => {
      if (!query.trim()) return [];

      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);
      const results: SearchResult[] = [];

      try {
        // Search Reviews (kind 34879)
        if (authorizedReviewers && authorizedReviewers.size > 0) {
          const reviewEvents = await nostr.query([{
            kinds: [34879],
            authors: Array.from(authorizedReviewers),
            limit: 50,
          }], { signal });

          const reviewResults = reviewEvents
            .filter(validateReviewEvent)
            .map(parseReviewEvent)
            .filter(result => {
              const searchLower = query.toLowerCase();
              return (
                result.title.toLowerCase().includes(searchLower) ||
                result.content.toLowerCase().includes(searchLower) ||
                result.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                result.category?.toLowerCase().includes(searchLower) ||
                result.location?.toLowerCase().includes(searchLower)
              );
            });

          results.push(...reviewResults);
        }

        // Search Stories (kind 30023) - only from admin
        const storyEvents = await nostr.query([{
          kinds: [30023],
          authors: [ADMIN_HEX],
          limit: 50,
        }], { signal });

        const storyResults = storyEvents
          .filter(validateStoryEvent)
          .map(parseStoryEvent)
          .filter(result => {
            const searchLower = query.toLowerCase();
            return (
              result.title.toLowerCase().includes(searchLower) ||
              result.content.toLowerCase().includes(searchLower) ||
              result.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          });

        results.push(...storyResults);

        // Search Media (kind 30402)
        if (authorizedUploaders && authorizedUploaders.size > 0) {
          const mediaEvents = await nostr.query([{
            kinds: [30402],
            authors: Array.from(authorizedUploaders),
            limit: 50,
          }], { signal });

          const mediaResults = mediaEvents
            .filter(validateMediaEvent)
            .map(parseMediaEvent)
            .filter(result => {
              // Filter out deleted products
              const isDeleted = result.content?.startsWith('[DELETED]') ||
                result.content?.startsWith('[ADMIN DELETED]') ||
                result.event.tags.some(tag => tag[0] === 'deleted' && tag[1] === 'true');

              if (isDeleted) return false;

              const searchLower = query.toLowerCase();
              return (
                result.title.toLowerCase().includes(searchLower) ||
                result.content.toLowerCase().includes(searchLower) ||
                result.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
                result.location?.toLowerCase().includes(searchLower)
              );
            });

          results.push(...mediaResults);
        }

        // Search Trips (kind 30025) - only from admin
        const tripEvents = await nostr.query([{
          kinds: [30025],
          authors: [ADMIN_HEX],
          limit: 50,
        }], { signal });

        const tripResults = tripEvents
          .filter(validateTripEvent)
          .map(parseTripEvent)
          .filter(result => {
            const searchLower = query.toLowerCase();
            return (
              result.title.toLowerCase().includes(searchLower) ||
              result.content.toLowerCase().includes(searchLower) ||
              result.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
              result.category?.toLowerCase().includes(searchLower)
            );
          });

        results.push(...tripResults);

        // Sort by relevance and recency
        return results.sort((a, b) => {
          // First, prioritize exact title matches
          const aExactTitle = a.title.toLowerCase() === query.toLowerCase();
          const bExactTitle = b.title.toLowerCase() === query.toLowerCase();
          if (aExactTitle && !bExactTitle) return -1;
          if (!aExactTitle && bExactTitle) return 1;

          // Then by tag matches
          const aTagMatch = a.tags.some(tag => tag.toLowerCase() === query.toLowerCase());
          const bTagMatch = b.tags.some(tag => tag.toLowerCase() === query.toLowerCase());
          if (aTagMatch && !bTagMatch) return -1;
          if (!aTagMatch && bTagMatch) return 1;

          // Finally by recency
          return b.createdAt - a.createdAt;
        });

      } catch (error) {
        console.error('Search error:', error);
        return [];
      }
    },
    enabled: !!query.trim() && query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 30000, // 30 seconds
  });
}

export function useSearchSuggestions() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['search-suggestions', authorizedReviewers, authorizedUploaders],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(3000)]);
      const tags = new Set<string>();

      try {
        // Get tags from reviews
        if (authorizedReviewers && authorizedReviewers.size > 0) {
          const reviewEvents = await nostr.query([{
            kinds: [34879],
            authors: Array.from(authorizedReviewers),
            limit: 100,
          }], { signal });

          reviewEvents.forEach(event => {
            event.tags.forEach(([name, value]) => {
              if (name === 't' && value) {
                tags.add(value);
              }
            });
          });
        }

        // Get tags from stories
        const storyEvents = await nostr.query([{
          kinds: [30023],
          authors: [ADMIN_HEX],
          limit: 50,
        }], { signal });

        storyEvents.forEach(event => {
          event.tags.forEach(([name, value]) => {
            if (name === 't' && value) {
              tags.add(value);
            }
          });
        });

        // Get tags from media
        if (authorizedUploaders && authorizedUploaders.size > 0) {
          const mediaEvents = await nostr.query([{
            kinds: [30402],
            authors: Array.from(authorizedUploaders),
            limit: 100,
          }], { signal });

          mediaEvents.forEach(event => {
            event.tags.forEach(([name, value]) => {
              if (name === 't' && value) {
                tags.add(value);
              }
            });
          });
        }

        return Array.from(tags).sort();
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });
}