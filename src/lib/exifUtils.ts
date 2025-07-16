import { parse as parseExif } from 'exifr';
import { trackCoordinates, verifyCoordinateSystem, testGeohashRoundTrip } from './coordinateVerification';
import { validateCoordinates, suggestCoordinateCorrections, isReasonableLocation } from './coordinateValidation';

export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

/**
 * Convert DMS (Degrees, Minutes, Seconds) to decimal degrees
 * Handles various DMS formats from different cameras
 */
function dmsToDecimal(dms: number[] | number): number | null {
  if (typeof dms === 'number') {
    return dms; // Already decimal
  }

  if (!Array.isArray(dms) || dms.length < 1) {
    return null;
  }

  const degrees = dms[0] || 0;
  const minutes = dms[1] || 0;
  const seconds = dms[2] || 0;

  // Convert to decimal degrees
  const decimal = degrees + minutes/60 + seconds/3600;

  console.log(`📐 DMS to Decimal: [${dms.join(', ')}] → ${decimal}`);

  return decimal;
}

/**
 * Extract GPS coordinates from image file EXIF data
 * Handles multiple GPS data formats and coordinate systems
 */
export async function extractGPSFromImage(file: File): Promise<GPSCoordinates | null> {
  try {
    console.log('🔍 Starting GPS extraction for file:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Strategy 1: Try with full GPS extraction (iPhone compatible)
    console.log('📱 Trying iPhone-compatible GPS extraction...');
    let exifData = await parseExif(file, {
      gps: true,
      mergeOutput: true,
      translateKeys: true,
      translateValues: true,
      reviveValues: true,
    });

    console.log('📊 Strategy 1 EXIF data:', exifData);

    // If no GPS data found, try alternative parsing
    if (!exifData || (!exifData.latitude && !exifData.GPSLatitude && !exifData.GPS)) {
      console.log('🔄 Trying alternative parsing strategy...');
      exifData = await parseExif(file, {
        gps: true,
        mergeOutput: false,
        translateKeys: false,
        translateValues: false,
        reviveValues: false,
        sanitize: false,
      });
      console.log('📊 Strategy 2 EXIF data:', exifData);
    }

    // If still no GPS data, try extracting everything
    if (!exifData || (!exifData.latitude && !exifData.GPSLatitude && !exifData.GPS)) {
      console.log('🔄 Trying comprehensive extraction...');
      exifData = await parseExif(file);
      console.log('📊 Strategy 3 EXIF data (full):', exifData);
    }

    console.log('Raw EXIF data:', exifData);

    if (!exifData) {
      console.log('No EXIF data found in image');
      return null;
    }

    // Log all available keys for debugging
    console.log('Available EXIF keys:', Object.keys(exifData));

    let latitude: number | null = null;
    let longitude: number | null = null;

    // Method 1: Direct latitude/longitude fields (most common with processed images)
    if (typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number') {
      latitude = exifData.latitude;
      longitude = exifData.longitude;
      console.log('✅ GPS found via direct fields:', { latitude, longitude });
    }

    // Method 2: Top-level GPS fields (iPhone format)
    else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      console.log('iPhone-style GPS fields found:', {
        GPSLatitude: exifData.GPSLatitude,
        GPSLongitude: exifData.GPSLongitude,
        GPSLatitudeRef: exifData.GPSLatitudeRef,
        GPSLongitudeRef: exifData.GPSLongitudeRef
      });

      // Handle different formats using helper function
      latitude = dmsToDecimal(exifData.GPSLatitude);
      longitude = dmsToDecimal(exifData.GPSLongitude);

      // Apply hemisphere direction (iPhone typically includes this)
      if (exifData.GPSLatitudeRef === 'S' && latitude !== null) {
        latitude = -latitude;
      }
      if (exifData.GPSLongitudeRef === 'W' && longitude !== null) {
        longitude = -longitude;
      }

      console.log('✅ GPS found via iPhone-style GPS fields:', {
        latitude,
        longitude,
        latRef: exifData.GPSLatitudeRef,
        lonRef: exifData.GPSLongitudeRef
      });
    }

    // Method 3: GPS object with detailed fields (raw camera data)
    else if (exifData.GPS && typeof exifData.GPS === 'object') {
      const gps = exifData.GPS;
      console.log('GPS object found:', gps);
      console.log('GPS object keys:', Object.keys(gps));

      // Handle GPSLatitude and GPSLongitude arrays (DMS format)
      if (gps.GPSLatitude && gps.GPSLongitude) {
        // Convert using helper function
        latitude = dmsToDecimal(gps.GPSLatitude);
        longitude = dmsToDecimal(gps.GPSLongitude);

        // Apply hemisphere direction
        if (gps.GPSLatitudeRef === 'S' && latitude !== null) {
          latitude = -latitude;
        }
        if (gps.GPSLongitudeRef === 'W' && longitude !== null) {
          longitude = -longitude;
        }

        console.log('✅ GPS found via GPS object (DMS converted):', {
          latitude,
          longitude,
          latRef: gps.GPSLatitudeRef,
          lonRef: gps.GPSLongitudeRef
        });
      }
    }

    // Validate coordinates
    if (latitude !== null && longitude !== null &&
        !isNaN(latitude) && !isNaN(longitude) &&
        latitude >= -90 && latitude <= 90 &&
        longitude >= -180 && longitude <= 180) {

      console.log('✅ Valid GPS coordinates extracted:', { latitude, longitude });

      // Validate coordinates for common issues
      const validation = validateCoordinates(latitude, longitude);
      if (!validation.isValid || validation.issues.length > 0) {
        console.warn('⚠️ Coordinate validation issues:', validation.issues);

        if (validation.corrected) {
          console.log('🔧 Suggested correction:', validation.corrected);
        }

        const suggestions = suggestCoordinateCorrections(latitude, longitude);
        console.log('💡 Alternative interpretations:', suggestions);
      }

      // Check if location is reasonable
      const locationCheck = isReasonableLocation(latitude, longitude);
      if (!locationCheck.reasonable) {
        console.warn('🌍 Location reasonableness check:', locationCheck);
      }

      // Track coordinates and verify system
      trackCoordinates('EXIF_EXTRACTION', latitude, longitude, `${file.name} (${file.type})`);
      verifyCoordinateSystem(latitude, longitude);
      testGeohashRoundTrip(latitude, longitude, 8);

      return { latitude, longitude };
    } else {
      console.log('❌ No valid GPS coordinates found. Values:', { latitude, longitude });
      return null;
    }

  } catch (error) {
    console.error('❌ Error extracting GPS from EXIF:', error);
    return null;
  }
}

/**
 * Check if a file likely contains EXIF data based on file type and size
 */
export function canContainEXIF(file: File): boolean {
  // iPhone and most cameras use JPEG, some use HEIC (but HEIC support varies)
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/tiff',
    'image/tif',
    'image/heic',  // iPhone HEIC format
    'image/heif'   // HEIF format
  ];

  const hasValidType = supportedTypes.includes(file.type.toLowerCase()) ||
                      file.name.toLowerCase().endsWith('.jpg') ||
                      file.name.toLowerCase().endsWith('.jpeg') ||
                      file.name.toLowerCase().endsWith('.heic') ||
                      file.name.toLowerCase().endsWith('.heif');

  const hasReasonableSize = file.size > 1024; // At least 1KB

  console.log('EXIF compatibility check:', {
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    hasValidType,
    hasReasonableSize,
    canContainEXIF: hasValidType && hasReasonableSize,
    note: file.name.toLowerCase().includes('heic') ? 'HEIC format detected - GPS extraction may vary by browser' : ''
  });

  return hasValidType && hasReasonableSize;
}