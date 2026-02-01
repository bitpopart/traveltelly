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
    ? 'bg-orange-600 hover:bg-orange-700 text-white border-0 shadow-lg hover:shadow-xl'
    : 'text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30 dark:border-orange-600';

  const sizeClasses = size === 'default' ? 'h-10 px-4' : size === 'lg' ? 'h-12 px-6' : 'h-8 px-3';

  return (
    <LightningZapDialog recipientPubkey={authorPubkey} event={event}>
      <Button
        variant={variant === 'prominent' ? 'default' : 'outline'}
        size={size}
        className={`rounded-full ${sizeClasses} ${baseClasses} transition-all duration-200 ${className}`}
      >
        <Zap className={`${size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} mr-2 fill-current`} />
        Zap
      </Button>
    </LightningZapDialog>
  );
}