// Static destination catalogue + currency metadata for the Create Trip wizard.

export interface DestinationInfo {
  name: string;
  country: string;
  countryCode: string;
  flagEmoji: string;
  description: string;
  attractions: string[];
  bestSeason: string;
  avgDailyBudget: number; // USD per person, mid-range
  searchTerms: string[];
}

export interface CurrencyMeta {
  code: string;
  symbol: string;
  name: string;
  usdRate: number; // 1 USD = X units of this currency
  sliderMax: number;
  sliderStep: number;
}

export const CURRENCIES: CurrencyMeta[] = [
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    usdRate: 83,
    sliderMax: 300000,
    sliderStep: 1000,
  },
  { code: 'USD', symbol: '$', name: 'US Dollar', usdRate: 1, sliderMax: 6000, sliderStep: 50 },
  { code: 'EUR', symbol: '€', name: 'Euro', usdRate: 0.92, sliderMax: 6000, sliderStep: 50 },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    usdRate: 0.79,
    sliderMax: 5000,
    sliderStep: 50,
  },
  {
    code: 'AED',
    symbol: 'AED',
    name: 'UAE Dirham',
    usdRate: 3.67,
    sliderMax: 25000,
    sliderStep: 100,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    usdRate: 1.35,
    sliderMax: 8000,
    sliderStep: 50,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    usdRate: 151,
    sliderMax: 700000,
    sliderStep: 5000,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    usdRate: 1.55,
    sliderMax: 9000,
    sliderStep: 100,
  },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', usdRate: 36, sliderMax: 200000, sliderStep: 1000 },
  {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    usdRate: 4.7,
    sliderMax: 28000,
    sliderStep: 100,
  },
];

