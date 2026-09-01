import { describe, it, expect } from 'vitest';
import { pickBest, isGenuineDestination } from './geocode';

// Real candidate data captured from a live Nominatim query for "Kondapur"
// during Phase 7 verification (2026-09-01) — frozen as a fixture so the bug
// it exposes can never silently regress. Trimmed to the fields pickBest
// actually reads.
const KONDAPUR_CANDIDATES = [
  {
    display_name:
      'Kondapur, Ward 107 Madhapur, Greater Hyderabad Municipal Corporation West Zone, Hyderabad, Serilingampalle mandal, Ranga Reddy, Telangana, 500084, India',
    class: 'place',
    type: 'suburb',
    importance: 0.1467350293736171,
    lat: '17.4587912',
    lon: '78.3730556',
  },
  {
    display_name: 'Kondapur, Nawabpet mandal, Mahabubnagar, Telangana, India',
    class: 'place',
    type: 'village',
    importance: 0.14671826123445483,
    lat: '16.8816413',
    lon: '78.0057156',
  },
  {
    display_name: 'Kondapur, Mirdoddi mandal, Siddipet, Telangana, 502114, India',
    class: 'place',
    type: 'village',
    importance: 0.14670929045548176,
    lat: '18.1002527',
    lon: '78.7146592',
  },
  {
    display_name: 'Kondapur, Nirmal Rural mandal, Nirmal, Telangana, 504016, India',
    class: 'place',
    type: 'village',
    importance: 0.14670903868162047,
    lat: '19.0873261',
    lon: '78.3819240',
  },
];

const MANGALAGIRI_CANDIDATES = [
  {
    display_name: 'Mangalagiri, Guntur, Andhra Pradesh, 522500, India',
    class: 'place',
    type: 'suburb',
    importance: 0.38867939096549164,
    lat: '16.4318209',
    lon: '80.5688069',
  },
  {
    display_name: 'Mangalagiri, Guntur, Andhra Pradesh, India',
    class: 'boundary',
    type: 'administrative',
    importance: 0.19938740066310082,
    lat: '16.43',
    lon: '80.56',
  },
];

describe('pickBest', () => {
  it('picks the well-known Hyderabad suburb over an obscure same-named rural village (regression: importance must outrank settlement-type)', () => {
    // Before the Phase 7 fix, this incorrectly picked the Mahabubnagar
    // village: "village" ranked above "suburb" in SETTLEMENT_TYPES and rank
    // was compared before importance, even though the suburb was Nominatim's
    // own top result and had the higher importance score.
    const best = pickBest('Kondapur', KONDAPUR_CANDIDATES);
    expect(best.display_name).toContain('Hyderabad');
    expect(best.type).toBe('suburb');
  });

  it('keeps Mangalagiri as itself (suburb) rather than the coarser administrative-boundary match', () => {
    const best = pickBest('Mangalagiri', MANGALAGIRI_CANDIDATES);
    expect(best.type).toBe('suburb');
    expect(best.importance).toBeCloseTo(0.3887, 3);
  });

  it('prefers an exact primary-name match over a higher-importance non-exact match', () => {
    const candidates = [
      {
        display_name: 'Springfield District, Some State, India',
        class: 'boundary',
        type: 'administrative',
        importance: 0.9,
        lat: '1',
        lon: '1',
      },
      {
        display_name: 'Springfield, Some State, India',
        class: 'place',
        type: 'village',
        importance: 0.1,
        lat: '2',
        lon: '2',
      },
    ];
    expect(pickBest('Springfield', candidates).display_name).toBe('Springfield, Some State, India');
  });

  it('falls back to settlement-type rank only when importance is exactly tied', () => {
    const candidates = [
      {
        display_name: 'Twin, State, India',
        class: 'place',
        type: 'hamlet',
        importance: 0.5,
        lat: '1',
        lon: '1',
      },
      {
        display_name: 'Twin, State, India',
        class: 'place',
        type: 'town',
        importance: 0.5,
        lat: '2',
        lon: '2',
      },
    ];
    // town (rank 1) beats hamlet (rank 3) once importance can no longer decide.
    expect(pickBest('Twin', candidates).type).toBe('town');
  });
});

function place(class_: string, type: string) {
  return { display_name: 'Test, State, India', lat: '0', lon: '0', class: class_, type };
}

describe('isGenuineDestination', () => {
  // Regression fixtures: real Nominatim (class, type) pairs captured live
  // during Phase 7 for well-known Indian places of worship. Before this fix
  // every one of these searches returned "Location not found" outright,
  // because `amenity` and `building` are both far too broad to allowlist as
  // whole classes — the fix is a narrow, explicit (class, type) allowlist.
  it('accepts a temple/mosque/church tagged amenity=place_of_worship (Birla Mandir, Meenakshi Temple, Jama Masjid, Sri Ranganathaswamy Temple)', () => {
    expect(isGenuineDestination(place('amenity', 'place_of_worship'))).toBe(true);
  });

  it('accepts a heritage temple tagged building=temple (the genuine Ramappa Temple, Palampet)', () => {
    expect(isGenuineDestination(place('building', 'temple'))).toBe(true);
  });

  it('accepts a basilica tagged building=cathedral (Basilica of Bom Jesus)', () => {
    expect(isGenuineDestination(place('building', 'cathedral'))).toBe(true);
  });

  it('does NOT broaden amenity/building wholesale — an ordinary amenity or building stays rejected', () => {
    expect(isGenuineDestination(place('amenity', 'restaurant'))).toBe(false);
    expect(isGenuineDestination(place('amenity', 'bank'))).toBe(false);
    expect(isGenuineDestination(place('building', 'apartments'))).toBe(false);
    expect(isGenuineDestination(place('building', 'house'))).toBe(false);
  });

  it('still rejects a business/lodging fixture inside an allowed class (the original Paris → hotel guard)', () => {
    expect(isGenuineDestination(place('tourism', 'hotel'))).toBe(false);
  });

  it('still accepts an ordinary settlement/heritage class', () => {
    expect(isGenuineDestination(place('place', 'village'))).toBe(true);
    expect(isGenuineDestination(place('historic', 'fort'))).toBe(true);
  });
});
