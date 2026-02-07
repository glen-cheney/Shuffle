/**
 * Hyphenates a javascript style string to a css one. For example:
 * MozBoxSizing -> -moz-box-sizing.
 * @param str The string to hyphenate.
 * @return The hyphenated string.
 */
export function hyphenate(str: string): string {
  return str.replace(/([A-Z])/g, (str, m1) => `-${m1.toLowerCase()}`);
}
