import type { SafetyInfo } from '../types';

export const SAFETY_DB: Record<string, SafetyInfo> = {
  goa: {
    overallRating: 'safe',
    ratingNote:
      'Goa is generally safe for tourists, especially in well-travelled beach towns and Panaji. Exercise normal caution at night on isolated beaches and in crowded markets.',
    emergency: {
      police: '100',
      ambulance: '108',
      fire: '101',
      general: '112',
      touristHelpline: '1800-111-363',
    },
    hospitals: [
      { name: 'Goa Medical College & Hospital', area: 'Bambolim, Panaji (30 min from North Goa)' },
      { name: 'Apollo Clinic Goa', area: 'Panaji — best for non-emergency consultations' },
    ],
    embassies: [
      {
        country: 'US, UK, EU',
        phone: 'All embassies are in New Delhi — nearest consulates in Mumbai (3 hrs)',
      },
    ],
    tips: [
      'Avoid isolated beaches after dark — even during peak season; stick to lit, populated stretches',
      'Keep a physical copy of your passport and visa — the originals in your hotel safe',
      'Drink only bottled or filtered water; avoid ice in drinks from small roadside stalls',
      'Negotiate taxi fares before boarding — scam fares are common near tourist landmarks',
      'Monsoon season brings strong rip currents — swim only at beaches with lifeguard flags',
    ],
    scams: [
      'Taxi overcharging: tourists are quoted 3–5× the local rate. Ask your hotel the correct fare before hailing',
      "Fake police: plain-clothes 'officers' demand to see documents and then extort 'fines'. Genuine police wear uniforms",
      'Restaurant bill inflation: always ask for the bill to be itemised; extra items are regularly added',
      'Jewellery gem scams: sellers claim stones are investment quality. They are not. Never buy gems from street vendors',
      'Currency exchange: informal changers short-count bills. Use only bank ATMs or registered exchange counters',
    ],
    avoidAreas: [
      'Calangute and Baga beaches late at night (after midnight) — rowdy and poorly lit',
      'Interior Goa roads at night during monsoon — flash floods and visibility are dangerous',
    ],
    etiquette: [
      'Remove shoes before entering any temple, church, or home — a sign outside usually confirms this',
      'Dress modestly at religious sites — shoulders and knees covered; swimwear is not appropriate in towns',
      'Public displays of affection are frowned upon in conservative areas; beachfront is more relaxed',
      'Tipping is appreciated but not mandatory — 10% at restaurants, round up taxi fares',
      'Bargaining is expected at markets and with taxis; never bargain in temples or at government-fixed prices',
      'Do not photograph people, especially women, without asking permission first',
    ],
  },

  bali: {
    overallRating: 'safe',
    ratingNote:
      "Bali is one of Southeast Asia's safer destinations for tourists. The greatest risks are traffic accidents and ocean hazards. Standard vigilance applies in crowded areas.",
    emergency: {
      police: '110',
      ambulance: '118',
      fire: '113',
      general: '112',
      touristHelpline: '+62 361 754599',
    },
    hospitals: [
      { name: 'BIMC Hospital Kuta', area: 'Kuta — nearest to Seminyak, Legian, and the airport' },
      { name: 'Siloam Hospital Denpasar', area: 'Denpasar — full-service international hospital' },
    ],
    embassies: [
      {
        country: 'Australia',
        phone: '+62 21 2550 5555 (Jakarta — Australia has a consular agent in Bali)',
      },
      {
        country: 'US / UK / EU',
        phone:
          'Embassies in Jakarta (2 hrs by flight); register at your embassy website before travelling',
      },
    ],
    tips: [
      'Only use Blue Bird taxis or Grab — independent taxis at tourist sites routinely overcharge',
      'Rip currents at Kuta and Seminyak beaches are serious — swim only between the red and yellow flags',
      'Petty theft at beaches: never leave bags unattended on the sand',
      'Monkey Forest monkeys are aggressive — no food, no dangling earrings, keep bags zipped',
      'Drink only sealed bottled water — tap water and ice from unlabelled sources cause illness',
    ],
    scams: [
      'Overpriced money changers: some display great rates but use rigged counting machines. Use licensed banks or ATMs',
      "Temple donation boxes: unofficial 'priests' at minor temples demand large mandatory donations. They are not mandatory",
      "Taxi meter scams: drivers 'forget' to start the meter or claim it's broken. Grab or Blue Bird only",
      'Fake tour operators: book excursions through your hotel or reputable platforms, not street touts',
      'Kecak dance ticket touts: buy tickets at the Uluwatu temple ticket office, not from street sellers',
    ],
    avoidAreas: [
      'Kuta centre after midnight — very rowdy and opportunistic theft is common',
      'Unlicensed arak (palm spirit) — several tourists have died from methanol poisoning; drink only from reputable bars',
    ],
    etiquette: [
      'Always wear a sarong when entering a temple — most temples loan them free at the entrance gate',
      'Do not touch or step over temple offerings (canang sari) placed on the ground — walk around them',
      "Remove shoes when entering a temple's inner compound — look for the sign or follow others",
      "Do not place your head higher than a priest's head in a sacred space — sit or stand lower",
      'Menstruating women are traditionally asked not to enter the holiest temple areas',
      'The thumbs-up gesture is perfectly fine; pointing with your index finger is considered rude — use your whole hand',
    ],
  },

  bangkok: {
    overallRating: 'safe',
    ratingNote:
      'Bangkok is generally safe for tourists with normal precautions. Petty crime (pickpocketing, bag snatching) exists at major tourist sites. The greatest tourist risk is scams, not violence.',
    emergency: {
      police: '191',
      ambulance: '1669',
      fire: '199',
      general: '191',
      touristHelpline: '1155',
    },
    hospitals: [
      {
        name: 'Bangkok Hospital',
        area: 'New Petchburi Road — English-speaking staff, internationally accredited',
      },
      {
        name: 'Bumrungrad International',
        area: "Sukhumvit Soi 3 — ranked among Asia's top hospitals",
      },
    ],
    embassies: [
      { country: 'US', phone: '+66 2 205 4000 (Wireless Road, Lumpini)' },
      { country: 'UK', phone: '+66 2 305 8333 (Wireless Road, Lumpini)' },
      { country: 'AU', phone: '+66 2 344 6300 (South Sathorn Road)' },
    ],
    tips: [
      'The Tourist Police hotline 1155 has English-speaking operators 24 hours — use it for any incident',
      'Bag snatching from motorcycle riders happens on busy sidewalks — carry bags on the wall side of the pavement',
      'Grand Palace and Wat Pho are targeted by tuk-tuk scams — walk independently, do not accept rides from strangers near the palace',
      'Afternoon storms can strand you — always have your hotel address saved on your phone in Thai script for taxi drivers',
      "ATMs dispense only metered bank cards — use your home bank's ATM app to minimise fees",
    ],
    scams: [
      "Grand Palace closed today scam: tuk-tuk drivers outside say it's closed for a ceremony and offer to take you to a 'special' temple. It is never closed. Walk past",
      "Gem scam: a friendly local invites you to a 'government gem sale' with huge discounts. The gems are worthless. A classic and still very common",
      'Tuk-tuk shopping tour: a cheap ride that detours through commission-paying shops. Refuse any ride below market rate',
      'Fake monks: genuine Buddhist monks never ask for money donations in the street',
      'Overpriced menus at tourist restaurants near major temples — check prices before sitting down',
    ],
    avoidAreas: [
      'Patpong night market late at night — overpriced and opportunistic; Chatuchak is far better for shopping',
      'Khlong Toei market area at night — local neighbourhood, not a tourist area',
    ],
    etiquette: [
      'Always remove shoes when entering a temple, and dress modestly — no exposed shoulders or knees',
      'The Thai royal family is deeply revered — never make any negative comment about the monarchy; it is a criminal offence',
      'Do not touch a monk or hand anything directly to a monk if you are a woman — place it on a cloth nearby',
      "The 'wai' greeting (palms together, slight bow) is appreciated when offered to you — return it at the same height",
      'Never point your feet at a person, a Buddha image, or towards the altar in a temple',
      'Bargaining is expected in markets but done with smiles — getting angry or aggressive while bargaining is very rude',
    ],
  },

  tokyo: {
    overallRating: 'very-safe',
    ratingNote:
      'Tokyo is one of the safest major cities in the world. Violent crime against tourists is extremely rare. The primary risk is losing items (not theft) and navigational confusion.',
    emergency: {
      police: '110',
      ambulance: '119',
      fire: '119',
      general: '110',
      touristHelpline: '03-3501-0110',
    },
    hospitals: [
      {
        name: 'Tokyo Metropolitan Hiroo Hospital',
        area: 'Hiroo, Shibuya — English-speaking staff available',
      },
      {
        name: "St Luke's International Hospital",
        area: 'Tsukiji, Chuo — full international medical services',
      },
    ],
    embassies: [
      { country: 'US', phone: '+81 3 3224 5000 (Akasaka, Minato)' },
      { country: 'UK', phone: '+81 3 5211 1100 (Ichibancho, Chiyoda)' },
      { country: 'AU', phone: '+81 3 5232 4111 (Mita, Minato)' },
    ],
    tips: [
      'Lost items are almost always handed in to the nearest police box (koban) — check there first if you lose anything',
      "Carry your hotel's business card or write its address in Japanese — taxi drivers rarely speak English",
      "Japan's emergency system: call 110 for police, 119 for fire or ambulance. Operators are now reachable in English",
      'Heat stroke is the real summer danger — stay hydrated, seek shade, and use cooling cloths between 11 AM and 4 PM',
      'International credit cards are widely accepted in convenience stores but not always in small restaurants — carry cash',
    ],
    scams: [
      'Overpriced tourist bars in Roppongi and Shinjuku Kabukicho: drinks advertised cheaply with large hidden service charges added. Check the price list before ordering',
      'Fake charity collectors near major tourist sites — rare but present; Japan has very few scams',
      'Currency exchange booths at airports offer the worst rates — use a post office ATM or 7-Eleven ATM instead',
    ],
    avoidAreas: [
      'Kabukicho (Shinjuku) can be intimidating at night — perfectly safe but adult entertainment touts can be persistent',
    ],
    etiquette: [
      'Bow when greeting — a slight forward nod is fine; deeper bows are for more formal situations',
      'Do not eat or drink while walking on the street — it is considered rude. Eating at stalls or benches is fine',
      'Never talk on your phone on trains — put it on silent and text. Noise is taken very seriously on public transport',
      'Queue strictly — cutting in line is extremely offensive. Always wait behind the last person',
      'Tipping is not expected anywhere in Japan and can sometimes cause awkwardness — service is already exceptional',
      'Remove shoes when entering a traditional restaurant (if it has floor seating) or a home — look for the entrance step (genkan)',
      'Both hands: give and receive cards, gifts, and cash with both hands as a sign of respect',
    ],
  },

  paris: {
    overallRating: 'safe',
    ratingNote:
      'Paris is safe for tourists with standard European urban vigilance. Pickpocketing at major tourist sites (Eiffel Tower, Sacré-Cœur, Metro) is the primary risk — not violent crime.',
    emergency: {
      police: '17',
      ambulance: '15',
      fire: '18',
      general: '112',
      touristHelpline: '+33 1 42 76 62 00',
    },
    hospitals: [
      {
        name: 'Hôpital Lariboisière',
        area: '10th arrondissement — large public hospital with emergency department',
      },
      {
        name: 'American Hospital of Paris',
        area: 'Neuilly-sur-Seine — English-speaking, private, internationally accredited',
      },
    ],
    embassies: [
      { country: 'US', phone: '+33 1 43 12 22 22 (Avenue Gabriel, 8th)' },
      { country: 'UK', phone: '+33 1 44 51 31 00 (Rue du Faubourg Saint-Honoré, 8th)' },
      { country: 'AU', phone: '+33 1 40 59 33 00 (Rue Jean Rey, 15th)' },
    ],
    tips: [
      'Pickpockets operate in groups at the Eiffel Tower, Sacré-Cœur, Champs-Élysées, and on the Metro — use a zipped anti-theft bag',
      "The 'ring scam': someone 'finds' a gold ring and tries to get money. Ignore and walk on firmly",
      'Be alert on the RER B (airport train) and Metro lines 1 and 4 — tourist-heavy lines are pickpocket hotspots',
      'Keep your phone in your front pocket or bag — phone snatching from café tables is common',
      'Emergency: EU-wide 112 works in English from any phone',
    ],
    scams: [
      'Petition scam: a group of women or men with clipboards ask you to sign a petition and then demand money. Decline and walk away firmly',
      'Fake deaf-mute collectors in tourist areas — often work in organised groups. Do not give money',
      'Restaurant near tourist sites with menus but no prices — always check the price list before sitting',
      'Three-card monte near Montmartre — illegal and the tourist always loses',
      'Taxi overcharging from airports — all airport taxis now have legally fixed flat rates: €50–55 to central Paris from CDG, €32 from Orly',
    ],
    avoidAreas: [
      "Gare du Nord and Gare de l'Est at night — chaotic and pickpocket-heavy around the main entrances",
      'Pigalle and Barbès late at night — not dangerous but avoid if unfamiliar with the area',
    ],
    etiquette: [
      "Always say 'Bonjour' (or 'Bonsoir' in the evening) when entering any shop, café, or restaurant — silence is rude",
      "Say 'Merci, au revoir' when leaving — the two-second greeting and farewell are non-negotiable social rituals",
      'Learn a few words of French — even broken French is received far better than immediate English',
      'Tipping: service is included by law, but rounding up or leaving €1–2 for good service is appreciated (not obligatory)',
      'Do not be loud in restaurants — Paris cafés have an indoor volume that feels quiet by American standards',
      'Queue properly at boulangeries — grab a number or wait in turn, and do not push forward',
    ],
  },

  dubai: {
    overallRating: 'very-safe',
    ratingNote:
      "Dubai has one of the world's lowest violent crime rates. Tourists are extremely safe physically. The primary risks are legal misunderstandings and health hazards from extreme summer heat.",
    emergency: {
      police: '999',
      ambulance: '998',
      fire: '997',
      general: '999',
      touristHelpline: '800-DUBAI (800-38224)',
    },
    hospitals: [
      {
        name: 'American Hospital Dubai',
        area: 'Oud Metha — internationally accredited, English-speaking staff',
      },
      {
        name: 'Mediclinic City Hospital',
        area: 'Healthcare City, Nad Al Hamar — multi-specialty international hospital',
      },
    ],
    embassies: [
      { country: 'US', phone: '+971 4 309 4000 (World Trade Centre)' },
      { country: 'UK', phone: '+971 4 309 4444 (Al Seef Road, Bur Dubai)' },
      { country: 'AU', phone: '+971 4 508 7100 (Al Meydan Tower, DIFC)' },
    ],
    tips: [
      'Alcohol is strictly regulated — only consume in licensed hotel venues and bars. Public intoxication is a criminal offence',
      'Drug laws are extremely strict — even trace amounts can lead to prosecution. Do not carry any medication without a prescription',
      'Heat stroke risk July–September is very real — outdoor activity between 10 AM and 6 PM should be minimal',
      'Public displays of affection (kissing, holding hands beyond a brief touch) in public spaces can lead to a fine',
      'Always carry your passport or a copy — you may be asked for ID at hotels and car rentals',
    ],
    scams: [
      'Unofficial taxis at the airport — only use metered RTA (white) taxis or Careem/Uber booked via app',
      "Timeshare pressure: hotel staff or shopping mall promoters offer 'free gifts' to attend a presentation. Decline firmly",
      'Overpriced gold and spice purchases at the souks without price verification — always compare against government-listed gold rates',
      'Fake designer goods in Deira — purchasing counterfeit branded items is illegal and can lead to confiscation and a fine',
    ],
    avoidAreas: [
      'There are no genuinely dangerous areas in Dubai for tourists — standard awareness applies everywhere',
    ],
    etiquette: [
      'Dress modestly in all public spaces — malls, souks, streets, and beaches outside of resort areas; no swimwear in public',
      'During Ramadan, do not eat, drink, or smoke in public during daylight hours — fines apply for non-Muslims too',
      "Greet with 'As-salamu alaykum' and accept the response 'Wa alaykum as-salam' — a small gesture of respect that goes a long way",
      'The left hand is considered unclean in Arab culture — use your right hand when giving, receiving, and eating',
      'Do not photograph people, especially women and government buildings, without explicit permission',
      'Friday is the holy day — government offices and some businesses close; malls and restaurants remain open',
    ],
  },

  london: {
    overallRating: 'safe',
    ratingNote:
      'London is a safe city with well-patrolled tourist areas. Petty theft (phone snatching, pickpocketing) is the primary risk, particularly on public transport and at outdoor markets.',
    emergency: {
      police: '999',
      ambulance: '999',
      fire: '999',
      general: '999',
      touristHelpline: '0300 123 1212',
    },
    hospitals: [
      {
        name: "St Thomas' Hospital",
        area: 'Westminster Bridge, SE1 — with stunning views of Parliament; A&E open 24 hours',
      },
      {
        name: 'University College Hospital',
        area: 'Euston Road, NW1 — large teaching hospital with 24-hour emergency department',
      },
    ],
    embassies: [
      { country: 'US', phone: '+44 20 7499 9000 (Grosvenor Square, Mayfair)' },
      { country: 'AU', phone: '+44 20 7379 4334 (Strand, WC2)' },
      { country: 'CA', phone: '+44 20 7258 6600 (Trafalgar Square)' },
    ],
    tips: [
      'Phone snatching is the fastest-growing crime in London — never use your phone while walking near busy roads; motorbike thieves target pedestrians',
      'Keep bags zipped and in front of you on the Tube, particularly on the Central, Northern, and Jubilee lines at peak hours',
      'The NHS 111 service provides free medical advice by phone — call before going to A&E for non-life-threatening issues',
      'Tap water in London is safe and excellent quality — no need to buy bottled water',
      'Non-emergency police: call 101. Only call 999 for genuine emergencies',
    ],
    scams: [
      'Fake charity collectors with laminated cards in tourist areas — genuine charities do not solicit on the street this way',
      'Unlicensed minicabs at Heathrow and outside nightclubs — only use black cabs (hailed on the street) or pre-booked Uber/Bolt',
      'Card skimming at cash machines — use ATMs inside bank branches rather than standalone street machines',
      'Ticket touts outside major events and West End shows — buy only from official box offices or Ticketmaster',
      "'Lucky dip' sellers in Covent Garden and Leicester Square — a perennial tourist trap with no real value",
    ],
    avoidAreas: [
      'Avoid using your phone visibly on the Tube or while walking along major roads — particularly in South and East London',
      'Some parts of Elephant & Castle and Peckham late at night — not dangerous but exercise awareness',
    ],
    etiquette: [
      'Queue properly and without complaint — the British queue is sacred. Jumping the queue is genuinely offensive',
      'Stand on the right on all escalators in the Tube — the left is for walking. This is enforced by public pressure',
      "Say 'sorry' liberally — even if someone bumps into you. It is reflexive and entirely sincere",
      'Keep your voice down in public — loud conversations on public transport will earn stares',
      'Tipping: 10–12.5% in restaurants (check if service charge is already included before adding more)',
      'Pubs: you order at the bar, you never tip for drinks at the bar, and you do not beckon bar staff — wait patiently',
    ],
  },
};
