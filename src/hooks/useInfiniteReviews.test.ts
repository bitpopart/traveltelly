import { describe, expect, it } from 'vitest';
import type { NostrEvent } from '@nostrify/nostrify';
import { validateReviewEvent } from './useInfiniteReviews';

function reviewEvent(overrides: Partial<NostrEvent> & { tags?: string[][] } = {}): NostrEvent {
  return {
    id: 'a'.repeat(64),
    pubkey: 'b'.repeat(64),
    kind: 34879,
    created_at: 1_700_000_000,
    content: 'Lovely spot, friendly staff.',
    tags: [
      ['d', 'sip-space-cafe-bangkok'],
      ['title', 'Sip Space Cafe'],
      ['rating', '5'],
      ['category', 'cafe'],
      ['g', 'w4g4u4x8'],
      ['location', 'Bangkok'],
    ],
    sig: 'c'.repeat(128),
    ...overrides,
  };
}

describe('validateReviewEvent (kind 34879 feed filter)', () => {
  it('accepts a real review (d + title + rating + category, no type tag)', () => {
    expect(validateReviewEvent(reviewEvent())).toBe(true);
  });

  it('rejects plain map photo/video pins tagged type=pin', () => {
    const pin = reviewEvent({ tags: [
      ['d', 'pin-abc123'],
      ['title', 'Sunset in Koh Samui'],
      ['rating', '5'],
      ['category', 'landmarks'],
      ['type', 'pin'],
      ['image', 'https://nostr.build/i/abc.jpg'],
    ] });
    expect(validateReviewEvent(pin)).toBe(false);
  });

  it('rejects events that are not kind 34879', () => {
    expect(validateReviewEvent(reviewEvent({ kind: 1 }))).toBe(false);
  });

  it('rejects events missing any of d/title/rating/category', () => {
    const noTitle = reviewEvent({ tags: [['d', 'x'], ['rating', '5'], ['category', 'cafe']] });
    expect(validateReviewEvent(noTitle)).toBe(false);

    const noRating = reviewEvent({ tags: [['d', 'x'], ['title', 'T'], ['category', 'cafe']] });
    expect(validateReviewEvent(noRating)).toBe(false);

    const noCategory = reviewEvent({ tags: [['d', 'x'], ['title', 'T'], ['rating', '5']] });
    expect(validateReviewEvent(noCategory)).toBe(false);

    const noD = reviewEvent({ tags: [['title', 'T'], ['rating', '5'], ['category', 'cafe']] });
    expect(validateReviewEvent(noD)).toBe(false);
  });

  it('accepts review events even when they carry other extra tags', () => {
    const withExtras = reviewEvent({
      tags: [
        ['d', 'x'],
        ['title', 'T'],
        ['rating', '4'],
        ['category', 'restaurant'],
        ['t', 'travel'],
        ['image', 'https://pics.example/1.jpg'],
      ],
    });
    expect(validateReviewEvent(withExtras)).toBe(true);
  });
});
