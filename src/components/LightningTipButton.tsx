import { Button } from '@/components/ui/button';
import { LightningZapDialog } from '@/components/LightningZapDialog';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Zap } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface LightningTipButtonProps {
  recipientPubkey: string;
  event?: NostrEvent;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  showText?: boolean;
  disabled?: boolean;
}

export function LightningTipButton({ 
  recipientPubkey, 
  event, 
  variant = 'outline',
  size = 'sm',
  className = '',
  showText = true,
  disabled = false
}: LightningTipButtonProps) {
  const { user } = useCurrentUser();

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  // Don't allow tipping yourself
  if (user.pubkey === recipientPubkey) {
    return null;
  }

  const baseClassName = variant === 'outline' 
    ? 'text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30'
    : variant === 'default'
    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-200'
    : '';

  return (
    <LightningZapDialog recipientPubkey={recipientPubkey} event={event}>
      <Button 
        variant={variant}
        size={size}
        className={`${baseClassName} ${className}`}
        disabled={disabled}
      >
        <Zap className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} ${showText ? 'mr-1' : ''} fill-current`} />
        {showText && '⚡ Tip'}
      </Button>
    </LightningZapDialog>
  );
}