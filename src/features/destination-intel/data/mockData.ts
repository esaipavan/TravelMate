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

const FD: { dayLabel: string; dateStr: string }[] = [
  { dayLabel: 'Mon', dateStr: 'Jul 28' },
  { dayLabel: 'Tue', dateStr: 'Jul 29' },
  { dayLabel: 'Wed', dateStr: 'Jul 30' },
  { dayLabel: 'Thu', dateStr: 'Jul 31' },
  { dayLabel: 'Fri', dateStr: 'Aug 1' },
  { dayLabel: 'Sat', dateStr: 'Aug 2' },
  { dayLabel: 'Sun', dateStr: 'Aug 3' },
];

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

/* ── shared placeholders (sections added in future sprints) ─────── */

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

const BASE_CHECKLIST: ChecklistItem[] = [
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
  ],
};

/* ── BALI ────────────────────────────────────────────────────────── */

const BALI: DestinationData = {
  overview: {
    destination: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    timezone: 'Asia/Makassar',
    timezoneOffset: 'UTC+8',
    currency: 'Indonesian Rupiah',
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    language: 'Indonesian',
    additionalLanguages: ['Balinese', 'English'],
    bestSeason: 'April – October',
    avgTempLow: 24,
    avgTempHigh: 29,
    description:
      'The Island of the Gods dazzles with ancient temples, emerald rice terraces, world-class surf, and a spiritual culture unlike anywhere else. July is peak dry season — the best time to visit Bali.',
    travelStyles: ['Beach', 'Culture', 'Wellness', 'Adventure', 'Food'],
    visaInfo: 'Visa on arrival available for 70+ countries ($35 USD for 30 days).',
    internetQuality: 'good',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 28,
      feelsLike: 31,
      icon: '☀️',
      condition: 'Sunny',
      humidity: 65,
      windKmh: 15,
      uvIndex: 10,
    },
    forecast: [
      day(0, '☀️', 'Sunny', 28, 24, 5, 65),
      day(1, '🌤', 'Mostly Sunny', 29, 24, 10, 62),
      day(2, '☀️', 'Sunny', 29, 24, 5, 63),
      day(3, '⛅', 'Partly Cloudy', 28, 23, 15, 68),
      day(4, '☀️', 'Sunny', 29, 24, 5, 64),
      day(5, '🌤', 'Mostly Sunny', 30, 24, 8, 60),
      day(6, '☀️', 'Sunny', 29, 24, 5, 62),
    ],
    seasonNote:
      'Dry season (April–October) — the best time to visit Bali. Low humidity, clear skies, and minimal rainfall make every day perfect.',
    recommendations: [
      'Apply SPF 50+ sunscreen — UV index reaches 10 or higher daily',
      'Perfect conditions for surfing on Uluwatu and Padang Padang',
      'Book Tegallalang and Jatiluwih rice terrace sunrise visits in advance',
      'Ideal weather for hiking Mount Batur — start at 2 AM for summit sunrise',
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
      id: 'sarong',
      label: 'Sarong for temple visits',
      category: 'clothing',
      required: true,
      note: 'Mandatory at all temples — provided free at most sites',
    },
    {
      id: 'reef-safe',
      label: 'Reef-safe sunscreen only',
      category: 'health',
      required: true,
      note: 'Chemical sunscreens are banned near coral reefs',
    },
    {
      id: 'cash-idr',
      label: 'Carry cash in IDR (Rupiah)',
      category: 'money',
      required: true,
      note: 'Many warungs and small shops are cash-only',
    },
  ],
  insights: [
    {
      id: 'b1',
      title: 'July = Peak Season',
      body: "Bali's dry season at its finest. Expect clear skies every day — but book accommodation early, it sells out fast.",
      emoji: '☀️',
      category: 'timing',
      priority: 'high',
    },
    {
      id: 'b2',
      title: 'Surf Season',
      body: 'West coast breaks are firing in July. Padang Padang is world-class right now.',
      emoji: '🏄',
      category: 'experience',
      priority: 'medium',
    },
  ],
};

/* ── BANGKOK ──────────────────────────────────────────────────────── */

