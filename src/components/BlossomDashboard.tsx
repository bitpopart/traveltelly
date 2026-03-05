import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/useToast';
import {
  Image,
  Video,
  Music,
  FileText,
  File,
  Trash2,
  Copy,
  ExternalLink,
  Search,
  RefreshCw,
  HardDrive,
  Filter,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const BLOSSOM_SERVER = 'https://blossom.nostr.build';
const PAGE_SIZE = 50;

// ── Types ────────────────────────────────────────────────────────────────────

interface BlobDescriptor {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
}

type FileFilter = 'all' | 'image' | 'video' | 'audio' | 'other';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getFileCategory(type: string): FileFilter {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return 'other';
}

function FileIcon({ type, className }: { type: string; className?: string }) {
  const cat = getFileCategory(type);
  if (cat === 'image') return <Image className={className} />;
  if (cat === 'video') return <Video className={className} />;
  if (cat === 'audio') return <Music className={className} />;
  if (type.includes('pdf') || type.includes('text')) return <FileText className={className} />;
  return <File className={className} />;
}

// ── Blossom Auth (BUD-02, kind 24242) ────────────────────────────────────────

async function makeBlossomAuth(
  user: { signer: { signEvent: (e: object) => Promise<{ id: string; sig: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string }> } },
  action: 'list' | 'delete',
  sha256?: string,
): Promise<string> {
  const expiration = Math.floor(Date.now() / 1000) + 60 * 5; // 5 min
  const tags: string[][] = [
    ['t', action],
    ['expiration', expiration.toString()],
  ];
  if (action === 'delete' && sha256) {
    tags.push(['x', sha256]);
  }
  const event = await user.signer.signEvent({
    kind: 24242,
    content: action === 'list' ? 'List Blobs' : `Delete ${sha256}`,
    created_at: Math.floor(Date.now() / 1000),
    tags,
  });
  return btoa(JSON.stringify(event));
}

// ── Hook: list blobs ─────────────────────────────────────────────────────────

function useBlossomFiles(pubkey: string | undefined, cursor: string | undefined) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['blossom-files', pubkey, cursor],
    enabled: !!pubkey && !!user,
    queryFn: async () => {
      if (!pubkey || !user) throw new Error('Not logged in');

      const auth = await makeBlossomAuth(user, 'list');
      const params = new URLSearchParams({ limit: PAGE_SIZE.toString() });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(
        `${BLOSSOM_SERVER}/list/${pubkey}?${params}`,
        { headers: { Authorization: `Nostr ${auth}` } },
      );
      if (!res.ok) throw new Error(`Blossom list failed: ${res.status}`);
      const data: BlobDescriptor[] = await res.json();
      return data;
    },
    staleTime: 30_000,
  });
}

// ── Hook: delete blob ─────────────────────────────────────────────────────────

function useDeleteBlob() {
  const { user } = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (blob: BlobDescriptor) => {
      if (!user) throw new Error('Not logged in');
      const auth = await makeBlossomAuth(user, 'delete', blob.sha256);
      const res = await fetch(`${BLOSSOM_SERVER}/${blob.sha256}`, {
        method: 'DELETE',
        headers: { Authorization: `Nostr ${auth}` },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      return blob.sha256;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blossom-files'] });
    },
  });
}

// ── FileCard ─────────────────────────────────────────────────────────────────

interface FileCardProps {
  blob: BlobDescriptor;
  onDelete: (blob: BlobDescriptor) => void;
}

