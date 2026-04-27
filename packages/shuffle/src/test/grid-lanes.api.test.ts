// oxlint-disable promise/prefer-await-to-then
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import {
  createFixture,
  createTemplateFixture,
  createUnresolvedPromise,
  getGridLanesItem,
  isItemVisible,
  mockStartViewTransition,
  waitForLayout,
  waitForRemoved,
  type AnyFn,
} from './grid-lanes.helpers';

async function renderFixture() {
  const { container, items } = createFixture();
  const instance = new GridLanes(container, { itemSelector: '.item' });

  await waitForLayout(instance);

  return { instance, container, items };
}

describe('API surface', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('exposes all required public methods', async () => {
    mockStartViewTransition();
    const { instance } = await renderFixture();

    const methodNames = [
      'filter',
      'sort',
      'layout',
      'update',
      'add',
      'remove',
      'enable',
      'disable',
      'destroy',
      'resetItems',
      'getItemByElement',
    ] as const;

    for (const methodName of methodNames) {
      expectTypeOf(instance[methodName]).toBeFunction();
    }
  });
});

describe('LAYOUT async timing', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('LAYOUT fires after ViewTransition.finished settles with VT enabled', async () => {
    let resolveFinished!: () => void;
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    mockStartViewTransition({ finished });
    const { instance } = await renderFixture();

    const layoutSpy = vi.fn<AnyFn>();
    instance.on('shuffle:layout', layoutSpy);

    instance.filter('design');

    // Not yet — VT hasn't finished
    expect(layoutSpy).not.toHaveBeenCalled();

    resolveFinished();
    await finished;
    expect(layoutSpy).not.toHaveBeenCalled();
    await waitForLayout(instance);
    expect(layoutSpy).toHaveBeenCalledOnce();
  });

  it('LAYOUT fires in a microtask without VT', async () => {
    const savedDescriptor = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });

    try {
      const { instance } = await renderFixture();

      const layoutSpy = vi.fn<AnyFn>();
      instance.on('shuffle:layout', layoutSpy);

      instance.filter('design');
      expect(layoutSpy).not.toHaveBeenCalled();

      await waitForLayout(instance);
      expect(layoutSpy).toHaveBeenCalledOnce();
    } finally {
      if (savedDescriptor) {
        Object.defineProperty(document, 'startViewTransition', savedDescriptor);
      } else {
        Reflect.deleteProperty(document, 'startViewTransition');
      }
    }
  });
});

describe('remove() and REMOVED event', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('REMOVED fires after physical DOM removal and after LAYOUT', async () => {
    const { container, instance, items } = await renderFixture();
    const [itemToRemove] = items;

    const order: string[] = [];
    instance.on('shuffle:layout', () => order.push('layout'));
    instance.on('shuffle:removed', () => {
      order.push('removed');
      expect(container.contains(itemToRemove)).toBe(false);
    });

    instance.remove([itemToRemove]);
    await waitForRemoved(instance);

    expect(order).toEqual(['layout', 'removed']);
  });

  it('removed element is no longer tracked after removal', async () => {
    const { instance, items } = await renderFixture();
    const [itemToRemove] = items;

    instance.remove([itemToRemove]);
    await waitForRemoved(instance);

    expect(instance.getItemByElement(itemToRemove)).toBeUndefined();
    expect(instance.items.size).toBe(2);
  });

  it('calling remove() with an empty array is a no-op', () => {
    const { container } = createFixture();
    const startVT = mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });
    const callCount = startVT.mock.calls.length;

    instance.remove([]);

    expect(startVT.mock.calls.length).toBe(callCount);
  });
});

