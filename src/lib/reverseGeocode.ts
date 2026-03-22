/**
 * Reverse Geocoding
 *
 * Converts GPS coordinates to a human-readable city and country
 * using the free Nominatim API (OpenStreetMap).
 */

export interface GeoLocation {
  city?: string;
  country?: string;
  countryCode?: string;
  displayName?: string;
}

/**
 * Reverse-geocode GPS coordinates into a city and country.
 * Uses the Nominatim (OpenStreetMap) API — no API key required.
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeoLocation> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        // Nominatim requires a User-Agent
        'User-Agent': 'Traveltelly/1.0 (https://traveltelly.com)',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      console.error('Nominatim error:', response.status);
      return {};
    }

    const data = await response.json();
    const address = data.address ?? {};

    // Try multiple address fields in order of preference
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      address.county ||
      address.state_district ||
      address.state ||
      '';

    const country = address.country ?? '';
    const countryCode = (address.country_code ?? '').toUpperCase();
    const displayName: string = data.display_name ?? '';

    return { city, country, countryCode, displayName };
  } catch (err) {
    console.error('Reverse geocode failed:', err);
    return {};
  }
}
