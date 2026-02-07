import { getNumber } from './get-number';
import { testComputedSize } from './computed-size';

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
  styles: CSSStyleDeclaration = window.getComputedStyle(element, null),
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
