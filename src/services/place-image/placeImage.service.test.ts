import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  isUsablePhoto,
  isTitleRelevant,
  toAbsoluteUrl,
  isInIndia,
  mentionsIndia,
  fetchPlaceImage,
} from './placeImage.service';

describe('isUsablePhoto', () => {
  it('accepts an ordinary photo URL', () => {
    expect(isUsablePhoto('https://upload.wikimedia.org/wikipedia/commons/Golconda_Fort.jpg')).toBe(
      true,
    );
  });

  it('rejects an SVG (locator maps/flags/seals are always SVG)', () => {
    expect(isUsablePhoto('https://upload.wikimedia.org/wikipedia/commons/India_locator.svg')).toBe(
      false,
    );
  });

  it('rejects filenames indicating a non-photo asset', () => {
    expect(isUsablePhoto('https://upload.wikimedia.org/.../Telangana_locator_map.png')).toBe(false);
    expect(isUsablePhoto('https://upload.wikimedia.org/.../State_emblem_of_India.png')).toBe(false);
    expect(isUsablePhoto('https://upload.wikimedia.org/.../Flag_of_Telangana.png')).toBe(false);
    expect(isUsablePhoto('https://upload.wikimedia.org/.../Coat_of_arms.png')).toBe(false);
  });
});

describe('isTitleRelevant', () => {
  it('accepts a filename sharing a distinctive word with the place name', () => {
    expect(isTitleRelevant('Golconda_Fort_gate.jpg', 'Golconda Fort')).toBe(true);
  });

  it('rejects a filename with no distinctive word in common', () => {
    expect(isTitleRelevant('Charminar_night_view.jpg', 'Golconda Fort')).toBe(false);
  });

  it('ignores generic shared words like "temple" or "fort" when judging relevance', () => {
    // Both are forts, but different ones — sharing only the generic word
    // "fort" must not be treated as relevant.
    expect(isTitleRelevant('Red_Fort_Delhi.jpg', 'Golconda Fort')).toBe(false);
  });

  it('accepts anything when the place name has no distinctive words to compare', () => {
    expect(isTitleRelevant('some_file.jpg', 'Fort')).toBe(true);
  });
});

describe('toAbsoluteUrl', () => {
  it('prefixes a protocol-relative URL with https', () => {
    expect(toAbsoluteUrl('//upload.wikimedia.org/x.jpg')).toBe(
      'https://upload.wikimedia.org/x.jpg',
    );
  });

  it('leaves an already-absolute URL untouched', () => {
    expect(toAbsoluteUrl('https://upload.wikimedia.org/x.jpg')).toBe(
      'https://upload.wikimedia.org/x.jpg',
    );
  });
});

describe('isInIndia', () => {
  it('accepts coordinates for Golconda Fort, Hyderabad', () => {
    expect(isInIndia(17.3833, 78.4011)).toBe(true);
  });

  it('rejects coordinates well outside the Indian bounding box', () => {
    expect(isInIndia(51.5074, -0.1278)).toBe(false); // London
  });
});

describe('mentionsIndia', () => {
  it('accepts a summary whose description names India', () => {
    expect(mentionsIndia({ description: 'A fort in Hyderabad, India' })).toBe(true);
  });

  it('accepts a summary whose extract names India even if description does not', () => {
    expect(mentionsIndia({ description: 'A fort', extract: 'Located in Telangana, India.' })).toBe(
      true,
    );
  });

  it('rejects a summary that never mentions India', () => {
    expect(mentionsIndia({ description: 'A castle in Scotland' })).toBe(false);
  });
});

// ── resolveVerifiedArticle's coordinate-less fallback (via fetchPlaceImage) ─
//
// Tested through the public fetchPlaceImage, same convention geocode.test.ts
// uses for geocodeLocation — real captured API response shapes, not
// reimplemented ones, mocked at the fetch boundary.

function mockWikiSearchThenSummary(title: string, summary: Record<string, unknown>) {
  const fetchMock = vi.fn();
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve({ query: { search: [{ title }] } }),
  });
  fetchMock.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(summary),
  });
  vi.stubGlobal('fetch', fetchMock);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('resolveVerifiedArticle (coordinate-less fallback, via fetchPlaceImage)', () => {
  it('Warangal Fort: resolves the image even though the real article has no coordinates, because the title genuinely matches the query — regression for a live-confirmed false rejection', () => {
    // Real captured response shape (Wikipedia REST summary API, live —
    // confirmed this article has type "standard", an image, and no
    // `coordinates` field at all): a UNESCO-tentative-list heritage site
    // whose own Wikipedia infobox simply lacks geo-coordinates metadata.
    mockWikiSearchThenSummary('Warangal Fort', {
      type: 'standard',
      title: 'Warangal Fort',
      description: 'Building in Telangana, India',
      extract: 'Warangal Fort is located in Warangal District, Telangana, India.',
      originalimage: {
        source:
          'https://upload.wikimedia.org/wikipedia/commons/c/c3/Shiv_Linga_at_Warangal_Fort_Complex.jpg',
      },
      // no `coordinates` field — this is the exact real-world gap.
    });

    return fetchPlaceImage('Warangal Fort').then((url) => {
      expect(url).toBe(
        'https://upload.wikimedia.org/wikipedia/commons/c/c3/Shiv_Linga_at_Warangal_Fort_Complex.jpg',
      );
    });
  });

  it('a coordinate-less article whose title has NOTHING to do with the query is still rejected — the fallback re-verifies by name, it does not relax verification', () => {
    // Same shape as above (standard, India-mentioning, no coordinates,
    // has an image) but the resolved title shares no word with the query —
    // proves losing the coordinates signal does not mean losing all
    // verification.
    mockWikiSearchThenSummary('Completely Unrelated Topic', {
      type: 'standard',
      title: 'Completely Unrelated Topic',
      description: 'Something in Maharashtra, India',
      extract: 'This is located in Maharashtra, India.',
      originalimage: { source: 'https://upload.wikimedia.org/wikipedia/commons/unrelated.jpg' },
    });

    return fetchPlaceImage('Warangal Fort').then((url) => {
      expect(url).toBeNull();
    });
  });

  it('a coordinate-less article is still rejected on the OTHER existing gates (non-standard type) — the new fallback only replaces the coordinates check, not the rest', () => {
    mockWikiSearchThenSummary('Warangal Fort (disambiguation)', {
      type: 'disambiguation',
      title: 'Warangal Fort (disambiguation)',
      description: 'A disambiguation page',
    });

    return fetchPlaceImage('Warangal Fort').then((url) => {
      expect(url).toBeNull();
    });
  });
});
