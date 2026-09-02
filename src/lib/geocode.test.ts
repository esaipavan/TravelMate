import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  pickBest,
  isGenuineDestination,
  classifyNameMatch,
  resolveDestination,
  geocodeLocation,
  GeocodeError,
} from './geocode';

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
    address: {
      suburb: 'Kondapur',
      city: 'Hyderabad',
      state_district: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    },
  },
  {
    display_name: 'Kondapur, Nawabpet mandal, Mahabubnagar, Telangana, India',
    class: 'place',
    type: 'village',
    importance: 0.14671826123445483,
    lat: '16.8816413',
    lon: '78.0057156',
    address: {
      village: 'Kondapur',
      state_district: 'Mahabubnagar',
      state: 'Telangana',
      country: 'India',
    },
  },
  {
    display_name: 'Kondapur, Mirdoddi mandal, Siddipet, Telangana, 502114, India',
    class: 'place',
    type: 'village',
    importance: 0.14670929045548176,
    lat: '18.1002527',
    lon: '78.7146592',
    address: {
      village: 'Kondapur',
      state_district: 'Siddipet',
      state: 'Telangana',
      country: 'India',
    },
  },
  {
    display_name: 'Kondapur, Nirmal Rural mandal, Nirmal, Telangana, 504016, India',
    class: 'place',
    type: 'village',
    importance: 0.14670903868162047,
    lat: '19.0873261',
    lon: '78.3819240',
    address: {
      village: 'Kondapur',
      state_district: 'Nirmal',
      state: 'Telangana',
      country: 'India',
    },
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

describe('classifyNameMatch', () => {
  it('is EXACT for identical strings', () => {
    expect(classifyNameMatch('Golconda Fort', 'Golconda Fort')).toBe('EXACT');
  });

  it('is EXACT once case, whitespace, and a leading honorific are normalized away', () => {
    expect(classifyNameMatch('meenakshi amman temple', 'Sri Meenakshi Amman Temple')).toBe('EXACT');
    expect(classifyNameMatch('  Golconda   Fort  ', 'Golconda Fort')).toBe('EXACT');
  });

  it('is TOKEN_MATCH when every significant query word is present but the candidate has extra words (Meenakshi Temple → Sri Meenakshi Amman Temple)', () => {
    expect(classifyNameMatch('Meenakshi Temple', 'Sri Meenakshi Amman Temple')).toBe('TOKEN_MATCH');
  });

  it('does not treat a shared generic category word alone as a match ("Temple" must not match every temple)', () => {
    expect(classifyNameMatch('Temple', 'Sri Meenakshi Amman Temple')).toBe('NONE');
    expect(classifyNameMatch('Meenakshi Temple', 'Red Fort')).toBe('NONE');
  });

  it('is PARTIAL when only some significant words overlap', () => {
    expect(classifyNameMatch('Meenakshi Amman Temple', 'Meenakshi Nagar Park')).toBe('PARTIAL');
  });

  it('does not strip a honorific-looking word if nothing follows it', () => {
    // "Sri" alone must not normalize to an empty string.
    expect(classifyNameMatch('Sri', 'Sri')).toBe('EXACT');
  });
});

// Real Nominatim address shape, trimmed to what evaluateCandidate reads.
function candidate(opts: {
  name: string;
  cls: string;
  type: string;
  importance: number;
  village?: string;
  city?: string;
  state_district?: string;
  state?: string;
}) {
  return {
    display_name: `${opts.name}, ${opts.city ?? opts.village ?? ''}, ${opts.state ?? ''}, India`,
    class: opts.cls,
    type: opts.type,
    importance: opts.importance,
    lat: '0',
    lon: '0',
    address: {
      village: opts.village,
      city: opts.city,
      state_district: opts.state_district,
      state: opts.state,
      country: 'India',
    },
  };
}

describe('resolveDestination', () => {
  it('Kondapur: still resolves to the Hyderabad suburb, unchanged from Phase 7 (settlement branch delegates to pickBest)', () => {
    const candidates = [
      candidate({
        name: 'Kondapur',
        cls: 'place',
        type: 'suburb',
        importance: 0.1467350293736171,
        city: 'Hyderabad',
        state_district: 'Hyderabad',
        state: 'Telangana',
      }),
      candidate({
        name: 'Kondapur',
        cls: 'place',
        type: 'village',
        importance: 0.14671826123445483,
        village: 'Kondapur',
        state_district: 'Mahabubnagar',
        state: 'Telangana',
      }),
      candidate({
        name: 'Kondapur',
        cls: 'place',
        type: 'village',
        importance: 0.14670929045548176,
        village: 'Kondapur',
        state_district: 'Siddipet',
        state: 'Telangana',
      }),
    ];
    const best = resolveDestination('Kondapur', candidates);
    expect(best.type).toBe('suburb');
    expect(best.address?.state_district).toBe('Hyderabad');
  });

  it('Ramappa Temple: throws — two genuine same-named temples, no reliable disambiguation signal (WRONG PLACE > NO PLACE)', () => {
    // Real captured importance values — a ~1.44x ratio, well inside noise.
    const candidates = [
      candidate({
        name: 'Ramappa Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.0000577,
        village: 'Lingamadugupally',
        state_district: 'Hanumakonda',
        state: 'Telangana',
      }),
      candidate({
        name: 'Ramappa Temple',
        cls: 'building',
        type: 'temple',
        importance: 0.00004,
        village: 'Palampet',
        state_district: 'Mulugu',
        state: 'Telangana',
      }),
    ];
    expect(() => resolveDestination('Ramappa Temple', candidates)).toThrow();
  });

  it('Ramappa Temple Palampet: query-supplied geographic context resolves it confidently', () => {
    const candidates = [
      candidate({
        name: 'Ramappa Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.0000577,
        village: 'Lingamadugupally',
        state_district: 'Hanumakonda',
        state: 'Telangana',
      }),
      candidate({
        name: 'Ramappa Temple',
        cls: 'building',
        type: 'temple',
        importance: 0.00004,
        village: 'Palampet',
        state_district: 'Mulugu',
        state: 'Telangana',
      }),
    ];
    const best = resolveDestination('Ramappa Temple Palampet', candidates);
    expect(best.address?.village).toBe('Palampet');
  });

  it("Meenakshi Temple: resolves to Madurai's real temple despite the honorific — an overwhelming importance gap crosses the tier the exact-but-unrelated namesakes sit at", () => {
    // Real captured values: Madurai's temple is ~6000x more important than
    // the exact-named Bengaluru namesakes.
    const candidates = [
      candidate({
        name: 'Meenakshi Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.00007094453345536,
        city: 'Bengaluru',
        state_district: 'Bengaluru Urban',
        state: 'Karnataka',
      }),
      candidate({
        name: 'meenakshi temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.00005115358205534474,
        city: 'Kadapa',
        state_district: 'Kadapa',
        state: 'Andhra Pradesh',
      }),
      candidate({
        name: 'Sri Meenakshi Amman Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.430238847278923,
        city: 'Madurai',
        state_district: 'Madurai',
        state: 'Tamil Nadu',
      }),
    ];
    const best = resolveDestination('Meenakshi Temple', candidates);
    expect(best.address?.city).toBe('Madurai');
  });

  it('Meenakshi Temple Madurai: geographic context alone (no importance gap needed) also resolves it correctly', () => {
    // A synthetic case where importance does NOT dominate — only the
    // query's own "Madurai" should decide this, proving context is used
    // independently of the importance-promotion path above.
    const candidates = [
      candidate({
        name: 'Meenakshi Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.05,
        city: 'Bengaluru',
        state_district: 'Bengaluru Urban',
        state: 'Karnataka',
      }),
      candidate({
        name: 'Sri Meenakshi Amman Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.05,
        city: 'Madurai',
        state_district: 'Madurai',
        state: 'Tamil Nadu',
      }),
    ];
    const best = resolveDestination('Meenakshi Temple Madurai', candidates);
    expect(best.address?.city).toBe('Madurai');
  });

  it('Central Park: several genuinely different same-named parks with close importance and no query context → ambiguous', () => {
    // Real captured values across four different states.
    const candidates = [
      candidate({
        name: 'Central Park',
        cls: 'leisure',
        type: 'park',
        importance: 0.09078915819201436,
        city: 'Panvel',
        state_district: 'Raigad',
        state: 'Maharashtra',
      }),
      candidate({
        name: 'Central park',
        cls: 'leisure',
        type: 'park',
        importance: 0.08007748149843592,
        city: 'Delhi',
        state_district: 'South West Delhi',
        state: 'Delhi',
      }),
      candidate({
        name: 'Central Park',
        cls: 'leisure',
        type: 'park',
        importance: 0.08007340428778513,
        city: 'Kolkata',
        state_district: 'Kolkata',
        state: 'West Bengal',
      }),
    ];
    expect(() => resolveDestination('Central Park', candidates)).toThrow();
  });

  it('a single genuine candidate always resolves without triggering ambiguity (misspelling fallback, e.g. Tirupathi → Dwaraka Tirumala)', () => {
    const candidates = [
      candidate({
        name: 'Dwaraka Tirumala',
        cls: 'place',
        type: 'village',
        importance: 0.3,
        village: 'Dwarakatirumala',
        state_district: 'Eluru',
        state: 'Andhra Pradesh',
      }),
    ];
    expect(resolveDestination('Tirupathi', candidates).display_name).toContain('Dwaraka');
  });

  it('Tirupathi (real multi-candidate case): the dramatically-more-important fuzzy match wins over low-importance candidates that merely CONTAIN the misspelled query as a substring', () => {
    // Regression fixture from real Nominatim data: "Dwaraka Tirumala" shares
    // ZERO tokens with "Tirupathi" (Tirumala != Tirupathi as strings) and so
    // scores NONE by this module's own name matching, while "Malekallu
    // Tirupathi" and "Tirupathi Cheruvu" (a lake) merely happen to contain
    // the literal word "Tirupathi" and so reached TOKEN_MATCH — a tier floor
    // on cross-tier promotion let those coincidental substring matches beat
    // the correct, ~2.5x-more-important fuzzy answer. Promotion must not
    // require a minimum tier on the outside candidate.
    const candidates = [
      candidate({
        name: 'Dwaraka Tirumala',
        cls: 'place',
        type: 'village',
        importance: 0.35974352801595927,
        village: 'Dwarakatirumala',
        state_district: 'Eluru',
        state: 'Andhra Pradesh',
      }),
      candidate({
        name: 'Malekallu Tirupathi',
        cls: 'place',
        type: 'village',
        importance: 0.1467130640115968,
        village: 'Malekallu Tirupathi',
        state_district: 'Hassan',
        state: 'Karnataka',
      }),
      candidate({
        name: 'Tirupathi Cheruvu',
        cls: 'natural',
        type: 'water',
        importance: 0.10670416800183105,
        village: 'Gangavaram',
        state_district: 'Koyyalagudem',
        state: 'Andhra Pradesh',
      }),
    ];
    expect(resolveDestination('Tirupathi', candidates).display_name).toContain('Dwaraka Tirumala');
  });

  it('a more specifically-named exact match wins outright over a same-place variant with extra words, no ambiguity', () => {
    const candidates = [
      candidate({
        name: 'Sri Meenakshi Amman Temple',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.43,
        city: 'Madurai',
        state_district: 'Madurai',
        state: 'Tamil Nadu',
      }),
      candidate({
        name: 'Sri Meenakshi Amman Temple complex',
        cls: 'amenity',
        type: 'place_of_worship',
        importance: 0.0000632,
        city: 'Madurai',
        state_district: 'Madurai',
        state: 'Tamil Nadu',
      }),
    ];
    // Different tiers (EXACT vs TOKEN_MATCH via the extra "complex" word) —
    // the exact one wins outright, no ambiguity.
    const best = resolveDestination('Sri Meenakshi Amman Temple', candidates);
    expect(best.display_name).toContain('Sri Meenakshi Amman Temple,');
  });

  it('two same-tier POI candidates in the SAME district/state are not treated as ambiguous, even with a close importance ratio', () => {
    // Two records for the same physical site (e.g. duplicate OSM mapping),
    // not two different places — the close importance ratio alone must not
    // trigger ambiguity when the location is identical.
    const candidates = [
      candidate({
        name: 'Example Fort',
        cls: 'historic',
        type: 'fort',
        importance: 0.02,
        city: 'Sampletown',
        state_district: 'Sample District',
        state: 'Karnataka',
      }),
      candidate({
        name: 'Example Fort',
        cls: 'tourism',
        type: 'attraction',
        importance: 0.019,
        city: 'Sampletown',
        state_district: 'Sample District',
        state: 'Karnataka',
      }),
    ];
    const best = resolveDestination('Example Fort', candidates);
    expect(best.importance).toBe(0.02);
  });
});

// ── geocodeLocation (Phase 9: typed GeocodeError + candidate surfacing) ────
//
// The pure sub-functions above are tested directly and don't touch the
// network; geocodeLocation itself does one live Nominatim fetch, so these
// tests mock `fetch` with real, previously-captured response shapes rather
// than hitting the network — deterministic, and proves the actual public
// function (not just its internals) classifies each outcome correctly.

function mockFetchResponse(response: { ok: boolean; status?: number; body?: unknown }) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: response.ok,
      status: response.status ?? (response.ok ? 200 : 500),
      json: () => Promise.resolve(response.body ?? []),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('geocodeLocation', () => {
  it('Kondapur: resolves to a normal GeocodeResult (the Hyderabad suburb)', async () => {
    mockFetchResponse({ ok: true, body: KONDAPUR_CANDIDATES });
    const result = await geocodeLocation('Kondapur');
    expect(result.location?.locality).toBe('Kondapur');
    expect(result.location?.state).toBe('Telangana');
    expect(typeof result.lat).toBe('number');
    expect(typeof result.lon).toBe('number');
  });

  it('Ramappa Temple: throws GeocodeError("ambiguous") carrying 2+ UI-safe candidates, never raw provider data', async () => {
    const ramappaRaw = [
      {
        display_name:
          'Ramappa Temple, Ramappa Temple way, Lingamadugupally, Atmakur mandal, Hanumakonda, Telangana, 506342, India',
        class: 'amenity',
        type: 'place_of_worship',
        importance: 0.0000577,
        lat: '18.0201620',
        lon: '79.7187564',
        address: {
          village: 'Lingamadugupally',
          state_district: 'Hanumakonda',
          state: 'Telangana',
          country: 'India',
        },
      },
      {
        display_name:
          'Ramappa Temple, Ramappa Temple Rd, Palampet, Venkatapur mandal, Mulugu, Telangana, India',
        class: 'building',
        type: 'temple',
        importance: 0.00004,
        lat: '18.2593042',
        lon: '79.9432497',
        address: {
          village: 'Palampet',
          state_district: 'Mulugu',
          state: 'Telangana',
          country: 'India',
        },
      },
    ];
    mockFetchResponse({ ok: true, body: ramappaRaw });
    const err = await geocodeLocation('Ramappa Temple').catch((e: unknown) => e);

    expect(err).toBeInstanceOf(GeocodeError);
    const geocodeErr = err as GeocodeError;
    expect(geocodeErr.kind).toBe('ambiguous');
    expect(geocodeErr.candidates).toHaveLength(2);
    // UI-safe shape only — a candidate a picker could render directly, and
    // exactly what handleSelectCandidate needs to drive the coordinate-based
    // Nearby path (lat/lon + name + optional locality/district/state/country).
    for (const c of geocodeErr.candidates!) {
      expect(c.name).toBe('Ramappa Temple');
      expect(typeof c.lat).toBe('number');
      expect(typeof c.lon).toBe('number');
      // Never raw provider internals.
      expect(c).not.toHaveProperty('class');
      expect(c).not.toHaveProperty('type');
      expect(c).not.toHaveProperty('importance');
      expect(c).not.toHaveProperty('tier');
    }
    const districts = geocodeErr.candidates!.map((c) => c.district);
    expect(districts).toEqual(expect.arrayContaining(['Hanumakonda', 'Mulugu']));
  });

  it('Paris: rejected as not_found — every exact-named Indian "Paris" is a shop/hotel/restaurant, never a genuine destination', async () => {
    // Real Nominatim data (countrycodes=in) for "Paris" — confirms the code's
    // own comment: it resolves to a tailor shop, a shoe shop, a hotel, a
    // restaurant, a bus stop… never a genuine place/boundary/tourism-
    // attraction destination. Rejection here is the exactNamed legitimacy
    // gate, NOT the upfront hasForeignContext veto — that veto only lists
    // foreign COUNTRY names (see the next test), not foreign city names, so
    // "Paris" specifically depends on this downstream gate.
    mockFetchResponse({
      ok: true,
      body: [
        {
          display_name: "Paris, King's Circle, Mumbai, India",
          class: 'shop',
          type: 'tailor',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
        {
          display_name: 'Paris, Station Road, India',
          class: 'shop',
          type: 'shoes',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
        {
          display_name: 'paris, Logans Road, India',
          class: 'tourism',
          type: 'hotel',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
        {
          display_name: 'Paris, Guruvayur Road, India',
          class: 'highway',
          type: 'bus_stop',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
        {
          display_name: 'paris, Kannur Highway, India',
          class: 'amenity',
          type: 'restaurant',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
        {
          display_name: 'Park Paris Town, Golden Avenue, India',
          class: 'leisure',
          type: 'park',
          importance: 0.1,
          lat: '19',
          lon: '72',
        },
      ],
    });
    const err = await geocodeLocation('Paris').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeocodeError);
    expect((err as GeocodeError).kind).toBe('not_found');
  });

  it('France (an actual foreign country name): rejected before any network request — the upfront hasForeignContext veto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => {
        throw new Error('fetch should not be called for a foreign-vetoed query');
      }),
    );
    const err = await geocodeLocation('France').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeocodeError);
    expect((err as GeocodeError).kind).toBe('not_found');
  });

  it('no results at all: remains GeocodeError("not_found")', async () => {
    mockFetchResponse({ ok: true, body: [] });
    const err = await geocodeLocation('Xyzzynotarealplace').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeocodeError);
    expect((err as GeocodeError).kind).toBe('not_found');
  });

  it('provider failure (non-2xx response): GeocodeError("unavailable"), never "not found"', async () => {
    mockFetchResponse({ ok: false, status: 503 });
    const err = await geocodeLocation('Hyderabad').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeocodeError);
    expect((err as GeocodeError).kind).toBe('unavailable');
  });

  it('provider failure (network/timeout error): GeocodeError("unavailable"), never "not found"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new DOMException('The operation timed out.', 'TimeoutError')),
    );
    const err = await geocodeLocation('Hyderabad').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(GeocodeError);
    expect((err as GeocodeError).kind).toBe('unavailable');
  });
});
