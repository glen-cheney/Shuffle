const DEFAULT_NUMBER = 0;

/**
 * Always returns a numeric value, given a value. Logic from jQuery's `isNumeric`.
 * @param value Possibly numeric value.
 * @return `value` or zero if `value` isn't numeric.
 */
export function getNumber(value: unknown): number {
  return Number.parseFloat(String(value)) || DEFAULT_NUMBER;
}
