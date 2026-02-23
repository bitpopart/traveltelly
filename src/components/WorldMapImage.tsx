import { useMemo, useEffect, useState } from 'react';

interface WorldMapImageProps {
  visitedCountries: string[];
  className?: string;
}

// World map using marked-up SVG from https://github.com/benhodgson/markedup-svg-worldmap
// All countries are marked with 'cc' attributes containing ISO 3166-1 alpha-2 country codes
export function WorldMapImage({ visitedCountries, className = '' }: WorldMapImageProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const [loadError, setLoadError] = useState<boolean>(false);
  const visitedSet = useMemo(() => new Set(visitedCountries.map(c => c.toLowerCase())), [visitedCountries]);

  useEffect(() => {
    // Load the marked-up SVG file - use absolute path from document origin
    const mapUrl = `${window.location.origin}/world-map-marked.svg`;
    fetch(mapUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(svg => {
        setSvgContent(svg);
        setLoadError(false);
      })
      .catch(error => {
        console.error('Error loading world map:', error);
        console.error('Attempted URL:', mapUrl);
        setLoadError(true);
      });
  }, []);

  useEffect(() => {
    if (!svgContent) return;

    // After SVG is loaded, reset all countries then highlight visited ones
    const timer = setTimeout(() => {
      // First, reset all country elements to default style
      const allCountries = document.querySelectorAll('.world-map-svg-container [cc]');
      allCountries.forEach((element) => {
        const htmlElement = element as HTMLElement;
        htmlElement.style.fill = '#e5e7eb'; // Light gray
        htmlElement.style.fillOpacity = '1';
        htmlElement.style.stroke = '#9ca3af'; // Gray stroke
        htmlElement.style.strokeWidth = '0.5';
      });

      // Then highlight visited countries
      let highlightedCount = 0;
      visitedCountries.forEach(code => {
        const lowerCode = code.toLowerCase();
        // Select elements with cc attribute matching the country code (case insensitive)
        const elements = document.querySelectorAll(`.world-map-svg-container [cc="${lowerCode}"]`);
        
        elements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          htmlElement.style.fill = '#ffcc00'; // Yellow
          htmlElement.style.fillOpacity = '0.9';
          htmlElement.style.stroke = '#f59e0b'; // Orange border
          htmlElement.style.strokeWidth = '1';
          highlightedCount++;
        });
        
        if (elements.length === 0) {
          console.log(`Country code "${code}" not found in SVG`);
        }
      });
      
      console.log(`Highlighted countries for ${visitedCountries.length} codes (${highlightedCount} SVG elements)`);
    }, 100);

    return () => clearTimeout(timer);
  }, [svgContent, visitedCountries]);

  return (
    <div className={className}>
      {/* World map container */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg relative" style={{ height: '500px', overflow: 'hidden' }}>
        {svgContent ? (
          <div 
            className="world-map-svg-container"
            dangerouslySetInnerHTML={{ __html: svgContent }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        ) : loadError ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="text-muted-foreground">Unable to load world map</div>
              <div className="text-xs text-muted-foreground">
                Selected {visitedCountries.length} {visitedCountries.length === 1 ? 'country' : 'countries'}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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

      {/* Add global styles for SVG */}
      <style>{`
        .world-map-svg-container svg {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
        .world-map-svg-container [cc] {
          fill: #e5e7eb;
          stroke: #9ca3af;
          stroke-width: 0.5px;
          transition: fill 0.3s ease, stroke 0.3s ease;
          cursor: pointer;
        }
        .world-map-svg-container [cc]:hover {
          fill: #d1d5db;
          stroke: #6b7280;
        }
        #bg {
          fill: #f9fafb;
        }
      `}</style>
    </div>
  );
}
