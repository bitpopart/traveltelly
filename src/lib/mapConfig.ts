// Map tile layer configurations - colorful style inspired by BitPopArt

export const getTileLayerConfig = (provider: 'openstreetmap' | 'satellite') => {
  switch (provider) {
    case 'openstreetmap':
      return {
        // Using standard OpenStreetMap tiles - no API key required, never gated
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      };
    case 'satellite':
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
        maxZoom: 19,
      };
    default:
      return {
        // Default to standard OpenStreetMap tiles - no API key required, never gated
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 20,
      };
  }
};
