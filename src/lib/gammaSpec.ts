/**
 * Gamma Spec - NIP-99 Marketplace Extension
 * https://github.com/GammaMarkets/market-spec/blob/main/spec.md
 *
 * Implements:
 * - Kind 30402: Product Listings (enhanced)
 * - Kind 30403: Draft/Inactive Listings
 * - Kind 30405: Product Collections
 * - Kind 30406: Shipping Options
 * - Kind 31555: Product Reviews
 * - Kind 14: General DM Communication
 * - Kind 16: Order Processing Messages
 * - Kind 17: Payment Receipts
 */

// ─── Product ─────────────────────────────────────────────────────────────────

export type ProductType = 'simple' | 'variable' | 'variation';
export type ProductFormat = 'digital' | 'physical';
export type ProductVisibility = 'hidden' | 'on-sale' | 'pre-order';
export type ProductStatus = 'active' | 'sold' | 'inactive' | 'deleted';

export interface ProductSpec {
  key: string;
  value: string;
}

export interface GammaProduct {
  // Nostr fields
  id: string;           // event.id
  pubkey: string;       // event.pubkey
  dTag: string;         // d tag (unique identifier)
  createdAt: number;

  // Required fields
  title: string;
  price: string;
  currency: string;
  priceFrequency?: string; // e.g. 'month', 'year'

  // Optional product details
  productType: ProductType;
  productFormat: ProductFormat;
  visibility: ProductVisibility;
  stock?: number;
  summary?: string;
  description: string;  // content (markdown)

  // Media
  images: Array<{ url: string; dimensions?: string; sortOrder?: number }>;

  // Physical
  weight?: { value: string; unit: string };
  dimensions?: { lwh: string; unit: string };

  // Specs
  specs: ProductSpec[];

  // Location
  location?: string;
  geohash?: string;

  // Organization
  tags: string[];
  collections: string[];      // a refs to 30405
  shippingOptions: string[];  // a refs to 30406 or 30405

  // Status
  status: ProductStatus;
  publishedAt?: number;
}

// ─── Product Collection (Kind 30405) ──────────────────────────────────────────

export interface GammaCollection {
  id: string;           // event.id
  pubkey: string;
  dTag: string;
  createdAt: number;

  title: string;
  description?: string;
  image?: string;
  summary?: string;

  location?: string;
  geohash?: string;

  productRefs: string[];      // a refs to 30402
  shippingOptions: string[];  // a refs to 30406
}

// ─── Shipping Option (Kind 30406) ─────────────────────────────────────────────

export type ShippingService = 'standard' | 'express' | 'overnight' | 'pickup';

export interface GammaShippingOption {
  id: string;           // event.id
  pubkey: string;
  dTag: string;
  createdAt: number;

  title: string;
  description?: string;
  basePrice: string;
  currency: string;
  service: ShippingService;
  countries: string[];  // ISO 3166-1 alpha-2
  regions?: string[];   // ISO 3166-2
  carrier?: string;

  // Time
  durationMin?: string;
  durationMax?: string;
  durationUnit?: 'H' | 'D' | 'W';

  // Location (for pickup)
  location?: string;
  geohash?: string;

  // Constraints
  weightMin?: { value: string; unit: string };
  weightMax?: { value: string; unit: string };
  dimMin?: { lwh: string; unit: string };
  dimMax?: { lwh: string; unit: string };

  // Per-unit pricing
  pricePerWeight?: { price: string; unit: string };
  pricePerVolume?: { price: string; unit: string };
  pricePerDistance?: { price: string; unit: string };
}

// ─── Order Message Types (Kind 16) ────────────────────────────────────────────

export type OrderMessageType = '1' | '2' | '3' | '4';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
export type ShippingStatus = 'processing' | 'shipped' | 'delivered' | 'exception';
export type PaymentMedium = 'lightning' | 'bitcoin' | 'ecash' | 'fiat';

export interface OrderItem {
  productRef: string;  // "30402:pubkey:d-tag"
  quantity: string;
}

export interface PaymentDetail {
  medium: PaymentMedium;
  reference: string;   // invoice, address, cashu-req, etc.
  proof?: string;      // preimage, txid, token proof
}

export interface GammaOrderMessage {
  type: OrderMessageType;
  orderId: string;
  subject: string;
  content?: string;