export function getCurrencyMeta(code: string): CurrencyMeta {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

// Percentage split across budget categories (sums to 1.0)
const ALLOC: Record<string, number> = {
  accommodation: 0.33,
  food: 0.18,
  transport: 0.15,
  activities: 0.15,
  shopping: 0.09,
  emergency: 0.05,
  visa: 0.03,
  insurance: 0.02,
};

export function suggestBudget(
  avgDailyUSD: number,
  duration: number,
  currencyCode: string,
  liveRate?: number,
): Record<string, number> {
  const meta = getCurrencyMeta(currencyCode);
  const rate = liveRate ?? meta.usdRate;
  const total = avgDailyUSD * duration * rate;
  return Object.fromEntries(
    Object.entries(ALLOC).map(([k, pct]) => [
      k,
      Math.max(meta.sliderStep, Math.round((total * pct) / meta.sliderStep) * meta.sliderStep),
    ]),
  );
}

export const POPULAR_DESTINATIONS: DestinationInfo[] = [
  {
    name: 'Goa',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      "Sun-drenched beaches, Portuguese heritage, and legendary nightlife along India's Konkan coast — the perfect blend of relaxation and adventure.",
    attractions: [
      'Baga & Calangute Beach',
      'Dudhsagar Falls',
      'Old Goa Basilica',
      'Anjuna Flea Market',
    ],
    bestSeason: 'Nov – Feb',
    avgDailyBudget: 55,
    searchTerms: ['goa', 'panaji', 'calangute', 'vagator'],
  },
  {
    name: 'Kerala',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      "Tranquil backwaters, lush tea estates, and Ayurvedic wellness at the tip of the Indian subcontinent — called God's Own Country for good reason.",
    attractions: [
      'Alleppey Backwaters',
      'Munnar Tea Gardens',
      'Periyar Wildlife Sanctuary',
      'Varkala Cliffs',
    ],
    bestSeason: 'Sep – Mar',
    avgDailyBudget: 45,
    searchTerms: ['kerala', 'alleppey', 'kochi', 'munnar', 'varkala'],
  },
  {
    name: 'Rajasthan',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      'Opulent palaces, golden sand dunes, and vibrant bazaars paint the Land of Kings in rich amber and crimson — an immersive dive into Mughal and Rajput heritage.',
    attractions: [
      'Amber Fort, Jaipur',
      'City Palace, Udaipur',
      'Mehrangarh Fort, Jodhpur',
      'Sam Sand Dunes, Jaisalmer',
    ],
    bestSeason: 'Oct – Mar',
    avgDailyBudget: 60,
    searchTerms: ['rajasthan', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer'],
  },
  {
    name: 'Manali',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      'Snow-capped Himalayan peaks, apple orchards, and adrenaline-fuelled adventure sports make this high-altitude escape a perennial favourite.',
    attractions: [
      'Rohtang Pass',
      'Solang Valley',
      'Hadimba Devi Temple',
      'Great Himalayan National Park',
    ],
    bestSeason: 'Mar – Jun & Sep – Nov',
    avgDailyBudget: 40,
    searchTerms: ['manali', 'himachal', 'rohtang', 'kullu'],
  },
  {
    name: 'Kashmir',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      'Emerald Dal Lake, saffron meadows, and pine forests beneath snow-draped peaks — Kashmir earns its Paradise on Earth title with breathtaking serenity.',
    attractions: [
      'Dal Lake Shikara Ride',
      'Gulmarg Gondola',
      'Pahalgam Valley',
      'Nishat Bagh Gardens',
    ],
    bestSeason: 'Apr – Oct',
    avgDailyBudget: 50,
    searchTerms: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam'],
  },
  {
    name: 'Mumbai',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      "India's maximum city pulses with Bollywood glamour, colonial architecture, coastal promenades, and some of the world's finest street food.",
    attractions: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Colaba Causeway'],
    bestSeason: 'Nov – Feb',
    avgDailyBudget: 65,
    searchTerms: ['mumbai', 'bombay', 'maharashtra'],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    countryCode: 'ID',
    flagEmoji: '🇮🇩',
    description:
      "Rice terraces, ancient temples, world-class surf, and a spiritual energy that's uniquely its own — Bali remains Southeast Asia's most enchanting island.",
    attractions: [
      'Tegallalang Rice Terraces',
      'Tanah Lot Temple',
      'Ubud Monkey Forest',
      'Seminyak Beach',
    ],
    bestSeason: 'Apr – Sep',
    avgDailyBudget: 70,
    searchTerms: ['bali', 'ubud', 'seminyak', 'kuta', 'canggu', 'indonesia'],
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    countryCode: 'TH',
    flagEmoji: '🇹🇭',
    description:
      'A city of extremes: ornate temples beside rooftop bars, tuk-tuks beside sky trains, and street noodles beside Michelin-starred restaurants.',
    attractions: [
      'Grand Palace & Wat Phra Kaew',
      'Chatuchak Weekend Market',
      'Khao San Road',
      'Chao Phraya River Cruise',
    ],
    bestSeason: 'Nov – Apr',
    avgDailyBudget: 55,
    searchTerms: ['bangkok', 'thailand', 'bkk', 'pattaya'],
  },
  {
    name: 'Phuket',
    country: 'Thailand',
    countryCode: 'TH',
    flagEmoji: '🇹🇭',
    description:
      "Turquoise Andaman waters, limestone karsts, and vibrant beach clubs make Phuket Thailand's most visited island — and deservedly so.",
    attractions: ['Patong Beach', 'Phi Phi Islands Day Trip', 'Phang Nga Bay', 'Big Buddha'],
    bestSeason: 'Nov – Apr',
    avgDailyBudget: 65,
    searchTerms: ['phuket', 'patong', 'thailand', 'phi phi'],
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    countryCode: 'SG',
    flagEmoji: '🇸🇬',
    description:
      'A futuristic city-state where hawker centre laksa meets glittering Marina Bay skylines, immaculate gardens, and world-class shopping.',
    attractions: [
      'Gardens by the Bay',
      'Marina Bay Sands SkyPark',
      'Sentosa Island',
      'Hawker Centre Hopping',
    ],
    bestSeason: 'Feb – Apr',
    avgDailyBudget: 120,
    searchTerms: ['singapore', 'sg', 'sentosa'],
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    flagEmoji: '🇯🇵',
    description:
      'Cherry blossoms over ancient shrines, neon-lit Shibuya crossings, 14-course omakase, and manga culture — Tokyo is a civilisation unto itself.',
    attractions: [
      'Shibuya Crossing',
      'Senso-ji Temple, Asakusa',
      'Tsukiji Outer Market',
      'teamLab Borderless',
    ],
    bestSeason: 'Mar – May & Sep – Nov',
    avgDailyBudget: 130,
    searchTerms: ['tokyo', 'japan', 'shinjuku', 'osaka', 'kyoto', 'jp'],
  },
  {
    name: 'Kyoto',
    country: 'Japan',
    countryCode: 'JP',
    flagEmoji: '🇯🇵',
    description:
      "A thousand shrines, bamboo groves, geisha districts, and matchless temple gardens preserve Japan's imperial soul in every stone-paved lane.",
    attractions: [
      'Fushimi Inari Shrine',
      'Arashiyama Bamboo Grove',
      'Kinkaku-ji (Golden Pavilion)',
      'Gion District',
    ],
    bestSeason: 'Mar – May & Oct – Nov',
    avgDailyBudget: 120,
    searchTerms: ['kyoto', 'japan', 'nara'],
  },
  {
    name: 'Paris',
    country: 'France',
    countryCode: 'FR',
    flagEmoji: '🇫🇷',
    description:
      'The Eiffel Tower at golden hour, warm croissants at a pavement cafe, and Impressionist masterpieces at every turn — the City of Light never disappoints.',
    attractions: [
      'Eiffel Tower',
      'Louvre Museum',
      'Montmartre & Sacre-Coeur',
      'Palace of Versailles',
    ],
    bestSeason: 'Apr – Jun & Sep – Oct',
    avgDailyBudget: 160,
    searchTerms: ['paris', 'france', 'versailles', 'fr'],
  },
  {
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'GB',
    flagEmoji: '🇬🇧',
    description:
      'Royal palaces, world-leading museums, Notting Hill flower stalls, and a pub on every corner — London wears 2,000 years of history with effortless cool.',
    attractions: ['Tower of London', 'British Museum', 'Buckingham Palace', 'Borough Market'],
    bestSeason: 'May – Sep',
    avgDailyBudget: 170,
    searchTerms: ['london', 'uk', 'england', 'britain', 'gb'],
  },
  {
    name: 'Rome',
    country: 'Italy',
    countryCode: 'IT',
    flagEmoji: '🇮🇹',
    description:
      "Throw a coin in the Trevi Fountain, wander the Colosseum at sunset, and eat the world's best pasta — the Eternal City demands to be revisited again and again.",
    attractions: [
      'Colosseum & Roman Forum',
      'Vatican Museums & Sistine Chapel',
      'Trevi Fountain',
      'Borghese Gallery',
    ],
    bestSeason: 'Apr – Jun & Sep – Oct',
    avgDailyBudget: 140,
    searchTerms: ['rome', 'italy', 'roma', 'vatican', 'it'],
  },
  {
    name: 'Barcelona',
    country: 'Spain',
    countryCode: 'ES',
    flagEmoji: '🇪🇸',
    description:
      "Gaudi's fantastical architecture, golden Mediterranean beaches, tapas at midnight, and a bohemian spirit that seduces every visitor without fail.",
    attractions: ['Sagrada Familia', 'Park Guell', 'La Boqueria Market', 'Gothic Quarter'],
    bestSeason: 'May – Jun & Sep – Oct',
    avgDailyBudget: 130,
    searchTerms: ['barcelona', 'spain', 'es', 'catalonia'],
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    flagEmoji: '🇳🇱',
    description:
      'Canal rings, tulip markets, Rembrandt masterpieces, and 400 km of cycling paths through a city that is elegant, liberal, and endlessly photogenic.',
    attractions: ['Rijksmuseum', 'Anne Frank House', 'Canal Ring Boat Tour', 'Keukenhof Gardens'],
    bestSeason: 'Apr – May & Sep – Oct',
    avgDailyBudget: 145,
    searchTerms: ['amsterdam', 'netherlands', 'nl', 'holland'],
  },
  {
    name: 'Santorini',
    country: 'Greece',
    countryCode: 'GR',
    flagEmoji: '🇬🇷',
    description:
      'Blue-domed churches perched on volcanic caldera cliffs, wine-dark Aegean sunsets, and pebble beaches of black and red volcanic sand.',
    attractions: ['Oia Sunset', 'Akrotiri Excavations', 'Perissa Black Beach', 'Fira Caldera Walk'],
    bestSeason: 'May – Oct',
    avgDailyBudget: 150,
    searchTerms: ['santorini', 'greece', 'gr', 'oia', 'fira', 'mykonos'],
  },
  {
    name: 'Dubai',
    country: 'UAE',
    countryCode: 'AE',
    flagEmoji: '🇦🇪',
    description:
      "Towering above the desert, Dubai blends ultra-luxury with authentic Arabian hospitality — the world's tallest tower, indoor ski slopes, and souq gold markets coexist here.",
    attractions: [
      'Burj Khalifa & Dubai Fountain',
      'Palm Jumeirah',
      'Dubai Mall',
      'Al Fahidi Historic District',
    ],
    bestSeason: 'Nov – Mar',
    avgDailyBudget: 180,
    searchTerms: ['dubai', 'uae', 'abu dhabi', 'ae'],
  },
  {
    name: 'Maldives',
    country: 'Maldives',
    countryCode: 'MV',
    flagEmoji: '🇲🇻',
    description:
      'Overwater bungalows above coral reefs, bioluminescent nights, and crystalline lagoons in a string of low-lying atolls the Indian Ocean has kept a secret for too long.',
    attractions: [
      'Snorkelling & Diving Reefs',
      'Overwater Villa Experience',
      'Whale Shark Watching',
      'Sunset Cruise',
    ],
    bestSeason: 'Nov – Apr',
    avgDailyBudget: 250,
    searchTerms: ['maldives', 'mv', 'male', 'atoll'],
  },
  {
    name: 'New York',
    country: 'United States',
    countryCode: 'US',
    flagEmoji: '🇺🇸',
    description:
      'The skyline, the subway, Central Park at dawn, Broadway at midnight, and a slice of New York pizza at 3 am — a city that never stops revealing itself.',
    attractions: ['Central Park', 'Metropolitan Museum of Art', 'High Line', 'Brooklyn Bridge'],
    bestSeason: 'Apr – Jun & Sep – Nov',
    avgDailyBudget: 200,
    searchTerms: ['new york', 'nyc', 'manhattan', 'brooklyn', 'us', 'usa'],
  },
  {
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'AU',
    flagEmoji: '🇦🇺',
    description:
      'The Opera House sails against a harbour of turquoise water; world-class beaches flank a cosmopolitan city with a joie de vivre that feels as natural as sunscreen.',
    attractions: [
      'Sydney Opera House',
      'Bondi Beach',
      'Blue Mountains Day Trip',
      'Darling Harbour',
    ],
    bestSeason: 'Sep – Nov & Mar – May',
    avgDailyBudget: 155,
    searchTerms: ['sydney', 'australia', 'au', 'bondi', 'melbourne'],
  },
  {
    name: 'Hanoi',
    country: 'Vietnam',
    countryCode: 'VN',
    flagEmoji: '🇻🇳',
    description:
      "Ancient Old Quarter lanes, egg coffee culture, motorcycle chaos, and Halong Bay limestone karsts rising from emerald waters — Vietnam's capital rewards the curious.",
    attractions: [
      'Hoan Kiem Lake',
      'Old Quarter Walking Tour',
      'Temple of Literature',
      'Halong Bay Cruise',
    ],
    bestSeason: 'Oct – Apr',
    avgDailyBudget: 40,
    searchTerms: ['hanoi', 'vietnam', 'vn', 'ho chi minh', 'halong', 'hoi an'],
  },
  {
    name: 'Andaman Islands',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      'Pristine ivory beaches edged by coral reefs, old-growth rainforest, and an underwater world that makes divers plan return trips before they have even surfaced.',
    attractions: ['Radhanagar Beach', 'Cellular Jail', 'Scuba Diving & Snorkelling', 'Neil Island'],
    bestSeason: 'Oct – May',
    avgDailyBudget: 65,
    searchTerms: ['andaman', 'port blair', 'havelock', 'neil island'],
  },
  {
    name: 'Ladakh',
    country: 'India',
    countryCode: 'IN',
    flagEmoji: '🇮🇳',
    description:
      'The high-altitude cold desert of Ladakh offers Buddhist monasteries clinging to ochre cliffs, sapphire-blue lakes at 4,000 m, and a silence that restores the soul.',
    attractions: ['Pangong Tso Lake', 'Nubra Valley', 'Thiksey Monastery', 'Magnetic Hill'],
    bestSeason: 'May – Sep',
    avgDailyBudget: 55,
    searchTerms: ['ladakh', 'leh', 'nubra', 'pangong'],
  },
];

export function searchDestinations(query: string): DestinationInfo[] {
  if (!query.trim()) return POPULAR_DESTINATIONS.slice(0, 8);
  const q = query.toLowerCase();
  return POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q) ||
      d.searchTerms.some((t) => t.includes(q)),
  ).slice(0, 8);
}
