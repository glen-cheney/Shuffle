// oxlint-disable unicorn/prefer-spread
import { type Mock, vi } from 'vitest';

import type GridLanes from '../shuffle-lanes';
import type { GridLanesItem } from '../grid-lanes-item';

export function createTemplateFixture(html: string): HTMLElement {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const container = template.content.firstElementChild;

  if (!(container instanceof HTMLElement)) {
    throw new TypeError('Expected fixture root element.');
  }

  document.body.append(container);
  return container;
}

export function queryElement(container: ParentNode, selector: string): HTMLElement {
  const element = container.querySelector(selector);
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(`Missing element: ${selector}`);
  }
  return element;
}

export function getGridLanesItem(instance: GridLanes, element: HTMLElement): GridLanesItem {
  const item = instance.getItemByElement(element);
  if (!item) {
    throw new TypeError('Expected GridLanesItem for element.');
  }
  return item;
}

export function isItemVisible(instance: GridLanes, element: HTMLElement): boolean {
  return getGridLanesItem(instance, element).isVisible;
}

export function waitForLayout(instance: GridLanes): Promise<void> {
  return new Promise((resolve) => {
    instance.once('shuffle:layout', () => {
      resolve();
    });
  });
}

export function waitForRemoved(instance: GridLanes): Promise<void> {
  return new Promise((resolve) => {
    instance.once('shuffle:removed', () => {
      resolve();
    });
  });
}

export function createFixture(): { container: HTMLElement; items: HTMLElement[] } {
  const container = createTemplateFixture(`
    <div style="display: grid;">
      <div class="item" data-groups="design red">Item 1</div>
      <div class="item" data-groups="design blue">Item 2</div>
      <div class="item" data-groups="ux green">Item 3</div>
    </div>
  `);

  const items = Array.from(container.querySelectorAll<HTMLElement>('.item'));
  return { container, items };
}

export function createMultiGroupFixture(): {
  container: HTMLElement;
  itemA: HTMLElement;
  itemB: HTMLElement;
  itemC: HTMLElement;
} {
  const container = createTemplateFixture(`
    <div style="display: grid;">
      <div class="item" data-test-id="a" data-groups="nature featured"></div>
      <div class="item" data-test-id="b" data-groups="nature"></div>
      <div class="item" data-test-id="c" data-groups="featured"></div>
    </div>
  `);

  const itemA = queryElement(container, '[data-test-id="a"]');
  const itemB = queryElement(container, '[data-test-id="b"]');
  const itemC = queryElement(container, '[data-test-id="c"]');
  return { container, itemA, itemB, itemC };
}

export function createSortFixture(): { container: HTMLElement; items: HTMLElement[] } {
  const container = createTemplateFixture(`
    <div style="display: grid;">
      <div class="item" data-sort-value="3"></div>
      <div class="item" data-sort-value="1"></div>
      <div class="item" data-sort-value="2"></div>
    </div>
  `);

  const items = Array.from(container.querySelectorAll<HTMLElement>('.item'));
  return { container, items };
}

// oxlint-disable-next-line typescript/no-explicit-any
export type AnyFn = (...args: any[]) => any;

function noop(): void {
  void 0;
}

export function createUnresolvedPromise<Result = void>(): Promise<Result> {
  return new Promise<Result>(noop);
}

export function mockStartViewTransition({
  finished = Promise.resolve(),
  skipTransition = noop,
  invokeUpdateCallback = true,
}: {
  finished?: Promise<void>;
  skipTransition?: () => void;
  invokeUpdateCallback?: boolean;
} = {}): Mock<(callbackOptions?: ViewTransitionUpdateCallback | StartViewTransitionOptions) => ViewTransition> {
  return vi.spyOn(document, 'startViewTransition').mockImplementation((callbackOrOptions) => {
    if (typeof callbackOrOptions === 'function' && invokeUpdateCallback) {
      callbackOrOptions();
    }
    return {
      finished,
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition,
      types: { forEach: noop },
    } as unknown as ViewTransition;
  });
}
