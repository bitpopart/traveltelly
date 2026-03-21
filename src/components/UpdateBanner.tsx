import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * UpdateBanner
 *
 * Shows a slim, non-blocking bar at the top of the screen when the service
 * worker has downloaded a new version of the app. The user can either click
 * "Update now" to reload immediately, or dismiss the banner and carry on.
 *
 * The banner is triggered by the custom 'sw:update-available' event dispatched
 * in main.tsx when a waiting service worker transitions to 'installed'.
 */
export function UpdateBanner() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const { worker } = (event as CustomEvent<{ worker: ServiceWorker }>).detail;
      setWaitingWorker(worker);
      setDismissed(false);
    };

    window.addEventListener('sw:update-available', handleUpdate);
    return () => window.removeEventListener('sw:update-available', handleUpdate);
  }, []);

  // Also pick up a SW that was already waiting when the component mounted
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setWaitingWorker(reg.waiting);
      }
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell the waiting SW to activate immediately; main.tsx listens for
      // controllerchange and reloads the page.
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  if (!waitingWorker || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between gap-3 px-4 py-2.5 bg-[#b700d7] text-white shadow-lg"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <RefreshCw className="h-4 w-4 shrink-0 animate-spin [animation-duration:2s]" />
        <span>A new version of TravelTelly is ready!</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-3 text-xs font-semibold bg-white text-[#b700d7] hover:bg-white/90"
          onClick={handleUpdate}
        >
          Update now
        </Button>
        <button
          aria-label="Dismiss update notification"
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
