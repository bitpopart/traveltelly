import { useEffect } from 'react';
import { useLoginActions } from '@/hooks/useLoginActions';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import 'nostr-login/dist/style.css';

interface NostrLoginButtonProps {
  onLogin?: () => void;
  className?: string;
}

export function NostrLoginButton({ onLogin, className = '' }: NostrLoginButtonProps) {
  const loginActions = useLoginActions();

  useEffect(() => {
    // Dynamically import and initialize nostr-login
    const initNostrLogin = async () => {
      try {
        const { init } = await import('nostr-login');
        
        // Initialize nostr-login with configuration
        init({
          bunkers: ['nsec.app', 'highlighter.com'],
          darkMode: document.documentElement.classList.contains('dark'),
          methods: ['connect', 'extension', 'readOnly'],
          theme: 'default',
          noBanner: true, // We'll trigger it manually
          onAuth: async (npub: string, options) => {
            console.log('✅ Nostr-login successful:', npub, options);
            
            // Check if window.nostr is available (nostr-login sets this up)
            if (window.nostr) {
              try {
                loginActions.extension();
                onLogin?.();
              } catch (error) {
                console.error('Failed to complete login:', error);
              }
            }
          },
        });

        // Listen for auth events
        document.addEventListener('nlAuth', (e: any) => {
          console.log('nlAuth event:', e.detail);
          if (e.detail.type === 'login' || e.detail.type === 'signup') {
            if (window.nostr) {
              loginActions.extension();
              onLogin?.();
            }
          }
        });
      } catch (error) {
        console.error('Failed to initialize nostr-login:', error);
      }
    };

    initNostrLogin();
  }, [loginActions, onLogin]);

  // Watch for dark mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      document.dispatchEvent(new CustomEvent('nlDarkMode', { detail: isDark }));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    // Launch the nostr-login dialog
    document.dispatchEvent(new CustomEvent('nlLaunch', { detail: 'welcome' }));
  };

  return (
    <Button
      onClick={handleClick}
      className={`rounded-full ${className}`}
      style={{ backgroundColor: '#b700d7' }}
    >
      <LogIn className='w-4 h-4 mr-2' />
      Login with Nostr
    </Button>
  );
}
