import * as geohash from 'ngeohash';
import type { NostrEvent } from '@nostrify/nostrify';
import { extractGPSFromImage, type GPSCoordinates } from './exifUtils';
import { trackCoordinates } from './coordinateVerification';

export interface PhotoGpsCorrection {
  reviewId: string;
  originalGeohash: string;
  originalPrecision: number;
  originalCoordinates: { lat: number; lng: number };
  photoGpsCoordinates: GPSCoordinates;
  correctedGeohash: string;
  correctedPrecision: number;
  accuracyImprovement: string;
  distanceCorrection: number; // meters
  confidence: number; // 0-1 scale
  photoSource: string;
}

export interface LowPrecisionMarker {
  reviewId: string;
  geohash: string;
  precision: number;
  coordinates: { lat: number; lng: number };
  accuracy: string;
  needsCorrection: boolean;
  hasPhotos: boolean;
  photoUrls: string[];
}

/**
 * Identify reviews with low precision markers that could benefit from photo GPS correction
 */
export function identifyLowPrecisionMarkers(
  reviews: NostrEvent[],
  precisionThreshold: number = 6
): LowPrecisionMarker[] {
  const lowPrecisionMarkers: LowPrecisionMarker[] = [];

  for (const review of reviews) {
    const geohashTag = review.tags.find(([name]) => name === 'g')?.[1];

    if (!geohashTag) continue;

    const precision = geohashTag.length;

    // Only consider markers below the precision threshold
    if (precision >= precisionThreshold) continue;

    try {
      const decoded = geohash.decode(geohashTag);

      // Find photo URLs in the review
      const photoUrls = extractPhotoUrls(review);

      const accuracyMap: Record<number, string> = {
        1: "±2500 km", 2: "±630 km", 3: "±78 km", 4: "±20 km", 5: "±2.4 km",
        6: "±610 m", 7: "±76 m", 8: "±19 m", 9: "±2.4 m", 10: "±60 cm",
      };

      lowPrecisionMarkers.push({
        reviewId: review.id,
        geohash: geohashTag,
        precision,
        coordinates: { lat: decoded.latitude, lng: decoded.longitude },
        accuracy: accuracyMap[precision] || "Unknown",
        needsCorrection: true,
        hasPhotos: photoUrls.length > 0,
        photoUrls,
      });

    } catch (error) {
      console.error(`Error processing review ${review.id}:`, error);
    }
  }

  console.log(`🔍 Found ${lowPrecisionMarkers.length} low precision markers (precision < ${precisionThreshold})`);
  console.log(`📸 ${lowPrecisionMarkers.filter(m => m.hasPhotos).length} have photos available for GPS correction`);

  return lowPrecisionMarkers;
}

/**
 * Extract photo URLs from a review event
 */
function extractPhotoUrls(review: NostrEvent): string[] {
  const photoUrls: string[] = [];

  // Check for image tags
  const imageTags = review.tags.filter(([name]) => name === 'image');
  photoUrls.push(...imageTags.map(([, url]) => url));

  // Check for imeta tags (NIP-94)
  const imetaTags = review.tags.filter(([name]) => name === 'imeta');
  for (const [, imetaValue] of imetaTags) {
    const urlMatch = imetaValue.match(/url\s+(.+)/);
    if (urlMatch) {
      photoUrls.push(urlMatch[1]);
    }
  }

  // Check content for image URLs
  const urlRegex = /https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|heic|heif)/gi;
  const contentUrls = review.content.match(urlRegex) || [];
  photoUrls.push(...contentUrls);

  return [...new Set(photoUrls)]; // Remove duplicates
}

/**
 * Correct a low precision marker using GPS data from photos
 */
