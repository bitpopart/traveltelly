import L from 'leaflet';

// Custom marker icons using Leaflet DivIcon for better customization
// These create colorful, distinctive markers instead of the default blue pins

// Custom SVG marker as data URL with shadow (blue marker with star)
const mainMarkerSvg = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.12 113.81">
  <defs>
    <style>
      .cls-1 {
        fill: #fc0;
      }
      .cls-2 {
        fill: #fff;
      }
      .cls-3 {
        fill: #27b0ff;
      }
    </style>
  </defs>
  <circle class="cls-2" cx="36.31" cy="49.53" r="19.75"/>
  <path class="cls-3" d="M36.31,13.09C15.67,13.09,0,31.41,0,50.14c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67,0-18.72-15.67-37.04-36.3-37.04ZM36.31,66.6c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"/>
  <path class="cls-1" d="M57.95,26.65l11.24,8.18-4.3-13.2,11.24-8h-13.78L57.95,0l-4.39,13.63h-13.78l11.24,8-4.3,13.2,11.24-8.18Z"/>
</svg>`)}`;

// Main marker icon using custom SVG (blue with yellow star)
export const mainMarkerIcon = L.icon({
  iconUrl: mainMarkerSvg,
  iconSize: [42, 62],
  iconAnchor: [21, 62],
  popupAnchor: [0, -62],
  shadowUrl: undefined,
  shadowSize: undefined,
  shadowAnchor: undefined,
});

console.log('🎯 Main marker icon created (inline SVG)');

export const createCustomIcon = (options?: {
  color?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}) => {
  const color = options?.color || '#f59e0b'; // Default amber color
  const icon = options?.icon || '📍';
  const sizeClass = options?.size || 'medium';
  
  const sizeMap = {
    small: 'w-8 h-8 text-xl',
    medium: 'w-10 h-10 text-2xl',
    large: 'w-12 h-12 text-3xl',
  };
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center ${sizeMap[sizeClass]}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
        <svg class="absolute w-full h-full" viewBox="0 0 24 36" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.4 0 0 5.4 0 12c0 8.4 12 24 12 24s12-15.6 12-24c0-6.6-5.4-12-12-12z"/>
        </svg>
        <span class="relative z-10 -mt-2" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));">${icon}</span>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Predefined icon types for different categories
export const markerIcons = {
  default: createCustomIcon({ color: '#f59e0b', icon: '📍' }),
  photo: createCustomIcon({ color: '#3b82f6', icon: '📷' }),
  location: createCustomIcon({ color: '#10b981', icon: '📍' }),
  food: createCustomIcon({ color: '#ef4444', icon: '🍽️' }),
  hotel: createCustomIcon({ color: '#8b5cf6', icon: '🏨' }),
  activity: createCustomIcon({ color: '#f59e0b', icon: '🎯' }),
  shop: createCustomIcon({ color: '#ec4899', icon: '🛍️' }),
  nature: createCustomIcon({ color: '#059669', icon: '🌲' }),
  culture: createCustomIcon({ color: '#7c3aed', icon: '🏛️' }),
  selected: mainMarkerIcon, // Use custom SVG for main/selected marker
};

// Get icon based on category
export const getIconByCategory = (category?: string): L.DivIcon | L.Icon => {
  if (!category) return markerIcons.default;
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('photo') || categoryLower.includes('image')) {
    return markerIcons.photo;
  }
  if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('cafe')) {
    return markerIcons.food;
  }
  if (categoryLower.includes('hotel') || categoryLower.includes('accommodation')) {
    return markerIcons.hotel;
  }
  if (categoryLower.includes('shop') || categoryLower.includes('store')) {
    return markerIcons.shop;
  }
  if (categoryLower.includes('nature') || categoryLower.includes('park') || categoryLower.includes('outdoor')) {
    return markerIcons.nature;
  }
  if (categoryLower.includes('culture') || categoryLower.includes('museum') || categoryLower.includes('historical')) {
    return markerIcons.culture;
  }
  if (categoryLower.includes('activity') || categoryLower.includes('entertainment')) {
    return markerIcons.activity;
  }
  
  return markerIcons.location;
};
