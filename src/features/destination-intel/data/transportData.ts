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
};
