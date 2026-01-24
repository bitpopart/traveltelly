import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/useToast';
import { Share2, Twitter, Facebook, Link as LinkIcon, MessageCircle } from 'lucide-react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ShareButton({
  url,
  title,
  description,
  image,
  variant = 'ghost',
  size = 'sm',
  className = '',
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  // Ensure URL is absolute
  const shareUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied!',
        description: 'Share link has been copied to clipboard.',
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: 'Failed to copy',
        description: 'Could not copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || title,
          url: shareUrl,
        });
        setIsOpen(false);
      } catch (error) {
        // User cancelled or share failed
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }
  };

  const shareToTwitter = () => {
    const text = description ? `${title} - ${description}` : title;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  const shareToTelegram = () => {
    const text = description ? `${title} - ${description}` : title;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'width=550,height=420');
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`rounded-full ${className}`}>
          <Share2 className="w-4 h-4 mr-1" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {navigator.share && (
          <DropdownMenuItem onClick={handleNativeShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleCopyLink}>
          <LinkIcon className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTwitter}>
          <Twitter className="w-4 h-4 mr-2" />
          Share on X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareToTelegram}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Share on Telegram
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
