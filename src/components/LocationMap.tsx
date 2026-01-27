import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMapProvider } from '@/hooks/useMapProvider';
import { getTileLayerConfig } from '@/lib/mapConfig';
import { markerIcons } from '@/lib/mapIcons';
import 'leaflet/dist/leaflet.css';

interface LocationMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number } | null;
  readonly?: boolean;
}

export function LocationMap({ onLocationSelect, initialLocation, readonly = false }: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const { mapProvider } = useMapProvider();

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      initialLocation ? [initialLocation.lat, initialLocation.lng] : [54.5260, 15.2551], // Default to Europe center
      initialLocation ? 15 : 4
    );

    mapInstanceRef.current = map;

    // Add tiles based on map provider setting
    const tileConfig = getTileLayerConfig(mapProvider);
    L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom
    }).addTo(map);

    // Add marker if initial location exists
    if (initialLocation) {
      console.log('🗺️ Creating marker with icon:', markerIcons.selected);
      const marker = L.marker([initialLocation.lat, initialLocation.lng], {
        icon: markerIcons.selected
      })
        .addTo(map)
        .bindPopup(`📍 Location: ${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)}`)
        .openPopup();
      markerRef.current = marker;
    }

    // Add click handler if not readonly
    if (!readonly) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker with custom icon
        const marker = L.marker([lat, lng], {
          icon: markerIcons.selected
        })
          .addTo(map)
          .bindPopup(`📍 Selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          .openPopup();

        markerRef.current = marker;
        onLocationSelect(lat, lng);
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [initialLocation, onLocationSelect, readonly, mapProvider]);

  // Update marker when initialLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !initialLocation) return;

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
    }

    // Add new marker with custom icon
    const marker = L.marker([initialLocation.lat, initialLocation.lng], {
      icon: markerIcons.selected
    })
      .addTo(mapInstanceRef.current)
      .bindPopup(`📍 Location: ${initialLocation.lat.toFixed(6)}, ${initialLocation.lng.toFixed(6)}`)
      .openPopup();

    markerRef.current = marker;

    // Center map on new location
    mapInstanceRef.current.setView([initialLocation.lat, initialLocation.lng], 15);
  }, [initialLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {!readonly && (
        <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg text-sm z-[1000]">
          📍 Click on the map to select location
        </div>
      )}
    </div>
  );
}