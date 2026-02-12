import type { ShuffleOptions } from './shuffle';
import type { FilterModeOptions, ShuffleEventMap } from './types';

export const Classes = {
  BASE: 'shuffle',
  SHUFFLE_ITEM: 'shuffle-item',
  VISIBLE: 'shuffle-item--visible',
  HIDDEN: 'shuffle-item--hidden',
} as const;

export const ALL_ITEMS = 'all';

export const FILTER_ATTRIBUTE_KEY = 'groups';

export const FilterMode: {
  ANY: 'any';
  ALL: 'all';
} = {
  ANY: 'any',
  ALL: 'all',
} satisfies Record<string, FilterModeOptions>;

export const EventType: {
  LAYOUT: 'shuffle:layout';
  REMOVED: 'shuffle:removed';
} = {
  LAYOUT: 'shuffle:layout',
  REMOVED: 'shuffle:removed',
} satisfies Record<string, keyof ShuffleEventMap>;

export const DEFAULT_OPTIONS: ShuffleOptions = {
  // Initial filter group.
  group: ALL_ITEMS,

  // Transition/animation speed (milliseconds).
  speed: 250,

  // CSS easing function to use.
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',

  // e.g. '.picture-item'.
  itemSelector: '*',

  // Element or selector string. Use an element to determine the size of columns
  // and gutters.
  sizer: null,

  // A static number or function that tells the plugin how wide the gutters
  // between columns are (in pixels).
  gutterWidth: 0,

  // A static number or function that returns a number which tells the plugin
  // how wide the columns are (in pixels).
  columnWidth: 0,

  // If your group is not json, and is comma delimited, you could set delimiter
  // to ','.
  delimiter: null,

  // Useful for percentage based heights when they might not always be exactly
  // the same (in pixels).
  buffer: 0,

  // Reading the width of elements isn't precise enough and can cause columns to
  // jump between values.
  columnThreshold: 0.01,

  // Shuffle can be initialized with a sort object. It is the same object
  // given to the sort method.
  initialSort: null,

  // Transition delay offset for each item in milliseconds.
  staggerAmount: 15,

  // Maximum stagger delay in milliseconds.
  staggerAmountMax: 150,

  // Whether to use transforms or absolute positioning.
  useTransforms: true,

  // Affects using an array with filter. e.g. `filter(['one', 'two'])`. With "any",
  // the element passes the test if any of its groups are in the array. With "all",
  // the element only passes if all groups are in the array.
  // Note, this has no effect if you supply a custom filter function.
  filterMode: FilterMode.ANY,

  // Attempt to center grid items in each row.
  isCentered: false,

  // Attempt to align grid items to right.
  isRTL: false,

  // Whether to round pixel values used in translate(x, y). This usually avoids
  // blurriness.
  roundTransforms: true,
} as const;
