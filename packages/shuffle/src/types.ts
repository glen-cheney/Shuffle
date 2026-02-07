import type Shuffle from './shuffle';
import type { ShuffleItem } from './shuffle-item';

interface JqueryLike {
  [index: number]: HTMLElement;
  length: number;
  jquery: string;
}

export type ElementOption = Element | HTMLElement | string | JqueryLike;

export interface ShuffleOptions {
  /**
   * Useful for percentage based heights when they might not always be exactly
   * the same (in pixels).
   */
  buffer?: number;

  /**
   * Reading the width of elements isn't precise enough and can cause columns to
   * jump between values.
   */
  columnThreshold?: number;

  /**
   * A static number or function that returns a number which determines
   * how wide the columns are (in pixels).
   */
  columnWidth?: number | ((containerWidth: number) => number);

  /**
   * If your group is not json, and is comma delimited, you could set delimiter to ','.
   */
  delimiter?: string | null;

  /**
   * CSS easing function to use.
   */
  easing?: string;

  /**
   * Affects using an array with filter. e.g. `filter(['one', 'two'])`. With "any",
   * the element passes the test if any of its groups are in the array. With "all",
   * the element only passes if all groups are in the array.
   */
  filterMode?: string;

  /**
   * Initial filter group.
   */
  group?: string;

  /**
   * A static number or function that determines how wide the gutters
   * between columns are (in pixels).
   */
  gutterWidth?: number | ((containerWidth: number) => number);

  /**
   * Shuffle can be initialized with a sort object. It is the same object
   * given to the sort method.
   */
  initialSort?: SortOptions | null;

  /**
   * Whether to center grid items in the row with the leftover space.
   */
  isCentered?: boolean;

  /**
   * Whether to align grid items to the right in the row.
   */
  isRTL?: boolean;

  /**
   * e.g. '.picture-item'.
   */
  itemSelector?: string;

  /**
   * Whether to round pixel values used in translate(x, y). This usually avoids blurriness.
   */
  roundTransforms?: boolean;

  /**
   * Element or selector string. Use an element to determine the size of columns and gutters.
   */
  sizer?: ElementOption | null;

  /**
   * Transition/animation speed (milliseconds).
   */
  speed?: number;

  /**
   * Transition delay offset for each item in milliseconds.
   */
  staggerAmount?: number;

  /**
   * Maximum stagger delay in milliseconds.
   */
  staggerAmountMax?: number;

  /**
   * Whether to use transforms or absolute positioning.
   */
  useTransforms?: boolean;
}

export interface SortOptions {
  // Use array.reverse() to reverse the results of your sort.
  reverse?: boolean;

  // Sorting function which gives you the element each shuffle item is using by default.
  by?: ((element: HTMLElement) => any) | null;

  // Custom sort function.
  compare?: ((a: ShuffleItem, b: ShuffleItem) => number) | null;

  // If true, this will skip the sorting and return a randomized order in the array.
  randomize?: boolean;

  // Determines which property of the `ShuffleItem` instance is passed to the `by` function.
  key?: keyof ShuffleItem;
}

export interface InlineCssStyles {
  [property: string]: string | number;
}

export interface ShuffleItemCss {
  INITIAL: InlineCssStyles;
  DIRECTION: {
    ltr: InlineCssStyles;
    rtl: InlineCssStyles;
  };
  VISIBLE: {
    before: InlineCssStyles;
    after: InlineCssStyles;
  };
  HIDDEN: {
    before: InlineCssStyles;
    after: InlineCssStyles;
  };
}

export type FilterFunction = (this: HTMLElement, element: HTMLElement, shuffle: Shuffle) => boolean;
export type FilterArg = string | string[] | FilterFunction;

export interface RemovedEventType {
  collection: HTMLElement[];
  type: 'shuffle:removed';
}

export interface LayoutEventType {
  type: 'shuffle:layout';
}

export type ShuffleEventMap = {
  'shuffle:removed': RemovedEventType & { shuffle: Shuffle };
  'shuffle:layout': LayoutEventType & { shuffle: Shuffle };
};

/**
 * Union of all event data types.
 * Automatically derived from ShuffleEventMap.
 */
export type ShuffleEventData = ShuffleEventMap[keyof ShuffleEventMap];

/**
 * Generic callback type that accepts any event data.
 * Automatically derived from ShuffleEventMap.
 */
export type ShuffleEventCallback = (data: ShuffleEventData) => void;

/**
 * Union of event types (without the shuffle property).
 */
export type ShuffleEventType = RemovedEventType | LayoutEventType;
