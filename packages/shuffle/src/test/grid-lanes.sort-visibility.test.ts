import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import {
  createFixture,
  createSortFixture,
  getGridLanesItem,
  isItemVisible,
  mockStartViewTransition,
  waitForLayout,
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

  it('sort() by key sorts DOM in ascending order', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item1);
    expect(domOrder[1]).toBe(item2);
    expect(domOrder[2]).toBe(item0);
  });

  it('sort(null) restores original encounter order using defaultOrder', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    instance.sort(null);
    await waitForLayout(instance);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item1);
    expect(domOrder[2]).toBe(item2);
  });

  it('default sort is stable across multiple custom sorts', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    instance.sort({ reverse: true, by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    instance.sort(null);
    await waitForLayout(instance);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item1);
    expect(domOrder[2]).toBe(item2);
  });

  it('sort() with reverse:true inverts the sort order', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    // Without reverse: ascending by sort-value → item1(1), item2(2), item0(3)
    // With reverse: descending → item0(3), item2(2), item1(1)
    instance.sort({ reverse: true, by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item2);
    expect(domOrder[2]).toBe(item1);
  });

  it('sort() with a compare function sorts DOM in the expected order', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    // compare: descending by sort-value → item0(3), item2(2), item1(1)
    instance.sort({
      compare: (itemA, itemB) => Number(itemB.element.dataset.sortValue) - Number(itemA.element.dataset.sortValue),
    });
    await waitForLayout(instance);

    const domOrder = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    expect(domOrder[0]).toBe(item0);
    expect(domOrder[1]).toBe(item2);
    expect(domOrder[2]).toBe(item1);
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

  it('hidden items have shuffle-item--hidden class, aria-hidden, and view-transition-name none', async () => {
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);

    const hiddenItem = getGridLanesItem(instance, item2);

    expect(isItemVisible(instance, item2)).toBe(false);
    expect(hiddenItem.isHidden).toBe(true);
    expect(item2.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(item2.classList.contains('shuffle-item--visible')).toBe(false);
    expect(item2.getAttribute('aria-hidden')).toBe('true');
    expect(item2.style.getPropertyValue('view-transition-name')).toBe('none');
  });

  it('hidden items are out of flow when hidden class rule is present', async () => {
    const style = injectHiddenRule();
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);

    expect(item2.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(globalThis.getComputedStyle(item2).display).toBe('none');

    style.remove();
  });

  it('shown items have shuffle-item--visible class, no aria-hidden, and real view-transition-name', async () => {
    const { container, items } = createFixture();
    const [item0] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);

    const shownItem = getGridLanesItem(instance, item0);

    expect(isItemVisible(instance, item0)).toBe(true);
    expect(shownItem.isHidden).toBe(false);
    expect(item0.classList.contains('shuffle-item--visible')).toBe(true);
    expect(item0.classList.contains('shuffle-item--hidden')).toBe(false);
    expect(item0.getAttribute('aria-hidden')).toBeNull();
    expect(item0.style.getPropertyValue('view-transition-name')).toBe(shownItem.id);
  });

  it('re-showing a hidden item restores its real view-transition-name', async () => {
    const { container, items } = createFixture();
    const item2 = items.at(2)!;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);

    instance.filter('all');
    await waitForLayout(instance);

    const item = getGridLanesItem(instance, item2);

    expect(isItemVisible(instance, item2)).toBe(true);
    expect(item2.style.getPropertyValue('view-transition-name')).toBe(item.id);
    expect(item2.getAttribute('aria-hidden')).toBeNull();
  });

  it('visible items appear before hidden items in DOM order', async () => {
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);

    const allDomChildren = Array.from(container.querySelectorAll<HTMLElement>('.item'));
    const lastVisible = allDomChildren.findLast((el) => isItemVisible(instance, el));
    const firstHidden = allDomChildren.find((el) => !isItemVisible(instance, el));

    const lastVisibleIndex = allDomChildren.indexOf(lastVisible!);
    const firstHiddenIndex = allDomChildren.indexOf(firstHidden!);
    expect(lastVisibleIndex).toBeLessThan(firstHiddenIndex);
  });
});

describe('combined filter and sort', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('applying filter then sort produces correct visible DOM order', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    // item0: sort-value=3; item1: sort-value=1; item2: sort-value=2
    // Add groups so we can filter.
    item0.dataset.groups = 'a';
    item1.dataset.groups = 'a';
    item2.dataset.groups = 'b';

    const instance = new GridLanes(container, { itemSelector: '.item' });

    // Filter to group 'a' — only item0 and item1 are visible.
    instance.filter('a');
    await waitForLayout(instance);

    // Sort ascending by sort-value among visible items: item1(1), item0(3).
    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    const visibleDomOrder = Array.from(container.querySelectorAll<HTMLElement>('.item')).filter((el) =>
      isItemVisible(instance, el),
    );
    expect(visibleDomOrder).toStrictEqual([item1, item0]);
    expect(isItemVisible(instance, item2)).toBe(false);
  });

  it('changing the filter after a sort preserves the active sort order', async () => {
    const { container, items } = createSortFixture();
    const [item0, item1, item2] = items;
    item0.dataset.groups = 'a';
    item1.dataset.groups = 'a b';
    item2.dataset.groups = 'b';

    const instance = new GridLanes(container, { itemSelector: '.item' });

    // Sort ascending by sort-value first.
    instance.sort({ by: (el) => Number(el.dataset.sortValue) });
    await waitForLayout(instance);

    // Then filter to group 'a' — item0(3) and item1(1) remain, sorted ascending: item1, item0.
    instance.filter('a');
    await waitForLayout(instance);

    const visibleDomOrder = Array.from(container.querySelectorAll<HTMLElement>('.item')).filter((el) =>
      isItemVisible(instance, el),
    );
    expect(visibleDomOrder).toStrictEqual([item1, item0]);
  });
});
