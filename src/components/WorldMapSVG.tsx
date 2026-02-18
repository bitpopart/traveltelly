import { useMemo } from 'react';

interface WorldMapSVGProps {
  visitedCountries: string[];
  className?: string;
}

// Simplified world map using basic continent shapes
// This creates a recognizable world map silhouette
export function WorldMapSVG({ visitedCountries, className = '' }: WorldMapSVGProps) {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  const defaultColor = '#e5e7eb'; // Gray for unvisited
  const visitedColor = '#ffcc00'; // Yellow for visited
  const oceanColor = '#dbeafe'; // Light blue for ocean
  const strokeColor = '#ffffff';
  const strokeWidth = '0.5';

  const isVisited = (code: string) => visitedSet.has(code);

  // Using a more realistic world map projection
  // Coordinates are approximate but create a recognizable world map shape
  return (
    <svg
      viewBox="0 0 2000 1000"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ocean background */}
      <rect width="2000" height="1000" fill={oceanColor} />
      
      {/* NORTH AMERICA */}
      {/* Canada */}
      <path d="M 150,150 L 180,140 L 220,130 L 280,140 L 340,150 L 380,160 L 400,180 L 420,200 L 400,220 L 380,240 L 360,250 L 340,260 L 320,270 L 280,270 L 240,260 L 200,240 L 180,220 L 160,200 L 150,180 Z M 300,160 L 320,155 L 330,165 L 325,175 L 310,180 Z M 250,170 L 270,165 L 280,175 L 270,185 Z" 
        fill={isVisited('CA') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* USA */}
      <path d="M 160,240 L 200,250 L 250,270 L 300,280 L 350,290 L 400,300 L 420,320 L 410,340 L 390,350 L 360,360 L 320,370 L 280,380 L 240,380 L 200,370 L 160,350 L 140,320 L 145,280 L 155,260 Z M 100,320 L 130,310 L 140,320 L 130,340 L 110,340 Z" 
        fill={isVisited('US') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Mexico */}
      <path d="M 200,370 L 240,380 L 280,390 L 310,400 L 330,420 L 320,440 L 300,450 L 270,455 L 240,450 L 210,440 L 190,420 L 185,395 Z" 
        fill={isVisited('MX') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Central America (simplified) */}
      <path d="M 270,455 L 300,460 L 320,465 L 330,475 L 320,485 L 300,490 L 280,485 L 265,475 Z" 
        fill={isVisited('GT') || isVisited('CR') || isVisited('PA') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Caribbean */}
      <path d="M 350,400 L 370,395 L 380,405 L 375,415 L 360,418 Z" 
        fill={isVisited('CU') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* SOUTH AMERICA */}
      {/* Brazil */}
      <path d="M 380,490 L 420,500 L 460,520 L 490,550 L 510,590 L 520,630 L 520,670 L 510,710 L 490,740 L 470,750 L 440,755 L 410,750 L 390,730 L 380,700 L 375,660 L 370,620 L 365,580 L 360,540 L 365,510 Z" 
        fill={isVisited('BR') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Argentina & Chile */}
      <path d="M 360,700 L 380,730 L 390,770 L 395,810 L 390,850 L 380,880 L 365,900 L 350,910 L 340,900 L 335,870 L 330,830 L 330,790 L 335,750 L 345,720 Z" 
        fill={isVisited('AR') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      <path d="M 320,700 L 335,750 L 330,800 L 325,850 L 320,890 L 315,910 L 305,900 L 300,860 L 300,820 L 305,780 L 310,740 L 315,720 Z" 
        fill={isVisited('CL') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Peru */}
      <path d="M 310,540 L 340,550 L 360,580 L 365,620 L 355,660 L 340,680 L 320,690 L 300,680 L 285,650 L 280,610 L 285,570 Z" 
        fill={isVisited('PE') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Colombia & Venezuela */}
      <path d="M 320,460 L 350,470 L 380,490 L 400,510 L 390,530 L 370,540 L 350,545 L 330,540 L 315,520 L 310,490 Z" 
        fill={isVisited('CO') || isVisited('VE') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* EUROPE */}
      {/* Iceland */}
      <path d="M 800,180 L 830,175 L 850,185 L 845,200 L 820,205 L 805,195 Z" 
        fill={isVisited('IS') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* UK & Ireland */}
      <path d="M 820,250 L 845,245 L 860,255 L 865,270 L 855,285 L 835,290 L 820,285 L 815,270 Z M 805,265 L 815,260 L 820,270 L 815,280 L 805,278 Z" 
        fill={isVisited('GB') || isVisited('IE') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Scandinavia */}
      <path d="M 900,180 L 930,170 L 960,175 L 980,190 L 985,210 L 975,235 L 960,250 L 940,255 L 920,250 L 905,235 L 895,210 Z" 
        fill={isVisited('NO') || isVisited('SE') || isVisited('FI') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Western Europe */}
      <path d="M 850,290 L 880,285 L 910,290 L 925,305 L 920,325 L 905,340 L 880,345 L 860,340 L 845,325 L 845,310 Z" 
        fill={isVisited('FR') || isVisited('BE') || isVisited('NL') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Germany & Poland */}
      <path d="M 920,260 L 950,255 L 980,260 L 1000,275 L 995,295 L 980,310 L 960,315 L 940,310 L 925,295 L 920,280 Z" 
        fill={isVisited('DE') || isVisited('PL') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Spain & Portugal */}
      <path d="M 810,340 L 850,335 L 880,345 L 885,365 L 870,385 L 840,395 L 810,390 L 790,375 L 790,355 Z" 
        fill={isVisited('ES') || isVisited('PT') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Italy */}
      <path d="M 920,330 L 940,325 L 955,335 L 960,355 L 955,380 L 945,405 L 930,420 L 920,415 L 915,395 L 915,370 L 915,350 Z" 
        fill={isVisited('IT') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Greece */}
      <path d="M 990,370 L 1010,365 L 1025,375 L 1025,390 L 1015,405 L 1000,410 L 985,405 L 980,390 Z" 
        fill={isVisited('GR') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Eastern Europe */}
      <path d="M 980,280 L 1020,275 L 1060,285 L 1080,305 L 1075,330 L 1055,345 L 1025,350 L 1000,345 L 985,325 L 980,305 Z" 
        fill={isVisited('UA') || isVisited('RO') || isVisited('BG') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* RUSSIA */}
      <path d="M 1000,200 L 1100,190 L 1200,185 L 1300,190 L 1400,200 L 1500,210 L 1600,220 L 1650,235 L 1680,255 L 1680,280 L 1650,305 L 1600,320 L 1550,325 L 1500,320 L 1450,310 L 1400,295 L 1350,285 L 1300,280 L 1250,280 L 1200,285 L 1150,290 L 1100,290 L 1060,285 L 1030,275 L 1010,260 L 1000,240 Z" 
        fill={isVisited('RU') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* AFRICA */}
      {/* North Africa */}
      <path d="M 790,400 L 850,395 L 900,400 L 950,410 L 990,420 L 1020,435 L 1030,455 L 1020,475 L 1000,490 L 970,500 L 930,505 L 890,505 L 850,500 L 810,490 L 780,475 L 770,455 L 775,430 Z" 
        fill={isVisited('MA') || isVisited('DZ') || isVisited('TN') || isVisited('LY') || isVisited('EG') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* West Africa */}
      <path d="M 780,510 L 820,515 L 860,525 L 890,540 L 900,560 L 890,580 L 870,590 L 840,595 L 810,590 L 785,575 L 775,555 L 775,535 Z" 
        fill={isVisited('NG') || isVisited('GH') || isVisited('SN') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Central Africa */}
      <path d="M 900,560 L 940,570 L 980,585 L 1010,605 L 1020,630 L 1010,660 L 990,680 L 960,690 L 925,690 L 895,680 L 875,660 L 870,635 L 880,605 L 890,585 Z" 
        fill={isVisited('CD') || isVisited('AO') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* East Africa */}
      <path d="M 1020,490 L 1050,495 L 1080,510 L 1095,535 L 1100,565 L 1095,595 L 1085,620 L 1070,640 L 1050,655 L 1030,660 L 1010,655 L 1000,635 L 1000,610 L 1005,580 L 1010,550 L 1015,520 Z" 
        fill={isVisited('ET') || isVisited('KE') || isVisited('TZ') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Southern Africa */}
      <path d="M 960,690 L 990,700 L 1015,720 L 1030,750 L 1035,780 L 1030,810 L 1015,835 L 995,850 L 970,855 L 945,850 L 925,835 L 915,810 L 915,780 L 920,750 L 930,720 L 945,700 Z" 
        fill={isVisited('ZA') || isVisited('ZW') || isVisited('ZM') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Madagascar */}
      <path d="M 1100,700 L 1120,695 L 1135,710 L 1140,735 L 1135,765 L 1125,790 L 1110,805 L 1095,800 L 1085,780 L 1085,755 L 1090,725 Z" 
        fill={isVisited('MG') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* MIDDLE EAST */}
      {/* Turkey */}
      <path d="M 1020,360 L 1060,355 L 1100,360 L 1130,375 L 1125,395 L 1105,405 L 1075,410 L 1045,405 L 1025,390 Z" 
        fill={isVisited('TR') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Middle East countries */}
      <path d="M 1080,410 L 1110,415 L 1140,425 L 1160,445 L 1155,470 L 1140,490 L 1115,500 L 1085,500 L 1060,490 L 1050,470 L 1055,445 L 1070,425 Z" 
        fill={isVisited('SA') || isVisited('AE') || isVisited('IQ') || isVisited('SY') || isVisited('IL') || isVisited('JO') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* ASIA */}
      {/* Central Asia */}
      <path d="M 1200,310 L 1260,305 L 1320,315 L 1360,335 L 1370,360 L 1360,385 L 1335,400 L 1300,405 L 1260,400 L 1225,385 L 1205,360 L 1200,335 Z" 
        fill={isVisited('KZ') || isVisited('UZ') || isVisited('AF') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* India */}
      <path d="M 1340,420 L 1380,425 L 1420,445 L 1450,475 L 1470,515 L 1475,555 L 1465,595 L 1445,625 L 1415,645 L 1380,655 L 1350,650 L 1325,630 L 1310,600 L 1305,565 L 1310,530 L 1320,495 L 1330,460 Z" 
        fill={isVisited('IN') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Pakistan */}
      <path d="M 1260,400 L 1295,405 L 1325,420 L 1340,445 L 1335,475 L 1320,500 L 1295,510 L 1270,510 L 1250,495 L 1240,470 L 1245,440 L 1255,415 Z" 
        fill={isVisited('PK') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* China */}
      <path d="M 1400,280 L 1500,270 L 1600,275 L 1680,290 L 1720,310 L 1740,340 L 1745,375 L 1735,410 L 1710,440 L 1675,460 L 1630,470 L 1580,470 L 1530,460 L 1485,445 L 1450,425 L 1425,400 L 1410,370 L 1405,340 L 1405,310 Z" 
        fill={isVisited('CN') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Southeast Asia */}
      <path d="M 1560,480 L 1595,485 L 1625,500 L 1645,525 L 1650,555 L 1640,585 L 1620,605 L 1590,615 L 1560,615 L 1535,605 L 1520,585 L 1515,560 L 1520,535 L 1535,510 Z" 
        fill={isVisited('TH') || isVisited('VN') || isVisited('MY') || isVisited('LA') || isVisited('KH') || isVisited('MM') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Indonesia */}
      <path d="M 1550,620 L 1590,625 L 1640,635 L 1690,645 L 1720,660 L 1720,680 L 1700,695 L 1660,700 L 1610,695 L 1560,685 L 1530,670 L 1525,650 L 1535,635 Z" 
        fill={isVisited('ID') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Philippines */}
      <path d="M 1700,520 L 1725,515 L 1745,530 L 1750,555 L 1745,580 L 1730,600 L 1710,610 L 1690,605 L 1680,585 L 1680,560 L 1685,540 Z" 
        fill={isVisited('PH') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Japan */}
      <path d="M 1780,310 L 1810,305 L 1835,320 L 1845,345 L 1845,375 L 1835,405 L 1815,430 L 1790,440 L 1765,435 L 1750,415 L 1750,385 L 1755,355 L 1765,330 Z" 
        fill={isVisited('JP') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* South Korea */}
      <path d="M 1750,350 L 1770,345 L 1785,355 L 1790,375 L 1780,395 L 1765,400 L 1750,395 L 1745,380 L 1745,365 Z" 
        fill={isVisited('KR') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* OCEANIA */}
      {/* Australia */}
      <path d="M 1600,700 L 1670,695 L 1740,700 L 1790,715 L 1820,740 L 1840,775 L 1845,815 L 1835,855 L 1810,885 L 1775,905 L 1730,915 L 1680,915 L 1635,905 L 1600,885 L 1575,855 L 1565,815 L 1565,775 L 1575,740 Z" 
        fill={isVisited('AU') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* New Zealand */}
      <path d="M 1880,820 L 1905,815 L 1925,830 L 1930,855 L 1925,885 L 1910,905 L 1890,910 L 1870,905 L 1860,885 L 1860,860 L 1865,840 Z M 1895,910 L 1910,905 L 1920,920 L 1915,940 L 1900,945 L 1885,940 L 1880,925 Z" 
        fill={isVisited('NZ') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Papua New Guinea */}
      <path d="M 1750,620 L 1785,615 L 1815,625 L 1835,645 L 1835,665 L 1820,680 L 1795,685 L 1765,680 L 1745,665 L 1740,645 Z" 
        fill={isVisited('PG') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
      
      {/* Pacific Islands */}
      <path d="M 1880,650 L 1900,645 L 1915,655 L 1915,670 L 1905,680 L 1890,680 L 1880,670 Z" 
        fill={isVisited('FJ') ? visitedColor : defaultColor} 
        stroke={strokeColor} 
        strokeWidth={strokeWidth} 
      />
    </svg>
  );
}
