import { describe, expect } from 'vitest';

import Shuffle from '../shuffle';
import { test } from './test-utils';

describe('shuffle init', () => {
  test('should have default options', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    expect(instance.value.items.length).toBe(10);
    expect(instance.value.visibleItems).toBe(10);
    expect(instance.value.sortedItems).toHaveLength(10);
    expect(instance.value.options.group).toBe('all');
    expect(instance.value.options.speed).toBe(250);
    expect(instance.value.options.itemSelector).toBe('*');
    expect(instance.value.options.sizer).toBeNull();
    expect(instance.value.options.columnWidth).toBe(0);
    expect(instance.value.options.gutterWidth).toBe(0);
    expect(instance.value.options.delimiter).toBeNull();
    expect(instance.value.options.initialSort).toBeNull();
    expect(instance.value.id).toBe('shuffle_0');

    expect(instance.value.isInitialized).toBe(true);
  });

  test('should add classes and default styles', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    expect(instance.value.element.classList.contains('shuffle')).toBe(true);

    const styles = globalThis.getComputedStyle(instance.value.element, null);
    // Will have `position:relative` in a real browser (not JSDom).
    expect(styles.overflow).toBe('hidden');
    // Will have a `containerWidth` > 0 in a real browser (not JSDom).
    for (const { element, isVisible, scale, point } of instance.value.items) {
      expect(element.classList.contains('shuffle-item')).toBe(true);
      expect(element.classList.contains('shuffle-item--visible')).toBe(true);
      expect(element.style.opacity).toBeDefined();
      expect(element.style.position).toBe('absolute');
      expect(element.style.visibility).toBe('visible');
      expect(isVisible).toBe(true);
      expect(scale).toBe(Shuffle.ShuffleItem.Scale.VISIBLE);
      expect(point.x).toBeDefined();
      expect(point.y).toBeDefined();
    }
  });

  test('can get an element option', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    const first = fixture.firstElementChild;

    expect(instance.value._getElementOption(first)).toBe(first);
    expect(instance.value._getElementOption('#item1')).toBe(first);
    expect(instance.value._getElementOption('#hello-world')).toBeNull();
    expect(instance.value._getElementOption(null)).toBeNull();
    expect(instance.value._getElementOption()).toBeNull();
    // @ts-expect-error not an allowed type.
    expect(instance.value._getElementOption(() => first)).toBeNull();
  });
});
