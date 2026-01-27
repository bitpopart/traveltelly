import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';

interface ShareLocationButtonProps {
  lat: number;
  lng: number;
  title?: string;
  className?: string;
  variant?: ButtonProps['variant'];
  style?: React.CSSProperties;
}

export function ShareLocationButton({ lat, lng, title, className, variant = 'outline', style }: ShareLocationButtonProps) {
  const openGoogleMaps = () => {
    const query = title ? `${lat},${lng}+(${encodeURIComponent(title)})` : `${lat},${lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openAppleMaps = () => {
    const query = title ? `q=${encodeURIComponent(title)}&ll=${lat},${lng}` : `ll=${lat},${lng}`;
    const url = `https://maps.apple.com/?${query}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={className} style={style}>
          <MapPin className="w-4 h-4 mr-2" />
          Open in Maps
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={openGoogleMaps} className="cursor-pointer">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/>
            <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
          </svg>
          Google Maps
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openAppleMaps} className="cursor-pointer">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#007AFF"/>
            <circle cx="12" cy="9" r="2.5" fill="#FFFFFF"/>
          </svg>
          Apple Maps
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
