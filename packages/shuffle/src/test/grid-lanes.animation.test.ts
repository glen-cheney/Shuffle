import { afterEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import { createFixture, getGridLanesItem, mockStartViewTransition, waitForLayout } from './grid-lanes.helpers';

describe('speed and easing options', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    for (const element of document.querySelectorAll('style[data-shuffle-lanes-view-transition]')) {
      element.remove();
    }
    vi.restoreAllMocks();
  });

  it('does not write transition option values to container custom properties', () => {
    const { container } = createFixture();
    const _gl = new GridLanes(container, {
      itemSelector: '.item',
      speed: 400,
      easing: 'ease-in-out',
      staggerAmount: 30,
      staggerAmountMax: 200,
    });

    expect(container.style.getPropertyValue('--shuffle-speed')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-easing')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-stagger-amount')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-stagger-max')).toBe('');
  });

  it('writes transition option values to the scoped View Transition rule before animating', async () => {
    const { container } = createFixture();
    mockStartViewTransition();
    const instance = new GridLanes(container, {
      itemSelector: '.item',
      speed: 400,
      easing: 'ease-in-out',
      staggerAmount: 30,
      staggerAmountMax: 200,
    });

    instance.filter('design');
    await waitForLayout(instance);

    const styleElement = document.querySelector<HTMLStyleElement>('style[data-shuffle-lanes-view-transition]');
    const rule = styleElement?.sheet?.cssRules.item(0) as CSSStyleRule;

    expect(rule).toBeInstanceOf(CSSStyleRule);
    expect(rule.selectorText).toBe(':root:active-view-transition-type(shuffle-lanes)::view-transition');
    expect(rule.style.getPropertyValue('pointer-events')).toBe('none');
    expect(rule.style.getPropertyValue('--shuffle-speed')).toBe('400ms');
    expect(rule.style.getPropertyValue('--shuffle-easing')).toBe('ease-in-out');
    expect(rule.style.getPropertyValue('--shuffle-stagger-amount')).toBe('30ms');
    expect(rule.style.getPropertyValue('--shuffle-stagger-max')).toBe('200ms');
  });

  it('reuses the scoped View Transition rule and lets the active instance update it', async () => {
    const fixtureA = createFixture();
    const fixtureB = createFixture();
    mockStartViewTransition();
    const instanceA = new GridLanes(fixtureA.container, { itemSelector: '.item', speed: 300 });
    const instanceB = new GridLanes(fixtureB.container, { itemSelector: '.item', speed: 600 });

    instanceA.filter('design');
    await waitForLayout(instanceA);
    instanceB.filter('ux');
    await waitForLayout(instanceB);

    const styleElements = document.querySelectorAll<HTMLStyleElement>('style[data-shuffle-lanes-view-transition]');
    expect(styleElements).toHaveLength(1);

    const rule = styleElements.item(0).sheet?.cssRules.item(0) as CSSStyleRule;
    expect(rule.style.getPropertyValue('--shuffle-speed')).toBe('600ms');
  });
});

describe('--shuffle-index stagger assignment', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('assigns sequential --shuffle-index to visible items after init', () => {
    const { container, items } = createFixture();
    const _gl = new GridLanes(container, { itemSelector: '.item' });

    // All 3 items are visible by default.
    for (const [i, element] of items.entries()) {
      expect(element.style.getPropertyValue('--shuffle-index')).toBe(String(i));
    }
    expect.assertions(3);
  });

  it('reassigns --shuffle-index after filtering to only count visible items', async () => {
    const { container, items } = createFixture();
    const [item0, item1, item2] = items;
    mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    // After filtering to 'design', items 0 and 1 are visible; item 2 is hidden.
    instance.filter('design');
    await waitForLayout(instance);

    expect(item0.style.getPropertyValue('--shuffle-index')).toBe('0');
    expect(item1.style.getPropertyValue('--shuffle-index')).toBe('1');
    // item2 is hidden — its --shuffle-index should not be present.
    expect(item2.style.getPropertyValue('--shuffle-index')).toBe('');
  });

  it('--shuffle-index starts at 0 for the first visible item regardless of sort order', async () => {
    const { container } = createFixture();
    mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    // Sort by textContent.
    instance.sort({ by: (element) => element.textContent });
    await waitForLayout(instance);

    const sortedVisibleItems = instance.sortedItems;
    expect(sortedVisibleItems).toHaveLength(3);

    for (const [i, item] of sortedVisibleItems.entries()) {
      expect(item.element.style.getPropertyValue('--shuffle-index')).toBe(String(i));
    }
  });

  it('removes --shuffle-index from item when dispose is called', () => {
    const { container, items } = createFixture();
    const [item0] = items;
    const instance = new GridLanes(container, { itemSelector: '.item' });

    // Verify it was set first.
    expect(item0.style.getPropertyValue('--shuffle-index')).toBe('0');

    const item = getGridLanesItem(instance, item0);
    item.dispose();

    expect(item0.style.getPropertyValue('--shuffle-index')).toBe('');
  });

  it('removes --shuffle-index from all items when destroy is called', () => {
    const { container, items } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.destroy();

    for (const element of items) {
      expect(element.style.getPropertyValue('--shuffle-index')).toBe('');
    }

    expect.assertions(3);
  });
});
