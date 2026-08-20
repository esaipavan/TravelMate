import type { Bus, BusSearchParams, BusClass } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK buses provider — explicit and self-contained so it can be swapped for a
// real bus-inventory API later without touching the UI/hooks. Deterministic per
// (from, to, date, class) so results are stable and testable. No fabricated
// imagery is produced here — cards use an honest gradient placeholder.
// ─────────────────────────────────────────────────────────────────────────────

const OPERATORS = [
  'VRL Travels',
  'SRS Travels',
  'Orange Tours',
  'KSRTC',
  'Neeta Travels',
  'Zingbus',
  'IntrCity SmartBus',
];

// Relative fare weight by class (multiplies the base fare).
const CLASS_MULTIPLIER: Record<BusClass, number> = {
  seater: 0.7,
  sleeper: 1,
  'ac-seater': 1.1,
  'ac-sleeper': 1.5,
  volvo: 1.8,
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

const BUS_COUNT = 7;

export function searchBuses(params: BusSearchParams): Promise<Bus[]> {
  const from = params.from.trim();
  const to = params.to.trim();
  if (!from || !to) return Promise.resolve([]);

  const currency = params.currency ?? 'INR';
  const cls = params.busClass;
  const rand = seeded(
    `${from.toLowerCase()}|${to.toLowerCase()}|${params.date ?? ''}|${cls}|${currency}`,
  );

  const baseFare = currency === 'INR' ? 550 : currency === 'USD' ? 14 : 12;
  // Buses are generally slower than trains — a plausible road-journey window.
  const routeMinutes = 300 + Math.floor(rand() * 720); // 5h–17h

  const result = Array.from({ length: BUS_COUNT }, (_, i): Bus => {
    const operator = OPERATORS[i % OPERATORS.length];
    const departMin = 6 * 60 + Math.floor(rand() * 17 * 60); // 06:00–23:00
    const durationMin = Math.round((routeMinutes * (0.8 + rand() * 0.5)) / 5) * 5;
    const price = Math.round(((baseFare + rand() * baseFare) * CLASS_MULTIPLIER[cls]) / 10) * 10;
    const rating = Math.round((3.6 + rand() * 1.3) * 10) / 10; // 3.6–4.9
    const seatsLeft = 2 + Math.floor(rand() * 38);

    return {
      id: `mock-bus-${i}-${from.toLowerCase()}-${to.toLowerCase()}`.replace(/\s+/g, '-'),
      operator,
      from,
      to,
      departTime: hhmm(departMin),
      arriveTime: hhmm(departMin + durationMin),
      durationMin,
      busClass: cls,
      rating,
      seatsLeft,
      price,
      currency,
      source: 'mock',
    };
  });

  return Promise.resolve(result);
}
