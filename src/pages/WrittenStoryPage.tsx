import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useNostr } from '@nostrify/react';
import { nip19 } from 'nostr-tools';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { NostrEvent } from '@nostrify/nostrify';

// Module-level HTML cache — persists across re-renders and same-session navigation
const htmlCache = new Map<string, string>();

const FILE_RE = /\.(pdf|zip|docx?|xlsx?|pptx?|mp4|mp3|png|jpe?g|gif|svg|webp|exe|dmg|apk)(\?|$)/i;

/**
 * Rewrites download/file links in raw HTML before rendering as srcDoc.
 * Replaces the real href with "#" and stores the URL in data-dl so the browser
 * never navigates away. A small inline script handles the click via postMessage.
 * (Adapted from bitpopart/nostrpop CustomPage.tsx)
 */
function injectDownloadScript(html: string): string {
  const rewritten = html.replace(
    /<a\s([^>]*)>/gi,
    (match, attrs: string) => {
      const hrefMatch = attrs.match(/href=["']([^"']+)["']/i);
      if (!hrefMatch) return match;
      const href = hrefMatch[1];
      const hasDownload = /\bdownload\b/i.test(attrs);
      if (!hasDownload && !FILE_RE.test(href)) return match;
      const newAttrs = attrs
        .replace(/href=["'][^"']*["']/i, `href="#"`)
        .replace(/\btarget=["'][^"']*["']/i, '');
      return `<a ${newAttrs} data-dl="${href}">`;
    }
  );

  const script = `<script>
document.addEventListener('click',function(e){
  var a=e.target&&e.target.closest?e.target.closest('[data-dl]'):null;
  if(!a)return;
  e.preventDefault();e.stopImmediatePropagation();
  window.parent.postMessage({type:'__download__',url:a.getAttribute('data-dl'),filename:a.getAttribute('download')||a.getAttribute('data-dl').split('/').pop()||'download'},'*');
},true);
</script>`;

  if (rewritten.includes('</head>')) return rewritten.replace('</head>', script + '</head>');
  if (rewritten.includes('<body')) return rewritten.replace('<body', script + '<body');
  return script + rewritten;
}

/** Branded loading overlay shown while the iframe loads */
function IframeLoadingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900 transition-opacity duration-500"
      aria-label="Loading page…"
    >
      <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
        <BookOpen className="h-10 w-10 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-sm font-medium">Loading story…</span>
      </div>
    </div>
  );
}

function validateArticleEvent(event: NostrEvent): boolean {
  if (event.kind !== 30023) return false;
  const d = event.tags.find(([name]) => name === 'd')?.[1];
  const title = event.tags.find(([name]) => name === 'title')?.[1];
  if (!d || !title) return false;
  return true;
}