export async function correctMarkerWithPhotoGps(
  marker: LowPrecisionMarker,
  targetPrecision: number = 8
): Promise<PhotoGpsCorrection | null> {
  if (!marker.hasPhotos || marker.photoUrls.length === 0) {
    console.log(`No photos available for marker ${marker.reviewId}`);
    return null;
  }

  console.log(`🔧 Attempting GPS correction for marker ${marker.reviewId} using ${marker.photoUrls.length} photos`);

  // Try to extract GPS from each photo
  for (const photoUrl of marker.photoUrls) {
    try {
      console.log(`📸 Processing photo: ${photoUrl}`);

      // Fetch the photo
      const response = await fetch(photoUrl);
      if (!response.ok) {
        console.warn(`Failed to fetch photo: ${response.status}`);
        continue;
      }

      const blob = await response.blob();
      const file = new File([blob], 'photo.jpg', { type: blob.type });

      // Extract GPS coordinates
      const gpsCoordinates = await extractGPSFromImage(file);

      if (!gpsCoordinates) {
        console.log(`No GPS data found in photo: ${photoUrl}`);
        continue;
      }

      console.log(`✅ GPS coordinates extracted: ${gpsCoordinates.latitude}, ${gpsCoordinates.longitude}`);

      // Track the correction process
      trackCoordinates('ORIGINAL_MARKER', marker.coordinates.lat, marker.coordinates.lng, `Low precision marker (${marker.precision})`);
      trackCoordinates('PHOTO_GPS_EXTRACTED', gpsCoordinates.latitude, gpsCoordinates.longitude, `Photo: ${photoUrl}`);

      // Calculate distance between original and photo GPS
      const distanceCorrection = calculateDistance(
        marker.coordinates.lat,
        marker.coordinates.lng,
        gpsCoordinates.latitude,
        gpsCoordinates.longitude
      );

      // Generate corrected geohash
      const correctedGeohash = geohash.encode(gpsCoordinates.latitude, gpsCoordinates.longitude, targetPrecision);

      trackCoordinates('CORRECTED_MARKER', gpsCoordinates.latitude, gpsCoordinates.longitude, `Corrected with precision ${targetPrecision}`);

      // Calculate confidence based on distance and precision improvement
      const confidence = calculateCorrectionConfidence(marker.precision, targetPrecision, distanceCorrection);

      const accuracyMap: Record<number, string> = {
        1: "±2500 km", 2: "±630 km", 3: "±78 km", 4: "±20 km", 5: "±2.4 km",
        6: "±610 m", 7: "±76 m", 8: "±19 m", 9: "±2.4 m", 10: "±60 cm",
      };

      const correction: PhotoGpsCorrection = {
        reviewId: marker.reviewId,
        originalGeohash: marker.geohash,
        originalPrecision: marker.precision,
        originalCoordinates: marker.coordinates,
        photoGpsCoordinates: gpsCoordinates,
        correctedGeohash,
        correctedPrecision: targetPrecision,
        accuracyImprovement: `${marker.accuracy} → ${accuracyMap[targetPrecision]}`,
        distanceCorrection,
        confidence,
        photoSource: photoUrl,
      };

      console.log(`🎯 GPS correction successful:`, {
        reviewId: marker.reviewId,
        distanceCorrection: `${distanceCorrection.toFixed(2)}m`,
        precisionImprovement: `${marker.precision} → ${targetPrecision}`,
        confidence: `${(confidence * 100).toFixed(1)}%`,
      });

      return correction;

    } catch (error) {
      console.error(`Error processing photo ${photoUrl}:`, error);
      continue;
    }
  }

  console.log(`❌ No GPS data could be extracted from any photos for marker ${marker.reviewId}`);
  return null;
}

/**
 * Batch correct multiple low precision markers
 */
