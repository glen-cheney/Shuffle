import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import {
  createFixture,
  createMultiGroupFixture,
  createTemplateFixture,
  isItemVisible,
  mockStartViewTransition,
  queryElement,
} from './grid-lanes.helpers';

describe('grid lanes init', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('logs error and destroys when container display is not grid or grid-lanes', () => {
    const container = createTemplateFixture('<div style="display: block;"></div>');
    const consoleError = vi.spyOn(console, 'error');

    expect(() => {
      // oxlint-disable-next-line no-new
      new GridLanes(container, { itemSelector: '.item' });
    }).not.toThrow();

    expect(consoleError).toHaveBeenCalledWith('GridLanes container must use `display: grid` or `display: grid-lanes`.');
  });

  it('ignores unknown legacy options at runtime', () => {
    const { container } = createFixture();

    expect(() => {
      // oxlint-disable-next-line no-new
      new GridLanes(container, {
        itemSelector: '.item',
        // @ts-expect-error runtime migration tolerance for legacy options
        columnWidth: 100,
      });
    }).not.toThrow();
  });

  it('assigns classes and unique transition metadata', () => {
    const { container, items } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    expect(instance.items.size).toBe(3);

    const ids = new Set<string>();
    for (const element of items) {
      const item = instance.getItemByElement(element);
      expect(item).toBeDefined();
      const itemId = item!.id;
      expect(itemId).toMatch(/^shuffle-item-\d+$/);
      ids.add(itemId);

      expect(element.classList.contains('shuffle-item')).toBe(true);
      expect(element.classList.contains('shuffle-item--visible')).toBe(true);
      expect(element.style.getPropertyValue('view-transition-name')).toBe(itemId);
      expect(element.style.getPropertyValue('view-transition-class')).toBe('shuffle-item');
    }

    expect(ids.size).toBe(3);
  });

  it('stores metadata on GridLanesItem', () => {
    const { container, items } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    expect(instance.items.size).toBe(3);

    for (const element of items) {
      const item = instance.getItemByElement(element)!;
      expect(item).toBeDefined();
      const { defaultOrder } = item;
      expect(defaultOrder).toEqual(expect.any(Number));
      expect(defaultOrder).toBeGreaterThanOrEqual(0);
    }
  });

  it('bypasses view transitions on first render and uses them after initialization', () => {
    const { container } = createFixture();
    const startViewTransition = mockStartViewTransition();

    const instance = new GridLanes(container, {
      itemSelector: '.item',
      group: 'design',
    });

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(instance.isInitialized).toBe(true);

    instance.filter('ux');
    expect(startViewTransition.mock.calls).toHaveLength(1);
  });
});

describe('data-groups parsing', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('parses whitespace-separated tokens', () => {
    const container = createTemplateFixture(`
      <div style="display: grid;">
        <div class="item" data-groups="nature  city  featured"></div>
      </div>
    `);
    const item = queryElement(container, '.item');

    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.filter('nature');
    expect(isItemVisible(instance, item)).toBe(true);

    instance.filter('featured');
    expect(isItemVisible(instance, item)).toBe(true);

    instance.filter('other');
    expect(isItemVisible(instance, item)).toBe(false);
  });

  it('trims data-groups before splitting', () => {
    const container = createTemplateFixture(`
      <div style="display: grid;">
        <div class="item" data-groups="   nature   featured   "></div>
      </div>
    `);
    const item = queryElement(container, '.item');

    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.filter('nature');
    expect(isItemVisible(instance, item)).toBe(true);

    instance.filter('featured');
    expect(isItemVisible(instance, item)).toBe(true);
  });

  interface EmptyGroupsCase {
    name: string;
    groupsValue: string | undefined;
  }

  it.each<EmptyGroupsCase>([
    { name: 'missing data-groups', groupsValue: undefined },
    { name: 'empty data-groups', groupsValue: '   ' },
  ])('treats $name as no groups', ({ groupsValue }) => {
    const groupsAttr = groupsValue === undefined ? '' : ` data-groups="${groupsValue}"`;
    const container = createTemplateFixture(`
      <div style="display: grid;">
        <div class="item"${groupsAttr}></div>
      </div>
    `);
    const item = queryElement(container, '.item');

    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.filter('any-group');
    expect(isItemVisible(instance, item)).toBe(false);
  });
});

describe('filter mode', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  interface FilterModeCase {
    mode: 'any' | 'all';
    itemAVisible: boolean;
    itemBVisible: boolean;
    itemCVisible: boolean;
  }

  it.each<FilterModeCase>([
    { mode: 'any', itemAVisible: true, itemBVisible: true, itemCVisible: true },
    { mode: 'all', itemAVisible: true, itemBVisible: false, itemCVisible: false },
  ])('filterMode $mode applies token matching', ({ mode, itemAVisible, itemBVisible, itemCVisible }) => {
    const { container, itemA, itemB, itemC } = createMultiGroupFixture();
    const instance = new GridLanes(container, { itemSelector: '.item', filterMode: mode });

    instance.filter(['nature', 'featured']);
    expect(isItemVisible(instance, itemA)).toBe(itemAVisible);
    expect(isItemVisible(instance, itemB)).toBe(itemBVisible);
    expect(isItemVisible(instance, itemC)).toBe(itemCVisible);
  });

  it('filter with "all" string shows every item', () => {
    const { container, itemA, itemB, itemC } = createMultiGroupFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.filter('nature');
    instance.filter('all');

    expect(isItemVisible(instance, itemA)).toBe(true);
    expect(isItemVisible(instance, itemB)).toBe(true);
    expect(isItemVisible(instance, itemC)).toBe(true);
  });

  it('filter with a predicate function', () => {
    const { container, itemA, itemB, itemC } = createMultiGroupFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter((element) => element.dataset.groups?.includes('featured') ?? false);

    expect(isItemVisible(instance, itemA)).toBe(true);
    expect(isItemVisible(instance, itemB)).toBe(false);
    expect(isItemVisible(instance, itemC)).toBe(true);
  });
});
