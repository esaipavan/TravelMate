import { describe, it, expect } from 'vitest';
import { applyAIGuardrail, deriveCategoryLabel } from './explore.service';

// This is the guardrail that keeps AI curation safe: it may only select and
// describe places that are already in the real (Geoapify) result set — never
// invent new ones. See the sibling AI feature
// (destination-intel/services/ai-destination.provider.ts), fully disabled
// after doing exactly that.
describe('applyAIGuardrail', () => {
  const validIds = new Set(['real-1', 'real-2', 'real-3']);

  it('keeps blurbs for ids that are in the real result set', () => {
    const result = applyAIGuardrail(
      [
        { id: 'real-1', blurb: 'A real place.' },
        { id: 'real-2', blurb: 'Another real place.' },
      ],
      validIds,
    );
    expect(result.get('real-1')).toBe('A real place.');
    expect(result.get('real-2')).toBe('Another real place.');
    expect(result.size).toBe(2);
  });

  it('drops any id the AI returned that is NOT in the real result set — never invented', () => {
    const result = applyAIGuardrail(
      [
        { id: 'real-1', blurb: 'A real place.' },
        { id: 'hallucinated-place', blurb: 'A place that does not exist in the source list.' },
      ],
      validIds,
    );
    expect(result.has('hallucinated-place')).toBe(false);
    expect(result.size).toBe(1);
  });

  it('drops everything when the AI returns only invented ids', () => {
    const result = applyAIGuardrail([{ id: 'made-up', blurb: 'Not real.' }], validIds);
    expect(result.size).toBe(0);
  });

  it('keeps only the first blurb for a duplicate id', () => {
    const result = applyAIGuardrail(
      [
        { id: 'real-1', blurb: 'First.' },
        { id: 'real-1', blurb: 'Second.' },
      ],
      validIds,
    );
    expect(result.get('real-1')).toBe('First.');
    expect(result.size).toBe(1);
  });
});

describe('deriveCategoryLabel', () => {
  it('picks the most specific matching label', () => {
    expect(deriveCategoryLabel(['tourism', 'tourism.sights', 'tourism.sights.fort'])).toBe('Fort');
  });

  it('falls back to a generic heritage label for a bare tourism.sights tag', () => {
    expect(deriveCategoryLabel(['tourism.sights'])).toBe('Heritage');
  });

  it('maps entertainment/leisure/natural categories', () => {
    expect(deriveCategoryLabel(['entertainment.museum'])).toBe('Museum');
    expect(deriveCategoryLabel(['leisure.park'])).toBe('Park');
    expect(deriveCategoryLabel(['natural'])).toBe('Nature');
  });

  it('defaults to Attraction when nothing matches or categories are missing', () => {
    expect(deriveCategoryLabel(undefined)).toBe('Attraction');
    expect(deriveCategoryLabel([])).toBe('Attraction');
    expect(deriveCategoryLabel(['some.unknown.tag'])).toBe('Attraction');
  });
});