export async function batchCorrectMarkers(
  markers: LowPrecisionMarker[],
  maxCorrections: number = 10,
  targetPrecision: number = 8
): Promise<PhotoGpsCorrection[]> {
  console.log(`🚀 Starting batch GPS correction for up to ${maxCorrections} markers...`);

  // Filter markers that have photos and prioritize by lowest precision
  const candidateMarkers = markers
    .filter(marker => marker.hasPhotos)
    .sort((a, b) => a.precision - b.precision) // Lowest precision first
    .slice(0, maxCorrections);

  console.log(`📸 Processing ${candidateMarkers.length} markers with photos`);

  const corrections: PhotoGpsCorrection[] = [];

  for (const marker of candidateMarkers) {
    try {
      const correction = await correctMarkerWithPhotoGps(marker, targetPrecision);
      if (correction) {
        corrections.push(correction);
      }
    } catch (error) {
      console.error(`Error correcting marker ${marker.reviewId}:`, error);
    }
  }

  console.log(`✅ Successfully corrected ${corrections.length} markers using photo GPS data`);

  return corrections;
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Calculate confidence score for a GPS correction
 */
function calculateCorrectionConfidence(
  originalPrecision: number,
  targetPrecision: number,
  distanceCorrection: number
): number {
  // Base confidence from precision improvement
  const precisionImprovement = targetPrecision - originalPrecision;
  let confidence = Math.min(precisionImprovement / 5, 1); // Max confidence from precision

  // Reduce confidence if the correction distance is very large
  if (distanceCorrection > 10000) { // > 10km
    confidence *= 0.3;
  } else if (distanceCorrection > 1000) { // > 1km
    confidence *= 0.6;
  } else if (distanceCorrection > 100) { // > 100m
    confidence *= 0.8;
  }

  // Increase confidence for reasonable corrections
  if (distanceCorrection < 50 && precisionImprovement >= 2) {
    confidence = Math.min(confidence * 1.2, 1);
  }

  return Math.max(0, Math.min(1, confidence));
}

/**
 * Apply GPS corrections to location data
 */
export function applyGpsCorrections<T extends {
  id: string;
  lat: number;
  lng: number;
  precision?: number;
  accuracy?: string;
}>(
  locations: T[],
  corrections: PhotoGpsCorrection[]
): (T & { gpscorrected?: boolean; correctionConfidence?: number })[] {
  const correctionMap = new Map(corrections.map(c => [c.reviewId, c]));

  return locations.map(location => {
    const correction = correctionMap.get(location.id);

    if (correction && correction.confidence > 0.5) { // Only apply high-confidence corrections
      return {
        ...location,
        lat: correction.photoGpsCoordinates.latitude,
        lng: correction.photoGpsCoordinates.longitude,
        precision: correction.correctedPrecision,
        accuracy: correction.accuracyImprovement.split(' → ')[1],
        gpsCorreected: true,
        correctionConfidence: correction.confidence,
      };
    }

    return location;
  });
}

/**
 * Get GPS correction statistics
 */
export function getGpsCorrectionStats(corrections: PhotoGpsCorrection[]): {
  totalCorrections: number;
  averageDistanceCorrection: number;
  averageConfidence: number;
  precisionDistribution: Record<string, number>;
  highConfidenceCorrections: number;
} {
  if (corrections.length === 0) {
    return {
      totalCorrections: 0,
      averageDistanceCorrection: 0,
      averageConfidence: 0,
      precisionDistribution: {},
      highConfidenceCorrections: 0,
    };
  }

  const totalDistance = corrections.reduce((sum, c) => sum + c.distanceCorrection, 0);
  const totalConfidence = corrections.reduce((sum, c) => sum + c.confidence, 0);
  const highConfidenceCorrections = corrections.filter(c => c.confidence > 0.7).length;

  const precisionDistribution: Record<string, number> = {};
  corrections.forEach(correction => {
    const key = `${correction.originalPrecision} → ${correction.correctedPrecision}`;
    precisionDistribution[key] = (precisionDistribution[key] || 0) + 1;
  });

  return {
    totalCorrections: corrections.length,
    averageDistanceCorrection: totalDistance / corrections.length,
    averageConfidence: totalConfidence / corrections.length,
    precisionDistribution,
    highConfidenceCorrections,
  };
}