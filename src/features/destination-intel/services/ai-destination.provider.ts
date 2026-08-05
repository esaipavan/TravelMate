import { chatWithAI } from '@/services/ai/ai.service';
import {
  DESTINATION_DATABASE,
  BASE_CHECKLIST,
  buildGenericData,
  getDestinationData,
} from '../data/mockData';
import { getEmergencyNumbers } from '../data/countryDefaults';
import type {
  DestinationData,
  Attraction,
  AttractionCategory,
  WeatherDay,
  WeatherData,
  FoodGuide,
  Dish,
  SpiceLevel,
  Restaurant,
  PriceRange,
  TransportGuide,
  TransportOption,
  TransportMode,
  CostGuide,
  SafetyInfo,
  SafetyRating,
  AIInsight,
  InsightCategory,
  InsightPriority,
} from '../types';

export interface DestinationProvider {
  getDestinationData(destination: string): Promise<DestinationData>;
}

/* ── Helpers ──────────────────────────────────────────────────────── */

function hasStaticData(destination: string): boolean {
  const parts = destination.split(',');
  const cityKey = parts[0].trim().toLowerCase();

  if (!(cityKey in DESTINATION_DATABASE)) return false;

  // No country specified → trust the city key (e.g. "Paris" → Paris, France)
  if (parts.length < 2) return true;

  const specifiedCountry = parts[1].trim().toLowerCase();
  const staticCountry = DESTINATION_DATABASE[cityKey].overview.country.toLowerCase();

  // Country specified and conflicts with the known static entry → use AI instead.
  // e.g. "Paris, Texas" → specifiedCountry "texas" ≠ staticCountry "france" → AI
  return staticCountry.includes(specifiedCountry) || specifiedCountry.includes(staticCountry);
}

function nonEmptyString(v: unknown, fallback: string): string {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : fallback;
}

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

function buildForecastFromCurrent(current: WeatherData['current']): WeatherDay[] {
  // Deterministic variation pattern — high/low swing and precip wave
  const tempSwing = [0, 1, -1, 2, -2, 1, 0] as const;
  const precipBase = current.humidity > 75 ? 45 : current.humidity > 60 ? 25 : 12;
  const precipWave = [0, 15, 25, 5, 20, -5, 10] as const;

  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const high = current.temp + 3 + tempSwing[i];
    return {
      dayLabel: DAY_LABELS[d.getDay()],
      dateStr: `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`,
      icon: current.icon,
      condition: current.condition,
      high,
      low: high - 6,
      precipPct: Math.max(0, Math.min(95, precipBase + precipWave[i])),
      humidity: Math.max(20, Math.min(99, current.humidity + tempSwing[i])),
    };
  });
}

/* ── JSON validation helpers ──────────────────────────────────────── */

function isString(v: unknown): v is string {
  return typeof v === 'string';
}
function isNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}
function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}
function isArray(v: unknown): v is unknown[] {
  return Array.isArray(v);
}

const VALID_ATTRACTION_CATS = new Set<AttractionCategory>([
  'landmark',
  'nature',
  'museum',
  'food',
  'shopping',
  'entertainment',
  'religious',
  'beach',
  'adventure',
]);
const VALID_SPICE = new Set<SpiceLevel>(['none', 'mild', 'medium', 'hot', 'very-hot']);
const VALID_PRICE_RANGE = new Set<PriceRange>(['€', '€€', '€€€', '€€€€']);
const VALID_TRANSPORT = new Set<TransportMode>([
  'airport',
  'metro',
  'taxi',
  'bus',
  'train',
  'car-rental',
  'ride-share',
  'tuk-tuk',
  'ferry',
  'boat',
  'seaplane',
]);
const VALID_SAFETY = new Set<SafetyRating>([
  'very-safe',
  'safe',
  'moderate',
  'caution',
  'high-risk',
]);
const VALID_INSIGHT_CAT = new Set<InsightCategory>([
  'timing',
  'money',
  'culture',
  'food',
  'safety',
  'experience',
]);
const VALID_INSIGHT_PRI = new Set<InsightPriority>(['high', 'medium', 'low']);

