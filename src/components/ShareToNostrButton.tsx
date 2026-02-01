import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useNostrPublish } from '@/hooks/useNostrPublish';
import { useToast } from '@/hooks/useToast';
import { usePriceConversion } from '@/hooks/usePriceConversion';
import { Zap, Share2 } from 'lucide-react';

interface ShareToNostrButtonProps {
  url: string;
  title: string;
  description?: string;
  defaultContent?: string;
  image?: string;
  price?: string;
  currency?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ShareToNostrButton({
  url,
  title,
  description,
  defaultContent,
  image,
  price,
  currency,
  variant = 'default',
  size = 'default',
  className = '',
}: ShareToNostrButtonProps) {
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const { mutate: publish, isPending } = useNostrPublish();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Get price conversion to sats if price is provided
  const priceInfo = usePriceConversion(price || '0', currency || 'USD');

  // Ensure URL is absolute
  const shareUrl = url.startsWith('http') ? url : `https://traveltelly.com${url}`;

  // Generate default content for the note - simple format like review sharing
  let generatedContent = defaultContent;
  
  if (!generatedContent) {
    generatedContent = `${title}`;
    
    // Add price in sats if available
    if (price && priceInfo.sats) {
      generatedContent += `\n\n💰 ${priceInfo.sats}`;
    }
    
    // Add image URL if available
    if (image) {
      generatedContent += `\n\n${image}`;
    }
    
    // Add link to TravelTelly
    generatedContent += `\n\n📖 View on TravelTelly.com\n${shareUrl}`;
  }

  const handleShare = () => {
    console.log('🔵 Share to Nostr clicked', { user: !!user, url, title });
    
    if (!user) {
      console.log('❌ User not logged in');
      toast({
        title: 'Login required',
        description: 'Please log in to share on Nostr.',
        variant: 'destructive',
      });
      return;
    }

    console.log('✅ Opening share dialog');
    setIsDialogOpen(true);
  };

  const handlePublish = () => {
    const content = customMessage.trim() || generatedContent;
    
    console.log('📤 Publishing to Nostr:', { content, shareUrl, image });

    // Build tags
    const tags: string[][] = [
      ['r', shareUrl],
    ];

    // Add image tag if image is provided
    if (image) {
      tags.push(['image', image]);
    }

    publish(
      {
        kind: 1,
        content,
        tags,
      },
      {
        onSuccess: () => {
          console.log('✅ Published successfully to Nostr');
          toast({
            title: 'Shared to Nostr!',
            description: 'Your note has been published to the Nostr network.',
          });
          setIsDialogOpen(false);
          setCustomMessage('');
        },
        onError: (error) => {
          console.error('❌ Failed to publish to Nostr:', error);
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
            {/* Image Preview */}
            {image && (
              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={image}
                  alt={title}
                  className="w-full max-h-48 object-cover"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Your Message</label>
              <Textarea
                placeholder={generatedContent}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={6}
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