const BANGKOK: DestinationData = {
  overview: {
    destination: 'Bangkok',
    country: 'Thailand',
    countryCode: 'TH',
    flagEmoji: '🇹🇭',
    timezone: 'Asia/Bangkok',
    timezoneOffset: 'UTC+7',
    currency: 'Thai Baht',
    currencyCode: 'THB',
    currencySymbol: '฿',
    language: 'Thai',
    additionalLanguages: ['English'],
    bestSeason: 'November – February',
    avgTempLow: 28,
    avgTempHigh: 34,
    description:
      'A sensory explosion of ornate temples, night markets, elevated sky trains, and street food that rivals Michelin-starred kitchens. Bangkok moves at a relentless pace and rewards those who embrace its chaos.',
    travelStyles: ['Food', 'Culture', 'Shopping', 'Nightlife', 'Temples'],
    visaInfo: 'Visa-free for most nationalities up to 30 days. e-Visa available for 60-day stays.',
    internetQuality: 'excellent',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 33,
      feelsLike: 40,
      icon: '🌦',
      condition: 'Hot and Humid',
      humidity: 85,
      windKmh: 12,
      uvIndex: 7,
    },
    forecast: [
      day(0, '🌦', 'Hot & Humid', 33, 28, 60, 85),
      day(1, '⛈', 'Afternoon Storm', 32, 27, 80, 88),
      day(2, '🌦', 'Humid', 33, 28, 55, 83),
      day(3, '🌧', 'Rainy', 31, 27, 75, 87),
      day(4, '⛅', 'Partly Cloudy', 33, 28, 40, 80),
      day(5, '⛈', 'Afternoon Storm', 32, 27, 80, 86),
      day(6, '🌦', 'Hot & Humid', 33, 28, 60, 84),
    ],
    seasonNote:
      'Rainy season (May–October). Afternoon thunderstorms are brief but intense. Mornings are generally clear and ideal for temple visits.',
    recommendations: [
      'Visit outdoor temples and palaces in the early morning — rain arrives by 3–4 PM',
      'Stay hydrated — the heat index regularly exceeds 40°C',
      'Carry a compact umbrella at all times',
      'Air-conditioned malls, museums, and the BTS Skytrain offer midday relief',
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
      id: 'modest-clothes',
      label: 'Modest clothing for temples',
      category: 'clothing',
      required: true,
      note: 'Shoulders and knees must be covered',
    },
    {
      id: 'stomach-meds',
      label: 'Stomach medication',
      category: 'health',
      required: false,
      note: 'Spicy street food can cause issues',
    },
    {
      id: 'transit-card',
      label: 'Rabbit Card (BTS)',
      category: 'tech',
      required: false,
      note: 'Reloadable card for Skytrain and buses',
    },
  ],
  insights: [
    {
      id: 'bk1',
      title: 'Morning Temple Rule',
      body: 'Visit Wat Phra Kaew and Grand Palace before 10 AM — beat the heat and tour groups simultaneously.',
      emoji: '🕌',
      category: 'timing',
      priority: 'high',
    },
    {
      id: 'bk2',
      title: 'Afternoon Storms',
      body: 'Plan indoor activities between 3–5 PM. Afternoon storms are almost guaranteed every day in July.',
      emoji: '⛈',
      category: 'safety',
      priority: 'high',
    },
  ],
};

/* ── TOKYO ───────────────────────────────────────────────────────── */

