/**
 * Gamma Spec - Product Reviews (Kind 31555)
 */
import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { parseGammaReview, type GammaReview } from '@/lib/gammaSpec';

export function useGammaReviews(productRef: string | undefined) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['gamma-reviews', productRef],
    queryFn: async (c) => {
      if (!productRef) return [];
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);

      const events = await nostr.query([{
        kinds: [31555],
        '#d': [productRef],
        limit: 100,
      }], { signal });

      const reviews: GammaReview[] = [];
      for (const event of events) {
        const review = parseGammaReview(event);
        if (review) reviews.push(review);
      }

      reviews.sort((a, b) => b.createdAt - a.createdAt);
      return reviews;
    },
    enabled: !!productRef,
    staleTime: 120_000,
  });
}

/**
 * Calculate aggregate rating from a list of reviews
 * Total Score = (Thumb × 0.5) + (0.5 × (Σ(Category Ratings) ÷ N))
 */
export function calculateAggregateRating(reviews: GammaReview[]): {
  average: number;
  count: number;
  thumbPositive: number;
  categories: Record<string, number>;
} {
  if (reviews.length === 0) return { average: 0, count: 0, thumbPositive: 0, categories: {} };

  let totalScore = 0;
  let thumbPositive = 0;
  const catSums: Record<string, number[]> = {};

  for (const review of reviews) {
    // Thumb (50% weight)
    const thumbScore = review.thumbRating; // 0-1
    if (thumbScore >= 0.5) thumbPositive++;

    // Category ratings
    const catRatings: number[] = [];
    if (review.valueRating !== undefined) { catRatings.push(review.valueRating); catSums.value = [...(catSums.value || []), review.valueRating]; }
    if (review.qualityRating !== undefined) { catRatings.push(review.qualityRating); catSums.quality = [...(catSums.quality || []), review.qualityRating]; }
    if (review.deliveryRating !== undefined) { catRatings.push(review.deliveryRating); catSums.delivery = [...(catSums.delivery || []), review.deliveryRating]; }
    if (review.communicationRating !== undefined) { catRatings.push(review.communicationRating); catSums.communication = [...(catSums.communication || []), review.communicationRating]; }

    const catAvg = catRatings.length > 0
      ? catRatings.reduce((a, b) => a + b, 0) / catRatings.length
      : thumbScore; // fallback to thumb if no category ratings

    const score = thumbScore * 0.5 + catAvg * 0.5;
    totalScore += score;
  }

  const averageRaw = totalScore / reviews.length;
  const categories: Record<string, number> = {};
  for (const [cat, vals] of Object.entries(catSums)) {
    categories[cat] = vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  return {
    average: Math.round(averageRaw * 5 * 10) / 10, // Convert 0-1 to 0-5 scale, 1 decimal
    count: reviews.length,
    thumbPositive,
    categories,
  };
}

export function useGammaPublishReview() {
  const { user } = useCurrentUser();
  const { mutateAsync: publishEvent } = useNostrPublish();

  const publishReview = async (params: {
    merchantPubkey: string;
    productDTag: string;
    thumbRating: number; // 0 or 1
    content: string;
    valueRating?: number;
    qualityRating?: number;
    deliveryRating?: number;
    communicationRating?: number;
  }) => {
    if (!user) throw new Error('Not logged in');

    const productRef = `a:30402:${params.merchantPubkey}:${params.productDTag}`;

    const tags: string[][] = [
      ['d', productRef],
      ['rating', String(params.thumbRating), 'thumb'],
    ];

    if (params.valueRating !== undefined) tags.push(['rating', String(params.valueRating), 'value']);
    if (params.qualityRating !== undefined) tags.push(['rating', String(params.qualityRating), 'quality']);
    if (params.deliveryRating !== undefined) tags.push(['rating', String(params.deliveryRating), 'delivery']);
    if (params.communicationRating !== undefined) tags.push(['rating', String(params.communicationRating), 'communication']);

    await publishEvent({
      kind: 31555,
      content: params.content,
      tags,
    });
  };

  return { publishReview };
}
