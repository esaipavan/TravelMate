import { describe, it, expect } from 'vitest';
import { extractRoute, computeFare } from './local.provider';

describe('extractRoute', () => {
  it('extracts distance (km, rounded to 1 decimal) and duration (min, rounded) from a real Geoapify Routing response shape', () => {
    // Captured live from api.geoapify.com/v1/routing (Charminar → Golconda
    // Fort, mode=drive) while building this feature — trimmed to the fields
    // extractRoute actually reads.
    const raw = {
      features: [
        {
          type: 'Feature',
          properties: {
            mode: 'drive',
            units: 'metric',
            distance: 11156,
            distance_units: 'meters',
            time: 784.762,
          },
        },
      ],
    };
    expect(extractRoute(raw)).toEqual({ distanceKm: 11.2, durationMin: 13 });
  });

  it('returns null for a response with no features (e.g. no driving route exists)', () => {
    expect(extractRoute({ features: [] })).toBeNull();
  });

  it('returns null for zero/negative/missing distance or time — never a fabricated route', () => {
    expect(extractRoute({ features: [{ properties: { distance: 0, time: 100 } }] })).toBeNull();
    expect(extractRoute({ features: [{ properties: { distance: 500, time: -1 } }] })).toBeNull();
    expect(extractRoute({ features: [{ properties: { distance: 500 } }] })).toBeNull();
  });

  it('returns null for a malformed/unexpected payload rather than throwing', () => {
    expect(extractRoute(null)).toBeNull();
    expect(extractRoute('not an object')).toBeNull();
    expect(extractRoute({})).toBeNull();
    expect(extractRoute({ features: 'not an array' })).toBeNull();
  });
});

describe('computeFare', () => {
  it('scales with distance, duration, and the vehicle multiplier', () => {
    const sedan10km20min = computeFare(10, 20, 'sedan', 'INR');
    const bikeSameRoute = computeFare(10, 20, 'bike', 'INR');
    const sedanLongerRoute = computeFare(20, 40, 'sedan', 'INR');

    expect(bikeSameRoute).toBeLessThan(sedan10km20min); // bike multiplier (0.5) < sedan (1.25)
    expect(sedanLongerRoute).toBeGreaterThan(sedan10km20min); // more distance/time costs more
  });

  it('uses different base rates per currency, never a raw INR number relabelled', () => {
    const inr = computeFare(10, 20, 'sedan', 'INR');
    const usd = computeFare(10, 20, 'sedan', 'USD');
    expect(usd).not.toBe(inr);
    expect(usd).toBeGreaterThan(0);
  });
});