const TOKYO: DestinationData = {
  overview: {
    destination: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flagEmoji: '🇯🇵',
    timezone: 'Asia/Tokyo',
    timezoneOffset: 'UTC+9',
    currency: 'Japanese Yen',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    language: 'Japanese',
    additionalLanguages: ['English (tourist areas)'],
    bestSeason: 'March – May, September – November',
    avgTempLow: 25,
    avgTempHigh: 33,
    description:
      'Where ancient temples meet neon-lit skyscrapers, where ramen shops sit beside Michelin-starred kaiseki restaurants, and where the future is already the present. Tokyo rewards curiosity at every turn.',
    travelStyles: ['Food', 'Culture', 'Technology', 'Shopping', 'Architecture'],
    visaInfo: 'Visa-free for most western nationalities up to 90 days.',
    internetQuality: 'excellent',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 32,
      feelsLike: 38,
      icon: '🌤',
      condition: 'Hot and Humid',
      humidity: 78,
      windKmh: 10,
      uvIndex: 8,
    },
    forecast: [
      day(0, '🌤', 'Hot & Humid', 32, 26, 20, 78),
      day(1, '☀️', 'Sunny', 34, 26, 10, 72),
      day(2, '🌦', 'Scattered Rain', 31, 25, 45, 80),
      day(3, '🌤', 'Partly Cloudy', 33, 26, 20, 75),
      day(4, '☀️', 'Hot & Sunny', 35, 27, 5, 70),
      day(5, '☀️', 'Very Hot', 35, 27, 5, 68),
      day(6, '🌤', 'Partly Cloudy', 33, 26, 20, 73),
    ],
    seasonNote:
      'Summer (June–August) is hot and humid. Rainy season ends mid-July. Expect intense heat and high UV through August.',
    recommendations: [
      'Carry a portable fan and cooling towel — convenience stores sell both cheaply',
      'Seek shade and air-conditioning between 11 AM and 4 PM',
      'Department stores, museums, and malls are excellent midday refuges',
      'Stock up on cold drinks and ice cream from convenience stores',
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
      id: 'ic-card',
      label: 'IC Card (Suica / Pasmo)',
      category: 'tech',
      required: true,
      note: 'Load at the airport — works on all trains, buses, and vending machines',
    },
    {
      id: 'pocket-wifi',
      label: 'Pocket WiFi rental',
      category: 'tech',
      required: false,
      note: 'Reserve before arrival for best rates',
    },
    {
      id: 'cash-yen',
      label: 'Carry cash in JPY',
      category: 'money',
      required: true,
      note: 'Many restaurants and small shops are cash-only',
    },
    {
      id: 'cool-cloth',
      label: 'Cooling towel / hand fan',
      category: 'health',
      required: true,
      note: 'Essential in Tokyo summer heat',
    },
  ],
  insights: [
    {
      id: 't1',
      title: 'IC Card is Essential',
      body: 'Load a Suica at the airport. It works on every train, bus, and many convenience stores. No need to buy individual tickets.',
      emoji: '🚇',
      category: 'money',
      priority: 'high',
    },
    {
      id: 't2',
      title: 'Beat the Heat',
      body: 'July feels like 38°C+ with humidity. Schedule outdoor sightseeing before 10 AM and after 6 PM.',
      emoji: '🌡',
      category: 'safety',
      priority: 'high',
    },
  ],
};

/* ── PARIS ───────────────────────────────────────────────────────── */

const PARIS: DestinationData = {
  overview: {
    destination: 'Paris',
    country: 'France',
    countryCode: 'FR',
    flagEmoji: '🇫🇷',
    timezone: 'Europe/Paris',
    timezoneOffset: 'UTC+2',
    currency: 'Euro',
    currencyCode: 'EUR',
    currencySymbol: '€',
    language: 'French',
    additionalLanguages: ['English (widely spoken in tourist areas)'],
    bestSeason: 'April – June, September – October',
    avgTempLow: 16,
    avgTempHigh: 26,
    description:
      "The City of Light seduces on its own terms — from the Louvre's labyrinthine galleries to golden Haussmann boulevards at dusk. July brings long evenings, al fresco dining, and the whole city in summer mode.",
    travelStyles: ['Art & Culture', 'Food & Wine', 'Romance', 'Fashion', 'Architecture'],
    visaInfo:
      'Schengen visa required for non-EU nationals. Visa-free for 90 days for most western passports.',
    internetQuality: 'excellent',
    touristFriendly: 'moderate',
  },
  weather: {
    current: {
      temp: 25,
      feelsLike: 27,
      icon: '☀️',
      condition: 'Sunny',
      humidity: 55,
      windKmh: 14,
      uvIndex: 7,
    },
    forecast: [
      day(0, '☀️', 'Sunny', 25, 17, 5, 55),
      day(1, '🌤', 'Mostly Sunny', 26, 17, 10, 52),
      day(2, '⛅', 'Partly Cloudy', 24, 16, 20, 58),
      day(3, '☀️', 'Sunny', 26, 17, 5, 50),
      day(4, '🌦', 'Light Showers', 23, 16, 35, 60),
      day(5, '☀️', 'Sunny', 25, 16, 5, 53),
      day(6, '🌤', 'Mostly Sunny', 26, 17, 10, 51),
    ],
    seasonNote:
      'July is peak summer and peak tourist season. Long daylight hours (sunrise 6 AM, sunset 10 PM) give you extra time for sightseeing.',
    recommendations: [
      "Book the Louvre, d'Orsay, and Eiffel Tower at least a week in advance",
      'The Seine riverbanks open as sandy Paris Plages beaches — perfect for an evening',
      'Evenings are warm and perfect for outdoor dining — restaurants stay busy until midnight',
      'Consider Vélib bicycle hire to avoid crowded Metro lines in peak season',
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
      id: 'museum-pass',
      label: 'Paris Museum Pass (2–6 day)',
      category: 'money',
      required: false,
      note: 'Saves money visiting 3+ museums and skips queues',
    },
    {
      id: 'pickpocket',
      label: 'Anti-theft waist belt/pouch',
      category: 'essentials',
      required: false,
      note: 'Tourist areas are notorious pickpocket hotspots',
    },
    {
      id: 'scarf',
      label: 'Light scarf or wrap',
      category: 'clothing',
      required: false,
      note: 'For evenings and air-conditioned venues',
    },
  ],
  insights: [
    {
      id: 'p1',
      title: 'Pre-book Everything',
      body: 'Eiffel Tower, Louvre, Versailles — all require advance tickets in July. Walk-up entry is nearly impossible.',
      emoji: '🎫',
      category: 'timing',
      priority: 'high',
    },
    {
      id: 'p2',
      title: 'Golden Hour View',
      body: 'Sacré-Cœur terrace at 9 PM in July. Paris glows golden and the crowd is thinner than at midday.',
      emoji: '🌅',
      category: 'experience',
      priority: 'medium',
    },
  ],
};