export default function WrittenStoryPage() {
  const { naddr } = useParams<{ naddr: string }>();
  const { nostr } = useNostr();

  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [fetchedHtml, setFetchedHtml] = useState<string | null>(null);
  const [fetchingHtml, setFetchingHtml] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fetchingUrlRef = useRef<string | null>(null);

  // Fetch the Nostr event
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['story-page', naddr],
    queryFn: async (c) => {
      if (!naddr) throw new Error('No story identifier provided');

      let decoded;
      try {
        decoded = nip19.decode(naddr);
      } catch {
        throw new Error('Invalid story identifier');
      }

      if (decoded.type !== 'naddr') {
        throw new Error('Invalid story identifier — expected an naddr');
      }

      const { kind, pubkey, identifier } = decoded.data;
      const signal = AbortSignal.any([c.signal, AbortSignal.timeout(10000)]);
      const events = await nostr.query(
        [{ kinds: [kind], authors: [pubkey], '#d': [identifier] }],
        { signal },
      );

      const valid = events.filter(validateArticleEvent);
      if (valid.length === 0) return null;
      return valid.sort((a, b) => b.created_at - a.created_at)[0];
    },
    enabled: !!naddr,
    retry: 2,
    retryDelay: 1000,
  });

  const brandSite = article?.tags.find(([name]) => name === 'brand_site')?.[1] || '';
  const title = article?.tags.find(([name]) => name === 'title')?.[1] || 'Untitled Story';
  const isRemoteHtml = !!(brandSite && /\.html?(\?|$)/i.test(brandSite));

  // Reset iframe loaded state on brand_site change
  useEffect(() => {
    setIframeLoaded(false);
  }, [brandSite]);

  // Fetch HTML from Blossom URL when needed
  useEffect(() => {
    if (!isRemoteHtml || !brandSite) return;
    if (htmlCache.has(brandSite)) {
      setFetchedHtml(htmlCache.get(brandSite)!);
      return;
    }
    if (fetchingUrlRef.current === brandSite) return;
    fetchingUrlRef.current = brandSite;
    setFetchingHtml(true);
    fetch(brandSite)
      .then(r => r.text())
      .then(html => {
        htmlCache.set(brandSite, html);
        setFetchedHtml(html);
        setFetchingHtml(false);
      })
      .catch(() => setFetchingHtml(false));
  }, [brandSite, isRemoteHtml]);

  // Listen for download requests from within the iframe
  useEffect(() => {
    const handler = async (e: MessageEvent) => {
      if (!e.data || e.data.type !== '__download__') return;
      const { url, filename } = e.data as { type: string; url: string; filename: string };
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || url.split('/').pop() || 'download';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } catch {
        window.open(url, '_blank');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  // Build srcDoc string
  const htmlSrcDoc: string | undefined =
    isRemoteHtml ? (fetchedHtml ?? undefined) : undefined;

  // ── Loading states ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-screen w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Story Not Found</h2>
                  <p className="text-muted-foreground mb-4">
                    This story couldn't be found. It may have been deleted or is on a different relay.
                  </p>
                </div>
                <Link to="/stories?type=write">
                  <Button variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Stories
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If no brand_site, redirect to regular story view
  if (!brandSite) {
    const identifierRaw = article.tags.find(([name]) => name === 'd')?.[1];
    if (identifierRaw) {
      const storyNaddr = nip19.naddrEncode({
        kind: article.kind,
        pubkey: article.pubkey,
        identifier: identifierRaw,
      });
      return (
        <div className="min-h-screen" style={{ backgroundColor: '#f4f4f5' }}>
          <Navigation />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <p className="text-muted-foreground">This story doesn't have an HTML page attached.</p>
              <Link to={`/story/${storyNaddr}`}>
                <Button>Read Story</Button>
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  // ── Full-screen HTML page — loads directly below the Navigation header ──────
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f4f4f5' }}>
      <Navigation />

      {/* Full-height iframe container below the nav */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 64px)' }}>
        {fetchingHtml && !fetchedHtml ? (
          // While fetching HTML from Blossom
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
            <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
              <BookOpen className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-medium">Loading "{title}"…</span>
            </div>
          </div>
        ) : htmlSrcDoc ? (
          // Render fetched HTML as srcDoc (most secure, most compatible)
          <div className="w-full h-full relative">
            <IframeLoadingOverlay visible={!iframeLoaded} />
            <iframe
              ref={iframeRef}
              srcDoc={injectDownloadScript(htmlSrcDoc)}
              title={title}
              className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              onLoad={handleIframeLoad}
            />
          </div>
        ) : brandSite && !isRemoteHtml ? (
          // Plain external URL (not .html file) — use src= directly
          <div className="w-full h-full relative">
            <IframeLoadingOverlay visible={!iframeLoaded} />
            <iframe
              ref={iframeRef}
              src={brandSite}
              title={title}
              className={`w-full h-full border-0 transition-opacity duration-500 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              onLoad={handleIframeLoad}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          </div>
        )}
      </div>
    </div>
  );
}
