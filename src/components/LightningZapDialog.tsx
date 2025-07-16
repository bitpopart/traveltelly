import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoginArea } from '@/components/auth/LoginArea';
import { useLightningZap } from '@/hooks/useLightningZap';
import { useAuthor } from '@/hooks/useAuthor';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { genUserName } from '@/lib/genUserName';
import { Zap, Loader2 } from 'lucide-react';
import type { NostrEvent } from '@nostrify/nostrify';

interface LightningZapDialogProps {
  recipientPubkey: string;
  event?: NostrEvent;
  children: React.ReactNode;
}

const PRESET_AMOUNTS = [21, 100, 500, 1000, 5000];

export function LightningZapDialog({ recipientPubkey, event, children }: LightningZapDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(21);
  const [comment, setComment] = useState('');
  const [customAmount, setCustomAmount] = useState('');

  const { sendZap, isZapping } = useLightningZap();
  const { user } = useCurrentUser();
  const author = useAuthor(recipientPubkey);
  const metadata = author.data?.metadata;

  const displayName = metadata?.name || genUserName(recipientPubkey);
  const profileImage = metadata?.picture;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setAmount(numValue);
    }
  };

  const handleSendZap = async () => {
    if (!user) return;

    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return;
    }

    const zapRequest = {
      amount: finalAmount,
      comment: comment.trim(),
      recipientPubkey,
      eventId: event?.id,
      eventCoordinate: event?.kind === 34879 ?
        `${event.kind}:${event.pubkey}:${event.tags.find(([name]) => name === 'd')?.[1]}` :
        undefined,
    };

    const success = await sendZap(zapRequest);
    if (success) {
      setIsOpen(false);
      setComment('');
      setCustomAmount('');
      setAmount(21);
    }
  };

  // Don't allow zapping yourself
  if (user && user.pubkey === recipientPubkey) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Send Lightning Tip to Review Author
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!user ? (
            /* Login Required */
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                You need to be logged in to send Lightning tips.
              </p>
              <LoginArea className="max-w-60 mx-auto" />
            </div>
          ) : (
            <>
          {/* Recipient Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profileImage} alt={displayName} />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                {event ? `Tip for their review: "${event.tags.find(([name]) => name === 'title')?.[1] || 'Review'}"` : 'Tip user'}
              </p>
            </div>
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label>Amount (sats)</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_AMOUNTS.map((presetAmount) => (
                <Button
                  key={presetAmount}
                  variant={amount === presetAmount && !customAmount ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleAmountSelect(presetAmount)}
                  className="text-xs"
                >
                  {presetAmount}
                </Button>
              ))}
            </div>
            <div>
              <Label htmlFor="custom-amount" className="text-sm">Custom amount</Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                min="1"
                className="mt-1"
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add a message with your tip..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground">
              {comment.length}/280 characters
            </p>
          </div>

          {/* Summary */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <Badge variant="secondary" className="text-yellow-700 dark:text-yellow-300">
                <Zap className="w-3 h-3 mr-1" />
                {customAmount || amount} sats
              </Badge>
            </div>
            {comment && (
              <p className="text-xs text-muted-foreground mt-2">
                "{comment}"
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
              disabled={isZapping}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendZap}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              disabled={isZapping || (!customAmount && !amount)}
            >
              {isZapping ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Send Tip
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>💡 Tips are sent via Lightning Network using NIP-57 zaps.</p>
            <p>⚡ You'll need a Lightning wallet or WebLN extension to complete payment.</p>
            <p>🔒 Your tip will be publicly visible on Nostr as a zap receipt.</p>
          </div>
          </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}