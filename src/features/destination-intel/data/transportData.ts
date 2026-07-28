import type { TransportGuide } from '../types';

export const TRANSPORT_DB: Record<string, TransportGuide> = {
  goa: {
    fromAirport:
      'Dabolim Airport (GOI) is 29 km from Panaji and 40 km from North Goa beaches. Pre-paid taxis ₹600–900; Ola/Uber ₹400–600. No city bus connects to the airport — taxis and app rides are the only practical options.',
    options: [
      {
        mode: 'taxi',
        label: 'Local Taxi',
        emoji: '🚕',
        description:
          "Goa's iconic white-and-yellow Ambassador taxis are the traditional way to get around. Negotiate the fare upfront — there are no meters. Most drivers are experienced and reliable.",
        avgCostStr: '₹100–400 per trip',
        tips: [
          'Always agree on the price before getting in — never accept a "meter" offer as meters are rarely used',
          'Taxi stands at all major beaches, towns, and the airport',
          'Hire by the day (₹2,500–3,500) if you plan to cover multiple spots',
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Ola / GoaMiles',
        emoji: '📱',
        description:
          'Ola operates in Goa with mostly AC hatchbacks. GoaMiles is the official Goa government app with fixed rates. Both avoid the fare negotiation of traditional taxis.',
        avgCostStr: '₹150–500 per trip',
        tips: [
          'GoaMiles (Goa government app) has the most transparent pricing',
          'Ola surge pricing applies during peak hours and weekends',
          'App-based rides are significantly cheaper than tourist-facing taxis',
        ],
        available: true,
      },
      {
        mode: 'car-rental',
        label: 'Scooter Rental',
        emoji: '🛵',
        description:
          'Renting a scooter (Activa 125 or Royal Enfield) gives you the freedom to explore Goa as the locals do. Essential for reaching spice plantations, hidden beaches, and interior villages.',
        avgCostStr: '₹300–600 per day',
        tips: [
          'International Driving Permit required — your home country licence alone is insufficient',
          'Avoid riding without a helmet; police checkpoints are common on main roads',
          'Refill from any petrol station — petrol is ₹95–105 per litre in 2025',
        ],
        available: true,
      },
      {
        mode: 'bus',
        label: 'KTC Bus',
        emoji: '🚌',
        description:
          "Goa's Kadamba Transport Corporation runs frequent services between major towns (Panaji → Mapusa → Calangute → Anjuna) at very low cost. Not practical for beaches, but excellent for town-to-town travel.",
        avgCostStr: '₹10–40 per ride',
        tips: [
          'Buses run roughly every 20–30 minutes on main routes; less frequent in the evenings',
          'Panaji Kadamba Bus Stand is the central hub for all KTC routes',
          'Private minivans (tios) do the same routes faster for ₹25–50',
        ],
        available: true,
      },
      {
        mode: 'ferry',
        label: 'River Ferry',
        emoji: '⛴️',
        description:
          'Goa has a network of government ferry crossings across its rivers — a genuinely pleasant way to cross the Mandovi or Zuari. The Panaji–Betim crossing is a local institution.',
        avgCostStr: '₹3–10 per crossing',
        tips: [
          'Ferries run until around 10 PM — check times if returning late',
          'You can take a scooter or bicycle on board for a small additional fee',
          'The Panaji–Betim crossing (5 minutes) is the most scenic',
        ],
        available: true,
      },
    ],
    apps: [
      { name: 'GoaMiles', emoji: '🚖', note: 'Government-operated, fixed fares, most reliable' },
      { name: 'Ola', emoji: '📱', note: 'Wide coverage, consistent availability' },
      {
        name: 'Google Maps',
        emoji: '🗺️',
        note: 'Offline maps essential; data can be spotty in interior Goa',
      },
    ],
    tips: [
      "Rent a scooter for maximum flexibility — Goa's best spots are between the main roads",
      'Negotiate taxi fares firmly upfront; tourist-facing prices start at 2–3× the local rate',
      'The monsoon floods some interior roads — check conditions before driving to Dudhsagar',
    ],
  },

  bali: {
    fromAirport:
      'Ngurah Rai International Airport (DPS) is 13 km from Kuta and 40 km from Ubud. Blue Bird metered taxis are the only honest taxis from outside Arrivals. Grab works from the Departures level. Fixed shuttle buses to Ubud, Seminyak, and Canggu run every 30 minutes from the airport taxi counter.',
    options: [
      {
        mode: 'taxi',
        label: 'Blue Bird Taxi',
        emoji: '🚕',
        description:
          "Blue Bird is Bali's only honest metered taxi company. Their bright blue cars use the meter reliably — avoid all other taxis which will overcharge significantly. Call or use their app to pre-book.",
        avgCostStr: 'Rp 40,000–150,000 per trip',
        tips: [
          'Blue Bird only — other taxi companies are rarely metered and vastly overcharge',
          'Use the Blue Bird app to pre-book; drivers arrive with the meter already running',
          'From airport to Kuta: ~Rp 60,000; to Seminyak: ~Rp 80,000; to Ubud: ~Rp 250,000',
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Grab',
        emoji: '📱',
        description:
          "Grab dominates Bali's ride-share market with transparent pricing and no negotiation. It operates from the Departures level at the airport (not Arrivals — walk up) and in all major tourist areas.",
        avgCostStr: 'Rp 35,000–200,000 per trip',
        tips: [
          'Download and set up Grab before you land — it requires an Indonesian phone number or foreign card registration',
          'Grab is cheaper than Blue Bird for short trips; Blue Bird is faster for airport runs',
          'Some drivers cancel when they see a far pickup — order a GrabCar Premium for reliability',
        ],
        available: true,
      },
      {
        mode: 'car-rental',
        label: 'Private Driver',
        emoji: '🚗',
        description:
          'Hiring a private driver with an English-speaking Balinese guide for a full day is the best value in Bali. A driver can take you to 4–5 sights across the island in one day for a flat negotiated rate.',
        avgCostStr: 'Rp 500,000–700,000 per day (driver + car)',
        tips: [
          'Ask your hotel to recommend a trusted driver — they often have established relationships',
          'Agree the full itinerary and final price before departure; include petrol in the quote',
          'Many drivers double as knowledgeable guides — ask if they know the historical context of temples',
        ],
        available: true,
      },
      {
        mode: 'car-rental',
        label: 'Scooter Rental',
        emoji: '🛵',
        description:
          'The ultimate way to explore Bali — weave between rice paddies, reach secret temples, and park anywhere. Most popular in Seminyak, Canggu, and Ubud. Rental shops are on every corner.',
        avgCostStr: 'Rp 70,000–120,000 per day',
        tips: [
          'An International Driving Permit (motorcycle endorsed) is technically required and police do check',
          'Traffic in Kuta and Seminyak is genuinely dangerous — first-time riders should stick to quiet roads',
          'Check brakes and lights before renting; take photos of any existing damage',
        ],
        available: true,
      },
    ],
    apps: [
      { name: 'Grab', emoji: '🚗', note: 'Primary ride-share — mandatory app for Bali travel' },
      {
        name: 'Blue Bird',
        emoji: '💙',
        note: 'Book metered taxis; skip the app if Grab is installed',
      },
      {
        name: 'Gojek',
        emoji: '🛵',
        note: 'Indonesian super-app — useful for food delivery and GoRide (motorbike taxi)',
      },
    ],
    tips: [
      "Avoid taxis approaching you in the street or at tourist sites — they're always overpriced",
      'For Ubud, hire a private driver for the day rather than taking multiple taxis',
      'Petrol (Pertamax 92) is sold in 600ml plastic bottles from roadside kiosks if you run low',
    ],
  },

  bangkok: {
    fromAirport:
      'Suvarnabhumi Airport (BKK) is 25 km east of the city. The Airport Rail Link (ARL, 45 min, ฿45) connects to Phaya Thai station (BTS interchange). Metered taxis take 40–90 minutes depending on traffic and cost ฿250–400 plus ฿50 expressway toll — agree before boarding. Grab is reliable from outside Arrivals (follow signs to rideshare pickup).',
    options: [
      {
        mode: 'metro',
        label: 'BTS Skytrain',
        emoji: '🚇',
        description:
          "Bangkok's elevated metro system covers the main tourist and business districts with two lines (Sukhumvit and Silom). Fast, air-conditioned, and absolutely immune to Bangkok's infamous traffic jams.",
        avgCostStr: '฿16–59 per trip',
        tips: [
          'Buy a Rabbit Card (฿200 deposit + credit) to avoid queuing for tickets at every station',
          'Silom Line reaches Saphan Taksin (Chao Phraya boat pier) and Asiatique Night Market',
          'BTS and MRT lines intersect at Asok/Sukhumvit — a free transfer between the two systems',
        ],
        available: true,
      },
      {
        mode: 'metro',
        label: 'MRT Subway',
        emoji: '🚇',
        description:
          "Bangkok's underground metro connects Huai Khwang in the east to Lak Song in the west, passing through Chatuchak, Silom, and the riverside. Newer and less crowded than the BTS.",
        avgCostStr: '฿16–42 per trip',
        tips: [
          'Chatuchak Park station (MRT) is the gateway to the weekend market',
          'MRT connects to the airport at Phaya Thai via the Airport Rail Link',
          'Stored-value MRT cards (฿180 deposit) save time on longer stays',
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Grab',
        emoji: '📱',
        description:
          "Grab is the dominant ride-share in Bangkok and the single most useful app for getting around. Fixed prices, no negotiation, and covers areas the BTS and MRT don't reach.",
        avgCostStr: '฿60–300 per trip',
        tips: [
          'Grab is consistently cheaper and more transparent than metered taxis during non-peak hours',
          'GrabBike (motorcycle taxi) is fastest through traffic — thrilling but not for the faint-hearted',
          'GrabTuk-Tuk exists and is a legitimate way to experience a tuk-tuk without negotiation',
        ],
        available: true,
      },
      {
        mode: 'boat',
        label: 'Chao Phraya Boat',
        emoji: '⛴️',
        description:
          "Travelling the Chao Phraya River by orange-flag or blue-flag express boat is Bangkok's most atmospheric commute — and the fastest way to reach Grand Palace, Wat Arun, and the old city.",
        avgCostStr: '฿15–40 per journey',
        tips: [
          'Orange-flag boats (฿15 flat fare) stop at all piers and are the most useful tourist route',
          'Buy an all-day tourist pass (฿150) for unlimited hops between the major riverside sights',
          'Long-tail boat taxis on the khlongs (canals) are ฿20 per leg and a unique experience',
        ],
        available: true,
      },
      {
        mode: 'tuk-tuk',
        label: 'Tuk-Tuk',
        emoji: '🛺',
        description:
          "Bangkok's iconic three-wheeled open-air taxis are a tourist experience rather than a practical mode of transport — they're slower than BTS, open to traffic fumes, and almost always overpriced unless you negotiate hard.",
        avgCostStr: '฿100–300 per trip (negotiate firmly)',
        tips: [
          'Never accept a tuk-tuk driver who offers to take you somewhere "very cheap" — it ends at a commission shop',
          'For legitimate short hops, offer 50% of the first quoted price and be prepared to walk away',
          'At night in entertainment districts (Patpong, Khao San), tuk-tuk drivers routinely lead tourists to unfavourable venues',
        ],
        available: true,
      },
    ],
    apps: [
      {
        name: 'Grab',
        emoji: '🚗',
        note: 'Essential — covers cars, bikes, food delivery, and tuk-tuks',
      },
      { name: 'BTS Skytrain App', emoji: '🚇', note: 'Real-time arrivals and Rabbit Card top-up' },
      {
        name: 'Google Maps',
        emoji: '🗺️',
        note: 'Transit directions for BTS + MRT + boats + buses in one route',
      },
      {
        name: 'Gojek',
        emoji: '🛵',
        note: 'Alternative to Grab; sometimes cheaper for motorcycle taxis',
      },
    ],
    tips: [
      'The BTS + Chao Phraya boat combination covers 90% of tourist Bangkok without any traffic',
      'Avoid metered taxis during peak hours (8–9:30 AM and 5–7 PM) — Bangkok traffic is genuinely catastrophic',
      'Keep ฿20 notes handy for boat piers and small taxis; card payment is rarely available for public transport',
    ],
  },

  tokyo: {
    fromAirport:
      "Narita Airport (NRT) is 60 km from central Tokyo. Take the Narita Express (N'EX) for ¥3,070 to Shinjuku (90 min) or Keisei Skyliner to Ueno for ¥2,520 (41 min). Haneda Airport (HND) is 20 km from central Tokyo — Keikyu Line to Shinagawa ¥630 (37 min). Both airports have IC card vending machines — buy a Suica or Pasmo card on arrival.",
    options: [
      {
        mode: 'train',
        label: 'JR Lines',
        emoji: '🚆',
        description:
          'JR East operates the Yamanote Line (the circular loop connecting all major hubs — Shinjuku, Shibuya, Harajuku, Tokyo, Ueno, Ikebukuro in 60 minutes) plus the Chuo and Sobu lines. The backbone of Tokyo transit.',
        avgCostStr: '¥150–300 per trip (IC card)',
        tips: [
          'Buy a Suica IC card at any JR machine — it works on every train, bus, and even convenience stores',
          'The Yamanote Line (green) runs every 2–4 minutes — you will never wait long',
          'A 7-day JR Pass (¥50,000) is only cost-effective if you plan Shinkansen trips outside Tokyo',
        ],
        available: true,
      },
      {
        mode: 'metro',
        label: 'Tokyo Metro',
        emoji: '🚇',
        description:
          'Tokyo Metro and Toei Subway operate 13 lines reaching every corner of the city. Works seamlessly with the Suica IC card. Trains arrive every 2 minutes at peak and are almost always exactly on time.',
        avgCostStr: '¥170–320 per trip (IC card)',
        tips: [
          'The Tokyo Metro 24/48/72-hour unlimited pass (¥600/¥1,200/¥1,500) pays off with 4+ trips per day',
          'Last trains on most lines run at midnight — plan late nights in advance or budget for a taxi home',
          'Station exits are numbered — always note the exit number for landmarks to avoid surface confusion',
        ],
        available: true,
      },
      {
        mode: 'taxi',
        label: 'Taxi',
        emoji: '🚕',
        description:
          'Tokyo taxis are meticulous, all-metered, and staffed by drivers who genuinely know the city. An excellent option for late nights (after the last train) or carrying luggage — but expensive for daytime sightseeing.',
        avgCostStr: '¥730 flag fall + ¥90/km',
        tips: [
          'All taxis in Tokyo are metered and trustworthy — no negotiation necessary',
          'Taxis are plentiful at major hotels and station taxi ranks; street hailing is normal',
          'Uber (registered with Japanese taxi companies) and GO app offer app-based booking with the same metered rates',
        ],
        available: true,
      },
      {
        mode: 'bus',
        label: 'Highway Bus',
        emoji: '🚌',
        description:
          'Overnight highway buses from Shinjuku Bus Terminal connect Tokyo to Kyoto, Osaka, Hiroshima, and other cities at a fraction of the Shinkansen price — the budget long-haul option.',
        avgCostStr: '¥3,500–8,000 overnight',
        tips: [
          'Book via the Willer Express website or JapanBusOnline — popular routes sell out weeks ahead',
          'Night buses arrive at dawn — plan your first day accordingly (check luggage at a coin locker)',
          'In-city local buses are useful for few tourist routes — the metro is almost always faster',
        ],
        available: true,
      },
    ],
    apps: [
      {
        name: 'Suica / Pasmo',
        emoji: '💳',
        note: 'Load onto iPhone or Android Wallet — works everywhere',
      },
      {
        name: 'Google Maps',
        emoji: '🗺️',
        note: 'Best transit routing in Tokyo; shows exact platform and door numbers',
      },
      { name: 'GO App', emoji: '🚕', note: 'Hail metered Japanese taxis with English interface' },
      {
        name: 'HyperDia',
        emoji: '🚆',
        note: 'Precise train schedules with fare calculation for complex multi-line trips',
      },
    ],
    tips: [
      'A Suica IC card loaded to your iPhone/Android wallet is the only transit tool you need in Tokyo',
      'Avoid taxis during rush hour (7:30–9:30 AM, 6–8 PM) — trains are faster even when packed',
      'IC cards can be used to pay at virtually every convenience store, vending machine, and station kiosk',
    ],
  },

  paris: {
    fromAirport:
      'Charles de Gaulle (CDG) is 25 km north. Take the RER B to central Paris (€12.10, 45–55 min to Châtelet or St-Michel). Orly (ORY) requires Orlyval shuttle to RER B (€13.40 combined) or Orlybus to Denfert-Rochereau (€11). Taxis from CDG are flat-rate: €55 to Left Bank, €50 to Right Bank (legitimate law since 2015 — refuse higher offers).',
    options: [
      {
        mode: 'metro',
        label: 'Paris Métro',
        emoji: '🚇',
        description:
          '16 lines with 302 stations — there is no neighbourhood in Paris more than 500 metres from a metro entrance. The Métro runs 5:30 AM–12:30 AM (until 2:15 AM on Fri–Sat nights). Trains come every 2–5 minutes.',
        avgCostStr: '€2.15 per journey (t+ ticket)',
        tips: [
          'Buy a carnet of 10 t+ tickets (€20.50) rather than individual tickets at ticket machines',
          'The Navigo Easy card (€2 for the card + loaded credit) makes tap-in/tap-out seamless',
          'Line 1 and 14 are the most useful for tourists covering Louvre, Champs-Élysées, and Vincennes',
        ],
        available: true,
      },
      {
        mode: 'bus',
        label: 'RER / Tram',
        emoji: '🚌',
        description:
          'The RER regional express trains cross Paris at speed (RER A: Versailles ↔ Marne-la-Vallée, RER B: airport ↔ St-Michel). The tram network (T3) circles the Boulevard des Maréchaux — useful for south and east Paris.',
        avgCostStr: '€2.15 (inner Paris) – €12+ (airport)',
        tips: [
          'RER tickets work on the Métro for the inner Paris zone — do not exit the station between RER and Métro',
          'Validate your ticket EVERY time you board an RER — inspectors fine without mercy',
          'Tram T3 runs until midnight and is rarely checked for tickets — but do validate',
        ],
        available: true,
      },
      {
        mode: 'car-rental',
        label: "Vélib' Bicycle",
        emoji: '🚲',
        description:
          "Paris's excellent city bike scheme with 20,000 bikes at 1,400 stations. Electric bikes (blueish frame) are a revelation on Haussmann's wide boulevards. A 3-day pass with unlimited 45-minute trips costs €5.",
        avgCostStr: '€1.70 per 30 min electric, free first 30 min mechanical',
        tips: [
          "Download the Vélib' app and add a card before you arrive — the docking kiosk process is confusing",
          'Return the bike with at least 5 minutes to spare — you pay for the next period if you run over',
          "Cycling along the Seine and through the Marais is one of Paris's great free pleasures",
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Uber / Bolt',
        emoji: '📱',
        description:
          'Both operate widely in Paris and are cheaper than French radio taxis. Surge pricing applies during peak times and after concerts/events. Bolt tends to run 10–20% cheaper than Uber in Paris.',
        avgCostStr: '€8–25 per trip depending on distance',
        tips: [
          'French law requires ride-share cars to drive to a designated pickup point (Uber will ask you to walk slightly)',
          'At Charles de Gaulle, Uber pickup is from the dedicated car park — allow extra time',
          'Late-night surge on Friday and Saturday can push fares 2–3× normal rates',
        ],
        available: true,
      },
    ],
    apps: [
      {
        name: 'Navigo Easy',
        emoji: '💳',
        note: 'Top up t+ tickets on your phone; the only transit card you need',
      },
      {
        name: 'Citymapper',
        emoji: '🗺️',
        note: 'Best transit routing in Paris — accounts for real-time delays and strikes',
      },
      {
        name: "Vélib'",
        emoji: '🚲',
        note: 'Essential for bike hire; set up before landing to avoid kiosk frustration',
      },
      { name: 'Bolt', emoji: '🚗', note: 'Consistently cheaper than Uber for Paris ride-shares' },
    ],
    tips: [
      "The Métro is so comprehensive that you'll rarely need anything else within Paris — learn lines 1, 4, 6, and 14",
      'Avoid driving in Paris entirely — parking is scarce, fines are steep, and taxis can see your whole itinerary',
      'French rail strikes (grèves) can disrupt transport with little notice — check Twitter/X for #SNCF or #RATP on travel day',
    ],
  },

  dubai: {
    fromAirport:
      'Dubai International Airport (DXB) has its own Metro station (Red Line, Terminals 1 & 3). Trains reach central Dubai in 30–50 minutes for AED 12–19 — the easiest option if your hotel is near a Metro station. Metered taxis are clean, air-conditioned, and affordable: AED 50–80 to central hotels with an AED 5 airport surcharge. Careem and Uber both operate from the taxi rank area.',
    options: [
      {
        mode: 'metro',
        label: 'Dubai Metro',
        emoji: '🚇',
        description:
          'Fully automated (driverless), air-conditioned, and spotlessly clean — the Dubai Metro Red and Green Lines connect the airport, Mall of the Emirates, Burj Khalifa/Dubai Mall, and Dubai Creek efficiently.',
        avgCostStr: 'AED 3–9.50 per trip (NOL card)',
        tips: [
          'Buy a NOL Silver Card (AED 25 for card + credit) at any station — essential for any stay over 2 days',
          'The Red Line is the tourist workhorse: airport → DIFC → World Trade Centre → Burj Khalifa → Jumeirah',
          'Women + Children / Gold Class carriages are at the front of every train — check signage before boarding',
        ],
        available: true,
      },
      {
        mode: 'taxi',
        label: 'RTA Taxi',
        emoji: '🚕',
        description:
          "Dubai's official government taxis (white cars with a coloured roof lamp) are metered, air-conditioned, trustworthy, and available everywhere. Female passengers can request a female driver (pink/purple roof cap) via the Dubai Taxi app.",
        avgCostStr: 'AED 12 flag fall + AED 1.96/km',
        tips: [
          'All RTA taxis are metered — no negotiation required or appropriate',
          'Careem and Uber are integrated with the same RTA driver fleet and offer app booking convenience',
          'Book via Dubai Taxi app for a female driver or for guaranteed airport pickups',
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Careem / Uber',
        emoji: '📱',
        description:
          'Careem (now Uber-owned) is the dominant ride-share app in Dubai and the Middle East. Both apps offer transparent pricing, AC cars, and English-speaking drivers. Good for areas not served by Metro.',
        avgCostStr: 'AED 15–80 per trip',
        tips: [
          'Careem Go is their budget tier — equivalent to UberX and cheapest for short trips',
          'Surge pricing is common after major mall and event closings (9–11 PM weekends)',
          'Uber and Careem cars cannot be hailed — you must book through the app',
        ],
        available: true,
      },
      {
        mode: 'bus',
        label: 'RTA Bus',
        emoji: '🚌',
        description:
          "Dubai's bus network covers extensive ground, is air-conditioned, and accepts the NOL card — but routes and schedules are complex for newcomers. Most useful for reaching areas not on the Metro.",
        avgCostStr: 'AED 3 per trip (NOL card)',
        tips: [
          'The Dubai Frame (Bus F09), Gold Souk area (multiple routes from Union station), and Palm Jumeirah (F55) are accessible by bus',
          'Buses run until midnight on most routes; some routes are 24 hours',
          'NOL card works on both Metro and bus — load credit once and use both',
        ],
        available: true,
      },
      {
        mode: 'boat',
        label: 'Dubai Water Bus / Abra',
        emoji: '⛴️',
        description:
          "The traditional wooden abra (AED 1) crosses Dubai Creek between Bur Dubai and Deira in 5 minutes — one of the world's great cheap experiences. The modern RTA Water Bus is air-conditioned and serves JBR, Marina, and the Creek.",
        avgCostStr: 'AED 1–8 per crossing',
        tips: [
          'The AED 1 creek abra is authentic and requires exact change in coins',
          'RTA Water Bus (AED 8) runs along the Dubai Marina waterfront and accepts NOL card',
          'Sunset abra crossing from Bur Dubai to Deira is beautiful — allow 30 minutes for the full experience',
        ],
        available: true,
      },
    ],
    apps: [
      {
        name: 'Careem',
        emoji: '🚗',
        note: 'Primary ride-share in UAE; more drivers than Uber in outer areas',
      },
      {
        name: 'Dubai Metro / RTA',
        emoji: '🚇',
        note: 'Official app for real-time arrivals and NOL card top-up',
      },
      {
        name: "S'hail",
        emoji: '🗺️',
        note: "RTA's official trip planner combining Metro, bus, water bus, and taxi in one route",
      },
      {
        name: 'Uber',
        emoji: '📱',
        note: 'Fallback when Careem has surge pricing; same fleet, different algorithm',
      },
    ],
    tips: [
      'The Metro + taxi combination covers everything in Dubai; avoid driving yourself — parking at malls is free but the traffic is brutal',
      'Dubai is a 24-hour city but outdoor walking is impractical July–September (heat index 45°C+) — stay in transit between AC spaces',
      'The NOL card is the single most useful item you can own in Dubai — buy it at the airport on arrival',
    ],
  },

  london: {
    fromAirport:
      'Heathrow (LHR) is 24 km west. Elizabeth Line to Paddington in 35 min (£13.50 Oyster/contactless) or Heathrow Express in 15 min (£37 direct, book online). Gatwick (LGW): Gatwick Express to Victoria in 30 min (£21.90). Stansted (STN): Stansted Express to Liverpool Street in 50 min (£19.90). All airports: Uber and black cabs available; expect £50–85 to central London from Heathrow.',
    options: [
      {
        mode: 'metro',
        label: 'London Underground (Tube)',
        emoji: '🚇',
        description:
          "The world's oldest metro network (1863) — 272 stations across 11 lines. Central Zone 1 stations are 5–10 minutes apart. Pay with any contactless bank card or Apple/Google Pay — no Oyster needed if your card works abroad.",
        avgCostStr: '£2.80 (Zone 1, off-peak) with contactless',
        tips: [
          'Tap in and out with your contactless card or phone — your bank applies the same daily cap as Oyster (£8.10 for Zone 1)',
          'The Elizabeth Line (opened 2022) connects Heathrow and Reading through central London with modern rolling stock',
          'Last Tube trains run ~midnight; Night Tube runs Fri–Sat nights on Victoria, Central, Jubilee, Northern, and Piccadilly lines',
        ],
        available: true,
      },
      {
        mode: 'bus',
        label: 'London Bus',
        emoji: '🚌',
        description:
          'The red double-decker bus is as much a London experience as a transport mode. Buses serve every corner of the city, run 24 hours on many routes, and are significantly cheaper than the Tube for short hops.',
        avgCostStr: '£1.75 flat fare per trip, £4.65 all-day cap',
        tips: [
          'Cash is not accepted — tap with contactless card or Oyster card only',
          'Bus 15 (Heritage Route) uses vintage Routemaster buses on weekends — a free Tube alternative through the City',
          'The 24-hour bus routes are the only way to cross the city after 1 AM (Night Tube covers fewer areas)',
        ],
        available: true,
      },
      {
        mode: 'train',
        label: 'Overground / Elizabeth Line',
        emoji: '🚆',
        description:
          'The London Overground (orange) serves south, east, and north London beyond the Tube network. The Elizabeth Line (purple) crosses the entire city east-to-west at speed, from Reading and Heathrow to Shenfield and Abbey Wood.',
        avgCostStr: '£2.80–6.00 depending on zones (contactless)',
        tips: [
          'Elizabeth Line trains are the most spacious and modern in London — use them where possible',
          'Oyster/contactless caps apply across Tube + Overground + Elizabeth Line combined per day',
          "The Overground to Peckham or Dalston is the cheapest way to reach London's best restaurant neighbourhoods",
        ],
        available: true,
      },
      {
        mode: 'taxi',
        label: 'Black Cab (Hackney Carriage)',
        emoji: '🚕',
        description:
          "London's iconic black cabs are all metered, licensed, and driven by drivers who passed The Knowledge — a memorisation test of 25,000 streets. Can be hailed on the street. Expensive but reliably trustworthy.",
        avgCostStr: '£3.80 flag fall + £1.80/km (daytime)',
        tips: [
          'The orange "for hire" light on the roof means it\'s available — raise your hand to hail',
          'Black cabs accept contactless card payment; agree before setting off for cash',
          'Uber Black is comparable pricing and the same experience but app-based',
        ],
        available: true,
      },
      {
        mode: 'ride-share',
        label: 'Uber / Bolt',
        emoji: '📱',
        description:
          'Both operate extensively in London. UberX is the cheapest standard option; Bolt tends to be 10–20% cheaper. Surge pricing peaks around theater closing times (10–11 PM) and weekend nights.',
        avgCostStr: '£7–30 per trip',
        tips: [
          "Uber's Comfort and Premier tiers provide more legroom — worth it for longer trips across London",
          'Bolt routinely undercuts Uber by 15–20% for the same journey — install both',
          'Designated ride-share pickup areas exist at major stations, stadiums, and Heathrow — follow in-app instructions',
        ],
        available: true,
      },
    ],
    apps: [
      {
        name: 'Citymapper',
        emoji: '🗺️',
        note: 'The definitive London transit app — real-time, multimodal, knows the city cold',
      },
      {
        name: 'TfL Oyster',
        emoji: '💳',
        note: 'Check balance, top up, and see journey history for your Oyster card',
      },
      {
        name: 'Uber',
        emoji: '🚗',
        note: 'Primary ride-share; set up before landing to avoid airport surge scrambles',
      },
      {
        name: 'Bolt',
        emoji: '💰',
        note: 'Cheaper than Uber for most London journeys — install as backup',
      },
    ],
    tips: [
      'Tap your contactless bank card — you will pay the same Oyster daily cap rate (£8.10 Zone 1) without needing a separate card',
      'Walking between stations in central London is often faster than the Tube — Citymapper will tell you when it is',
      'Avoid the Tube during rush hour (7:30–9:30 AM, 5–7 PM) between major Zone 1 stations — it is genuinely unpleasant',
    ],
  },
};
