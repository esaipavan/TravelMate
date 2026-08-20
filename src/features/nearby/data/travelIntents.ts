// Travel-intent discovery: curated starting points for users who don't yet
// have a fixed destination. Each intent groups a travel *vibe* (beaches, hill
// stations, heritage, …) with a handful of real, well-known example places
// spanning big cities down to small towns and villages — so "you don't need a
// destination to start" is a real workflow, not a slogan.
//
// These are curated seed suggestions ONLY. Tapping one feeds its place string
// into the existing geocode → Geoapify search pipeline exactly like typing it
// by hand — nothing here is presented as live/authoritative place data, and no
// API result is fabricated. Static + offline-safe by design.

export interface TravelIntent {
  id: string;
  emoji: string;
  /** Short label shown on the chip, e.g. "Beaches". */
  label: string;
  /** One-line description of the vibe. */
  blurb: string;
  /** Real example places to seed a search — mix of cities, towns, villages. */
  places: string[];
}

export const TRAVEL_INTENTS: TravelIntent[] = [
  {
    id: 'beaches',
    emoji: '🏖️',
    label: 'Beaches',
    blurb: 'Coastlines, shacks, and slow sunsets',
    places: ['Gokarna, India', 'Varkala, India', 'Palolem, Goa', 'Havelock Island, India'],
  },
  {
    id: 'hills',
    emoji: '⛰️',
    label: 'Hill stations',
    blurb: 'Cool air, tea slopes, and viewpoints',
    places: ['Munnar, India', 'Coorg, India', 'Kalimpong, India', 'Landour, India'],
  },
  {
    id: 'heritage',
    emoji: '🏛️',
    label: 'Heritage',
    blurb: 'Forts, temples, and old quarters',
    places: ['Hampi, India', 'Orchha, India', 'Bundi, India', 'Thanjavur, India'],
  },
  {
    id: 'backwaters',
    emoji: '🛶',
    label: 'Backwaters & lakes',
    blurb: 'Houseboats, canals, and calm water',
    places: ['Alleppey, India', 'Kumarakom, India', 'Nubra Valley, India', 'Udaipur, India'],
  },
  {
    id: 'wildlife',
    emoji: '🐅',
    label: 'Wildlife & nature',
    blurb: 'Reserves, safaris, and forest trails',
    places: ['Kaziranga, India', 'Wayanad, India', 'Bandipur, India', 'Valparai, India'],
  },
  {
    id: 'villages',
    emoji: '🏡',
    label: 'Villages & offbeat',
    blurb: 'Small local places off the tourist trail',
    places: ['Malana, India', 'Mawlynnong, India', 'Ziro, India', 'Poombarai, India'],
  },
];
