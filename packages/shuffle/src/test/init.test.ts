import { describe, expect } from 'vitest';

import { test } from './test-utils';
import Shuffle from '../shuffle';

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
    const first = fixture.firstElementChild as HTMLElement;

    instance.value = new Shuffle(fixture, { sizer: first });
    expect(instance.value.sizer).toBe(first);

    instance.value = new Shuffle(fixture, { sizer: '#item1' });
    expect(instance.value.sizer).toBe(first);

    instance.value = new Shuffle(fixture, { sizer: '#hello-world' });
    expect(instance.value.sizer).toBeNull();

    instance.value = new Shuffle(fixture, { sizer: null });
    expect(instance.value.sizer).toBeNull();

    // @ts-expect-error not an allowed type.
    instance.value = new Shuffle(fixture, { sizer: () => first });
    expect(instance.value.sizer).toBeNull();
  });
});
