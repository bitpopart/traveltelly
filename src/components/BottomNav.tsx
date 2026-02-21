import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, BookOpen, MapPin, Camera, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useState } from 'react';
import LoginDialog from '@/components/auth/LoginDialog';
import { useIsMobile } from '@/hooks/useIsMobile';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const isMobile = useIsMobile();
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  // Don't show bottom nav on desktop
  if (!isMobile) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/my-travels' && location.pathname === '/my-travels') return true;
    if (path !== '/my-travels' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleProfileClick = () => {
    if (user) {
      navigate('/my-travels');
    } else {
      setShowLoginDialog(true);
    }
  };

  const navItems = [
    { 
      path: '/reviews', 
      icon: Star, 
      color: '#27b0ff'
    },
    { 
      path: '/stories', 
      icon: BookOpen, 
      color: '#b2d235'
    },
    { 
      path: '/community', 
      icon: Users, 
      color: '#9333ea'
    },
    { 
      path: 'profile', // Special case - handled by onClick
      icon: User, 
      color: '#ff8c00',
      isProfile: true
    },
    { 
      path: '/trips', 
      icon: MapPin, 
      color: '#ffcc00'
    },
    { 
      path: '/marketplace', 
      icon: Camera, 
      color: '#ec1a58'
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="grid grid-cols-6 h-20 items-center px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isProfile ? isActive('/my-travels') : isActive(item.path);
            
            if (item.isProfile) {
              return (
                <button
                  key={item.path}
                  onClick={handleProfileClick}
                  className="flex items-center justify-center"
                >
                  <div 
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                      active && "scale-110 shadow-lg"
                    )}
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center justify-center"
              >
                <div 
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all",
                    active && "scale-110 shadow-lg"
                  )}
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add padding to the bottom of the page to prevent content from being hidden */}
      <div className="h-20 md:hidden" />

      {/* Login Dialog */}
      {showLoginDialog && (
        <LoginDialog
          isOpen={showLoginDialog}
          onClose={() => setShowLoginDialog(false)}
          onLogin={() => {
            setShowLoginDialog(false);
            navigate('/my-travels');
          }}
        />
      )}
    </>
  );
}
