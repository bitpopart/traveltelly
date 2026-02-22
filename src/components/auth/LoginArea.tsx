// NOTE: This file is stable and usually should not be modified.
// It is important that all functionality in this file is preserved, and should only be modified if explicitly requested.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import LoginDialog from './LoginDialog';
import SignupDialog from './SignupDialog';
import { useLoggedInAccounts } from '@/hooks/useLoggedInAccounts';
import { AccountSwitcher } from './AccountSwitcher';
import { cn } from '@/lib/utils';

export interface LoginAreaProps {
  className?: string;
}

export function LoginArea({ className }: LoginAreaProps) {
  const { currentUser } = useLoggedInAccounts();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [signupDialogOpen, setSignupDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setLoginDialogOpen(false);
    setSignupDialogOpen(false);
    // Redirect to profile page after successful login
    navigate('/my-travels');
  };

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      {currentUser ? (
        <AccountSwitcher onAddAccountClick={() => setLoginDialogOpen(true)} />
      ) : (
        <Button
          onClick={() => setLoginDialogOpen(true)}
          className='flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground w-full font-medium transition-all hover:bg-primary/90 animate-scale-in'
        >
          <User className='w-4 h-4' />
          <span className='truncate'>Log in</span>
        </Button>
      )}

      <LoginDialog
        isOpen={loginDialogOpen} 
        onClose={() => setLoginDialogOpen(false)} 
        onLogin={handleLogin}
        onSignup={() => {
          setLoginDialogOpen(false);
          // Small delay to ensure login dialog closes before signup opens
          setTimeout(() => setSignupDialogOpen(true), 150);
        }}
      />

      <SignupDialog
        isOpen={signupDialogOpen}
        onClose={() => setSignupDialogOpen(false)}
      />
    </div>
  );
}