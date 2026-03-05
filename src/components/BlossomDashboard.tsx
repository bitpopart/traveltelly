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
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
} from 'lucide-react';

// ── Server definitions ────────────────────────────────────────────────────────

interface BlossomServer {
  id: string;
  name: string;
  url: string;          // base URL (no trailing slash)
  color: string;        // tailwind colour for badge / accent
  description: string;
}

const BLOSSOM_SERVERS: BlossomServer[] = [
  {
    id: 'nostr-build',
    name: 'nostr.build',
    url: 'https://blossom.nostr.build',
    color: 'purple',
    description: 'Primary Blossom server — backed by nostr.build CDN',
  },
  {
    id: 'primal',
    name: 'Primal',
    url: 'https://blossom.primal.net',
    color: 'orange',
    description: 'Primal\'s Blossom server — shows on Primal app',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    url: 'https://cdn.satellite.earth',
    color: 'blue',
    description: 'Satellite.earth CDN Blossom server',
  },
  {
    id: 'nostr-hu',
    name: 'nostr.hu',
    url: 'https://blossom.nostr.hu',
    color: 'green',
    description: 'Community Blossom server',
  },
];

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

function FileTypeIcon({ type, className }: { type: string; className?: string }) {
  const cat = getFileCategory(type);
  if (cat === 'image') return <Image className={className} />;
  if (cat === 'video') return <Video className={className} />;
  if (cat === 'audio') return <Music className={className} />;
  if (type.includes('pdf') || type.includes('text')) return <FileText className={className} />;
  return <File className={className} />;
}

const SERVER_COLOR_CLASSES: Record<string, { badge: string; accent: string; tab: string; tabActive: string }> = {
  purple: {
    badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    accent: 'text-purple-600',
    tab: 'border-purple-200 hover:border-purple-400',
    tabActive: 'border-b-2 border-purple-600 text-purple-700 dark:text-purple-400',
  },
  orange: {
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    accent: 'text-orange-600',
    tab: 'border-orange-200 hover:border-orange-400',
    tabActive: 'border-b-2 border-orange-500 text-orange-700 dark:text-orange-400',
  },
  blue: {
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    accent: 'text-blue-600',
    tab: 'border-blue-200 hover:border-blue-400',
    tabActive: 'border-b-2 border-blue-500 text-blue-700 dark:text-blue-400',
  },
  green: {
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    accent: 'text-green-600',
    tab: 'border-green-200 hover:border-green-400',
    tabActive: 'border-b-2 border-green-600 text-green-700 dark:text-green-400',
  },
};

// ── Blossom Auth (BUD-02, kind 24242) ────────────────────────────────────────

type BlossomSigner = {
  signer: {
    signEvent: (e: object) => Promise<{
      id: string; sig: string; pubkey: string;
      created_at: number; kind: number; tags: string[][]; content: string;
    }>;
  };
};

async function makeBlossomAuth(
  user: BlossomSigner,
  action: 'list' | 'delete',
  sha256?: string,
): Promise<string> {
  const expiration = Math.floor(Date.now() / 1000) + 60 * 5;
  const tags: string[][] = [
    ['t', action],
    ['expiration', expiration.toString()],
  ];
  if (action === 'delete' && sha256) tags.push(['x', sha256]);

  const event = await user.signer.signEvent({
    kind: 24242,
    content: action === 'list' ? 'List Blobs' : `Delete ${sha256}`,
    created_at: Math.floor(Date.now() / 1000),
    tags,
  });
  return btoa(JSON.stringify(event));
}

// ── Hook: list blobs from one server ─────────────────────────────────────────

function useBlossomFiles(
  server: BlossomServer,
  pubkey: string | undefined,
  cursor: string | undefined,
  enabled: boolean,
) {
  const { user } = useCurrentUser();

  return useQuery({
    queryKey: ['blossom-files', server.id, pubkey, cursor],
    enabled: !!pubkey && !!user && enabled,
    retry: 1,
    queryFn: async () => {
      if (!pubkey || !user) throw new Error('Not logged in');

      const auth = await makeBlossomAuth(user, 'list');
      const params = new URLSearchParams({ limit: PAGE_SIZE.toString() });
      if (cursor) params.set('cursor', cursor);

      const res = await fetch(
        `${server.url}/list/${pubkey}?${params}`,
        { headers: { Authorization: `Nostr ${auth}` } },
      );

      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`${res.status} ${res.statusText}${body ? ': ' + body.slice(0, 100) : ''}`);
      }

      const data = await res.json();
      // Some servers return an object with a files array (NIP-96 style), others return a plain array
      const blobs: BlobDescriptor[] = Array.isArray(data) ? data : (data.files ?? []);
      return blobs;
    },
    staleTime: 30_000,
  });
}

