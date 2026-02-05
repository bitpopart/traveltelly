/**
 * Customer Management Schema
 * 
 * Stores customer information for non-Nostr users who purchase stock media.
 * Uses Nostr kind 30078 (Application-specific data) for storage.
 * 
 * All customer events are:
 * - Published by the admin account only
 * - Encrypted for privacy
 * - Replaceable (only latest version per customer is kept)
 * - Identified by customer email (d tag)
 */

import type { NostrEvent } from '@nostrify/nostrify';

export type SubscriptionType = 'none' | 'unlimited' | 'test';

export interface CustomerData {
  email: string;
  name: string;
  subscriptionType: SubscriptionType;
  subscriptionExpiry?: number; // Unix timestamp
  createdAt: number;
  lastPurchaseAt?: number;
  totalPurchases?: number;
  notes?: string;
}

export interface PurchaseRecord {
  productId: string;
  productTitle: string;
  price: number;
  currency: string;
  purchasedAt: number;
  downloadUrl?: string;
  customerEmail: string;
  paymentMethod: 'lightning' | 'fiat';
  paymentStatus: 'pending' | 'completed' | 'failed';
}

/**
 * Nostr Kind for Customer Records
 * Kind 30078 - Application-specific data (replaceable)
 */
export const CUSTOMER_RECORD_KIND = 30078;

/**
 * Nostr Kind for Purchase Records
 * Kind 30079 - Application-specific data (replaceable)
 */
export const PURCHASE_RECORD_KIND = 30079;

/**
 * Parse customer data from Nostr event
 */
export function parseCustomerEvent(event: NostrEvent): CustomerData | null {
  try {
    const email = event.tags.find(([name]) => name === 'd')?.[1];
    if (!email) return null;

    const data: CustomerData = JSON.parse(event.content);
    return {
      email,
      ...data,
    };
  } catch (error) {
    console.error('Failed to parse customer event:', error);
    return null;
  }
}

/**
 * Create customer event content
 */
export function createCustomerEventContent(customer: Omit<CustomerData, 'email'>): string {
  return JSON.stringify(customer);
}

/**
 * Check if customer has active unlimited subscription
 */
export function hasActiveSubscription(customer: CustomerData): boolean {
  if (customer.subscriptionType === 'none') return false;
  if (customer.subscriptionType === 'test') return true;
  
  if (customer.subscriptionType === 'unlimited') {
    if (!customer.subscriptionExpiry) return true; // Lifetime subscription
    return customer.subscriptionExpiry > Date.now() / 1000;
  }
  
  return false;
}

/**
 * Test customer credentials (for admin testing)
 */
export const TEST_CUSTOMER = {
  email: 'admin-non-nostr@traveltelly.test',
  name: 'Admin Non-Nostr',
  subscriptionType: 'test' as SubscriptionType,
  createdAt: Date.now() / 1000,
  notes: 'Test account for admin - unlimited free downloads',
};
