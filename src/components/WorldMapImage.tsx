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
    <div className={className}>
      {/* World map container - strictly constrained */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg relative" style={{ height: '500px', overflow: 'hidden' }}>
        {svgContent ? (
          <div 
            className="world-map-svg-container"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{
              width: '100%',
              height: '500px',
              overflow: 'hidden',
            }}
          />
        ) : (
          <div className="w-full flex items-center justify-center" style={{ height: '500px' }}>
            <div className="text-muted-foreground">Loading map...</div>
          </div>
        )}

        {/* Counter badge */}
        {visitedCountries.length > 0 && (
          <div className="absolute top-4 right-4 bg-yellow-400 px-3 py-1.5 rounded-lg shadow-lg">
            <div className="text-xl font-bold text-black">
              {visitedCountries.length}
            </div>
            <div className="text-xs font-semibold text-black">
              visited
            </div>
          </div>
        )}
      </div>

      {/* Add global styles for SVG - force width constraint */}
      <style>{`
        .world-map-svg-container svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
        }
        .world-map-svg-container path {
          fill: #e5e7eb;
          stroke: #9ca3af;
          stroke-width: 0.3;
          transition: fill 0.3s ease;
        }
        .world-map-svg-container path:hover {
          fill: #d1d5db;
        }
      `}</style>
    </div>
  );
}
