import { TinyEmitter } from './tiny-emitter';
import { GridLanesItem } from './grid-lanes-item';
import { matchesFilter } from './core/filter';
import { sorter } from './core/sorter';
import { resolveElementOption } from './core/resolve-element-option';
import { ALL_ITEMS, EventType, FILTER_ATTRIBUTE_KEY, FilterMode } from './core/constants';
import type {
  ElementOption,
  FilterArg as CoreFilterArg,
  FilterFunction as CoreFilterFunction,
  FilterModeOptions,
  SortOptions as CoreSortOptions,
} from './core/types';

export interface GridLanesOptions {
  itemSelector: string;
  group?: string | string[];
  filterMode?: FilterModeOptions;
  initialSort?: CoreSortOptions<GridLanesItem> | null;
  speed?: number;
  easing?: string;
  staggerAmount?: number;
  staggerAmountMax?: number;
}

export type GridLanesSortOptions = CoreSortOptions<GridLanesItem>;
export type GridLanesFilterFunction = CoreFilterFunction<GridLanes>;
export type GridLanesFilterArg = CoreFilterArg<GridLanes>;

interface ResolvedGridLanesOptions {
  itemSelector: string;
  group: string | string[];
  filterMode: FilterModeOptions;
  initialSort: CoreSortOptions<GridLanesItem> | null;
  speed: number;
  easing: string;
  staggerAmount: number;
  staggerAmountMax: number;
}

const DEFAULT_GRID_LANES_OPTIONS: ResolvedGridLanesOptions = {
  itemSelector: '*',
  group: ALL_ITEMS,
  filterMode: FilterMode.ANY,
  initialSort: null,
  speed: 250,
  easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  staggerAmount: 15,
  staggerAmountMax: 150,
};

let itemIdCounter = 0;
let defaultOrderCounter = 0;

class GridLanes extends TinyEmitter {
  element: HTMLElement;
  options: ResolvedGridLanesOptions;
  items: Map<HTMLElement, GridLanesItem> = new Map<HTMLElement, GridLanesItem>();
  sortedItems: GridLanesItem[] = [];
  group: GridLanesFilterArg = ALL_ITEMS;
  lastFilter: GridLanesFilterArg = ALL_ITEMS;
  lastSort: GridLanesSortOptions | null = null;
  isInitialized = false;
  isTransitioning = false;
  #activeTransition: ViewTransition | null = null;
  #pendingRemovals: GridLanesItem[] = [];

  /**
   * Categorize and sort a grid of items using native grid-lanes behavior.
   *
   * @param element An element which is the parent container for the grid items.
   * @param options Options object.
   * @constructor
   */
  constructor(element: ElementOption, options: Partial<GridLanesOptions> = {}) {
    super();

    this.options = { ...DEFAULT_GRID_LANES_OPTIONS, ...options };

    const el = resolveElementOption(element);
    if (!el) {
      throw new TypeError('GridLanes needs to be initialized with an element.');
    }

    this.element = el;
    if (!this.#validateDisplay()) {
      // oxlint-disable-next-line no-console
      console.error('GridLanes container must use `display: grid` or `display: grid-lanes`.');
      this.destroy();
      return;
    }

    this.items = this.#getItems();
    this.sortedItems = this.#getAllItems();

    this.#setTransitionProps();

    // Apply initial filter and sort synchronously, bypassing view transitions.
    const initialGroup = this.options.group;
    this.lastFilter = !initialGroup || initialGroup.length === 0 ? ALL_ITEMS : initialGroup;
    if (typeof this.lastFilter === 'string') {
      this.group = this.lastFilter;
    }
    this.lastSort = this.options.initialSort ?? null;
    this.#applyUpdate();
    this.#flushRemovals();
    this.isInitialized = true;
    queueMicrotask(() => {
      this.#movementFinished();
    });
  }

