import type { PlaceCategory } from '../types';

export interface ParsedSearchQuery {
  /** The location text to geocode, or '' when useCurrentLocation is true and no location was named. */
  location: string;
  /** A category the query seems to be asking about, e.g. "restaurants near X" → 'restaurants'. Null if none matched. */
  categoryIntent: PlaceCategory | null;
  /** True when the query ends in "near me" / "close to me" / "around me". */
  useCurrentLocation: boolean;
}

// Deterministic keyword → category lookup. Intentionally simple: a plain
// substring/word match, not real NLP. Multiple phrasings map to the same
// PlaceCategory used by the existing Geoapify category taxonomy.
const CATEGORY_KEYWORDS: Array<{ pattern: RegExp; category: PlaceCategory }> = [
  { pattern: /\b(restaurants?|food|dining|eat(?:ing)?|cafes?|coffee)\b/i, category: 'restaurants' },
  { pattern: /\b(hotels?|stays?|accommodations?|lodging)\b/i, category: 'hotels' },
  { pattern: /\b(hospitals?|clinics?)\b/i, category: 'hospitals' },
  { pattern: /\b(pharmac(?:y|ies)|chemists?|medicines?)\b/i, category: 'pharmacies' },
  { pattern: /\b(atms?|banks?)\b/i, category: 'atms' },
  { pattern: /\b(fuel|petrol|gas station)\b/i, category: 'fuel' },
  { pattern: /\b(shopping|malls?|markets?|stores?)\b/i, category: 'shopping' },
  { pattern: /\b(parks?)\b/i, category: 'parks' },
  {
    pattern: /\b(attractions?|things to do|places to visit|sightseeing|tourist spots?)\b/i,
    category: 'attractions',
  },
];

function matchCategory(phrase: string): PlaceCategory | null {
  const trimmed = phrase.trim();
  if (!trimmed) return null;
  for (const { pattern, category } of CATEGORY_KEYWORDS) {
    if (pattern.test(trimmed)) return category;
  }
  return null;
}

const NEAR_ME_RE = /^(.*?)\s*(?:near|close to|around)\s+me\s*$/i;
const CATEGORY_LOCATION_RE = /^(.*?)\s+(?:near|in|at|around)\s+(.+)$/i;

// Parses queries like "restaurants near Kondapur" or "hotels near me" into a
// category intent and a location to geocode. Never throws — a query that
// doesn't match any known pattern falls back to `{ location: rawQuery,
// categoryIntent: null, useCurrentLocation: false }`, i.e. exactly today's
// behavior (the whole string is geocoded as-is).
export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  const trimmed = rawQuery.trim();

  const nearMeMatch = trimmed.match(NEAR_ME_RE);
  if (nearMeMatch) {
    return {
      location: '',
      categoryIntent: matchCategory(nearMeMatch[1]),
      useCurrentLocation: true,
    };
  }

  const categoryLocationMatch = trimmed.match(CATEGORY_LOCATION_RE);
  if (categoryLocationMatch) {
    const [, categoryPhrase, locationPhrase] = categoryLocationMatch;
    const categoryIntent = matchCategory(categoryPhrase);
    // Only treat this as "category + location" if the leading phrase is a
    // recognised category — otherwise "Hotel California in Kondapur" would
    // wrongly get split. If unrecognised, fall through to the plain case.
    if (categoryIntent && locationPhrase.trim()) {
      return { location: locationPhrase.trim(), categoryIntent, useCurrentLocation: false };
    }
  }

  return { location: trimmed, categoryIntent: null, useCurrentLocation: false };
}
