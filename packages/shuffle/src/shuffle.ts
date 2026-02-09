import { TinyEmitter } from './tiny-emitter';
import { parallel } from './parallel';
import { Point } from './point';
import { Rect } from './rect';
import { ShuffleItem } from './shuffle-item';
import type {
  ElementOption,
  FilterArg,
  FilterFunction,
  FilterSet,
  InlineCssStyles,
  QueueItem,
  ShuffleEventCallback,
  ShuffleEventData,
  ShuffleEventMap,
  ShuffleOptions,
  SortOptions,
} from './types';

import { Classes } from './classes';
import { getNumberStyle } from './get-number-style';
import { sorter } from './sorter';
import { onTransitionEnd, cancelTransitionEnd } from './on-transition-end';
import { getItemPosition, getCenteredPositions } from './layout';
import { disposeItems, initItems, styleImmediately, toggleFilterClasses } from './helpers';

// Re-export types for backward compatibility
export type {
  SortOptions,
  InlineCssStyles,
  ShuffleOptions,
  FilterFunction,
  FilterArg,
  ShuffleEventData,
  ShuffleEventCallback,
};

function arrayUnique<Item>(items: Item[]): Item[] {
  return [...new Set(items)];
}

function applyHiddenState(item: ShuffleItem) {
  item.scale = ShuffleItem.Scale.HIDDEN;
  item.isHidden = true;
  item.applyCss(ShuffleItem.Css.HIDDEN.before);
  item.applyCss(ShuffleItem.Css.HIDDEN.after);
}

// Used for unique instance variables
let id = 0;

class Shuffle extends TinyEmitter {
  element: HTMLElement;
  sizer: HTMLElement | null;
  options: ShuffleOptions;
  lastSort: SortOptions | null;
  group: FilterArg;
  lastFilter: FilterArg;
  isEnabled: boolean;
  isDestroyed: boolean;
  isInitialized: boolean;
  isTransitioning: boolean;
  id: string;
  items: ShuffleItem[];
  sortedItems: ShuffleItem[];
  visibleItems!: number;
  cols!: number;
  colWidth!: number;
  containerWidth!: number;
  positions!: number[];
  _transitions: string[];
  _queue: QueueItem[];
  _rafId: number | null;
  _resizeObserver: ResizeObserver | null = null;

  /**
   * Categorize, sort, and filter a responsive grid of items.
   *
   * @param element An element which is the parent container for the grid items.
   * @param options Options object.
   * @constructor
   */
  constructor(element: ElementOption, options: Partial<ShuffleOptions> = {}) {
    super();
    this.options = { ...Shuffle.options, ...options };

    this.lastSort = {};
    this.group = Shuffle.ALL_ITEMS;
    this.lastFilter = Shuffle.ALL_ITEMS;
    this.isEnabled = true;
    this.isDestroyed = false;
    this.isInitialized = false;
    this._transitions = [];
    this.isTransitioning = false;
    this._queue = [];

    const el = this._getElementOption(element);

    if (!el) {
      throw new TypeError('Shuffle needs to be initialized with an element.');
    }

    this.element = el;
    this.id = `shuffle_${id}`;
    id += 1;

    this.items = this._getItems();
    this.sortedItems = this.items;

    this.sizer = this._getElementOption(this.options.sizer);

    // Add class and invalidate styles
    this.element.classList.add(Shuffle.Classes.BASE);

    // Set initial css for each item
    initItems(this.items);

    // If the page has not already emitted the `load` event, call layout on load.
    // This avoids layout issues caused by images and fonts loading after the
    // instance has been initialized.
    if (document.readyState !== 'complete') {
      const layout = this.layout.bind(this);
      window.addEventListener('load', function onLoad() {
        window.removeEventListener('load', onLoad);
        layout();
      });
    }

    // Get container css all in one request. Causes reflow
    const containerCss = globalThis.getComputedStyle(this.element, null);
    const containerWidth = Shuffle.getSize(this.element).width;

    // Add styles to the container if it doesn't have them.
    this._validateStyles(containerCss);

    // We already got the container's width above, no need to cause another
    // reflow getting it again... Calculate the number of columns there will be
    this._setColumns(containerWidth);

    // Kick off!
    this.filter(this.options.group, this.options.initialSort);

    // Bind resize events
    this._rafId = null;
    // This is true for all supported browsers, but just to be safe, avoid throwing
    // an error if ResizeObserver is not present. You can manually add a window resize
    // event and call `update()` if ResizeObserver is missing, or use Shuffle v5.
    if ('ResizeObserver' in globalThis) {
      this._resizeObserver = new ResizeObserver(this._handleResizeCallback.bind(this));
      this._resizeObserver.observe(this.element);
    }

    // The shuffle items haven't had transitions set on them yet so the user
    // doesn't see the first layout. Set them now that the first layout is done.
    // First, however, a synchronous layout must be caused for the previous
    // styles to be applied without transitions.
    // oxlint-disable-next-line no-unused-expressions
    this.element.offsetWidth;
    this.setItemTransitions(this.items);
    this.element.style.transition = `height ${this.options.speed}ms ${this.options.easing}`;
    this.isInitialized = true;
  }

