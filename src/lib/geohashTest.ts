import * as geohash from 'ngeohash';

/**
 * Test geohash encoding/decoding accuracy
 */
export function testGeohashAccuracy() {
  const testCoordinates = [
    { lat: 40.7128, lng: -74.0060, name: "New York City" },
    { lat: 51.5074, lng: -0.1278, name: "London" },
    { lat: 35.6762, lng: 139.6503, name: "Tokyo" },
    { lat: -33.8688, lng: 151.2093, name: "Sydney" },
  ];

  console.log('🧪 Testing geohash accuracy at different precisions:');
  
  for (const coord of testCoordinates) {
    console.log(`\n📍 Testing ${coord.name}: lat=${coord.lat}, lng=${coord.lng}`);
    
    for (let precision = 5; precision <= 10; precision++) {
      const encoded = geohash.encode(coord.lat, coord.lng, precision);
      const decoded = geohash.decode(encoded);
      
      const latDiff = Math.abs(coord.lat - decoded.latitude);
      const lngDiff = Math.abs(coord.lng - decoded.longitude);
      const distanceKm = calculateDistance(coord.lat, coord.lng, decoded.latitude, decoded.longitude);
      
      console.log(`  Precision ${precision}: ${encoded} → lat=${decoded.latitude.toFixed(8)}, lng=${decoded.longitude.toFixed(8)}`);
      console.log(`    Differences: lat=${latDiff.toFixed(8)}, lng=${lngDiff.toFixed(8)}, distance=${distanceKm.toFixed(3)}km`);
    }
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
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
 * Get geohash precision recommendations
 */
export function getGeohashPrecisionInfo() {
  const precisionInfo = [
    { precision: 1, accuracy: "±2500 km", description: "Country level" },
    { precision: 2, accuracy: "±630 km", description: "Large region" },
    { precision: 3, accuracy: "±78 km", description: "City level" },
    { precision: 4, accuracy: "±20 km", description: "District level" },
    { precision: 5, accuracy: "±2.4 km", description: "Neighborhood" },
    { precision: 6, accuracy: "±610 m", description: "Village/Town" },
    { precision: 7, accuracy: "±76 m", description: "Street level" },
    { precision: 8, accuracy: "±19 m", description: "Building level" },
    { precision: 9, accuracy: "±2.4 m", description: "Room level" },
    { precision: 10, accuracy: "±60 cm", description: "Very precise" },
  ];
  
  console.log('📏 Geohash precision levels:');
  precisionInfo.forEach(info => {
    console.log(`  ${info.precision}: ${info.accuracy} (${info.description})`);
  });
  
  return precisionInfo;
}