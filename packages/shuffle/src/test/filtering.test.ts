import { describe, expect } from 'vitest';

import Shuffle from '../shuffle';
import { test, createTest, getById, toHtmlElement } from './test-utils';

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
      instance.value = new Shuffle(fixture);

      const first = toHtmlElement(fixture.firstElementChild);
      expect(instance.value._doesPassFilter('design', first)).toBe(true);
      expect(instance.value._doesPassFilter('black', first)).toBe(false);

      expect(
        instance.value._doesPassFilter((element) => {
          expect(element).toBeDefined();
          return element.dataset.age === '21';
        }, first),
      ).toBe(true);

      expect(instance.value._doesPassFilter((element) => element.dataset.age === '22', first)).toBe(false);

      // Arrays.
      expect(instance.value._doesPassFilter(['design'], first)).toBe(true);
      expect(instance.value._doesPassFilter(['red'], first)).toBe(true);
      expect(instance.value._doesPassFilter(['design', 'black'], first)).toBe(true);

      // Change filter mode.
      instance.value.options.filterMode = Shuffle.FilterMode.ALL;
      expect(instance.value._doesPassFilter(['design'], first)).toBe(true);
      expect(instance.value._doesPassFilter(['design', 'red'], first)).toBe(true);
      expect(instance.value._doesPassFilter(['design', 'black'], first)).toBe(false);
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
