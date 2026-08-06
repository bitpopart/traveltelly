import { useEffect, useRef } from 'react';
import { Navigation } from '@/components/Navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';

/**
 * TellyMap — full-screen personal photo-pin map embedded as an iframe.
 * The map is the telly-map.html experience: offline vector world, GPS-extracted
 * photo pins, clip pins, Earthly (earthly.city) Nostr geo-layer integration
 * (kind 37515 datasets), and live OSM street detail.
 *
 * The iframe gets the full viewport below the fixed nav bar.
 */
export default function TellyMap() {
  const { user } = useCurrentUser();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Pass the logged-in user's pubkey into the iframe so it can pre-fill
  // Earthly relay queries with the user's own identity.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const onLoad = () => {
      try {
        iframe.contentWindow?.postMessage(
          { type: 'tellymap:init', pubkey: user?.pubkey ?? null },
          '*'
        );
      } catch {
        // cross-origin – silently ignored
      }
    };

    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [user?.pubkey]);

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Fixed top nav */}
      <Navigation />

      {/* Full-height map frame — sits directly below the 64px nav */}
      <div className="flex-1 relative" style={{ marginTop: 0 }}>
        <iframe
          ref={iframeRef}
          src="/telly-map.html"
          title="TellyMap – your personal travel photo map"
          className="absolute inset-0 w-full h-full border-0"
          allow="geolocation; camera"
          loading="lazy"
        />
      </div>
    </div>
  );
}
