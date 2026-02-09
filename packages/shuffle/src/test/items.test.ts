import { describe, expect } from 'vitest';

import { test, childrenToArray } from './test-utils';
import Shuffle from '../shuffle';

describe('shuffle items', () => {
  describe('removing elements', () => {
    let children: HTMLElement[];

    test.beforeEach(({ fixture }) => {
      children = childrenToArray(fixture);
    });

    test('can remove items', ({ fixture, instance }) =>
      new Promise<void>((resolve) => {
        instance.value = new Shuffle(fixture, {
          speed: 16,
        });

        instance.value.once(Shuffle.EventType.REMOVED, ({ shuffle, collection }) => {
          expect(shuffle.visibleItems).toBe(8);
          expect(collection[0].id).toBe('item1');
          expect(collection[1].id).toBe('item2');
          expect(shuffle.element.children).toHaveLength(8);
          expect(shuffle.isTransitioning).toBe(false);
          resolve();
        });

        const itemsToRemove = children.slice(0, 2);
        instance.value.remove(itemsToRemove);
      }));

    test('can remove items without transforms', ({ fixture, instance }) =>
      new Promise<void>((resolve) => {
        instance.value = new Shuffle(fixture, {
          speed: 100,
          useTransforms: false,
        });

        instance.value.once(Shuffle.EventType.REMOVED, ({ shuffle, collection }) => {
          expect(shuffle.visibleItems).toBe(8);
          expect(collection[0].id).toBe('item2');
          expect(collection[1].id).toBe('item3');
          expect(shuffle.element.children).toHaveLength(8);
          expect(shuffle.isTransitioning).toBe(false);
          resolve();
        });

        const itemsToRemove = children.slice(1, 3);
        instance.value.remove(itemsToRemove);
      }));
  });

  describe('inserting elements', () => {
    const items: HTMLElement[] = [];
    let localInstance: Shuffle;

    test.beforeEach(({ fixture }) => {
      const eleven = document.createElement('div');
      eleven.className = 'item';
      eleven.dataset.age = '36';
      eleven.dataset.groups = '["ux", "black"]';
      eleven.id = 'item11';
      eleven.textContent = 'Person 11';

      const twelve = document.createElement('div');
      twelve.className = 'item';
      twelve.dataset.age = '37';
      twelve.dataset.groups = '["strategy", "blue"]';
      twelve.id = 'item12';
      twelve.textContent = 'Person 12';

      items.push(eleven, twelve);

      localInstance = new Shuffle(fixture, {
        speed: 100,
        group: 'black',
      });
    });

    test.afterEach(() => {
      items.length = 0;
    });

    test('can add items', ({ fixture }) =>
      new Promise<void>((resolve) => {
        fixture.append(items[0]);
        fixture.append(items[1]);
        localInstance.add(items);

        // Already 2 in the items, plus number 11.
        expect(localInstance.visibleItems).toBe(3);
        expect(localInstance.sortedItems.map((item) => item.element.id)).toEqual(['item8', 'item10', 'item11']);
        expect(localInstance.items).toHaveLength(12);

        localInstance.once(Shuffle.EventType.LAYOUT, () => {
          resolve();
        });
      }));

    test('can prepend items', ({ fixture }) =>
      new Promise<void>((resolve) => {
        fixture.firstElementChild?.before(items[1]);
        fixture.firstElementChild?.before(items[0]);
        localInstance.add(items);

        expect(localInstance.items[0].element).toBe(items[0]);
        expect(localInstance.items[1].element).toBe(items[1]);
        expect(localInstance.sortedItems.map((item) => item.element.id)).toEqual(['item11', 'item8', 'item10']);
        expect(localInstance.items).toHaveLength(12);

        localInstance.once(Shuffle.EventType.LAYOUT, () => {
          resolve();
        });
      }));

    test('can reset items', ({ fixture }) => {
      fixture.textContent = '';
      fixture.append(items[0]);
      fixture.append(items[1]);

      localInstance.resetItems();

      expect(localInstance.isInitialized).toBe(true);
      expect(localInstance.items[0].element).toBe(items[0]);
      expect(localInstance.items[1].element).toBe(items[1]);
      expect(localInstance.items).toHaveLength(2);
    });
  });
});