function parseAttraction(raw: unknown, idx: number): Attraction | null {
  if (!isObject(raw)) return null;
  const category =
    isString(raw['category']) && VALID_ATTRACTION_CATS.has(raw['category'] as AttractionCategory)
      ? (raw['category'] as AttractionCategory)
      : 'landmark';
  const tips = isArray(raw['tips']) ? raw['tips'].filter(isString) : [];
  return {
    id: isString(raw['id']) ? raw['id'] : `ai-attr-${idx}`,
    name: isString(raw['name']) ? raw['name'] : 'Unknown Attraction',
    description: isString(raw['description']) ? raw['description'] : '',
    imageUrl: '',
    category,
    durationHours: isNumber(raw['durationHours']) ? raw['durationHours'] : 2,
    bestTime: isString(raw['bestTime']) ? raw['bestTime'] : 'Anytime',
    popularityScore: isNumber(raw['popularityScore'])
      ? Math.min(100, Math.max(0, raw['popularityScore']))
      : 70,
    isFree: isBoolean(raw['isFree']) ? raw['isFree'] : false,
    entryFeeUSD: isNumber(raw['entryFeeUSD']) ? raw['entryFeeUSD'] : null,
    tips: tips.length > 0 ? tips : [],
  };
}

function parseDish(raw: unknown, idx: number): Dish {
  if (!isObject(raw))
    return {
      name: `Dish ${idx + 1}`,
      description: '',
      emoji: '🍽️',
      priceRange: '$5-15',
      isVegetarian: false,
      isVegan: false,
      spiceLevel: 'mild',
      mustTry: false,
    };
  const spiceLevel =
    isString(raw['spiceLevel']) && VALID_SPICE.has(raw['spiceLevel'] as SpiceLevel)
      ? (raw['spiceLevel'] as SpiceLevel)
      : 'mild';
  return {
    name: isString(raw['name']) ? raw['name'] : `Dish ${idx + 1}`,
    description: isString(raw['description']) ? raw['description'] : '',
    emoji: isString(raw['emoji']) ? raw['emoji'] : '🍽️',
    priceRange: isString(raw['priceRange']) ? raw['priceRange'] : '$5-15',
    isVegetarian: isBoolean(raw['isVegetarian']) ? raw['isVegetarian'] : false,
    isVegan: isBoolean(raw['isVegan']) ? raw['isVegan'] : false,
    spiceLevel,
    mustTry: isBoolean(raw['mustTry']) ? raw['mustTry'] : false,
  };
}

function parseRestaurant(raw: unknown, idx: number): Restaurant {
  if (!isObject(raw))
    return {
      name: `Restaurant ${idx + 1}`,
      cuisine: 'Local',
      priceRange: '€€',
      description: '',
      hours: '',
      area: '',
    };
  const priceRange =
    isString(raw['priceRange']) && VALID_PRICE_RANGE.has(raw['priceRange'] as PriceRange)
      ? (raw['priceRange'] as PriceRange)
      : '€€';
  return {
    name: isString(raw['name']) ? raw['name'] : `Restaurant ${idx + 1}`,
    cuisine: isString(raw['cuisine']) ? raw['cuisine'] : 'Local',
    priceRange,
    description: isString(raw['description']) ? raw['description'] : '',
    hours: isString(raw['hours']) ? raw['hours'] : '',
    area: isString(raw['area']) ? raw['area'] : '',
  };
}

function parseFoodGuide(raw: unknown): FoodGuide {
  if (!isObject(raw))
    return {
      dishes: [],
      restaurants: [],
      streetFood: [],
      dietaryNotes: [],
      waterSafety: 'bottled',
      drinks: [],
      marketTips: [],
    };
  const waterSafety =
    raw['waterSafety'] === 'safe'
      ? 'safe'
      : raw['waterSafety'] === 'filtered'
        ? 'filtered'
        : 'bottled';
  return {
    dishes: isArray(raw['dishes']) ? raw['dishes'].map(parseDish) : [],
    restaurants: isArray(raw['restaurants']) ? raw['restaurants'].map(parseRestaurant) : [],
    streetFood: isArray(raw['streetFood']) ? raw['streetFood'].filter(isString) : [],
    dietaryNotes: isArray(raw['dietaryNotes']) ? raw['dietaryNotes'].filter(isString) : [],
    waterSafety,
    drinks: isArray(raw['drinks']) ? raw['drinks'].filter(isString) : [],
    marketTips: isArray(raw['marketTips']) ? raw['marketTips'].filter(isString) : [],
  };
}

