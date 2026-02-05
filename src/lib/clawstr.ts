/**
 * Clawstr Integration Utilities
 * 
 * Utilities for posting Traveltelly content to Clawstr subclaws.
 * Clawstr is a Nostr-based social network for AI agents.
 * 
 * Learn more: https://clawstr.com
 */

import type { NostrEvent } from '@nostrify/nostrify';

/**
 * Clawstr subclaws (like subreddits)
 */
export const CLAWSTR_SUBCLAWS = [
  {
    id: 'travel',
    name: 'Travel',
    url: 'https://clawstr.com/c/travel',
    description: 'Travel experiences, tips, and photography',
    icon: '🌍',
  },
  {
    id: 'photography',
    name: 'Photography',
    url: 'https://clawstr.com/c/photography',
    description: 'Photography discussion and showcases',
    icon: '📸',
  },
  {
    id: 'nostr',
    name: 'Nostr',
    url: 'https://clawstr.com/c/nostr',
    description: 'Nostr protocol and applications',
    icon: '🟣',
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    url: 'https://clawstr.com/c/bitcoin',
    description: 'Bitcoin and Lightning Network',
    icon: '₿',
  },
  {
    id: 'ai-freedom',
    name: 'AI Freedom',
    url: 'https://clawstr.com/c/ai-freedom',
    description: 'AI independence and agency',
    icon: '🤖',
  },
  {
    id: 'introductions',
    name: 'Introductions',
    url: 'https://clawstr.com/c/introductions',
    description: 'Welcome new members',
    icon: '👋',
  },
] as const;

export type ClawstrSubclaw = typeof CLAWSTR_SUBCLAWS[number];

/**
 * Create tags for posting to a Clawstr subclaw
 * 
 * Based on Clawstr event format (kind 1111 with special tags)
 * 
 * @param subclawUrl - Full URL to the subclaw (e.g., "https://clawstr.com/c/travel")
 * @returns Array of Nostr tags for the event
 */
export function createClawstrTags(subclawUrl: string): string[][] {
  return [
    // Subclaw identifier (uppercase I and lowercase i)
    ['I', subclawUrl],
    ['K', 'web'],
    ['i', subclawUrl],
    ['k', 'web'],
    
    // AI agent label (identifies this as AI-generated content)
    ['L', 'agent'],
    ['l', 'ai', 'agent'],
    
    // Traveltelly identifier
    ['client', 'traveltelly'],
    ['t', 'traveltelly'],
  ];
}

/**
 * Create a Clawstr post event
 * 
 * @param content - Post content (text, can include hashtags)
 * @param subclawUrl - Subclaw URL to post to
 * @param additionalTags - Additional tags to include (optional)
 * @returns Partial Nostr event ready for signing and publishing
 */
export function createClawstrPost(
  content: string,
  subclawUrl: string,
  additionalTags: string[][] = []
): Partial<NostrEvent> {
  return {
    kind: 1111, // Clawstr post kind
    content,
    tags: [
      ...createClawstrTags(subclawUrl),
      ...additionalTags,
    ],
  };
}

/**
 * Format a review for Clawstr sharing
 * 
 * @param review - Review event
 * @param subclawId - Subclaw to share to (default: 'travel')
 * @returns Formatted Clawstr post
 */
export function formatReviewForClawstr(
  review: NostrEvent,
  subclawId: string = 'travel'
): Partial<NostrEvent> {
  const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const rating = review.tags.find(([name]) => name === 'rating')?.[1] || '0';
  const location = review.tags.find(([name]) => name === 'location')?.[1] || '';
  const category = review.tags.find(([name]) => name === 'category')?.[1] || '';
  
  const stars = '⭐'.repeat(parseInt(rating));
  
  const content = `📍 ${title}

${stars} ${rating}/5 ${category ? `• ${category}` : ''}
${location}

${review.content}

#travel #review #traveltelly`;

  const subclaw = CLAWSTR_SUBCLAWS.find(s => s.id === subclawId);
  const subclawUrl = subclaw?.url || CLAWSTR_SUBCLAWS[0].url;

  return createClawstrPost(content, subclawUrl, [
    ['e', review.id], // Reference original review
    ['t', 'review'],
    ['t', 'travel'],
  ]);
}

/**
 * Format a story for Clawstr sharing
 * 
 * @param story - Story/article event
 * @param subclawId - Subclaw to share to (default: 'travel')
 * @returns Formatted Clawstr post
 */
export function formatStoryForClawstr(
  story: NostrEvent,
  subclawId: string = 'travel'
): Partial<NostrEvent> {
  const title = story.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = story.tags.find(([name]) => name === 'summary')?.[1] || '';
  
  // Extract first 280 chars of content if no summary
  const preview = summary || story.content.substring(0, 280) + '...';
  
  const content = `📝 ${title}

${preview}

Read more on Traveltelly ✈️

#travel #story #traveltelly`;

  const subclaw = CLAWSTR_SUBCLAWS.find(s => s.id === subclawId);
  const subclawUrl = subclaw?.url || CLAWSTR_SUBCLAWS[0].url;

  return createClawstrPost(content, subclawUrl, [
    ['e', story.id], // Reference original story
    ['t', 'story'],
    ['t', 'travel'],
    ['t', 'writing'],
  ]);
}

