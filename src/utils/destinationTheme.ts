export interface DestinationTheme {
  accent: string;
  accentRgb: string;
  secondary: string;
  imageUrl: string;
}

interface ThemeEntry {
  keys: string[];
  accent: string;
  accentRgb: string;
  secondary: string;
}

const THEMES: ThemeEntry[] = [
  // India
  { keys: ['goa'], accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#06B6D4' },
  { keys: ['kerala'], accent: '#10B981', accentRgb: '16,185,129', secondary: '#059669' },
  {
    keys: ['rajasthan', 'jaipur', 'udaipur', 'jodhpur'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EA580C',
  },
  {
    keys: ['himachal', 'manali', 'shimla', 'dharamshala'],
    accent: '#38BDF8',
    accentRgb: '56,189,248',
    secondary: '#0EA5E9',
  },
  { keys: ['mumbai', 'bombay'], accent: '#6366F1', accentRgb: '99,102,241', secondary: '#8B5CF6' },
  {
    keys: ['delhi', 'agra', 'new delhi'],
    accent: '#EF4444',
    accentRgb: '239,68,68',
    secondary: '#F97316',
  },
  {
    keys: ['kashmir', 'srinagar', 'leh', 'ladakh'],
    accent: '#818CF8',
    accentRgb: '129,140,248',
    secondary: '#A78BFA',
  },
  {
    keys: ['varanasi', 'benares', 'rishikesh'],
    accent: '#F97316',
    accentRgb: '249,115,22',
    secondary: '#F59E0B',
  },

  // East Asia
  { keys: ['paris', 'france'], accent: '#A855F7', accentRgb: '168,85,247', secondary: '#EC4899' },
  {
    keys: ['tokyo', 'osaka', 'kyoto', 'nara', 'japan'],
    accent: '#EF4444',
    accentRgb: '239,68,68',
    secondary: '#F97316',
  },
  {
    keys: ['seoul', 'busan', 'korea'],
    accent: '#6366F1',
    accentRgb: '99,102,241',
    secondary: '#EC4899',
  },

  // Southeast Asia
  { keys: ['bali', 'indonesia'], accent: '#22C55E', accentRgb: '34,197,94', secondary: '#0EA5E9' },
  {
    keys: ['phuket', 'krabi', 'koh samui', 'chiang mai', 'thailand'],
    accent: '#06B6D4',
    accentRgb: '6,182,212',
    secondary: '#0EA5E9',
  },
  { keys: ['singapore'], accent: '#14B8A6', accentRgb: '20,184,166', secondary: '#06B6D4' },
  {
    keys: ['bangkok'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EC4899',
  },
  {
    keys: ['kuala lumpur', 'malaysia'],
    accent: '#10B981',
    accentRgb: '16,185,129',
    secondary: '#3B82F6',
  },
  {
    keys: ['vietnam', 'hanoi', 'ho chi minh', 'saigon', 'danang', 'hoi an'],
    accent: '#10B981',
    accentRgb: '16,185,129',
    secondary: '#F59E0B',
  },

  // Middle East
  {
    keys: ['dubai', 'abu dhabi', 'uae'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#D97706',
  },
  {
    keys: ['istanbul', 'turkey', 'ankara', 'antalya'],
    accent: '#EF4444',
    accentRgb: '239,68,68',
    secondary: '#F59E0B',
  },

  // Europe
  {
    keys: ['london', 'england', 'uk'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#1D4ED8',
  },
  { keys: ['new york', 'nyc'], accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#6366F1' },
  { keys: ['maldives'], accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#38BDF8' },
  {
    keys: ['santorini', 'mykonos', 'greece'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#818CF8',
  },
  {
    keys: ['sydney', 'melbourne', 'australia'],
    accent: '#0EA5E9',
    accentRgb: '14,165,233',
    secondary: '#22C55E',
  },
  {
    keys: ['barcelona', 'madrid', 'spain'],
    accent: '#F43F5E',
    accentRgb: '244,63,94',
    secondary: '#F97316',
  },
  {
    keys: ['rome', 'venice', 'florence', 'milan', 'naples', 'italy'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EF4444',
  },
  {
    keys: ['amsterdam', 'netherlands'],
    accent: '#F97316',
    accentRgb: '249,115,22',
    secondary: '#F59E0B',
  },
  {
    keys: ['vienna', 'salzburg', 'austria'],
    accent: '#6366F1',
    accentRgb: '99,102,241',
    secondary: '#4F46E5',
  },
  {
    keys: ['prague', 'czech', 'brno'],
    accent: '#818CF8',
    accentRgb: '129,140,248',
    secondary: '#6366F1',
  },
  {
    keys: ['lisbon', 'porto', 'portugal'],
    accent: '#F97316',
    accentRgb: '249,115,22',
    secondary: '#F59E0B',
  },
  {
    keys: ['berlin', 'munich', 'hamburg', 'germany'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#6366F1',
  },
  {
    keys: ['stockholm', 'oslo', 'copenhagen', 'helsinki', 'scandinavia'],
    accent: '#38BDF8',
    accentRgb: '56,189,248',
    secondary: '#3B82F6',
  },
  {
    keys: ['zurich', 'geneva', 'bern', 'switzerland'],
    accent: '#EF4444',
    accentRgb: '239,68,68',
    secondary: '#3B82F6',
  },
  {
    keys: ['budapest', 'hungary'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EF4444',
  },

  // Americas
  {
    keys: ['miami', 'orlando', 'florida'],
    accent: '#EC4899',
    accentRgb: '236,72,153',
    secondary: '#06B6D4',
  },
  {
    keys: ['los angeles', 'san francisco', 'california'],
    accent: '#F97316',
    accentRgb: '249,115,22',
    secondary: '#EF4444',
  },
  { keys: ['chicago'], accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  { keys: ['las vegas'], accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EC4899' },
  {
    keys: ['cancun', 'playa', 'tulum', 'mexico'],
    accent: '#0EA5E9',
    accentRgb: '14,165,233',
    secondary: '#10B981',
  },
  {
    keys: ['rio', 'brazil', 'sao paulo'],
    accent: '#22C55E',
    accentRgb: '34,197,94',
    secondary: '#F59E0B',
  },
  {
    keys: ['buenos aires', 'argentina'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#6366F1',
  },

  // Africa
  {
    keys: ['cape town', 'johannesburg', 'south africa'],
    accent: '#14B8A6',
    accentRgb: '20,184,166',
    secondary: '#3B82F6',
  },
  {
    keys: ['marrakech', 'casablanca', 'morocco', 'fez'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EF4444',
  },
  {
    keys: ['cairo', 'egypt', 'luxor'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#D97706',
  },
  {
    keys: ['nairobi', 'kenya', 'safari'],
    accent: '#F97316',
    accentRgb: '249,115,22',
    secondary: '#10B981',
  },
];

// Each key is a lowercase substring of the destination string.
// ORDERING MATTERS: more specific keys (city names) must come before less specific
// (country names) so that "Paris, France" matches `paris` before `france`.
const IMAGES: Record<string, string> = {
  // ── India ──────────────────────────────────────────────────────────────────
  goa: 'photo-1512343879784-a960bf40e7f2',
  kerala: 'photo-1602216056096-3b40cc0c9944',
  jaipur: 'photo-1586379893622-03c4a3f18f79',
  rajasthan: 'photo-1599661046289-e31897846e41',
  agra: 'photo-1564507592333-c60657eea523',
  mumbai: 'photo-1562979314-bee7453e911c',
  delhi: 'photo-1570168007204-dfb528c6958f',
  manali: 'photo-1585016495481-91b5b6a52bcd',
  himachal: 'photo-1558618666-fcd25c85cd64',
  kashmir: 'photo-1579546929518-9e396f3cc809',
  ladakh: 'photo-1546517379-b35f0b5c7da8',

  // ── Japan ──────────────────────────────────────────────────────────────────
  kyoto: 'photo-1528360983277-13d401cdc186',
  tokyo: 'photo-1540959733332-eab4deabeeaf',
  japan: 'photo-1540959733332-eab4deabeeaf', // country-level: uses Tokyo skyline

  // ── Korea ──────────────────────────────────────────────────────────────────
  seoul: 'photo-1617029489771-c8e67ddbc52f',
  korea: 'photo-1617029489771-c8e67ddbc52f',

  // ── Southeast Asia ─────────────────────────────────────────────────────────
  phuket: 'photo-1559494007-9f5847c49d94',
  bali: 'photo-1537996194471-e657df975ab4',
  bangkok: 'photo-1508009603885-50cf7c579365',
  singapore: 'photo-1525625293386-3f8f99389edd',
  indonesia: 'photo-1537996194471-e657df975ab4', // country-level: uses Bali
  thailand: 'photo-1508009603885-50cf7c579365', // country-level: uses Bangkok

  // ── Middle East ────────────────────────────────────────────────────────────
  dubai: 'photo-1512453979798-5ea266f8880c',
  istanbul: 'photo-1524231757912-21f4fe3a7200',

  // ── Europe: cities (must precede country-level keys) ──────────────────────
  amsterdam: 'photo-1584003564911-c02f54e8d0f3',
  paris: 'photo-1502602898657-3e91760cbb34',
  london: 'photo-1513635269975-59663e0ac1ad',
  barcelona: 'photo-1539037116277-4db20889f2d4',
  rome: 'photo-1552832230-c0197dd311b5',
  venice: 'photo-1514890547357-a9ee288728e0',
  florence: 'photo-1523906834658-6e24ef2386f9',
  vienna: 'photo-1516550135131-fe3dcb028b0a',
  prague: 'photo-1541849546-216549ae216d',
  lisbon: 'photo-1558369981-f9ca78462e61',
  santorini: 'photo-1613395877344-13d4a8e0d49e',
  sydney: 'photo-1506973035872-a4ec16b8e8d9',
  maldives: 'photo-1519046904884-53103b34b206',
  'new york': 'photo-1534430480872-3498386e7856',
  miami: 'photo-1507525428034-b723cf961d3e',

  // ── Europe: country-level (after city entries) ─────────────────────────────
  france: 'photo-1502602898657-3e91760cbb34', // → Eiffel Tower (Paris)
  spain: 'photo-1539037116277-4db20889f2d4', // → Sagrada Família (Barcelona)
  italy: 'photo-1552832230-c0197dd311b5', // → Colosseum (Rome)
  greece: 'photo-1613395877344-13d4a8e0d49e', // → Santorini
  australia: 'photo-1506973035872-a4ec16b8e8d9', // → Sydney Harbour

  // ── Africa ─────────────────────────────────────────────────────────────────
  'cape town': 'photo-1580060839134-75a5edca2e99',
  marrakech: 'photo-1587974928442-e3b1def4effc',
  cairo: 'photo-1539768942893-daf53e448371',
};

// 16 diverse fallback photos — reduces collision probability to ~6%
// compared to 25% with 4 entries. onError handlers in all components
// provide a further destination-keyed gradient safety net.
const FALLBACKS = [
  'photo-1469854523086-cc02fe5d8800', // mountain road
  'photo-1476514525535-07fb3b4ae5f1', // airplane window
  'photo-1503220317375-aaad61436b1b', // travel map / passport
  'photo-1527631746610-bca00a040d60', // tropical beach
  'photo-1488646953014-85cb44e25828', // beach overhead
  'photo-1500530855697-b586d89ba3ee', // European cobblestone street
  'photo-1436491865332-7a61a109cc05', // airplane wing above clouds
  'photo-1504280390367-361c6d9f38f4', // mountain tent / camping
  'photo-1549366021-9f761d450615', // alpine lake
  'photo-1502791451862-7bd8c1df43a7', // city skyline at night
  'photo-1507003211169-0a1dd7228f2d', // solo backpacker traveller
  'photo-1526772662000-3f88f10405ff', // medieval European town
  'photo-1571896349842-33c89424de2d', // resort infinity pool
  'photo-1444723121867-7a241cacace9', // urban skyscrapers
  'photo-1421789665209-c9b2a435e3dc', // misty mountain forest
  'photo-1553361371-9b22f78e8b1d', // aerial coastal city view
];

const DEFAULT_COLORS = { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#8B5CF6' };

export function resolveDestinationImageUrl(destination: string): string {
  const lower = destination.toLowerCase();
  let photoId: string | undefined;
  for (const [key, id] of Object.entries(IMAGES)) {
    if (lower.includes(key)) {
      photoId = id;
      break;
    }
  }
  if (!photoId) {
    const seed = destination.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    photoId = FALLBACKS[seed % FALLBACKS.length];
  }
  return `https://images.unsplash.com/${photoId}?w=1600&h=900&fit=crop&crop=entropy&q=80`;
}

export function resolveDestinationTheme(destination: string): DestinationTheme {
  const lower = destination.trim().toLowerCase();
  const match = lower ? THEMES.find(({ keys }) => keys.some((k) => lower.includes(k))) : null;
  const colors = match
    ? { accent: match.accent, accentRgb: match.accentRgb, secondary: match.secondary }
    : DEFAULT_COLORS;
  return { ...colors, imageUrl: resolveDestinationImageUrl(destination || 'travel') };
}