  /**
   * Ensures the grid-lanes container uses a supported display mode.
   */
  #validateDisplay(): boolean {
    const { display } = globalThis.getComputedStyle(this.element);
    return display === 'grid' || display === 'grid-lanes';
  }

  /**
   * Apply css custom properties used by GridLanes transitions.
   */
  #setTransitionProps(): void {
    this.element.style.setProperty('--shuffle-speed', `${this.options.speed}ms`);
    this.element.style.setProperty('--shuffle-easing', this.options.easing);
    this.element.style.setProperty('--shuffle-stagger-amount', `${this.options.staggerAmount}ms`);
    this.element.style.setProperty('--shuffle-stagger-max', `${this.options.staggerAmountMax}ms`);
  }

  /**
   * Get all elements matching `itemSelector` and convert them to GridLanesItems.
   */
  #getItems(): Map<HTMLElement, GridLanesItem> {
    const items = new Map<HTMLElement, GridLanesItem>();
    // Cannot spread NodeList.
    // oxlint-disable-next-line unicorn/prefer-spread
    const elements = Array.from(this.element.querySelectorAll(this.options.itemSelector));

    for (const node of elements) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }

      const id = `shuffle-item-${itemIdCounter}`;
      itemIdCounter += 1;

      const defaultOrder = defaultOrderCounter;
      defaultOrderCounter += 1;

      const item = new GridLanesItem(node, id, defaultOrder);
      item.init();
      items.set(node, item);
    }

    return items;
  }

  /**
   * Get all tracked items as an array.
   */
  #getAllItems(): GridLanesItem[] {
    return [...this.items.values()];
  }

  /**
   * Test an item to see if it passes the current filter.
   * @param category Category or function to filter by.
   * @param element An element to test.
   * @return Whether it passes the category/filter.
   */
  #doesPassFilter(category: GridLanesFilterArg, element: HTMLElement): boolean {
    const groupsValue = element.dataset[FILTER_ATTRIBUTE_KEY]?.trim() ?? '';
    const groups = groupsValue === '' ? [] : groupsValue.split(/\s+/);

    return matchesFilter(groups, category, {
      filterMode: this.options.filterMode,
      element,
      instance: this,
    });
  }

  /**
   * Sort a collection of visible items.
   * @param items The items to sort.
   * @return The sorted items.
   */
  #sortItems(items: GridLanesItem[]): GridLanesItem[] {
    if (!this.lastSort) {
      // Default: restore original encounter order via defaultOrder.
      return items.toSorted((itemA, itemB) => itemA.defaultOrder - itemB.defaultOrder);
    }
    return sorter(items, this.lastSort);
  }

  /**
   * Recompute filter/sort state and update DOM order.
   */
  #applyUpdate(): void {
    const allItems = this.#getAllItems();

    // Determine which items pass the current filter.
    const filteredItems =
      this.lastFilter === ALL_ITEMS
        ? allItems
        : allItems.filter((item) => this.#doesPassFilter(this.lastFilter, item.element));

    // Sort the visible items.
    const sortedVisible = this.#sortItems(filteredItems);
    this.sortedItems = sortedVisible;

    // Build a fragment: sorted visible items first (shown), then hidden items at the end.
    const fragment = document.createDocumentFragment();
    const visibleSet = new Set(sortedVisible);

    for (const item of sortedVisible) {
      item.show();
      fragment.append(item.element);
    }

    for (const item of this.items.values()) {
      if (!visibleSet.has(item)) {
        item.hide();
        fragment.append(item.element);
      }
    }

    this.element.append(fragment);
  }

  /**
   * Remove items queued for deferred removal.
   */
  #flushRemovals(): void {
    for (const item of this.#pendingRemovals) {
      item.element.remove();
      this.items.delete(item.element);
    }
    this.#pendingRemovals.length = 0;
  }

  /**
   * Mark movement complete and emit the layout event.
   */
  #movementFinished(): void {
    this.isTransitioning = false;
    this.emit(EventType.LAYOUT, this);
  }

  /**
   * Track a view transition lifecycle and finalize state when it ends.
   * @param vt Native view transition object.
   */
  async #monitorViewTransition(vt: ViewTransition): Promise<void> {
    try {
      await vt.finished;
    } catch {
      // Transition was skipped or aborted — cleanup still runs in finally.
    } finally {
      if (this.#activeTransition === vt) {
        this.#activeTransition = null;
        this.#movementFinished();
      }
    }
  }

  /**
   * Commit the pending update using view transitions when available.
   */
  #commit(): void {
    // Last-write-wins: cancel any in-flight transition before starting a new one.
    if (this.#activeTransition) {
      this.#activeTransition.skipTransition();
      this.#flushRemovals();
    }

    this.isTransitioning = true;

    if (typeof document.startViewTransition === 'function' && this.isInitialized) {
      const vt = document.startViewTransition(() => {
        this.#applyUpdate();
        this.#flushRemovals();
      });
      this.#activeTransition = vt;
      // Wait for the view transition to finish.
      void this.#monitorViewTransition(vt);
    } else {
      this.#applyUpdate();
      this.#flushRemovals();
      queueMicrotask(() => {
        this.#movementFinished();
      });
    }
  }

  /**
   * The magic. This is what makes the plugin 'shuffle'.
   * @param category Category to filter by. Can be a function, string, or array of strings.
   * @param sortOptions A sort object which can sort the visible set.
   */
  filter(
    category: GridLanesFilterArg = this.lastFilter,
    sortOptions: GridLanesSortOptions | null = this.lastSort,
  ): void {
    let nextCategory = category;
    if (!nextCategory || nextCategory.length === 0) {
      nextCategory = ALL_ITEMS;
    }

    this.lastFilter = nextCategory;
    if (typeof nextCategory === 'string') {
      this.group = nextCategory;
    }

    this.lastSort = sortOptions;

    this.#commit();
  }

  /**
   * Gets the visible elements, sorts them, and commits a re-render.
   * @param sortOptions The options object to pass to `sorter`.
   */
  sort(sortOptions: GridLanesSortOptions | null = null): void {
    this.lastSort = sortOptions;
    this.#commit();
  }

  /**
   * Recalculate filter/sort state and re-render items.
   */
  update(): void {
    this.#commit();
  }

  /**
   * Keep for API compatibility and layout lifecycle events.
   * Browser layout is native, so this method only emits `shuffle:layout`.
   */
  layout(): void {
    queueMicrotask(() => {
      this.#movementFinished();
    });
  }

  /**
   * Retrieve a grid-lanes item by its element.
   * @param element Element to look for.
   * @return A grid-lanes item or undefined if it's not found.
   */
  getItemByElement(element: HTMLElement): GridLanesItem | undefined {
    return this.items.get(element);
  }

  /**
   * Destroys GridLanes and removes item state and transition properties.
   */
  destroy(): void {
    if (this.#activeTransition) {
      this.#activeTransition.skipTransition();
      this.#activeTransition = null;
    }

    for (const item of this.items.values()) {
      item.dispose();
    }

    this.items.clear();
    this.sortedItems.length = 0;
    this.#pendingRemovals.length = 0;

    if (this.element) {
      this.element.style.removeProperty('--shuffle-speed');
      this.element.style.removeProperty('--shuffle-easing');
      this.element.style.removeProperty('--shuffle-stagger-amount');
      this.element.style.removeProperty('--shuffle-stagger-max');

      // @ts-expect-error instead of creating a complicated union type for when
      // a shuffle instance is destroyed, just ignore it.
      this.element = null;
    }
  }
}

export default GridLanes;