/**
 * Format a trip for Clawstr sharing
 * 
 * @param trip - Trip event
 * @param subclawId - Subclaw to share to (default: 'travel')
 * @returns Formatted Clawstr post
 */
export function formatTripForClawstr(
  trip: NostrEvent,
  subclawId: string = 'travel'
): Partial<NostrEvent> {
  const title = trip.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const category = trip.tags.find(([name]) => name === 'category')?.[1] || '';
  const distance = trip.tags.find(([name]) => name === 'distance')?.[1] || '';
  const distanceUnit = trip.tags.find(([name]) => name === 'distance_unit')?.[1] || 'km';
  const imageCount = trip.tags.filter(([name]) => name === 'image').length;
  
  const activityEmoji = category === 'hike' ? '🥾' : category === 'cycling' ? '🚴' : '🚶';
  
  const content = `✈️ ${title}

${activityEmoji} ${category}${distance ? ` • ${distance} ${distanceUnit}` : ''}
📸 ${imageCount} photos with GPS route

${trip.content}

#travel #trip #traveltelly`;

  const subclaw = CLAWSTR_SUBCLAWS.find(s => s.id === subclawId);
  const subclawUrl = subclaw?.url || CLAWSTR_SUBCLAWS[0].url;

  return createClawstrPost(content, subclawUrl, [
    ['e', trip.id], // Reference original trip
    ['t', 'trip'],
    ['t', 'travel'],
    ['t', category],
  ]);
}

/**
 * Format stock media for Clawstr sharing
 * 
 * @param media - Stock media event
 * @param subclawId - Subclaw to share to (default: 'photography')
 * @returns Formatted Clawstr post
 */
export function formatMediaForClawstr(
  media: NostrEvent,
  subclawId: string = 'photography'
): Partial<NostrEvent> {
  const title = media.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
  const summary = media.tags.find(([name]) => name === 'summary')?.[1] || '';
  const price = media.tags.find(([name]) => name === 'price')?.[1];
  const currency = media.tags.find(([name]) => name === 'currency')?.[1] || 'USD';
  
  const content = `📸 ${title}

${summary}

${price ? `💰 ${price} ${currency}` : ''}

Available on Traveltelly Marketplace ⚡

#photography #stockphoto #traveltelly #bitcoin`;

  const subclaw = CLAWSTR_SUBCLAWS.find(s => s.id === subclawId);
  const subclawUrl = subclaw?.url || CLAWSTR_SUBCLAWS[0].url;

  return createClawstrPost(content, subclawUrl, [
    ['e', media.id], // Reference original media
    ['t', 'photography'],
    ['t', 'stockphoto'],
    ['t', 'marketplace'],
  ]);
}

/**
 * Get recommended subclaw for content type
 * 
 * @param contentType - Type of content (review, story, trip, media)
 * @returns Recommended subclaw
 */
export function getRecommendedSubclaw(contentType: 'review' | 'story' | 'trip' | 'media'): ClawstrSubclaw {
  switch (contentType) {
    case 'review':
    case 'story':
    case 'trip':
      return CLAWSTR_SUBCLAWS.find(s => s.id === 'travel')!;
    case 'media':
      return CLAWSTR_SUBCLAWS.find(s => s.id === 'photography')!;
    default:
      return CLAWSTR_SUBCLAWS[0];
  }
}

/**
 * Check if an event is a Clawstr post
 * 
 * @param event - Nostr event
 * @returns True if event is a Clawstr post (kind 1111 with subclaw tags)
 */
export function isClawstrPost(event: NostrEvent): boolean {
  if (event.kind !== 1111) return false;
  
  // Check for subclaw identifier tags
  const hasSubclawTags = event.tags.some(([name]) => name === 'I' || name === 'i');
  
  return hasSubclawTags;
}

/**
 * Extract subclaw URL from a Clawstr post
 * 
 * @param event - Clawstr post event
 * @returns Subclaw URL or null if not found
 */
export function getSubclawUrl(event: NostrEvent): string | null {
  const subclawTag = event.tags.find(([name]) => name === 'I' || name === 'i');
  return subclawTag?.[1] || null;
}

/**
 * Create a custom Clawstr post
 * 
 * @param content - Post content
 * @param subclawId - Subclaw ID
 * @param hashtags - Additional hashtags
 * @returns Formatted Clawstr post
 */
export function createCustomClawstrPost(
  content: string,
  subclawId: string,
  hashtags: string[] = []
): Partial<NostrEvent> {
  const subclaw = CLAWSTR_SUBCLAWS.find(s => s.id === subclawId);
  const subclawUrl = subclaw?.url || CLAWSTR_SUBCLAWS[0].url;
  
  const hashtagString = hashtags.map(tag => `#${tag}`).join(' ');
  const fullContent = `${content}\n\n${hashtagString}`;
  
  return createClawstrPost(fullContent, subclawUrl, hashtags.map(tag => ['t', tag]));
}
