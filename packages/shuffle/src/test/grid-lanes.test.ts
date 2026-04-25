// oxlint-disable promise/prefer-await-to-then
import { afterEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';

function createFixture(): { container: HTMLElement; items: HTMLElement[] } {
  const container = document.createElement('div');
  container.style.display = 'grid';

  const items: HTMLElement[] = [];
  for (let index = 0; index < 3; index += 1) {
    const item = document.createElement('div');
    item.className = 'item';
    item.textContent = `Item ${index + 1}`;
    if (index === 0) {
      item.dataset.groups = 'design red';
    } else if (index === 1) {
      item.dataset.groups = 'design blue';
    } else {
      item.dataset.groups = 'ux green';
    }
    items.push(item);
  }

  container.append(...items);
  document.body.append(container);
  return { container, items };
}

function mockStartViewTransition() {
  return vi.spyOn(document, 'startViewTransition').mockImplementation(() => ({
    finished: Promise.resolve(),
    ready: Promise.resolve(),
    updateCallbackDone: Promise.resolve(),
    skipTransition: vi.fn(),
    // oxlint-disable-next-line typescript/ban-ts-comment, typescript/prefer-ts-expect-error
    // @ts-ignore partial mock, mismatch between oxlint-tsgolint and TypeScript lib.dom.d.ts definitions
    types: {
      forEach: vi.fn(),
    },
  }));
}

describe('grid lanes init', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('logs error and destroys when container display is not grid or grid-lanes', () => {
    const container = document.createElement('div');
    container.style.display = 'block';
    document.body.append(container);
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
