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
