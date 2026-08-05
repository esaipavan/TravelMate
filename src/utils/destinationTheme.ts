// ── Public types ──────────────────────────────────────────────────────────────

export interface DestinationTheme {
  accent: string;
  accentRgb: string;
  secondary: string;
  /** Primary image URL — backward-compatible single value. */
  imageUrl: string;
  /** All available images for carousels / galleries (first = primary). */
  imageUrls: string[];
}

// ── Internal types ────────────────────────────────────────────────────────────

interface ColorSet {
  accent: string;
  accentRgb: string;
  secondary: string;
}

/**
 * Semantic rules — checked BEFORE destination lookup.
 * If the destination string contains one of these keywords the associated
 * images are used regardless of the city/country name.
 * Order matters: first match wins.
 */
interface SemanticRule {
  keywords: string[];
  images: string[];
}

/**
 * A destination entry covers one or more place names (city aliases, country,
 * region). `keys` are lowercase substrings matched against the destination
 * string. More-specific entries (city names) must appear BEFORE less-specific
 * ones (country names) so "Paris, France" matches `paris` not `france`.
 *
 * `images` should contain 2–5 diverse Unsplash photo IDs for the same place.
 */
interface DestinationEntry {
  keys: string[];
  images: string[];
  colors: ColorSet;
}

// ── Semantic rules (highest priority) ────────────────────────────────────────
// Checked against the full destination string before any city/country lookup.
// Any destination whose name contains one of these keywords uses the semantic
// image pool rather than the city-level mapping.

