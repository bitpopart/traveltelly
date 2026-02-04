import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Camera, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';

interface NearbyScenicSpotsProps {
  geohashStr: string;
}

interface StockMediaEvent extends NostrEvent {
  kind: 30402;
}

function validateStockMediaEvent(event: NostrEvent): event is StockMediaEvent {
  if (event.kind !== 30402) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  const image = event.tags.find(([name]) => name === 'image')?.[1];
  // Only include items with images
  return !!(d && title && image);
}

function useNearbyStockMedia(geohashStr: string) {
  const { nostr } = useNostr();

  return useQuery({
    queryKey: ['nearby-stock-media', geohashStr],
    queryFn: async (c) => {
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(5000)]);

      // Search with progressively shorter geohash prefixes for wider area
      const geohashPrefixes = [
        geohashStr.substring(0, 6), // ~1.2km
        geohashStr.substring(0, 5), // ~5km
        geohashStr.substring(0, 4), // ~20km
      ];

      const events = await nostr.query(
        geohashPrefixes.map(prefix => ({
          kinds: [30402],
          '#g': [prefix],
          limit: 50,
        })),
        { signal }
      );

      const validMedia = events.filter(validateStockMediaEvent);

      // Sort by newest first
      return validMedia.sort((a, b) => b.created_at - a.created_at).slice(0, 6);
    },
  });
}

export function NearbyScenicSpots({ geohashStr }: NearbyScenicSpotsProps) {
  const { data: stockMedia, isLoading, error } = useNearbyStockMedia(geohashStr);

  if (error || (!isLoading && (!stockMedia || stockMedia.length === 0))) {
    return null; // Don't show anything if no nearby spots
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            Nearby Scenic Spots
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
            {isLoading ? '...' : stockMedia?.length || 0}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Beautiful photography from this area
        </p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {stockMedia?.map((media) => {
              const title = media.tags.find(([name]) => name === 'title')?.[1] || 'Untitled';
              const image = media.tags.find(([name]) => name === 'image')?.[1];
              const location = media.tags.find(([name]) => name === 'location')?.[1];
              const identifier = media.tags.find(([name]) => name === 'd')?.[1];

              if (!identifier || !image) return null;

              const naddr = nip19.naddrEncode({
                kind: media.kind,
                pubkey: media.pubkey,
                identifier,
              });

              return (
                <Link key={media.id} to={`/media/preview/${naddr}`}>
                  <div className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 hover:border-blue-400 transition-colors">
                    <OptimizedImage
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      blurUp={true}
                      thumbnail={true}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium line-clamp-2">
                          {title}
                        </p>
                        {location && (
                          <p className="text-white/80 text-[10px] flex items-center gap-1 mt-1">
                            <MapPin className="w-2.5 h-2.5" />
                            {location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
