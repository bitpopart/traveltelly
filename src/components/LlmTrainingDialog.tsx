import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useMarketplaceSubscription } from '@/hooks/useMarketplaceSubscription';
import { useMarketplaceProducts } from '@/hooks/useMarketplaceProducts';
import { buildTrainingDatasetZip, isVideoLike, type TrainingDatasetProgress } from '@/lib/trainingDataset';
import { Brain, Download, Loader2, Lock, ImagePlus, FileJson, Info } from 'lucide-react';

interface LlmTrainingDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * "LLM Training" access point shown on /marketplace. Unlocked only for users
 * with an active unlimited download subscription: it bundles every marketplace
 * photo (full resolution, metadata embedded) into a ready-to-train dataset
 * (ZIP + manifest.json + manifest.csv).
 */
export function LlmTrainingDialog({
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: LlmTrainingDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = controlledOnOpenChange || setUncontrolledOpen;

  const { user } = useCurrentUser();
  const { data: subscription } = useMarketplaceSubscription(user?.pubkey);
  const hasAccess = subscription?.isActive === true;

  const trigger = children || (
    <Button variant="outline" className="gap-2" style={{ color: '#ec1a58', borderColor: '#ec1a58' }}>
      <Brain className="w-4 h-4" />
      LLM Training
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Brain className="w-6 h-6 text-[#ec1a58]" />
            LLM Training Access
          </DialogTitle>
        </DialogHeader>

        {!user ? (
          <Alert variant="destructive">
            <AlertDescription>
              Please log in to use LLM training access.
            </AlertDescription>
          </Alert>
        ) : !hasAccess ? (
          <div className="space-y-4">
            <Alert variant="default" className="border-gray-200">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <AlertDescription>
                <strong>Included with an unlimited subscription.</strong> Subscribe to the
                marketplace to download the full image dataset for LLM training.
              </AlertDescription>
            </Alert>
            <Button variant="outline" className="gap-2" onClick={() => setIsOpen(false)}>
              <Info className="w-4 h-4" />
              Go to Subscribe
            </Button>
          </div>
        ) : (
          <TrainingDatasetPanel />
        )}
      </DialogContent>
    </Dialog>
  );
}

/** Fetches the catalog and drives the dataset ZIP build. Only mounted while open. */
function TrainingDatasetPanel() {
  const { data: products, isLoading, error } = useMarketplaceProducts();
  const [progress, setProgress] = useState<TrainingDatasetProgress | null>(null);
  const [busy, setBusy] = useState(false);

  const photos = (products ?? []).filter((p) => p.images.length > 0 && !isVideoLike(p));
  const videoCount = (products ?? []).length - photos.length;

  const startDownload = async () => {
    if (!products?.length) return;
    setBusy(true);
    setProgress({ total: photos.length, done: 0, current: '' });
    try {
      await buildTrainingDatasetZip(products, (p) => setProgress(p));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200">
        <Brain className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Included with your unlimited subscription.</strong> Download the full
          dataset of marketplace photos — original resolution with captions, keywords and
          location embedded — ready for LLM / multimodal model training.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center gap-2 py-6 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading marketplace catalog…
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertDescription>Failed to load the marketplace catalog. Try again.</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileJson className="w-5 h-5" /> Dataset contents
            </CardTitle>
            <CardDescription>Bundled from the live marketplace catalog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-[#ec1a58]" />
                <span><strong>{photos.length}</strong> full-resolution photos</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Download className="w-4 h-4" />
                <span><strong>{videoCount}</strong> videos excluded</span>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <li>· Original images, each captioned via XMP/EXIF metadata</li>
              <li>· <code>manifest.json</code> — id, title, caption, keywords, location, source URL</li>
              <li>· <code>manifest.csv</code> — same metadata in tabular form for your pipeline</li>
              <li>· <code>LICENSE.md</code> — usage/license note</li>
            </ul>

            <Button
              size="lg"
              className="w-full gap-2 text-white"
              style={{ backgroundColor: '#ec1a58' }}
              onClick={startDownload}
              disabled={busy || photos.length === 0}
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  {progress?.done || 0}/{progress?.total || 0} images…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download training dataset (ZIP)
                </>
              )}
            </Button>
            {busy && progress?.current && (
              <p className="text-xs text-muted-foreground text-center truncate">
                {progress.current}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
