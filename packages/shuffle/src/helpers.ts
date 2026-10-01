import type { QueueItem } from './types';

/**
 * Change a property or execute a function which will not have a transition
 * @param elements DOM elements that won't be transitioned.
 * @param callback A function which will be called while transition is set to 0ms.
 */
export function skipTransitions(elements: HTMLElement[], callback: () => void): void {
  const zero = '0ms';

  // Save current duration and delay.
  const data = elements.map((element) => {
    const { style } = element;
    const duration = style.transitionDuration;
    const delay = style.transitionDelay;

    // Set the duration to zero so it happens immediately
    style.transitionDuration = zero;
    style.transitionDelay = zero;

    return {
      duration,
      delay,
    };
  });

  callback();

  // Cause forced synchronous layout.
  // oxlint-disable-next-line no-unused-expressions
  elements[0].offsetWidth;

  // Put the duration back
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.transitionDuration = data[i].duration;
    elements[i].style.transitionDelay = data[i].delay;
  }
}

/**
 * Apply styles without a transition.
 * Array of transition objects.
 */
export function styleImmediately(objects: QueueItem[]): void {
  if (objects.length > 0) {
    const elements = objects.map((obj) => obj.item.element);

    skipTransitions(elements, () => {
      for (const obj of objects) {
        obj.item.applyCss(obj.styles);
        obj.callback();
      }
    });
  }
}

export function arrayUnique<Item>(items: Item[]): Item[] {
  return [...new Set(items)];
}

const DEFAULT_NUMBER = 0;

/**
 * Always returns a numeric value, given a value. Logic from jQuery's `isNumeric`.
 * @param value Possibly numeric value.
 * @return `value` or zero if `value` isn't numeric.
 */

export function getNumber(value: unknown): number {
  return Number.parseFloat(String(value)) || DEFAULT_NUMBER;
}

const EXPECTED_WIDTH = 10;
let computedElementSize: boolean | null = null;

export function testComputedSize(): boolean {
  if (computedElementSize !== null) {
    return computedElementSize;
  }

  const element = document.body || document.documentElement;
  const div = document.createElement('div');
  div.style.cssText = 'width:10px;padding:2px;box-sizing:border-box;';
  element.append(div);

  const { width } = globalThis.getComputedStyle(div, null);
  // Fix for issue #314
  computedElementSize = Math.round(getNumber(width)) === EXPECTED_WIDTH;

  div.remove();

  return computedElementSize;
}

/**
 * Retrieve the computed style for an element, parsed as a float.
 * @param element Element to get style for.
 * @param style Style property.
 * @param styles Optionally include clean styles to use instead of asking for
 * them again.
 * @return The parsed computed value or zero if that fails because IE will
 * return 'auto' when the element doesn't have margins instead of the computed style.
 */
export function getNumberStyle(
  element: Element,
  style: keyof CSSStyleDeclaration,
  styles: CSSStyleDeclaration = globalThis.getComputedStyle(element, null),
): number {
  let value = getNumber(styles[style]);

  // Support IE<=11 and W3C spec.
  if (!testComputedSize() && style === 'width') {
    value +=
      getNumber(styles.paddingLeft) +
      getNumber(styles.paddingRight) +
      getNumber(styles.borderLeftWidth) +
      getNumber(styles.borderRightWidth);
  } else if (!testComputedSize() && style === 'height') {
    value +=
      getNumber(styles.paddingTop) +
      getNumber(styles.paddingBottom) +
      getNumber(styles.borderTopWidth) +
      getNumber(styles.borderBottomWidth);
  }

  return value;
}

/**
 * Returns the outer width of an element, optionally including its margins.
 *
 * There are a few different methods for getting the width of an element, none of
 * which work perfectly for all Shuffle's use cases.
 *
 * 1. getBoundingClientRect() `left` and `right` properties.
 *   - Accounts for transform scaled elements, making it useless for Shuffle
 *   elements which have shrunk.
 * 2. The `offsetWidth` property.
 *   - This value stays the same regardless of the elements transform property,
 *   however, it does not return subpixel values.
 * 3. getComputedStyle()
 *   - This works great Chrome, Firefox, Safari, but IE<=11 does not include
 *   padding and border when box-sizing: border-box is set, requiring a feature
 *   test and extra work to add the padding back for IE and other browsers which
 *   follow the W3C spec here.
 *
 * @param element The element.
 * @param includeMargins Whether to include margins.
 * @return The width and height.
 */
export function getSize(element: HTMLElement, includeMargins = false): { width: number; height: number } {
  // Store the styles so that they can be used by others without asking for it again.
  const styles = globalThis.getComputedStyle(element, null);
  let width = getNumberStyle(element, 'width', styles);
  let height = getNumberStyle(element, 'height', styles);

  if (includeMargins) {
    const marginLeft = getNumberStyle(element, 'marginLeft', styles);
    const marginRight = getNumberStyle(element, 'marginRight', styles);
    const marginTop = getNumberStyle(element, 'marginTop', styles);
    const marginBottom = getNumberStyle(element, 'marginBottom', styles);
    width += marginLeft + marginRight;
    height += marginTop + marginBottom;
  }

  return {
    width,
    height,
  };
}
