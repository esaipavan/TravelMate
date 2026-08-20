// ── Public types ──────────────────────────────────────────────────────────────

export interface DestinationTheme {
  accent: string;
  accentRgb: string;
  secondary: string;
  /** Primary image URL, or null when we don't confidently recognise the
   *  place. Null means "show the honest colour/gradient treatment" rather
   *  than a guessed stock photo — never render a fabricated image. */
  imageUrl: string | null;
  /** All recognised images for carousels / galleries (first = primary).
   *  Empty when the place isn't confidently recognised. */
  imageUrls: string[];
}

// ── Internal types ────────────────────────────────────────────────────────────

interface ColorSet {
  accent: string;
  accentRgb: string;
  secondary: string;
}

/**
 * A destination entry covers one or more place names (city aliases, country,
 * region). `keys` are lowercase whole-word tokens matched against the
 * destination string (see `matchesKey` — delimited by edges/punctuation, not raw
 * substrings). More-specific entries (city names) must appear BEFORE less-
 * specific ones (country names) so "Paris, France" matches `paris` not `france`.
 *
 * `images` should contain 2–5 diverse Unsplash photo IDs for the same place.
 */
interface DestinationEntry {
  keys: string[];
  images: string[];
  colors: ColorSet;
}

// ── Destination entries ───────────────────────────────────────────────────────
// Ordered: specific (city) → general (country). First match wins.
// Each entry provides 2–5 diverse photos of the same place.