  // Override TinyEmitter methods with proper types using conditional types
  on<EventName extends keyof ShuffleEventMap>(
    event: EventName,
    callback: (data: ShuffleEventMap[EventName]) => void,
    // oxlint-disable-next-line typescript/no-explicit-any
    context?: any,
  ): this;
  // oxlint-disable-next-line typescript/no-explicit-any
  on(event: string, callback: ShuffleEventCallback, context?: any): this;
  // oxlint-disable-next-line typescript/no-explicit-any
  on(event: string, callback: ShuffleEventCallback, context?: any): this {
    return super.on(event, callback, context);
  }

  once<EventName extends keyof ShuffleEventMap>(
    event: EventName,
    callback: (data: ShuffleEventMap[EventName]) => void,
    // oxlint-disable-next-line typescript/no-explicit-any
    context?: any,
  ): this;
  // oxlint-disable-next-line typescript/no-explicit-any
  once(event: string, callback: ShuffleEventCallback, context?: any): this;
  // oxlint-disable-next-line typescript/no-explicit-any
  once(event: string, callback: ShuffleEventCallback, context?: any): this {
    return super.once(event, callback, context);
  }

  // emit(event: string, data: ShuffleEventData): this {
  emit<EventName extends keyof ShuffleEventMap>(event: EventName, data: ShuffleEventMap[EventName]): this {
    if (this.isDestroyed) {
      return this;
    }
    return super.emit(event, data);
  }

  off(event: string, callback?: ShuffleEventCallback): this {
    return super.off(event, callback);
  }

  /**
   * Retrieve an element from an option.
   * @param option The option to check.
   * @return The plain element or null.
   * @private
   */
  _getElementOption(option?: ElementOption | null): HTMLElement | null {
    // If column width is a string, treat is as a selector and search for the
    // sizer element within the outermost container
    if (typeof option === 'string') {
      return this.element.querySelector(option);
    }

    // Check for an element
    if (option && 'nodeType' in option && option.nodeType && option.nodeType === 1) {
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion
      return option as HTMLElement;
    }

    // Check for jQuery object
    if (option && 'jquery' in option) {
      return option[0];
    }

    return null;
  }

  /**
   * Ensures the shuffle container has the css styles it needs applied to it.
   * @param styles Key value pairs for position and overflow.
   * @private
   */
  _validateStyles(styles: CSSStyleDeclaration): void {
    // Position cannot be static.
    if (styles.position === 'static') {
      this.element.style.position = 'relative';
    }

    // Overflow has to be hidden.
    if (styles.overflow !== 'hidden') {
      this.element.style.overflow = 'hidden';
    }
  }

