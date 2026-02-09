import { describe, it, expect } from 'vitest';

import { sorter } from '../sorter';
import { ShuffleItem } from '../shuffle-item';

const MOCK_TEMPLATE = document.createElement('template');

function createMockElement(id: string, age: number, groups: string[]): HTMLElement {
  MOCK_TEMPLATE.innerHTML = `
    <div class="item" id="${id}" data-age="${age}" data-groups='${JSON.stringify(groups)}'>
      Person ${id.replace('item', '')}
    </div>
  `;
  return MOCK_TEMPLATE.content.firstElementChild!.cloneNode(true) as HTMLElement;
}

function createMockItems(): ShuffleItem[] {
  const items = [
    createMockElement('item1', 21, ['design', 'red']),
    createMockElement('item2', 50, ['design', 'blue']),
    createMockElement('item3', 29, ['strategy', 'green']),
    createMockElement('item4', 27, ['ux', 'green']),
    createMockElement('item5', 35, ['ux', 'blue']),
    createMockElement('item6', 23, ['ux', 'red']),
    createMockElement('item7', 42, ['newbiz']),
    createMockElement('item8', 31, ['technology', 'black']),
    createMockElement('item9', 28, ['design', 'red']),
    createMockElement('item10', 25, ['technology', 'black']),
  ];

  return items.map((element) => new ShuffleItem(element, false));
}

describe('Shuffle sorter utility', () => {
  it('will handle invalid input gracefully', () => {
    // @ts-expect-error invalid parameter (should be array)
    expect(sorter({})).toEqual([]);
  });

  it('can randomize the elements', () => {
    const items = createMockItems();
    const clone = createMockItems();

    expect(items).toHaveLength(10);
    expect(sorter(items)).toEqual(items);

    expect(sorter(clone, { randomize: true })).not.toEqual(items);
  });

  it('can sort by a function', () => {
    const items = createMockItems();
    const clone = [...items];

    clone.sort((itemA, itemB) => {
      const age1 = Number.parseInt(itemA.element.dataset.age!, 10);
      const age2 = Number.parseInt(itemB.element.dataset.age!, 10);
      return age1 - age2;
    });

    const result = sorter(items, {
      by(element) {
        expect(element).toBeDefined();
        expect(element.nodeType).toBe(1);
        return Number.parseInt(element.dataset.age!, 10);
      },
    });

    expect(result).toEqual(clone);
  });

  it('can sort by a function and reverse it', () => {
    const items = createMockItems();
    const clone = [...items];

    const expected = clone
      .toSorted((itemA, itemB) => {
        const age1 = Number.parseInt(itemA.element.dataset.age!, 10);
        const age2 = Number.parseInt(itemB.element.dataset.age!, 10);
        return age1 - age2;
      })
      .toReversed();

    const result = sorter(items, {
      reverse: true,
      by(element) {
        return Number.parseInt(element.dataset.age!, 10);
      },
    });

    expect(result).toEqual(expected);
  });

  it('will revert to DOM order if the `by` function returns undefined', () => {
    const items = createMockItems();
    const clone = [...items];
    let count = 0;

    expect(
      sorter(items, {
        by() {
          count += 1;
          return count < 5 ? Math.random() : undefined;
        },
      }),
    ).toEqual(clone);
  });

  it('can sort things to the top', () => {
    const items = createMockItems().slice(0, 4);
    const final = [items[1], items[0], items[3], items[2]];
    expect(
      sorter(items, {
        by(element) {
          const age = Number.parseInt(element.dataset.age!, 10);
          if (age === 50) {
            return 'sortFirst';
          }
          return age;
        },
      }),
    ).toEqual(final);
  });

  it('can sort things to the bottom', () => {
    const items = createMockItems().slice(0, 4);
    const final = [items[0], items[2], items[1], items[3]];
    expect(
      sorter(items, {
        by(element) {
          const age = Number.parseInt(element.dataset.age!, 10);
          if (age === 27) {
            return 'sortLast';
          }
          return age;
        },
      }),
    ).toEqual(final);
  });

  it('can have a custom sort comparator', () => {
    const items = createMockItems();
    const clone = [...items];

    const final = [clone[0], clone[8], clone[1], clone[6], clone[2], clone[9], clone[7], clone[5], clone[3], clone[4]];
    expect(
      sorter(items, {
        compare(itemA, itemB) {
          // Sort by first group, then by age.
          // oxlint-disable-next-line typescript/no-unsafe-assignment
          const [groupA] = JSON.parse(itemA.element.dataset.groups!);
          // oxlint-disable-next-line typescript/no-unsafe-assignment
          const [groupB] = JSON.parse(itemB.element.dataset.groups!);
          if (groupA > groupB) {
            return 1;
          }
          if (groupA < groupB) {
            return -1;
          }

          // At this point, the group strings are the exact same. Test the age.
          const ageA = Number.parseInt(itemA.element.dataset.age!, 10);
          const ageB = Number.parseInt(itemB.element.dataset.age!, 10);
          return ageA - ageB;
        },
      }),
    ).toEqual(final);
  });
});
