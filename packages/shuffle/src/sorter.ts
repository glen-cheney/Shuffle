import type { ShuffleItem } from './shuffle-item';
import type { SortOptions } from './types';

/**
 * Fisher-Yates shuffle.
 * http://stackoverflow.com/a/962890/373422
 * https://bost.ocks.org/mike/shuffle/
 * @param array Array to shuffle.
 * @return Randomly sorted array.
 */
function randomize<Item>(array: Item[]): Item[] {
  let count = array.length;

  while (count) {
    count -= 1;
    const index = Math.floor(Math.random() * (count + 1));
    const temp = array[index];
    array[index] = array[count];
    array[count] = temp;
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
// oxlint-disable-next-line max-lines-per-function, max-statements
export function sorter(arr: ShuffleItem[], options?: SortOptions | null): ShuffleItem[] {
  const opts = { ...defaults, ...options };
  const original = [...arr];
  let revert = false;

  if (arr.length === 0) {
    return [];
  }

  if (opts.randomize) {
    return randomize(arr);
  }

  // Sort the elements by the opts.by function.
  // If we don't have opts.by, default to DOM order
  if (typeof opts.by === 'function') {
    const sortBy = opts.by;
    // oxlint-disable-next-line max-statements
    arr.sort((itemA, itemB) => {
      // Exit early if we already know we want to revert
      if (revert) {
        return 0;
      }

      const itemAValue = itemA[opts.key];
      const itemBValue = itemB[opts.key];
      // @ts-expect-error the key is dynamic, but we know it will be a valid key of ShuffleItem
      // oxlint-disable-next-line typescript/no-unsafe-assignment
      const valA = sortBy(itemAValue);
      // @ts-expect-error dynamic key
      // oxlint-disable-next-line typescript/no-unsafe-assignment
      const valB = sortBy(itemBValue);

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
