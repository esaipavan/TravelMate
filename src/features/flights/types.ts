// ── Flights feature types ───────────────────────────────────────────────────
// Mirrors the trains / buses slices; bookings persist through the shared
// bookings system with `mode: 'flight'`, so no separate booking model is needed.

export const FLIGHT_CABINS = ['economy', 'premium-economy', 'business', 'first'] as const;
export type FlightCabin = (typeof FLIGHT_CABINS)[number];

export const FLIGHT_CABIN_LABEL: Record<FlightCabin, string> = {
  economy: 'Economy',
  'premium-economy': 'Premium Economy',
  business: 'Business',
  first: 'First',
};

export interface FlightSearchParams {
  from: string;
  to: string;
  date?: string; // YYYY-MM-DD
  cabin: FlightCabin;
  passengers?: number;
  currency?: string;
}

export interface Flight {
  id: string;
  airline: string; // e.g. "IndiGo"
  flightNumber: string; // e.g. "6E 512"
  from: string;
  to: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  durationMin: number;
  cabin: FlightCabin;
  /** 0 = non-stop, 1 = one stop, etc. */
  stops: number;
  seatsLeft: number;
  price: number;
  currency: string;
  /** Explicit marker so a real provider can be told apart later. */
  source: 'mock';
}
