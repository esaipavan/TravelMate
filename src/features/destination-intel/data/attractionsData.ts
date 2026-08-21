import type { Attraction } from '../types';

const img = (id: string, crop = 'center') =>
  `https://images.unsplash.com/${id}?w=800&h=500&fit=crop&crop=${crop}&q=80`;

const GENERIC = [
  'photo-1469854523086-cc02fe5d8800',
  'photo-1476514525535-07fb3b4ae5f1',
  'photo-1503220317375-aaad61436b1b',
  'photo-1527631746610-bca00a040d60',
];

export const ATTRACTIONS_DB: Record<string, Attraction[]> = {
  goa: [
    {
      id: 'goa-1',
      name: 'Dudhsagar Falls',
      description:
        "One of India's tallest waterfalls roars at full power during monsoon — a 310-metre curtain of white rushing into a jade pool. Best reached by 4x4 jeep through the Bhagwan Mahavir Wildlife Sanctuary.",
      imageUrl: img('photo-1512343879784-a960bf40e7f2', 'top'),
      category: 'nature',
      durationHours: 4,
      bestTime: '7 AM – noon',
      popularityScore: 88,
      isFree: false,
      entryFeeUSD: 4,
      tips: [
        'Book the jeep tour the night before — spots fill fast in peak monsoon',
        'Wear water-resistant footwear; the trail near the falls is soaked',
        'Bring a dry bag for your phone — mist reaches 50+ metres out',
      ],
    },
    {
      id: 'goa-2',
      name: 'Basilica of Bom Jesus',
      description:
        'A UNESCO World Heritage site housing the relics of St Francis Xavier. This 400-year-old baroque church is among the finest examples of Goan Portuguese architecture, and its gilded altars are breathtaking.',
      imageUrl: img(GENERIC[0], 'center'),
      category: 'religious',
      durationHours: 1.5,
      bestTime: 'Weekday mornings',
      popularityScore: 92,
      isFree: true,
      entryFeeUSD: null,
      tips: [
        'Visit before 9 AM to see the church nearly empty',
        'The relics are exposed publicly only once every 10 years — next in 2034',
        'Combine with the nearby Se Cathedral — both are walkable',
      ],
    },
    {
      id: 'goa-3',
      name: 'Fort Aguada',
      description:
        'A remarkably intact 17th-century Portuguese fort perched on a headland where the Mandovi meets the sea. The views stretch from Sinquerim Beach all the way to the Western Ghats on a clear day.',
      imageUrl: img(GENERIC[1], 'top'),
      category: 'landmark',
      durationHours: 2,
      bestTime: 'Late afternoon',
      popularityScore: 85,
      isFree: true,
      entryFeeUSD: null,
      tips: [
        'Arrive 45 minutes before sunset for golden-hour photography',
        'The lighthouse inside has a small entry fee (INR 5)',
        'Walk down to Sinquerim Beach afterwards for a drink',
      ],
    },
    {
      id: 'goa-4',
      name: 'Fontainhas Latin Quarter',
      description:
        "Goa's oldest neighbourhood preserves its colonial Portuguese soul: narrow lanes, tiled facades in ochre, indigo and terracotta, azulejos murals, and old-world bakeries. Like stepping into 19th-century Lisbon.",
      imageUrl: img(GENERIC[2], 'center'),
      category: 'landmark',
      durationHours: 2.5,
      bestTime: 'Morning',
      popularityScore: 80,
      isFree: true,
      entryFeeUSD: null,
      tips: [
        'Walk slowly and look up — the architecture is in the details',
        'Stop at Confeitaria 31 de Janeiro for authentic Goan bebinca cake',
        'The Chapel of St Sebastian is a must-see hidden gem in the quarter',
      ],
    },
    {
      id: 'goa-5',
      name: 'Anjuna Flea Market',
      description:
        "Running every Wednesday since the 1960s hippie era, this market is a riot of colour: Kashmiri rugs, silver jewellery, Rajasthani textiles, local spices, and the best collection of bric-a-brac on India's coast.",
      imageUrl: img(GENERIC[3], 'center'),
      category: 'shopping',
      durationHours: 2,
      bestTime: 'Noon (Wednesdays only)',
      popularityScore: 78,
      isFree: true,
      entryFeeUSD: null,
      tips: [
        'Wednesday only — confirm before making the trip',
        'Bargain confidently; starting prices are typically 3x the fair value',
        'The best local food stalls are tucked in the back rows of the market',
      ],
    },
    {
      id: 'goa-6',
      name: 'Spice Plantation Tour',
      description:
        'Walk through a working spice and tropical fruit plantation in the Ponda foothills. Guides explain the cultivation of cardamom, turmeric, vanilla, cinnamon and cashew — the flavours that made Goa famous.',
      imageUrl: img('photo-1503220317375-aaad61436b1b', 'bottom'),
      category: 'nature',
      durationHours: 3,
      bestTime: 'Morning',
      popularityScore: 75,
      isFree: false,
      entryFeeUSD: 12,
      tips: [
        'Most tours include a traditional Goan lunch cooked on-site — worth it',
        'Sahakari Spice Farm and Tropical Spice Plantation are the most reputable operators',
        'Buy spices directly at the farm for guaranteed quality and better prices',
      ],
    },
  ],
};
