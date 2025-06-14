import TinyEmitter from 'tiny-emitter';
import parallel from 'array-parallel';

import Point from './point';
import Rect from './rect';
import ShuffleItem from './shuffle-item';
import Classes from './classes';
import getNumberStyle from './get-number-style';
import sorter from './sorter';
import { onTransitionEnd, cancelTransitionEnd } from './on-transition-end';
import { getItemPosition, getColumnSpan, getAvailablePositions, getShortColumn, getCenteredPositions } from './layout';
import arrayMax from './array-max';
import hyphenate from './hyphenate';

function arrayUnique(x) {
  return Array.from(new Set(x));
}

// Used for unique instance variables
let id = 0;

class Shuffle extends TinyEmitter {
  /**
   * Categorize, sort, and filter a responsive grid of items.
   *
   * @param {Element} element An element which is the parent container for the grid items.
   * @param {Object} [options=Shuffle.options] Options object.
   * @constructor
   */
  constructor(element, options = {}) {
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

    this._init();
    this.isInitialized = true;
  }

  _init() {
    this.items = this._getItems();
    this.sortedItems = this.items;

    this.options.sizer = this._getElementOption(this.options.sizer);

    // Add class and invalidate styles
    this.element.classList.add(Shuffle.Classes.BASE);

    // Set initial css for each item
    this._initItems(this.items);

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
    const containerCss = window.getComputedStyle(this.element, null);
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
    if ('ResizeObserver' in window) {
      this._resizeObserver = new ResizeObserver(this._handleResizeCallback.bind(this));
      this._resizeObserver.observe(this.element);
    }

    // The shuffle items haven't had transitions set on them yet so the user
    // doesn't see the first layout. Set them now that the first layout is done.
    // First, however, a synchronous layout must be caused for the previous
    // styles to be applied without transitions.
    this.element.offsetWidth;
    this.setItemTransitions(this.items);
    this.element.style.transition = `height ${this.options.speed}ms ${this.options.easing}`;
  }

  /**
   * Retrieve an element from an option.
   * @param {string|jQuery|Element} option The option to check.
   * @return {?Element} The plain element or null.
   * @private
   */
  _getElementOption(option) {
    // If column width is a string, treat is as a selector and search for the
    // sizer element within the outermost container
    if (typeof option === 'string') {
      return this.element.querySelector(option);
    }

    // Check for an element
    if (option && option.nodeType && option.nodeType === 1) {
      return option;
    }

    // Check for jQuery object
    if (option && option.jquery) {
      return option[0];
    }

    return null;
  }

