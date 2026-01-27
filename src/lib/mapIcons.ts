import L from 'leaflet';

// Custom marker icons using Leaflet DivIcon for better customization
// These create colorful, distinctive markers instead of the default blue pins

// Custom SVG marker as data URL for better loading
const mainMarkerSvg = `data:image/svg+xml;base64,${btoa(`<?xml version="1.0" encoding="UTF-8"?>
<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72.61 100.72">
  <defs>
    <style>
      .cls-1 {
        fill: #b2d235;
      }
      .cls-2 {
        fill: #fff;
      }
    </style>
  </defs>
  <circle class="cls-2" cx="36.31" cy="36.44" r="19.75"/>
  <path class="cls-1" d="M36.31,0C15.67,0,0,18.32,0,37.04c0,14.93,36.31,63.67,36.31,63.67,0,0,36.3-48.74,36.3-63.67C72.61,18.32,56.94,0,36.31,0ZM36.31,53.51c-9.19,0-16.64-7.45-16.64-16.64s7.45-16.64,16.64-16.64,16.64,7.45,16.64,16.64-7.45,16.64-16.64,16.64Z"/>
</svg>`)}`;

// Main marker icon using custom SVG
export const mainMarkerIcon = L.icon({
  iconUrl: mainMarkerSvg,
  iconSize: [40, 55],
  iconAnchor: [20, 55],
  popupAnchor: [0, -55],
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
