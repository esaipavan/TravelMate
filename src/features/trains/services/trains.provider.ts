import type { Train, TrainSearchParams, TrainClass } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK trains provider — explicit and self-contained so it can be swapped for a
// real rail API later without touching the UI/hooks. Deterministic per
// (from, to, date, class) so results are stable and testable. No fabricated
// imagery is produced here — cards use an honest gradient placeholder.
// ─────────────────────────────────────────────────────────────────────────────

const NAMES: Array<{ name: string; operator: string }> = [
  { name: 'Rajdhani Express', operator: 'Indian Railways' },
  { name: 'Shatabdi Express', operator: 'Indian Railways' },
  { name: 'Duronto Express', operator: 'Indian Railways' },
  { name: 'Garib Rath', operator: 'Indian Railways' },
  { name: 'Vande Bharat', operator: 'Indian Railways' },
  { name: 'Intercity Express', operator: 'Indian Railways' },
  { name: 'Superfast Express', operator: 'Indian Railways' },
];

// Relative fare weight by class (multiplies the base fare).
const CLASS_MULTIPLIER: Record<TrainClass, number> = {
  sleeper: 0.5,
  'ac-3': 1,
  'ac-2': 1.5,
  'ac-1': 2.4,
  'chair-car': 0.8,
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

const TRAIN_COUNT = 7;

export function searchTrains(params: TrainSearchParams): Promise<Train[]> {
  const from = params.from.trim();
  const to = params.to.trim();
  if (!from || !to) return Promise.resolve([]);

  const currency = params.currency ?? 'INR';
  const cls = params.travelClass;
  const rand = seeded(
    `${from.toLowerCase()}|${to.toLowerCase()}|${params.date ?? ''}|${cls}|${currency}`,
  );

  const baseFare = currency === 'INR' ? 900 : currency === 'USD' ? 22 : 20;
  // A plausible route distance drives duration & fare spread.
  const routeMinutes = 240 + Math.floor(rand() * 900); // 4h–19h

  const result = Array.from({ length: TRAIN_COUNT }, (_, i): Train => {
    const meta = NAMES[i % NAMES.length];
    const departMin = 5 * 60 + Math.floor(rand() * 18 * 60); // 05:00–23:00
    const durationMin = Math.round((routeMinutes * (0.75 + rand() * 0.6)) / 5) * 5;
    const price = Math.round(((baseFare + rand() * baseFare) * CLASS_MULTIPLIER[cls]) / 10) * 10;

    return {
      id: `mock-train-${i}-${from.toLowerCase()}-${to.toLowerCase()}`.replace(/\s+/g, '-'),
      name: meta.name,
      number: `${12000 + Math.floor(rand() * 8000)}`,
      operator: meta.operator,
      from,
      to,
      departTime: hhmm(departMin),
      arriveTime: hhmm(departMin + durationMin),
      durationMin,
      travelClass: cls,
      price,
      currency,
      source: 'mock',
    };
  });

  return Promise.resolve(result);
}
