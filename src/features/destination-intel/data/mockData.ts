import type {
  DestinationData,
  WeatherDay,
  ChecklistItem,
  FoodGuide,
  TransportGuide,
  CostGuide,
  SafetyInfo,
} from '../types';
import { ATTRACTIONS_DB } from './attractionsData';
import { FOOD_DB } from './foodData';
import { TRANSPORT_DB } from './transportData';
import { SAFETY_DB } from './safetyData';
import { COST_DB } from './costData';

/* ── helpers ───────────────────────────────────────────────────── */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

function buildForecastDates(): { dayLabel: string; dateStr: string }[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      dayLabel: DAY_LABELS[d.getDay()],
      dateStr: `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`,
    };
  });
}

const FD = buildForecastDates();

function day(
  i: number,
  icon: string,
  condition: string,
  high: number,
  low: number,
  precipPct: number,
  humidity: number,
): WeatherDay {
  return { ...FD[i], icon, condition, high, low, precipPct, humidity };
}

/* ── shared placeholders ─────────────────────────────────────────── */

const FOOD: FoodGuide = {
  dishes: [],
  restaurants: [],
  streetFood: [],
  dietaryNotes: [],
  waterSafety: 'bottled',
  drinks: [],
  marketTips: [],
};
const TRANSPORT: TransportGuide = { fromAirport: '', options: [], apps: [], tips: [] };
const COST: CostGuide = {
  localCurrency: '',
  localCurrencyCode: '',
  usdToLocalRate: 1,
  items: [],
  dailyTotalBudget: 0,
  dailyTotalMidrange: 0,
  dailyTotalLuxury: 0,
  tippingNote: '',
  bargainingNote: '',
  atmNote: '',
};
const SAFETY: SafetyInfo = {
  overallRating: 'safe',
  ratingNote: '',
  emergency: { police: '', ambulance: '', fire: '', general: '', touristHelpline: '' },
  hospitals: [],
  embassies: [],
  tips: [],
  scams: [],
  avoidAreas: [],
  etiquette: [],
};

export const BASE_CHECKLIST: ChecklistItem[] = [
  { id: 'passport', label: 'Passport (valid 6+ months)', category: 'documents', required: true },
  {
    id: 'visa',
    label: 'Visa / e-Visa confirmation',
    category: 'documents',
    required: false,
    note: 'Check nationality requirements',
  },
  { id: 'insurance', label: 'Travel insurance policy', category: 'documents', required: true },
  { id: 'flights', label: 'Flight tickets', category: 'documents', required: true },
  { id: 'hotel', label: 'Hotel confirmation', category: 'documents', required: true },
  {
    id: 'doc-copies',
    label: 'Photocopies of all documents',
    category: 'documents',
    required: true,
  },
  { id: 'vaccines', label: 'Vaccinations up to date', category: 'health', required: false },
  { id: 'medicines', label: 'Personal medications', category: 'health', required: true },
  { id: 'sunscreen', label: 'Sunscreen SPF 50+', category: 'health', required: true },
  { id: 'first-aid', label: 'Basic first aid kit', category: 'health', required: false },
  { id: 'cash', label: 'Local currency (small bills)', category: 'money', required: true },
  { id: 'cards', label: 'Debit and credit cards', category: 'money', required: true },
  { id: 'bank-notify', label: 'Notify bank of travel dates', category: 'money', required: true },
  { id: 'charger', label: 'Phone charger and power bank', category: 'tech', required: true },
  { id: 'adapter', label: 'Universal power adapter', category: 'tech', required: false },
  { id: 'offline-maps', label: 'Offline maps downloaded', category: 'tech', required: true },
  {
    id: 'toiletries',
    label: 'Toiletries and personal care',
    category: 'essentials',
    required: true,
  },
  { id: 'bag-lock', label: 'Travel padlock', category: 'essentials', required: false },
];

/* ── GOA ─────────────────────────────────────────────────────────── */