  /**
   * Filter the elements by a category.
   * @param category Category to filter by. If it's given, the last category will be used to filter the items.
   * @param collection Optionally filter a collection. Defaults to all the items.
   * @return Object with visible and hidden arrays.
   * @private
   */
  _filter(category: FilterArg = this.lastFilter, collection: ShuffleItem[] = this.items): FilterSet {
    const set = this._getFilteredSets(category, collection);

    // Individually add/remove hidden/visible classes
    toggleFilterClasses(set);

    // Save the last filter in case elements are appended.
    this.lastFilter = category;

    // This is saved mainly because providing a filter function (like searching)
    // will overwrite the `lastFilter` property every time its called.
    if (typeof category === 'string') {
      this.group = category;
    }

    return set;
  }

  /**
   * Returns an object containing the visible and hidden elements.
   * @param category Category or function to filter by.
   * @param items A collection of items to filter.
   * @private
   */
  _getFilteredSets(category: FilterArg, items: ShuffleItem[]): FilterSet {
    let visible: ShuffleItem[] = [];
    const hidden: ShuffleItem[] = [];

    // category === 'all', add visible class to everything
    if (category === Shuffle.ALL_ITEMS) {
      visible = items;

      // Loop through each item and use provided function to determine
      // whether to hide it or not.
    } else {
      for (const item of items) {
        if (this._doesPassFilter(category, item.element)) {
          visible.push(item);
        } else {
          hidden.push(item);
        }
      }
    }

    return {
      visible,
      hidden,
    };
  }

  /**
   * Test an item to see if it passes a category.
   * @param category Category or function to filter by.
   * @param element An element to test.
   * @return Whether it passes the category/filter.
   * @private
   */
  _doesPassFilter(category: FilterArg, element: HTMLElement): boolean {
    if (typeof category === 'function') {
      return category.call(element, element, this);
    }

    // Check each element's data-groups attribute against the given category.
    const attr = element.dataset[Shuffle.FILTER_ATTRIBUTE_KEY] ?? '';
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion
    const keys = this.options.delimiter ? attr.split(this.options.delimiter) : (JSON.parse(attr) as string[]);

    function testCategory(category: string): boolean {
      return keys.includes(category);
    }

    if (Array.isArray(category)) {
      if (this.options.filterMode === Shuffle.FilterMode.ANY) {
        return category.some(testCategory);
      }
      return category.every(testCategory);
    }

    return keys.includes(category);
  }

  /**
   * Updates the visible item count.
   * @private
   */
  _updateItemCount(): void {
    this.visibleItems = this._getFilteredItems().length;
  }

  /**
   * Sets css transform transition on a group of elements. This is not executed
   * at the same time as `item.init` so that transitions don't occur upon
   * initialization of a new Shuffle instance.
   * @param items Shuffle items to set transitions on.
   * @protected
   */
  setItemTransitions(items: ShuffleItem[]): void {
    const { speed, easing } = this.options;
    const positionProps = this.options.useTransforms ? ['transform'] : ['top', 'left'];

    // Allow users to transition other properties if they exist in the `before`
    // css mapping of the shuffle item.
    const cssProps = Object.keys(ShuffleItem.Css.HIDDEN.before);
    const properties = [...positionProps, ...cssProps].join(',');

    for (const item of items) {
      item.element.style.transitionDuration = `${speed}ms`;
      // @ts-expect-error TS doesn't like that we are assigning `undefined`, but
      // browsers don't have a problem with it.
      item.element.style.transitionTimingFunction = easing;
      item.element.style.transitionProperty = properties;
    }
  }

  _getItems(): ShuffleItem[] {
    return (
      // oxlint-disable-next-line unicorn/prefer-spread `children` doesn't have `Symbol.iterator`
      Array.from(this.element.children)
        .filter((el) => el.matches(this.options.itemSelector!))
        // oxlint-disable-next-line typescript/no-unsafe-type-assertion
        .map((el) => new ShuffleItem(el as HTMLElement, this.options.isRTL))
    );
  }

  /**
   * Combine the current items array with a new one and sort it by DOM order.
   * @param items Items to track.
   */
  _mergeNewItems(items: ShuffleItem[]): ShuffleItem[] {
    // oxlint-disable-next-line unicorn/prefer-spread `children` doesn't have `Symbol.iterator`
    const children = Array.from(this.element.children);
    return sorter([...this.items, ...items], {
      by(element) {
        return children.indexOf(element);
      },
    });
  }