  // Type 1: Order Creation (buyer → merchant)
  items?: OrderItem[];
  amountSats?: string;
  shippingRef?: string;    // "30406:pubkey:d-tag"
  shippingAddress?: string;
  customerEmail?: string;
  customerPhone?: string;

  // Type 2: Payment Request
  payments?: PaymentDetail[];
  expiration?: number;

  // Type 3: Status Update
  status?: OrderStatus;

  // Type 4: Shipping Update
  shippingStatus?: ShippingStatus;
  trackingNumber?: string;
  carrier?: string;
  eta?: number;
}

// ─── Product Review (Kind 31555) ──────────────────────────────────────────────

export interface GammaReview {
  id: string;
  pubkey: string;
  productRef: string;   // "a:30402:merchant-pubkey:product-d-tag"
  createdAt: number;

  content: string;

  // Required: thumb rating 0 (negative) to 1 (positive)
  thumbRating: number;

  // Optional category ratings
  valueRating?: number;
  qualityRating?: number;
  deliveryRating?: number;
  communicationRating?: number;
}

// ─── Parsing helpers ──────────────────────────────────────────────────────────

import type { NostrEvent } from '@nostrify/nostrify';

export function parseGammaProduct(event: NostrEvent): GammaProduct | null {
  if (event.kind !== 30402 && event.kind !== 30403) return null;
  const getTag = (name: string) => event.tags.find(([n]) => n === name)?.[1];
  const getTags = (name: string) => event.tags.filter(([n]) => n === name).map(t => t[1]).filter(Boolean);

  const dTag = getTag('d');
  const title = getTag('title');
  if (!dTag || !title) return null;

  const priceTag = event.tags.find(([n]) => n === 'price');
  const typeTag = event.tags.find(([n]) => n === 'type');
  const weightTag = event.tags.find(([n]) => n === 'weight');
  const dimTag = event.tags.find(([n]) => n === 'dim');
  const stockStr = getTag('stock');

  const images = event.tags
    .filter(([n]) => n === 'image')
    .map(tag => ({
      url: tag[1] || '',
      dimensions: tag[2],
      sortOrder: tag[3] ? parseInt(tag[3]) : undefined,
    }))
    .filter(img => img.url);

  const specs: ProductSpec[] = event.tags
    .filter(([n]) => n === 'spec')
    .map(tag => ({ key: tag[1] || '', value: tag[2] || '' }))
    .filter(s => s.key);

  const shippingOptions = event.tags
    .filter(([n]) => n === 'shipping_option')
    .map(t => t[1])
    .filter(Boolean);

  const collections = event.tags
    .filter(([n, v]) => n === 'a' && v?.startsWith('30405:'))
    .map(t => t[1])
    .filter(Boolean);

  return {
    id: event.id,
    pubkey: event.pubkey,
    dTag,
    createdAt: event.created_at,
    title,
    price: priceTag?.[1] || '0',
    currency: (priceTag?.[2] || 'SATS').toUpperCase(),
    priceFrequency: priceTag?.[3],
    productType: (typeTag?.[1] as ProductType) || 'simple',
    productFormat: (typeTag?.[2] as ProductFormat) || 'digital',
    visibility: (getTag('visibility') as ProductVisibility) || 'on-sale',
    stock: stockStr ? parseInt(stockStr) : undefined,
    summary: getTag('summary'),
    description: event.content || '',
    images,
    weight: weightTag ? { value: weightTag[1] || '', unit: weightTag[2] || '' } : undefined,
    dimensions: dimTag ? { lwh: dimTag[1] || '', unit: dimTag[2] || '' } : undefined,
    specs,
    location: getTag('location'),
    geohash: getTag('g'),
    tags: getTags('t'),
    collections,
    shippingOptions,
    status: (getTag('status') as ProductStatus) || 'active',
    publishedAt: getTag('published_at') ? parseInt(getTag('published_at')!) : undefined,
  };
}

