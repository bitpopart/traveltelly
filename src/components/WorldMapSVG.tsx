import { useMemo } from 'react';

interface WorldMapSVGProps {
  visitedCountries: string[];
  className?: string;
}

// Simple world map SVG with country paths
// This is a simplified version - using basic country shapes for performance
export function WorldMapSVG({ visitedCountries, className = '' }: WorldMapSVGProps) {
  const visitedSet = useMemo(() => new Set(visitedCountries), [visitedCountries]);

  const defaultColor = '#e5e7eb'; // Gray for unvisited
  const visitedColor = '#ffcc00'; // Yellow for visited
  const strokeColor = '#ffffff';
  const strokeWidth = '0.5';

  const isVisited = (code: string) => visitedSet.has(code);

  return (
    <svg
      viewBox="0 0 1000 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="1000" height="500" fill="#f8fafc" />
      
      {/* Countries - Simplified shapes based on approximate positions */}
      {/* North America */}
      <path d="M 100 80 L 180 75 L 200 100 L 190 150 L 150 145 L 120 120 Z" fill={isVisited('US') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="US" />
      <path d="M 100 60 L 180 50 L 200 75 L 180 75 L 100 80 Z" fill={isVisited('CA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CA" />
      <path d="M 190 150 L 200 170 L 180 180 L 170 165 Z" fill={isVisited('MX') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MX" />
      <path d="M 180 180 L 190 195 L 185 205 L 175 200 Z" fill={isVisited('GT') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="GT" />
      <path d="M 185 205 L 195 215 L 190 220 L 180 215 Z" fill={isVisited('PA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PA" />
      <path d="M 205 165 L 220 170 L 215 185 L 200 180 Z" fill={isVisited('CU') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CU" />
      <path d="M 215 185 L 225 190 L 220 195 L 210 190 Z" fill={isVisited('DO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="DO" />
      
      {/* South America */}
      <path d="M 230 230 L 250 235 L 260 270 L 240 275 L 230 250 Z" fill={isVisited('CO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CO" />
      <path d="M 240 275 L 260 280 L 270 320 L 250 325 L 240 300 Z" fill={isVisited('PE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PE" />
      <path d="M 250 325 L 270 330 L 280 370 L 260 375 L 250 350 Z" fill={isVisited('CL') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CL" />
      <path d="M 260 280 L 290 285 L 310 340 L 280 345 L 270 320 Z" fill={isVisited('BR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="BR" />
      <path d="M 250 325 L 270 330 L 275 355 L 260 360 Z" fill={isVisited('AR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AR" />
      <path d="M 230 250 L 245 255 L 240 275 L 225 270 Z" fill={isVisited('EC') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="EC" />
      <path d="M 250 235 L 265 240 L 260 260 L 245 255 Z" fill={isVisited('VE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="VE" />
      
      {/* Europe */}
      <path d="M 450 100 L 470 95 L 475 110 L 460 115 Z" fill={isVisited('GB') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="GB" />
      <path d="M 470 110 L 490 105 L 495 125 L 475 130 Z" fill={isVisited('FR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="FR" />
      <path d="M 490 105 L 510 100 L 515 120 L 495 125 Z" fill={isVisited('DE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="DE" />
      <path d="M 495 125 L 515 120 L 520 145 L 500 150 Z" fill={isVisited('IT') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="IT" />
      <path d="M 475 130 L 495 125 L 490 145 L 470 140 Z" fill={isVisited('ES') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ES" />
      <path d="M 460 130 L 475 125 L 470 140 L 455 135 Z" fill={isVisited('PT') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PT" />
      <path d="M 510 100 L 530 95 L 535 115 L 515 120 Z" fill={isVisited('PL') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PL" />
      <path d="M 500 150 L 520 145 L 525 160 L 505 165 Z" fill={isVisited('GR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="GR" />
      <path d="M 515 120 L 535 115 L 540 135 L 520 140 Z" fill={isVisited('CZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CZ" />
      <path d="M 490 105 L 510 100 L 505 115 L 485 110 Z" fill={isVisited('BE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="BE" />
      <path d="M 485 110 L 505 105 L 500 120 L 480 115 Z" fill={isVisited('NL') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="NL" />
      <path d="M 500 120 L 515 115 L 510 130 L 495 125 Z" fill={isVisited('CH') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CH" />
      <path d="M 510 115 L 525 110 L 520 125 L 505 120 Z" fill={isVisited('AT') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AT" />
      <path d="M 450 80 L 470 75 L 475 90 L 460 95 Z" fill={isVisited('IS') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="IS" />
      <path d="M 465 85 L 485 80 L 490 100 L 470 95 Z" fill={isVisited('NO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="NO" />
      <path d="M 490 85 L 510 80 L 515 100 L 495 105 Z" fill={isVisited('SE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SE" />
      <path d="M 510 90 L 530 85 L 535 105 L 515 110 Z" fill={isVisited('FI') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="FI" />
      <path d="M 520 140 L 545 135 L 550 155 L 530 160 Z" fill={isVisited('RO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="RO" />
      <path d="M 520 145 L 540 140 L 545 155 L 525 160 Z" fill={isVisited('BG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="BG" />
      <path d="M 530 95 L 580 90 L 590 140 L 540 145 Z" fill={isVisited('RU') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="RU" />
      <path d="M 535 115 L 555 110 L 560 130 L 540 135 Z" fill={isVisited('UA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="UA" />
      
      {/* Africa */}
      <path d="M 460 155 L 480 150 L 485 170 L 465 175 Z" fill={isVisited('MA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MA" />
      <path d="M 465 175 L 485 170 L 490 200 L 470 205 Z" fill={isVisited('DZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="DZ" />
      <path d="M 470 205 L 490 200 L 495 230 L 475 235 Z" fill={isVisited('ML') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ML" />
      <path d="M 475 235 L 495 230 L 500 255 L 480 260 Z" fill={isVisited('NG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="NG" />
      <path d="M 490 200 L 510 195 L 515 220 L 495 225 Z" fill={isVisited('LY') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="LY" />
      <path d="M 510 195 L 530 190 L 535 215 L 515 220 Z" fill={isVisited('EG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="EG" />
      <path d="M 495 225 L 515 220 L 520 250 L 500 255 Z" fill={isVisited('SD') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SD" />
      <path d="M 500 255 L 520 250 L 525 280 L 505 285 Z" fill={isVisited('ET') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ET" />
      <path d="M 505 285 L 525 280 L 530 305 L 510 310 Z" fill={isVisited('KE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="KE" />
      <path d="M 510 310 L 530 305 L 535 330 L 515 335 Z" fill={isVisited('TZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="TZ" />
      <path d="M 480 260 L 500 255 L 505 285 L 485 290 Z" fill={isVisited('CD') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CD" />
      <path d="M 485 290 L 505 285 L 510 315 L 490 320 Z" fill={isVisited('AO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AO" />
      <path d="M 490 320 L 510 315 L 515 345 L 495 350 Z" fill={isVisited('ZM') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ZM" />
      <path d="M 495 350 L 515 345 L 520 375 L 500 380 Z" fill={isVisited('ZA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ZA" />
      <path d="M 500 350 L 515 345 L 520 365 L 505 370 Z" fill={isVisited('ZW') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ZW" />
      <path d="M 515 335 L 535 330 L 540 350 L 520 355 Z" fill={isVisited('MZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MZ" />
      <path d="M 520 355 L 535 350 L 540 370 L 525 375 Z" fill={isVisited('MG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MG" />
      <path d="M 475 235 L 490 230 L 495 250 L 480 255 Z" fill={isVisited('GH') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="GH" />
      <path d="M 465 230 L 480 225 L 485 245 L 470 250 Z" fill={isVisited('SN') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SN" />
      
      {/* Asia */}
      <path d="M 550 155 L 575 150 L 580 175 L 555 180 Z" fill={isVisited('TR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="TR" />
      <path d="M 555 180 L 580 175 L 585 195 L 560 200 Z" fill={isVisited('SY') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SY" />
      <path d="M 560 200 L 585 195 L 590 215 L 565 220 Z" fill={isVisited('IQ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="IQ" />
      <path d="M 565 220 L 590 215 L 595 240 L 570 245 Z" fill={isVisited('SA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SA" />
      <path d="M 570 245 L 595 240 L 600 260 L 575 265 Z" fill={isVisited('AE') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AE" />
      <path d="M 590 140 L 640 135 L 650 180 L 600 185 Z" fill={isVisited('KZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="KZ" />
      <path d="M 600 185 L 625 180 L 630 210 L 605 215 Z" fill={isVisited('UZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="UZ" />
      <path d="M 605 215 L 630 210 L 640 245 L 615 250 Z" fill={isVisited('AF') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AF" />
      <path d="M 615 250 L 645 245 L 655 280 L 625 285 Z" fill={isVisited('PK') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PK" />
      <path d="M 625 285 L 660 280 L 675 330 L 640 335 Z" fill={isVisited('IN') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="IN" />
      <path d="M 640 335 L 660 330 L 665 350 L 645 355 Z" fill={isVisited('LK') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="LK" />
      <path d="M 650 180 L 700 175 L 710 220 L 660 225 Z" fill={isVisited('CN') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="CN" />
      <path d="M 660 225 L 685 220 L 690 250 L 665 255 Z" fill={isVisited('MM') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MM" />
      <path d="M 665 255 L 690 250 L 695 275 L 670 280 Z" fill={isVisited('TH') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="TH" />
      <path d="M 670 280 L 695 275 L 700 295 L 675 300 Z" fill={isVisited('MY') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MY" />
      <path d="M 675 300 L 700 295 L 705 320 L 680 325 Z" fill={isVisited('SG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="SG" />
      <path d="M 680 325 L 710 320 L 720 360 L 690 365 Z" fill={isVisited('ID') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="ID" />
      <path d="M 690 250 L 715 245 L 720 270 L 695 275 Z" fill={isVisited('LA') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="LA" />
      <path d="M 695 275 L 720 270 L 725 295 L 700 300 Z" fill={isVisited('VN') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="VN" />
      <path d="M 695 270 L 715 265 L 720 285 L 700 290 Z" fill={isVisited('KH') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="KH" />
      <path d="M 700 295 L 725 290 L 735 320 L 710 325 Z" fill={isVisited('PH') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PH" />
      <path d="M 710 175 L 760 170 L 770 210 L 720 215 Z" fill={isVisited('MN') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="MN" />
      <path d="M 750 215 L 780 210 L 790 240 L 760 245 Z" fill={isVisited('KR') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="KR" />
      <path d="M 780 200 L 820 195 L 830 250 L 790 255 Z" fill={isVisited('JP') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="JP" />
      <path d="M 760 245 L 785 240 L 790 260 L 765 265 Z" fill={isVisited('TW') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="TW" />
      <path d="M 575 180 L 595 175 L 600 195 L 580 200 Z" fill={isVisited('IL') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="IL" />
      <path d="M 580 200 L 600 195 L 605 210 L 585 215 Z" fill={isVisited('JO') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="JO" />
      
      {/* Oceania */}
      <path d="M 780 300 L 850 295 L 870 360 L 800 365 Z" fill={isVisited('AU') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="AU" />
      <path d="M 870 360 L 900 355 L 910 390 L 880 395 Z" fill={isVisited('NZ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="NZ" />
      <path d="M 850 280 L 870 275 L 875 295 L 855 300 Z" fill={isVisited('PG') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="PG" />
      <path d="M 875 295 L 895 290 L 900 310 L 880 315 Z" fill={isVisited('FJ') ? visitedColor : defaultColor} stroke={strokeColor} strokeWidth={strokeWidth} data-country="FJ" />
    </svg>
  );
}
