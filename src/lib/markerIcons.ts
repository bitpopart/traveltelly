import { Icon } from 'leaflet';

/**
 * Creates a custom review marker icon with rating display and precision indicators
 * 
 * @param rating - The rating value (1-5) to display on the marker
 * @param precision - Optional geohash precision value
 * @param upgraded - Whether this review was upgraded (shows blue indicator)
 * @param gpsCorreected - Whether this review was GPS corrected (shows green indicator)
 * @param category - Optional category to determine special marker icons (e.g., 'cafe')
 * @returns Leaflet Icon instance
 */
export const createReviewMarkerIcon = (
  rating: number,
  precision?: number,
  upgraded?: boolean,
  gpsCorreected?: boolean,
  category?: string
): Icon => {
  // Check if this is a cafe or restaurant category - use special markers (handles both 'cafe' and 'café')
  const normalizedCategory = category?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const isCafe = normalizedCategory === 'cafe';
  const isRestaurant = normalizedCategory === 'restaurant';
  
  // Enhanced logging for cafe detection
  if (category) {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes('caf') || lowerCategory.includes('café')) {
      console.log('☕ CAFE MARKER CHECK:', { 
        originalCategory: category,
        lowerCase: lowerCategory,
        normalizedCategory, 
        matches: normalizedCategory === 'cafe',
        rating
      });
    }
    if (lowerCategory.includes('restaurant')) {
      console.log('🍽️ RESTAURANT MARKER CHECK:', { 
        originalCategory: category,
        lowerCase: lowerCategory,
        normalizedCategory, 
        matches: normalizedCategory === 'restaurant',
        rating
      });
    }
  }
  
  if (isCafe) {
    console.log('✅ YES - Creating CAFE marker with coffee cup for rating:', rating);
    return createCafeMarkerIcon(rating, precision, upgraded, gpsCorreected);
  }
  
  if (isRestaurant) {
    console.log('✅ YES - Creating RESTAURANT marker with fork and knife for rating:', rating);
    return createRestaurantMarkerIcon(rating, precision, upgraded, gpsCorreected);
  }

  // Use blue color for review markers
  const mainColor = '#27b0ff';
  const starColor = '#fc0'; // Yellow star
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    // GPS corrected reviews get a green indicator with camera icon
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    // Upgraded reviews get a blue indicator
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    // Low precision reviews get a red dashed border
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  // Use the custom review marker shape with star and shadow
  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${mainColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          <path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/>
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating custom icon:', error);
    // Fallback to review marker with star and shadow
    const fallbackSvg = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg"><defs><filter id="shadow"><feGaussianBlur in="SourceAlpha" stdDeviation="2"/><feOffset dx="0" dy="2"/><feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#shadow)"><circle cx="36.31" cy="49.53" r="19.75" fill="white"/><path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04Z" fill="${mainColor}"/><path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/></g></svg>`;
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(fallbackSvg)}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  }
};

/**
 * Creates a special cafe marker icon with coffee cup symbol
 */
function createCafeMarkerIcon(
  rating: number,
  precision?: number,
  upgraded?: boolean,
  gpsCorreected?: boolean
): Icon {
  const mainColor = '#27b0ff';
  const starColor = '#fc0'; // Yellow star
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  // Cafe marker with coffee cup icon
  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${mainColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          <path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/>
          <g>
            <path fill="white" d="M29.3,73.99h15.13c3.34.19,5.26,4.02,3.47,6.87-.86,1.37-2.49,2.21-4.11,2.16-.02.3.02.62,0,.91-.08,1.21-.95,2.2-2.17,2.31h-10.18c-.92-.03-2.15-1.17-2.15-2.09v-10.17ZM43.8,81.14c1.08.12,2.2-.36,2.71-1.35.58-1.12.29-2.61-.67-3.42-.58-.49-1.31-.55-2.03-.53v5.3Z"/>
            <path fill="white" d="M45.78,90.43h-18.66c-.72,0-1.31-.59-1.31-1.31s.59-1.31,1.31-1.31h18.66c.72,0,1.31.59,1.31,1.31s-.59,1.31-1.31,1.31Z"/>
          </g>
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating cafe marker icon:', error);
    // Fallback to standard review marker
    return createReviewMarkerIcon(rating, precision, upgraded, gpsCorreected);
  }
}

