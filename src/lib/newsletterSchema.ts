/**
 * Newsletter Subscriber Schema
 * 
 * Subscribers are stored as Nostr events (kind 30080) published by admin
 */

import type { NostrEvent } from '@nostrify/nostrify';

export interface NewsletterSubscriber {
  email: string;
  name?: string;
  subscribedAt: number;
  status: 'active' | 'unsubscribed';
  source?: string; // Where they subscribed from
}

export interface NewsletterContent {
  reviews: string[]; // Event IDs
  stories: string[]; // Event IDs
  trips: string[]; // Event IDs
  stockMedia: string[]; // Event IDs
  customText?: string;
  customLinks?: { title: string; url: string }[];
}

/**
 * Validate subscriber event (kind 30080)
 */
export function validateSubscriberEvent(event: NostrEvent): boolean {
  if (event.kind !== 30080) return false;
  
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const email = event.tags.find(([name]) => name === 'email')?.[1];
  
  return !!(d && email);
}

/**
 * Parse subscriber from Nostr event
 */
export function parseSubscriberEvent(event: NostrEvent): NewsletterSubscriber | null {
  if (!validateSubscriberEvent(event)) return null;
  
  const email = event.tags.find(([name]) => name === 'email')?.[1] || '';
  const name = event.tags.find(([name]) => name === 'name')?.[1];
  const status = event.tags.find(([name]) => name === 'status')?.[1] as 'active' | 'unsubscribed' || 'active';
  const source = event.tags.find(([name]) => name === 'source')?.[1];
  
  return {
    email,
    name,
    subscribedAt: event.created_at,
    status,
    source,
  };
}

/**
 * Create subscriber event tags
 */
export function createSubscriberTags(email: string, name?: string, source?: string): string[][] {
  const tags: string[][] = [
    ['d', `subscriber-${email}`],
    ['email', email],
    ['status', 'active'],
  ];
  
  if (name) {
    tags.push(['name', name]);
  }
  
  if (source) {
    tags.push(['source', source]);
  }
  
  tags.push(['alt', `Newsletter subscriber: ${email}`]);
  
  return tags;
}
