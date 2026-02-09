import { describe, expect } from 'vitest';

import { test } from './test-utils';
import Shuffle from '../shuffle';

describe('shuffle custom styles', () => {
  const original = Shuffle.ShuffleItem.Css;

  test.afterEach(() => {
    Shuffle.ShuffleItem.Css = original;
  });

  test('will apply before and after styles even if the item will not move', ({ fixture, instance }) => {
    Shuffle.ShuffleItem.Css.INITIAL.opacity = 0;
    instance.value = new Shuffle(fixture, { speed: 0 });

    // The layout method will have already set styles to their 'after' states
    // upon initialization. Reset them here.
    for (const item of instance.value.items) {
      item.applyCss(Shuffle.ShuffleItem.Css.INITIAL);
    }

    for (const { element } of instance.value.items) {
      expect(element.style.opacity).toBe('0');
    }

    instance.value.update();

    for (const { element } of instance.value.items) {
      expect(element.style.opacity).toBe('1');
    }
  });
});
