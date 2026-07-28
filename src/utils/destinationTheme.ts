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
  { keys: ['paris', 'france'], accent: '#A855F7', accentRgb: '168,85,247', secondary: '#EC4899' },
  {
    keys: ['tokyo', 'osaka', 'japan'],
    accent: '#EF4444',
    accentRgb: '239,68,68',
    secondary: '#F97316',
  },
  { keys: ['bali', 'indonesia'], accent: '#22C55E', accentRgb: '34,197,94', secondary: '#0EA5E9' },
  {
    keys: ['dubai', 'abu dhabi', 'uae'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#D97706',
  },
  {
    keys: ['london', 'england', 'uk'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#1D4ED8',
  },
  { keys: ['new york', 'nyc'], accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#6366F1' },
  { keys: ['singapore'], accent: '#14B8A6', accentRgb: '20,184,166', secondary: '#06B6D4' },
  { keys: ['maldives'], accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#38BDF8' },
  {
    keys: ['santorini', 'greece'],
    accent: '#3B82F6',
    accentRgb: '59,130,246',
    secondary: '#818CF8',
  },
  {
    keys: ['bangkok', 'thailand'],
    accent: '#F59E0B',
    accentRgb: '245,158,11',
    secondary: '#EC4899',
  },
  {
    keys: ['sydney', 'australia'],
    accent: '#0EA5E9',
    accentRgb: '14,165,233',
    secondary: '#22C55E',
  },
  { keys: ['barcelona', 'spain'], accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#F97316' },
  { keys: ['rome', 'italy'], accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
];

const IMAGES: Record<string, string> = {
  goa: 'photo-1512343879784-a960bf40e7f2',
  kerala: 'photo-1602216056096-3b40cc0c9944',
  rajasthan: 'photo-1599661046289-e31897846e41',
  jaipur: 'photo-1586379893622-03c4a3f18f79',
  mumbai: 'photo-1562979314-bee7453e911c',
  delhi: 'photo-1570168007204-dfb528c6958f',
  agra: 'photo-1564507592333-c60657eea523',
  himachal: 'photo-1558618666-fcd25c85cd64',
  manali: 'photo-1585016495481-91b5b6a52bcd',
  kashmir: 'photo-1579546929518-9e396f3cc809',
  ladakh: 'photo-1546517379-b35f0b5c7da8',
  paris: 'photo-1502602898657-3e91760cbb34',
  tokyo: 'photo-1540959733332-eab4deabeeaf',
  bali: 'photo-1537996194471-e657df975ab4',
  dubai: 'photo-1512453979798-5ea266f8880c',
  london: 'photo-1513635269975-59663e0ac1ad',
  'new york': 'photo-1534430480872-3498386e7856',
  bangkok: 'photo-1508009603885-50cf7c579365',
  singapore: 'photo-1525625293386-3f8f99389edd',
  sydney: 'photo-1506973035872-a4ec16b8e8d9',
  rome: 'photo-1552832230-c0197dd311b5',
  barcelona: 'photo-1539037116277-4db20889f2d4',
  maldives: 'photo-1519046904884-53103b34b206',
  santorini: 'photo-1613395877344-13d4a8e0d49e',
  amsterdam: 'photo-1584003564911-c02f54e8d0f3',
};

const FALLBACKS = [
  'photo-1469854523086-cc02fe5d8800',
  'photo-1476514525535-07fb3b4ae5f1',
  'photo-1503220317375-aaad61436b1b',
  'photo-1527631746610-bca00a040d60',
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
