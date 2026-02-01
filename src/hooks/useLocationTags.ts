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
 * Extract location information from text
 * Tries to identify country and city from location strings
 */
function extractLocationTags(locationText: string): { country?: string; city?: string } {
  if (!locationText) return {};

  // Common patterns: "City, Country" or "City, State, Country"
  const parts = locationText.split(',').map(p => p.trim());
  
  if (parts.length === 0) return {};
  
  // Last part is usually country
  const country = parts[parts.length - 1];
  // First part is usually city
  const city = parts[0];
  
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
        // Get location from tags
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
      });

      // Convert to array and sort by count
      const countries: LocationTag[] = Array.from(countryCount.entries())
        .map(([tag, count]) => ({ tag, count, type: 'country' as const }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20); // Top 20 countries

      const cities: LocationTag[] = Array.from(cityCount.entries())
        .map(([tag, count]) => ({ tag, count, type: 'city' as const }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 30); // Top 30 cities

      return {
        countries,
        cities,
        all: [...countries, ...cities].sort((a, b) => b.count - a.count),
      };
    },
    enabled: !!authorizedReviewers && !!authorizedUploaders,
    staleTime: 60000, // 1 minute
  });
}
