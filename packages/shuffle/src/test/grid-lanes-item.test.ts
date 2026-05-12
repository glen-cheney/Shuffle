import { describe, expect, it } from 'vitest';

import { GridLanesItem } from '../grid-lanes-item';
import { sorter } from '../core/sorter';

function createElement(): HTMLElement {
  return document.createElement('div');
}

function makeItem(id = 'shuffle-item-1', defaultOrder = 0): GridLanesItem {
  const el = createElement();
  const item = new GridLanesItem(el, id, defaultOrder);
  item.init();
  return item;
}

describe('GridLanesItem fields', () => {
  it('exposes required fields with correct initial values', () => {
    const el = createElement();
    const item = new GridLanesItem(el, 'shuffle-item-42', 7);

    expect(item.id).toBe('shuffle-item-42');
    expect(item.element).toBe(el);
    expect(item.defaultOrder).toBe(7);
    expect(item.isVisible).toBe(true);
    expect(item.isHidden).toBe(false);
  });

  it('isHidden is always the inverse of isVisible', () => {
    const item = makeItem();

    expect(item.isVisible).toBe(true);
    expect(item.isHidden).toBe(false);

    item.hide();
    expect(item.isVisible).toBe(false);
    expect(item.isHidden).toBe(true);

    item.show();
    expect(item.isVisible).toBe(true);
    expect(item.isHidden).toBe(false);
  });

  it('exposes only the required fields', () => {
    const item = makeItem();
    const keys = Object.keys(item);
    expect(keys).toEqual(['id', 'defaultOrder', 'element', 'isVisible']);
  });
});

describe('GridLanesItem show() and hide()', () => {
  it('hide() applies the right styles and attributes', () => {
    const item = makeItem();
    item.element.style.setProperty('--shuffle-index', '3');

    item.hide();

    expect(item.isVisible).toBe(false);
    expect(item.element.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(item.element.classList.contains('shuffle-item--visible')).toBe(false);
    expect(item.element.getAttribute('aria-hidden')).toBe('true');
    expect(item.element.style.getPropertyValue('view-transition-name')).toBe('none');
    expect(item.element.style.getPropertyValue('--shuffle-index')).toBe('');
  });

  it('show() applies the right styles and attributes', () => {
    const item = makeItem('shuffle-item-5');

    item.hide();
    item.show();

    expect(item.isVisible).toBe(true);
    expect(item.element.classList.contains('shuffle-item--visible')).toBe(true);
    expect(item.element.classList.contains('shuffle-item--hidden')).toBe(false);
    expect(item.element.getAttribute('aria-hidden')).toBeNull();
    expect(item.element.style.getPropertyValue('view-transition-name')).toBe('shuffle-item-5');
  });

  it('repeated show()/hide() cycles remain consistent', () => {
    const item = makeItem('shuffle-item-9');

    for (let i = 0; i < 3; i += 1) {
      item.hide();
      expect(item.isHidden).toBe(true);
      expect(item.element.style.getPropertyValue('view-transition-name')).toBe('none');

      item.show();
      expect(item.isVisible).toBe(true);
      expect(item.element.style.getPropertyValue('view-transition-name')).toBe('shuffle-item-9');
    }
  });
});

describe('GridLanesItem dispose()', () => {
  it('removes all library-owned classes and inline styles', () => {
    const item = makeItem('shuffle-item-3');
    item.element.style.setProperty('--shuffle-index', '2');

    item.dispose();

    expect(item.element.classList.contains('shuffle-item')).toBe(false);
    expect(item.element.classList.contains('shuffle-item--visible')).toBe(false);
    expect(item.element.classList.contains('shuffle-item--hidden')).toBe(false);
    expect(item.element.style.getPropertyValue('view-transition-name')).toBe('');
    expect(item.element.style.getPropertyValue('view-transition-class')).toBe('');
    expect(item.element.style.getPropertyValue('--shuffle-index')).toBe('');
    expect(item.element.getAttribute('aria-hidden')).toBeNull();
  });

  it('preserve user-owned classes and attributes', () => {
    const el = createElement();
    el.classList.add('my-card');
    el.dataset.category = 'news';

    const item = new GridLanesItem(el, 'shuffle-item-10', 0);
    item.init();
    item.dispose();

    expect(el.classList.contains('my-card')).toBe(true);
    expect(el.dataset.category).toBe('news');
  });
});

describe('GridLanesItem sort comparator compatibility', () => {
  it('sorter() can sort GridLanesItem instances using the default element key', () => {
    const elA = createElement();
    const elB = createElement();
    const elC = createElement();
    elA.dataset.value = '3';
    elB.dataset.value = '1';
    elC.dataset.value = '2';

    const items = [
      new GridLanesItem(elA, 'shuffle-item-a', 0),
      new GridLanesItem(elB, 'shuffle-item-b', 1),
      new GridLanesItem(elC, 'shuffle-item-c', 2),
    ];

    const sorted = sorter(items, { by: (el) => el.dataset.value });

    expect(sorted[0].id).toBe('shuffle-item-b');
    expect(sorted[1].id).toBe('shuffle-item-c');
    expect(sorted[2].id).toBe('shuffle-item-a');
  });

  it('sorter() can sort GridLanesItem instances using a custom compare function', () => {
    const items = [
      new GridLanesItem(createElement(), 'shuffle-item-a', 2),
      new GridLanesItem(createElement(), 'shuffle-item-b', 0),
      new GridLanesItem(createElement(), 'shuffle-item-c', 1),
    ];

    const sorted = sorter(items, { compare: (itemA, itemB) => itemA.defaultOrder - itemB.defaultOrder });

    expect(sorted[0].id).toBe('shuffle-item-b');
    expect(sorted[1].id).toBe('shuffle-item-c');
    expect(sorted[2].id).toBe('shuffle-item-a');
  });
});
