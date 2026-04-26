import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import {
  createFixture,
  createSortFixture,
  getGridLanesItem,
  isItemVisible,
  mockStartViewTransition,
} from './grid-lanes.helpers';

function injectHiddenRule(): HTMLStyleElement {
  const style = document.createElement('style');
  style.textContent = `
    [data-shuffle-lanes] .shuffle-item--hidden {
      display: none !important;
    }
  `;
  document.head.append(style);
  return style;
}

describe('sorting', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('sort() by key sorts DOM in ascending order', () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item1);
    expect(domOrder[1]).toBe(item2);
    expect(domOrder[2]).toBe(item0);
  });

  it('sort(null) restores original encounter order using defaultOrder', () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    instance.sort(null);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item1);
    expect(domOrder[2]).toBe(item2);
  });

  it('default sort is stable across multiple custom sorts', () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    instance.sort({ reverse: true, by: (el) => Number(el.dataset.sortValue) });
    instance.sort(null);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item1);
    expect(domOrder[2]).toBe(item2);
  });
});

describe('hidden item semantics', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('hidden items have shuffle-item--hidden class, aria-hidden, and view-transition-name none', () => {
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');

    const hiddenItem = getGridLanesItem(instance, item2);

    expect(isItemVisible(instance, item2)).toBe(false);
    expect(hiddenItem.isHidden).toBe(true);
    expect(item2.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(item2.classList.contains('shuffle-item--visible')).toBe(false);
    expect(item2.getAttribute('aria-hidden')).toBe('true');
    expect(item2.style.getPropertyValue('view-transition-name')).toBe('none');
  });

  it('hidden items are out of flow when hidden class rule is present', () => {
    const style = injectHiddenRule();
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');

    expect(item2.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(globalThis.getComputedStyle(item2).display).toBe('none');

    style.remove();
  });

  it('shown items have shuffle-item--visible class, no aria-hidden, and real view-transition-name', () => {
    const { container, items } = createFixture();
    const [item0] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');

    const shownItem = getGridLanesItem(instance, item0);

    expect(isItemVisible(instance, item0)).toBe(true);
    expect(shownItem.isHidden).toBe(false);
    expect(item0.classList.contains('shuffle-item--visible')).toBe(true);
    expect(item0.classList.contains('shuffle-item--hidden')).toBe(false);
    expect(item0.getAttribute('aria-hidden')).toBeNull();
    expect(item0.style.getPropertyValue('view-transition-name')).toBe(shownItem.id);
  });

  it('re-showing a hidden item restores its real view-transition-name', () => {
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    instance.filter('all');

    const item = getGridLanesItem(instance, item2);

    expect(isItemVisible(instance, item2)).toBe(true);
    expect(item2.style.getPropertyValue('view-transition-name')).toBe(item.id);
    expect(item2.getAttribute('aria-hidden')).toBeNull();
  });

  it('visible items appear before hidden items in DOM order', () => {
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');

    const allDomChildren = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    const lastVisible = allDomChildren.findLast((el) => isItemVisible(instance, el));
    const firstHidden = allDomChildren.find((el) => !isItemVisible(instance, el));

    const lastVisibleIndex = allDomChildren.indexOf(lastVisible!);
    const firstHiddenIndex = allDomChildren.indexOf(firstHidden!);
    expect(lastVisibleIndex).toBeLessThan(firstHiddenIndex);
  });
});
