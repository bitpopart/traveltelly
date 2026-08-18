import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnlimitedSubscription } from '@/components/UnlimitedSubscription';
import { useCustomerSession, useCustomerAccess } from '@/hooks/useCustomers';
import { Crown, CheckCircle } from 'lucide-react';

interface UnlimitedDownloadsDialogProps {
  children?: React.ReactNode;
}

/**
 * Client-facing 'Unlimited Downloads' subscription entry point for the
 * marketplace. Unlike the Nostr-user subscription pill, this dialog works for
 * ANY visitor: a client creates a guest account (name + email) and subscribes
 * to unlimited downloads on the spot (see UnlimitedSubscription). Reuses the
 * same email/guest customer system used by /guest-portal.
 */
export function UnlimitedDownloadsDialog({ children }: UnlimitedDownloadsDialogProps) {
  const [open, setOpen] = useState(false);
  const { session } = useCustomerSession();
  const { hasAccess } = useCustomerAccess(session?.email || null);

  const trigger = children || (
    <button className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-gray-800 text-muted-foreground border border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-[#ec1a58] transition-colors">
      <Crown className="w-3 h-3" />
      Unlimited Downloads
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-600" />
            Unlimited Downloads
          </DialogTitle>
        </DialogHeader>
        {hasAccess ? (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-200">
              <strong>Unlimited Downloads Active</strong>
              <div className="mt-1 text-green-700 dark:text-green-300">
                Your guest account is subscribed. Download any stock photo or video on the marketplace.
              </div>
            </div>
          </div>
        ) : (
          <UnlimitedSubscription onSubscriptionComplete={() => setOpen(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
