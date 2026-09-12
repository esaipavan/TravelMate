import { describe, it, expect } from 'vitest';
import { classifyScope, extractLocationQuery } from './exploreGeocode';

// Thresholds verified live against Nominatim (see exploreGeocode.ts comment):
// India → addresstype 'country', place_rank 4
// Andhra Pradesh / Telangana → addresstype 'state', place_rank 8
// Guntur district → addresstype 'state_district', place_rank 10
// Hyderabad → addresstype 'city', place_rank 16
describe('classifyScope', () => {
  it('classifies a country result', () => {
    expect(classifyScope('country', 4)).toBe('country');
  });

  it('classifies a state result', () => {
    expect(classifyScope('state', 8)).toBe('state');
  });

  it('classifies a district result via addresstype', () => {
    expect(classifyScope('state_district', 10)).toBe('district');
  });

  it('classifies a district result via county addresstype', () => {
    expect(classifyScope('county', 10)).toBe('district');
  });

  it('falls back to place_rank when addresstype is missing', () => {
    expect(classifyScope(undefined, 8)).toBe('state');
    expect(classifyScope(undefined, 4)).toBe('country');
    expect(classifyScope(undefined, 10)).toBe('district');
  });

  it('classifies anything else (city/town/village) as city', () => {
    expect(classifyScope('city', 16)).toBe('city');
    expect(classifyScope('village', 19)).toBe('city');
    expect(classifyScope(undefined, undefined)).toBe('city');
  });
});

describe('extractLocationQuery', () => {
  it('strips a "places to visit in X" phrase down to X', () => {
    expect(extractLocationQuery('places to visit in India')).toBe('India');
    expect(extractLocationQuery('places to visit in Andhra Pradesh')).toBe('Andhra Pradesh');
  });

  it('strips variant phrasings', () => {
    expect(extractLocationQuery('things to do in Hyderabad')).toBe('Hyderabad');
    expect(extractLocationQuery('top places in Vizag')).toBe('Vizag');
    expect(extractLocationQuery('best spots to explore near Goa')).toBe('Goa');
  });

  it('is case-insensitive', () => {
    expect(extractLocationQuery('Places To Visit In Telangana')).toBe('Telangana');
  });

  it('falls back to the whole trimmed query when no phrase matches', () => {
    expect(extractLocationQuery('Telangana')).toBe('Telangana');
    expect(extractLocationQuery('  Hyderabad  ')).toBe('Hyderabad');
  });
});
