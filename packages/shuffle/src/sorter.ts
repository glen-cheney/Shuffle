import type { ShuffleItem } from './shuffle-item';
import type { SortOptions } from './types';

/**
 * Fisher-Yates shuffle.
 * http://stackoverflow.com/a/962890/373422
 * https://bost.ocks.org/mike/shuffle/
 * @param array Array to shuffle.
 * @return Randomly sorted array.
 */
function randomize<T>(array: T[]): T[] {
  let n = array.length;

  while (n) {
    n -= 1;
    const i = Math.floor(Math.random() * (n + 1));
    const temp = array[i];
    array[i] = array[n];
    array[n] = temp;
  }

  return array;
}

const defaults = {
  // Use array.reverse() to reverse the results
  reverse: false,

  // Sorting function
  by: null,

  // Custom sort function
  compare: null,

  // If true, this will skip the sorting and return a randomized order in the array
  randomize: false,

  // Determines which property of each item in the array is passed to the
  // sorting method.
  key: 'element',
} as const;

/**
 * You can return `undefined` from the `by` function to revert to DOM order.
 * @param arr Array to sort.
 * @param options Sorting options.
 * @return The sorted array.
 */
export function sorter(arr: ShuffleItem[], options?: SortOptions | null): ShuffleItem[] {
  const opts = { ...defaults, ...options };
  const original = Array.from(arr);
  let revert = false;

  if (!arr.length) {
    return [];
  }

  if (opts.randomize) {
    return randomize(arr);
  }

  // Sort the elements by the opts.by function.
  // If we don't have opts.by, default to DOM order
  if (typeof opts.by === 'function') {
    const sortBy = opts.by;
    arr.sort((a, b) => {
      // Exit early if we already know we want to revert
      if (revert) {
        return 0;
      }

      // @ts-expect-error the key is dynamic, but we know it will be a valid key of ShuffleItem
      const valA = sortBy(a[opts.key]);
      // @ts-expect-error
      const valB = sortBy(b[opts.key]);

      // If both values are undefined, use the DOM order
      if (valA === undefined && valB === undefined) {
        revert = true;
        return 0;
      }

      if (valA < valB || valA === 'sortFirst' || valB === 'sortLast') {
        return -1;
      }

      if (valA > valB || valA === 'sortLast' || valB === 'sortFirst') {
        return 1;
      }

      return 0;
    });
  } else if (typeof opts.compare === 'function') {
    arr.sort(opts.compare);
  }

  // Revert to the original array if necessary
  if (revert) {
    return original;
  }

  if (opts.reverse) {
    arr.reverse();
  }

  return arr;
}
