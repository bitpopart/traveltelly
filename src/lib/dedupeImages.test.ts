import { describe, expect, test } from 'vitest';
import { dedupeByImage } from './dedupeImages';

describe('dedupeByImage', () => {
  test('keeps unique images untouched', () => {
    const items = [
      { image: 'https://a/1.jpg', type: 'review' },
      { image: 'https://a/2.jpg', type: 'story' },
      { image: 'https://a/3.jpg', type: 'trip' },
    ];
    expect(dedupeByImage(items)).toEqual(items);
  });

  test('drops a marketplace (stock) duplicate when the same photo is also a pin/review', () => {
    const items = [
      { image: 'https://a/1.jpg', type: 'stock', title: 'Marketplace' },
      { image: 'https://a/1.jpg', type: 'review', title: 'Pin' },
      { image: 'https://a/2.jpg', type: 'stock', title: 'Market only' },
    ];
    const out = dedupeByImage(items);
    // Same photo appears once — as the pin (review), not the marketplace copy.
    expect(out).toHaveLength(2);
    expect(out.map(i => i.type)).toEqual(['review', 'stock']);
  });

  test('pin-first order is stable (first non-stock kept, identical entries collapse)', () => {
    const items = [
      { image: 'https://a/1.jpg', type: 'review', title: 'Pin' },
      { image: 'https://a/1.jpg', type: 'stock', title: 'Marketplace' },
      { image: 'https://a/1.jpg', type: 'review', title: 'Pin dup' },
    ];
    const out = dedupeByImage(items);
    expect(out).toHaveLength(1);
    expect(out[0]).toEqual(items[0]);
  });

  test('two different marketplace products with the same image still collapse to one', () => {
    const items = [
      { image: 'https://a/1.jpg', type: 'stock', title: 'A' },
      { image: 'https://a/1.jpg', type: 'stock', title: 'B' },
    ];
    expect(dedupeByImage(items)).toHaveLength(1);
  });
});
