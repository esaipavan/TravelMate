// ── Local transport feature types ───────────────────────────────────────────
// Unlike the intercity modes (hotels/trains/buses/flights), local transport is
// a point-to-point, distance/time-based search — there is no timetable. A ride
// is priced from an estimated distance + duration for the route, offered by
// several providers. Bookings still persist through the shared bookings system
// with `mode: 'local'`, so no separate booking model is needed.

export const LOCAL_VEHICLES = ['bike', 'auto', 'mini', 'sedan', 'suv', 'premium'] as const;
export type LocalVehicle = (typeof LOCAL_VEHICLES)[number];

export const LOCAL_VEHICLE_LABEL: Record<LocalVehicle, string> = {
  bike: 'Bike',
  auto: 'Auto',
  mini: 'Mini',
  sedan: 'Sedan',
  suv: 'SUV',
  premium: 'Premium',
};

/** Seating capacity per vehicle type — used to cap the passenger selector. */
export const LOCAL_VEHICLE_CAPACITY: Record<LocalVehicle, number> = {
  bike: 1,
  auto: 3,
  mini: 4,
  sedan: 4,
  suv: 6,
  premium: 4,
};

export interface LocalSearchParams {
  pickup: string;
  dropoff: string;
  /** Local datetime string 'YYYY-MM-DDTHH:mm' — when the ride is wanted. */
  dateTime?: string;
  vehicle: LocalVehicle;
  currency?: string;
}

export interface LocalRide {
  id: string;
  provider: string; // e.g. "Uber"
  pickup: string;
  dropoff: string;
  vehicle: LocalVehicle;
  /** Minutes until pickup (driver ETA), not a timetabled departure. */
  etaMin: number;
  distanceKm: number;
  durationMin: number; // estimated ride time
  seats: number; // vehicle capacity
  price: number; // fare for the whole ride (not per passenger)
  currency: string;
  /** Explicit marker so a real ride-hailing API can be told apart later. */
  source: 'mock';
}
