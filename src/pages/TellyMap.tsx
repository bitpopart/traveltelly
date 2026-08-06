import { useEffect, useRef, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';

/**
 * TellyMap — full-screen personal travel photo-pin map.
 *
 * The telly-map.html has its own branded header (TellyMap · by traveltelly)
 * with a home link, so no React nav is shown here. The page takes the full
 * viewport.
 *
 * Permissions: after the iframe loads, we postMessage the user's pubkey and
 * canAddPins flag so the map gates the "+ Add pins" button behind the same
 * Nostr permission grants used elsewhere on the site.
 */
export default function TellyMap() {
  const { user } = useCurrentUser();
  const { hasPermission, isAdmin } = useReviewPermissions();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  const sendAuth = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      iframe.contentWindow?.postMessage(
        {
          type: 'tellymap:auth',
          pubkey: user?.pubkey ?? null,
          canAddPins: !!(user && (hasPermission || isAdmin)),
        },
        window.location.origin
      );
    } catch { /* cross-origin sandbox — silently ignored */ }
  };

  // Send once on iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => { setIframeReady(true); sendAuth(); };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-send whenever permissions resolve (Nostr query may complete after load)
  useEffect(() => {
    if (iframeReady) sendAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeReady, user?.pubkey, hasPermission, isAdmin]);

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Standard Traveltelly nav — keeps the toggle pill and all menu items */}
      <Navigation />

      {/* Map fills everything below the nav (Navigation already renders its own h-16 spacer) */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <iframe
          ref={iframeRef}
          src="/telly-map.html"
          title="TellyMap – your personal travel photo map"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
          allow="geolocation; camera"
        />
      </div>
    </div>
  );
}
