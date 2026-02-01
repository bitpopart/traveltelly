import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import type { NostrEvent } from '@nostrify/nostrify';
import { useAuthorizedReviewers } from './useAuthorizedReviewers';
import { useAuthorizedMediaUploaders } from './useStockMediaPermissions';
import { nip19 } from 'nostr-tools';

const ADMIN_NPUB = 'npub105em547c5m5gdxslr4fp2f29jav54sxml6cpk6gda7xyvxuzmv6s84a642';
const ADMIN_HEX = nip19.decode(ADMIN_NPUB).data as string;

export interface LocationTag {
  tag: string;
  count: number;
  type: 'country' | 'city';
}

/**
 * Check if a tag is a valid location (country, city, town, province)
 * Returns true if it's a geographic location, false for other tags
 */
function isValidLocation(text: string): boolean {
  if (!text) return false;
  
  const lowerText = text.toLowerCase().trim();
  
  // Filter out very short texts (likely codes/numbers)
  if (lowerText.length < 3) {
    return false;
  }
  
  // Filter out common non-location tags
  const nonLocationTags = [
    'travel', 'photography', 'photo', 'photos', 'video', 'videos',
    'landscape', 'nature', 'sunset', 'sunrise', 'beach', 'mountain',
    'food', 'restaurant', 'cafe', 'hotel', 'review', 'trip',
    'adventure', 'explore', 'wanderlust', 'vacation', 'holiday',
    'architecture', 'culture', 'art', 'history', 'urban', 'city',
    'street', 'night', 'day', 'summer', 'winter', 'spring', 'autumn',
    'beautiful', 'amazing', 'stunning', 'picturesque', 'scenic',
    'outdoor', 'indoor', 'people', 'portrait', 'lifestyle',
    'business', 'work', 'meeting', 'team', 'corporate',
    'animal', 'wildlife', 'pet', 'dog', 'cat', 'bird',
    'sport', 'fitness', 'health', 'yoga', 'gym',
    'technology', 'tech', 'computer', 'phone', 'gadget',
    'nostr', 'bitcoin', 'lightning', 'crypto', 'web3'
  ];
  
  if (nonLocationTags.includes(lowerText)) {
    return false;
  }
  
  // Filter out street names
  const streetIndicators = [
    'road', 'street', 'avenue', 'boulevard', 'lane', 'drive', 'way', 'alley',
    'route', 'highway', 'path', 'plaza', 'square', 'court', 'circle', 'terrace',
    'quai', 'rue', 'strasse', 'gasse', 'platz', 'weg', 'via', 'corso',
    'soi', 'thanon', 'rama', 'rajons', 'sattha', 'thetsaban'
  ];
  
  if (streetIndicators.some(indicator => lowerText.includes(indicator))) {
    return false;
  }
  
  // Filter out numbered streets
  if (/\b(road|street|soi|rama|route)\s*\d+/i.test(text)) {
    return false;
  }
  
  // If it passes all filters, it's likely a valid location
  return true;
}

/**
 * Extract location information from text
 * Tries to identify country and city from location strings
 */
function extractLocationTags(locationText: string): { country?: string; city?: string } {
  if (!locationText) return {};

  // Common patterns: "City, Country" or "City, State, Country"
  const parts = locationText.split(',').map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) return {};
  
  // Filter to keep only valid locations (countries, cities, towns, provinces)
  const validParts = parts.filter(part => isValidLocation(part));
  
  if (validParts.length === 0) return {};
  
  // Last valid part is usually country
  const country = validParts[validParts.length - 1];
  // First valid part is usually city (if more than one part)
  const city = validParts.length > 1 ? validParts[0] : undefined;
  
  return { country, city };
}

/**
 * Hook to get popular location tags from all content types
 */
export function useLocationTags() {
  const { nostr } = useNostr();
  const { data: authorizedReviewers } = useAuthorizedReviewers();
  const { data: authorizedUploaders } = useAuthorizedMediaUploaders();

  return useQuery({
    queryKey: ['location-tags', authorizedReviewers, authorizedUploaders],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      const reviewAuthors = Array.from(authorizedReviewers || []);
      const mediaAuthors = Array.from(authorizedUploaders || []);

      // Query all content types with location data
      const [reviews, trips, stories, stockMedia] = await Promise.all([
        // Reviews
        nostr.query([{
          kinds: [34879],
          authors: reviewAuthors,
          limit: 200,
        }], { signal }),
        // Trips
        nostr.query([{
          kinds: [30025],
          authors: [ADMIN_HEX],
          limit: 100,
        }], { signal }),
        // Stories
        nostr.query([{
          kinds: [30023],
          authors: [ADMIN_HEX],
          limit: 100,
        }], { signal }),
        // Stock Media
        nostr.query([{
          kinds: [30402],
          authors: mediaAuthors,
          limit: 200,
        }], { signal }),
      ]);

      // Combine all events
      const allEvents = [...reviews, ...trips, ...stories, ...stockMedia];

      // Extract location tags
      const countryCount = new Map<string, number>();
      const cityCount = new Map<string, number>();

      allEvents.forEach(event => {
        // Get location from location tag
        const location = event.tags.find(([name]) => name === 'location')?.[1];
        
        if (location) {
          const { country, city } = extractLocationTags(location);
          
          if (country) {
            countryCount.set(country, (countryCount.get(country) || 0) + 1);
          }
          if (city) {
            cityCount.set(city, (cityCount.get(city) || 0) + 1);
          }
        }

        // Also extract from hashtags (t tags) for better coverage
        const hashtags = event.tags.filter(([name]) => name === 't').map(([, tag]) => tag);
        
        hashtags.forEach(tag => {
          if (!tag) return;
          
          // Check if hashtag is a valid location (country, city, town, province)
          if (isValidLocation(tag)) {
            // Capitalize for consistency
            const capitalizedTag = tag
              .split(/[-\s]/)
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            // Try to determine if it's likely a country or city/province
            // Common countries are usually one word, cities/provinces can be multiple
            const wordCount = capitalizedTag.split(' ').length;
            
            if (wordCount === 1) {
              // Single word tags are more likely countries or provinces
              countryCount.set(capitalizedTag, (countryCount.get(capitalizedTag) || 0) + 1);
            } else {
              // Multi-word tags are more likely cities or towns
              cityCount.set(capitalizedTag, (cityCount.get(capitalizedTag) || 0) + 1);
            }
          }
        });
      });

      // Convert to array and sort by count
      const countries: LocationTag[] = Array.from(countryCount.entries())
        .filter(([tag]) => isValidLocation(tag)) // Keep only valid locations
        .map(([tag, count]) => ({ tag, count, type: 'country' as const }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 countries/provinces

      const cities: LocationTag[] = Array.from(cityCount.entries())
        .filter(([tag]) => isValidLocation(tag)) // Keep only valid locations
        .map(([tag, count]) => ({ tag, count, type: 'city' as const }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 cities/towns

      // Combine and limit to 15 total
      const combined = [...countries, ...cities]
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      return {
        countries,
        cities,
        all: combined,
      };
    },
    enabled: !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 60000, // 1 minute
  });
}
