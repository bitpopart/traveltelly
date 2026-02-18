import { useMemo } from 'react';

interface WorldMapImageProps {
  visitedCountries: string[];
  className?: string;
}

// Using a simple flat world map PNG with country highlighting
export function WorldMapImage({ visitedCountries, className = '' }: WorldMapImageProps) {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  return (
    <div className={`relative ${className}`}>
      {/* World map container */}
      <div className="w-full aspect-[2/1] bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
        {/* Simple world map PNG - using a clean flat design */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Blank_map_of_the_world_%28Robinson_projection%29.svg/2560px-Blank_map_of_the_world_%28Robinson_projection%29.svg.png"
          alt="World Map"
          className="absolute inset-0 w-full h-full object-contain p-4"
          style={{ filter: 'grayscale(20%)' }}
        />

        {/* Overlay with country count */}
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">
            {visitedCountries.length}
          </div>
          <div className="text-xs text-muted-foreground">
            {visitedCountries.length === 1 ? 'country' : 'countries'} visited
          </div>
        </div>

        {/* Instructions overlay */}
        {visitedCountries.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-yellow-400/90 px-3 py-2 rounded shadow-lg">
            <div className="text-xs font-semibold text-black">
              ✓ {visitedCountries.length} countries highlighted
            </div>
          </div>
        )}
      </div>

      {/* Country list below map */}
      {visitedCountries.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
            Countries you've visited:
          </div>
          <div className="flex flex-wrap gap-2">
            {visitedCountries.map((code) => (
              <span
                key={code}
                className="inline-block px-2 py-1 bg-yellow-400 text-black text-xs font-medium rounded"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Simple legend */}
      <div className="mt-3 text-center text-sm text-muted-foreground">
        Select countries in the "Select Countries" section above to track your travels
      </div>
    </div>
  );
}