function parseTransportOption(raw: unknown, idx: number): TransportOption | null {
  if (!isObject(raw)) return null;
  const mode =
    isString(raw['mode']) && VALID_TRANSPORT.has(raw['mode'] as TransportMode)
      ? (raw['mode'] as TransportMode)
      : 'taxi';
  const tips = isArray(raw['tips']) ? raw['tips'].filter(isString) : [];
  return {
    mode,
    label: isString(raw['label']) ? raw['label'] : `Option ${idx + 1}`,
    emoji: isString(raw['emoji']) ? raw['emoji'] : '🚌',
    description: isString(raw['description']) ? raw['description'] : '',
    avgCostStr: isString(raw['avgCostStr']) ? raw['avgCostStr'] : '',
    tips,
    available: isBoolean(raw['available']) ? raw['available'] : true,
  };
}

function parseTransportGuide(raw: unknown): TransportGuide {
  if (!isObject(raw)) return { fromAirport: '', options: [], apps: [], tips: [] };
  const apps = isArray(raw['apps'])
    ? raw['apps'].filter(isObject).map((a) => ({
        name: isString(a['name']) ? a['name'] : '',
        emoji: isString(a['emoji']) ? a['emoji'] : '📱',
        note: isString(a['note']) ? a['note'] : '',
      }))
    : [];
  return {
    fromAirport: isString(raw['fromAirport']) ? raw['fromAirport'] : '',
    options: isArray(raw['options'])
      ? (raw['options'].map(parseTransportOption).filter(Boolean) as TransportOption[])
      : [],
    apps,
    tips: isArray(raw['tips']) ? raw['tips'].filter(isString) : [],
  };
}

function parseCostGuide(raw: unknown): CostGuide {
  if (!isObject(raw))
    return {
      localCurrency: 'Local Currency',
      localCurrencyCode: 'USD',
      usdToLocalRate: 1,
      items: [],
      dailyTotalBudget: 50,
      dailyTotalMidrange: 120,
      dailyTotalLuxury: 300,
      tippingNote: '',
      bargainingNote: '',
      atmNote: '',
    };
  const items = isArray(raw['items'])
    ? raw['items'].filter(isObject).map((item) => ({
        category: isString(item['category']) ? item['category'] : 'Other',
        emoji: isString(item['emoji']) ? item['emoji'] : '💰',
        budgetUSD: isNumber(item['budgetUSD']) ? item['budgetUSD'] : 10,
        midrangeUSD: isNumber(item['midrangeUSD']) ? item['midrangeUSD'] : 30,
        luxuryUSD: isNumber(item['luxuryUSD']) ? item['luxuryUSD'] : 100,
      }))
    : [];
  return {
    localCurrency: isString(raw['localCurrency']) ? raw['localCurrency'] : 'Local Currency',
    localCurrencyCode: isString(raw['localCurrencyCode']) ? raw['localCurrencyCode'] : 'USD',
    usdToLocalRate: isNumber(raw['usdToLocalRate']) ? raw['usdToLocalRate'] : 1,
    items,
    dailyTotalBudget: isNumber(raw['dailyTotalBudget']) ? raw['dailyTotalBudget'] : 50,
    dailyTotalMidrange: isNumber(raw['dailyTotalMidrange']) ? raw['dailyTotalMidrange'] : 120,
    dailyTotalLuxury: isNumber(raw['dailyTotalLuxury']) ? raw['dailyTotalLuxury'] : 300,
    tippingNote: isString(raw['tippingNote']) ? raw['tippingNote'] : '',
    bargainingNote: isString(raw['bargainingNote']) ? raw['bargainingNote'] : '',
    atmNote: isString(raw['atmNote']) ? raw['atmNote'] : '',
  };
}

function parseSafety(raw: unknown, countryCode: string): SafetyInfo {
  const emergency = getEmergencyNumbers(countryCode);
  if (!isObject(raw)) {
    return {
      overallRating: 'safe',
      ratingNote: '',
      emergency,
      hospitals: [],
      embassies: [],
      tips: [],
      scams: [],
      avoidAreas: [],
      etiquette: [],
    };
  }
  const overallRating =
    isString(raw['overallRating']) && VALID_SAFETY.has(raw['overallRating'] as SafetyRating)
      ? (raw['overallRating'] as SafetyRating)
      : 'safe';
  return {
    overallRating,
    ratingNote: isString(raw['ratingNote']) ? raw['ratingNote'] : '',
    emergency, // Always from verified lookup table — never from AI
    hospitals: [], // Skip AI-generated hospital names (hallucination risk)
    embassies: [], // Skip AI-generated embassy numbers (hallucination risk)
    tips: isArray(raw['tips']) ? raw['tips'].filter(isString) : [],
    scams: isArray(raw['scams']) ? raw['scams'].filter(isString) : [],
    avoidAreas: isArray(raw['avoidAreas']) ? raw['avoidAreas'].filter(isString) : [],
    etiquette: isArray(raw['etiquette']) ? raw['etiquette'].filter(isString) : [],
  };
}

