import { useState } from 'react';
import { useDuplicatePins, type DuplicatePin } from '@/hooks/useDuplicatePins';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { useAuthor } from '@/hooks/useAuthor';
import { genUserName } from '@/lib/genUserName';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { MapPin, Trash2, Copy, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { nip19 } from 'nostr-tools';

interface PinRowProps {
  pin: DuplicatePin;
  deleting: boolean;
  onDelete: (pin: DuplicatePin) => void;
}

function PinRow({ pin, deleting, onDelete }: PinRowProps) {
  const author = useAuthor(pin.event.pubkey);
  const metadata = author.data?.metadata;
  const displayName = metadata?.name || genUserName(pin.event.pubkey);

  const naddr = pin.dTag
    ? nip19.naddrEncode({ identifier: pin.dTag, pubkey: pin.event.pubkey, kind: 34879 })
    : '';

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {pin.image ? (
          <img
            src={pin.image}
            alt={pin.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <MapPin className="h-5 w-5" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{pin.title}</p>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-4 w-4">
            <AvatarImage src={metadata?.picture} alt={displayName} />
            <AvatarFallback className="text-[8px]">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{displayName}</span>
          <span className="flex-shrink-0">
            {formatDistanceToNow(new Date(pin.event.created_at * 1000), { addSuffix: true })}
          </span>
        </div>
        <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
          geohash {pin.geohash}
        </p>
      </div>

      {naddr && (
        <a
          href={`/review/${naddr}`}
          target="_blank"
          rel="noreferrer"
          className="flex-shrink-0"
        >
          <Button variant="ghost" size="sm">View</Button>
        </a>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex-shrink-0" disabled={deleting}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete duplicate pin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this pin (“{pin.title}”) at{' '}
              {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}? This publishes a NIP-09
              deletion event so it will stop rendering on the world map. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(pin)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function AdminDuplicatePins() {
  const { data: groups = [], isLoading, isFetching, refetch } = useDuplicatePins();
  const { mutateAsync: createEvent } = useNostrPublish();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (pin: DuplicatePin) => {
    try {
      setDeletingId(pin.event.id);
      const dTag = pin.dTag;
      if (!dTag) {
        toast({
          title: 'Error',
          description: 'Cannot delete pin: missing identifier (d tag)',
          variant: 'destructive',
        });
        return;
      }

      await createEvent({
        kind: 5, // NIP-09 deletion event
        content: 'Duplicate pin deleted by admin',
        tags: [
          ['e', pin.event.id],
          ['a', `34879:${pin.event.pubkey}:${dTag}`],
        ],
      });

      toast({
        title: 'Duplicate pin deleted',
        description: 'A deletion event was published. The pin will stop rendering on the world map.',
      });

      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete pin. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <div className="flex gap-3">
              <Skeleton className="h-14 w-14 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-red-500" />
            Duplicate Pins
            {groups.length > 0 && (
              <Badge variant="destructive">{groups.length} location{groups.length !== 1 ? 's' : ''}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            {groups.length === 0
              ? 'No duplicate pins detected. Multiple pins at the same exact GPS spot will show up here.'
              : `${groups.length} location${groups.length !== 1 ? 's' : ''} have ${groups.reduce((sum, g) => sum + g.pins.length, 0)} pins sharing the same exact GPS coordinate. Review and delete the duplicates so they stop stacking on the world map.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isFetching && !isLoading && (
            <p className="mb-3 text-xs text-muted-foreground">Refreshing…</p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <Copy className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingSkeleton />
      ) : groups.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCheck className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="text-muted-foreground">
              No duplicate pins found — the world map is clean.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.key}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="destructive">{group.pins.length} pins</Badge>
                      <span className="font-mono text-sm">
                        {group.lat.toFixed(5)}, {group.lng.toFixed(5)}
                      </span>
                    </CardTitle>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Same exact GPS location</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {group.pins.map((pin) => (
                  <PinRow
                    key={pin.event.id}
                    pin={pin}
                    deleting={deletingId === pin.event.id}
                    onDelete={handleDelete}
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