// ── Hook: delete blob from one server ────────────────────────────────────────

function useDeleteBlob(server: BlossomServer) {
  const { user } = useCurrentUser();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (blob: BlobDescriptor) => {
      if (!user) throw new Error('Not logged in');
      const auth = await makeBlossomAuth(user, 'delete', blob.sha256);
      const res = await fetch(`${server.url}/${blob.sha256}`, {
        method: 'DELETE',
        headers: { Authorization: `Nostr ${auth}` },
      });
      if (!res.ok) throw new Error(`Delete failed: ${res.status} ${res.statusText}`);
      return blob.sha256;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blossom-files', server.id] });
    },
  });
}

// ── FileCard ─────────────────────────────────────────────────────────────────

interface FileCardProps {
  blob: BlobDescriptor;
  server: BlossomServer;
  onDelete: (blob: BlobDescriptor) => void;
}

function FileCard({ blob, onDelete }: FileCardProps) {
  const { toast } = useToast();
  const isImage = blob.type.startsWith('image/');
  const isVideo = blob.type.startsWith('video/');

  const copyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(blob.url);
    toast({ title: 'URL copied!', description: blob.url.slice(0, 60) + (blob.url.length > 60 ? '…' : '') });
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
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : isVideo ? (
          <video
            src={blob.url}
            className="w-full h-full object-cover"
            muted playsInline preload="metadata"
          />
        ) : (
          <FileTypeIcon type={blob.type} className="w-12 h-12 text-gray-400" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 flex-wrap px-2">
          <button onClick={copyUrl} className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white" title="Copy URL">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <a href={blob.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white" title="Open">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a href={blob.url} download onClick={e => e.stopPropagation()}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white" title="Download">
            <Download className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => onDelete(blob)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-2 space-y-1 flex-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-medium bg-gray-100 dark:bg-gray-800 rounded px-1 truncate max-w-[65%]">
            {blob.type.split('/')[1]?.toUpperCase() || blob.type}
          </span>
          <span className="text-[10px] text-muted-foreground shrink-0">{formatBytes(blob.size)}</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono truncate">{blob.sha256.slice(0, 16)}…</p>
        <p className="text-[10px] text-muted-foreground">{formatDate(blob.uploaded)}</p>
      </div>
    </div>
  );
}

// ── Server status badge ───────────────────────────────────────────────────────

interface ServerStatusBadgeProps {
  isLoading: boolean;
  isError: boolean;
  count: number;
  hasNextPage: boolean;
}
function ServerStatusBadge({ isLoading, isError, count, hasNextPage }: ServerStatusBadgeProps) {
  if (isLoading) return <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />;
  if (isError) return <AlertCircle className="w-3.5 h-3.5 text-red-500" title="Failed to load" />;
  return (
    <span className="text-[10px] font-medium bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5 leading-none">
      {count}{hasNextPage ? '+' : ''}
    </span>
  );
}

// ── Per-server panel ──────────────────────────────────────────────────────────

interface ServerPanelProps {
  server: BlossomServer;
  pubkey: string;
}