  _getFilteredItems(): ShuffleItem[] {
    return this.items.filter((item) => item.isVisible);
  }

  _getConcealedItems(): ShuffleItem[] {
    return this.items.filter((item) => !item.isVisible);
  }

  /**
   * Returns the column size, based on column width and sizer options.
   * @param containerWidth Size of the parent container.
   * @param gutterSize Size of the gutters.
   * @private
   */
  _getColumnSize(containerWidth: number, gutterSize: number): number {
    let size;

    // If the columnWidth property is a function, then the grid is fluid
    if (typeof this.options.columnWidth === 'function') {
      size = this.options.columnWidth(containerWidth);

      // columnWidth option isn't a function, are they using a sizing element?
    } else if (this.sizer) {
      size = Shuffle.getSize(this.sizer).width;

      // if not, how about the explicitly set option?
    } else if (this.options.columnWidth) {
      size = this.options.columnWidth;

      // or use the size of the first item
    } else if (this.items.length > 0) {
      size = Shuffle.getSize(this.items[0].element, true).width;

      // if there's no items, use size of container
    } else {
      size = containerWidth;
    }

    // Don't let them set a column width of zero.
    if (size === 0) {
      size = containerWidth;
    }

    return size + gutterSize;
  }

  /**
   * Returns the gutter size, based on gutter width and sizer options.
   * @param containerWidth Size of the parent container.
   * @private
   */
  _getGutterSize(containerWidth: number): number {
    if (typeof this.options.gutterWidth === 'function') {
      return this.options.gutterWidth(containerWidth);
    }

    if (this.sizer) {
      return getNumberStyle(this.sizer, 'marginLeft');
    }

    if (this.options.gutterWidth) {
      return this.options.gutterWidth;
    }

    return 0;
  }

  /**
   * Calculate the number of columns to be used. Gets css if using sizer element.
   * @param containerWidth Optionally specify a container width if it's already available.
   */
  _setColumns(containerWidth: number = Shuffle.getSize(this.element).width): void {
    const gutter = this._getGutterSize(containerWidth);
    const columnWidth = this._getColumnSize(containerWidth, gutter);
    let calculatedColumns = (containerWidth + gutter) / columnWidth;
    // TypeScript doesn't like comparing undefined to a number, but JS allows it
    // and always returns `false`.
    const threshold = this.options.columnThreshold!;

    // Widths given from getStyles are not precise enough...
    if (Math.abs(Math.round(calculatedColumns) - calculatedColumns) < threshold) {
      // e.g. calculatedColumns = 11.998876
      calculatedColumns = Math.round(calculatedColumns);
    }

    this.cols = Math.max(Math.floor(calculatedColumns || 0), 1);
    this.containerWidth = containerWidth;
    this.colWidth = columnWidth;
  }

  /**
   * Adjust the height of the grid
   */
  _setContainerSize(): void {
    this.element.style.height = `${this._getContainerSize()}px`;
  }

  /**
   * Based on the column heights, it returns the biggest one.
   * @private
   */
  _getContainerSize(): number {
    return Math.max(...this.positions);
  }

  /**
   * Get the clamped stagger amount.
   * @param index Index of the item to be staggered.
   */
  _getStaggerAmount(index: number): number {
    return Math.min(index * this.options.staggerAmount!, this.options.staggerAmountMax!);
  }

  /**
   * Zeros out the y columns array, which is used to determine item placement.
   * @private
   */
  _resetCols(): void {
    let i = this.cols;
    this.positions = [];
    while (i) {
      i -= 1;
      this.positions.push(0);
    }
  }

