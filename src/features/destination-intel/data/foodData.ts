import type { FoodGuide } from '../types';

export const FOOD_DB: Record<string, FoodGuide> = {
  goa: {
    dishes: [
      {
        name: 'Fish Curry Rice',
        description:
          "The everyday soul of Goan cooking: a coconut-milk curry tangy with kokum and green chilli, ladled over short-grain Goan rice. Every family has their own recipe; the best version you'll eat will be in someone's home.",
        emoji: '🍛',
        priceRange: '₹80–150',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'medium',
        mustTry: true,
      },
      {
        name: 'Prawn Balchão',
        description:
          'A fiery, tangy prawn pickle made with vinegar, dried red chillies, and spices. A Portuguese-influenced preserve that doubles as a side dish — pungent, deeply savoury, and impossible to forget.',
        emoji: '🦐',
        priceRange: '₹180–280',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'hot',
        mustTry: true,
      },
      {
        name: 'Bebinca',
        description:
          "Goa's queen of desserts: a rich, layered coconut pudding made with coconut milk, egg yolks, sugar, and ghee — built up one thin layer at a time over a slow fire. Dense, aromatic, and unlike anything else on a dessert menu.",
        emoji: '🍮',
        priceRange: '₹60–100',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Chouriço Pão',
        description:
          'Spicy Goan sausage — made with pork, toddy vinegar, and fiery red chillies — stuffed into a local bread roll (poie) and eaten as a handheld breakfast. The definitive Goan street food experience.',
        emoji: '🌭',
        priceRange: '₹40–80',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'hot',
        mustTry: true,
      },
      {
        name: 'Sol Kadi',
        description:
          'A rose-coloured digestif drink made from kokum fruit and coconut milk, spiked with garlic and green chilli. Cooling, slightly tart, and the perfect antidote to a hot Goan afternoon — or a heavy seafood meal.',
        emoji: '🌸',
        priceRange: '₹30–60',
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'mild',
        mustTry: false,
      },
    ],
    restaurants: [
      {
        name: "Martin's Corner",
        cuisine: 'Goan Seafood',
        priceRange: '€€',
        description:
          "A Goan institution since 1989, Martin's has fed politicians, Bollywood stars, and backpackers with equal warmth. Order the crab xacuti, prawn rechado, and whatever the daily catch is — then finish with bebinca.",
        hours: '12 PM – 3:30 PM, 7 PM – 11 PM',
        area: 'Betalbatim, South Goa',
      },
      {
        name: 'Ritz Classic',
        cuisine: 'Goan / Indian',
        priceRange: '€',
        description:
          "The city-folk's favourite no-frills lunch canteen in Panaji: fish thalis served on banana leaves, house-made pickles, and ice-cold Sol Kadi. Arrive by 1 PM — the kitchen often sells out of the best dishes by 1:30.",
        hours: '11:30 AM – 3:30 PM',
        area: 'Panaji, North Goa',
      },
      {
        name: 'Gunpowder',
        cuisine: 'South Indian / Coastal',
        priceRange: '€€',
        description:
          'Set in a lush old Portuguese villa in the hipster village of Assagao, Gunpowder serves refined coastal Indian cooking: Chettinad curries, Kerala fish pollichathu wrapped in banana leaf, and excellent homemade desserts.',
        hours: '12:30 PM – 3 PM, 7 PM – 10:30 PM',
        area: 'Assagao, North Goa',
      },
    ],
    streetFood: [
      'Chouriço rolls at Mapusa Friday Market (the best in Goa)',
      'Ros Omelette at Café Tato, Panaji — Goan-spiced egg dish, ₹50',
      'Fresh coconut water from any beach shack for ₹20–30',
      'Patoleo (steamed rice dumpling in turmeric leaf) from temple festivals during Ganesh Chaturthi',
    ],
    dietaryNotes: [
      'Seafood dominates Goan menus — specify allergies clearly to kitchen staff',
      'Vegetarian options abound in Hindu-quarter restaurants in Panaji and Ponda',
      'Chouriço contains pork — ask kitchen staff if unsure about a dish',
    ],
    waterSafety: 'bottled',
    drinks: [
      "Feni — Goa's signature cashew or coconut spirit (40% ABV), try aged at Cazulo Premium Feni",
      'Kingfisher beer — ice cold at any beach shack',
      'Sol Kadi — the cooling pink kokum drink you should have with every meal',
      'Fresh coconut water — from green coconuts cracked open at beach stalls',
    ],
    marketTips: [
      "Mapusa Friday Market: Goa's most authentic produce market, packed with local spices, pickles, and fresh catch",
      'Arpora Saturday Night Bazaar (October–April): 5 PM – midnight, live music + street food + artisan stalls',
      'Anjuna Wednesday Flea Market: the legendary hippie-era bazaar with an astonishing range of goods',
    ],
  },

  bali: {
    dishes: [
      {
        name: 'Nasi Goreng',
        description:
          'Indonesian fried rice — cooked in a wok over high heat with kecap manis, garlic, shallots, and shrimp paste — topped with a fried egg, prawn crackers, and sliced cucumber. Found everywhere from warung to five-star hotels.',
        emoji: '🍳',
        priceRange: 'Rp 20,000–80,000',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Babi Guling',
        description:
          'Suckling pig spit-roasted over coconut husks and wood with a paste of turmeric, ginger, lemongrass, and galangal. A ceremonial dish now served daily at dedicated warungs — the crispy skin is the point.',
        emoji: '🐷',
        priceRange: 'Rp 35,000–60,000',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'medium',
        mustTry: true,
      },
      {
        name: 'Sate Lilit',
        description:
          'Balinese minced seafood or chicken satay, twisted around lemongrass stalks and grilled over coconut shell charcoal. Lighter and more aromatic than the standard peanut-sauce satay found elsewhere in Indonesia.',
        emoji: '🍢',
        priceRange: 'Rp 25,000–50,000',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Lawar',
        description:
          'A traditional Balinese ceremonial salad of finely chopped vegetables, grated coconut, minced meat, and raw blood (in the traditional version). The vegetarian version — made with jackfruit — is equally authentic and widely available.',
        emoji: '🥗',
        priceRange: 'Rp 20,000–45,000',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'medium',
        mustTry: false,
      },
      {
        name: 'Pisang Goreng',
        description:
          'Deep-fried banana fritters dusted in sugar and sometimes served with coconut ice cream. A universally loved Balinese snack: crispy outside, custardy and caramelised within. Vegan-friendly and sold at every warung.',
        emoji: '🍌',
        priceRange: 'Rp 5,000–20,000',
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'none',
        mustTry: false,
      },
    ],
    restaurants: [
      {
        name: 'Locavore',
        cuisine: 'Indonesian Fine Dining',
        priceRange: '€€€€',
        description:
          "Consistently one of Asia's 50 Best Restaurants, Locavore celebrates Bali's finest local producers through a tasting menu that changes with the seasons. The service and wine pairing are world-class.",
        hours: '12 PM – 2 PM, 6 PM – 10 PM (closed Mon)',
        area: 'Ubud',
      },
      {
        name: 'Warung Babi Guling Ibu Oka',
        cuisine: 'Balinese Warung',
        priceRange: '€',
        description:
          'The most famous babi guling in Bali — featured by Anthony Bourdain and consistently praised by every food writer who visits. Arrive at 10 AM when the pig comes off the spit; it often sells out by noon.',
        hours: '8 AM – sold out (~1 PM)',
        area: 'Central Ubud (opposite the Royal Palace)',
      },
      {
        name: 'BLANCO par Mandif',
        cuisine: 'Modern Indonesian',
        priceRange: '€€€',
        description:
          'Avant-garde Indonesian cuisine set dramatically inside the BLANCO Renaissance Museum, with views over the Campuhan river gorge. Chef Mandif uses molecular techniques to reinterpret traditional Balinese flavours.',
        hours: '12 PM – 10 PM',
        area: 'Campuhan, Ubud',
      },
    ],
    streetFood: [
      'Mie ayam (chicken noodle soup) from night warungs along Jl. Monkey Forest, Ubud',
      'Fresh tropical fruit — papaya, mangosteen, rambutan — from Ubud Traditional Market, from Rp 5,000',
      'Martabak (sweet stuffed pancake) from evening carts in Seminyak and Kuta from 6 PM',
      'Nasi campur (rice plate with various sides) from any morning warung, Rp 15,000–25,000',
    ],
    dietaryNotes: [
      'Vegetarian and vegan menus are widely available — Ubud in particular caters extensively to plant-based diets',
      'Babi guling (suckling pig) is the centrepiece of Balinese cuisine — Muslims should verify dishes carefully',
      'Lawar traditionally contains raw blood — specify "lawar putih" (white lawar) for the vegetable-only version',
    ],
    waterSafety: 'bottled',
    drinks: [
      'Es kelapa muda — fresh young coconut with a straw and a spoon for the flesh',
      'Bintang beer — the national lager, served ice cold in every warung and beach bar',
      'Jamu — traditional herbal health tonic (turmeric, ginger, tamarind); sold from roadside carts',
      'Arak Bali — local palm spirit used in cocktails; quality varies widely, buy from a reputable bar',
    ],
    marketTips: [
      'Ubud Traditional Market (7 AM – noon) for the freshest local produce, flowers for temple offerings, and sarongs',
      "Seminyak's Eat Street (Jl. Kayu Aya) for evening restaurant and street food exploration",
      "Gianyar Night Market (5 PM – midnight) is Bali's most authentic local food market — tourists rarely find it",
    ],
  },

  bangkok: {
    dishes: [
      {
        name: 'Pad Thai',
        description:
          'Stir-fried rice noodles with tamarind paste, fish sauce, shrimp, egg, bean sprouts, and crushed peanuts — the dish that defines Bangkok street food. The best versions arrive in under two minutes from a wok over a roaring flame.',
        emoji: '🍜',
        priceRange: '฿60–200',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Tom Yum Goong',
        description:
          'A hot and sour soup of galangal, lemongrass, kaffir lime leaves, and plump river prawns — simultaneously fragrant and searingly spicy. This is the soup that defines Thai cooking for the world.',
        emoji: '🍲',
        priceRange: '฿80–250',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'very-hot',
        mustTry: true,
      },
      {
        name: 'Massaman Curry',
        description:
          "Thailand's most internationally celebrated curry: influenced by Persian and Malay cooking, it's mellow and aromatic rather than fiery — slow-cooked beef or lamb with potatoes, peanuts, cardamom, and coconut milk.",
        emoji: '🥘',
        priceRange: '฿90–200',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Som Tum',
        description:
          'A green papaya salad pounded in a clay mortar with chilli, lime, fish sauce, garlic, and dried shrimp — simultaneously sour, sweet, salty, and brutally spicy. The unofficial street food of Bangkok.',
        emoji: '🥗',
        priceRange: '฿50–120',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'hot',
        mustTry: false,
      },
      {
        name: 'Mango Sticky Rice',
        description:
          'Glutinous rice cooked in coconut milk, served warm alongside slices of perfectly ripe champagne mango — a combination so perfectly balanced it became the most copied Thai dessert in the world. Vegan-friendly.',
        emoji: '🥭',
        priceRange: '฿60–150',
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'none',
        mustTry: true,
      },
    ],
    restaurants: [
      {
        name: 'Jay Fai',
        cuisine: 'Thai Street Food (Michelin ★)',
        priceRange: '€€€',
        description:
          "A 70-year-old woman in ski goggles wields two woks over a charcoal fire to produce the world's most famous crab omelette (฿1,200). One Michelin star. Book 2+ weeks in advance online.",
        hours: '2 PM – midnight (closed weekends)',
        area: 'Samran Rat, Phra Nakhon',
      },
      {
        name: 'Thip Samai',
        cuisine: 'Pad Thai Specialist',
        priceRange: '€',
        description:
          "Bangkok's legendary Pad Thai restaurant, open since 1966, serving one dish with four variations all wrapped in a delicate egg net. The queue moves fast; expect to wait 20 minutes at peak hours. Absolutely worth it.",
        hours: '5 PM – 2 AM',
        area: 'Mahachai, Old City',
      },
      {
        name: 'Nahm',
        cuisine: 'Royal Thai Fine Dining',
        priceRange: '€€€€',
        description:
          "David Thompson's meticulous recreation of 19th-century royal Thai court cuisine, using archival recipes. The relishes, salads, curries, and desserts are served family-style in a way that reframes what Thai food can be.",
        hours: '12 PM – 2 PM, 7 PM – 10:30 PM (Mon–Fri)',
        area: 'Silom, COMO Metropolitan Hotel',
      },
    ],
    streetFood: [
      'Boat noodles from floating vendors near Tha Chang Pier — ฿20 per tiny bowl (order 4–5)',
      'Grilled pork skewers (moo ping) from morning markets near MRT stations from 6 AM, ฿10 each',
      'Roti with condensed milk and banana from any evening cart in Khao San Road area',
      'Oyster omelette (hoi tod) from dedicated street stalls in Chinatown (Yaowarat) from 7 PM',
    ],
    dietaryNotes: [
      "Many dishes contain fish sauce (nam pla) — specify 'mangsawirat' (vegetarian) and 'mai sai nam pla' (no fish sauce) clearly",
      "Spice levels are adjustable — 'mai phet' means not spicy; 'phet noi' means a little spicy",
      'Shrimp paste (kapi) is in many curry bases — vegans should verify with kitchen staff',
    ],
    waterSafety: 'bottled',
    drinks: [
      'Cha Yen — Thai iced tea with condensed milk; a brilliant sweet orange drink from any street cart, ฿20',
      'Singha or Chang beer — ice cold from 7-Eleven or any restaurant, ฿45–80',
      'Fresh coconut water from green coconuts sold at every market',
      'Nam manao (fresh lime soda) — everywhere, addictively refreshing, ฿25',
    ],
    marketTips: [
      "Or Tor Kor Market (MRT Kamphaengphet) — Bangkok's best premium produce market; outstanding ready-to-eat food hall",
      'Chatuchak Weekend Market Saturday–Sunday: equally famous for street food as for shopping',
      "Chinatown (Yaowarat Road) after 6 PM transforms into Bangkok's greatest street food corridor",
    ],
  },

  tokyo: {
    dishes: [
      {
        name: 'Ramen',
        description:
          "Tokyo's ramen soul is the shoyu (soy) and shio (salt) broth styles: clear, chicken-based, complex, and topped with chashu pork, soft-boiled egg, nori, and menma bamboo shoots. A bowl can be transcendent.",
        emoji: '🍜',
        priceRange: '¥800–1,800',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Sushi & Sashimi',
        description:
          "At a counter in Tokyo, sushi becomes a conversation between chef and guest. Omakase (chef's choice) at a mid-range counter (¥15,000–30,000) is one of the world's finest eating experiences. Budget sushi at conveyor-belt chains is also excellent.",
        emoji: '🍣',
        priceRange: '¥500 – ¥30,000+',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Tempura',
        description:
          'Battered and flash-fried vegetables, prawns, and white fish — but nothing like Western deep-frying. True Tokyo tempura uses a barely-mixed batter, extremely hot sesame oil, and skill that takes years to develop. Order it at the counter watching the chef work.',
        emoji: '🍤',
        priceRange: '¥1,200–8,000',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Gyūdon (Beef Bowl)',
        description:
          'Thinly sliced, soy-and-mirin-braised beef ladled over a bowl of steamed rice — a lightning-fast, entirely satisfying Tokyo staple available 24 hours at chains like Yoshinoya and Matsuya for under ¥500.',
        emoji: '🥩',
        priceRange: '¥400–700',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: false,
      },
      {
        name: 'Onigiri',
        description:
          'Triangular rice balls wrapped in nori, filled with everything from umeboshi plum to tuna mayo — sold at every 7-Eleven, Lawson, and FamilyMart for ¥120–200. Tokyo convenience store onigiri is genuinely excellent food.',
        emoji: '🍙',
        priceRange: '¥120–200',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: false,
      },
    ],
    restaurants: [
      {
        name: 'Sukiyabashi Jiro (Honten)',
        cuisine: 'Sushi Omakase (3 Michelin ★)',
        priceRange: '€€€€',
        description:
          "The world's most famous sushi restaurant, immortalised in Jiro Dreams of Sushi. Ten-seat counter, 20 courses in 30 minutes, ¥45,000+ per person. Reservations must be made via the concierge of a 5-star Tokyo hotel.",
        hours: '12 PM – 2 PM, 5 PM – 8 PM (Mon–Sat)',
        area: 'Ginza (Osaka-machi Building)',
      },
      {
        name: 'Ichiran',
        cuisine: 'Solo-booth Ramen',
        priceRange: '€',
        description:
          "The world's most thoughtfully designed ramen experience: individual wooden booths, a flavour questionnaire, and concentrated tonkotsu broth customised to your preferences. Solo dining reinvented. Open 24 hours.",
        hours: '24 hours',
        area: 'Shibuya, Shinjuku, Asakusa (multiple locations)',
      },
      {
        name: 'Den',
        cuisine: 'Modern Japanese (2 Michelin ★)',
        priceRange: '€€€€',
        description:
          "Chef Zaiyu Hasegawa's playful, seasonal kaiseki — with a 'Dening Room salad' that arrives in a Japanese lunchbox and a complimentary 'Dentucky Fried Chicken' for dessert. Tokyo's most joyful fine dining.",
        hours: '6 PM – 9:30 PM (Tue–Sat)',
        area: 'Jingumae, Shibuya',
      },
    ],
    streetFood: [
      'Takoyaki octopus balls from stalls around Senso-ji in Asakusa — ¥500 for 6',
      "Taiyaki (fish-shaped custard waffle) from Naniwaya Sohonten, Tokyo's oldest taiyaki shop since 1909",
      'Crepes from Marion Crepes in Harajuku — every conceivable filling, ¥500–800',
      'Convenience store sushi sets from 7-Eleven — genuinely excellent and cost ¥350–600 for a proper selection',
    ],
    dietaryNotes: [
      'Vegetarian and vegan options are limited in traditional restaurants — apps like HappyCow Tokyo list dedicated spots',
      'Many dishes contain dashi (fish stock) even when described as vegetarian — confirm with staff',
      'Ichiran and most ramen shops can make vegetarian broth on request — ask at the order machine',
    ],
    waterSafety: 'safe',
    drinks: [
      'Matcha — in every possible form: hot, iced, lattes, cakes — from specialist matcha cafés in Uji (day trip) or Nakameguro',
      "Craft beer from Yona Yona Ale (also sold cold in cans at supermarkets) — Tokyo's best craft brewery",
      'Calpis soda — a milky, lightly fermented soft drink from any vending machine; unique and excellent',
      'Sake — try a sake bar in Koenji or Nakameguro for curated regional selections from ¥800 per glass',
    ],
    marketTips: [
      'Tsukiji Outer Market (6–10 AM) for the best sushi breakfast in Tokyo — Daiwa Sushi or Sushi Sei',
      "Isetan Shinjuku's depachika (basement food hall) — the finest collection of Japanese artisan food products under one roof",
      'Ameyoko Market in Ueno (Mon–Sat) for cheap produce, dried fish snacks, and lively street food vendors',
    ],
  },

  paris: {
    dishes: [
      {
        name: 'Croissant',
        description:
          'A great croissant from a great Parisian boulangerie is a different object from what the rest of the world calls a croissant: darkly caramelised at the edges, shattering when you bite, with a honeycomb interior that stretches like pastry silk.',
        emoji: '🥐',
        priceRange: '€1.20–2.50',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Steak Frites',
        description:
          'The French brasserie at its most perfect: a thick, charred onglet (hanger steak) with a burnished crust and pink interior, served alongside a mountain of hand-cut pommes frites and a knob of tarragon butter. Order it saignant (rare).',
        emoji: '🥩',
        priceRange: '€18–35',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Crêpes',
        description:
          'Paper-thin buckwheat galettes (savoury) or sweet crêpes filled with Nutella, salted caramel, and fresh strawberries — sold from street stands along the Seine and in Montparnasse, where the crêpe was invented.',
        emoji: '🫓',
        priceRange: '€3–9',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Escargots de Bourgogne',
        description:
          'Burgundy snails baked in their shells with a compound butter of garlic, parsley, and shallots — a ritual of French gastronomy rather than a casual snack. The butter is the point; the snails just carry it to your mouth.',
        emoji: '🐌',
        priceRange: '€12–22 per dozen',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: false,
      },
      {
        name: 'Tarte Tatin',
        description:
          'An upside-down caramelised apple tart invented accidentally at the Hôtel Tatin in 1898 — concentrated, deeply bronzed apple, with a pastry base that absorbs all the caramel from underneath. Served with crème fraîche.',
        emoji: '🥧',
        priceRange: '€7–14',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
    ],
    restaurants: [
      {
        name: "Le Relais de l'Entrecôte",
        cuisine: 'Classic French Brasserie',
        priceRange: '€€',
        description:
          "One menu, one dish — entrecôte steak with their secret walnut sauce and unlimited frites — served in two courses with no reservations taken. The queue starts before they open and it's always worth it.",
        hours: '12:15 PM – 2:30 PM, 7 PM – 11:30 PM',
        area: 'Rue Marbeuf, 8th arrondissement',
      },
      {
        name: 'Septime',
        cuisine: 'French Biodynamic',
        priceRange: '€€€€',
        description:
          'One of the hardest reservations in Paris — a biodynamic market-led tasting menu from chef Bertrand Grébaut, served in a relaxed space that feels nothing like a formal restaurant. Book 4 weeks in advance on their website.',
        hours: '12 PM – 1:30 PM, 8 PM – 9:30 PM (Mon–Fri)',
        area: 'Charonne, 11th arrondissement',
      },
      {
        name: "L'As du Fallafel",
        cuisine: 'Jewish-French / Middle Eastern',
        priceRange: '€',
        description:
          'The most famous falafel in Paris: crispy chickpea balls in a toasted pita with aubergine, hummus, tahini, and amba (mango pickle). The queue stretches down Rue des Rosiers; it moves in 10 minutes. Open Sunday when most restaurants are closed.',
        hours: '11 AM – 11 PM (closed Sat)',
        area: 'Rue des Rosiers, Le Marais, 4th',
      },
    ],
    streetFood: [
      'Baguette sandwich from any boulangerie — jambon-beurre (ham and Normandy butter) is the Parisian standard',
      'Crêpes from stands along the Seine and around Notre-Dame — €3–6 for a proper filled crêpe',
      'Macarons from Ladurée or Pierre Hermé — the latter is less famous but the quality is more consistent',
      'Galette-saucisse from Marché Bastille on Sunday mornings — buckwheat crêpe wrapped around a Breton sausage, €3',
    ],
    dietaryNotes: [
      'Vegetarian options have improved markedly — look for V or "Végétarien" tags on menus',
      'Many classic sauces (demi-glace, beurre blanc) are meat or butter-based — ask your server',
      'Vegan dining is now excellent in Paris — Gentle Gourmet and VG Patisserie are excellent dedicated spots',
    ],
    waterSafety: 'safe',
    drinks: [
      "House carafe of wine (pichet de vin) at any zinc bar — ask for 'un pichet de rouge/blanc/rosé' — €8–12 for 50cl",
      'Café au lait — milky coffee at breakfast only; ordering after noon marks you as a tourist',
      'Kir Royale — Champagne with a splash of crème de cassis (blackcurrant liqueur) — the aperitif of choice',
      'Pastis — anise-flavoured spirit diluted with cold water, the unofficial drink of the south served everywhere in summer',
    ],
    marketTips: [
      'Marché Bastille (Thu 7 AM–2:30 PM, Sun 7 AM–3 PM) — finest seasonal produce and prepared foods in Paris',
      "Rue Montorgueil food street (2nd arrondissement, daily) — Paris's best market street with excellent fishmongers, charcutiers, and fromageries",
      "Marché d'Aligre (daily except Mon) — lively, multicultural market with the cheapest produce in central Paris",
    ],
  },

  dubai: {
    dishes: [
      {
        name: 'Al Machboos',
        description:
          'The national dish of the UAE: slow-cooked meat (usually lamb or chicken) with basmati rice seasoned with dried limes, cinnamon, cardamom, cloves, and rose water. Rich, aromatic, and deeply comforting.',
        emoji: '🍚',
        priceRange: 'AED 30–80',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Shawarma',
        description:
          "Spiced rotisserie meat (chicken or lamb) shaved off a slowly turning spit, wrapped in flatbread with tahini, garlic sauce, pickles, and tomatoes. Dubai's most beloved street food, available from tiny takeaways until 3 AM.",
        emoji: '🌯',
        priceRange: 'AED 5–18',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Al Harees',
        description:
          'A Ramadan staple: slow-cooked wheat and meat pounded to a smooth, porridge-like consistency and drizzled with ghee. Simple, ancient, and extraordinarily flavourful — a dish that reveals how much you can achieve with so little.',
        emoji: '🥣',
        priceRange: 'AED 20–45',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: false,
      },
      {
        name: 'Luqaimat',
        description:
          "Golden fried dough dumplings drizzled with date syrup and sprinkled with sesame seeds — Dubai's most beloved sweet street food. Sold from traditional copper vats at markets and heritage villages.",
        emoji: '🍡',
        priceRange: 'AED 10–20 (portion)',
        isVegetarian: true,
        isVegan: true,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Knafeh',
        description:
          'A Middle Eastern cheese pastry soaked in rose-water sugar syrup and topped with crushed pistachios. The cheese used (Nabulsi) melts into soft, stretchy strands — simultaneously sweet and savoury in the most addictive way.',
        emoji: '🧆',
        priceRange: 'AED 15–35',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
    ],
    restaurants: [
      {
        name: 'Bu Qtair',
        cuisine: 'Emirati Seafood',
        priceRange: '€',
        description:
          'The most beloved seafood shack in Dubai: fish and prawns selected from the catch at the front, battered with a secret spice blend, and fried while you wait. No menu, no Wi-Fi, no ambiance — but the fish is transcendent.',
        hours: '12 PM – 11:30 PM',
        area: 'Jumeirah Fishing Harbour',
      },
      {
        name: 'Zuma Dubai',
        cuisine: 'Contemporary Japanese (Izakaya)',
        priceRange: '€€€€',
        description:
          'The Dubai outpost of the globally celebrated Japanese brasserie — robata grill, sashimi counter, and an extraordinary sake list. Consistently one of the most buzzing restaurant rooms in the city.',
        hours: '12 PM – 3:30 PM, 7 PM – midnight',
        area: 'DIFC, Gate Village',
      },
      {
        name: 'Arabian Tea House',
        cuisine: 'Emirati Heritage',
        priceRange: '€€',
        description:
          'A courtyard café in Al Fahidi Historical Neighbourhood that serves an excellent Emirati breakfast: chebab (saffron pancakes), balaleet (sweet vermicelli with egg), ful medames, and karak chai in a peaceful, shaded setting.',
        hours: '7:30 AM – 10 PM',
        area: 'Al Fahidi, Bur Dubai',
      },
    ],
    streetFood: [
      'Shawarma from Al Safadi — the best late-night chicken shawarma in the city, AED 7',
      "Manakish (flatbread with za'atar oil or cheese) from any neighbourhood bakery, AED 5–10",
      'Fresh juice (orange, pomegranate, or mango) from street-side juice bars, AED 8–15',
      'Luqaimat (honey dumplings) from the Heritage Village or Al Fahidi evening stalls',
    ],
    dietaryNotes: [
      'Halal food is universal across Dubai — no need to ask in any local or Middle Eastern restaurant',
      'Pork is available only in licensed hotel restaurants and bars — clearly marked on menus',
      'Alcohol is served only in licensed hotel restaurants, bars, and clubs — not available in neighbourhood restaurants or malls',
    ],
    waterSafety: 'safe',
    drinks: [
      'Karak chai — super-strong tea with cardamom, condensed milk, and saffron; the heartbeat of Emirati daily life',
      'Fresh lemon-mint juice — refreshingly tart and everywhere, AED 10–18',
      'Arabic coffee (qahwa) — unsweetened, cardamom-spiced, served in small cups with dates',
      "Camel milk — available from specialty shops and airport kiosks; richer and slightly saltier than cow's milk",
    ],
    marketTips: [
      'Deira Gold Souk — open daily until 10 PM; government-controlled gold prices make this genuinely competitive',
      'Dubai Spice Souk (adjacent to Gold Souk) — saffron, sumac, barberries, dried limes; prices negotiable',
      'Friday Market on Al Ain Road — Emirati farmers selling dates, pottery, and carpets every Friday',
    ],
  },

  london: {
    dishes: [
      {
        name: 'Full English Breakfast',
        description:
          'The British ritual: back bacon, pork sausages, baked beans, fried egg, grilled tomato, mushrooms, and toast — served on an oval plate at a formica-topped café table with a mug of strong tea. The original all-day breakfast.',
        emoji: '🍳',
        priceRange: '£8–16',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Fish and Chips',
        description:
          'Battered cod or haddock, deep-fried to a golden crunch, served with thick-cut chips on paper — sprinkled with salt and malt vinegar. A pub lunch or a newspaper-wrapped portion eaten walking along the Thames at Greenwich.',
        emoji: '🐟',
        priceRange: '£8–20',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
      {
        name: 'Chicken Tikka Masala',
        description:
          "Technically a British invention (the dish was adapted in Glasgow in the 1970s), but London does it better than anywhere: marinated chicken in a rich, tomato-cream, spiced sauce — the UK's most ordered restaurant dish.",
        emoji: '🍛',
        priceRange: '£11–22',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'mild',
        mustTry: true,
      },
      {
        name: 'Pie and Mash',
        description:
          'A working-class London institution: minced beef pie, mashed potato, and liquor (a parsley sauce of eel stock) — served in white-tiled shops that have barely changed since the Victorian era. A cultural experience as much as a meal.',
        emoji: '🥧',
        priceRange: '£5–12',
        isVegetarian: false,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: false,
      },
      {
        name: 'Sticky Toffee Pudding',
        description:
          'The undisputed king of British puddings: a moist date sponge drenched in warm toffee sauce, served with vanilla ice cream or clotted cream. Found on every proper pub menu in the country — order it wherever you see it.',
        emoji: '🍮',
        priceRange: '£7–14',
        isVegetarian: true,
        isVegan: false,
        spiceLevel: 'none',
        mustTry: true,
      },
    ],
    restaurants: [
      {
        name: 'Dishoom',
        cuisine: 'Bombay Café',
        priceRange: '€€',
        description:
          "London's most loved restaurant, modelled on the Irani cafés of old Bombay. The bacon naan roll at breakfast is legendary. The black dal (slow-cooked 24 hours) is extraordinary. Queue or book 8 weeks in advance.",
        hours: '8 AM – 11 PM (Mon–Fri), 9 AM – 11:30 PM (Sat–Sun)',
        area: "Covent Garden, Shoreditch, King's Cross, Carnaby (multiple locations)",
      },
      {
        name: 'St. JOHN Bar and Restaurant',
        cuisine: 'Nose-to-Tail British',
        priceRange: '€€€',
        description:
          "Fergus Henderson's legendary restaurant in a converted smokehouse near Smithfield Market is the birthplace of the nose-to-tail cooking movement. The bone marrow and parsley salad is one of the most copied dishes in modern cooking.",
        hours: '12 PM – 3 PM, 6 PM – 11 PM (Mon–Fri), 12 PM – 11 PM (Sat)',
        area: 'St John Street, Clerkenwell',
      },
      {
        name: 'Gymkhana',
        cuisine: 'Indian Fine Dining',
        priceRange: '€€€€',
        description:
          "Consistently rated the finest Indian restaurant in London: a colonial gentleman's club setting for cooking that celebrates the full breadth of the subcontinent's regional traditions. The kid goat methi keema and wild Muntjac biryani are extraordinary.",
        hours: '12 PM – 2:30 PM, 6 PM – 10:30 PM (Mon–Sat)',
        area: 'Albemarle Street, Mayfair',
      },
    ],
    streetFood: [
      "Borough Market (Mon–Sat) — Neal's Yard cheese, hot raclette, pad thai, salt beef beigels: a full lunch circuit for £15",
      'Maltby Street Market (Sat 9 AM–4 PM, Sun 11 AM–4 PM) — chef-quality stalls away from the tourist crowds',
      'Brick Lane Beigel Bake, open 24 hours — the salt beef or smoked salmon beigel is a London rite of passage, £2.50',
      "Leather Lane Market (weekday lunchtimes, EC1) — office workers' market with exceptional value street food",
    ],
    dietaryNotes: [
      'London has world-class vegan and vegetarian dining — Ottolenghi, Mildreds, and Farmacy are landmarks of the genre',
      'Fish and chips from most chippies can be made vegetarian with battered halloumi or mushrooms on request',
      "The Indian restaurant scene is extraordinarily good and diverse — from Dishoom's Bombay café to the full South Indian spectrum",
    ],
    waterSafety: 'safe',
    drinks: [
      "A proper pint of cask ale at a Victorian pub — Timothy Taylor Landlord or London Pride; ask for 'bitter'",
      "Afternoon tea — at Claridge's (book 4 weeks ahead), Sketch, or Fortnum & Mason; plan £60–90 per person",
      "Flat white from any of London's outstanding third-wave coffee shops — Monmouth, Origin, or Workshop",
      "Pimm's Cup — a uniquely British summer drink of Pimm's No. 1, lemonade, mint, and cucumber; order at any pub garden",
    ],
    marketTips: [
      'Borough Market (Mon–Sat, Thu–Sat fullest) — unmissable for British artisan cheese, charcuterie, and exceptional hot food',
      'Portobello Road Market (Sat) in Notting Hill — antiques, vintage clothing, and excellent Jamaican food stalls',
      "Columbia Road Flower Market (Sunday 8 AM–3 PM) — one of London's most beautiful sights; arrived armed with coffee",
    ],
  },
};
