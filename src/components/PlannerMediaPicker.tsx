import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageOff, Loader2, Star, BookOpen, MapPin, Camera } from 'lucide-react';
import { usePlannerMedia, type PlannerCategory, type PlannerMediaItem } from '@/hooks/usePlannerMedia';

const CATEGORY_TABS: { key: PlannerCategory; label: string; icon: typeof Star }[] = [
  { key: 'reviews', label: 'Reviews', icon: Star },
  { key: 'stories', label: 'Stories', icon: BookOpen },
  { key: 'trips', label: 'Trips', icon: MapPin },
  { key: 'stock', label: 'Stock Media', icon: Camera },
];

interface PlannerMediaPickerProps {
  onPick: (item: PlannerMediaItem) => void;
}

/**
 * "Pick media from the site" — the picker at the top of the Social Media
 * Planner forms. Shows the latest published TravelTelly content from the
 * relay (reviews, stories, trips, stock products). Clicking a thumbnail fills
 * the planner form (URL, title, image, hashtags) for whichever platform tab
 * is active so the post can be scheduled or published with one click.
 */
export function PlannerMediaPicker({ onPick }: PlannerMediaPickerProps) {
  const { data: items, isLoading } = usePlannerMedia();
  const [category, setCategory] = useState<PlannerCategory>('reviews');

  const visible = (items || []).filter((item) => item.category === category);

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              📤 Pick media from the site
            </CardTitle>
            <CardDescription>
              Choose published content to fill this post — edit it afterwards if you like.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_TABS.map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={category === key ? 'default' : 'outline'}
                className={category === key ? 'bg-purple-600 hover:bg-purple-700' : ''}
                onClick={() => setCategory(key)}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Loading latest {CATEGORY_TABS.find((t) => t.key === category)?.label.toLowerCase()}…
          </div>
        ) : (items || []).length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground text-sm">
            <ImageOff className="w-4 h-4" />
            No published content found yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {visible.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onPick(item)}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-muted text-left hover:ring-2 hover:ring-purple-500 transition"
                title={item.title}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pt-6 pb-1">
                  <div className="line-clamp-1 text-[11px] font-medium text-white">{item.title}</div>
                </div>
                {item.hashtags.length > 0 && (
                  <Badge variant="secondary" className="absolute top-1 right-1 bg-black/60 text-white text-[9px]">
                    #{item.hashtags[0]}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