function parseInsight(raw: unknown, idx: number): AIInsight | null {
  if (!isObject(raw)) return null;
  const category =
    isString(raw['category']) && VALID_INSIGHT_CAT.has(raw['category'] as InsightCategory)
      ? (raw['category'] as InsightCategory)
      : 'experience';
  const priority =
    isString(raw['priority']) && VALID_INSIGHT_PRI.has(raw['priority'] as InsightPriority)
      ? (raw['priority'] as InsightPriority)
      : 'medium';
  return {
    id: isString(raw['id']) ? raw['id'] : `ai-ins-${idx}`,
    title: isString(raw['title']) ? raw['title'] : 'Travel Tip',
    body: isString(raw['body']) ? raw['body'] : '',
    emoji: isString(raw['emoji']) ? raw['emoji'] : '💡',
    category,
    priority,
  };
}

/* ── Prompt builder ───────────────────────────────────────────────── */

function buildPrompt(destination: string): string {
  return `Generate a detailed travel destination guide for: "${destination}"

Return ONLY a valid JSON object — no markdown, no explanation, no trailing text.

Use this exact structure with real, accurate data:

{
  "overview": {
    "destination": "CITY_OR_PLACE_NAME",
    "country": "COUNTRY_NAME",
    "countryCode": "XX",
    "flagEmoji": "🏳",
    "timezone": "Continent/City",
    "timezoneOffset": "UTC+X",
    "currency": "Currency Name",
    "currencyCode": "XXX",
    "currencySymbol": "X",
    "language": "Primary Language",
    "additionalLanguages": ["English"],
    "bestSeason": "Month – Month",
    "avgTempLow": 20,
    "avgTempHigh": 30,
    "description": "2-3 evocative, specific sentences about this destination.",
    "travelStyles": ["Culture", "Food"],
    "visaInfo": "Practical visa note for most nationalities.",
    "internetQuality": "good",
    "touristFriendly": "very"
  },
  "weather": {
    "current": {
      "temp": 25,
      "feelsLike": 28,
      "icon": "⛅",
      "condition": "Partly Cloudy",
      "humidity": 65,
      "windKmh": 15,
      "uvIndex": 6
    },
    "seasonNote": "Description of the current season and typical conditions.",
    "recommendations": ["Packing tip.", "Activity tip.", "Timing tip."]
  },
  "attractions": [
    {
      "id": "a1",
      "name": "Attraction Name",
      "description": "2-3 specific sentences about what makes this unmissable.",
      "imageUrl": "",
      "category": "landmark",
      "durationHours": 2,
      "bestTime": "Morning",
      "popularityScore": 88,
      "isFree": false,
      "entryFeeUSD": 15,
      "tips": ["Practical insider tip.", "Another practical tip."]
    }
  ],
  "food": {
    "dishes": [
      {"name":"Dish Name","description":"What it is and why locals love it.","emoji":"🍜","priceRange":"$5-15","isVegetarian":false,"isVegan":false,"spiceLevel":"mild","mustTry":true}
    ],
    "restaurants": [
      {"name":"Restaurant Name","cuisine":"Cuisine Type","priceRange":"€€","description":"Why it stands out.","hours":"12pm-10pm","area":"Neighborhood or District"}
    ],
    "streetFood": ["Street food item with brief description"],
    "dietaryNotes": ["Note about vegetarian/vegan/halal/etc availability"],
    "waterSafety": "bottled",
    "drinks": ["Local specialty drink"],
    "marketTips": ["Practical market or food shopping tip"]
  },
  "transport": {
    "fromAirport": "Practical description: options, typical cost, and travel time.",
    "options": [
      {"mode":"taxi","label":"Label","emoji":"🚕","description":"Description of this transport mode.","avgCostStr":"$10-20","tips":["Practical tip."],"available":true}
    ],
    "apps": [
      {"name":"App Name","emoji":"📱","note":"What it's used for locally."}
    ],
    "tips": ["Useful general transport tip."]
  },
  "cost": {
    "localCurrency": "Currency Name",
    "localCurrencyCode": "XXX",
    "usdToLocalRate": 80,
    "items": [
      {"category":"Budget meal","emoji":"🍜","budgetUSD":5,"midrangeUSD":15,"luxuryUSD":50},
      {"category":"Accommodation / night","emoji":"🏨","budgetUSD":20,"midrangeUSD":80,"luxuryUSD":250},
      {"category":"Local transport","emoji":"🚌","budgetUSD":3,"midrangeUSD":10,"luxuryUSD":30},
      {"category":"Attraction entry","emoji":"🏛","budgetUSD":5,"midrangeUSD":20,"luxuryUSD":60},
      {"category":"Coffee or drink","emoji":"☕","budgetUSD":2,"midrangeUSD":5,"luxuryUSD":12}
    ],
    "dailyTotalBudget": 35,
    "dailyTotalMidrange": 130,
    "dailyTotalLuxury": 400,
    "tippingNote": "Tipping culture and norms.",
    "bargainingNote": "Whether bargaining is expected and where.",
    "atmNote": "ATM availability and fee notes."
  },
  "safety": {
    "overallRating": "safe",
    "ratingNote": "One sentence summary of overall safety for tourists.",
    "tips": ["Practical safety tip.", "Another safety tip.", "A third tip."],
    "scams": ["Common tourist scam to watch out for.", "Another scam."],
    "avoidAreas": ["Area or situation to be cautious about."],
    "etiquette": ["Cultural etiquette tip.", "Dress code or behaviour tip.", "Another etiquette note."]
  },
  "insights": [
    {"id":"i1","title":"Insight Title","body":"2 sentences of actionable insight only a local would know.","emoji":"💡","category":"timing","priority":"high"}
  ]
}

Rules:
- "destination" = city/place name only, NOT "City, Country"
- "countryCode" = ISO 3166-1 alpha-2 (e.g. JP, FR, IN)
- Include 6-8 attractions, 5-6 dishes, 3-4 restaurants, 4-5 transport options, 4-6 insights
- category (attractions): landmark|nature|museum|food|shopping|entertainment|religious|beach|adventure
- spiceLevel: none|mild|medium|hot|very-hot
- priceRange (restaurants): €|€€|€€€|€€€€
- mode (transport): airport|metro|taxi|bus|train|car-rental|ride-share|tuk-tuk|ferry|boat|seaplane
- internetQuality: excellent|good|fair|poor
- touristFriendly: very|moderate|limited
- overallRating: very-safe|safe|moderate|caution|high-risk
- category (insights): timing|money|culture|food|safety|experience
- priority: high|medium|low
- waterSafety: safe|bottled|filtered`;
}

