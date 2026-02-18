import { useMemo } from 'react';

interface WorldMapImageProps {
  visitedCountries: string[];
  className?: string;
}

// Using a proper world map image with markers
export function WorldMapImage({ visitedCountries, className = '' }: WorldMapImageProps) {
  // Country code to approximate position mapping (percentage-based)
  const countryPositions: Record<string, { x: number; y: number; size: number }> = {
    // North America
    US: { x: 15, y: 40, size: 8 },
    CA: { x: 15, y: 25, size: 10 },
    MX: { x: 15, y: 52, size: 5 },
    
    // Central America & Caribbean
    GT: { x: 18, y: 55, size: 2 },
    CR: { x: 20, y: 58, size: 1.5 },
    PA: { x: 22, y: 59, size: 2 },
    CU: { x: 23, y: 50, size: 3 },
    DO: { x: 26, y: 52, size: 1.5 },
    
    // South America
    BR: { x: 30, y: 62, size: 9 },
    AR: { x: 27, y: 75, size: 6 },
    CL: { x: 25, y: 75, size: 4 },
    PE: { x: 24, y: 65, size: 4 },
    CO: { x: 24, y: 58, size: 3 },
    VE: { x: 27, y: 58, size: 3 },
    EC: { x: 23, y: 62, size: 2 },
    BO: { x: 27, y: 68, size: 3 },
    PY: { x: 29, y: 72, size: 2 },
    UY: { x: 30, y: 76, size: 2 },
    GY: { x: 28, y: 60, size: 1.5 },
    SR: { x: 29, y: 60, size: 1 },
    
    // Western Europe
    GB: { x: 46, y: 35, size: 2.5 },
    IE: { x: 44, y: 36, size: 1.5 },
    FR: { x: 48, y: 38, size: 3 },
    ES: { x: 46, y: 42, size: 3.5 },
    PT: { x: 44, y: 42, size: 1.5 },
    IT: { x: 50, y: 42, size: 2.5 },
    DE: { x: 50, y: 36, size: 2.5 },
    NL: { x: 49, y: 35, size: 1 },
    BE: { x: 48.5, y: 36, size: 1 },
    CH: { x: 49.5, y: 39, size: 1 },
    AT: { x: 51, y: 38, size: 1.5 },
    LU: { x: 48.8, y: 37, size: 0.5 },
    
    // Northern Europe
    NO: { x: 50, y: 28, size: 3 },
    SE: { x: 52, y: 30, size: 3 },
    FI: { x: 54, y: 28, size: 2.5 },
    DK: { x: 50, y: 34, size: 1 },
    IS: { x: 43, y: 28, size: 1.5 },
    EE: { x: 54, y: 32, size: 1 },
    LV: { x: 53.5, y: 33, size: 1 },
    LT: { x: 53, y: 34, size: 1 },
    
    // Eastern Europe
    PL: { x: 52, y: 36, size: 2 },
    CZ: { x: 51.5, y: 37, size: 1.5 },
    SK: { x: 52.5, y: 38, size: 1 },
    HU: { x: 52, y: 39, size: 1.5 },
    RO: { x: 54, y: 40, size: 2 },
    BG: { x: 54, y: 42, size: 2 },
    GR: { x: 52, y: 43, size: 2 },
    HR: { x: 51, y: 40, size: 1.5 },
    SI: { x: 51, y: 39, size: 1 },
    UA: { x: 56, y: 37, size: 4 },
    BY: { x: 54, y: 35, size: 2 },
    MD: { x: 55, y: 39, size: 1 },
    RS: { x: 52, y: 41, size: 1.5 },
    BA: { x: 51.5, y: 41, size: 1.2 },
    ME: { x: 52, y: 42, size: 0.8 },
    AL: { x: 52, y: 43, size: 1 },
    MK: { x: 52.5, y: 42.5, size: 1 },
    XK: { x: 52.3, y: 42, size: 0.8 },
    
    // Russia
    RU: { x: 65, y: 32, size: 15 },
    
    // North Africa
    MA: { x: 45, y: 48, size: 3 },
    DZ: { x: 48, y: 48, size: 4 },
    TN: { x: 50, y: 46, size: 1.5 },
    LY: { x: 52, y: 48, size: 3 },
    EG: { x: 56, y: 48, size: 2.5 },
    
    // West Africa
    SN: { x: 43, y: 54, size: 1.5 },
    GH: { x: 46, y: 57, size: 1.5 },
    NG: { x: 49, y: 58, size: 2 },
    CI: { x: 45, y: 57, size: 1.5 },
    ML: { x: 45, y: 52, size: 2.5 },
    BF: { x: 46, y: 55, size: 1.5 },
    NE: { x: 49, y: 54, size: 2 },
    GM: { x: 42.5, y: 54, size: 0.8 },
    GN: { x: 44, y: 56, size: 1.2 },
    SL: { x: 43.5, y: 58, size: 1 },
    LR: { x: 44.5, y: 58.5, size: 1 },
    TG: { x: 47, y: 58, size: 0.8 },
    BJ: { x: 48, y: 58, size: 0.8 },
    
    // East Africa
    ET: { x: 58, y: 58, size: 2.5 },
    KE: { x: 58, y: 62, size: 2 },
    TZ: { x: 58, y: 65, size: 2.5 },
    UG: { x: 57, y: 62, size: 1.5 },
    SO: { x: 60, y: 59, size: 2 },
    ER: { x: 58.5, y: 56, size: 1.2 },
    DJ: { x: 59, y: 57, size: 0.7 },
    RW: { x: 57, y: 64, size: 0.8 },
    BI: { x: 57, y: 65, size: 0.7 },
    
    // Central Africa
    CD: { x: 53, y: 63, size: 4 },
    AO: { x: 52, y: 68, size: 2.5 },
    CG: { x: 52, y: 62, size: 1.5 },
    GA: { x: 50, y: 62, size: 1.3 },
    CM: { x: 50, y: 59, size: 1.5 },
    CF: { x: 53, y: 59, size: 2 },
    TD: { x: 51, y: 55, size: 2.5 },
    
    // Southern Africa
    ZA: { x: 54, y: 74, size: 3 },
    ZW: { x: 56, y: 71, size: 1.5 },
    ZM: { x: 55, y: 69, size: 2 },
    MZ: { x: 58, y: 71, size: 2 },
    MG: { x: 60, y: 72, size: 2 },
    BW: { x: 54, y: 72, size: 1.8 },
    NA: { x: 52, y: 72, size: 2 },
    MW: { x: 58, y: 68, size: 1.2 },
    
    // Middle East
    TR: { x: 57, y: 42, size: 3 },
    SA: { x: 60, y: 50, size: 4 },
    AE: { x: 63, y: 52, size: 1.5 },
    IL: { x: 57, y: 48, size: 1 },
    JO: { x: 58, y: 49, size: 1 },
    SY: { x: 58, y: 46, size: 1.5 },
    IQ: { x: 60, y: 47, size: 2 },
    IR: { x: 63, y: 47, size: 3 },
    LB: { x: 57.5, y: 47, size: 0.8 },
    YE: { x: 61, y: 54, size: 1.8 },
    OM: { x: 64, y: 52, size: 1.5 },
    KW: { x: 61, y: 49, size: 0.7 },
    BH: { x: 62, y: 51, size: 0.4 },
    QA: { x: 62.5, y: 51.5, size: 0.6 },
    
    // Central Asia
    KZ: { x: 68, y: 38, size: 5 },
    UZ: { x: 66, y: 43, size: 2.5 },
    AF: { x: 67, y: 46, size: 2.5 },
    PK: { x: 69, y: 48, size: 2.5 },
    TM: { x: 65, y: 43, size: 2 },
    TJ: { x: 68, y: 43, size: 1.3 },
    KG: { x: 70, y: 43, size: 1.5 },
    
    // South Asia
    IN: { x: 72, y: 52, size: 5 },
    BD: { x: 75, y: 52, size: 1.5 },
    LK: { x: 73, y: 58, size: 1 },
    NP: { x: 74, y: 50, size: 1.5 },
    BT: { x: 75, y: 50, size: 0.8 },
    MV: { x: 71, y: 59, size: 0.5 },
    
    // East Asia
    CN: { x: 78, y: 45, size: 8 },
    MN: { x: 78, y: 38, size: 4 },
    JP: { x: 86, y: 43, size: 3 },
    KR: { x: 84, y: 43, size: 1.5 },
    KP: { x: 83, y: 42, size: 1.5 },
    TW: { x: 83, y: 52, size: 1 },
    HK: { x: 81, y: 51, size: 0.4 },
    MO: { x: 80.8, y: 51.2, size: 0.3 },
    
    // Southeast Asia
    TH: { x: 78, y: 55, size: 2 },
    VN: { x: 80, y: 55, size: 2 },
    MY: { x: 79, y: 60, size: 2.5 },
    SG: { x: 79, y: 61, size: 0.5 },
    ID: { x: 81, y: 63, size: 5 },
    PH: { x: 83, y: 56, size: 2.5 },
    MM: { x: 76, y: 53, size: 2 },
    LA: { x: 79, y: 53, size: 1.5 },
    KH: { x: 79.5, y: 56, size: 1.5 },
    BN: { x: 81, y: 60, size: 0.6 },
    TL: { x: 84, y: 65, size: 0.8 },
    
    // Oceania
    AU: { x: 85, y: 72, size: 7 },
    NZ: { x: 92, y: 78, size: 2 },
    PG: { x: 87, y: 64, size: 2 },
    FJ: { x: 93, y: 68, size: 1 },
  };

  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  return (
    <div className={`relative ${className}`}>
      {/* World map using background image */}
      <div className="w-full aspect-[2/1] bg-gray-200 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-600 relative overflow-hidden">
        {/* World map image from public source */}
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Equirectangular_projection_SW.jpg/1280px-Equirectangular_projection_SW.jpg"
          alt="World Map"
          className="absolute inset-0 w-full h-full object-cover opacity-40 dark:opacity-30"
        />

        {/* Visited country markers */}
        {visitedCountries.map((code) => {
          const pos = countryPositions[code];
          if (!pos) return null;

          return (
            <div
              key={code}
              className="absolute rounded-full bg-yellow-400 border-3 border-yellow-600 shadow-xl z-10"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${pos.size}%`,
                height: `${pos.size * 2}%`,
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 0 3px rgba(234, 179, 8, 0.3), 0 4px 6px rgba(0, 0, 0, 0.3)',
              }}
              title={code}
            >
              {/* Pulse animation ring */}
              <div 
                className="absolute inset-0 rounded-full bg-yellow-400 animate-ping"
                style={{ opacity: 0.4 }}
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-yellow-400 border-2 border-yellow-600 shadow" />
          <span className="text-muted-foreground">Visited Countries</span>
        </div>
      </div>
    </div>
  );
}
