import * as geohash from 'ngeohash';
import type { NostrEvent } from '@nostrify/nostrify';

export interface PrecisionUpgrade {
  reviewId: string;
  originalGeohash: string;
  originalPrecision: number;
  upgradedGeohash: string;
  upgradedPrecision: number;
  coordinates: { lat: number; lng: number };
  accuracy: string;
}

/**
 * Upgrade geohash precision for low-precision reviews
 */
export function upgradeReviewPrecision(
  review: NostrEvent,
  targetPrecision: number = 8
): PrecisionUpgrade | null {
  const geohashTag = review.tags.find(([name]) => name === 'g')?.[1];

  if (!geohashTag) {
    console.log(`No geohash found for review ${review.id}`);
    return null;
  }

  const currentPrecision = geohashTag.length;

  // Only upgrade if current precision is lower than target
  if (currentPrecision >= targetPrecision) {
    console.log(`Review ${review.id} already has sufficient precision (${currentPrecision})`);
    return null;
  }

  try {
    // Decode current geohash to get coordinates
    const decoded = geohash.decode(geohashTag);

    // Re-encode with higher precision
    const upgradedGeohash = geohash.encode(decoded.latitude, decoded.longitude, targetPrecision);

    const accuracyMap: Record<number, string> = {
      1: "±2500 km", 2: "±630 km", 3: "±78 km", 4: "±20 km", 5: "±2.4 km",
      6: "±610 m", 7: "±76 m", 8: "±19 m", 9: "±2.4 m", 10: "±60 cm",
    };

    const upgrade: PrecisionUpgrade = {
      reviewId: review.id,
      originalGeohash: geohashTag,
      originalPrecision: currentPrecision,
      upgradedGeohash,
      upgradedPrecision: targetPrecision,
      coordinates: { lat: decoded.latitude, lng: decoded.longitude },
      accuracy: accuracyMap[targetPrecision] || "Unknown",
    };

    console.log(`🔧 Upgraded review ${review.id}: ${geohashTag} (${accuracyMap[currentPrecision]}) → ${upgradedGeohash} (${upgrade.accuracy})`);

    return upgrade;
  } catch (error) {
    console.error(`Failed to upgrade precision for review ${review.id}:`, error);
    return null;
  }
}

/**
 * Upgrade multiple reviews with priority for oldest/most important
 */
export function upgradeMultipleReviews(
  reviews: NostrEvent[],
  maxUpgrades: number = 15,
  targetPrecision: number = 8
): PrecisionUpgrade[] {
  console.log(`🚀 Starting precision upgrade for up to ${maxUpgrades} reviews...`);

  // Filter reviews that need upgrading (have geohash with low precision)
  const candidateReviews = reviews.filter(review => {
    const geohashTag = review.tags.find(([name]) => name === 'g')?.[1];
    return geohashTag && geohashTag.length < targetPrecision;
  });

  console.log(`Found ${candidateReviews.length} reviews that need precision upgrade`);

  // Sort by creation time (oldest first) to prioritize early reviews
  const sortedReviews = candidateReviews.sort((a, b) => a.created_at - b.created_at);

  // Take only the first N reviews
  const reviewsToUpgrade = sortedReviews.slice(0, maxUpgrades);

  console.log(`Upgrading precision for ${reviewsToUpgrade.length} reviews:`);
  reviewsToUpgrade.forEach((review, index) => {
    const geohashTag = review.tags.find(([name]) => name === 'g')?.[1];
    const title = review.tags.find(([name]) => name === 'title')?.[1] || 'Unknown';
    console.log(`  ${index + 1}. ${title} (${new Date(review.created_at * 1000).toLocaleDateString()}) - ${geohashTag}`);
  });

  // Upgrade each review
  const upgrades: PrecisionUpgrade[] = [];

  for (const review of reviewsToUpgrade) {
    const upgrade = upgradeReviewPrecision(review, targetPrecision);
    if (upgrade) {
      upgrades.push(upgrade);
    }
  }

  console.log(`✅ Successfully upgraded ${upgrades.length} reviews to precision ${targetPrecision}`);

  return upgrades;
}

/**
 * Apply precision upgrades to review location data
 */
export function applyPrecisionUpgrades<T extends {
  id: string;
  lat: number;
  lng: number;
  precision?: number;
  accuracy?: string;
}>(
  locations: T[],
  upgrades: PrecisionUpgrade[]
): (T & { upgraded?: boolean })[] {
  const upgradeMap = new Map(upgrades.map(u => [u.reviewId, u]));

  return locations.map(location => {
    const upgrade = upgradeMap.get(location.id);

    if (upgrade) {
      // Apply the upgraded coordinates and precision
      return {
        ...location,
        lat: upgrade.coordinates.lat,
        lng: upgrade.coordinates.lng,
        precision: upgrade.upgradedPrecision,
        accuracy: upgrade.accuracy,
        upgraded: true,
      };
    }

    return location;
  });
}

/**
 * Get upgrade statistics
 */
export function getUpgradeStats(upgrades: PrecisionUpgrade[]): {
  totalUpgrades: number;
  precisionDistribution: Record<number, number>;
  averageAccuracyImprovement: string;
  oldestUpgraded: Date | null;
  newestUpgraded: Date | null;
} {
  const precisionDistribution: Record<number, number> = {};

  upgrades.forEach(upgrade => {
    const original = upgrade.originalPrecision;
    precisionDistribution[original] = (precisionDistribution[original] || 0) + 1;
  });

  return {
    totalUpgrades: upgrades.length,
    precisionDistribution,
    averageAccuracyImprovement: upgrades.length > 0 ?
      `${upgrades[0].accuracy} (from various lower precisions)` : 'None',
    oldestUpgraded: null, // Would need review timestamps to calculate
    newestUpgraded: null, // Would need review timestamps to calculate
  };
}