/* ── JSON extraction ──────────────────────────────────────────────── */

function extractJSON(text: string): unknown {
  const stripped = text.trim();

  // Strip markdown code fences if present
  const fenceMatch = stripped.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) {
    return JSON.parse(fenceMatch[1].trim());
  }

  // Find the outermost JSON object
  const startIdx = stripped.indexOf('{');
  const endIdx = stripped.lastIndexOf('}');
  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    throw new Error('No JSON object found in AI response');
  }

  return JSON.parse(stripped.slice(startIdx, endIdx + 1));
}

/* ── AI generation ────────────────────────────────────────────────── */

async function generateAIDestination(destination: string): Promise<DestinationData> {
  const response = await chatWithAI([{ role: 'user', content: buildPrompt(destination) }], {
    systemPrompt:
      'You are a travel data API. Respond with ONLY a valid JSON object — no markdown code fences, no explanation.',
  });

  const raw = extractJSON(response.content);
  if (!isObject(raw)) throw new Error('AI response is not a JSON object');

  const overviewRaw = isObject(raw['overview']) ? raw['overview'] : {};
  const destination_name = nonEmptyString(
    overviewRaw['destination'],
    destination.split(',')[0].trim(),
  );
  const country = nonEmptyString(overviewRaw['country'], '');
  const countryCode = nonEmptyString(overviewRaw['countryCode'], '');

  const weatherRaw = isObject(raw['weather']) ? raw['weather'] : {};
  const currentRaw = isObject(weatherRaw['current']) ? weatherRaw['current'] : {};
  const current: WeatherData['current'] = {
    temp: isNumber(currentRaw['temp']) ? currentRaw['temp'] : 24,
    feelsLike: isNumber(currentRaw['feelsLike']) ? currentRaw['feelsLike'] : 26,
    icon: nonEmptyString(currentRaw['icon'], '⛅'),
    condition: nonEmptyString(currentRaw['condition'], 'Partly Cloudy'),
    humidity: isNumber(currentRaw['humidity']) ? currentRaw['humidity'] : 65,
    windKmh: isNumber(currentRaw['windKmh']) ? currentRaw['windKmh'] : 14,
    uvIndex: isNumber(currentRaw['uvIndex']) ? currentRaw['uvIndex'] : 5,
  };

  const attractions = isArray(raw['attractions'])
    ? (raw['attractions'].map(parseAttraction).filter(Boolean) as Attraction[])
    : [];

  return {
    overview: {
      destination: destination_name,
      country,
      countryCode,
      flagEmoji: nonEmptyString(overviewRaw['flagEmoji'], '🌍'),
      timezone: nonEmptyString(overviewRaw['timezone'], 'UTC'),
      timezoneOffset: nonEmptyString(overviewRaw['timezoneOffset'], 'UTC+0'),
      currency: nonEmptyString(overviewRaw['currency'], 'Local Currency'),
      currencyCode: nonEmptyString(overviewRaw['currencyCode'], 'USD'),
      currencySymbol: nonEmptyString(overviewRaw['currencySymbol'], '$'),
      language: nonEmptyString(overviewRaw['language'], 'Local Language'),
      additionalLanguages: isArray(overviewRaw['additionalLanguages'])
        ? overviewRaw['additionalLanguages'].filter(isString)
        : ['English'],
      bestSeason: nonEmptyString(overviewRaw['bestSeason'], 'Year-round'),
      avgTempLow: isNumber(overviewRaw['avgTempLow']) ? overviewRaw['avgTempLow'] : 18,
      avgTempHigh: isNumber(overviewRaw['avgTempHigh']) ? overviewRaw['avgTempHigh'] : 28,
      description: nonEmptyString(overviewRaw['description'], `Discover ${destination_name}.`),
      travelStyles: isArray(overviewRaw['travelStyles'])
        ? overviewRaw['travelStyles'].filter(isString)
        : ['Culture', 'Adventure'],
      visaInfo: nonEmptyString(
        overviewRaw['visaInfo'],
        'Check visa requirements for your nationality.',
      ),
      internetQuality: ['excellent', 'good', 'fair', 'poor'].includes(
        String(overviewRaw['internetQuality']),
      )
        ? (overviewRaw['internetQuality'] as 'excellent' | 'good' | 'fair' | 'poor')
        : 'good',
      touristFriendly: ['very', 'moderate', 'limited'].includes(
        String(overviewRaw['touristFriendly']),
      )
        ? (overviewRaw['touristFriendly'] as 'very' | 'moderate' | 'limited')
        : 'moderate',
    },
    weather: {
      current,
      forecast: buildForecastFromCurrent(current),
      seasonNote: nonEmptyString(
        weatherRaw['seasonNote'],
        'Check local forecasts closer to your travel date.',
      ),
      recommendations: isArray(weatherRaw['recommendations'])
        ? weatherRaw['recommendations'].filter(isString)
        : ['Pack layers for changing conditions.'],
    },
    attractions,
    food: parseFoodGuide(raw['food']),
    transport: parseTransportGuide(raw['transport']),
    cost: parseCostGuide(raw['cost']),
    safety: parseSafety(raw['safety'], countryCode),
    checklist: BASE_CHECKLIST,
    insights: isArray(raw['insights'])
      ? (raw['insights'].map(parseInsight).filter(Boolean) as AIInsight[])
      : [],
  };
}

/* ── Provider ─────────────────────────────────────────────────────── */

export class AIDestinationProvider implements DestinationProvider {
  async getDestinationData(destination: string): Promise<DestinationData> {
    // Static curated data takes precedence — it's hand-crafted and higher quality
    if (hasStaticData(destination)) {
      return getDestinationData(destination);
    }

    // AI-generate for any destination outside the curated database
    try {
      return await generateAIDestination(destination);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn(
          '[destination-intel] AI generation failed, falling back to generic data:',
          err,
        );
      }
      return buildGenericData(destination);
    }
  }
}
