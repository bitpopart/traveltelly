import { useMemo } from 'react';

interface WorldMapImageProps {
  visitedCountries: string[];
  className?: string;
}

// Simple world map with yellow country overlays
export function WorldMapImage({ visitedCountries, className = '' }: WorldMapImageProps) {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  // Country code to SVG path mapping for highlighting
  // Using simplified country shapes that overlay on the map
  const countryPaths: Record<string, string> = {
    // Major countries - simplified paths positioned to match world map
    US: "M 15,35 L 25,32 L 28,45 L 20,48 Z",
    CA: "M 10,20 L 30,18 L 32,32 L 12,34 Z",
    MX: "M 16,48 L 24,47 L 25,54 L 17,55 Z",
    BR: "M 32,55 L 40,57 L 42,75 L 33,76 Z",
    AR: "M 28,72 L 35,73 L 34,88 L 27,87 Z",
    
    GB: "M 48,32 L 50,31 L 51,34 L 49,35 Z",
    FR: "M 49,35 L 52,34 L 53,39 L 50,40 Z",
    DE: "M 51,33 L 54,32 L 55,36 L 52,37 Z",
    ES: "M 47,39 L 51,38 L 51,43 L 47,43 Z",
    IT: "M 52,38 L 54,37 L 54,43 L 52,44 Z",
    
    RU: "M 55,22 L 90,20 L 92,38 L 57,40 Z",
    CN: "M 75,38 L 88,37 L 90,50 L 76,51 Z",
    IN: "M 70,48 L 77,47 L 78,58 L 71,59 Z",
    AU: "M 82,68 L 93,67 L 94,82 L 83,83 Z",
    
    ZA: "M 54,72 L 59,71 L 60,78 L 55,79 Z",
    EG: "M 55,45 L 58,44 L 59,50 L 56,51 Z",
    JP: "M 88,38 L 91,37 L 92,45 L 89,46 Z",
    
    // Add more countries as needed
  };

  return (
    <div className={`relative ${className}`}>
      {/* World map container */}
      <div className="w-full aspect-[2/1] bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
        {/* Base world map - using a simple, flat PNG */}
        <img 
          src="https://cdn.pixabay.com/photo/2012/04/10/23/04/map-26488_1280.png"
          alt="World Map"
          className="absolute inset-0 w-full h-full object-contain"
          onError={(e) => {
            // Fallback to a solid color if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.style.background = 'linear-gradient(to bottom, #e0f2fe, #f0f9ff)';
            }
          }}
        />

        {/* Overlay SVG for country highlighting */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
        >
          {visitedCountries.map((code) => {
            const path = countryPaths[code];
            if (!path) return null;
            
            return (
              <path
                key={code}
                d={path}
                fill="#ffcc00"
                fillOpacity="0.7"
                stroke="#f59e0b"
                strokeWidth="0.3"
              />
            );
          })}
        </svg>

        {/* Simple counter badge */}
        {visitedCountries.length > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-400 px-4 py-2 rounded-lg shadow-lg">
            <div className="text-2xl font-bold text-black">
              {visitedCountries.length}
            </div>
            <div className="text-xs font-semibold text-black">
              visited
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
