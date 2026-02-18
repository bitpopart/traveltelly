import { useMemo, useEffect, useState } from 'react';

interface WorldMapImageProps {
  visitedCountries: string[];
  className?: string;
}

// Simple world map using SimpleMaps SVG with country highlighting
export function WorldMapImage({ visitedCountries, className = '' }: WorldMapImageProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  useEffect(() => {
    // Load the SVG file
    fetch('/world-map.svg')
      .then(response => response.text())
      .then(svg => setSvgContent(svg))
      .catch(error => console.error('Error loading world map:', error));
  }, []);

  useEffect(() => {
    if (!svgContent) return;

    // After SVG is loaded, highlight visited countries
    const timer = setTimeout(() => {
      visitedCountries.forEach(code => {
        const element = document.getElementById(code);
        if (element) {
          element.style.fill = '#ffcc00'; // Yellow
          element.style.fillOpacity = '0.8';
          element.style.stroke = '#f59e0b'; // Darker yellow border
          element.style.strokeWidth = '0.5';
        }
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [svgContent, visitedCountries]);

  return (
    <div className={`relative ${className}`}>
      {/* World map container */}
      <div className="w-full aspect-[2/1] bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
        {svgContent ? (
          <div 
            className="w-full h-full p-4"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{
              // Style the SVG countries
              '& path': {
                fill: '#e5e7eb',
                stroke: '#9ca3af',
                strokeWidth: '0.3',
                transition: 'fill 0.3s ease',
              }
            } as React.CSSProperties}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-muted-foreground">Loading map...</div>
          </div>
        )}

        {/* Counter badge */}
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

      {/* Add global styles for SVG */}
      <style>{`
        #world-map-container path {
          fill: #e5e7eb;
          stroke: #9ca3af;
          stroke-width: 0.3;
          transition: fill 0.3s ease;
        }
        #world-map-container path:hover {
          fill: #d1d5db;
        }
      `}</style>
    </div>
  );
}
