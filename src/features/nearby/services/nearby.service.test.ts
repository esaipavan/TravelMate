import { describe, it, expect } from 'vitest';
import { resolveCategory, buildPlaceLocationHierarchy, parseWikipediaHint } from './nearby.service';

describe('resolveCategory', () => {
  it('maps a park before a more general tourism tag', () => {
    expect(resolveCategory(['leisure.park', 'tourism'])).toBe('parks');
  });

  it('maps tourism.attraction to attractions', () => {
    expect(resolveCategory(['tourism.attraction'])).toBe('attractions');
  });

  it('maps a museum (entertainment.*) to attractions', () => {
    expect(resolveCategory(['entertainment.museum'])).toBe('attractions');
  });

  it('does not mislabel a pharmacy as generic shopping (Apollo pharmacy bug)', () => {
    expect(resolveCategory(['commercial', 'commercial.chemist', 'healthcare.pharmacy'])).toBe(
      'pharmacies',
    );
  });

  it('falls back to shopping only for genuinely commercial-only tags', () => {
    expect(resolveCategory(['commercial', 'commercial.marketplace'])).toBe('shopping');
  });

  it('prefers hospital over clinic when both tags are present', () => {
    expect(resolveCategory(['healthcare.clinic_or_praxis', 'healthcare.hospital'])).toBe(
      'hospitals',
    );
  });

  it('returns null for a category with no mapping', () => {
    expect(resolveCategory(['natural.water'])).toBeNull();
  });

  it('returns null for an empty category list', () => {
    expect(resolveCategory([])).toBeNull();
  });
});

describe('buildPlaceLocationHierarchy', () => {
  it('prefers suburb over city as the locality (landmark vs containing city)', () => {
    expect(
      buildPlaceLocationHierarchy({
        city: 'Hyderabad',
        suburb: 'Golconda',
        state_district: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
      }),
    ).toEqual({
      locality: 'Golconda',
      district: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
    });
  });

  it('falls back to neighbourhood, then city, when suburb is absent', () => {
    expect(buildPlaceLocationHierarchy({ neighbourhood: 'Kondapur', city: 'Hyderabad' })).toEqual({
      locality: 'Kondapur',
      district: undefined,
      state: undefined,
      country: undefined,
    });
    expect(buildPlaceLocationHierarchy({ city: 'Mangalagiri' })).toEqual({
      locality: 'Mangalagiri',
      district: undefined,
      state: undefined,
      country: undefined,
    });
  });

  it('returns undefined when Geoapify supplied no structured address fields at all', () => {
    expect(buildPlaceLocationHierarchy({})).toBeUndefined();
  });
});

describe('parseWikipediaHint', () => {
  it('extracts the title from an English-language hint', () => {
    expect(parseWikipediaHint({ wikipedia: 'en:Golconda Fort' })).toBe('Golconda Fort');
  });

  it('preserves colons that are part of the title itself', () => {
    expect(parseWikipediaHint({ wikipedia: 'en:Ramoji Film City: Studio Tour' })).toBe(
      'Ramoji Film City: Studio Tour',
    );
  });

  it('ignores a non-English-language hint rather than guessing', () => {
    expect(parseWikipediaHint({ wikipedia: 'te:గోల్కొండ కోట' })).toBeUndefined();
  });

  it('returns undefined when no hint is present', () => {
    expect(parseWikipediaHint(undefined)).toBeUndefined();
    expect(parseWikipediaHint({})).toBeUndefined();
  });
});