const GOA: DestinationData = {
  overview: {
    destination: 'Goa',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    timezone: 'Asia/Kolkata',
    timezoneOffset: 'UTC+5:30',
    currency: 'Indian Rupee',
    currencyCode: 'INR',
    currencySymbol: '₹',
    language: 'Konkani',
    additionalLanguages: ['Hindi', 'English', 'Marathi'],
    bestSeason: 'November – February',
    avgTempLow: 26,
    avgTempHigh: 30,
    description:
      "India's smallest state blends Portuguese heritage, sun-drenched beaches, spice plantations, and vibrant nightlife. July's monsoon turns the landscape into a lush emerald paradise — perfect for exploring without the crowds.",
    travelStyles: ['Beach', 'Heritage', 'Food', 'Nightlife', 'Adventure'],
    visaInfo:
      'e-Visa available for most nationalities. Apply 4+ days before arrival at indianvisaonline.gov.in.',
    internetQuality: 'good',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 28,
      feelsLike: 34,
      icon: '🌧',
      condition: 'Heavy Showers',
      humidity: 92,
      windKmh: 28,
      uvIndex: 4,
    },
    forecast: [
      day(0, '🌧', 'Heavy Rain', 29, 26, 90, 93),
      day(1, '⛈', 'Thunderstorm', 28, 25, 95, 95),
      day(2, '🌧', 'Showers', 30, 26, 75, 88),
      day(3, '⛅', 'Partly Cloudy', 31, 27, 50, 82),
      day(4, '🌧', 'Light Rain', 29, 26, 70, 85),
      day(5, '⛈', 'Thunderstorm', 28, 25, 90, 94),
      day(6, '🌧', 'Showers', 29, 26, 80, 90),
    ],
    seasonNote:
      'Monsoon season (June–September). Heavy rainfall transforms the landscape emerald green. Beach shacks close, but waterfalls reach their spectacular peak.',
    recommendations: [
      'Pack waterproof bags for electronics and valuables',
      'Carry a quality rain jacket or poncho every day',
      'Dudhsagar Falls is at its most magnificent this month',
      'Hotel rates are 40–60% lower than peak season — a great time to splurge',
    ],
  },
  attractions: [],
  food: FOOD,
  transport: TRANSPORT,
  cost: COST,
  safety: SAFETY,
  checklist: [
    ...BASE_CHECKLIST,
    {
      id: 'rain-jacket',
      label: 'Waterproof jacket or poncho',
      category: 'clothing',
      required: true,
      note: 'Monsoon rains are sudden and heavy',
    },
    {
      id: 'mosquito-rep',
      label: 'DEET mosquito repellent (30%+)',
      category: 'health',
      required: true,
      note: 'Peak mosquito season',
    },
    {
      id: 'water-shoes',
      label: 'Water-resistant footwear',
      category: 'clothing',
      required: false,
      note: 'Essential for waterfall trekking',
    },
  ],
  insights: [
    {
      id: 'g1',
      title: 'Monsoon = 60% Cheaper',
      body: 'Book resorts now for 40–60% off peak rates. July is the best time to stay somewhere special.',
      emoji: '💰',
      category: 'money',
      priority: 'high',
    },
    {
      id: 'g2',
      title: 'Dudhsagar Falls',
      body: 'The 310-metre waterfall roars at full power in July. Book a 4x4 jeep tour the evening before.',
      emoji: '🌊',
      category: 'experience',
      priority: 'high',
    },
    {
      id: 'g3',
      title: 'Old Goa Churches',
      body: 'The Basilica of Bom Jesus and Sé Cathedral are UNESCO World Heritage sites blending Portuguese and Indian architecture — an easy half-day trip.',
      emoji: '⛪',
      category: 'culture',
      priority: 'medium',
    },
    {
      id: 'g4',
      title: 'Skip the Beach Shacks',
      body: 'For real Goan fish curry rice, look for a local "khanaval" (home-style eatery) rather than a tourist-facing beach shack.',
      emoji: '🍛',
      category: 'food',
      priority: 'medium',
    },
  ],
};