describe('enable() and disable()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('disable() sets isEnabled to false and aborts active transition', async () => {
    const skipFn = vi.fn<() => void>();
    const neverResolve = createUnresolvedPromise();
    const startViewTransition = mockStartViewTransition({ finished: neverResolve, skipTransition: skipFn });
    const { instance } = await renderFixture();

    instance.filter('design');
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledOnce();
    });
    instance.disable();

    expect(instance.isEnabled).toBe(false);
    expect(skipFn).toHaveBeenCalledOnce();
  });

  it.each(['filter', 'sort', 'update', 'layout'] as const)(
    '%s() does not call startViewTransition when disabled',
    async (method) => {
      const startVT = mockStartViewTransition();
      const { instance } = await renderFixture();
      const callsBefore = startVT.mock.calls.length;

      instance.disable();
      instance[method]();

      expect(startVT.mock.calls.length).toBe(callsBefore);
    },
  );

  it('enable() resumes normal behavior and triggers an update', async () => {
    mockStartViewTransition();
    const { instance, items } = await renderFixture();
    const [item0] = items;

    instance.disable();
    instance.lastFilter = 'design';
    instance.enable();

    // After enable(true), the current lastFilter='design' should be applied
    expect(isItemVisible(instance, item0)).toBe(true);
  });

  it('enable(false) resumes without triggering an update', async () => {
    const startVT = mockStartViewTransition();
    const { instance } = await renderFixture();
    const callsBefore = startVT.mock.calls.length;

    instance.disable();
    instance.enable(false);

    expect(startVT.mock.calls.length).toBe(callsBefore);
    expect(instance.isEnabled).toBe(true);
  });
});

describe('destroy()', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('removes only library-owned container custom properties', () => {
    mockStartViewTransition();
    const container = createTemplateFixture(`
      <div style="display: grid; --user-prop: 42px;">
        <div class="item" data-groups="a">Item</div>
      </div>
    `);
    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.destroy();

    expect(container.style.getPropertyValue('--shuffle-speed')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-easing')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-stagger-amount')).toBe('');
    expect(container.style.getPropertyValue('--shuffle-stagger-max')).toBe('');
    // User property must survive
    expect(container.style.getPropertyValue('--user-prop')).toBe('42px');
    // data attribute must be removed
    expect(container.dataset.shuffleLanes).toBeUndefined();
  });

  it('sets data-shuffle-lanes on the container during init', () => {
    mockStartViewTransition();
    const container = createTemplateFixture(`
      <div style="display: grid;">
        <div class="item" data-groups="a">Item</div>
      </div>
    `);
    const instance = new GridLanes(container, { itemSelector: '.item' });
    expect(container.dataset.shuffleLanes).toBe('');
    instance.destroy();
  });

  it('removes library-owned item classes and styles', async () => {
    mockStartViewTransition();
    const { instance, items } = await renderFixture();
    const [item] = items;
    instance.destroy();

    expect(item.classList.contains('shuffle-item')).toBe(false);
    expect(item.classList.contains('shuffle-item--visible')).toBe(false);
    expect(item.style.getPropertyValue('view-transition-name')).toBe('');
    expect(item.style.getPropertyValue('view-transition-class')).toBe('');
  });

  it('does not call element.removeAttribute("style") on the container', () => {
    mockStartViewTransition();
    const container = createTemplateFixture(`
      <div style="display: grid; color: red;">
        <div class="item">Item</div>
      </div>
    `);
    const removeAttribute = vi.spyOn(container, 'removeAttribute');
    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.destroy();

    expect(removeAttribute).not.toHaveBeenCalledWith('style');
  });
});