const DESTINATIONS: DestinationEntry[] = [
  // ── India — religious cities ─────────────────────────────────────────────
  {
    keys: ['varanasi', 'benares'],
    images: [
      'photo-1561361058-c24cecae35ca', // Ghats and temples at sunrise
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['rishikesh', 'haridwar'],
    images: [
      'photo-1561361058-c24cecae35ca', // Ganga riverside ghats
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['amritsar'],
    images: [
      'photo-1609947017136-9daf32a5eb16', // Golden Temple by day, causeway
      'photo-1583821017783-4333717df070', // Golden Temple illuminated at night
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['mathura', 'vrindavan', 'brindavan'],
    images: [
      'photo-1561361058-c24cecae35ca', // temple riverside
      'photo-1708346561250-ea0f8b54bc1c', // ornate Hindu temple gopuram
    ],
    colors: { accent: '#F97316', accentRgb: '249,115,22', secondary: '#F59E0B' },
  },
  {
    keys: ['tirupati', 'tirumala'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // South Indian temple gopuram
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },
  {
    keys: ['puri'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // temple town — ornate gopuram
    ],
    colors: { accent: '#0EA5E9', accentRgb: '14,165,233', secondary: '#F97316' },
  },
  {
    keys: ['shirdi'],
    images: [
      'photo-1708346561250-ea0f8b54bc1c', // pilgrimage temple town
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#D97706' },
  },

  // ── India — cities ────────────────────────────────────────────────────────
  {
    keys: ['goa'],
    images: [
      'photo-1512343879784-a960bf40e7f2', // Baga / Calangute beach sunset
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
      'photo-1599661046289-e31897846e41', // Amber Fort, Jaipur
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['udaipur'],
    images: [
      'photo-1599661046289-e31897846e41', // Rajasthan palace heritage
    ],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['jodhpur'],
    images: [
      'photo-1521182369863-7c68f43ee5cf', // Jodhpur blue city walls
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
      'photo-1616942986550-ea6469c08530', // Himalayan snow peaks & valley
      'photo-1591331554229-f614ee904bcd', // pine-forested hillside
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['shimla'],
    images: [
      'photo-1591331554229-f614ee904bcd', // Himalayan hill station
    ],
    colors: { accent: '#38BDF8', accentRgb: '56,189,248', secondary: '#0EA5E9' },
  },
  {
    keys: ['dharamshala', 'mcleod'],
    images: [
      'photo-1616942986550-ea6469c08530', // Himalayan hill town
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#6366F1' },
  },
  {
    keys: ['leh', 'ladakh'],
    images: [
      'photo-1648851460314-ba293ba2cdcf', // Pangong Lake, Ladakh
      'photo-1581285090568-378f43fc4f19', // Leh valley panorama
    ],
    colors: { accent: '#818CF8', accentRgb: '129,140,248', secondary: '#A78BFA' },
  },
  {
    keys: ['kashmir', 'srinagar'],
    images: [
      'photo-1577500588651-5603d971f338', // Dal Lake houseboats, Srinagar
      'photo-1564329494258-3f72215ba175', // shikara on Dal Lake
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
      'photo-1587474260584-136574528ed5', // India Gate, New Delhi
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
    images: ['photo-1599661046289-e31897846e41'],
    colors: { accent: '#F59E0B', accentRgb: '245,158,11', secondary: '#EA580C' },
  },
  {
    keys: ['himachal', 'uttarakhand'],
    images: ['photo-1616942986550-ea6469c08530', 'photo-1591331554229-f614ee904bcd'],
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

// Neutral colour treatment for places we don't confidently recognise. Used
// for the honest gradient fallback — never paired with a guessed photo.
const DEFAULT_COLORS: ColorSet = {
  accent: '#6366F1',
  accentRgb: '99,102,241',
  secondary: '#8B5CF6',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toUnsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?w=1600&h=900&fit=crop&crop=entropy&q=80`;
}

// ── Core resolver ─────────────────────────────────────────────────────────────

interface ResolvedImages {
  photoIds: string[];
  colors: ColorSet;
}

// Whole-word (token) key match. A key matches only when it is delimited by the
// string edges or non-alphanumeric characters — NOT as a raw substring. This
// prevents false hits that used to assign unrelated covers, e.g. `la`
// (Los Angeles) inside "Pa·la·ni" or `bali` inside "Maha·bali·puram". Unicode
// safe (checks the neighbouring chars directly rather than relying on \b).
function matchesKey(haystack: string, key: string): boolean {
  let idx = haystack.indexOf(key);
  while (idx !== -1) {
    const before = idx === 0 ? '' : haystack[idx - 1];
    const after = idx + key.length >= haystack.length ? '' : haystack[idx + key.length];
    const okBefore = before === '' || !/[a-z0-9]/i.test(before);
    const okAfter = after === '' || !/[a-z0-9]/i.test(after);
    if (okBefore && okAfter) return true;
    idx = haystack.indexOf(key, idx + 1);
  }
  return false;
}

// ── Temple-relevant fallback ──────────────────────────────────────────────────
// A South-Indian gopuram is a strong, honest "place of worship" image, used only
// when a destination is CLEARLY temple-related but isn't curated by city name.
const TEMPLE_IMAGE = 'photo-1708346561250-ea0f8b54bc1c';
const TEMPLE_COLORS: ColorSet = {
  accent: '#F59E0B',
  accentRgb: '245,158,11',
  secondary: '#F97316',
};

// Well-known temple destinations not already curated above (city-name matched).
const TEMPLE_PLACES = [
  'palani',
  'madurai',
  'meenakshi',
  'rameswaram',
  'rameshwaram',
  'mahabalipuram',
  'mamallapuram',
  'tiruvannamalai',
  'srikalahasti',
  'kanchipuram',
  'sabarimala',
  'somnath',
  'dwarka',
  'kedarnath',
  'badrinath',
  'konark',
  'khajuraho',
  'hampi',
  'srirangam',
  'chidambaram',
  'guruvayur',
  'sringeri',
  'udupi',
  'kamakhya',
  'ayodhya',
  'bodhgaya',
  'bodh gaya',
  'sarnath',
  'thanjavur',
  'tanjore',
];
// Unambiguous place-of-worship markers (whole-word matched, so "Templeton" or
// the already-curated "Mathura" are never caught).
const TEMPLE_MARKERS = [
  'temple',
  'mandir',
  'kovil',
  'koil',
  'devasthanam',
  'jyotirlinga',
  'gopuram',
  'shrine',
  'basadi',
];
// Well-known places literally named "Temple" that are NOT places of worship —
// keeps temple imagery off unrelated destinations.
const TEMPLE_DENY = ['temple bar', 'temple university', 'temple, tx', 'temple, texas'];

function isTempleDestination(lower: string): boolean {
  if (TEMPLE_DENY.some((d) => lower.includes(d))) return false;
  if (TEMPLE_PLACES.some((p) => matchesKey(lower, p))) return true;
  return TEMPLE_MARKERS.some((m) => matchesKey(lower, m));
}

// ── Duplicate-name disambiguation ─────────────────────────────────────────────
// A handful of famous cities share their name with smaller towns elsewhere
// ("Paris, Texas"). The curated entry is always the famous international city, so
// when the destination names a DIFFERENT region (a US state, Ontario, …) and the
// famous city's own home country is absent, we suppress the match and fall back
// honestly rather than show e.g. the Eiffel Tower for Paris, Texas.

// Regions that commonly host a same-named duplicate of a famous city (US states
// as full names + collision-free abbreviations, plus Ontario). Abbreviations
// that are common English words (in, or, me, ok, hi, id, wa, la) are omitted.
const DUP_REGION_TOKENS = [
  'alabama',
  'alaska',
  'arizona',
  'arkansas',
  'california',
  'colorado',
  'connecticut',
  'delaware',
  'florida',
  'georgia',
  'hawaii',
  'idaho',
  'illinois',
  'indiana',
  'iowa',
  'kansas',
  'kentucky',
  'louisiana',
  'maine',
  'maryland',
  'massachusetts',
  'michigan',
  'minnesota',
  'mississippi',
  'missouri',
  'montana',
  'nebraska',
  'nevada',
  'new hampshire',
  'new jersey',
  'new mexico',
  'north carolina',
  'north dakota',
  'ohio',
  'oklahoma',
  'oregon',
  'pennsylvania',
  'rhode island',
  'south carolina',
  'south dakota',
  'tennessee',
  'texas',
  'utah',
  'vermont',
  'virginia',
  'washington',
  'west virginia',
  'wisconsin',
  'wyoming',
  'tx',
  'fl',
  'ga',
  'ky',
  'oh',
  'ny',
  'ca',
  'il',
  'tn',
  'sc',
  'va',
  'nc',
  'pa',
  'mi',
  'mo',
  'az',
  'co',
  'wi',
  'mn',
  'md',
  'nj',
  'nm',
  'nv',
  'ct',
  'ri',
  'ks',
  'ar',
  'nd',
  'sd',
  'wv',
  'wy',
  'mt',
  'ut',
  'vt',
  'nh',
  'ontario',
];

// Curated key → its HOME context tokens. Only these keys are disambiguated; all
// other curated matches (and the unambiguous aliases like "firenze"/"napoli") are
// unaffected.
const AMBIGUOUS_HOME: Record<string, string[]> = {
  paris: ['france'],
  london: ['uk', 'england', 'britain', 'united kingdom'],
  melbourne: ['australia'],
  athens: ['greece'],
  rome: ['italy'],
  naples: ['italy'],
  venice: ['italy'],
  florence: ['italy'],
  cairo: ['egypt'],
  berlin: ['germany', 'deutschland'],
  vienna: ['austria'],
};

// True when a curated entry matched via an ambiguous key but the destination
// points at a different same-named place (home country absent, a duplicate
// region present) — so the famous-city image should NOT be used.
function isAmbiguousMismatch(lower: string, matchedKey: string): boolean {
  const home = AMBIGUOUS_HOME[matchedKey];
  if (!home) return false;
  if (home.some((h) => matchesKey(lower, h))) return false; // the famous one
  return DUP_REGION_TOKENS.some((r) => matchesKey(lower, r)); // a same-named duplicate
}

// ── India-only scope ──────────────────────────────────────────────────────────
// This is an India-only travel product, so only INDIAN curated entries may
// resolve to a photo. A curated match whose key is a foreign city (Paris, Tokyo,
// …) is ignored, so a non-India destination falls back to the honest gradient
// instead of showing a foreign landmark. Indian landmarks/temples resolve via
// these keys or the temple fallback below; foreign curated entries in the list
// are retained but unreachable (kept only to avoid a large deletion).
const INDIA_KEYS = new Set<string>([
  // religious cities / temple towns
  'varanasi',
  'benares',
  'rishikesh',
  'haridwar',
  'amritsar',
  'mathura',
  'vrindavan',
  'brindavan',
  'tirupati',
  'tirumala',
  'puri',
  'shirdi',
  // cities / regions
  'goa',
  'kerala',
  'jaipur',
  'udaipur',
  'jodhpur',
  'agra',
  'manali',
  'shimla',
  'dharamshala',
  'mcleod',
  'leh',
  'ladakh',
  'kashmir',
  'srinagar',
  'mumbai',
  'bombay',
  'delhi',
  'new delhi',
  // country / state fallbacks
  'india',
  'rajasthan',
  'himachal',
  'uttarakhand',
]);

// Explicit foreign context — a neighbouring country or any clearly foreign
// country named in the destination. Used to veto a curated Indian match that
// only collides on a shared region name (e.g. "Kashmir, Pakistan" must NOT show
// the Indian Kashmir photo) and to disqualify a legacy Wikipedia cover.
const FOREIGN_TOKENS = [
  'pakistan',
  'nepal',
  'bangladesh',
  'sri lanka',
  'srilanka',
  'bhutan',
  'myanmar',
  'burma',
  'china',
  'tibet',
  'afghanistan',
  'maldives',
  'france',
  'japan',
  'usa',
  'united states',
  'america',
  'uk',
  'united kingdom',
  'england',
  'italy',
  'spain',
  'germany',
  'thailand',
  'indonesia',
  'singapore',
  'malaysia',
  'vietnam',
  'cambodia',
  'uae',
  'emirates',
  'dubai',
  'qatar',
  'saudi',
  'egypt',
  'turkey',
  'greece',
  'australia',
  'canada',
  'brazil',
  'mexico',
  'korea',
];

function hasForeignContext(lower: string): boolean {
  return FOREIGN_TOKENS.some((f) => matchesKey(lower, f));
}

// Only returns photos for an INDIAN place we actually recognise in the curated
// list (or a clearly temple-related destination). There is deliberately NO
// keyword-guessing or hashed-stock fallback: an unrecognised place (a village, a
// small locality, anything offbeat) — or any foreign place — returns an empty
// photo list and the neutral colour set, so callers show an honest gradient
// rather than a mismatched / out-of-scope stock image.
function resolveCore(destination: string): ResolvedImages {
  const lower = destination.trim().toLowerCase();

  for (const entry of DESTINATIONS) {
    const matched = entry.keys.find((k) => matchesKey(lower, k));
    if (!matched) continue;
    // India-only: never resolve a foreign city's image (out of product scope).
    if (!INDIA_KEYS.has(matched)) continue;
    // …and veto a curated Indian match when the destination names a foreign
    // country (e.g. "Kashmir, Pakistan" / "Ladakh, China") — out of scope.
    if (hasForeignContext(lower)) continue;
    // Guard retained from same-name disambiguation (now subsumed by the India
    // gate, since no Indian key is duplicate-prone) — harmless belt-and-braces.
    if (isAmbiguousMismatch(lower, matched)) continue;
    return { photoIds: entry.images, colors: entry.colors };
  }

  // Clearly temple-related but not curated by city name → honest temple imagery.
  if (isTempleDestination(lower)) {
    return { photoIds: [TEMPLE_IMAGE], colors: TEMPLE_COLORS };
  }

  return { photoIds: [], colors: DEFAULT_COLORS };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns the recognised image URLs for a destination (empty when the place
 * isn't in the curated list — callers should fall back to a colour/gradient
 * treatment rather than show a guessed image).
 */
export function resolveDestinationImages(destination: string): string[] {
  const { photoIds } = resolveCore(destination || '');
  return photoIds.map(toUnsplashUrl);
}

/**
 * Returns the primary image URL for a destination, or `null` when the place
 * isn't confidently recognised. Callers MUST treat `null` as "no photo" and
 * render their colour/gradient fallback — never an <img> with an empty src.
 */
export function resolveDestinationImageUrl(destination: string): string | null {
  return resolveDestinationImages(destination)[0] ?? null;
}

// Auto-generated stock covers came from our own image resolver (Unsplash).
function isAutoGeneratedCover(url: string): boolean {
  return url.includes('images.unsplash.com');
}

// Auto-selected enrichment covers came from Wikipedia. Unlike a user upload,
// these were picked by the app — so under the India-only scope they must be
// re-verified as Indian before being trusted (see resolveTripCoverImage).
function isWikipediaCover(url: string): boolean {
  return url.includes('wikimedia.org') || url.includes('wikipedia.org');
}

// India context tokens ("India"/"Bharat" + every state / union-territory) used
// to confirm a legacy Wikipedia cover really belongs to an Indian destination.
const INDIA_CONTEXT = [
  'india',
  'bharat',
  'andhra pradesh',
  'arunachal pradesh',
  'assam',
  'bihar',
  'chhattisgarh',
  'goa',
  'gujarat',
  'haryana',
  'himachal pradesh',
  'jharkhand',
  'karnataka',
  'kerala',
  'madhya pradesh',
  'maharashtra',
  'manipur',
  'meghalaya',
  'mizoram',
  'nagaland',
  'odisha',
  'orissa',
  'punjab',
  'rajasthan',
  'sikkim',
  'tamil nadu',
  'telangana',
  'tripura',
  'uttar pradesh',
  'uttarakhand',
  'west bengal',
  'bengal',
  'andaman',
  'nicobar',
  'chandigarh',
  'dadra',
  'daman',
  'diu',
  'delhi',
  'jammu',
  'kashmir',
  'ladakh',
  'lakshadweep',
  'puducherry',
  'pondicherry',
];

const INDIA_KEY_LIST = [...INDIA_KEYS];

// True when a destination is confidently Indian: an explicit foreign context
// vetoes it; otherwise a curated Indian city, an (Indian) temple destination, or
// an India/state/UT token confirms it. Anything unverifiable → false (fail safe).
function isIndianDestination(destination: string): boolean {
  const lower = destination.trim().toLowerCase();
  if (hasForeignContext(lower)) return false;
  if (INDIA_KEY_LIST.some((k) => matchesKey(lower, k))) return true;
  if (isTempleDestination(lower)) return true;
  return INDIA_CONTEXT.some((t) => matchesKey(lower, t));
}

/**
 * Reconciles a persisted trip `cover_image_url` against the honest resolver —
 * the single source of truth for what a trip card / hero should actually show.
 *
 * Legacy trips may still carry a stock cover that the OLD guessing logic
 * assigned to an unrecognised place. Rather than trust the stored value, we
 * re-derive auto-generated covers from the current resolver: a recognised
 * place gets its correct curated image, and an unrecognised place gets `null`
 * so the UI shows its gradient fallback instead of a stale guessed photo.
 *
 * Cover sources are treated differently under the India-only scope:
 *   • Unsplash stock (auto)      → re-derived from the India-only resolver.
 *   • Wikipedia enrichment (auto)→ kept ONLY when the destination is verifiably
 *     Indian; a legacy foreign Wikipedia cover is dropped → gradient. If we
 *     cannot confirm India, we fail safely to the fallback.
 *   • Anything else (user upload / custom URL) → always kept.
 *
 * Non-destructive: this normalises at render time, so stale/foreign rows stop
 * rendering out-of-scope images without any database rewrite.
 */
export function resolveTripCoverImage(
  destination: string,
  storedCover: string | null | undefined,
): string | null {
  if (storedCover) {
    if (isAutoGeneratedCover(storedCover)) {
      // Unsplash stock → re-derive from the resolver below.
    } else if (isWikipediaCover(storedCover)) {
      // Auto-selected Wikipedia enrichment → India-only gate.
      if (isIndianDestination(destination)) return storedCover;
      // Not verifiably Indian → drop (fall through to the resolver → gradient).
    } else {
      // Genuinely user-provided (storage upload / custom URL) → always kept.
      return storedCover;
    }
  }
  return resolveDestinationImageUrl(destination);
}

/**
 * Returns the full theme — colours + images — for a destination.
 * `imageUrl` is the primary image or `null` when unrecognised; `imageUrls` is
 * the (possibly empty) list of recognised images.
 */
export function resolveDestinationTheme(destination: string): DestinationTheme {
  const { photoIds, colors } = resolveCore(destination || '');
  const imageUrls = photoIds.map(toUnsplashUrl);
  return {
    ...colors,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
  };
}