function FileCard({ blob, onDelete }: FileCardProps) {
  const { toast } = useToast();
  const isImage = blob.type.startsWith('image/');
  const isVideo = blob.type.startsWith('video/');

  const copyUrl = () => {
    navigator.clipboard.writeText(blob.url);
    toast({ title: 'URL copied!', description: blob.url.slice(0, 60) + '...' });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-gray-900 flex flex-col group hover:shadow-md transition-shadow">
      {/* Preview */}
      <div className="relative bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={blob.url}
            alt={blob.sha256.slice(0, 8)}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : isVideo ? (
          <video
            src={blob.url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
        ) : (
          <FileIcon type={blob.type} className="w-12 h-12 text-gray-400" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={copyUrl}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
            title="Copy URL"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={blob.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href={blob.url}
            download
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            onClick={() => onDelete(blob)}
            className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 space-y-1 flex-1">
        <div className="flex items-center justify-between gap-1">
          <Badge variant="secondary" className="text-[10px] px-1 py-0 truncate max-w-[70%]">
            {blob.type.split('/')[1]?.toUpperCase() || blob.type}
          </Badge>
          <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(blob.size)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground truncate font-mono">{blob.sha256.slice(0, 16)}…</p>
        <p className="text-[10px] text-muted-foreground">{formatDate(blob.uploaded)}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function BlossomDashboard() {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FileFilter>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]); // for back navigation
  const [deleteTarget, setDeleteTarget] = useState<BlobDescriptor | null>(null);

  const { data: blobs = [], isLoading, error, refetch } = useBlossomFiles(user?.pubkey, cursor);
  const { mutate: deleteBlob, isPending: isDeleting } = useDeleteBlob();

  // Filtering
  const filtered = blobs.filter((b) => {
    const matchesFilter = filter === 'all' || getFileCategory(b.type) === filter;
    const matchesSearch = !search || b.url.toLowerCase().includes(search.toLowerCase()) || b.sha256.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Stats
  const totalSize = blobs.reduce((sum, b) => sum + b.size, 0);
  const imageCount = blobs.filter(b => b.type.startsWith('image/')).length;
  const videoCount = blobs.filter(b => b.type.startsWith('video/')).length;
  const audioCount = blobs.filter(b => b.type.startsWith('audio/')).length;

  const handleDelete = useCallback((blob: BlobDescriptor) => {
    setDeleteTarget(blob);
  }, []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBlob(deleteTarget, {
      onSuccess: () => {
        toast({ title: 'File deleted', description: `${deleteTarget.sha256.slice(0, 12)}… removed from blossom.nostr.build` });
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
        setDeleteTarget(null);
      },
    });
  };

  const goNextPage = () => {
    if (blobs.length === 0) return;
    const lastSha = blobs[blobs.length - 1].sha256;
    setCursorStack(prev => [...prev, cursor ?? '']);
    setCursor(lastSha);
  };

  const goPrevPage = () => {
    const stack = [...cursorStack];
    const prev = stack.pop();
    setCursorStack(stack);
    setCursor(prev === '' ? undefined : prev);
  };

  const hasNextPage = blobs.length === PAGE_SIZE;
  const hasPrevPage = cursorStack.length > 0;
  const currentPage = cursorStack.length + 1;

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Log in to manage your Blossom files.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-purple-600" />
            Blossom File Manager
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            <a href="https://blossom.nostr.build" target="_blank" rel="noopener noreferrer" className="hover:underline text-purple-600">
              blossom.nostr.build
            </a>
            {' '}— your personal media server
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Files', value: isLoading ? '…' : blobs.length.toString() + (hasNextPage ? '+' : ''), icon: <File className="w-4 h-4 text-gray-500" /> },
          { label: 'Total Size', value: isLoading ? '…' : formatBytes(totalSize), icon: <HardDrive className="w-4 h-4 text-blue-500" /> },
          { label: 'Images', value: isLoading ? '…' : imageCount.toString(), icon: <Image className="w-4 h-4 text-green-500" /> },
          { label: 'Videos', value: isLoading ? '…' : videoCount.toString(), icon: <Video className="w-4 h-4 text-orange-500" /> },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by URL or hash…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-8"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'image', 'video', 'audio', 'other'] as FileFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-muted-foreground hover:border-purple-400'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground ml-auto">
          {search || filter !== 'all' ? `${filtered.length} of ${blobs.length}` : `${blobs.length} files`}
        </span>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <CardContent className="py-4 text-center text-sm text-red-600 dark:text-red-400">
            Failed to load files: {error instanceof Error ? error.message : 'Unknown error'}. Make sure you are logged in with the correct Nostr account.
          </CardContent>
        </Card>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              {blobs.length === 0 ? 'No files found on blossom.nostr.build for your account.' : 'No files match your search/filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((blob) => (
            <FileCard key={blob.sha256} blob={blob} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={goPrevPage} disabled={!hasPrevPage || isLoading}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <Button variant="outline" size="sm" onClick={goNextPage} disabled={!hasNextPage || isLoading}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Audio files listed separately (can't preview in grid) */}
      {audioCount > 0 && filter !== 'image' && filter !== 'video' && filter !== 'other' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-500" />
              Audio Files ({audioCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blobs.filter(b => b.type.startsWith('audio/')).map(blob => (
              <div key={blob.sha256} className="flex items-center gap-3 p-2 border rounded-lg">
                <Music className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono truncate">{blob.url.split('/').pop()}</p>
                  <p className="text-[10px] text-muted-foreground">{formatBytes(blob.size)} · {formatDate(blob.uploaded)}</p>
                </div>
                <div className="flex gap-1">
                  <a href={blob.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ExternalLink className="w-3.5 h-3.5" /></Button>
                  </a>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-600" onClick={() => handleDelete(blob)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirm Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete file?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will permanently delete the file from <strong>blossom.nostr.build</strong>. This cannot be undone.</p>
              {deleteTarget && (
                <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
                  {deleteTarget.sha256}
                  <br />
                  <span className="text-muted-foreground">{formatBytes(deleteTarget.size)} · {deleteTarget.type}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting…' : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
