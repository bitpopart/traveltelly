import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { useEffect } from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import 'leaflet/dist/leaflet.css';

interface PhotoPoint {
  url: string;
  lat: number;
  lon: number;
  timestamp?: number;
  index: number;
}

interface TripMapProps {
  photos: PhotoPoint[];
  className?: string;
}

// Create numbered marker icon
function createNumberedMarker(number: number): Icon {
  const svgString = `<svg viewBox="0 0 40 60" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="shadow">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
        <feOffset dx="0" dy="2"/>
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
      <circle cx="20" cy="20" r="12" fill="white"/>
      <path d="M20,0C8.95,0,0,8.95,0,20c0,11.05,20,40,20,40s20-28.95,20-40C40,8.95,31.05,0,20,0z" fill="#ffcc00"/>
      <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="#000">${number}</text>
    </g>
  </svg>`;

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [0, -48],
  });
}

// Component to fit map bounds to route
function MapBoundsSetter({ photos }: { photos: PhotoPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (photos.length === 0) return;

    const bounds = new LatLngBounds(
      photos.map(p => [p.lat, p.lon])
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 15,
    });
  }, [map, photos]);

  return null;
}

export function TripMap({ photos, className }: TripMapProps) {
  if (photos.length === 0) {
    return (
      <div className={className}>
        <div className="w-full h-[500px] bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">No GPS data available</p>
        </div>
      </div>
    );
  }

  // Calculate center point
  const avgLat = photos.reduce((sum, p) => sum + p.lat, 0) / photos.length;
  const avgLon = photos.reduce((sum, p) => sum + p.lon, 0) / photos.length;

  // Create route line coordinates (sorted by index/timestamp)
  const routeCoordinates = photos
    .sort((a, b) => {
      if (a.timestamp && b.timestamp) return a.timestamp - b.timestamp;
      return a.index - b.index;
    })
    .map(p => [p.lat, p.lon] as [number, number]);

  return (
    <div className={className}>
      <MapContainer
        center={[avgLat, avgLon]}
        zoom={13}
        className="w-full h-[500px] rounded-lg"
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line */}
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#ffcc00',
            weight: 4,
            opacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {/* Photo markers */}
        {photos.map((photo, idx) => (
          <Marker
            key={idx}
            position={[photo.lat, photo.lon]}
            icon={createNumberedMarker(idx + 1)}
          >
            <Popup maxWidth={400} minWidth={250}>
              <div className="p-2">
                <div className="mb-2 max-h-[300px] overflow-hidden rounded flex items-center justify-center">
                  <OptimizedImage
                    src={photo.url}
                    alt={`Photo ${idx + 1}`}
                    className="w-full h-auto max-h-[300px] object-contain rounded"
                    priority={false}
                    thumbnail={false}
                  />
                </div>
                <p className="text-sm font-medium">Photo {idx + 1}</p>
                <p className="text-xs text-muted-foreground">
                  {photo.lat.toFixed(6)}, {photo.lon.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapBoundsSetter photos={photos} />
      </MapContainer>
    </div>
  );
}
