import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMapProvider } from '@/hooks/useMapProvider';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { markerIcons } from '@/lib/mapIcons';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number } | null;
  readonly?: boolean;
  /** Map zoom level (default 15). Pass ~18 for a tight small-radius adjust map. */
  zoom?: number;
  /**
   * When set, the pin can only be moved (clicked or dragged) within this many
   * metres of the original location — used for small corrections such as a wrong street.
   */
  radiusMeters?: number;
  /** Allow dragging the marker to fine-tune the pin. */
  draggable?: boolean;
}

interface LatLng {
  lat: number;
  lng: number;
}

const METERS_PER_DEG_LAT = 111320;

function clampWithRadius(lat: number, lng: number, anchor: LatLng, radius: number): LatLng {
  const metresPerDegLng = METERS_PER_DEG_LAT * Math.cos((anchor.lat * Math.PI) / 180);
  const dLat = (lat - anchor.lat) * METERS_PER_DEG_LAT;
  const dLng = (lng - anchor.lng) * metresPerDegLng;
  const dist = Math.hypot(dLat, dLng);
  if (dist <= radius) return { lat, lng };
  const ratio = radius / dist;
  return {
    lat: anchor.lat + (lat - anchor.lat) * ratio,
    lng: anchor.lng + (lng - anchor.lng) * ratio,
  };
}

/**
 * Remove any previous marker and place a new one, wiring up a drag handler when
 * draggable. Pure module helper (no component-scope closure) so callers can use
 * it inside effects without re-listing captured function deps.
 */
function placeMarker(
  map: L.Map,
  markerRef: { current: L.Marker | null },
  lat: number,
  lng: number,
  canDrag: boolean,
  radiusMeters: number | undefined,
  anchor: LatLng | null,
  onSelect: (lat: number, lng: number) => void,
  open: boolean
) {
  if (markerRef.current) map.removeLayer(markerRef.current);
  const marker = L.marker([lat, lng], {
    icon: markerIcons.selected,
    draggable: canDrag,
  })
    .addTo(map)
    .bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  if (open) marker.openPopup();
  if (canDrag) {
    marker.on('dragend', (event) => {
      // The runtime fires a mouse-like event with a latlng on drag end, but
      // @types/leaflet types it as DragEndEvent (distance only), so read the
      // dragged position through a narrow cast.
      const pos = (event as unknown as { latlng?: { lat: number; lng: number } }).latlng;
      const src = pos ?? { lat: 0, lng: 0 };
      const next = anchor && radiusMeters
        ? clampWithRadius(src.lat, src.lng, anchor, radiusMeters)
        : { lat: src.lat, lng: src.lng };
      if (next.lat !== src.lat || next.lng !== src.lng) marker.setLatLng([next.lat, next.lng]);
      onSelect(next.lat, next.lng);
    });
  }
  markerRef.current = marker;
  return marker;
}

export function LocationMap({
  onLocationSelect,
  initialLocation,
  readonly = false,
  zoom = 15,
  radiusMeters,
  draggable = false,
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const anchorRef = useRef<LatLng | null>(initialLocation ?? null);
  const { mapProvider } = useMapProvider();

  // Keep the radius centre anchored at the first extracted location so fine
  // corrections stay near the photo's GPS point after the pin moves.
  useEffect(() => {
    if (initialLocation && !anchorRef.current) {
      anchorRef.current = { lat: initialLocation.lat, lng: initialLocation.lng };
    }
  }, [initialLocation]);

  // Create the map once. Subsequent pin moves update the marker via the effect
  // below (and inline handlers), not by rebuilding the whole layer each time.
  useEffect(() => {
    if (!mapRef.current) return;
    const center = anchorRef.current ?? { lat: 54.526, lng: 15.2551 };
    // Without a location yet, open the world view (zoom 4) like the old behavior.
    const initialZoom = anchorRef.current ? zoom : 4;
    const map = L.map(mapRef.current).setView([center.lat, center.lng], initialZoom);
    mapInstanceRef.current = map;

    const tileConfig = getTileLayerConfig(mapProvider);
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);

    if (anchorRef.current) {
      placeMarker(
        map,
        markerRef,
        anchorRef.current.lat,
        anchorRef.current.lng,
        !readonly && draggable,
        radiusMeters,
        anchorRef.current,
        onLocationSelect,
        true
      );
    }

    if (!readonly) {
      map.on('click', (event) => {
        const next = radiusMeters && anchorRef.current
          ? clampWithRadius(event.latlng.lat, event.latlng.lng, anchorRef.current, radiusMeters)
          : { lat: event.latlng.lat, lng: event.latlng.lng };
        placeMarker(
          map,
          markerRef,
          next.lat,
          next.lng,
          !readonly && draggable,
          radiusMeters,
          anchorRef.current,
          onLocationSelect,
          true
        );
        onLocationSelect(next.lat, next.lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [onLocationSelect, readonly, mapProvider, zoom, radiusMeters, draggable]);

  // When the form's stored location changes, move the marker and recenter
  // without recreating the map.
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;
    placeMarker(
      mapInstanceRef.current,
      markerRef,
      initialLocation.lat,
      initialLocation.lng,
      !readonly && draggable,
      radiusMeters,
      anchorRef.current,
      onLocationSelect,
      false
    );
    mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], zoom);
  }, [initialLocation, zoom, readonly, draggable, radiusMeters, onLocationSelect]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!readonly && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm z-[1000]">
          {radiusMeters
            ? '📍 Drag or click to fine-tune the pin (small radius)'
            : '📍 Click on the map to select location'}
        </div>
      )}
    </div>
  );
}