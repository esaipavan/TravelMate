import type { LocalRide, LocalSearchParams, LocalVehicle } from '../types';
import { LOCAL_VEHICLE_CAPACITY } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// MOCK local-transport provider — explicit and self-contained so it can be
// swapped for a real ride-hailing API (Uber, Ola, Rapido, …) later without
// touching the UI/hooks. Deterministic per (pickup, dropoff, date-time, vehicle)
// so results are stable and testable.
//
// Distance/time-based, NOT timetabled: a plausible route distance + duration is
// derived once from the pickup/dropoff pair, then each provider offers the same
// route at its own fare and pickup ETA — which is what makes comparison useful.
// No fabricated imagery is produced here — cards use an honest gradient banner.
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDERS = ['Uber', 'Ola', 'Rapido', 'inDrive', 'Meru', 'BluSmart'];

// Relative fare weight by vehicle type (multiplies the computed base fare).
const VEHICLE_MULTIPLIER: Record<LocalVehicle, number> = {
  bike: 0.5,
  auto: 0.7,
  mini: 1,
  sedan: 1.25,
  suv: 1.7,
  premium: 2.2,
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

export function searchLocalRides(params: LocalSearchParams): Promise<LocalRide[]> {
  const pickup = params.pickup.trim();
  const dropoff = params.dropoff.trim();
  if (!pickup || !dropoff) return Promise.resolve([]);

  const currency = params.currency ?? 'INR';
  const vehicle = params.vehicle;
  const route = seeded(`${pickup.toLowerCase()}|${dropoff.toLowerCase()}|${params.dateTime ?? ''}`);

  // Route geometry is a property of the pickup/dropoff pair — same for everyone.
  const distanceKm = Math.round((2 + route() * 28) * 10) / 10; // 2–30 km
  // City average speed ~22 km/h → minutes; keep a sane floor.
  const durationMin = Math.max(6, Math.round((distanceKm / 22) * 60 + route() * 8));

  // Fare components (per the destination currency).
  const base = currency === 'INR' ? 40 : currency === 'USD' ? 2 : 1.8;
  const perKm = currency === 'INR' ? 14 : currency === 'USD' ? 0.9 : 0.8;
  const perMin = currency === 'INR' ? 1.5 : currency === 'USD' ? 0.2 : 0.18;
  const baseFare = (base + perKm * distanceKm + perMin * durationMin) * VEHICLE_MULTIPLIER[vehicle];

  const perProvider = seeded(
    `${pickup.toLowerCase()}|${dropoff.toLowerCase()}|${vehicle}|${currency}`,
  );

  const result = PROVIDERS.map((provider, i): LocalRide => {
    const priceJitter = 0.85 + perProvider() * 0.4; // ±provider pricing spread
    const price = Math.max(
      currency === 'INR' ? 30 : 1,
      Math.round((baseFare * priceJitter) / 5) * 5,
    );
    const etaMin = 2 + Math.floor(perProvider() * 12); // 2–13 min to pickup

    return {
      id: `mock-local-${i}-${pickup.toLowerCase()}-${dropoff.toLowerCase()}`.replace(/\s+/g, '-'),
      provider,
      pickup,
      dropoff,
      vehicle,
      etaMin,
      distanceKm,
      durationMin,
      seats: LOCAL_VEHICLE_CAPACITY[vehicle],
      price,
      currency,
      source: 'mock',
    };
  });

  return Promise.resolve(result);
}
