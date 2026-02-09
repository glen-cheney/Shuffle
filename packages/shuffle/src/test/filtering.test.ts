import { describe, expect } from 'vitest';

import { test, createTest, getById, toHtmlElement } from './test-utils';
import Shuffle from '../shuffle';

describe('shuffle filtering', () => {
  describe('regular fixture', () => {
    test('can filter by the data attribute', ({ fixture, instance }) =>
      new Promise<void>((resolve) => {
        instance.value = new Shuffle(fixture, {
          speed: 0,
        });

        function second() {
          expect(instance.value!.visibleItems).toBe(3);
          const hidden = [3, 4, 5, 6, 7, 8, 10].map((num) => getById(`item${num}`)!);

          const visible = [1, 2, 9].map((num) => getById(`item${num}`)!);

          for (const element of hidden) {
            expect(element.classList.contains(Shuffle.Classes.HIDDEN)).toBe(true);
            expect(element.style.visibility).toBe('hidden');
          }

          for (const element of visible) {
            expect(element.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);
            expect(element.style.visibility).toBe('visible');
          }

          instance.value!.once(Shuffle.EventType.LAYOUT, third);

          // Filter by green.
          instance.value!.filter('green');
        }

        function third() {
          expect(instance.value!.visibleItems).toBe(2);
          const hidden = [1, 2, 5, 6, 7, 8, 9, 10].map((num) => getById(`item${num}`)!);

          const visible = [3, 4].map((num) => getById(`item${num}`)!);

          for (const element of hidden) {
            expect(element.classList.contains(Shuffle.Classes.HIDDEN)).toBe(true);
            expect(element.style.visibility).toBe('hidden');
          }

          for (const element of visible) {
            expect(element.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);
            expect(element.style.visibility).toBe('visible');
          }

          resolve();
        }

        instance.value.once(Shuffle.EventType.LAYOUT, second);
        instance.value.filter('design');
      }));

    test('can initialize filtered and the category parameter is optional', ({ fixture, instance }) => {
      instance.value = new Shuffle(fixture, {
        speed: 40,
        group: 'design',
      });

      expect(instance.value.visibleItems).toBe(3);
    });

    test('can test elements against filters', ({ fixture, instance }) => {
      instance.value = new Shuffle(fixture, { speed: 0 });

      const first = toHtmlElement(fixture.firstElementChild);

      instance.value.filter('design');
      // First item is in the "design" group, so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter('black');
      // First item is not black, so it should be hidden.
      expect(first.classList.contains(Shuffle.Classes.HIDDEN)).toBe(true);

      instance.value.filter((element) => {
        expect(element).toBeDefined();
        return element.dataset.age === '21';
      });
      // First item has age 21, so it matches the filter and should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter((element) => element.dataset.age === '22');
      // First item has age 21, not 22, so it should be hidden.
      expect(first.classList.contains(Shuffle.Classes.HIDDEN)).toBe(true);

      // Arrays.
      instance.value.filter(['design']);
      // First item is in the "design" group, so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter(['red']);
      // First item is red, so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter(['design', 'black']);
      // First item is in design group (ANY mode allows items matching any filter), so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      // Change filter mode.
      instance.value.options.filterMode = Shuffle.FilterMode.ALL;

      instance.value.filter(['design']);
      // First item is in the "design" group, so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter(['design', 'red']);
      // First item is in design group AND is red (ALL mode requires matching all filters), so it should be visible.
      expect(first.classList.contains(Shuffle.Classes.VISIBLE)).toBe(true);

      instance.value.filter(['design', 'black']);
      // First item is in design but not black (ALL mode requires matching all filters), so it should be hidden.
      expect(first.classList.contains(Shuffle.Classes.HIDDEN)).toBe(true);
    });
  });

  describe('delimiter fixture', () => {
    const delimiterTest = createTest('delimiter');

    delimiterTest('can have a custom delimiter', ({ fixture, instance }) => {
      instance.value = new Shuffle(fixture, {
        delimiter: ',',
        group: 'design',
      });

      expect(instance.value.visibleItems).toBe(3);
    });
  });
});
