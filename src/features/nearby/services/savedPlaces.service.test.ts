import { describe, it, expect } from 'vitest';
import { toSavedPlace } from './savedPlaces.service';
import type { SavedPlaceRow } from './savedPlaces.service';

function row(overrides: Partial<SavedPlaceRow> = {}): SavedPlaceRow {
  return {
    id: 'row-1',
    place_id: 'place-1',
    name: 'Eagle Park',
    category: 'parks',
    address: null,
    latitude: 16.4318,
    longitude: 80.5688,
    locality: null,
    district: null,
    state: null,
    country: null,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('toSavedPlace', () => {
  it('maps every column to its SavedPlace field', () => {
    const result = toSavedPlace(
      row({
        address: 'Main Road, Mangalagiri',
        locality: 'Mangalagiri',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        country: 'India',
      }),
    );
    expect(result).toEqual({
      id: 'row-1',
      placeId: 'place-1',
      name: 'Eagle Park',
      category: 'parks',
      address: 'Main Road, Mangalagiri',
      lat: 16.4318,
      lon: 80.5688,
      locationDetail: {
        locality: 'Mangalagiri',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        country: 'India',
      },
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  it('omits locationDetail entirely when every hierarchy column is null (never a bogus empty object)', () => {
    const result = toSavedPlace(row());
    expect(result.locationDetail).toBeUndefined();
  });

  it('builds locationDetail from a single present hierarchy column (e.g. only country known)', () => {
    const result = toSavedPlace(row({ country: 'India' }));
    expect(result.locationDetail).toEqual({
      locality: undefined,
      district: undefined,
      state: undefined,
      country: 'India',
    });
  });

  it('preserves a null address as null, not an empty string', () => {
    const result = toSavedPlace(row({ address: null }));
    expect(result.address).toBeNull();
  });
});
