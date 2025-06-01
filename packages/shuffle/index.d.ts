// Type definitions for Shuffle 6.0.0
// Project: https://github.com/glen-cheney/Shuffle
// Definitions by: Glen Cheney <https://github.com/glen-cheney>

import { TinyEmitter } from 'tiny-emitter';

export as namespace Shuffle;
export default Shuffle;

/** Default options that can be overridden. */
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
  filterMode?: Shuffle.FilterMode;

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
  sizer?: HTMLElement | string;

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
  by?: ((element: Shuffle.ShuffleItem['element']) => any) | null;

  // Custom sort function.
  compare?: ((a: Shuffle.ShuffleItem, b: Shuffle.ShuffleItem) => number) | null;

  // If true, this will skip the sorting and return a randomized order in the array.
  randomize?: boolean;

  // Determines which property of the `ShuffleItem` instance is passed to the `by` function.
  key?: keyof Shuffle.ShuffleItem;
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
export interface ShuffleEventData {
  shuffle: Shuffle;
  collection?: HTMLElement[];
}
export type ShuffleEventCallback = (data: ShuffleEventData) => void;

declare class Shuffle extends TinyEmitter {
  constructor(element: HTMLElement, options?: ShuffleOptions);

  on(event: Shuffle.EventType, callback: ShuffleEventCallback, context?: any): this;
  once(event: Shuffle.EventType, callback: ShuffleEventCallback, context?: any): this;
  // Use inherited version of emit.
  off(event: Shuffle.EventType, callback?: ShuffleEventCallback): this;

  /**
   * New items have been appended to shuffle. Mix them in with the current filter or sort status.
   * @param {HTMLElement[]} newItems Collection of new items.
   */
  add(newItems: HTMLElement[]): void;

  /**
   * Destroys shuffle, removes events, styles, and classes
   */
  destroy(): void;

  /**
   * Disables shuffle from updating dimensions and layout on resize
   */
  disable(): void;

  /**
   * Enables shuffle again.
   * @param {boolean} [isUpdateLayout=true] if undefined, shuffle will update columns and gutters
   */
  enable(isUpdateLayout?: boolean): void;

  /**
   * Filter items.
   * @param {FilterArg} [category] Category to filter by.
   *     Can be a function, string, or array of strings.
   * @param {SortOptions} [sortOptions] A sort object which can sort the visible set
   */
  filter(category?: FilterArg, sortOptions?: SortOptions): void;

  /**
   * Retrieve a shuffle item by its element.
   * @param {HTMLElement} element Element to look for.
   */
  getItemByElement(element: HTMLElement): Shuffle.ShuffleItem | null;

  /**
   * Use this instead of `update()` if you don't need the columns and gutters updated
   * Maybe an image inside `shuffle` loaded (and now has a height), which means calculations
   * could be off.
   */
  layout(): void;

  /**
   * Remove 1 or more shuffle items.
   * @param {HTMLElement[]} elements An array containing one or more
   *     elements in shuffle
   */
  remove(elements: HTMLElement[]): Shuffle;

  /**
   * Dump the elements currently stored and reinitialize all child elements which
   * match the `itemSelector`.
   */
  resetItems(): void;

  /**
   * Gets the visible elements, sorts them, and passes them to layout.
   * @param {SortOptions} [sortOptions] The options object to pass to `sorter`.
   */
  sort(sortOptions?: SortOptions): void;

  /**
   * Reposition everything.
   * @param {object} options options object
   * @param {boolean} [options.recalculateSizes=true] Whether to calculate column, gutter, and container widths again.
   * @param {boolean} [options.force=false] By default, `update` does nothing if the instance is disabled. Setting this
   *    to true forces the update to happen regardless.
   */
  update(options?: { recalculateSizes?: boolean; force?: boolean }): void;

  /**
   * Returns styles which will be applied to the an item for a transition.
   * @param {object} obj Transition options.
   */
  protected getStylesForTransition(obj: { item: Shuffle.ShuffleItem; styles: InlineCssStyles }): InlineCssStyles;

  /**
   * Mutate positions before they're applied.
   * @param {Shuffle.Rect[]} itemRects Item data objects.
   * @param {number} containerWidth Width of the containing element.
   */
  protected getTransformedPositions(itemRects: Shuffle.Rect[], containerWidth: number): Shuffle.Point[];

  /**
   * Sets css transform transition on a group of elements. This is not executed
   * at the same time as `item.init` so that transitions don't occur upon
   * initialization of Shuffle.
   * @param {ShuffleItem[]} items Shuffle items to set transitions on.
   */
  protected setItemTransitions(items: Shuffle.ShuffleItem[]): void;

  /** Width of one column */
  colWidth: number;

  /** Total number of columns */
  cols: number;

  /** Width of `element` */
  containerWidth: number;

  /** Main element */
  element: HTMLElement;

  /** Current filter group */
  group: string;

  /** Unique identifier for this instance */
  id: string;

  /** Whether this instance has been destroyed */
  isDestroyed: boolean;

  /** Whether this instance is enabled */
  isEnabled: boolean;

  /** Whether this instance has been initialized */
  isInitialized: boolean;

  /** Whether items are currently transitioning */
  isTransitioning: boolean;

  /** ShuffleItems being kept track of, sorted in DOM order. */
  items: Shuffle.ShuffleItem[];

  /** Visible ShuffleItems being tracked, sorted in the current sort order */
  sortedItems: Shuffle.ShuffleItem[];

  lastFilter: FilterArg;
  lastSort: SortOptions;

  /** Current (merged) options */
  options: ShuffleOptions;

  /** Item positions */
  positions: number[];

  /** Number of currently visible items */
  visibleItems: number;

  /**
   * Returns the outer width of an element, optionally including its margins.
   * @param {HTMLElement} element The element.
   * @param {boolean} [includeMargins=false] Whether to include margins.
   */
  static getSize(element: HTMLElement, includeMargins?: boolean): { width: number; height: number };
}

declare namespace Shuffle {
  /** Filter string for all items */
  let ALL_ITEMS: string;

  /** Data attribute key to use. */
  let FILTER_ATTRIBUTE_KEY: string;

  /** Class name strings */
  enum Classes {
    BASE = 'shuffle',
    SHUFFLE_ITEM = 'shuffle-item',
    VISIBLE = 'shuffle-item--visible',
    HIDDEN = 'shuffle-item--hidden',
  }

  /** Event types emitted by the instance */
  enum EventType {
    LAYOUT = 'shuffle:layout',
    REMOVED = 'shuffle:removed',
  }

  /** Available filter modes. */
  enum FilterMode {
    ALL = 'all',
    ANY = 'any',
  }

  /** ShuffleItem class */
  class ShuffleItem {
    constructor(element: HTMLElement);
    addClasses(classes: string[]): void;
    applyCss(obj: InlineCssStyles): void;
    dispose(): void;
    hide(): void;
    init(): void;
    removeClasses(classes: string[]): void;
    show(): void;
    id: number;
    element: HTMLElement;
    isVisible: boolean;
    static Css: ShuffleItemCss;
    static Scale: {
      HIDDEN: number;
      VISIBLE: number;
    };
  }

  class Rect {
    constructor(x: number, y: number, w: number, h: number, id?: number);
    id: number;
    left: number;
    top: number;
    width: number;
    height: number;
    static intersects(a: Rect, b: Rect): boolean;
  }

  class Point {
    constructor(x?: number, y?: number);
    x: number;
    y: number;
    static equals(a: Point, b: Point): boolean;
  }
}
