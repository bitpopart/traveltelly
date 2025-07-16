import * as geohash from 'ngeohash';

export interface CoordinateVerification {
  step: string;
  coordinates: { lat: number; lng: number };
  timestamp: number;
  source: string;
}

// Global coordinate tracking for debugging
let coordinateHistory: CoordinateVerification[] = [];

/**
 * Track coordinates at each step of the process
 */
export function trackCoordinates(
  step: string,
  lat: number,
  lng: number,
  source: string = 'unknown'
): void {
  const verification: CoordinateVerification = {
    step,
    coordinates: { lat, lng },
    timestamp: Date.now(),
    source
  };

  coordinateHistory.push(verification);

  console.log(`🔍 COORDINATE TRACKING [${step}]:`, {
    lat: lat.toFixed(8),
    lng: lng.toFixed(8),
    source,
    timestamp: new Date(verification.timestamp).toISOString()
  });
}

/**
 * Get the complete coordinate history
 */
export function getCoordinateHistory(): CoordinateVerification[] {
  return [...coordinateHistory];
}

/**
 * Clear coordinate history
 */
export function clearCoordinateHistory(): void {
  coordinateHistory = [];
  console.log('🧹 Coordinate history cleared');
}

/**
 * Analyze coordinate drift between steps
 */
export function analyzeCoordinateDrift(): void {
  if (coordinateHistory.length < 2) {
    console.log('📊 Not enough coordinate data for drift analysis');
    return;
  }

  console.log('📊 COORDINATE DRIFT ANALYSIS:');
  console.log('=====================================');

  for (let i = 1; i < coordinateHistory.length; i++) {
    const prev = coordinateHistory[i - 1];
    const curr = coordinateHistory[i];

    const latDiff = Math.abs(curr.coordinates.lat - prev.coordinates.lat);
    const lngDiff = Math.abs(curr.coordinates.lng - prev.coordinates.lng);
    const distance = calculateDistance(
      prev.coordinates.lat,
      prev.coordinates.lng,
      curr.coordinates.lat,
      curr.coordinates.lng
    );

    console.log(`${prev.step} → ${curr.step}:`);
    console.log(`  Lat drift: ${latDiff.toFixed(8)}° (${(latDiff * 111000).toFixed(2)}m)`);
    console.log(`  Lng drift: ${lngDiff.toFixed(8)}° (${(lngDiff * 111000 * Math.cos(curr.coordinates.lat * Math.PI / 180)).toFixed(2)}m)`);
    console.log(`  Total distance: ${distance.toFixed(2)}m`);
    console.log(`  Time elapsed: ${curr.timestamp - prev.timestamp}ms`);
    console.log('');
  }

  // Overall drift
  const first = coordinateHistory[0];
  const last = coordinateHistory[coordinateHistory.length - 1];
  const totalDistance = calculateDistance(
    first.coordinates.lat,
    first.coordinates.lng,
    last.coordinates.lat,
    last.coordinates.lng
  );

  console.log(`🎯 TOTAL DRIFT: ${totalDistance.toFixed(2)}m`);
  console.log(`   From: ${first.step} (${first.coordinates.lat.toFixed(8)}, ${first.coordinates.lng.toFixed(8)})`);
  console.log(`   To: ${last.step} (${last.coordinates.lat.toFixed(8)}, ${last.coordinates.lng.toFixed(8)})`);
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
 * Test geohash round-trip accuracy
 */
export function testGeohashRoundTrip(lat: number, lng: number, precision: number = 8): {
  original: { lat: number; lng: number };
  encoded: string;
  decoded: { lat: number; lng: number };
  error: number;
} {
  console.log('🔄 GEOHASH ROUND-TRIP TEST:');
  console.log(`Original: lat=${lat.toFixed(8)}, lng=${lng.toFixed(8)}`);

  const encoded = geohash.encode(lat, lng, precision);
  console.log(`Encoded (precision ${precision}): ${encoded}`);

  const decoded = geohash.decode(encoded);
  console.log(`Decoded: lat=${decoded.latitude.toFixed(8)}, lng=${decoded.longitude.toFixed(8)}`);

  const distance = calculateDistance(lat, lng, decoded.latitude, decoded.longitude);
  console.log(`Round-trip error: ${distance.toFixed(2)}m`);

  return {
    original: { lat, lng },
    encoded,
    decoded: { lat: decoded.latitude, lng: decoded.longitude },
    error: distance
  };
}

/**
 * Verify coordinate system consistency
 */
export function verifyCoordinateSystem(lat: number, lng: number): void {
  console.log('🌍 COORDINATE SYSTEM VERIFICATION:');

  // Check if coordinates are in valid ranges
  const validLat = lat >= -90 && lat <= 90;
  const validLng = lng >= -180 && lng <= 180;

  console.log(`Latitude ${lat}: ${validLat ? '✅ Valid' : '❌ Invalid'} (range: -90 to 90)`);
  console.log(`Longitude ${lng}: ${validLng ? '✅ Valid' : '❌ Invalid'} (range: -180 to 180)`);

  // Determine hemisphere
  const latHemisphere = lat >= 0 ? 'North' : 'South';
  const lngHemisphere = lng >= 0 ? 'East' : 'West';

  console.log(`Location: ${latHemisphere} ${Math.abs(lat).toFixed(6)}°, ${lngHemisphere} ${Math.abs(lng).toFixed(6)}°`);

  // Rough location identification
  if (validLat && validLng) {
    let region = 'Unknown';
    if (lat > 24 && lat < 50 && lng > -125 && lng < -66) region = 'Continental US';
    else if (lat > 49 && lat < 60 && lng > -141 && lng < -52) region = 'Canada';
    else if (lat > 35 && lat < 71 && lng > -10 && lng < 40) region = 'Europe';
    else if (lat > -35 && lat < 37 && lng > 113 && lng < 154) region = 'Australia';
    else if (lat > 20 && lat < 46 && lng > 122 && lng < 146) region = 'Japan';

    console.log(`Estimated region: ${region}`);
  }
}