function ServerPanel({ server, pubkey }: ServerPanelProps) {
  const { toast } = useToast();
  const colors = SERVER_COLOR_CLASSES[server.color];

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FileFilter>('all');
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<BlobDescriptor | null>(null);

  const { data: blobs = [], isLoading, isError, error, refetch } = useBlossomFiles(server, pubkey, cursor, true);
  const { mutate: deleteBlob, isPending: isDeleting } = useDeleteBlob(server);

  const filtered = blobs.filter(b => {
    const matchesFilter = filter === 'all' || getFileCategory(b.type) === filter;
    const matchesSearch = !search
      || b.url.toLowerCase().includes(search.toLowerCase())
      || b.sha256.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalSize = blobs.reduce((s, b) => s + b.size, 0);
  const imageCount = blobs.filter(b => b.type.startsWith('image/')).length;
  const videoCount = blobs.filter(b => b.type.startsWith('video/')).length;
  const audioCount = blobs.filter(b => b.type.startsWith('audio/')).length;
  const hasNextPage = blobs.length === PAGE_SIZE;
  const hasPrevPage = cursorStack.length > 0;
  const currentPage = cursorStack.length + 1;

  const handleDelete = useCallback((blob: BlobDescriptor) => setDeleteTarget(blob), []);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteBlob(deleteTarget, {
      onSuccess: () => {
        toast({ title: '🗑️ File deleted', description: `Removed from ${server.name}` });
        setDeleteTarget(null);
      },
      onError: (err) => {
        toast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' });
        setDeleteTarget(null);
      },
    });
  };

  const goNextPage = () => {
    if (!blobs.length) return;
    setCursorStack(p => [...p, cursor ?? '']);
    setCursor(blobs[blobs.length - 1].sha256);
  };
  const goPrevPage = () => {
    const stack = [...cursorStack];
    const prev = stack.pop();
    setCursorStack(stack);
    setCursor(prev === '' ? undefined : prev);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Server info + stats row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{server.description}</p>
          <a href={server.url} target="_blank" rel="noopener noreferrer"
            className={`text-xs hover:underline ${colors.accent}`}>
            {server.url.replace('https://', '')}
          </a>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Files', value: isLoading ? '…' : `${blobs.length}${hasNextPage ? '+' : ''}`, icon: <File className="w-3.5 h-3.5 text-gray-500" /> },
          { label: 'Size', value: isLoading ? '…' : formatBytes(totalSize), icon: <HardDrive className="w-3.5 h-3.5 text-blue-500" /> },
          { label: 'Images', value: isLoading ? '…' : String(imageCount), icon: <Image className="w-3.5 h-3.5 text-green-500" /> },
          { label: 'Videos', value: isLoading ? '…' : String(videoCount), icon: <Video className="w-3.5 h-3.5 text-orange-500" /> },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2.5">
            {s.icon}
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">{s.label}</p>
              <p className="text-sm font-bold leading-snug">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[160px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search URL or hash…" value={search}
            onChange={e => setSearch(e.target.value)} className="pl-8 pr-8 h-8 text-sm" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
        <div className="flex gap-1 flex-wrap">
          {(['all', 'image', 'video', 'audio', 'other'] as FileFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                filter === f ? 'bg-gray-800 text-white border-gray-800 dark:bg-gray-200 dark:text-gray-900' : 'text-muted-foreground border-gray-200 hover:border-gray-400'
              }`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          {search || filter !== 'all' ? `${filtered.length} / ${blobs.length}` : `${blobs.length} files`}
        </span>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex items-center gap-2 p-3 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Could not load files from {server.name}:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}.
            {' '}This server may require a different auth format or your account has no files here.
          </span>
        </div>
      )}

      {/* File grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="aspect-square rounded-lg" />
              <Skeleton className="h-2.5 w-3/4" />
              <Skeleton className="h-2.5 w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 && !isError ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl gap-3 text-muted-foreground">
          <HardDrive className="w-10 h-10" />
          <p className="text-sm">
            {blobs.length === 0
              ? `No files found on ${server.name} for your account.`
              : 'No files match your search / filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map(blob => (
            <FileCard key={blob.sha256} blob={blob} server={server} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-center gap-3 pt-1">
          <Button variant="outline" size="sm" onClick={goPrevPage} disabled={!hasPrevPage || isLoading}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <Button variant="outline" size="sm" onClick={goNextPage} disabled={!hasNextPage || isLoading}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Audio list */}
      {audioCount > 0 && (filter === 'all' || filter === 'audio') && (
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Music className="w-4 h-4 text-purple-500" /> Audio ({audioCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            {blobs.filter(b => b.type.startsWith('audio/')).map(blob => (
              <div key={blob.sha256} className="flex items-center gap-3 p-2 border rounded-lg">
                <Music className="w-4 h-4 text-purple-500 shrink-0" />
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

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete from {server.name}?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>This will permanently delete the file from <strong>{server.name}</strong>. It may still exist on other Blossom servers.</p>
              {deleteTarget && (
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono break-all">
                  {deleteTarget.sha256}<br />
                  <span className="text-muted-foreground">{formatBytes(deleteTarget.size)} · {deleteTarget.type}</span>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" />Deleting…</> : 'Delete permanently'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ── Overview tab: show counts across all servers ──────────────────────────────

function OverviewPanel({ pubkey }: { pubkey: string }) {
  // Fetch counts from all servers simultaneously
  const results = BLOSSOM_SERVERS.map(server => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, isLoading, isError } = useBlossomFiles(server, pubkey, undefined, true);
    return { server, data: data ?? [], isLoading, isError };
  });

  const totalFiles = results.reduce((s, r) => s + r.data.length, 0);
  const totalSize = results.reduce((s, r) => s + r.data.reduce((ss, b) => ss + b.size, 0), 0);

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center gap-3">
          <Globe className="w-6 h-6 text-gray-500" />
          <div>
            <p className="text-xs text-muted-foreground">Total files (all servers)</p>
            <p className="text-2xl font-bold">{results.some(r => r.isLoading) ? '…' : totalFiles + '+'}</p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 flex items-center gap-3">
          <HardDrive className="w-6 h-6 text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Total size (all servers)</p>
            <p className="text-2xl font-bold">{results.some(r => r.isLoading) ? '…' : formatBytes(totalSize)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {results.map(({ server, data, isLoading, isError }) => {
          const colors = SERVER_COLOR_CLASSES[server.color];
          const imgCount = data.filter(b => b.type.startsWith('image/')).length;
          const vidCount = data.filter(b => b.type.startsWith('video/')).length;
          const audCount = data.filter(b => b.type.startsWith('audio/')).length;
          const size = data.reduce((s, b) => s + b.size, 0);

          return (
            <Card key={server.id} className="overflow-hidden">
              <div className={`h-1 ${server.color === 'purple' ? 'bg-purple-500' : server.color === 'orange' ? 'bg-orange-500' : server.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'}`} />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className={`w-4 h-4 ${colors.accent}`} />
                    <span className="font-semibold text-sm">{server.name}</span>
                    <span className="text-xs text-muted-foreground">{server.url.replace('https://', '')}</span>
                  </div>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : isError ? (
                    <div className="flex items-center gap-1 text-xs text-red-500">
                      <AlertCircle className="w-3.5 h-3.5" /> Error
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {data.length}{data.length === PAGE_SIZE ? '+' : ''} files
                    </div>
                  )}
                </div>

                {!isLoading && !isError && (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Size', value: formatBytes(size) },
                      { label: 'Images', value: String(imgCount) },
                      { label: 'Videos', value: String(vidCount) },
                      { label: 'Audio', value: String(audCount) },
                    ].map(s => (
                      <div key={s.label} className="bg-gray-50 dark:bg-gray-800 rounded-lg py-2 px-1">
                        <p className="text-[10px] text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-semibold">{s.value}</p>
                      </div>
                    ))}
                  </div>
                )}
                {isError && (
                  <p className="text-xs text-muted-foreground">Could not connect — server may require auth or your account has no files here.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export function BlossomDashboard() {
  const { user } = useCurrentUser();
  const [activeServer, setActiveServer] = useState<string>('overview');

  if (!user) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <HardDrive className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Log in with Nostr to manage your Blossom files.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-purple-600" />
          Blossom File Manager
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your media files across all Blossom servers
        </p>
      </div>

      {/* Server tabs */}
      <div className="border-b mb-4">
        <div className="flex gap-0 overflow-x-auto">
          {/* Overview tab */}
          <button
            onClick={() => setActiveServer('overview')}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
              activeServer === 'overview'
                ? 'border-gray-900 dark:border-gray-100 text-gray-900 dark:text-gray-100'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Overview
          </button>

          {BLOSSOM_SERVERS.map(server => {
            const colors = SERVER_COLOR_CLASSES[server.color];
            const isActive = activeServer === server.id;
            return (
              <button
                key={server.id}
                onClick={() => setActiveServer(server.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
                  isActive ? colors.tabActive : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                {server.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {activeServer === 'overview' ? (
        <OverviewPanel pubkey={user.pubkey} />
      ) : (
        (() => {
          const server = BLOSSOM_SERVERS.find(s => s.id === activeServer);
          return server ? <ServerPanel server={server} pubkey={user.pubkey} /> : null;
        })()
      )}
    </div>
  );
}
