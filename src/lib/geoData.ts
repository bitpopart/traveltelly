/**
 * Geographical data structure for organizing media assets
 * World > Continent > Country hierarchy
 */

export interface GeoLocation {
  value: string;
  label: string;
  continent?: string;
}

export interface Continent {
  value: string;
  label: string;
  countries: GeoLocation[];
}

export const CONTINENTS: Continent[] = [
  {
    value: 'africa',
    label: '🌍 Africa',
    countries: [
      { value: 'ZA', label: 'South Africa', continent: 'africa' },
      { value: 'EG', label: 'Egypt', continent: 'africa' },
      { value: 'KE', label: 'Kenya', continent: 'africa' },
      { value: 'MA', label: 'Morocco', continent: 'africa' },
      { value: 'TZ', label: 'Tanzania', continent: 'africa' },
      { value: 'NG', label: 'Nigeria', continent: 'africa' },
      { value: 'ET', label: 'Ethiopia', continent: 'africa' },
      { value: 'GH', label: 'Ghana', continent: 'africa' },
      { value: 'UG', label: 'Uganda', continent: 'africa' },
      { value: 'DZ', label: 'Algeria', continent: 'africa' },
      { value: 'SD', label: 'Sudan', continent: 'africa' },
      { value: 'AO', label: 'Angola', continent: 'africa' },
      { value: 'MZ', label: 'Mozambique', continent: 'africa' },
      { value: 'CI', label: 'Ivory Coast', continent: 'africa' },
      { value: 'CM', label: 'Cameroon', continent: 'africa' },
      { value: 'NE', label: 'Niger', continent: 'africa' },
      { value: 'BF', label: 'Burkina Faso', continent: 'africa' },
      { value: 'ML', label: 'Mali', continent: 'africa' },
      { value: 'MW', label: 'Malawi', continent: 'africa' },
      { value: 'ZM', label: 'Zambia', continent: 'africa' },
      { value: 'SN', label: 'Senegal', continent: 'africa' },
      { value: 'SO', label: 'Somalia', continent: 'africa' },
      { value: 'TD', label: 'Chad', continent: 'africa' },
      { value: 'GN', label: 'Guinea', continent: 'africa' },
      { value: 'RW', label: 'Rwanda', continent: 'africa' },
      { value: 'BJ', label: 'Benin', continent: 'africa' },
      { value: 'TN', label: 'Tunisia', continent: 'africa' },
      { value: 'BI', label: 'Burundi', continent: 'africa' },
      { value: 'SS', label: 'South Sudan', continent: 'africa' },
      { value: 'TG', label: 'Togo', continent: 'africa' },
      { value: 'SL', label: 'Sierra Leone', continent: 'africa' },
      { value: 'LY', label: 'Libya', continent: 'africa' },
      { value: 'LR', label: 'Liberia', continent: 'africa' },
      { value: 'MR', label: 'Mauritania', continent: 'africa' },
      { value: 'CF', label: 'Central African Republic', continent: 'africa' },
      { value: 'ER', label: 'Eritrea', continent: 'africa' },
      { value: 'GM', label: 'Gambia', continent: 'africa' },
      { value: 'BW', label: 'Botswana', continent: 'africa' },
      { value: 'NA', label: 'Namibia', continent: 'africa' },
      { value: 'GA', label: 'Gabon', continent: 'africa' },
      { value: 'LS', label: 'Lesotho', continent: 'africa' },
      { value: 'GW', label: 'Guinea-Bissau', continent: 'africa' },
      { value: 'GQ', label: 'Equatorial Guinea', continent: 'africa' },
      { value: 'MU', label: 'Mauritius', continent: 'africa' },
      { value: 'SZ', label: 'Eswatini', continent: 'africa' },
      { value: 'DJ', label: 'Djibouti', continent: 'africa' },
      { value: 'KM', label: 'Comoros', continent: 'africa' },
      { value: 'CV', label: 'Cape Verde', continent: 'africa' },
      { value: 'ST', label: 'São Tomé and Príncipe', continent: 'africa' },
      { value: 'SC', label: 'Seychelles', continent: 'africa' },
      { value: 'ZW', label: 'Zimbabwe', continent: 'africa' },
    ]
  },
  {
    value: 'asia',
    label: '🌏 Asia',
    countries: [
      { value: 'CN', label: 'China', continent: 'asia' },
      { value: 'JP', label: 'Japan', continent: 'asia' },
      { value: 'IN', label: 'India', continent: 'asia' },
      { value: 'TH', label: 'Thailand', continent: 'asia' },
      { value: 'VN', label: 'Vietnam', continent: 'asia' },
      { value: 'ID', label: 'Indonesia', continent: 'asia' },
      { value: 'MY', label: 'Malaysia', continent: 'asia' },
      { value: 'SG', label: 'Singapore', continent: 'asia' },
      { value: 'PH', label: 'Philippines', continent: 'asia' },
      { value: 'KR', label: 'South Korea', continent: 'asia' },
      { value: 'TR', label: 'Turkey', continent: 'asia' },
      { value: 'SA', label: 'Saudi Arabia', continent: 'asia' },
      { value: 'AE', label: 'United Arab Emirates', continent: 'asia' },
      { value: 'IL', label: 'Israel', continent: 'asia' },
      { value: 'IQ', label: 'Iraq', continent: 'asia' },
      { value: 'AF', label: 'Afghanistan', continent: 'asia' },
      { value: 'PK', label: 'Pakistan', continent: 'asia' },
      { value: 'BD', label: 'Bangladesh', continent: 'asia' },
      { value: 'IR', label: 'Iran', continent: 'asia' },
      { value: 'YE', label: 'Yemen', continent: 'asia' },
      { value: 'SY', label: 'Syria', continent: 'asia' },
      { value: 'JO', label: 'Jordan', continent: 'asia' },
      { value: 'LB', label: 'Lebanon', continent: 'asia' },
      { value: 'PS', label: 'Palestine', continent: 'asia' },
      { value: 'OM', label: 'Oman', continent: 'asia' },
      { value: 'KW', label: 'Kuwait', continent: 'asia' },
      { value: 'QA', label: 'Qatar', continent: 'asia' },
      { value: 'BH', label: 'Bahrain', continent: 'asia' },
      { value: 'LK', label: 'Sri Lanka', continent: 'asia' },
      { value: 'MM', label: 'Myanmar', continent: 'asia' },
      { value: 'KH', label: 'Cambodia', continent: 'asia' },
      { value: 'LA', label: 'Laos', continent: 'asia' },
      { value: 'NP', label: 'Nepal', continent: 'asia' },
      { value: 'BT', label: 'Bhutan', continent: 'asia' },
      { value: 'MN', label: 'Mongolia', continent: 'asia' },
      { value: 'KZ', label: 'Kazakhstan', continent: 'asia' },
      { value: 'UZ', label: 'Uzbekistan', continent: 'asia' },
      { value: 'TJ', label: 'Tajikistan', continent: 'asia' },
      { value: 'KG', label: 'Kyrgyzstan', continent: 'asia' },
      { value: 'TM', label: 'Turkmenistan', continent: 'asia' },
      { value: 'GE', label: 'Georgia', continent: 'asia' },
      { value: 'AM', label: 'Armenia', continent: 'asia' },
      { value: 'AZ', label: 'Azerbaijan', continent: 'asia' },
      { value: 'BN', label: 'Brunei', continent: 'asia' },
      { value: 'TL', label: 'Timor-Leste', continent: 'asia' },
      { value: 'MV', label: 'Maldives', continent: 'asia' },
      { value: 'KP', label: 'North Korea', continent: 'asia' },
      { value: 'TW', label: 'Taiwan', continent: 'asia' },
      { value: 'HK', label: 'Hong Kong', continent: 'asia' },
      { value: 'MO', label: 'Macau', continent: 'asia' },
    ]
  },
  {
    value: 'europe',
    label: '🇪🇺 Europe',
    countries: [
      { value: 'FR', label: 'France', continent: 'europe' },
      { value: 'DE', label: 'Germany', continent: 'europe' },
      { value: 'IT', label: 'Italy', continent: 'europe' },
      { value: 'ES', label: 'Spain', continent: 'europe' },
      { value: 'GB', label: 'United Kingdom', continent: 'europe' },
      { value: 'NL', label: 'Netherlands', continent: 'europe' },
      { value: 'BE', label: 'Belgium', continent: 'europe' },
      { value: 'SE', label: 'Sweden', continent: 'europe' },
      { value: 'NO', label: 'Norway', continent: 'europe' },
      { value: 'DK', label: 'Denmark', continent: 'europe' },
      { value: 'FI', label: 'Finland', continent: 'europe' },
      { value: 'PL', label: 'Poland', continent: 'europe' },
      { value: 'CH', label: 'Switzerland', continent: 'europe' },
      { value: 'AT', label: 'Austria', continent: 'europe' },
      { value: 'GR', label: 'Greece', continent: 'europe' },
      { value: 'PT', label: 'Portugal', continent: 'europe' },
      { value: 'CZ', label: 'Czech Republic', continent: 'europe' },
      { value: 'HU', label: 'Hungary', continent: 'europe' },
      { value: 'RO', label: 'Romania', continent: 'europe' },
      { value: 'BG', label: 'Bulgaria', continent: 'europe' },
      { value: 'HR', label: 'Croatia', continent: 'europe' },
      { value: 'RS', label: 'Serbia', continent: 'europe' },
      { value: 'SK', label: 'Slovakia', continent: 'europe' },
      { value: 'SI', label: 'Slovenia', continent: 'europe' },
      { value: 'LT', label: 'Lithuania', continent: 'europe' },
      { value: 'LV', label: 'Latvia', continent: 'europe' },
      { value: 'EE', label: 'Estonia', continent: 'europe' },
      { value: 'IE', label: 'Ireland', continent: 'europe' },
      { value: 'IS', label: 'Iceland', continent: 'europe' },
      { value: 'LU', label: 'Luxembourg', continent: 'europe' },
      { value: 'MT', label: 'Malta', continent: 'europe' },
      { value: 'CY', label: 'Cyprus', continent: 'europe' },
      { value: 'AL', label: 'Albania', continent: 'europe' },
      { value: 'BA', label: 'Bosnia and Herzegovina', continent: 'europe' },
      { value: 'MK', label: 'North Macedonia', continent: 'europe' },
      { value: 'ME', label: 'Montenegro', continent: 'europe' },
      { value: 'XK', label: 'Kosovo', continent: 'europe' },
      { value: 'BY', label: 'Belarus', continent: 'europe' },
      { value: 'UA', label: 'Ukraine', continent: 'europe' },
      { value: 'MD', label: 'Moldova', continent: 'europe' },
      { value: 'RU', label: 'Russia', continent: 'europe' },
      { value: 'MC', label: 'Monaco', continent: 'europe' },
      { value: 'AD', label: 'Andorra', continent: 'europe' },
      { value: 'SM', label: 'San Marino', continent: 'europe' },
      { value: 'VA', label: 'Vatican City', continent: 'europe' },
      { value: 'LI', label: 'Liechtenstein', continent: 'europe' },
    ]
  },
  {
    value: 'north-america',
    label: '🌎 North America',
    countries: [
      { value: 'US', label: 'United States', continent: 'north-america' },
      { value: 'CA', label: 'Canada', continent: 'north-america' },
      { value: 'MX', label: 'Mexico', continent: 'north-america' },
      { value: 'GT', label: 'Guatemala', continent: 'north-america' },
      { value: 'CU', label: 'Cuba', continent: 'north-america' },
      { value: 'HT', label: 'Haiti', continent: 'north-america' },
      { value: 'DO', label: 'Dominican Republic', continent: 'north-america' },
      { value: 'HN', label: 'Honduras', continent: 'north-america' },
      { value: 'NI', label: 'Nicaragua', continent: 'north-america' },
      { value: 'SV', label: 'El Salvador', continent: 'north-america' },
      { value: 'CR', label: 'Costa Rica', continent: 'north-america' },
      { value: 'PA', label: 'Panama', continent: 'north-america' },
      { value: 'JM', label: 'Jamaica', continent: 'north-america' },
      { value: 'TT', label: 'Trinidad and Tobago', continent: 'north-america' },
      { value: 'BZ', label: 'Belize', continent: 'north-america' },
      { value: 'BS', label: 'Bahamas', continent: 'north-america' },
      { value: 'BB', label: 'Barbados', continent: 'north-america' },
      { value: 'LC', label: 'Saint Lucia', continent: 'north-america' },
      { value: 'GD', label: 'Grenada', continent: 'north-america' },
      { value: 'VC', label: 'Saint Vincent and the Grenadines', continent: 'north-america' },
      { value: 'AG', label: 'Antigua and Barbuda', continent: 'north-america' },
      { value: 'DM', label: 'Dominica', continent: 'north-america' },
      { value: 'KN', label: 'Saint Kitts and Nevis', continent: 'north-america' },
    ]
  },
  {
    value: 'south-america',
    label: '🌎 South America',
    countries: [
      { value: 'BR', label: 'Brazil', continent: 'south-america' },
      { value: 'AR', label: 'Argentina', continent: 'south-america' },
      { value: 'CL', label: 'Chile', continent: 'south-america' },
      { value: 'CO', label: 'Colombia', continent: 'south-america' },
      { value: 'PE', label: 'Peru', continent: 'south-america' },
      { value: 'VE', label: 'Venezuela', continent: 'south-america' },
      { value: 'EC', label: 'Ecuador', continent: 'south-america' },
      { value: 'BO', label: 'Bolivia', continent: 'south-america' },
      { value: 'PY', label: 'Paraguay', continent: 'south-america' },
      { value: 'UY', label: 'Uruguay', continent: 'south-america' },
      { value: 'GY', label: 'Guyana', continent: 'south-america' },
      { value: 'SR', label: 'Suriname', continent: 'south-america' },
      { value: 'GF', label: 'French Guiana', continent: 'south-america' },
      { value: 'FK', label: 'Falkland Islands', continent: 'south-america' },
    ]
  },
  {
    value: 'oceania',
    label: '🌏 Oceania',
    countries: [
      { value: 'AU', label: 'Australia', continent: 'oceania' },
      { value: 'NZ', label: 'New Zealand', continent: 'oceania' },
      { value: 'PG', label: 'Papua New Guinea', continent: 'oceania' },
      { value: 'FJ', label: 'Fiji', continent: 'oceania' },
      { value: 'NC', label: 'New Caledonia', continent: 'oceania' },
      { value: 'PF', label: 'French Polynesia', continent: 'oceania' },
      { value: 'SB', label: 'Solomon Islands', continent: 'oceania' },
      { value: 'VU', label: 'Vanuatu', continent: 'oceania' },
      { value: 'WS', label: 'Samoa', continent: 'oceania' },
      { value: 'GU', label: 'Guam', continent: 'oceania' },
      { value: 'KI', label: 'Kiribati', continent: 'oceania' },
      { value: 'FM', label: 'Micronesia', continent: 'oceania' },
      { value: 'TO', label: 'Tonga', continent: 'oceania' },
      { value: 'PW', label: 'Palau', continent: 'oceania' },
      { value: 'MH', label: 'Marshall Islands', continent: 'oceania' },
      { value: 'NR', label: 'Nauru', continent: 'oceania' },
      { value: 'TV', label: 'Tuvalu', continent: 'oceania' },
    ]
  },
  {
    value: 'antarctica',
    label: '🐧 Antarctica',
    countries: [
      { value: 'AQ', label: 'Antarctica', continent: 'antarctica' },
    ]
  },
];

// Helper function to get all countries
export function getAllCountries(): GeoLocation[] {
  return CONTINENTS.flatMap(continent => continent.countries);
}

// Helper function to get countries by continent
export function getCountriesByContinent(continentValue: string): GeoLocation[] {
  const continent = CONTINENTS.find(c => c.value === continentValue);
  return continent ? continent.countries : [];
}

// Helper function to find continent for a country
export function getContinentForCountry(countryCode: string): string | undefined {
  for (const continent of CONTINENTS) {
    const country = continent.countries.find(c => c.value === countryCode);
    if (country) {
      return continent.value;
    }
  }
  return undefined;
}

// Helper function to get continent label
export function getContinentLabel(continentValue: string): string {
  const continent = CONTINENTS.find(c => c.value === continentValue);
  return continent ? continent.label : continentValue;
}

// Helper function to get country label
export function getCountryLabel(countryCode: string): string {
  const allCountries = getAllCountries();
  const country = allCountries.find(c => c.value === countryCode);
  return country ? country.label : countryCode;
}
