import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import GridLanes from '../shuffle-lanes';
import { createFixture, waitForLayout } from './grid-lanes.helpers';
import { collectAccessibleRules, getScopedRule } from './test-utils';

const SCOPED_SELECTOR = ':root:active-view-transition-type(shuffle-lanes)::view-transition';

describe('view transition interactivity', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.removeProperty('view-transition-name');
    for (const element of document.querySelectorAll('style[data-shuffle-lanes-view-transition]')) {
      element.remove();
    }
    vi.restoreAllMocks();
  });

  // Skipped (not passed) where View Transitions are unavailable.
  it.runIf(typeof document.startViewTransition === 'function')(
    'suppresses the root snapshot so outside content stays clickable mid-transition',
    async () => {
      const { container } = createFixture();
      const probe = document.createElement('button');
      probe.type = 'button';
      probe.textContent = 'probe';
      probe.style.position = 'fixed';
      probe.style.top = '0';
      probe.style.left = '0';
      let clickCount = 0;
      probe.addEventListener('click', () => {
        clickCount += 1;
      });
      document.body.append(probe);

      const instance = new GridLanes(container, { itemSelector: '.item', speed: 2000 });

      // Record every inline value during the transition: with a real VT the
      // call→ready window (~1 frame) is shorter than any polling interval.
      const seenRootNames: string[] = [];
      const observer = new MutationObserver(() => {
        seenRootNames.push(document.documentElement.style.getPropertyValue('view-transition-name'));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

      instance.filter('design');
      // Attach before any await: layout emission is a microtask and would otherwise be missed.
      const layoutDone = waitForLayout(instance);

      // The commit is scheduled via microtask, so wait for the scoped rule to appear mid-transition.
      await vi.waitFor(() => {
        expect(document.querySelector('style[data-shuffle-lanes-view-transition]')).not.toBeNull();
      });

      // Singleton scope: exactly one style element.
      const styleElements = document.querySelectorAll<HTMLStyleElement>('style[data-shuffle-lanes-view-transition]');
      expect(styleElements).toHaveLength(1);
      const rule = getScopedRule();
      expect(rule).toBeInstanceOf(CSSStyleRule);
      expect(rule?.selectorText).toBe(SCOPED_SELECTOR);

      // The overlay root is the click-through layer: both the dynamic rule (runtime
      // vars) and the static shipped stylesheet must set pointer-events:none here.
      expect(rule?.style.getPropertyValue('pointer-events')).toBe('none');
      const staticOverlayRules = collectAccessibleRules().filter(
        (candidate) => candidate.selectorText === SCOPED_SELECTOR,
      );
      expect(staticOverlayRules.length).toBeGreaterThan(0);
      for (const candidate of staticOverlayRules) {
        expect(candidate.style.getPropertyValue('pointer-events')).toBe('none');
      }
      expect(rule?.style.getPropertyValue('--shuffle-speed')).toBe('2000ms');

      // Root snapshot is excluded via inline style (not a stylesheet) for the capture window.
      expect(seenRootNames).toContain('none');

      // Container clipping was rejected: never set overflow inline.
      expect(container.style.getPropertyValue('overflow')).toBe('');

      // A real hit-tested click outside the grid lands mid-transition.
      // The transition must still be in flight, or this assertion is vacuous.
      expect(instance.isTransitioning).toBe(true);
      await userEvent.click(probe);
      expect(clickCount).toBe(1);

      // Let the real transition finish so headless Chromium has no dangling work.
      await layoutDone;
      observer.disconnect();
      expect(document.documentElement.style.getPropertyValue('view-transition-name')).toBe('');
    },
  );

  it('disables the root cross-fade in the shipped stylesheet as a fallback', () => {
    // The shipped stylesheet is same-origin in this suite, so its rules are
    // always accessible here — no fallback path needed.
    const rootRules = collectAccessibleRules().filter(
      (rule) =>
        rule.selectorText.includes('::view-transition-old(root)') ||
        rule.selectorText.includes('::view-transition-new(root)'),
    );
    expect(rootRules.length).toBeGreaterThan(0);
    for (const rule of rootRules) {
      // `animation: none` in the author stylesheet serializes to longhands in CSSOM.
      expect(rule.style.getPropertyValue('animation-name')).toBe('none');
    }
  });
});