  /**
   * Loops through each item that should be shown and calculates the x, y position.
   * @param items Array of items that will be shown/layed out in order in their array.
   */
  _layout(items: ShuffleItem[]): void {
    const itemPositions = this._getNextPositions(items);

    let count = 0;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const callback = () => {
        item.applyCss(ShuffleItem.Css.VISIBLE.after);
      };

      // If the item will not change its position, do not add it to the render
      // queue. Transitions don't fire when setting a property to the same value.
      if (Point.equals(item.point, itemPositions[i]) && !item.isHidden) {
        item.applyCss(ShuffleItem.Css.VISIBLE.before);
        callback();
        continue;
      }

      item.point = itemPositions[i];
      item.scale = ShuffleItem.Scale.VISIBLE;
      item.isHidden = false;

      // Clone the object so that the `before` object isn't modified when the
      // transition delay is added.
      const styles = this.getStylesForTransition(item, ShuffleItem.Css.VISIBLE.before);
      styles.transitionDelay = `${this._getStaggerAmount(count)}ms`;

      this._queue.push({
        item,
        styles,
        callback,
      });

      count += 1;
    }
  }

  /**
   * Return an array of Point instances representing the future positions of
   * each item.
   * @param items Array of sorted shuffle items.
   * @private
   */
  _getNextPositions(items: ShuffleItem[]): Point[] {
    // If position data is going to be changed, add the item's size to the
    // transformer to allow for calculations.
    if (this.options.isCentered) {
      const itemsData = items.map((item, i) => {
        const itemSize = Shuffle.getSize(item.element, true);
        const point = this._getItemPosition(itemSize);
        return new Rect(point.x, point.y, itemSize.width, itemSize.height, i);
      });

      return this.getTransformedPositions(itemsData, this.containerWidth);
    }

    // If no transforms are going to happen, simply return an array of the
    // future points of each item.
    return items.map((item) => this._getItemPosition(Shuffle.getSize(item.element, true)));
  }

  /**
   * Determine the location of the next item, based on its size.
   * @param itemSize Object with width and height.
   * @private
   */
  _getItemPosition(itemSize: { width: number; height: number }): Point {
    return getItemPosition({
      itemSize,
      positions: this.positions,
      gridSize: this.colWidth,
      total: this.cols,
      threshold: this.options.columnThreshold!,
      buffer: this.options.buffer!,
    });
  }

  /**
   * Mutate positions before they're applied.
   * @param itemRects Item data objects.
   * @param containerWidth Width of the containing element.
   * @protected
   */
  getTransformedPositions(itemRects: Rect[], containerWidth: number): Point[] {
    return getCenteredPositions(itemRects, containerWidth);
  }

  /**
   * Hides the elements that don't match our filter.
   * @param collection Collection to shrink.
   * @private
   */
  _shrink(collection: ShuffleItem[] = this._getConcealedItems()): void {
    let count = 0;
    for (const item of collection) {
      const callback = () => {
        item.applyCss(ShuffleItem.Css.HIDDEN.after);
      };

      // Continuing would add a transitionend event listener to the element, but
      // that listener would not execute because the transform and opacity would
      // stay the same.
      // The callback is executed here because it is not guaranteed to be called
      // after the transitionend event because the transitionend could be
      // canceled if another animation starts.
      if (item.isHidden) {
        item.applyCss(ShuffleItem.Css.HIDDEN.before);
        callback();
        continue;
      }

      item.scale = ShuffleItem.Scale.HIDDEN;
      item.isHidden = true;

      const styles = this.getStylesForTransition(item, ShuffleItem.Css.HIDDEN.before);
      styles.transitionDelay = `${this._getStaggerAmount(count)}ms`;

      this._queue.push({
        item,
        styles,
        callback,
      });

      count += 1;
    }
  }

  /**
   * Resize handler.
   * @param entries
   */
  _handleResizeCallback(entries: ResizeObserverEntry[]): void {
    // If shuffle is disabled, destroyed, don't do anything.
    // You can still manually force a shuffle update with shuffle.update({ force: true }).
    if (!this.isEnabled || this.isDestroyed) {
      return;
    }

    for (const entry of entries) {
      if (Math.round(entry.contentRect.width) !== Math.round(this.containerWidth)) {
        // If there was already an animation waiting, cancel it.
        cancelAnimationFrame(this._rafId!);
        // Offload updating the DOM until the browser is ready.
        this._rafId = requestAnimationFrame(() => {
          this.update();
        });
      }
    }
  }

  /**
   * Returns styles which will be applied to the an item for a transition.
   * @param item Item to get styles for. Should have updated scale and point properties.
   * @param styleObject Extra styles that will be used in the transition.
   * @return Transforms for transitions, left/top for animate.
   */
  protected getStylesForTransition(item: ShuffleItem, styleObject: InlineCssStyles): InlineCssStyles {
    // Clone the object to avoid mutating the original.
    const styles = { ...styleObject };

    if (this.options.useTransforms) {
      const sign = this.options.isRTL ? '-' : '';
      const x = this.options.roundTransforms ? Math.round(item.point.x) : item.point.x;
      const y = this.options.roundTransforms ? Math.round(item.point.y) : item.point.y;
      styles.transform = `translate(${sign}${x}px, ${y}px) scale(${item.scale})`;
    } else {
      if (this.options.isRTL) {
        styles.right = `${item.point.x}px`;
      } else {
        styles.left = `${item.point.x}px`;
      }
      styles.top = `${item.point.y}px`;
    }

    return styles;
  }

  /**
   * Listen for the transition end on an element and execute the itemCallback
   * when it finishes.
   * @param element Element to listen on.
   * @param itemCallback Callback for the item.
   * @param done Callback to notify `parallel` that this one is done.
   */
  _whenTransitionDone(
    element: HTMLElement,
    itemCallback: () => void,
    done: (err: null, evt: TransitionEvent) => void,
  ): void {
    const id = onTransitionEnd(element, (evt) => {
      itemCallback();
      done(null, evt);
    });

    this._transitions.push(id);
  }

  /**
   * Return a function which will set CSS styles and call the `done` function
   * when (if) the transition finishes.
   * @param opts Transition object.
   */
  _getTransitionFunction(opts: QueueItem): (done: (err: null, evt: TransitionEvent) => void) => void {
    return (done) => {
      opts.item.applyCss(opts.styles);
      this._whenTransitionDone(opts.item.element, opts.callback, done);
    };
  }

  /**
   * Execute the styles gathered in the style queue. This applies styles to elements,
   * triggering transitions.
   * @private
   */
  _processQueue(): void {
    if (this.isTransitioning) {
      this._cancelMovement();
    }

    const hasSpeed = typeof this.options.speed === 'number' && this.options.speed > 0;
    const hasQueue = this._queue.length > 0;

    if (hasQueue && hasSpeed && this.isInitialized) {
      this._startTransitions(this._queue);
    } else if (hasQueue) {
      styleImmediately(this._queue);
      this.emit(Shuffle.EventType.LAYOUT, { type: Shuffle.EventType.LAYOUT, shuffle: this });

      // A call to layout happened, but none of the newly visible items will
      // change position or the transition duration is zero, which will not trigger
      // the transitionend event.
    } else {
      this.emit(Shuffle.EventType.LAYOUT, { type: Shuffle.EventType.LAYOUT, shuffle: this });
    }

    // Remove everything in the style queue
    this._queue.length = 0;
  }

  /**
   * Wait for each transition to finish, the emit the layout event.
   * Array of transition objects.
   */
  _startTransitions(transitions: QueueItem[]): void {
    // Set flag that shuffle is currently in motion.
    this.isTransitioning = true;

    // Create an array of functions to be called.
    const callbacks = transitions.map((obj) => this._getTransitionFunction(obj));

    parallel(callbacks, this._movementFinished.bind(this));
  }

  _cancelMovement(): void {
    // Remove the transition end event for each listener.
    for (const transition of this._transitions) {
      cancelTransitionEnd(transition);
    }

    // Reset the array.
    this._transitions.length = 0;

    // Show it's no longer active.
    this.isTransitioning = false;
  }

  _movementFinished(): void {
    this._transitions.length = 0;
    this.isTransitioning = false;
    this.emit(Shuffle.EventType.LAYOUT, { type: Shuffle.EventType.LAYOUT, shuffle: this });
  }

  /**
   * The magic. This is what makes the plugin 'shuffle'
   * @param category Category to filter by. Can be a function, string, or array of strings.
   * @param sortOptions A sort object which can sort the visible set
   */
  filter(category?: FilterArg, sortOptions?: SortOptions | null): void {
    if (!this.isEnabled) {
      return;
    }

    if (!category || (category && category.length === 0)) {
      // oxlint-disable-next-line no-param-reassign
      category = Shuffle.ALL_ITEMS;
    }

    this._filter(category);

    // Shrink each hidden item
    this._shrink();

    // How many visible elements?
    this._updateItemCount();

    // Update transforms on visible elements so they will animate to their new positions.
    this.sort(sortOptions);
  }

  /**
   * Gets the visible elements, sorts them, and passes them to layout.
   * @param sortOptions The options object to pass to `sorter`.
   */
  sort(sortOptions: SortOptions | null = this.lastSort): void {
    if (!this.isEnabled) {
      return;
    }

    this._resetCols();

    const items = sorter(this._getFilteredItems(), sortOptions);
    this.sortedItems = items;

    this._layout(items);

    // `_layout` always happens after `_shrink`, so it's safe to process the style
    // queue here with styles from the shrink method.
    this._processQueue();

    // Adjust the height of the container.
    this._setContainerSize();

    this.lastSort = sortOptions;
  }

  /**
   * Reposition everything.
   * @param options options object
   * @param options.recalculateSizes Whether to calculate column, gutter, and container widths again.
   * @param options.force By default, `update` does nothing if the instance is disabled. Setting this
   *    to true forces the update to happen regardless.
   */
  update({ recalculateSizes = true, force = false }: { recalculateSizes?: boolean; force?: boolean } = {}): void {
    if (this.isEnabled || force) {
      if (recalculateSizes) {
        this._setColumns();
      }

      // Layout items
      this.sort();
    }
  }

  /**
   * Use this instead of `update()` if you don't need the columns and gutters updated
   * Maybe an image inside `shuffle` loaded (and now has a height), which means calculations
   * could be off.
   */
  layout(): void {
    this.update({
      recalculateSizes: true,
    });
  }

  /**
   * New items have been appended to shuffle. Mix them in with the current
   * filter or sort status.
   * @param newItems Collection of new items.
   */
  add(newItems: HTMLElement[]): void {
    const items = arrayUnique(newItems).map((el) => new ShuffleItem(el, this.options.isRTL));

    // Add classes and set initial positions.
    initItems(items);

    // Determine which items will go with the current filter.
    this._resetCols();

    const allItems = this._mergeNewItems(items);
    const sortedItems = sorter(allItems, this.lastSort);
    const allSortedItemsSet = this._filter(this.lastFilter, sortedItems);

    // Layout all items again so that new items get positions.
    // Synchronously apply positions.
    const itemPositions = this._getNextPositions(allSortedItemsSet.visible);
    for (let i = 0; i < allSortedItemsSet.visible.length; i += 1) {
      const item = allSortedItemsSet.visible[i];
      if (items.includes(item)) {
        item.point = itemPositions[i];
        applyHiddenState(item);
        item.applyCss(this.getStylesForTransition(item, {}));
      }
    }

    for (const item of allSortedItemsSet.hidden) {
      if (items.includes(item)) {
        applyHiddenState(item);
      }
    }

    // Cause layout so that the styles above are applied.
    // oxlint-disable-next-line no-unused-expressions
    this.element.offsetWidth;

    // Add transition to each item.
    this.setItemTransitions(items);

    // Update the list of items.
    this.items = this._mergeNewItems(items);

    // Update layout/visibility of new and old items.
    this.filter(this.lastFilter);
  }

  /**
   * Disables shuffle from updating dimensions and layout on resize
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Enables shuffle again
   * @param isUpdateLayout if undefined, shuffle will update columns and gutters
   */
  enable(isUpdateLayout = true): void {
    this.isEnabled = true;
    if (isUpdateLayout) {
      this.update();
    }
  }

  /**
   * Remove 1 or more shuffle items.
   * @param elements An array containing one or more elements in shuffle
   */
  remove(elements: HTMLElement[]): void {
    if (elements.length === 0) {
      return;
    }

    const collection = arrayUnique(elements);

    // oxlint-disable-next-line typescript/no-unsafe-type-assertion Oxlint doesn't understand the `Boolean` guard.
    const oldItems = collection.map((element) => this.getItemByElement(element)).filter(Boolean) as ShuffleItem[];

    const handleLayout = () => {
      disposeItems(oldItems);

      // Remove the collection in the callback
      for (const element of collection) {
        element.remove();
      }

      this.emit(Shuffle.EventType.REMOVED, { type: Shuffle.EventType.REMOVED, shuffle: this, collection });
    };

    // Hide collection first.
    toggleFilterClasses({
      visible: [],
      hidden: oldItems,
    });

    this._shrink(oldItems);

    this.sort();

    // Update the list of items here because `remove` could be called again
    // with an item that is in the process of being removed.
    this.items = this.items.filter((item) => !oldItems.includes(item));
    this._updateItemCount();

    this.once(Shuffle.EventType.LAYOUT, handleLayout);
  }

  /**
   * Retrieve a shuffle item by its element.
   * @param element Element to look for.
   * @return A shuffle item or undefined if it's not found.
   */
  getItemByElement(element: HTMLElement): ShuffleItem | undefined {
    return this.items.find((item) => item.element === element);
  }

  /**
   * Dump the elements currently stored and reinitialize all child elements which
   * match the `itemSelector`.
   */
  resetItems(): void {
    // Remove refs to current items.
    disposeItems(this.items);
    this.isInitialized = false;

    // Find new items in the DOM.
    this.items = this._getItems();

    // Set initial styles on the new items.
    initItems(this.items);

    this.once(Shuffle.EventType.LAYOUT, () => {
      // Add transition to each item.
      this.setItemTransitions(this.items);
      this.isInitialized = true;
    });

    // Lay out all items.
    this.filter(this.lastFilter);
  }

  /**
   * Destroys shuffle, removes events, styles, and classes
   */
  destroy(): void {
    this._cancelMovement();
    if (this._resizeObserver) {
      this._resizeObserver.unobserve(this.element);
      this._resizeObserver = null;
    }

    // Reset container styles
    this.element.classList.remove('shuffle');
    this.element.removeAttribute('style');

    // Reset individual item styles
    disposeItems(this.items);

    this.items.length = 0;
    this.sortedItems.length = 0;
    this._transitions.length = 0;

    // Null DOM references
    this.sizer = null;
    // @ts-expect-error instead of creating a complicated union type for when
    // a shuffle instance is destroyed, just ignore it.
    this.element = null;

    // Set a flag so if a debounced resize has been triggered,
    // it can first check if it is actually isDestroyed and not doing anything
    this.isDestroyed = true;
    this.isEnabled = false;
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
  static getSize(element: HTMLElement, includeMargins = false): { width: number; height: number } {
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

  static ShuffleItem: typeof ShuffleItem = ShuffleItem;
  static ALL_ITEMS = 'all';
  static FILTER_ATTRIBUTE_KEY = 'groups';

  /** @enum {string} */
  static EventType = {
    LAYOUT: 'shuffle:layout',
    REMOVED: 'shuffle:removed',
  } as const;

  /** @enum {string} */
  static Classes: {
    readonly BASE: 'shuffle';
    readonly SHUFFLE_ITEM: 'shuffle-item';
    readonly VISIBLE: 'shuffle-item--visible';
    readonly HIDDEN: 'shuffle-item--hidden';
  } = Classes;

  /** @enum {string} */
  static FilterMode = {
    ANY: 'any',
    ALL: 'all',
  } as const;

  // Overridable options
  static options: ShuffleOptions = {
    // Initial filter group.
    group: Shuffle.ALL_ITEMS,

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
    filterMode: Shuffle.FilterMode.ANY,

    // Attempt to center grid items in each row.
    isCentered: false,

    // Attempt to align grid items to right.
    isRTL: false,

    // Whether to round pixel values used in translate(x, y). This usually avoids
    // blurriness.
    roundTransforms: true,
  };

  static Point: typeof Point = Point;
  static Rect: typeof Rect = Rect;
}

// oxlint-disable-next-line import/no-default-export
export default Shuffle;
