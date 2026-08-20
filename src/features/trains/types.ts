// ── Trains feature types ────────────────────────────────────────────────────
// Mirrors the hotels slice; bookings are persisted through the shared bookings
// system with `mode: 'train'`, so no separate booking model is needed here.

export const TRAIN_CLASSES = ['sleeper', 'ac-3', 'ac-2', 'ac-1', 'chair-car'] as const;
export type TrainClass = (typeof TRAIN_CLASSES)[number];

export const TRAIN_CLASS_LABEL: Record<TrainClass, string> = {
  sleeper: 'Sleeper',
  'ac-3': 'AC 3-Tier',
  'ac-2': 'AC 2-Tier',
  'ac-1': 'AC First Class',
  'chair-car': 'Chair Car',
};

export interface TrainSearchParams {
  from: string;
  to: string;
  date?: string; // YYYY-MM-DD
  travelClass: TrainClass;
  passengers?: number;
  currency?: string;
}

export interface Train {
  id: string;
  name: string; // e.g. "Rajdhani Express"
  number: string; // e.g. "12951"
  operator: string;
  from: string;
  to: string;
  departTime: string; // HH:mm
  arriveTime: string; // HH:mm
  durationMin: number;
  travelClass: TrainClass;
  price: number;
  currency: string;
  /** Explicit marker so a real provider can be told apart later. */
  source: 'mock';
}
