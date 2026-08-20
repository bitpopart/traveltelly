import { LocationMap } from '@/components/LocationMap';

/** Default correction radius (~300 m = a few blocks / a wrong street fix). */
export const LOCATION_ADJUST_RADIUS_METERS = 300;
/** Tight zoom so the small map frames just the local area around the pin. */
export const LOCATION_ADJUST_ZOOM = 18;

interface LocationAdjusterProps {
  initialLocation: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
  radiusMeters?: number;
  zoom?: number;
}

/**
 * A small, close-in map for short pin corrections (e.g. wrong street). The marker
 * is draggable and stays within a small radius of the original image location.
 */
export function LocationAdjuster({
  initialLocation,
  onLocationSelect,
  radiusMeters = LOCATION_ADJUST_RADIUS_METERS,
  zoom = LOCATION_ADJUST_ZOOM,
}: LocationAdjusterProps) {
  return (
    <LocationMap
      onLocationSelect={onLocationSelect}
      initialLocation={initialLocation}
      zoom={zoom}
      radiusMeters={radiusMeters}
      draggable
    />
  );
}
