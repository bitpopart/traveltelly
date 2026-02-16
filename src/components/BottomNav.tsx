import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Star, BookOpen, MapPin, Store, User } from 'lucide-react';
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
      label: 'Reviews', 
      icon: Star, 
      color: '#27b0ff',
      activeColor: '#1a9fe6'
    },
    { 
      path: '/stories', 
      label: 'Stories', 
      icon: BookOpen, 
      color: '#b2d235',
      activeColor: '#9dbf2e'
    },
    { 
      path: 'profile', // Special case - handled by onClick
      label: user ? 'Profile' : 'Login', 
      icon: User, 
      color: '#ff8c00',
      activeColor: '#e67e00',
      isProfile: true
    },
    { 
      path: '/trips', 
      label: 'Trips', 
      icon: MapPin, 
      color: '#ffcc00',
      activeColor: '#e6b800'
    },
    { 
      path: '/marketplace', 
      label: 'Stock', 
      icon: Store, 
      color: '#ec1a58',
      activeColor: '#d3164d'
    },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isProfile ? isActive('/my-travels') : isActive(item.path);
            
            if (item.isProfile) {
              return (
                <button
                  key={item.path}
                  onClick={handleProfileClick}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 transition-colors",
                    active && "bg-gray-50 dark:bg-gray-800"
                  )}
                >
                  <Icon 
                    className="w-6 h-6" 
                    style={{ 
                      color: active ? item.activeColor : item.color,
                      strokeWidth: active ? 2.5 : 2
                    }}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{ 
                      color: active ? item.activeColor : item.color
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 transition-colors",
                  active && "bg-gray-50 dark:bg-gray-800"
                )}
              >
                <Icon 
                  className="w-6 h-6" 
                  style={{ 
                    color: active ? item.activeColor : item.color,
                    strokeWidth: active ? 2.5 : 2
                  }}
                />
                <span 
                  className="text-xs font-medium"
                  style={{ 
                    color: active ? item.activeColor : item.color
                  }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Add padding to the bottom of the page to prevent content from being hidden */}
      <div className="h-16 md:hidden" />

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