/* ── DUBAI ───────────────────────────────────────────────────────── */

const DUBAI: DestinationData = {
  overview: {
    destination: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flagEmoji: '🇦🇪',
    timezone: 'Asia/Dubai',
    timezoneOffset: 'UTC+4',
    currency: 'UAE Dirham',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    language: 'Arabic',
    additionalLanguages: ['English', 'Hindi', 'Urdu'],
    bestSeason: 'November – March',
    avgTempLow: 30,
    avgTempHigh: 43,
    description:
      'The city that built the impossible in the desert. Dubai stuns with superlatives — tallest tower, largest mall, most luxurious hotels — yet retains a fascinating old quarter where creek-side abras glide past gold souks unchanged for centuries.',
    travelStyles: ['Luxury', 'Shopping', 'Architecture', 'Adventure', 'Desert'],
    visaInfo: 'Visa on arrival or e-Visa for most nationalities. 30-day stay.',
    internetQuality: 'excellent',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 43,
      feelsLike: 49,
      icon: '🌞',
      condition: 'Extreme Heat',
      humidity: 55,
      windKmh: 18,
      uvIndex: 12,
    },
    forecast: [
      day(0, '🌞', 'Extreme Heat', 43, 31, 0, 55),
      day(1, '☀️', 'Very Hot', 44, 32, 0, 52),
      day(2, '🌞', 'Extreme Heat', 43, 31, 0, 54),
      day(3, '☀️', 'Very Hot', 44, 32, 0, 50),
      day(4, '🌞', 'Extreme Heat', 45, 32, 0, 53),
      day(5, '☀️', 'Very Hot', 44, 31, 0, 51),
      day(6, '🌞', 'Extreme Heat', 43, 31, 0, 55),
    ],
    seasonNote:
      'Summer (June–September) is extreme. Temperatures regularly exceed 43°C. All major attractions are indoors and heavily air-conditioned.',
    recommendations: [
      'Avoid outdoor exposure between 10 AM and 6 PM — heat stroke risk is very real',
      'Dress in light, loose, breathable fabrics and cover your arms',
      'A car or taxi is essential — walking between outdoor spots is genuinely dangerous',
      'July is the cheapest month — 5-star hotels at 3-star prices',
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
      id: 'loose-clothes',
      label: 'Light loose long-sleeve clothing',
      category: 'clothing',
      required: true,
      note: 'Sun protection and cultural respect combined',
    },
    {
      id: 'cooling-towel',
      label: 'Cooling towel',
      category: 'health',
      required: true,
      note: 'Essential in extreme heat',
    },
    {
      id: 'modest-swim',
      label: 'Modest swimwear',
      category: 'clothing',
      required: true,
      note: 'Bikinis only acceptable at hotel private pools/beaches',
    },
  ],
  insights: [
    {
      id: 'd1',
      title: 'July = Cheapest Month',
      body: "Dubai's summer extremes keep most tourists away — 5-star resorts drop to 3-star prices. Stay inside and enjoy the luxury.",
      emoji: '💎',
      category: 'money',
      priority: 'high',
    },
    {
      id: 'd2',
      title: 'Desert at Night',
      body: 'Desert safaris run at sunset only in summer. Temperatures drop to 30°C by 9 PM — pleasant for stargazing.',
      emoji: '🌙',
      category: 'experience',
      priority: 'medium',
    },
  ],
};