const SEMANTIC_RULES: SemanticRule[] = [
  {
    // Religious architecture — temples, churches, mosques, shrines, monasteries, pilgrimage sites
    keywords: [
      'temple',
      'church',
      'mosque',
      'shrine',
      'monastery',
      'pilgrimage',
      'cathedral',
      'basilica',
      'pagoda',
      'gurudwara',
      'mandir',
      'masjid',
      'synagogue',
    ],
    images: [
      'photo-1545569341-9eb8b30979d9', // Fushimi Inari torii gates, Kyoto
      'photo-1528181304800-259b08848526', // Angkor Wat temple complex
      'photo-1561361058-c24cecae35ca', // Varanasi ghats with temples
      'photo-1557482011-7b5e68abedc6', // Golden Temple, Amritsar
      'photo-1524231757912-21f4fe3a7200', // Blue Mosque / Hagia Sophia, Istanbul
      'photo-1531572753322-ad063cecc140', // St. Peter's Basilica, Vatican
      'photo-1604999333679-b86d54738315', // Borobudur Buddhist temple
      'photo-1580674684081-7617fbf3d745', // Dome of the Rock, Jerusalem
      'photo-1506197603052-3cc9c3a201bd', // Bagan pagodas, Myanmar
      'photo-1539037116277-4db20889f2d4', // Sagrada Família, Barcelona
    ],
  },
  {
    // Islands — standalone island destinations (checked before beach/coast)
    keywords: ['island', 'islands', 'atoll', 'archipelago'],
    images: [
      'photo-1519046904884-53103b34b206', // Maldives aerial island
      'photo-1544551763-46a013bb70d5', // tropical island aerial view
      'photo-1559494007-9f5847c49d94', // Phuket limestone island karsts
      'photo-1552537638-08d20886f33f', // Caribbean turquoise island
      'photo-1560115246-d3d5e4a6b9e4', // Bora Bora overwater bungalows
      'photo-1569346383633-afa69c8d0f33', // tropical island paradise aerial
    ],
  },
  {
    // Beaches & coastal (islands handled separately above)
    keywords: ['beach', 'coast', 'lagoon', 'bay', 'shore', 'reef'],
    images: [
      'photo-1507525428034-b723cf961d3e', // classic tropical beach
      'photo-1519046904884-53103b34b206', // Maldives overwater bungalow
      'photo-1559494007-9f5847c49d94', // Phuket limestone karsts
      'photo-1512343879784-a960bf40e7f2', // Goa beach sunset
      'photo-1552537638-08d20886f33f', // Caribbean turquoise water
      'photo-1488646953014-85cb44e25828', // aerial beach shot
      'photo-1527631746610-bca00a040d60', // warm waves on beach
      'photo-1537996194471-e657df975ab4', // Bali coast / rice terraces
    ],
  },
  {
    // Mountains & high altitude
    keywords: [
      'mountain',
      'peak',
      'summit',
      'glacier',
      'alpine',
      'highlands',
      'hill station',
      'trek',
      'base camp',
    ],
    images: [
      'photo-1506905925346-21bda4d32df4', // Swiss Alps reflection
      'photo-1585016495481-91b5b6a52bcd', // Manali snowy peaks
      'photo-1546517379-b35f0b5c7da8', // Ladakh high altitude
      'photo-1558618666-fcd25c85cd64', // Himachal Pradesh mountains
      'photo-1579546929518-9e396f3cc809', // Kashmir valley
      'photo-1421789665209-c9b2a435e3dc', // misty mountain forest
      'photo-1549366021-9f761d450615', // alpine lake and peaks
      'photo-1513519245088-0e12902e5a38', // Norwegian fjord / mountains
    ],
  },
  {
    // Waterfalls — checked before lakes/rivers
    keywords: ['waterfall', 'falls', 'cascade'],
    images: [
      'photo-1500534314209-a25ddb2bd429', // tall waterfall in lush valley
      'photo-1564348468680-eef5bd80cfee', // multi-tiered waterfall
      'photo-1503614472-8c93d56e92ce', // tropical jungle waterfall
      'photo-1536060011697-a6c074d0c31d', // Plitvice-style waterfall
      'photo-1444090542259-0af8fa96557e', // misty waterfall in forest
    ],
  },
  {
    // Lakes & waterways (waterfalls handled separately above)
    keywords: ['lake', 'river', 'backwater', 'canal', 'fjord'],
    images: [
      'photo-1506905925346-21bda4d32df4', // alpine lake (Brienz)
      'photo-1549366021-9f761d450615', // alpine mountain lake
      'photo-1602216056096-3b40cc0c9944', // Kerala backwaters
      'photo-1509356843151-3e7d96241e11', // Scandinavian lake / fjord
      'photo-1513519245088-0e12902e5a38', // Norwegian waterway
    ],
  },
  {
    // Safari & wildlife
    keywords: [
      'safari',
      'wildlife',
      'reserve',
      'national game',
      'savanna',
      'serengeti',
      'masai mara',
    ],
    images: [
      'photo-1547471080-7cc2caa01a7e', // Kenyan savanna with acacia trees
      'photo-1516426122078-c23e76319801', // African wildlife / lion
      'photo-1528547873016-a17a5ded399e', // elephant in the wild
    ],
  },
  {
    // Deserts & arid landscapes
    keywords: ['desert', 'dunes', 'sahara', 'thar', 'wadi'],
    images: [
      'photo-1599661046289-e31897846e41', // Rajasthan sand dunes
      'photo-1539768942893-daf53e448371', // Pyramids in desert landscape
      'photo-1512453979798-5ea266f8880c', // Dubai desert skyline
      'photo-1545167496-c3e7df4c9bca', // Petra, Jordanian desert
    ],
  },
  {
    // Museums & cultural institutions
    keywords: ['museum', 'gallery', 'exhibition', 'archive', 'heritage site'],
    images: [
      'photo-1566127992631-137a642a90f4', // grand museum hall with dome
      'photo-1513475382585-d06e58bcb0e0', // museum gallery with artworks
      'photo-1526413232644-8a40f03cc03b', // classical museum interior
    ],
  },
  {
    // Airports & aviation hubs
    keywords: ['airport', 'aviation', 'aerodrome'],
    images: [
      'photo-1436491865332-7a61a109cc05', // airplane wing above clouds
      'photo-1476514525535-07fb3b4ae5f1', // view from airplane window
      'photo-1542296332-2e4473faf563', // modern airport terminal interior
    ],
  },
  {
    // Palaces — checked before castle/fort rule
    keywords: ['palace', 'chateau', 'château', 'manor', 'versailles'],
    images: [
      'photo-1549880338-65ddcdfd017b', // ornate European palace with gardens
      'photo-1575559944042-9a7c82e6d72b', // grand French chateau
      'photo-1586379893622-03c4a3f18f79', // Hawa Mahal / Indian palace
      'photo-1570168007204-dfb528c6958f', // palace with ornate facade
      'photo-1555685812-4b943f1cb0eb', // palace corridor and arches
    ],
  },
  {
    // Forts & fortresses — checked before castle rule
    keywords: ['fort', 'fortress', 'citadel', 'rampart', 'battlement'],
    images: [
      'photo-1587474260584-136574528ed5', // Mehrangarh Fort, Jodhpur
      'photo-1548661710-7f540a4c7b7e', // medieval European castle/fort
      'photo-1565117220934-e5a7d2a3d9a6', // Hohensalzburg fortress
      'photo-1506905925346-21bda4d32df4', // fortress on cliffs
      'photo-1503754444-d869c4abf896', // fort on hilltop
    ],
  },
  {
    // Castles (palaces and forts handled separately above)
    keywords: ['castle'],
    images: [
      'photo-1565117220934-e5a7d2a3d9a6', // Hohensalzburg castle, Austria
      'photo-1548661710-7f540a4c7b7e', // medieval European castle
      'photo-1503754444-d869c4abf896', // castle on hilltop with foggy forest
      'photo-1587474260584-136574528ed5', // Indian fort / Mehrangarh
    ],
  },
  {
    // National parks & natural reserves (forests handled separately)
    keywords: ['national park', 'nature reserve', 'wilderness', 'rainforest', 'jungle'],
    images: [
      'photo-1469854523086-cc02fe5d8800', // scenic mountain road through park
      'photo-1421789665209-c9b2a435e3dc', // misty ancient forest
      'photo-1441974231531-c6227db76b6e', // redwood / tall forest path
      'photo-1472214103451-9374bd1c798e', // lush green landscape / meadow
    ],
  },
  {
    // Forests & woodland
    keywords: ['forest', 'woodland', 'woods', 'grove', 'arboretum', 'bamboo'],
    images: [
      'photo-1448375240586-882707db888b', // dense green forest canopy
      'photo-1511497584788-876760111969', // misty morning forest path
      'photo-1425913397330-cf8af2ff40a1', // forest with rays of sunlight
      'photo-1441974231531-c6227db76b6e', // redwood tall trees path
      'photo-1473448912268-2022ce9509d8', // golden autumn forest
    ],
  },
  {
    // Snow & winter destinations
    keywords: [
      'snow',
      'winter',
      'skiing',
      'ski resort',
      'snowfall',
      'frozen',
      'aurora',
      'northern lights',
    ],
    images: [
      'photo-1491466424936-e304919aada7', // snowy winter forest landscape
      'photo-1548777123-e216912f54be', // snow-capped mountain peaks
      'photo-1551524559-8af4e6624178', // winter wonderland village
      'photo-1516912481808-3406841bd33c', // snow covered alpine scene
      'photo-1518156677180-95a2893f3499', // frozen lake winter reflection
      'photo-1534559651411-9ca6f02c4cbb', // northern lights / aurora borealis
    ],
  },
  {
    // City skylines & urban destinations
    keywords: ['city', 'skyline', 'downtown', 'metro', 'urban', 'manhattan', 'midtown'],
    images: [
      'photo-1477959858617-67f85cf4f1df', // city skyline at dusk
      'photo-1480714378408-67cf0d13bc1b', // modern city skyline reflection
      'photo-1514565131-fce0801e6173', // urban glass buildings
      'photo-1534430480872-3498386e7856', // aerial city skyline at night
      'photo-1500462918059-b1a0cb512f1d', // city streets at night
    ],
  },
  {
    // Villages & rural towns
    keywords: [
      'village',
      'town',
      'hamlet',
      'countryside',
      'rural',
      'vineyard',
      'farmhouse',
      'cottage',
    ],
    images: [
      'photo-1439337153520-7082a56a81f4', // charming European village street
      'photo-1513584684374-8bab748fbf90', // colorful village row houses
      'photo-1512100357200-a34caff9e5bc', // rustic stone village
      'photo-1529973625058-a665431328fb', // scenic hillside village
      'photo-1524758631624-e2822e304c36', // countryside village with church
    ],
  },
  {
    // Bridges & iconic crossings
    keywords: ['bridge', 'viaduct', 'aqueduct', 'golden gate', 'brooklyn bridge', 'tower bridge'],
    images: [
      'photo-1474487548417-781cb71495f3', // Golden Gate Bridge San Francisco
      'photo-1513635269975-59663e0ac1ad', // Tower Bridge, London
      'photo-1548550026-169aa6f68c1e', // suspension bridge in mountains
      'photo-1523474438810-b04a2480633c', // city bridge at night
      'photo-1477959858617-67f85cf4f1df', // bridge with city skyline
    ],
  },
];

