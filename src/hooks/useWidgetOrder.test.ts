import { describe, it, expect } from 'vitest';
import { mergeWidgetOrder } from './useWidgetOrder';
import { toggleHiddenId } from '@/store/widgetLayout.store';

describe('mergeWidgetOrder', () => {
  it('preserves the saved order when it already matches the default set', () => {
    expect(mergeWidgetOrder(['b', 'a', 'c'], ['a', 'b', 'c'])).toEqual(['b', 'a', 'c']);
  });

  it('appends a widget id present in defaultOrder but missing from savedOrder — a widget added in a later release never vanishes', () => {
    expect(mergeWidgetOrder(['a', 'c'], ['a', 'b', 'c'])).toEqual(['a', 'c', 'b']);
  });

  it('drops a saved id no longer present in defaultOrder — a widget since removed from the app', () => {
    expect(mergeWidgetOrder(['a', 'removed', 'b'], ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('returns the full default order, in order, when nothing has been saved yet', () => {
    expect(mergeWidgetOrder([], ['x', 'y', 'z'])).toEqual(['x', 'y', 'z']);
  });
});

describe('toggleHiddenId', () => {
  it('adds an id that is not yet hidden', () => {
    expect(toggleHiddenId([], 'widget-a')).toEqual(['widget-a']);
    expect(toggleHiddenId(['widget-b'], 'widget-a')).toEqual(['widget-b', 'widget-a']);
  });

  it('removes an id that is already hidden — a full round trip returns to the original list', () => {
    const hidden = toggleHiddenId([], 'widget-a');
    expect(toggleHiddenId(hidden, 'widget-a')).toEqual([]);
  });

  it('only affects the targeted id, leaving others untouched', () => {
    expect(toggleHiddenId(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });
});
