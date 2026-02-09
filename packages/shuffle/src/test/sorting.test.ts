import { describe, expect } from 'vitest';

import Shuffle, { type SortOptions } from '../shuffle';
import { test } from './test-utils';

describe('shuffle sorting', () => {
  test('can initialize sorted', ({ fixture, instance }) => {
    const sortObj: SortOptions = {
      by(element) {
        return Number.parseInt(element.dataset.age!, 10);
      },
    };

    instance.value = new Shuffle(fixture, {
      speed: 40,
      initialSort: sortObj,
    });

    expect(instance.value.lastSort).toEqual(sortObj);
  });

  test('will maintain the last sort object', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    const initialSort = instance.value.lastSort;

    instance.value.sort();
    expect(instance.value.lastSort).toEqual(initialSort);

    instance.value.sort({ key: 'id' });
    expect(instance.value.lastSort).toEqual({ key: 'id' });

    instance.value.sort();
    expect(instance.value.lastSort).toEqual({ key: 'id' });
  });

  test('tracks sorted items', ({ fixture, instance }) => {
    instance.value = new Shuffle(fixture);
    expect(instance.value.sortedItems.map((item) => item.element.id)).toEqual([
      'item1',
      'item2',
      'item3',
      'item4',
      'item5',
      'item6',
      'item7',
      'item8',
      'item9',
      'item10',
    ]);

    instance.value.sort({
      reverse: true,
    });

    expect(instance.value.sortedItems.map((item) => item.element.id)).toEqual([
      'item10',
      'item9',
      'item8',
      'item7',
      'item6',
      'item5',
      'item4',
      'item3',
      'item2',
      'item1',
    ]);
  });
});
