export type AttractionCategory =
  | 'landmark'
  | 'nature'
  | 'museum'
  | 'food'
  | 'shopping'
  | 'entertainment'
  | 'religious'
  | 'beach'
  | 'adventure';

export type SpiceLevel = 'none' | 'mild' | 'medium' | 'hot' | 'very-hot';
export type PriceRange = '€' | '€€' | '€€€' | '€€€€';
export type TransportMode =
  | 'airport'
  | 'metro'
  | 'taxi'
  | 'bus'
  | 'train'
  | 'car-rental'
  | 'ride-share'
  | 'tuk-tuk'
  | 'ferry'
  | 'boat'
  | 'seaplane';
export type SafetyRating = 'very-safe' | 'safe' | 'moderate' | 'caution' | 'high-risk';
export type ChecklistCategory =
  'documents' | 'health' | 'money' | 'clothing' | 'tech' | 'essentials';
export type InsightCategory = 'timing' | 'money' | 'culture' | 'food' | 'safety' | 'experience';
export type InsightPriority = 'high' | 'medium' | 'low';

export interface DestinationOverview {
  destination: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  timezone: string;
  timezoneOffset: string;
  currency: string;
  currencyCode: string;
  currencySymbol: string;
  language: string;
  additionalLanguages: string[];
  bestSeason: string;
  avgTempLow: number;
  avgTempHigh: number;
  description: string;
  travelStyles: string[];
  visaInfo: string;
  internetQuality: 'excellent' | 'good' | 'fair' | 'poor';
  touristFriendly: 'very' | 'moderate' | 'limited';
}

export interface WeatherDay {
  dayLabel: string;
  dateStr: string;
  icon: string;
  condition: string;
  high: number;
  low: number;
  precipPct: number;
  humidity: number;
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    icon: string;
    condition: string;
    humidity: number;
    windKmh: number;
    uvIndex: number;
  };
  forecast: WeatherDay[];
  seasonNote: string;
  recommendations: string[];
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: AttractionCategory;
  durationHours: number;
  bestTime: string;
  popularityScore: number;
  isFree: boolean;
  entryFeeUSD: number | null;
  tips: string[];
}

export interface Dish {
  name: string;
  description: string;
  emoji: string;
  priceRange: string;
  isVegetarian: boolean;
  isVegan: boolean;
  spiceLevel: SpiceLevel;
  mustTry: boolean;
}

export interface Restaurant {
  name: string;
  cuisine: string;
  priceRange: PriceRange;
  description: string;
  hours: string;
  area: string;
}

export interface FoodGuide {
  dishes: Dish[];
  restaurants: Restaurant[];
  streetFood: string[];
  dietaryNotes: string[];
  waterSafety: 'safe' | 'bottled' | 'filtered';
  drinks: string[];
  marketTips: string[];
}

export interface TransportOption {
  mode: TransportMode;
  label: string;
  emoji: string;
  description: string;
  avgCostStr: string;
  tips: string[];
  available: boolean;
}

export interface TransportGuide {
  fromAirport: string;
  options: TransportOption[];
  apps: { name: string; emoji: string; note: string }[];
  tips: string[];
}

export interface CostItem {
  category: string;
  emoji: string;
  budgetUSD: number;
  midrangeUSD: number;
  luxuryUSD: number;
}

export interface CostGuide {
  localCurrency: string;
  localCurrencyCode: string;
  usdToLocalRate: number;
  items: CostItem[];
  dailyTotalBudget: number;
  dailyTotalMidrange: number;
  dailyTotalLuxury: number;
  tippingNote: string;
  bargainingNote: string;
  atmNote: string;
}

export interface SafetyInfo {
  overallRating: SafetyRating;
  ratingNote: string;
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    general: string;
    touristHelpline: string;
  };
  hospitals: { name: string; area: string }[];
  embassies: { country: string; phone: string }[];
  tips: string[];
  scams: string[];
  avoidAreas: string[];
  etiquette: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: ChecklistCategory;
  required: boolean;
  note?: string;
}

export interface AIInsight {
  id: string;
  title: string;
  body: string;
  emoji: string;
  category: InsightCategory;
  priority: InsightPriority;
}

export interface DestinationData {
  overview: DestinationOverview;
  weather: WeatherData;
  attractions: Attraction[];
  food: FoodGuide;
  transport: TransportGuide;
  cost: CostGuide;
  safety: SafetyInfo;
  checklist: ChecklistItem[];
  insights: AIInsight[];
  /** Present and true only when this data is the generic fallback returned
   * after an AI/provider failure — never set on real AI or curated data. */
  meta?: {
    isFallback: boolean;
  };
}