/* ── LONDON ──────────────────────────────────────────────────────── */

const LONDON: DestinationData = {
  overview: {
    destination: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    flagEmoji: '🇬🇧',
    timezone: 'Europe/London',
    timezoneOffset: 'UTC+1',
    currency: 'British Pound',
    currencyCode: 'GBP',
    currencySymbol: '£',
    language: 'English',
    additionalLanguages: ["200+ languages spoken — one of the world's most multilingual cities"],
    bestSeason: 'May – September',
    avgTempLow: 14,
    avgTempHigh: 23,
    description:
      'Centuries of history sit comfortably beside cutting-edge art, world-class theatre, and a food scene that no longer plays second fiddle to Paris. July brings the longest, brightest evenings and a city in full summer bloom.',
    travelStyles: ['Culture', 'History', 'Food', 'Theatre', 'Parks'],
    visaInfo:
      'UK Standard Visitor Visa required for most non-EU nationalities. Apply 3+ weeks in advance.',
    internetQuality: 'excellent',
    touristFriendly: 'very',
  },
  weather: {
    current: {
      temp: 22,
      feelsLike: 22,
      icon: '🌤',
      condition: 'Partly Cloudy',
      humidity: 62,
      windKmh: 16,
      uvIndex: 5,
    },
    forecast: [
      day(0, '🌤', 'Partly Cloudy', 22, 14, 20, 62),
      day(1, '☀️', 'Sunny', 24, 15, 10, 58),
      day(2, '⛅', 'Overcast', 21, 14, 30, 65),
      day(3, '🌦', 'Light Showers', 20, 13, 50, 70),
      day(4, '🌤', 'Partly Cloudy', 22, 14, 20, 63),
      day(5, '☀️', 'Sunny', 25, 15, 10, 57),
      day(6, '☀️', 'Warm & Sunny', 26, 16, 5, 55),
    ],
    seasonNote:
      "July is one of London's warmest months. Long daylight hours (sunrise 4:50 AM, sunset 9:20 PM). Occasional showers appear without warning.",
    recommendations: [
      'Pack a compact umbrella — London showers are brief but appear without warning',
      'Long evenings are perfect for riverbank walks along the Thames and outdoor markets',
      'Free museums (British Museum, V&A, Natural History) never close in summer — visit on weekday mornings',
      'Book West End shows at least 2 weeks ahead for the best seats and prices',
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
      id: 'oyster',
      label: 'Oyster Card or contactless card',
      category: 'money',
      required: true,
      note: 'Essential for all London Transport — cash is not accepted on buses',
    },
    {
      id: 'layers',
      label: 'Layered clothing',
      category: 'clothing',
      required: true,
      note: 'London weather changes rapidly throughout the day',
    },
    {
      id: 'umbrella',
      label: 'Compact umbrella',
      category: 'essentials',
      required: true,
      note: "It's London",
    },
  ],
  insights: [
    {
      id: 'l1',
      title: 'Free Museum Season',
      body: 'British Museum, Natural History, V&A, Tate Modern — all free, all world-class. Summer evenings often have free courtyard events.',
      emoji: '🏛',
      category: 'money',
      priority: 'high',
    },
    {
      id: 'l2',
      title: 'Best View in London',
      body: "Primrose Hill at sunset in July. The whole skyline from Canary Wharf to St Paul's, golden light, and far fewer tourists than Greenwich.",
      emoji: '🌅',
      category: 'experience',
      priority: 'medium',
    },
  ],
};

/* ── Generic fallback ────────────────────────────────────────────── */

function buildGenericData(destination: string): DestinationData {
  return {
    overview: {
      destination,
      country: 'International',
      countryCode: 'XX',
      flagEmoji: '🌍',
      timezone: 'UTC',
      timezoneOffset: 'UTC+0',
      currency: 'Local Currency',
      currencyCode: 'USD',
      currencySymbol: '$',
      language: 'Local Language',
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
  bali: BALI,
  bangkok: BANGKOK,
  tokyo: TOKYO,
  paris: PARIS,
  dubai: DUBAI,
  london: LONDON,
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
