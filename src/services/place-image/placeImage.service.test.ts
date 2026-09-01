import { describe, it, expect } from 'vitest';
import {
  isUsablePhoto,
  isTitleRelevant,
  toAbsoluteUrl,
  isInIndia,
  mentionsIndia,
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
