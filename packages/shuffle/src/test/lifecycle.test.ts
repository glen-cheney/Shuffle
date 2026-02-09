import { describe, expect, vi } from 'vitest';

import Shuffle from '../shuffle';
import { test, childrenToArray, createResizeObserverEntry } from './test-utils';

describe('shuffle lifecycle', () => {
  test('should destroy properly', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    instance.value.destroy();

    expect(instance.value.element).toBeNull();
    expect(instance.value.items).toHaveLength(0);
    expect(instance.value.options.sizer).toBeNull();
    expect(instance.value.isDestroyed).toBe(true);

    expect(fixture.classList.contains('shuffle')).toBe(false);

    for (const child of childrenToArray(fixture)) {
      expect(child.classList.contains('shuffle-item')).toBe(false);
      expect(child.classList.contains('shuffle-item--visible')).toBe(false);
      expect(child.classList.contains('shuffle-item--hidden')).toBe(false);
    }
  });

  test('should not update or shuffle when disabled or destroyed', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    const update = vi.spyOn(instance.value, 'update');
    const _filter = vi.spyOn(instance.value, '_filter');

    instance.value.disable();

    instance.value.filter('design');

    expect(_filter).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    instance.value.enable(false);

    instance.value.destroy();
    instance.value._handleResizeCallback([createResizeObserverEntry(instance.value.containerWidth + 1)]);
    expect(update).not.toHaveBeenCalled();
  });

  test('should not update when the container is the same size', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    const update = vi.spyOn(instance.value, 'update');

    instance.value._handleResizeCallback([createResizeObserverEntry(instance.value.containerWidth)]);

    expect(update).not.toHaveBeenCalled();
  });

  test('should update when the container is a different', async ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    const update = vi.spyOn(instance.value, 'update');

    instance.value._handleResizeCallback([createResizeObserverEntry(instance.value.containerWidth + 1)]);

    await vi.waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });
});
