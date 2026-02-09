// oxlint-disable eslint-plugin-react-hooks/rules-of-hooks
import { test as baseTest, type TestAPI, vi } from 'vitest';
import { fixtures } from './fixtures';
import type Shuffle from '../shuffle';

export function toHtmlElement(child: ChildNode | Element | null): HTMLElement {
  return child as HTMLElement;
}

export function createResizeObserverEntry(width: number): ResizeObserverEntry {
  return {
    contentRect: {
      width,
    } satisfies Partial<DOMRectReadOnly> as DOMRectReadOnly,
  } satisfies Partial<ResizeObserverEntry> as ResizeObserverEntry;
}

export function whenTransitionDoneStub(
  element: HTMLElement,
  itemCallback: () => void,
  done: (err: null, evt: TransitionEvent) => void,
): void {
  setTimeout(() => {
    done(null, new TransitionEvent('transitionend'));
  }, 0);
}

export function appendFixture(id: keyof typeof fixtures): HTMLElement {
  const content = fixtures[id].trim();
  const holder = document.createElement('div');
  holder.innerHTML = content;
  const element = toHtmlElement(holder.firstChild);
  document.body.append(element);
  return element;
}

export function getById(id: string): HTMLElement | null {
  return document.getElementById(id);
}

/**
 * Extended test context for Shuffle tests.
 */
export interface ShuffleTestContext {
  fixture: HTMLElement;
  instance: { value: Shuffle | null };
}

/**
 * Create test with a specific fixture type.
 * Provides automatic setup/teardown for fixtures and instances.
 */
export function createTest(fixtureName: keyof typeof fixtures): TestAPI<ShuffleTestContext> {
  return baseTest.extend<ShuffleTestContext>({
    // oxlint-disable-next-line no-empty-pattern
    instance: async ({}, use) => {
      const container: ShuffleTestContext['instance'] = { value: null };
      await use(container);
      // Cleanup: automatically destroy instance if it was created
      if (!container.value?.isDestroyed) {
        container.value?.destroy();
      }
    },
    // oxlint-disable-next-line no-empty-pattern
    fixture: async ({}, use) => {
      const { default: ShuffleClass } = await import('../shuffle');
      vi.spyOn(ShuffleClass.prototype, '_whenTransitionDone').mockImplementation(whenTransitionDoneStub);
      const fixture = appendFixture(fixtureName);
      await use(fixture);
      vi.restoreAllMocks();
      fixture.remove();
    },
  });
}

/**
 * Custom test function with automatic fixture setup/teardown.
 * Uses the 'regular' fixture by default.
 */
export const test: TestAPI<ShuffleTestContext> = createTest('regular');

export function childrenToArray(element: HTMLElement): HTMLElement[] {
  return Array.from(element.children, (child) => toHtmlElement(child));
}
