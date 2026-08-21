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
};