/**
 * Creates a special restaurant marker icon with fork and knife symbol
 */
function createRestaurantMarkerIcon(
  rating: number,
  precision?: number,
  upgraded?: boolean,
  gpsCorreected?: boolean
): Icon {
  const mainColor = '#27b0ff';
  const starColor = '#fc0'; // Yellow star
  const ratingColor = rating >= 4 ? '#22c55e' : rating >= 3 ? '#eab308' : '#ef4444';

  // Add visual indicator for low precision (old reviews) or upgraded reviews
  const isLowPrecision = precision && precision <= 5;
  const isUpgraded = upgraded === true;
  const isGpsCorrected = gpsCorreected === true;

  let strokeColor = mainColor;
  let strokeWidth = '0';
  let strokeDasharray = 'none';
  let indicator = '';

  if (isGpsCorrected) {
    strokeColor = '#10b981';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#10b981"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="12" font-weight="bold" fill="white">📷</text>`;
  } else if (isUpgraded) {
    strokeColor = '#3b82f6';
    strokeWidth = '3';
    strokeDasharray = 'none';
    indicator = `<circle cx="60" cy="20" r="8" fill="#3b82f6"/><text x="60" y="26" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="white">↑</text>`;
  } else if (isLowPrecision) {
    strokeColor = '#ff6b6b';
    strokeWidth = '3';
    strokeDasharray = '5,3';
    indicator = `<circle cx="60" cy="20" r="8" fill="#ff6b6b"/>`;
  }

  // Restaurant marker with fork and knife icon
  const svgString = `<svg viewBox="0 0 76.12 113.81" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="2" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#shadow)">
          <circle cx="36.31" cy="49.53" r="19.75" fill="white"/>
          <path d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"
                fill="${mainColor}"
                stroke="${strokeColor}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDasharray}"/>
          <path d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z" fill="${starColor}"/>
          <g>
            <path fill="white" d="M31.47,71.58v6.26l-.28.15-.64-.45-.16-5.82c-.03-.42-.49-.38-.8-.32-.11.23-.14.47-.16.72-.13,1.8-.16,5.04,0,6.81.08.88.88,1.49,1.51,2.02l.12.29c-.01,1.72-.05,3.45-.13,5.17-.14,3.01-.58,6.13-.68,9.11-.05,1.3-.2,2.82,1.49,3,1.93.21,1.95-1.5,1.91-2.88-.05-1.53-.33-3.21-.41-4.76-.17-3.13-.26-6.26-.42-9.39.1-.79,1.77-1.6,1.78-2.85.02-2.07.02-4.46-.13-6.54-.05-.74-.27-1.08-.94-.52l-.15,6.08-.76.36c-.45-.41-.08-1.05-.06-1.55.03-.8.12-4.22-.08-4.71-.1-.24-.2-.38-.45-.47l-.56.28ZM41.63,72.1c-1.86-1.9-3.57-.11-4.33,1.76-.87,2.14-1.04,5.03.84,6.69.25.22.87.42.94.7l-.8,15.89c.27,1.57,2.46,1.86,3.25.52.51-.86.07-2.75.02-3.79-.2-4.22-.37-8.44-.64-12.66,3.23-1.51,2.9-6.91.72-9.13Z"/>
          </g>
          <text x="36.31" y="57" text-anchor="middle" font-family="Arial" font-size="22" font-weight="bold" fill="${ratingColor}">${rating}</text>
        </g>
        ${indicator}
      </svg>`.replace(/\s+/g, ' ').replace(/[^\x20-\x7E]/g, '').trim();

  try {
    const encodedSvg = btoa(svgString);
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${encodedSvg}`,
      iconSize: [42, 62],
      iconAnchor: [21, 62],
      popupAnchor: [0, -62],
    });
  } catch (error) {
    console.error('Error creating restaurant marker icon:', error);
    // Fallback to standard review marker
    return createReviewMarkerIcon(rating, precision, upgraded, gpsCorreected);
  }
}
