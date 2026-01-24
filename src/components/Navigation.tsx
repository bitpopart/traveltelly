import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReviewPermissions } from '@/hooks/useReviewPermissions';
import {
  Home,
  BookOpen,
  Star,
  Store,
  Settings,
  Shield,
  Menu,
  X,
  Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const location = useLocation();
  const { user } = useCurrentUser();
  const { isAdmin } = useReviewPermissions();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const allNavItems = [
    { path: '/', label: 'Home', icon: Home, color: '#393636', hoverColor: '#2a2828' },
    { path: '/reviews', label: 'Reviews', icon: Star, color: '#27b0ff', hoverColor: '#1a9fe6' },
    { path: '/stories', label: 'Stories', icon: BookOpen, color: '#b2d235', hoverColor: '#9dbf2e' },
    { path: '/marketplace', label: 'Marketplace', icon: Store, color: '#ec1a58', hoverColor: '#d3164d' },
    { path: '/simple-map-demo', label: 'Map', icon: Map, adminOnly: true, color: '#393636', hoverColor: '#2a2828' },
  ];

  // Filter nav items based on admin status
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const NavButton = ({ path, label, icon: Icon, color, hoverColor, mobile = false }: {
    path: string;
    label: string;
    icon: React.ElementType;
    color: string;
    hoverColor: string;
    mobile?: boolean;
  }) => (
    <Link to={path} onClick={() => mobile && setIsMobileMenuOpen(false)}>
      <Button
        variant={isActive(path) ? "default" : "ghost"}
        className={cn(
          "flex items-center gap-2 rounded-full",
          mobile ? "w-full justify-start" : "",
          isActive(path) && "text-white"
        )}
        style={isActive(path) ? { backgroundColor: color } : {}}
        onMouseEnter={(e) => {
          if (!isActive(path)) {
            e.currentTarget.style.backgroundColor = color;
            e.currentTarget.style.color = 'white';
          } else {
            e.currentTarget.style.backgroundColor = hoverColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive(path)) {
            e.currentTarget.style.backgroundColor = '';
            e.currentTarget.style.color = '';
          } else {
            e.currentTarget.style.backgroundColor = color;
          }
        }}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Button>
    </Link>
  );

  return (
    <nav className={cn("bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50", className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/traveltelly-logo.png" 
              alt="Traveltelly" 
              className="h-5 md:h-6 w-auto dark:invert"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                color={item.color}
                hoverColor={item.hoverColor}
              />
            ))}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="rounded-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm" className="rounded-full" style={{ borderColor: '#393636', color: '#393636' }}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <LoginArea className="max-w-48" />
              </>
            ) : (
              <LoginArea className="max-w-48" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-2">
            {navItems.map((item) => (
              <NavButton
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                color={item.color}
                hoverColor={item.hoverColor}
                mobile
              />
            ))}

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {user ? (
                <>
                  <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full justify-start rounded-full" style={{ borderColor: '#393636', color: '#393636' }}>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Button>
                    </Link>
                  )}
                  <div className="px-3 py-2">
                    <LoginArea className="w-full" />
                  </div>
                </>
              ) : (
                <div className="px-3 py-2">
                  <LoginArea className="w-full" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}