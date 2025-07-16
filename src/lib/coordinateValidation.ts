/**
 * Coordinate validation and correction utilities
 */

export interface CoordinateIssue {
  type: 'swap' | 'invalid_range' | 'precision_loss' | 'hemisphere_error';
  description: string;
  suggested_fix?: { lat: number; lng: number };
}

/**
 * Validate and analyze coordinate issues
 */
export function validateCoordinates(lat: number, lng: number): {
  isValid: boolean;
  issues: CoordinateIssue[];
  corrected?: { lat: number; lng: number };
} {
  const issues: CoordinateIssue[] = [];
  let corrected: { lat: number; lng: number } | undefined;

  // Check for basic range validity
  if (lat < -90 || lat > 90) {
    issues.push({
      type: 'invalid_range',
      description: `Latitude ${lat} is outside valid range (-90 to 90)`,
    });
  }

  if (lng < -180 || lng > 180) {
    issues.push({
      type: 'invalid_range',
      description: `Longitude ${lng} is outside valid range (-180 to 180)`,
    });
  }

  // Check for potential lat/lng swap
  // This is a common issue where latitude and longitude are accidentally swapped
  if (Math.abs(lng) <= 90 && Math.abs(lat) <= 180 && (Math.abs(lat) > 90 || Math.abs(lng) > 90)) {
    issues.push({
      type: 'swap',
      description: 'Coordinates may be swapped (lat/lng reversed)',
      suggested_fix: { lat: lng, lng: lat },
    });
    corrected = { lat: lng, lng: lat };
  }

  // Check for precision loss (too many decimal places or too few)
  const latPrecision = getDecimalPlaces(lat);
  const lngPrecision = getDecimalPlaces(lng);

  if (latPrecision < 4 || lngPrecision < 4) {
    issues.push({
      type: 'precision_loss',
      description: `Low precision coordinates (lat: ${latPrecision} decimals, lng: ${lngPrecision} decimals). May cause location inaccuracy.`,
    });
  }

  // Check for potential hemisphere errors
  // If coordinates are very close to 0,0 (Gulf of Guinea), it might be a hemisphere error
  if (Math.abs(lat) < 1 && Math.abs(lng) < 1 && (lat !== 0 || lng !== 0)) {
    issues.push({
      type: 'hemisphere_error',
      description: 'Coordinates very close to 0,0. Check if hemisphere references (N/S/E/W) are correct.',
    });
  }

  const isValid = issues.filter(issue => issue.type === 'invalid_range').length === 0;

  return {
    isValid,
    issues,
    corrected,
  };
}

/**
 * Get number of decimal places in a number
 */
function getDecimalPlaces(num: number): number {
  const str = num.toString();
  if (str.indexOf('.') === -1) return 0;
  return str.split('.')[1].length;
}

/**
 * Suggest coordinate corrections based on common issues
 */
export function suggestCoordinateCorrections(lat: number, lng: number): {
  original: { lat: number; lng: number };
  suggestions: Array<{
    type: string;
    coordinates: { lat: number; lng: number };
    description: string;
    confidence: number;
  }>;
} {
  const suggestions: Array<{
    type: string;
    coordinates: { lat: number; lng: number };
    description: string;
    confidence: number;
  }> = [];

  // Suggestion 1: Swap lat/lng
  if (Math.abs(lng) <= 90 && Math.abs(lat) <= 180) {
    suggestions.push({
      type: 'swap',
      coordinates: { lat: lng, lng: lat },
      description: 'Swap latitude and longitude',
      confidence: Math.abs(lat) > 90 ? 0.9 : 0.3,
    });
  }

  // Suggestion 2: Fix hemisphere (negate coordinates)
  suggestions.push({
    type: 'negate_lat',
    coordinates: { lat: -lat, lng },
    description: 'Negate latitude (opposite hemisphere)',
    confidence: 0.2,
  });

  suggestions.push({
    type: 'negate_lng',
    coordinates: { lat, lng: -lng },
    description: 'Negate longitude (opposite hemisphere)',
    confidence: 0.2,
  });

  suggestions.push({
    type: 'negate_both',
    coordinates: { lat: -lat, lng: -lng },
    description: 'Negate both coordinates',
    confidence: 0.1,
  });

  return {
    original: { lat, lng },
    suggestions: suggestions.sort((a, b) => b.confidence - a.confidence),
  };
}

/**
 * Check if coordinates represent a reasonable location
 */
export function isReasonableLocation(lat: number, lng: number): {
  reasonable: boolean;
  issues: string[];
  location_type: 'land' | 'ocean' | 'polar' | 'unknown';
} {
  const issues: string[] = [];
  let location_type: 'land' | 'ocean' | 'polar' | 'unknown' = 'unknown';

  // Check for polar regions (less likely for user photos)
  if (Math.abs(lat) > 80) {
    issues.push('Location is in polar region (very unlikely for user photos)');
    location_type = 'polar';
  }

  // Check for middle of ocean (less likely for user photos)
  // This is a very rough check - in a real app you'd use a proper land/ocean dataset
  const isLikelyOcean = (
    // Pacific Ocean
    (lat > -60 && lat < 60 && lng > -180 && lng < -120 && !(lat > 30 && lng > -130)) ||
    // Atlantic Ocean
    (lat > -60 && lat < 60 && lng > -60 && lng < 20 && !(lat > 0 && lng > -20)) ||
    // Indian Ocean
    (lat > -60 && lat < 30 && lng > 20 && lng < 120)
  );

  if (isLikelyOcean) {
    issues.push('Location appears to be in ocean (unusual for user photos)');
    location_type = 'ocean';
  } else {
    location_type = 'land';
  }

  // Check for null island (0,0)
  if (lat === 0 && lng === 0) {
    issues.push('Coordinates are exactly 0,0 (Null Island) - likely a GPS error');
  }

  return {
    reasonable: issues.length === 0,
    issues,
    location_type,
  };
}