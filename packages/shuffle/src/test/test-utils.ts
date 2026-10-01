// oxlint-disable eslint-plugin-react-hooks/rules-of-hooks, class-methods-use-this, no-empty-function
import { test as baseTest, type TestAPI, vi } from 'vitest';
import { fixtures } from './fixtures';
import type Shuffle from '../shuffle';

vi.mock('../transition-manager', () => ({
  createTransitionManager: () => ({
    waitForTransition: (element: HTMLElement, callback: (event: TransitionEvent) => void) => {
      setTimeout(() => {
        callback(new TransitionEvent('transitionend'));
      }, 0);
      return 'mock-transition';
    },
    cancelTransition: () => true,
    cancelAll: vi.fn(),
  }),
}));

// Coverage note: this mock triggers resize observer callback branches in tests.
type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

class MockResizeObserver {
  static callback: ResizeObserverCallback | null = null;

  constructor(callback: ResizeObserverCallback) {
    MockResizeObserver.callback = callback;
  }

  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}

const resizeObserverGlobal = globalThis as typeof globalThis & {
  ResizeObserver: typeof ResizeObserver;
};
resizeObserverGlobal.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

export function triggerResize(entries: ResizeObserverEntry[]): void {
  MockResizeObserver.callback?.(entries);
}

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
      const fixture = appendFixture(fixtureName);
      await use(fixture);
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

/**
 * A manually-settled promise for tests that need to control async timing.
 */
interface Deferred {
  promise: Promise<void>;
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

export function createDeferred(): Deferred {
  let deferredResolve!: () => void;
  let deferredReject!: (reason?: unknown) => void;
  const promise = new Promise<void>((resolve, reject) => {
    deferredResolve = resolve;
    deferredReject = reject;
  });
  return { promise, resolve: deferredResolve, reject: deferredReject };
}

export function getScopedRule(): CSSStyleRule | null {
  const styleElement = document.querySelector<HTMLStyleElement>('style[data-shuffle-lanes-view-transition]');
  const rule = styleElement?.sheet?.cssRules.item(0);
  return rule instanceof CSSStyleRule ? rule : null;
}

/**
 * Collect all accessible author rules. Cross-origin sheets throw on access,
 * so those are skipped — the shipped stylesheet is same-origin in this suite.
 */
export function collectAccessibleRules(): CSSStyleRule[] {
  const rules: CSSStyleRule[] = [];
  for (const sheet of document.styleSheets) {
    let cssRules: CSSRuleList | null = null;
    try {
      ({ cssRules } = sheet);
    } catch {
      continue;
    }
    if (!cssRules) {
      continue;
    }
    for (const rule of cssRules) {
      if (rule instanceof CSSStyleRule) {
        rules.push(rule);
      }
    }
  }
  return rules;
}

export function getDelayElements(): NodeListOf<HTMLStyleElement> {
  return document.querySelectorAll<HTMLStyleElement>('style[data-shuffle-lanes-view-transition-delays]');
}

/**
 * Read per-name delay rules from a GridLanes delay stylesheet, expanding
 * collapsed selector lists into one entry per snapshot name.
 */
export function getDelayEntries(
  element: HTMLStyleElement | null = document.querySelector<HTMLStyleElement>(
    'style[data-shuffle-lanes-view-transition-delays]',
  ),
): { selector: string; delay: string }[] {
  if (!element) {
    return [];
  }
  const entries: { selector: string; delay: string }[] = [];
  for (const rule of collectAccessibleRules()) {
    if (rule.parentStyleSheet?.ownerNode !== element) {
      continue;
    }
    const delay = rule.style.getPropertyValue('animation-delay');
    for (const selector of rule.selectorText.split(',')) {
      entries.push({ selector: selector.trim(), delay });
    }
  }
  return entries;
}
