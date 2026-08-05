interface EmergencyNumbers {
  police: string;
  ambulance: string;
  fire: string;
  general: string;
  touristHelpline: string;
}

// Verified emergency numbers for top travel destinations.
// Fallback is 112 (EU standard, also works in many countries).
const COUNTRY_EMERGENCY: Record<string, EmergencyNumbers> = {
  US: { police: '911', ambulance: '911', fire: '911', general: '911', touristHelpline: '' },
  CA: { police: '911', ambulance: '911', fire: '911', general: '911', touristHelpline: '' },
  GB: { police: '999', ambulance: '999', fire: '999', general: '999', touristHelpline: '' },
  AU: { police: '000', ambulance: '000', fire: '000', general: '000', touristHelpline: '' },
  NZ: { police: '111', ambulance: '111', fire: '111', general: '111', touristHelpline: '' },
  IN: { police: '100', ambulance: '108', fire: '101', general: '112', touristHelpline: '1363' },
  JP: {
    police: '110',
    ambulance: '119',
    fire: '119',
    general: '119',
    touristHelpline: '050-3816-2787',
  },
  CN: { police: '110', ambulance: '120', fire: '119', general: '110', touristHelpline: '' },
  SG: { police: '999', ambulance: '995', fire: '995', general: '999', touristHelpline: '' },
  TH: { police: '191', ambulance: '1669', fire: '199', general: '191', touristHelpline: '1155' },
  ID: { police: '110', ambulance: '118', fire: '113', general: '112', touristHelpline: '' },
  MY: {
    police: '999',
    ambulance: '999',
    fire: '994',
    general: '999',
    touristHelpline: '1-300-88-5050',
  },
  PH: {
    police: '117',
    ambulance: '912',
    fire: '911',
    general: '911',
    touristHelpline: '1-800-10-872-6648',
  },
  VN: { police: '113', ambulance: '115', fire: '114', general: '113', touristHelpline: '' },
  AE: { police: '999', ambulance: '998', fire: '997', general: '999', touristHelpline: '800-4438' },
  SA: { police: '999', ambulance: '997', fire: '998', general: '999', touristHelpline: '' },
  EG: { police: '122', ambulance: '123', fire: '180', general: '122', touristHelpline: '' },
  ZA: { police: '10111', ambulance: '10177', fire: '10177', general: '112', touristHelpline: '' },
  MX: { police: '911', ambulance: '911', fire: '911', general: '911', touristHelpline: '078' },
  BR: { police: '190', ambulance: '192', fire: '193', general: '190', touristHelpline: '' },
  AR: { police: '911', ambulance: '107', fire: '100', general: '911', touristHelpline: '' },
  FR: { police: '17', ambulance: '15', fire: '18', general: '112', touristHelpline: '' },
  DE: { police: '110', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  IT: { police: '113', ambulance: '118', fire: '115', general: '112', touristHelpline: '' },
  ES: { police: '091', ambulance: '061', fire: '080', general: '112', touristHelpline: '' },
  PT: { police: '112', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  GR: { police: '100', ambulance: '166', fire: '199', general: '112', touristHelpline: '171' },
  TR: { police: '155', ambulance: '112', fire: '110', general: '112', touristHelpline: '174' },
  NL: { police: '0900-8844', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  CH: { police: '117', ambulance: '144', fire: '118', general: '112', touristHelpline: '' },
  AT: { police: '133', ambulance: '144', fire: '122', general: '112', touristHelpline: '' },
  BE: { police: '101', ambulance: '100', fire: '100', general: '112', touristHelpline: '' },
  SE: { police: '114 14', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  NO: { police: '112', ambulance: '113', fire: '110', general: '112', touristHelpline: '' },
  DK: { police: '114', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  PL: { police: '997', ambulance: '999', fire: '998', general: '112', touristHelpline: '' },
  CZ: { police: '158', ambulance: '155', fire: '150', general: '112', touristHelpline: '' },
  HU: { police: '107', ambulance: '104', fire: '105', general: '112', touristHelpline: '' },
  RO: { police: '112', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
  KR: { police: '112', ambulance: '119', fire: '119', general: '112', touristHelpline: '1330' },
  IL: { police: '100', ambulance: '101', fire: '102', general: '100', touristHelpline: '' },
  MA: { police: '19', ambulance: '15', fire: '15', general: '19', touristHelpline: '' },
  KE: { police: '999', ambulance: '999', fire: '999', general: '999', touristHelpline: '' },
  NG: { police: '112', ambulance: '112', fire: '112', general: '112', touristHelpline: '' },
};

const DEFAULT_EMERGENCY: EmergencyNumbers = {
  police: '112',
  ambulance: '112',
  fire: '112',
  general: '112',
  touristHelpline: '',
};

// Normalize ISO 3166-1 alpha-3 codes that LLMs commonly return (e.g. "IND" → "IN").
const ALPHA3_TO_ALPHA2: Record<string, string> = {
  IND: 'IN',
  GBR: 'GB',
  FRA: 'FR',
  DEU: 'DE',
  JPN: 'JP',
  CHN: 'CN',
  ITA: 'IT',
  ESP: 'ES',
  PRT: 'PT',
  GRC: 'GR',
  TUR: 'TR',
  AUS: 'AU',
  NZL: 'NZ',
  USA: 'US',
  CAN: 'CA',
  BRA: 'BR',
  ARG: 'AR',
  MEX: 'MX',
  ZAF: 'ZA',
  EGY: 'EG',
  SAU: 'SA',
  ARE: 'AE',
  SGP: 'SG',
  THA: 'TH',
  IDN: 'ID',
  MYS: 'MY',
  PHL: 'PH',
  VNM: 'VN',
  KOR: 'KR',
  ISR: 'IL',
  MAR: 'MA',
  KEN: 'KE',
  NGA: 'NG',
  NLD: 'NL',
  CHE: 'CH',
  AUT: 'AT',
  BEL: 'BE',
  SWE: 'SE',
  NOR: 'NO',
  DNK: 'DK',
  POL: 'PL',
  CZE: 'CZ',
  HUN: 'HU',
  ROU: 'RO',
};

export function getEmergencyNumbers(countryCode: string): EmergencyNumbers {
  const upper = countryCode.toUpperCase();
  const code = upper.length === 3 ? (ALPHA3_TO_ALPHA2[upper] ?? '') : upper;
  return COUNTRY_EMERGENCY[code] ?? DEFAULT_EMERGENCY;
}