describe('add()', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('newly added items are tracked and initialized', async () => {
    const { instance } = await renderFixture();

    const newEl = document.createElement('div');
    newEl.className = 'item';
    newEl.dataset.groups = 'design';
    instance.add([newEl]);

    expect(instance.getItemByElement(newEl)).toBeDefined();
    expect(instance.items.size).toBe(4);
    expect(newEl.classList.contains('shuffle-item')).toBe(true);
    expect(newEl.style.getPropertyValue('view-transition-name')).not.toBe('');
  });

  it('new items start hidden before the view transition callback fires (no flash)', async () => {
    // Keep the update callback from running so we can inspect pre-callback state.
    const startViewTransition = mockStartViewTransition({
      // Prevent the view transition from executing its inner callback.
      invokeUpdateCallback: false,
    });

    const { instance } = await renderFixture();

    const newEl = document.createElement('div');
    newEl.className = 'item';
    newEl.dataset.groups = 'design';
    instance.add([newEl]);

    expect(startViewTransition).toHaveBeenCalledOnce();
    expect(startViewTransition.mock.calls[0]?.[0]).toEqual(expect.any(Function));

    // Item is registered in the Map immediately after add()
    expect(instance.getItemByElement(newEl)).toBeDefined();
    // Item starts hidden so it won't flash as visible before the VT callback runs
    expect(newEl.classList.contains('shuffle-item--hidden')).toBe(true);
    expect(newEl.classList.contains('shuffle-item--visible')).toBe(false);

    startViewTransition.mockReset();
  });

  it('add() is idempotent for already-tracked elements', async () => {
    const { instance, items } = await renderFixture();
    const [item0] = items;

    instance.add([item0]);

    expect(instance.items.size).toBe(3);
  });

  it('new items respect the current filter after add()', async () => {
    const { instance } = await renderFixture();
    instance.filter('design');

    const newEl = document.createElement('div');
    newEl.className = 'item';
    newEl.dataset.groups = 'ux';
    instance.add([newEl]);

    const newItem = instance.getItemByElement(newEl)!;
    expect(newItem.isVisible).toBe(false);
  });
});

describe('resetItems()', () => {
  beforeEach(() => {
    mockStartViewTransition();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('surviving elements keep their existing metadata after resetItems()', async () => {
    const { instance, items } = await renderFixture();
    const [item0] = items;

    const originalItem = getGridLanesItem(instance, item0);
    const originalId = originalItem.id;
    const originalDefaultOrder = originalItem.defaultOrder;

    instance.resetItems();

    const reconciled = getGridLanesItem(instance, item0);
    expect(reconciled.id).toBe(originalId);
    expect(reconciled.defaultOrder).toBe(originalDefaultOrder);
  });

  it('newly discovered elements get fresh metadata after resetItems()', async () => {
    const { container, instance } = await renderFixture();

    const existingIds = new Set([...instance.items.values()].map((i) => i.id));

    const newEl = document.createElement('div');
    newEl.className = 'item';
    newEl.dataset.groups = 'design';
    container.append(newEl);

    instance.resetItems();

    const newItem = instance.getItemByElement(newEl)!;
    expect(newItem).toBeDefined();
    expect(existingIds.has(newItem.id)).toBe(false);
  });

  it('elements removed from DOM are dropped from the Map after resetItems()', async () => {
    const { instance, items } = await renderFixture();
    const [item0] = items;

    item0.remove();
    instance.resetItems();

    expect(instance.getItemByElement(item0)).toBeUndefined();
    expect(instance.items.size).toBe(2);
  });

  it('resetItems() while a transition is in-flight aborts the transition', async () => {
    const skipFn = vi.fn<() => void>();
    const neverResolve = createUnresolvedPromise();
    const startViewTransition = mockStartViewTransition({ finished: neverResolve, skipTransition: skipFn });
    const { instance } = await renderFixture();

    instance.filter('design');
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledOnce();
    });
    instance.resetItems();

    expect(skipFn).toHaveBeenCalledOnce();
  });
});

describe('layout() no-op', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('layout() emits shuffle:layout via microtask without calling startViewTransition', async () => {
    const startVT = mockStartViewTransition();
    const { instance } = await renderFixture();
    const callsBefore = startVT.mock.calls.length;

    const layoutSpy = vi.fn<AnyFn>();
    instance.on('shuffle:layout', layoutSpy);

    instance.layout();

    expect(layoutSpy).not.toHaveBeenCalled();
    expect(startVT.mock.calls.length).toBe(callsBefore);

    await waitForLayout(instance);
    expect(layoutSpy).toHaveBeenCalledOnce();
  });
});