export function parseGammaCollection(event: NostrEvent): GammaCollection | null {
  if (event.kind !== 30405) return null;
  const getTag = (name: string) => event.tags.find(([n]) => n === name)?.[1];

  const dTag = getTag('d');
  const title = getTag('title');
  if (!dTag || !title) return null;

  const productRefs = event.tags
    .filter(([n, v]) => n === 'a' && v?.startsWith('30402:'))
    .map(t => t[1])
    .filter(Boolean);

  const shippingOptions = event.tags
    .filter(([n]) => n === 'shipping_option')
    .map(t => t[1])
    .filter(Boolean);

  return {
    id: event.id,
    pubkey: event.pubkey,
    dTag,
    createdAt: event.created_at,
    title,
    description: event.content || undefined,
    image: getTag('image'),
    summary: getTag('summary'),
    location: getTag('location'),
    geohash: getTag('g'),
    productRefs,
    shippingOptions,
  };
}

export function parseGammaShippingOption(event: NostrEvent): GammaShippingOption | null {
  if (event.kind !== 30406) return null;
  const getTag = (name: string) => event.tags.find(([n]) => n === name)?.[1];

  const dTag = getTag('d');
  const title = getTag('title');
  if (!dTag || !title) return null;

  const priceTag = event.tags.find(([n]) => n === 'price');
  const countryTag = event.tags.find(([n]) => n === 'country');
  const regionTag = event.tags.find(([n]) => n === 'region');
  const durationTag = event.tags.find(([n]) => n === 'duration');
  const weightMinTag = event.tags.find(([n]) => n === 'weight-min');
  const weightMaxTag = event.tags.find(([n]) => n === 'weight-max');
  const dimMinTag = event.tags.find(([n]) => n === 'dim-min');
  const dimMaxTag = event.tags.find(([n]) => n === 'dim-max');
  const priceWeightTag = event.tags.find(([n]) => n === 'price-weight');
  const priceVolumeTag = event.tags.find(([n]) => n === 'price-volume');
  const priceDistTag = event.tags.find(([n]) => n === 'price-distance');

  return {
    id: event.id,
    pubkey: event.pubkey,
    dTag,
    createdAt: event.created_at,
    title,
    description: event.content || undefined,
    basePrice: priceTag?.[1] || '0',
    currency: (priceTag?.[2] || 'USD').toUpperCase(),
    service: (getTag('service') as ShippingService) || 'standard',
    countries: countryTag ? countryTag.slice(1) : [],
    regions: regionTag ? regionTag.slice(1) : undefined,
    carrier: getTag('carrier'),
    durationMin: durationTag?.[1],
    durationMax: durationTag?.[2],
    durationUnit: durationTag?.[3] as 'H' | 'D' | 'W' | undefined,
    location: getTag('location'),
    geohash: getTag('g'),
    weightMin: weightMinTag ? { value: weightMinTag[1] || '', unit: weightMinTag[2] || '' } : undefined,
    weightMax: weightMaxTag ? { value: weightMaxTag[1] || '', unit: weightMaxTag[2] || '' } : undefined,
    dimMin: dimMinTag ? { lwh: dimMinTag[1] || '', unit: dimMinTag[2] || '' } : undefined,
    dimMax: dimMaxTag ? { lwh: dimMaxTag[1] || '', unit: dimMaxTag[2] || '' } : undefined,
    pricePerWeight: priceWeightTag ? { price: priceWeightTag[1] || '', unit: priceWeightTag[2] || '' } : undefined,
    pricePerVolume: priceVolumeTag ? { price: priceVolumeTag[1] || '', unit: priceVolumeTag[2] || '' } : undefined,
    pricePerDistance: priceDistTag ? { price: priceDistTag[1] || '', unit: priceDistTag[2] || '' } : undefined,
  };
}

export function parseGammaReview(event: NostrEvent): GammaReview | null {
  if (event.kind !== 31555) return null;
  const getTag = (name: string) => event.tags.find(([n]) => n === name)?.[1];

  const productRef = getTag('d');
  if (!productRef) return null;

  const thumbTag = event.tags.find(([n, , label]) => n === 'rating' && label === 'thumb');
  if (!thumbTag) return null;

  const getRating = (label: string) => {
    const tag = event.tags.find(([n, , l]) => n === 'rating' && l === label);
    return tag ? parseFloat(tag[1]) : undefined;
  };

  return {
    id: event.id,
    pubkey: event.pubkey,
    productRef,
    createdAt: event.created_at,
    content: event.content,
    thumbRating: parseFloat(thumbTag[1]),
    valueRating: getRating('value'),
    qualityRating: getRating('quality'),
    deliveryRating: getRating('delivery'),
    communicationRating: getRating('communication'),
  };
}