/* ── Generic fallback ────────────────────────────────────────────── */

export function buildGenericData(destination: string): DestinationData {
  const parts = destination.split(',');
  const inferredCountry = parts.length >= 2 ? parts[parts.length - 1].trim() : destination;
  return {
    overview: {
      destination,
      country: inferredCountry,
      countryCode: '',
      flagEmoji: '🌍',
      timezone: 'UTC',
      timezoneOffset: 'UTC+0',
      currency: 'Local currency',
      currencyCode: 'USD',
      currencySymbol: '$',
      language: 'Local language',
      additionalLanguages: ['English'],
      bestSeason: 'Varies by season',
      avgTempLow: 18,
      avgTempHigh: 28,
      description: `${destination} is your next adventure. Discover the culture, cuisine, and hidden gems that make this destination truly unique.`,
      travelStyles: ['Adventure', 'Culture', 'Food'],
      visaInfo: 'Check visa requirements for your nationality before travelling.',
      internetQuality: 'good',
      touristFriendly: 'moderate',
    },
    weather: {
      current: {
        temp: 24,
        feelsLike: 26,
        icon: '⛅',
        condition: 'Variable',
        humidity: 65,
        windKmh: 14,
        uvIndex: 5,
      },
      forecast: [
        day(0, '⛅', 'Partly Cloudy', 24, 18, 20, 65),
        day(1, '☀️', 'Sunny', 26, 19, 10, 60),
        day(2, '🌦', 'Showers', 22, 17, 50, 70),
        day(3, '⛅', 'Partly Cloudy', 24, 18, 25, 65),
        day(4, '☀️', 'Sunny', 25, 18, 10, 60),
        day(5, '⛅', 'Partly Cloudy', 23, 17, 20, 63),
        day(6, '☀️', 'Sunny', 25, 19, 10, 58),
      ],
      seasonNote: 'Weather conditions vary. Check local forecasts closer to your travel date.',
      recommendations: [
        'Pack layers to be prepared for changing conditions',
        'Carry a compact umbrella for unexpected showers',
        'Check the local forecast each morning before heading out',
      ],
    },
    attractions: [],
    food: FOOD,
    transport: TRANSPORT,
    cost: COST,
    safety: SAFETY,
    checklist: BASE_CHECKLIST,
    insights: [],
  };
}

/* ── Database & lookup ───────────────────────────────────────────── */

export const DESTINATION_DATABASE: Record<string, DestinationData> = {
  goa: GOA,
};

export function getDestinationData(destination: string): DestinationData {
  const lower = destination.trim().toLowerCase();

  let matchedKey: string | null = null;
  let baseData: DestinationData;

  if (DESTINATION_DATABASE[lower]) {
    matchedKey = lower;
    baseData = DESTINATION_DATABASE[lower];
  } else {
    const partialEntry = Object.entries(DESTINATION_DATABASE).find(
      ([key]) => lower.includes(key) || key.includes(lower),
    );
    if (partialEntry) {
      [matchedKey, baseData] = partialEntry;
    } else {
      baseData = buildGenericData(destination);
    }
  }

  return {
    ...baseData,
    attractions: (matchedKey ? (ATTRACTIONS_DB[matchedKey] ?? null) : null) ?? baseData.attractions,
    food: (matchedKey ? (FOOD_DB[matchedKey] ?? null) : null) ?? baseData.food,
    transport: (matchedKey ? (TRANSPORT_DB[matchedKey] ?? null) : null) ?? baseData.transport,
    safety: (matchedKey ? (SAFETY_DB[matchedKey] ?? null) : null) ?? baseData.safety,
    cost: (matchedKey ? (COST_DB[matchedKey] ?? null) : null) ?? baseData.cost,
  };
}