  /**
   * Ensures the shuffle container has the css styles it needs applied to it.
   * @param {Object} styles Key value pairs for position and overflow.
   * @private
   */
  _validateStyles(styles) {
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
   * @param {string|string[]|function(Element):boolean} [category] Category to
   *     filter by. If it's given, the last category will be used to filter the items.
   * @param {Array} [collection] Optionally filter a collection. Defaults to
   *     all the items.
   * @return {{visible: ShuffleItem[], hidden: ShuffleItem[]}}
   * @private
   */
  _filter(category = this.lastFilter, collection = this.items) {
    const set = this._getFilteredSets(category, collection);

    // Individually add/remove hidden/visible classes
    this._toggleFilterClasses(set);

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
   * @param {string|string[]|function(Element):boolean} category Category or function to filter by.
   * @param {ShuffleItem[]} items A collection of items to filter.
   * @return {{visible: ShuffleItem[], hidden: ShuffleItem[]}}
   * @private
   */
  _getFilteredSets(category, items) {
    let visible = [];
    const hidden = [];

    // category === 'all', add visible class to everything
    if (category === Shuffle.ALL_ITEMS) {
      visible = items;

      // Loop through each item and use provided function to determine
      // whether to hide it or not.
    } else {
      items.forEach((item) => {
        if (this._doesPassFilter(category, item.element)) {
          visible.push(item);
        } else {
          hidden.push(item);
        }
      });
    }

    return {
      visible,
      hidden,
    };
  }

  /**
   * Test an item to see if it passes a category.
   * @param {string|string[]|function():boolean} category Category or function to filter by.
   * @param {Element} element An element to test.
   * @return {boolean} Whether it passes the category/filter.
   * @private
   */
  _doesPassFilter(category, element) {
    if (typeof category === 'function') {
      return category.call(element, element, this);
    }

    // Check each element's data-groups attribute against the given category.
    const attr = element.dataset[Shuffle.FILTER_ATTRIBUTE_KEY];
    const keys = this.options.delimiter ? attr.split(this.options.delimiter) : JSON.parse(attr);

    function testCategory(category) {
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
   * Toggles the visible and hidden class names.
   * @param {{visible, hidden}} Object with visible and hidden arrays.
   * @private
   */
  _toggleFilterClasses({ visible, hidden }) {
    visible.forEach((item) => {
      item.show();
    });

    hidden.forEach((item) => {
      item.hide();
    });
  }

  /**
   * Set the initial css for each item
   * @param {ShuffleItem[]} items Set to initialize.
   * @private
   */
  _initItems(items) {
    items.forEach((item) => {
      item.init();
    });
  }

  /**
   * Remove element reference and styles.
   * @param {ShuffleItem[]} items Set to dispose.
   * @private
   */
  _disposeItems(items) {
    items.forEach((item) => {
      item.dispose();
    });
  }

  /**
   * Updates the visible item count.
   * @private
   */
  _updateItemCount() {
    this.visibleItems = this._getFilteredItems().length;
  }

  /**
   * Sets css transform transition on a group of elements. This is not executed
   * at the same time as `item.init` so that transitions don't occur upon
   * initialization of a new Shuffle instance.
   * @param {ShuffleItem[]} items Shuffle items to set transitions on.
   * @protected
   */
  setItemTransitions(items) {
    const { speed, easing } = this.options;
    const positionProps = this.options.useTransforms ? ['transform'] : ['top', 'left'];

    // Allow users to transition other properties if they exist in the `before`
    // css mapping of the shuffle item.
    const cssProps = Object.keys(ShuffleItem.Css.HIDDEN.before).map((k) => hyphenate(k));
    const properties = positionProps.concat(cssProps).join();

    items.forEach((item) => {
      item.element.style.transitionDuration = `${speed}ms`;
      item.element.style.transitionTimingFunction = easing;
      item.element.style.transitionProperty = properties;
    });
  }

  _getItems() {
    return Array.from(this.element.children)
      .filter((el) => el.matches(this.options.itemSelector))
      .map((el) => new ShuffleItem(el, this.options.isRTL));
  }

  /**
   * Combine the current items array with a new one and sort it by DOM order.
   * @param {ShuffleItem[]} items Items to track.
   * @return {ShuffleItem[]}
   */
  _mergeNewItems(items) {
    const children = Array.from(this.element.children);
    return sorter(this.items.concat(items), {
      by(element) {
        return children.indexOf(element);
      },
    });
  }

  _getFilteredItems() {
    return this.items.filter((item) => item.isVisible);
  }

  _getConcealedItems() {
    return this.items.filter((item) => !item.isVisible);
  }

  /**
   * Returns the column size, based on column width and sizer options.
   * @param {number} containerWidth Size of the parent container.
   * @param {number} gutterSize Size of the gutters.
   * @return {number}
   * @private
   */
  _getColumnSize(containerWidth, gutterSize) {
    let size;

    // If the columnWidth property is a function, then the grid is fluid
    if (typeof this.options.columnWidth === 'function') {
      size = this.options.columnWidth(containerWidth);

      // columnWidth option isn't a function, are they using a sizing element?
    } else if (this.options.sizer) {
      size = Shuffle.getSize(this.options.sizer).width;

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
   * @param {number} containerWidth Size of the parent container.
   * @return {number}
   * @private
   */
  _getGutterSize(containerWidth) {
    let size;
    if (typeof this.options.gutterWidth === 'function') {
      size = this.options.gutterWidth(containerWidth);
    } else if (this.options.sizer) {
      size = getNumberStyle(this.options.sizer, 'marginLeft');
    } else {
      size = this.options.gutterWidth;
    }

    return size;
  }

  /**
   * Calculate the number of columns to be used. Gets css if using sizer element.
   * @param {number} [containerWidth] Optionally specify a container width if
   *    it's already available.
   */
  _setColumns(containerWidth = Shuffle.getSize(this.element).width) {
    const gutter = this._getGutterSize(containerWidth);
    const columnWidth = this._getColumnSize(containerWidth, gutter);
    let calculatedColumns = (containerWidth + gutter) / columnWidth;

    // Widths given from getStyles are not precise enough...
    if (Math.abs(Math.round(calculatedColumns) - calculatedColumns) < this.options.columnThreshold) {
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
  _setContainerSize() {
    this.element.style.height = `${this._getContainerSize()}px`;
  }

  /**
   * Based on the column heights, it returns the biggest one.
   * @return {number}
   * @private
   */
  _getContainerSize() {
    return arrayMax(this.positions);
  }

  /**
   * Get the clamped stagger amount.
   * @param {number} index Index of the item to be staggered.
   * @return {number}
   */
  _getStaggerAmount(index) {
    return Math.min(index * this.options.staggerAmount, this.options.staggerAmountMax);
  }

  /**
   * Emit an event from this instance.
   * @param {string} name Event name.
   * @param {Object} [data={}] Optional object data.
   */
  _dispatch(name, data = {}) {
    if (this.isDestroyed) {
      return;
    }

    data.shuffle = this;
    this.emit(name, data);
  }

  /**
   * Zeros out the y columns array, which is used to determine item placement.
   * @private
   */
  _resetCols() {
    let i = this.cols;
    this.positions = [];
    while (i) {
      i -= 1;
      this.positions.push(0);
    }
  }

  /**
   * Loops through each item that should be shown and calculates the x, y position.
   * @param {ShuffleItem[]} items Array of items that will be shown/layed
   *     out in order in their array.
   */
  _layout(items) {
    const itemPositions = this._getNextPositions(items);

    let count = 0;
    items.forEach((item, i) => {
      function callback() {
        item.applyCss(ShuffleItem.Css.VISIBLE.after);
      }

      // If the item will not change its position, do not add it to the render
      // queue. Transitions don't fire when setting a property to the same value.
      if (Point.equals(item.point, itemPositions[i]) && !item.isHidden) {
        item.applyCss(ShuffleItem.Css.VISIBLE.before);
        callback();
        return;
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
    });
  }

  /**
   * Return an array of Point instances representing the future positions of
   * each item.
   * @param {ShuffleItem[]} items Array of sorted shuffle items.
   * @return {Point[]}
   * @private
   */
  _getNextPositions(items) {
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
   * @param {{width: number, height: number}} itemSize Object with width and height.
   * @return {Point}
   * @private
   */
  _getItemPosition(itemSize) {
    return getItemPosition({
      itemSize,
      positions: this.positions,
      gridSize: this.colWidth,
      total: this.cols,
      threshold: this.options.columnThreshold,
      buffer: this.options.buffer,
    });
  }

  /**
   * Mutate positions before they're applied.
   * @param {Rect[]} itemRects Item data objects.
   * @param {number} containerWidth Width of the containing element.
   * @return {Point[]}
   * @protected
   */
  getTransformedPositions(itemRects, containerWidth) {
    return getCenteredPositions(itemRects, containerWidth);
  }

  /**
   * Hides the elements that don't match our filter.
   * @param {ShuffleItem[]} collection Collection to shrink.
   * @private
   */
  _shrink(collection = this._getConcealedItems()) {
    let count = 0;
    collection.forEach((item) => {
      function callback() {
        item.applyCss(ShuffleItem.Css.HIDDEN.after);
      }

      // Continuing would add a transitionend event listener to the element, but
      // that listener would not execute because the transform and opacity would
      // stay the same.
      // The callback is executed here because it is not guaranteed to be called
      // after the transitionend event because the transitionend could be
      // canceled if another animation starts.
      if (item.isHidden) {
        item.applyCss(ShuffleItem.Css.HIDDEN.before);
        callback();
        return;
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
    });
  }

  /**
   * Resize handler.
   * @param {ResizeObserverEntry[]} entries
   */
  _handleResizeCallback(entries) {
    // If shuffle is disabled, destroyed, don't do anything.
    // You can still manually force a shuffle update with shuffle.update({ force: true }).
    if (!this.isEnabled || this.isDestroyed) {
      return;
    }

    for (const entry of entries) {
      if (Math.round(entry.contentRect.width) !== Math.round(this.containerWidth)) {
        // If there was already an animation waiting, cancel it.
        cancelAnimationFrame(this._rafId);
        // Offload updating the DOM until the browser is ready.
        this._rafId = requestAnimationFrame(this.update.bind(this));
      }
    }
  }

  /**
   * Returns styles which will be applied to the an item for a transition.
   * @param {ShuffleItem} item Item to get styles for. Should have updated
   *   scale and point properties.
   * @param {Object} styleObject Extra styles that will be used in the transition.
   * @return {!Object} Transforms for transitions, left/top for animate.
   * @protected
   */
  getStylesForTransition(item, styleObject) {
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
   * @param {Element} element Element to listen on.
   * @param {function} itemCallback Callback for the item.
   * @param {function} done Callback to notify `parallel` that this one is done.
   */
  _whenTransitionDone(element, itemCallback, done) {
    const id = onTransitionEnd(element, (evt) => {
      itemCallback();
      done(null, evt);
    });

    this._transitions.push(id);
  }

  /**
   * Return a function which will set CSS styles and call the `done` function
   * when (if) the transition finishes.
   * @param {Object} opts Transition object.
   * @return {function} A function to be called with a `done` function.
   */
  _getTransitionFunction(opts) {
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
  _processQueue() {
    if (this.isTransitioning) {
      this._cancelMovement();
    }

    const hasSpeed = this.options.speed > 0;
    const hasQueue = this._queue.length > 0;

    if (hasQueue && hasSpeed && this.isInitialized) {
      this._startTransitions(this._queue);
    } else if (hasQueue) {
      this._styleImmediately(this._queue);
      this._dispatch(Shuffle.EventType.LAYOUT);

      // A call to layout happened, but none of the newly visible items will
      // change position or the transition duration is zero, which will not trigger
      // the transitionend event.
    } else {
      this._dispatch(Shuffle.EventType.LAYOUT);
    }

    // Remove everything in the style queue
    this._queue.length = 0;
  }

  /**
   * Wait for each transition to finish, the emit the layout event.
   * @param {Object[]} transitions Array of transition objects.
   */
  _startTransitions(transitions) {
    // Set flag that shuffle is currently in motion.
    this.isTransitioning = true;

    // Create an array of functions to be called.
    const callbacks = transitions.map((obj) => this._getTransitionFunction(obj));

    parallel(callbacks, this._movementFinished.bind(this));
  }

  _cancelMovement() {
    // Remove the transition end event for each listener.
    this._transitions.forEach(cancelTransitionEnd);

    // Reset the array.
    this._transitions.length = 0;

    // Show it's no longer active.
    this.isTransitioning = false;
  }

  /**
   * Apply styles without a transition.
   * @param {Object[]} objects Array of transition objects.
   * @private
   */
  _styleImmediately(objects) {
    if (objects.length) {
      const elements = objects.map((obj) => obj.item.element);

      Shuffle._skipTransitions(elements, () => {
        objects.forEach((obj) => {
          obj.item.applyCss(obj.styles);
          obj.callback();
        });
      });
    }
  }

  _movementFinished() {
    this._transitions.length = 0;
    this.isTransitioning = false;
    this._dispatch(Shuffle.EventType.LAYOUT);
  }

  /**
   * The magic. This is what makes the plugin 'shuffle'
   * @param {string|string[]|function(Element):boolean} [category] Category to filter by.
   *     Can be a function, string, or array of strings.
   * @param {SortOptions} [sortOptions] A sort object which can sort the visible set
   */
  filter(category, sortOptions) {
    if (!this.isEnabled) {
      return;
    }

    if (!category || (category && category.length === 0)) {
      category = Shuffle.ALL_ITEMS; // eslint-disable-line no-param-reassign
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
   * @param {SortOptions} [sortOptions] The options object to pass to `sorter`.
   */
  sort(sortOptions = this.lastSort) {
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
   * @param {object} options options object
   * @param {boolean} [options.recalculateSizes=true] Whether to calculate column, gutter, and container widths again.
   * @param {boolean} [options.force=false] By default, `update` does nothing if the instance is disabled. Setting this
   *    to true forces the update to happen regardless.
   */
  update({ recalculateSizes = true, force = false } = {}) {
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
  layout() {
    this.update({
      recalculateSizes: true,
    });
  }

  /**
   * New items have been appended to shuffle. Mix them in with the current
   * filter or sort status.
   * @param {Element[]} newItems Collection of new items.
   */
  add(newItems) {
    const items = arrayUnique(newItems).map((el) => new ShuffleItem(el, this.options.isRTL));

    // Add classes and set initial positions.
    this._initItems(items);

    // Determine which items will go with the current filter.
    this._resetCols();

    const allItems = this._mergeNewItems(items);
    const sortedItems = sorter(allItems, this.lastSort);
    const allSortedItemsSet = this._filter(this.lastFilter, sortedItems);

    const isNewItem = (item) => items.includes(item);
    const applyHiddenState = (item) => {
      item.scale = ShuffleItem.Scale.HIDDEN;
      item.isHidden = true;
      item.applyCss(ShuffleItem.Css.HIDDEN.before);
      item.applyCss(ShuffleItem.Css.HIDDEN.after);
    };

    // Layout all items again so that new items get positions.
    // Synchronously apply positions.
    const itemPositions = this._getNextPositions(allSortedItemsSet.visible);
    allSortedItemsSet.visible.forEach((item, i) => {
      if (isNewItem(item)) {
        item.point = itemPositions[i];
        applyHiddenState(item);
        item.applyCss(this.getStylesForTransition(item, {}));
      }
    });

    allSortedItemsSet.hidden.forEach((item) => {
      if (isNewItem(item)) {
        applyHiddenState(item);
      }
    });

    // Cause layout so that the styles above are applied.
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
  disable() {
    this.isEnabled = false;
  }

  /**
   * Enables shuffle again
   * @param {boolean} [isUpdateLayout=true] if undefined, shuffle will update columns and gutters
   */
  enable(isUpdateLayout = true) {
    this.isEnabled = true;
    if (isUpdateLayout) {
      this.update();
    }
  }

  /**
   * Remove 1 or more shuffle items.
   * @param {Element[]} elements An array containing one or more
   *     elements in shuffle
   * @return {Shuffle} The shuffle instance.
   */
  remove(elements) {
    if (!elements.length) {
      return;
    }

    const collection = arrayUnique(elements);

    const oldItems = collection.map((element) => this.getItemByElement(element)).filter((item) => !!item);

    const handleLayout = () => {
      this._disposeItems(oldItems);

      // Remove the collection in the callback
      collection.forEach((element) => {
        element.parentNode.removeChild(element);
      });

      this._dispatch(Shuffle.EventType.REMOVED, { collection });
    };

    // Hide collection first.
    this._toggleFilterClasses({
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
   * @param {Element} element Element to look for.
   * @return {?ShuffleItem} A shuffle item or undefined if it's not found.
   */
  getItemByElement(element) {
    return this.items.find((item) => item.element === element);
  }

  /**
   * Dump the elements currently stored and reinitialize all child elements which
   * match the `itemSelector`.
   */
  resetItems() {
    // Remove refs to current items.
    this._disposeItems(this.items);
    this.isInitialized = false;

    // Find new items in the DOM.
    this.items = this._getItems();

    // Set initial styles on the new items.
    this._initItems(this.items);

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
  destroy() {
    this._cancelMovement();
    if (this._resizeObserver) {
      this._resizeObserver.unobserve(this.element);
      this._resizeObserver = null;
    }

    // Reset container styles
    this.element.classList.remove('shuffle');
    this.element.removeAttribute('style');

    // Reset individual item styles
    this._disposeItems(this.items);

    this.items.length = 0;
    this.sortedItems.length = 0;
    this._transitions.length = 0;

    // Null DOM references
    this.options.sizer = null;
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
   * @param {Element} element The element.
   * @param {boolean} [includeMargins=false] Whether to include margins.
   * @return {{width: number, height: number}} The width and height.
   */
  static getSize(element, includeMargins = false) {
    // Store the styles so that they can be used by others without asking for it again.
    const styles = window.getComputedStyle(element, null);
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

  /**
   * Change a property or execute a function which will not have a transition
   * @param {Element[]} elements DOM elements that won't be transitioned.
   * @param {function} callback A function which will be called while transition
   *     is set to 0ms.
   * @private
   */
  static _skipTransitions(elements, callback) {
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
    elements[0].offsetWidth;

    // Put the duration back
    elements.forEach((element, i) => {
      element.style.transitionDuration = data[i].duration;
      element.style.transitionDelay = data[i].delay;
    });
  }
}

Shuffle.ShuffleItem = ShuffleItem;

Shuffle.ALL_ITEMS = 'all';
Shuffle.FILTER_ATTRIBUTE_KEY = 'groups';

/** @enum {string} */
Shuffle.EventType = {
  LAYOUT: 'shuffle:layout',
  REMOVED: 'shuffle:removed',
};

/** @enum {string} */
Shuffle.Classes = Classes;

/** @enum {string} */
Shuffle.FilterMode = {
  ANY: 'any',
  ALL: 'all',
};

// Overridable options
Shuffle.options = {
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

Shuffle.Point = Point;
Shuffle.Rect = Rect;

// Expose for testing. Hack at your own risk.
Shuffle.__sorter = sorter;
Shuffle.__getColumnSpan = getColumnSpan;
Shuffle.__getAvailablePositions = getAvailablePositions;
Shuffle.__getShortColumn = getShortColumn;
Shuffle.__getCenteredPositions = getCenteredPositions;

export default Shuffle;
