// oxlint-disable promise/prefer-await-to-then
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GridLanes from '../shuffle-lanes';
import {
  createFixture,
  createUnresolvedPromise,
  isItemVisible,
  mockStartViewTransition,
  waitForLayout,
  type AnyFn,
} from './grid-lanes.helpers';
import { createDeferred } from './test-utils';

describe('update concurrency last write wins', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('rapid filter calls result in exactly one shuffle:layout event after the filters', async () => {
    const { container } = createFixture();
    mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    await waitForLayout(instance);

    const layoutSpy = vi.fn<AnyFn>();
    instance.on('shuffle:layout', layoutSpy);

    instance.filter('design');
    instance.filter('ux');
    await waitForLayout(instance);

    expect(layoutSpy).toHaveBeenCalledOnce();
  });

  it('last filter state is what gets committed when called rapidly', async () => {
    const { container, items } = createFixture();
    const [item0] = items;
    const item2 = items.at(2)!;
    mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    instance.filter('ux');
    await waitForLayout(instance);

    expect(isItemVisible(instance, item2)).toBe(true);
    expect(isItemVisible(instance, item0)).toBe(false);
  });

  it('skipTransition is called when a second filter interrupts an in-flight transition', async () => {
    const { container } = createFixture();
    const skipFn = vi.fn<() => void>();
    const neverResolve = createUnresolvedPromise();
    const startViewTransition = mockStartViewTransition({ finished: neverResolve, skipTransition: skipFn });

    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await vi.waitFor(() => {
      expect(startViewTransition).toHaveBeenCalledOnce();
    });

    // sees transition A in-flight → skips it
    instance.filter('ux');
    await vi.waitFor(() => {
      expect(skipFn).toHaveBeenCalledOnce();
    });
  });
});

describe('no-VT fallback path', () => {
  let savedVTDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    savedVTDescriptor = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
  });

  afterEach(() => {
    document.body.innerHTML = '';
    if (savedVTDescriptor) {
      Object.defineProperty(document, 'startViewTransition', savedVTDescriptor);
    } else {
      Reflect.deleteProperty(document, 'startViewTransition');
    }
    vi.restoreAllMocks();
  });

  it('applies filter/sort state in a microtask when startViewTransition is unavailable', async () => {
    const { container, items } = createFixture();
    const [item0, item1, item2] = items;

    const instance = new GridLanes(container, { itemSelector: '.item' });
    instance.filter('design');
    await waitForLayout(instance);

    expect(isItemVisible(instance, item0)).toBe(true);
    expect(isItemVisible(instance, item1)).toBe(true);
    expect(isItemVisible(instance, item2)).toBe(false);
  });

  it('emits shuffle:layout asynchronously via microtask when VT is unavailable', async () => {
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    await waitForLayout(instance);

    const layoutSpy = vi.fn<AnyFn>();
    instance.on('shuffle:layout', layoutSpy);

    instance.filter('design');

    expect(layoutSpy).not.toHaveBeenCalled();

    await waitForLayout(instance);
    expect(layoutSpy).toHaveBeenCalledOnce();
  });
});

function rootInlineName(): string {
  return document.documentElement.style.getPropertyValue('view-transition-name');
}

function noop(): void {
  void 0;
}

describe('root snapshot suppression', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.removeProperty('view-transition-name');
    for (const element of document.querySelectorAll('style[data-shuffle-lanes-view-transition]')) {
      element.remove();
    }
    vi.restoreAllMocks();
  });

  it('excludes :root while capturing and restores afterwards', async () => {
    const deferred = createDeferred();
    mockStartViewTransition({ ready: deferred.promise });
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    // Attach before any await: layout emission is a microtask and would otherwise be missed.
    const layoutDone = waitForLayout(instance);
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('none');
    });

    deferred.resolve();
    await layoutDone;
    // Give the ready-attached release a chance to run.
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('');
    });
  });

  it('restores the author’s prior inline value verbatim', async () => {
    document.documentElement.style.setProperty('view-transition-name', 'app-root');
    const { container } = createFixture();
    mockStartViewTransition();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('app-root');
    });
  });

  it('refcounts overlapping instances so the first release does not restore early', async () => {
    const deferredA = createDeferred();
    const deferredB = createDeferred();
    const startViewTransition = mockStartViewTransition({ ready: deferredA.promise });
    const fixtureA = createFixture();
    const fixtureB = createFixture();
    const instanceA = new GridLanes(fixtureA.container, { itemSelector: '.item' });
    const instanceB = new GridLanes(fixtureB.container, { itemSelector: '.item' });

    instanceA.filter('design');
    // Attach before any await: layout emission is a microtask and would otherwise be missed.
    const layoutADone = waitForLayout(instanceA);
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('none');
    });

    // Second instance joins while the first is still capturing.
    startViewTransition.mockImplementationOnce((callbackOrOptions) => {
      if (
        typeof callbackOrOptions === 'object' &&
        callbackOrOptions !== null &&
        typeof callbackOrOptions.update === 'function'
      ) {
        callbackOrOptions.update();
      }
      return {
        finished: Promise.resolve(),
        ready: deferredB.promise,
        updateCallbackDone: Promise.resolve(),
        skipTransition: noop,
        types: new Set<string>(),
      };
    });
    instanceB.filter('ux');
    const layoutBDone = waitForLayout(instanceB);
    await layoutBDone;

    // First transition settles while the second still holds the window.
    deferredA.resolve();
    await layoutADone;
    await Promise.resolve();
    expect(rootInlineName()).toBe('none');

    deferredB.resolve();
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('');
    });
  });

  it('releases when ready rejects (skipped transition)', async () => {
    mockStartViewTransition({ ready: Promise.reject(new Error('skipped')) });
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await waitForLayout(instance);
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('');
    });
  });

  it('releases when startViewTransition throws synchronously', () => {
    mockStartViewTransition().mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    expect(() => {
      instance.update();
    }).toThrow('boom');
    expect(rootInlineName()).toBe('');
    expect(instance.isTransitioning).toBe(false);
  });

  it('releases after destroy() interrupts an in-flight transition', async () => {
    const deferred = createDeferred();
    mockStartViewTransition({ ready: deferred.promise });
    const { container } = createFixture();
    const instance = new GridLanes(container, { itemSelector: '.item' });

    instance.filter('design');
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('none');
    });

    // destroy() clears event handlers, so don't wait for layout — the release
    // is tied to `ready`, not to events.
    instance.destroy();
    deferred.resolve();
    await vi.waitFor(() => {
      expect(rootInlineName()).toBe('');
    });
  });

  it('writes nothing without view-transition support', async () => {
    const saved = Object.getOwnPropertyDescriptor(document, 'startViewTransition');
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
    try {
      const { container } = createFixture();
      const instance = new GridLanes(container, { itemSelector: '.item' });

      instance.filter('design');
      await waitForLayout(instance);
      expect(rootInlineName()).toBe('');
    } finally {
      if (saved) {
        Object.defineProperty(document, 'startViewTransition', saved);
      } else {
        Reflect.deleteProperty(document, 'startViewTransition');
      }
    }
  });
});
