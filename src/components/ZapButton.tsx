import { Button } from '@/components/ui/button';
import { LightningZapDialog } from '@/components/LightningZapDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Zap } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface ZapButtonProps {
  authorPubkey: string;
  event?: NostrEvent;
  className?: string;
  variant?: 'default' | 'prominent';
  size?: 'sm' | 'default' | 'lg';
}

export function ZapButton({
  authorPubkey,
  event,
  className = '',
  variant = 'default',
  size = 'sm'
}: ZapButtonProps) {
  const { user } = useCurrentUser();

  // Don't allow zapping yourself
  if (user && user.pubkey === authorPubkey) {
    return null;
  }

  const baseClasses = variant === 'prominent'
    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 shadow-lg hover:shadow-xl'
    : 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 dark:border-yellow-600';

  const sizeClasses = size === 'default' ? 'h-10 px-4' : size === 'lg' ? 'h-12 px-6' : 'h-8 px-3';

  return (
    <LightningZapDialog recipientPubkey={authorPubkey} event={event}>
      <Button
        variant={variant === 'prominent' ? 'default' : 'outline'}
        size={size}
        className={`${sizeClasses} ${baseClasses} transition-all duration-200 ${className}`}
      >
        <Zap className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-2 fill-current`} />
        ⚡ Zap
      </Button>
    </LightningZapDialog>
  );
}