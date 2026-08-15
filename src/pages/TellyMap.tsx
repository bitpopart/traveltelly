import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

  // Route the iframe's tag chips: clicking a city/country chip posts
  // tellymap:nav {path:'/bangkok'} — we navigate the SPA (no reload) and ack
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin && e.origin !== window.location.origin && e.origin !== 'null') return;
      if (!e.data || e.data.type !== 'tellymap:nav' || typeof e.data.path !== 'string') return;
      const { path } = e.data;
      try {
        e.source?.postMessage?.({ type: 'tellymap:nav-ack', path }, { targetOrigin: window.location.origin });
      } catch { /* ignored */ }
      navigate(path);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [navigate]);

  // Send once on iframe load
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => { setIframeReady(true); sendAuth(); };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, []);

  // Re-send whenever permissions resolve (Nostr query may complete after load)
  useEffect(() => {
    if (iframeReady) sendAuth();
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
