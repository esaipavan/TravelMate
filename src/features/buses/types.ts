// ── Buses feature types ─────────────────────────────────────────────────────
// Mirrors the trains slice; bookings persist through the shared bookings system
// with `mode: 'bus'`, so no separate booking model is needed here.

export const BUS_CLASSES = ['seater', 'sleeper', 'ac-seater', 'ac-sleeper', 'volvo'] as const;
export type BusClass = (typeof BUS_CLASSES)[number];

export const BUS_CLASS_LABEL: Record<BusClass, string> = {
  seater: 'Seater',
  sleeper: 'Sleeper',
  'ac-seater': 'AC Seater',
  'ac-sleeper': 'AC Sleeper',
  volvo: 'Volvo Multi-Axle',
};

export interface BusSearchParams {
  from: string;
  to: string;
  date?: string; // YYYY-MM-DD
  busClass: BusClass;
  passengers?: number;
  currency?: string;
}

export interface Bus {
  id: string;
  operator: string; // e.g. "VRL Travels"
  from: string;
  to: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  durationMin: number;
  busClass: BusClass;
  rating: number; // 0–5
  seatsLeft: number;
  price: number;
  currency: string;
  /** Explicit marker so a real provider can be told apart later. */
  source: 'mock';
}
