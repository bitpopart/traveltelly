import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { Zap, Share2 } from 'lucide-react';

interface ShareToNostrButtonProps {
  url: string;
  title: string;
  description?: string;
  defaultContent?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ShareToNostrButton({
  url,
  title,
  description,
  defaultContent,
  variant = 'default',
  size = 'default',
  className = '',
}: ShareToNostrButtonProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: publish, isPending } = useNostrPublish();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Ensure URL is absolute
  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  // Generate default content for the note
  const generatedContent = defaultContent || `Check out this on Traveltelly:\n\n${title}\n\n${shareUrl}`;

  const handleShare = () => {
    if (!user) {
      toast({
        title: 'Login required',
        description: 'Please log in to share on Nostr.',
        variant: 'destructive',
      });
      return;
    }

    setIsDialogOpen(true);
  };

  const handlePublish = () => {
    const content = customMessage.trim() || generatedContent;

    publish(
      {
        kind: 1,
        content,
        tags: [
          ['r', shareUrl],
        ],
      },
      {
        onSuccess: () => {
          toast({
            title: 'Shared to Nostr!',
            description: 'Your note has been published to the Nostr network.',
          });
          setIsDialogOpen(false);
          setCustomMessage('');
        },
        onError: () => {
          toast({
            title: 'Failed to share',
            description: 'Could not publish to Nostr. Please try again.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`rounded-full ${className}`}
        onClick={handleShare}
        style={variant === 'default' ? { backgroundColor: '#b700d7' } : {}}
      >
        <Zap className="w-4 h-4 mr-2" />
        Share to Nostr
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: '#b700d7' }} />
              Share to Nostr
            </DialogTitle>
            <DialogDescription>
              Customize your message or use the default text below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Message</label>
              <Textarea
                placeholder={generatedContent}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={8}
                className="resize-none text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Edit the message above or leave blank to use the default.
              </p>
            </div>

            <div className="text-sm text-muted-foreground bg-gray-50 dark:bg-gray-900 p-3 rounded-lg max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700">
              <p className="font-semibold mb-2">Preview:</p>
              <p className="whitespace-pre-wrap break-all leading-relaxed">
                {customMessage.trim() || generatedContent}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setCustomMessage('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePublish}
                disabled={isPending || !user}
                style={{ backgroundColor: '#b700d7' }}
                className="text-white"
              >
                {isPending ? 'Publishing...' : 'Publish Note'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