// ── Destination entries ───────────────────────────────────────────────────────
// Ordered: specific (city) → general (country). First match wins.
// Each entry provides 2–5 diverse photos of the same place.

const DESTINATIONS: DestinationEntry[] = [
  // ── India — religious cities ─────────────────────────────────────────────
  // (Note: destinations that literally contain "temple", "mandir", etc. are
  // caught by SEMANTIC_RULES first. These entries serve as fallback when the
  // user types just the city name without a religious keyword.)
  {
    keys: ['varanasi', 'benares'],
    images: [
      'photo-1561361058-c24cecae35ca', // Ghats and temples at sunrise
      'photo-1592394533824-9440e5d68530', // Ganga aarti ceremony
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['rishikesh', 'haridwar'],
    images: [
      'photo-1592394533824-9440e5d68530', // Ganga and ashrams
      'photo-1561361058-c24cecae35ca', // riverside temples
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['amritsar'],
    images: [
      'photo-1557482011-7b5e68abedc6', // Golden Temple reflection
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['mathura', 'vrindavan', 'brindavan'],
    images: [
      'photo-1561361058-c24cecae35ca', // temple riverside
      'photo-1618477461853-cf6ed80faba5', // ornate Hindu temple gopuram
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['tirupati', 'tirumala'],
    images: [
      'photo-1618477461853-cf6ed80faba5', // South Indian temple gopuram
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['puri'],
    images: [
      'photo-1545494097-1545e22ee878', // Puri beach / temple town
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#F97316' },
  },
  {
    keys: ['shirdi'],
    images: [
      'photo-1571896349842-33c89424de2d', // pilgrimage site / domed architecture
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },

  // ── India — cities ────────────────────────────────────────────────────────
  {
    keys: ['goa'],
    images: [
      'photo-1512343879784-a960bf40e7f2', // Baga / Calangute beach sunset
      'photo-1527631746610-bca00a040d60', // tropical coastal beach
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#06B6D4' },
  },
  {
    keys: ['kerala'],
    images: [
      'photo-1602216056096-3b40cc0c9944', // Kerala backwaters houseboat
      'photo-1512343879784-a960bf40e7f2', // coastal Kerala
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#059669' },
  },
  {
    keys: ['jaipur'],
    images: [
      'photo-1586379893622-03c4a3f18f79', // Hawa Mahal / City Palace
      'photo-1599661046289-e31897846e41', // Rajasthan desert landscape
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['udaipur'],
    images: [
      'photo-1586379893622-03c4a3f18f79', // Lake palace / City Palace
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['jodhpur'],
    images: [
      'photo-1587474260584-136574528ed5', // Mehrangarh Fort blue city
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#F97316' },
  },
  {
    keys: ['agra'],
    images: [
      'photo-1564507592333-c60657eea523', // Taj Mahal at dawn
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['manali'],
    images: [
      'photo-1585016495481-91b5b6a52bcd', // Manali snow peaks
      'photo-1558618666-fcd25c85cd64', // Himachal valley
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['shimla'],
    images: [
      'photo-1558618666-fcd25c85cd64', // Shimla hill station
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['dharamshala', 'mcleod'],
    images: [
      'photo-1558618666-fcd25c85cd64', // Himalayan hill town
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#6366F1' },
  },
  {
    keys: ['leh', 'ladakh'],
    images: [
      'photo-1546517379-b35f0b5c7da8', // Ladakh high altitude landscape
      'photo-1579546929518-9e396f3cc809', // Kashmir / Ladakh valleys
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#A78BFA' },
  },
  {
    keys: ['kashmir', 'srinagar'],
    images: [
      'photo-1579546929518-9e396f3cc809', // Dal Lake / Mughal gardens
      'photo-1546517379-b35f0b5c7da8', // Kashmir mountains
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#A78BFA' },
  },
  {
    keys: ['mumbai', 'bombay'],
    images: [
      'photo-1562979314-bee7453e911c', // Mumbai skyline / Gateway of India
    ],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#8B5CF6' },
  },
  {
    keys: ['delhi', 'new delhi'],
    images: [
      'photo-1570168007204-dfb528c6958f', // Delhi Red Fort / India Gate
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },

  // ── Japan ──────────────────────────────────────────────────────────────────
  {
    keys: ['kyoto'],
    images: [
      'photo-1545569341-9eb8b30979d9', // Fushimi Inari torii gates
      'photo-1528181304800-259b08848526', // Arashiyama bamboo grove
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['nara'],
    images: [
      'photo-1545569341-9eb8b30979d9', // Nara deer park / Todai-ji
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#F59E0B' },
  },
  {
    keys: ['tokyo'],
    images: [
      'photo-1540959733332-eab4deabeeaf', // Tokyo skyline at night
      'photo-1536098561742-ca998e48cbcc', // Shibuya crossing
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['osaka'],
    images: [
      'photo-1590559899731-a382839e5549', // Dotonbori neon lights
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#EF4444' },
  },
  {
    keys: ['hiroshima'],
    images: [
      'photo-1545569341-9eb8b30979d9', // Miyajima torii / peace memorial
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },

  // ── Korea ─────────────────────────────────────────────────────────────────
  {
    keys: ['seoul'],
    images: [
      'photo-1617029489771-c8e67ddbc52f', // Gyeongbokgung palace + Namsan Tower
      'photo-1534430480872-3498386e7856', // Han River / Seoul skyline
    ],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#EC4899' },
  },
  {
    keys: ['busan'],
    images: [
      'photo-1601042879364-f3947d3f9c16', // Busan Gamcheon Culture Village
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['gyeongju'],
    images: [
      'photo-1545569341-9eb8b30979d9', // Bulguksa temple / royal tombs
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#10B981' },
  },

  // ── Southeast Asia ────────────────────────────────────────────────────────
  {
    keys: ['angkor', 'siem reap', 'cambodia'],
    images: [
      'photo-1528181304800-259b08848526', // Angkor Wat at sunrise
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#F97316' },
  },
  {
    keys: ['bagan'],
    images: [
      'photo-1506197603052-3cc9c3a201bd', // Bagan temples at sunrise, Myanmar
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#F97316' },
  },
  {
    keys: ['borobudur', 'yogyakarta'],
    images: [
      'photo-1604999333679-b86d54738315', // Borobudur Buddhist stupa
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#10B981' },
  },
  {
    keys: ['bali'],
    images: [
      'photo-1537996194471-e657df975ab4', // Bali rice terraces
      'photo-1573790387438-4da905039392', // Tanah Lot sea temple
      'photo-1559494007-9f5847c49d94', // Bali beach / coast
    ],
    colors: { accent: '#22C55E', accentRgb: '34,197,94', secondary: '#0EA5E9' },
  },
  {
    keys: ['phuket', 'krabi', 'phi phi', 'koh samui', 'koh lanta'],
    images: [
      'photo-1559494007-9f5847c49d94', // Phi Phi / Phang Nga bay
      'photo-1527631746610-bca00a040d60', // Thai beach
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#0EA5E9' },
  },
  {
    keys: ['chiang mai', 'chiang rai'],
    images: [
      'photo-1512361436605-6b8e32f75866', // Doi Suthep temple
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#F59E0B' },
  },
  {
    keys: ['bangkok'],
    images: [
      'photo-1508009603885-50cf7c579365', // Wat Arun / Grand Palace
      'photo-1512361436605-6b8e32f75866', // Thai golden temple
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EC4899' },
  },
  {
    keys: ['singapore'],
    images: [
      'photo-1525625293386-3f8f99389edd', // Marina Bay Sands skyline
      'photo-1604999333679-b86d54738315', // Gardens by the Bay
    ],
    colors: { accent: '#14B8A6', accentRgb: '20,184,166', secondary: '#06B6D4' },
  },
  {
    keys: ['hoi an'],
    images: [
      'photo-1557804506-669a67965ba0', // Hoi An lanterns / ancient town
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#F97316' },
  },
  {
    keys: ['hanoi'],
    images: [
      'photo-1564596823821-79b3a5015df7', // Hoan Kiem Lake / Old Quarter
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#F59E0B' },
  },
  {
    keys: ['ho chi minh', 'saigon'],
    images: [
      'photo-1583417319070-4a69db38a482', // Ho Chi Minh City skyline
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['da nang', 'danang', 'da lat', 'dalat'],
    images: [
      'photo-1557804506-669a67965ba0', // Vietnam coastal scenery
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#10B981' },
  },
  {
    keys: ['kuala lumpur'],
    images: [
      'photo-1601999009162-2459b2b0d254', // Petronas Towers
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#3B82F6' },
  },
  {
    keys: ['langkawi', 'penang'],
    images: [
      'photo-1512343879784-a960bf40e7f2', // Malaysian beach / coast
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#10B981' },
  },
  {
    keys: ['manila', 'boracay', 'palawan', 'philippines', 'cebu'],
    images: [
      'photo-1588689562738-73a2d9e6a4d0', // Philippine beach / islands
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#06B6D4' },
  },

  // ── Middle East ───────────────────────────────────────────────────────────
  {
    keys: ['istanbul', 'ankara', 'antalya'],
    images: [
      'photo-1524231757912-21f4fe3a7200', // Blue Mosque / Hagia Sophia
      'photo-1590000860853-e6e9c6268af9', // Bosphorus bridge at night
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F59E0B' },
  },
  {
    keys: ['cappadocia', 'goreme'],
    images: [
      'photo-1541432901042-2d8bd64b4a9b', // Cappadocia hot air balloons
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['dubai'],
    images: [
      'photo-1512453979798-5ea266f8880c', // Burj Khalifa / Dubai skyline
      'photo-1558618666-fcd25c85cd64', // Dubai desert landscape
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['abu dhabi'],
    images: [
      'photo-1512453979798-5ea266f8880c', // Sheikh Zayed Mosque (also in Abu Dhabi)
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['petra'],
    images: [
      'photo-1545167496-c3e7df4c9bca', // Petra Treasury rose-red rock
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F59E0B' },
  },
  {
    keys: ['jerusalem', 'tel aviv'],
    images: [
      'photo-1580674684081-7617fbf3d745', // Dome of the Rock / Old City walls
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['riyadh', 'jeddah', 'mecca', 'medina', 'saudi'],
    images: [
      'photo-1566552881560-0be862a7c445', // Masjid al-Haram / Saudi skyline
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#F59E0B' },
  },
  {
    keys: ['doha', 'qatar'],
    images: [
      'photo-1590000860853-e6e9c6268af9', // Doha skyline at dusk
    ],
    colors: { accent: '#8B5CF6', accentRgb: '139,92,246', secondary: '#6366F1' },
  },

  // ── Europe — cities ───────────────────────────────────────────────────────
  {
    keys: ['paris'],
    images: [
      'photo-1502602898657-3e91760cbb34', // Eiffel Tower at dusk
      'photo-1522093007474-d86e9bf7ba6f', // Montmartre / Seine
    ],
    colors: { accent: '#A855F7', accentRgb: '168,85,247', secondary: '#EC4899' },
  },
  {
    keys: ['london'],
    images: [
      'photo-1513635269975-59663e0ac1ad', // Tower Bridge
      'photo-1486299267070-83823f5448dd', // London skyline / Big Ben
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#1D4ED8' },
  },
  {
    keys: ['rome'],
    images: [
      'photo-1552832230-c0197dd311b5', // Colosseum at golden hour
      'photo-1531572753322-ad063cecc140', // St. Peter's / Vatican
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['vatican'],
    images: [
      'photo-1531572753322-ad063cecc140', // St. Peter's Basilica aerial
    ],
    colors: { accent: '#8B5CF6', accentRgb: '139,92,246', secondary: '#A855F7' },
  },
  {
    keys: ['venice'],
    images: [
      'photo-1514890547357-a9ee288728e0', // Venice canals / gondolas
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#8B5CF6' },
  },
  {
    keys: ['florence', 'firenze'],
    images: [
      'photo-1523906834658-6e24ef2386f9', // Ponte Vecchio / Duomo
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F59E0B' },
  },
  {
    keys: ['milan', 'milano'],
    images: [
      'photo-1512281943771-5b8d0e4ee4fd', // Milan Duomo cathedral
    ],
    colors: { accent: '#1D4ED8', accentRgb: '29,78,216', secondary: '#6366F1' },
  },
  {
    keys: ['naples', 'napoli', 'amalfi', 'positano'],
    images: [
      'photo-1596797038530-2c107229654b', // Amalfi coast colourful houses
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#F97316' },
  },
  {
    keys: ['barcelona'],
    images: [
      'photo-1539037116277-4db20889f2d4', // Sagrada Família
      'photo-1464790719320-516ecd75af6c', // Barcelona coastline
    ],
    colors: { accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#F97316' },
  },
  {
    keys: ['madrid'],
    images: [
      'photo-1543783207-ec64e4d3f671', // Plaza Mayor / Royal Palace
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['amsterdam'],
    images: [
      'photo-1584003564911-c02f54e8d0f3', // Amsterdam canals / bicycles
      'photo-1513699245186-6a0a2a45a4b4', // Keukenhof / Dutch tulips
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['vienna', 'wien'],
    images: [
      'photo-1516550135131-fe3dcb028b0a', // Schönbrunn Palace / Ringstrasse
    ],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#4F46E5' },
  },
  {
    keys: ['salzburg'],
    images: [
      'photo-1565117220934-e5a7d2a3d9a6', // Hohensalzburg castle
    ],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#4F46E5' },
  },
  {
    keys: ['prague', 'brno'],
    images: [
      'photo-1541849546-216549ae216d', // Prague Castle / Charles Bridge
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#6366F1' },
  },
  {
    keys: ['budapest'],
    images: [
      'photo-1549737328-8b9f9ee4f2d5', // Hungarian Parliament / Danube at night
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['lisbon', 'lisboa'],
    images: [
      'photo-1558369981-f9ca78462e61', // Alfama trams / colourful tiles
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['porto'],
    images: [
      'photo-1555881400-74d7acaacd8b', // Porto Ribeira / Dom Luís bridge
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['berlin'],
    images: [
      'photo-1560930950-5cc20e080a7b', // Brandenburg Gate
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['munich', 'münchen', 'oktoberfest'],
    images: [
      'photo-1595867818082-083862f3d630', // Munich Marienplatz / Frauenkirche
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['hamburg'],
    images: [
      'photo-1560930950-5cc20e080a7b', // German city / port
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['stockholm'],
    images: [
      'photo-1509356843151-3e7d96241e11', // Stockholm archipelago / Gamla Stan
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#3B82F6' },
  },
  {
    keys: ['oslo'],
    images: [
      'photo-1513519245088-0e12902e5a38', // Oslo fjord / Opera House
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#3B82F6' },
  },
  {
    keys: ['copenhagen', 'københavn'],
    images: [
      'photo-1513519245088-0e12902e5a38', // Nyhavn colourful harbour
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#3B82F6' },
  },
  {
    keys: ['helsinki'],
    images: [
      'photo-1509356843151-3e7d96241e11', // Helsinki harbour
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#3B82F6' },
  },
  {
    keys: ['zurich', 'zürcher'],
    images: [
      'photo-1506905925346-21bda4d32df4', // Swiss Alps / lake
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['geneva', 'genf', 'genève'],
    images: [
      'photo-1506905925346-21bda4d32df4', // Lake Geneva / Alps
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['bern'],
    images: [
      'photo-1506905925346-21bda4d32df4', // Swiss capital arcades / Alps
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['santorini', 'oia'],
    images: [
      'photo-1613395877344-13d4a8e0d49e', // Santorini Oia blue domes
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#818CF8' },
  },
  {
    keys: ['mykonos'],
    images: [
      'photo-1613395877344-13d4a8e0d49e', // Mykonos windmills / white houses
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#818CF8' },
  },
  {
    keys: ['athens'],
    images: [
      'photo-1555993539-1732b0258235', // Parthenon / Acropolis
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#F59E0B' },
  },
  {
    keys: ['dubrovnik'],
    images: [
      'photo-1580502304784-8985b7eb7260', // Dubrovnik Old Town walls
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#F59E0B' },
  },
  {
    keys: ['split', 'zagreb', 'croatia'],
    images: [
      'photo-1580502304784-8985b7eb7260', // Croatian Adriatic coast
    ],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#3B82F6' },
  },
  {
    keys: ['brussels', 'bruxelles', 'bruges', 'ghent', 'belgium'],
    images: [
      'photo-1559113202-c916b8e44373', // Grand Place Brussels / Bruges canals
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['reykjavik', 'iceland'],
    images: [
      'photo-1476610182048-b716b8518aae', // Northern lights / Iceland landscape
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#38BDF8' },
  },

  // ── Americas — cities ─────────────────────────────────────────────────────
  {
    keys: ['new york', 'nyc'],
    images: [
      'photo-1534430480872-3498386e7856', // Manhattan skyline at dusk
      'photo-1496442226666-8d4d0e62e6e9', // Brooklyn Bridge / Times Square
    ],
    colors: { accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#6366F1' },
  },
  {
    keys: ['miami'],
    images: [
      'photo-1507525428034-b723cf961d3e', // South Beach
    ],
    colors: { accent: '#EC4899', accentRgb: '236,72,153', secondary: '#06B6D4' },
  },
  {
    keys: ['orlando'],
    images: [
      'photo-1541888946425-d81bb19240f5', // Orlando theme parks / downtown
    ],
    colors: { accent: '#EC4899', accentRgb: '236,72,153', secondary: '#06B6D4' },
  },
  {
    keys: ['los angeles', 'la'],
    images: [
      'photo-1480714378408-67cf0d13bc1b', // LA Hollywood sign / skyline
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#EF4444' },
  },
  {
    keys: ['san francisco'],
    images: [
      'photo-1501594907352-04cda38ebc29', // Golden Gate Bridge in fog
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#EF4444' },
  },
  {
    keys: ['las vegas'],
    images: [
      'photo-1605833556294-ea5c7a74f57d', // Las Vegas Strip at night
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EC4899' },
  },
  {
    keys: ['chicago'],
    images: [
      'photo-1494522855154-9297ac14b55f', // Chicago Bean / skyline
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['cancun', 'riviera maya', 'playa del carmen', 'tulum'],
    images: [
      'photo-1552537638-08d20886f33f', // Mexican Caribbean turquoise water
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#10B981' },
  },
  {
    keys: ['mexico city', 'ciudad de mexico'],
    images: [
      'photo-1518638150340-f706e86654de', // Mexico City Zócalo / Palacio
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#EF4444' },
  },
  {
    keys: ['rio de janeiro', 'rio'],
    images: [
      'photo-1483729558449-99ef09a8c325', // Christ the Redeemer / Copacabana
    ],
    colors: { accent: '#22C55E', accentRgb: '34,197,94', secondary: '#F59E0B' },
  },
  {
    keys: ['sao paulo', 'são paulo'],
    images: [
      'photo-1533929736458-ca588d08c8be', // São Paulo urban skyline
    ],
    colors: { accent: '#22C55E', accentRgb: '34,197,94', secondary: '#F59E0B' },
  },
  {
    keys: ['buenos aires'],
    images: [
      'photo-1589909202802-8f4aadce1849', // La Boca neighbourhood / tango
    ],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['toronto'],
    images: [
      'photo-1517090504586-fde19ea6066f', // CN Tower / Toronto skyline
    ],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['vancouver'],
    images: [
      'photo-1559511260-0519b5f14a1d', // Vancouver mountains + harbour
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#3B82F6' },
  },

  // ── Australasia ───────────────────────────────────────────────────────────
  {
    keys: ['sydney'],
    images: [
      'photo-1506973035872-a4ec16b8e8d9', // Sydney Opera House + Harbour Bridge
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#22C55E' },
  },
  {
    keys: ['melbourne'],
    images: [
      'photo-1506973035872-a4ec16b8e8d9', // Melbourne city / Yarra River
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#22C55E' },
  },
  {
    keys: ['new zealand', 'auckland', 'queenstown', 'christchurch'],
    images: [
      'photo-1507699622108-4be3abd695ad', // NZ landscapes / Queenstown fjord
    ],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#38BDF8' },
  },
  {
    keys: ['maldives'],
    images: [
      'photo-1519046904884-53103b34b206', // Maldives overwater bungalows
      'photo-1527631746610-bca00a040d60', // crystal lagoon
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#38BDF8' },
  },

  // ── Africa ────────────────────────────────────────────────────────────────
  {
    keys: ['cairo', 'luxor', 'aswan'],
    images: [
      'photo-1539768942893-daf53e448371', // Pyramids of Giza at sunset
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['marrakech', 'marrakesh'],
    images: [
      'photo-1587974928442-e3b1def4effc', // Djemaa el-Fna square / medina
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['casablanca', 'fez', 'fès', 'rabat', 'chefchaouen'],
    images: [
      'photo-1587974928442-e3b1def4effc', // Moroccan medina / blue city
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['cape town'],
    images: [
      'photo-1580060839134-75a5edca2e99', // Table Mountain / Cape Town coast
    ],
    colors: { accent: '#14B8A6', accentRgb: '20,184,166', secondary: '#3B82F6' },
  },
  {
    keys: ['johannesburg', 'soweto'],
    images: [
      'photo-1580060839134-75a5edca2e99', // South African urban / landscape
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['nairobi', 'mombasa'],
    images: [
      'photo-1547471080-7cc2caa01a7e', // Kenyan savanna / Nairobi park
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#10B981' },
  },
  {
    keys: ['zanzibar', 'dar es salaam'],
    images: [
      'photo-1527631746610-bca00a040d60', // Zanzibar turquoise beach
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#10B981' },
  },

  // ── Country-level fallbacks (must come AFTER all city entries) ────────────
  {
    keys: ['japan'],
    images: ['photo-1540959733332-eab4deabeeaf', 'photo-1545569341-9eb8b30979d9'],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F97316' },
  },
  {
    keys: ['korea'],
    images: ['photo-1617029489771-c8e67ddbc52f'],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#EC4899' },
  },
  {
    keys: ['thailand'],
    images: ['photo-1508009603885-50cf7c579365', 'photo-1512361436605-6b8e32f75866'],
    colors: { accent: '#06B6D4', accentRgb: '6,182,212', secondary: '#0EA5E9' },
  },
  {
    keys: ['indonesia'],
    images: ['photo-1537996194471-e657df975ab4'],
    colors: { accent: '#22C55E', accentRgb: '34,197,94', secondary: '#0EA5E9' },
  },
  {
    keys: ['vietnam'],
    images: ['photo-1557804506-669a67965ba0'],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#F59E0B' },
  },
  {
    keys: ['malaysia'],
    images: ['photo-1601999009162-2459b2b0d254'],
    colors: { accent: '#10B981', accentRgb: '16,185,129', secondary: '#3B82F6' },
  },
  {
    keys: ['myanmar', 'burma'],
    images: ['photo-1506197603052-3cc9c3a201bd'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#F97316' },
  },
  {
    keys: ['turkey', 'türkiye'],
    images: ['photo-1524231757912-21f4fe3a7200', 'photo-1541432901042-2d8bd64b4a9b'],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#F59E0B' },
  },
  {
    keys: ['israel', 'palestine'],
    images: ['photo-1580674684081-7617fbf3d745'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#F59E0B' },
  },
  {
    keys: ['jordan'],
    images: ['photo-1545167496-c3e7df4c9bca'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['uae', 'emirates'],
    images: ['photo-1512453979798-5ea266f8880c'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['france'],
    images: ['photo-1502602898657-3e91760cbb34'],
    colors: { accent: '#A855F7', accentRgb: '168,85,247', secondary: '#EC4899' },
  },
  {
    keys: ['spain'],
    images: ['photo-1539037116277-4db20889f2d4'],
    colors: { accent: '#F43F5E', accentRgb: '244,63,94', secondary: '#F97316' },
  },
  {
    keys: ['italy'],
    images: ['photo-1552832230-c0197dd311b5', 'photo-1531572753322-ad063cecc140'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['greece'],
    images: ['photo-1613395877344-13d4a8e0d49e', 'photo-1555993539-1732b0258235'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#818CF8' },
  },
  {
    keys: ['portugal'],
    images: ['photo-1558369981-f9ca78462e61'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['germany', 'deutschland'],
    images: ['photo-1560930950-5cc20e080a7b'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['austria', 'österreich'],
    images: ['photo-1516550135131-fe3dcb028b0a', 'photo-1565117220934-e5a7d2a3d9a6'],
    colors: { accent: '#6366F1', accentRgb: '99,102,241', secondary: '#4F46E5' },
  },
  {
    keys: ['switzerland', 'schweiz'],
    images: ['photo-1506905925346-21bda4d32df4', 'photo-1549366021-9f761d450615'],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['netherlands', 'holland'],
    images: ['photo-1584003564911-c02f54e8d0f3'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['czech', 'czechia'],
    images: ['photo-1541849546-216549ae216d'],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#6366F1' },
  },
  {
    keys: ['hungary'],
    images: ['photo-1549737328-8b9f9ee4f2d5'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['scandinavia', 'nordic'],
    images: ['photo-1509356843151-3e7d96241e11', 'photo-1513519245088-0e12902e5a38'],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#3B82F6' },
  },
  {
    keys: ['uk', 'england', 'britain', 'scotland', 'wales'],
    images: ['photo-1513635269975-59663e0ac1ad', 'photo-1486299267070-83823f5448dd'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#1D4ED8' },
  },
  {
    keys: ['australia'],
    images: ['photo-1506973035872-a4ec16b8e8d9'],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#22C55E' },
  },
  {
    keys: ['india'],
    images: ['photo-1564507592333-c60657eea523', 'photo-1548013146-72479768bada'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['rajasthan'],
    images: ['photo-1586379893622-03c4a3f18f79', 'photo-1599661046289-e31897846e41'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['himachal', 'uttarakhand'],
    images: ['photo-1558618666-fcd25c85cd64', 'photo-1585016495481-91b5b6a52bcd'],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['mexico'],
    images: ['photo-1518638150340-f706e86654de'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#EF4444' },
  },
  {
    keys: ['brazil'],
    images: ['photo-1483729558449-99ef09a8c325'],
    colors: { accent: '#22C55E', accentRgb: '34,197,94', secondary: '#F59E0B' },
  },
  {
    keys: ['argentina'],
    images: ['photo-1589909202802-8f4aadce1849'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#6366F1' },
  },
  {
    keys: ['south africa'],
    images: ['photo-1580060839134-75a5edca2e99'],
    colors: { accent: '#14B8A6', accentRgb: '20,184,166', secondary: '#3B82F6' },
  },
  {
    keys: ['morocco'],
    images: ['photo-1587974928442-e3b1def4effc'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EF4444' },
  },
  {
    keys: ['egypt'],
    images: ['photo-1539768942893-daf53e448371'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['kenya'],
    images: ['photo-1547471080-7cc2caa01a7e'],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#10B981' },
  },
  {
    keys: ['canada'],
    images: ['photo-1517090504586-fde19ea6066f', 'photo-1559511260-0519b5f14a1d'],
    colors: { accent: '#EF4444', accentRgb: '239,68,68', secondary: '#3B82F6' },
  },
  {
    keys: ['usa', 'united states', 'america'],
    images: ['photo-1534430480872-3498386e7856', 'photo-1501594907352-04cda38ebc29'],
    colors: { accent: '#3B82F6', accentRgb: '59,130,246', secondary: '#EF4444' },
  },
];

// ── Fallback images ───────────────────────────────────────────────────────────
// Used when neither semantic rules nor destination entries match.
// 20 diverse, high-quality travel photos to minimise collision probability.

const FALLBACKS: string[] = [
  'photo-1469854523086-cc02fe5d8800', // winding mountain road at sunrise
  'photo-1476514525535-07fb3b4ae5f1', // view from airplane window over clouds
  'photo-1503220317375-aaad61436b1b', // travel map with compass on wooden table
  'photo-1527631746610-bca00a040d60', // tropical beach with turquoise water
  'photo-1488646953014-85cb44e25828', // beach overhead aerial
  'photo-1500530855697-b586d89ba3ee', // European cobblestone street at dusk
  'photo-1436491865332-7a61a109cc05', // airplane wing above clouds at sunset
  'photo-1506905925346-21bda4d32df4', // Swiss alpine lake reflection
  'photo-1549366021-9f761d450615', // alpine lake with mountain reflection
  'photo-1502791451862-7bd8c1df43a7', // city skyline at twilight
  'photo-1526772662000-3f88f10405ff', // medieval European town square
  'photo-1421789665209-c9b2a435e3dc', // misty ancient mountain forest
  'photo-1553361371-9b22f78e8b1d', // aerial coastal city view
  'photo-1507003211169-0a1dd7228f2d', // backpacker on mountain with sunset view
  'photo-1476611338391-6f395a0ebc7b', // colourful houses on a hillside
  'photo-1549451371-64aa98a6f660', // travel flat-lay with passport and camera
  'photo-1488085061387-422e29b40080', // window seat overlooking city at night
  'photo-1542314831-068cd1dbfeeb', // hotel pool overlooking tropical coastline
  'photo-1414235077428-338989a2e8c0', // elegant fine dining with candle light
  'photo-1513415431748-1b1cda8abced', // backpacking traveller with sunset panorama
];

const DEFAULT_COLORS: ColorSet = {
  accent: '#6366F1',
  accentRgb: '99,102,241',
  secondary: '#8B5CF6',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUnsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=1600&h=900&fit=crop&crop=entropy&q=80`;
}

/** Stable hash of a string → deterministic index into an array. */
function stableHash(s: string): number {
  return s.split('').reduce((acc, c) => (acc + c.charCodeAt(0)) | 0, 0);
}

// ── Core resolver ─────────────────────────────────────────────────────────────

interface ResolvedImages {
  photoIds: string[];
  colors: ColorSet;
}

function resolveCore(destination: string): ResolvedImages {
  const lower = destination.trim().toLowerCase();

  // 1. Semantic keyword matching — highest priority.
  //    Checks the full destination string for content-type keywords.
  for (const rule of SEMANTIC_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      // Find destination entry just for colors (semantic rules don't carry colors).
      const colorEntry = DESTINATIONS.find(({ keys }) => keys.some((k) => lower.includes(k)));
      return {
        photoIds: rule.images,
        colors: colorEntry?.colors ?? DEFAULT_COLORS,
      };
    }
  }

  // 2. Destination-specific match.
  for (const entry of DESTINATIONS) {
    if (entry.keys.some((k) => lower.includes(k))) {
      return { photoIds: entry.images, colors: entry.colors };
    }
  }

  // 3. Fallback — deterministic selection based on destination name.
  const seed = stableHash(lower);
  const picked = [
    FALLBACKS[seed % FALLBACKS.length],
    FALLBACKS[(seed + 7) % FALLBACKS.length],
    FALLBACKS[(seed + 13) % FALLBACKS.length],
  ].filter((v, i, a) => a.indexOf(v) === i); // deduplicate

  return { photoIds: picked, colors: DEFAULT_COLORS };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns all available image URLs for a destination (2–5 images).
 * Use for carousels, galleries, and anywhere multiple images improve UX.
 */
export function resolveDestinationImages(destination: string): string[] {
  const { photoIds } = resolveCore(destination || 'travel');
  return photoIds.map(toUnsplashUrl);
}

/**
 * Returns the primary (first) image URL for a destination.
 * Backward-compatible with all existing consumers.
 */
export function resolveDestinationImageUrl(destination: string): string {
  return resolveDestinationImages(destination)[0];
}

/**
 * Returns the full theme — colors + images — for a destination.
 * The `imageUrl` field is the primary image (backward compatible).
 * The `imageUrls` field contains all available images.
 */
export function resolveDestinationTheme(destination: string): DestinationTheme {
  const { photoIds, colors } = resolveCore(destination || 'travel');
  const imageUrls = photoIds.map(toUnsplashUrl);
  return {
    ...colors,
    imageUrl: imageUrls[0],
    imageUrls,
  };
}
