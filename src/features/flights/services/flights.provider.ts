import type { Flight, FlightSearchParams, FlightCabin } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK flights provider — explicit and self-contained so it can be swapped for a
// real flight-inventory API (Amadeus, Duffel, etc.) later without touching the
// UI/hooks. Deterministic per (from, to, date, cabin) so results are stable and
// testable. No fabricated imagery is produced here — cards use an honest
// gradient placeholder.
// ─────────────────────────────────────────────────────────────────────────────

const AIRLINES: { name: string; code: string }[] = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Vistara', code: 'UK' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Akasa Air', code: 'QP' },
  { name: 'Emirates', code: 'EK' },
  { name: 'Qatar Airways', code: 'QR' },
];

// Relative fare weight by cabin (multiplies the base fare).
const CABIN_MULTIPLIER: Record<FlightCabin, number> = {
  economy: 1,
  'premium-economy': 1.6,
  business: 3,
  first: 5,
};

function seeded(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hhmm(totalMin: number): string {
  const m = ((totalMin % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

const FLIGHT_COUNT = 7;

export function searchFlights(params: FlightSearchParams): Promise<Flight[]> {
  const from = params.from.trim();
  const to = params.to.trim();
  if (!from || !to) return Promise.resolve([]);

  const currency = params.currency ?? 'INR';
  const cabin = params.cabin;
  const rand = seeded(
    `${from.toLowerCase()}|${to.toLowerCase()}|${params.date ?? ''}|${cabin}|${currency}`,
  );

  const baseFare = currency === 'INR' ? 3500 : currency === 'USD' ? 60 : 55;
  // Plausible air-journey window (short domestic hop to long-haul).
  const routeMinutes = 60 + Math.floor(rand() * 540); // 1h–10h

  const result = Array.from({ length: FLIGHT_COUNT }, (_, i): Flight => {
    const { name: airline, code } = AIRLINES[i % AIRLINES.length];
    const flightNumber = `${code} ${100 + Math.floor(rand() * 800)}`;
    const departMin = 5 * 60 + Math.floor(rand() * 18 * 60); // 05:00–23:00
    const durationMin = Math.round((routeMinutes * (0.85 + rand() * 0.4)) / 5) * 5;
    // Longer routes are more likely to carry a stop.
    const stops = routeMinutes > 240 ? Math.floor(rand() * 2.4) : rand() > 0.75 ? 1 : 0;
    const price =
      Math.round(((baseFare + rand() * baseFare * 1.5) * CABIN_MULTIPLIER[cabin]) / 50) * 50;
    const seatsLeft = 1 + Math.floor(rand() * 24);

    return {
      id: `mock-flight-${i}-${from.toLowerCase()}-${to.toLowerCase()}`.replace(/\s+/g, '-'),
      airline,
      flightNumber,
      from,
      to,
      departTime: hhmm(departMin),
      arriveTime: hhmm(departMin + durationMin),
      durationMin,
      cabin,
      stops,
      seatsLeft,
      price,
      currency,
      source: 'mock',
    };
  });

  return Promise.resolve(result);
}