// ─── Tag builders ──────────────────────────────────────────────────────────────

export function buildProductTags(product: Partial<GammaProduct> & { dTag: string; title: string; price: string; currency: string }): string[][] {
  const tags: string[][] = [
    ['d', product.dTag],
    ['title', product.title],
    ['price', product.price, product.currency, ...(product.priceFrequency ? [product.priceFrequency] : [])],
  ];

  if (product.productType || product.productFormat) {
    tags.push(['type', product.productType || 'simple', product.productFormat || 'digital']);
  }
  if (product.visibility) tags.push(['visibility', product.visibility]);
  if (product.stock !== undefined) tags.push(['stock', String(product.stock)]);
  if (product.summary) tags.push(['summary', product.summary]);
  if (product.publishedAt) tags.push(['published_at', String(product.publishedAt)]);
  if (product.status) tags.push(['status', product.status]);

  product.images?.forEach(img => {
    tags.push(['image', img.url, img.dimensions || '', img.sortOrder !== undefined ? String(img.sortOrder) : ''].filter((_, i) => i < 2 || _));
  });

  product.specs?.forEach(spec => {
    tags.push(['spec', spec.key, spec.value]);
  });

  if (product.weight) tags.push(['weight', product.weight.value, product.weight.unit]);
  if (product.dimensions) tags.push(['dim', product.dimensions.lwh, product.dimensions.unit]);
  if (product.location) tags.push(['location', product.location]);
  if (product.geohash) tags.push(['g', product.geohash]);

  product.tags?.forEach(t => tags.push(['t', t]));
  product.collections?.forEach(a => tags.push(['a', a]));
  product.shippingOptions?.forEach(s => tags.push(['shipping_option', s]));

  return tags;
}

export function buildShippingOptionTags(opt: Partial<GammaShippingOption> & { dTag: string; title: string; basePrice: string; currency: string; service: ShippingService; countries: string[] }): string[][] {
  const tags: string[][] = [
    ['d', opt.dTag],
    ['title', opt.title],
    ['price', opt.basePrice, opt.currency],
    ['country', ...opt.countries],
    ['service', opt.service],
  ];

  if (opt.carrier) tags.push(['carrier', opt.carrier]);
  if (opt.regions?.length) tags.push(['region', ...opt.regions]);
  if (opt.durationMin && opt.durationMax && opt.durationUnit) {
    tags.push(['duration', opt.durationMin, opt.durationMax, opt.durationUnit]);
  }
  if (opt.location) tags.push(['location', opt.location]);
  if (opt.geohash) tags.push(['g', opt.geohash]);
  if (opt.weightMin) tags.push(['weight-min', opt.weightMin.value, opt.weightMin.unit]);
  if (opt.weightMax) tags.push(['weight-max', opt.weightMax.value, opt.weightMax.unit]);
  if (opt.dimMin) tags.push(['dim-min', opt.dimMin.lwh, opt.dimMin.unit]);
  if (opt.dimMax) tags.push(['dim-max', opt.dimMax.lwh, opt.dimMax.unit]);
  if (opt.pricePerWeight) tags.push(['price-weight', opt.pricePerWeight.price, opt.pricePerWeight.unit]);
  if (opt.pricePerVolume) tags.push(['price-volume', opt.pricePerVolume.price, opt.pricePerVolume.unit]);
  if (opt.pricePerDistance) tags.push(['price-distance', opt.pricePerDistance.price, opt.pricePerDistance.unit]);

  return tags;
}

export function buildCollectionTags(col: Partial<GammaCollection> & { dTag: string; title: string }): string[][] {
  const tags: string[][] = [
    ['d', col.dTag],
    ['title', col.title],
  ];

  if (col.image) tags.push(['image', col.image]);
  if (col.summary) tags.push(['summary', col.summary]);
  if (col.location) tags.push(['location', col.location]);
  if (col.geohash) tags.push(['g', col.geohash]);

  col.productRefs?.forEach(a => tags.push(['a', a]));
  col.shippingOptions?.forEach(s => tags.push(['shipping_option', s]));

  return tags;
}

// ─── Order ID generator ────────────────────────────────────────────────────────

export function generateOrderId(): string {
  return `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
