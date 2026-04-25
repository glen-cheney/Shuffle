import { TinyEmitter } from './tiny-emitter';
import { GridLanesItem } from './grid-lanes-item';
import { matchesFilter } from './core/filter';
import { sorter } from './core/sorter';
import { resolveElementOption } from './core/resolve-element-option';
import { ALL_ITEMS, FILTER_ATTRIBUTE_KEY, FilterMode } from './core/constants';
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
  items: Map<HTMLElement, GridLanesItem>;
  sortedItems: GridLanesItem[];
  group: GridLanesFilterArg;
  lastFilter: GridLanesFilterArg;
  lastSort: GridLanesSortOptions | null;
  isInitialized: boolean;

  constructor(element: ElementOption, options: Partial<GridLanesOptions> = {}) {
    super();

    this.options = { ...DEFAULT_GRID_LANES_OPTIONS, ...options };
    this.group = ALL_ITEMS;
    this.lastFilter = ALL_ITEMS;
    this.lastSort = null;
    this.isInitialized = false;
    this.items = new Map<HTMLElement, GridLanesItem>();
    this.sortedItems = [];

    const el = resolveElementOption(element);
    if (!el) {
      throw new TypeError('GridLanes needs to be initialized with an element.');
    }

    this.element = el;
    console.log('set element', this.element);
    if (!this.#validateDisplay()) {
      // oxlint-disable-next-line no-console
      console.error('GridLanes container must use `display: grid` or `display: grid-lanes`.');
      this.destroy();
      return;
    }

    this.items = this.#getItems();
    this.sortedItems = this.#getAllItems();

    this.#setTransitionProps();
    this.filter(this.options.group, this.options.initialSort);
    this.isInitialized = true;
  }

  #validateDisplay(): boolean {
    const { display } = globalThis.getComputedStyle(this.element);
    return display === 'grid' || display === 'grid-lanes';
  }

  #setTransitionProps(): void {
    this.element.style.setProperty('--shuffle-grid-lanes-speed', `${this.options.speed}ms`);
    this.element.style.setProperty('--shuffle-grid-lanes-easing', this.options.easing);
  }

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

  #getAllItems(): GridLanesItem[] {
    return [...this.items.values()];
  }

  #getVisibleItems(): GridLanesItem[] {
    return this.#getAllItems().filter((item) => item.isVisible);
  }

  #applyMutation(mutate: () => void): void {
    if (!this.isInitialized) {
      mutate();
      return;
    }

    if (typeof document.startViewTransition === 'function') {
      document.startViewTransition(mutate);
    } else {
      mutate();
    }
  }

  #doesPassFilter(category: GridLanesFilterArg, element: HTMLElement): boolean {
    const groups = element.dataset[FILTER_ATTRIBUTE_KEY]?.trim().split(/\s+/).filter(Boolean) ?? [];

    return matchesFilter(groups, category, {
      filterMode: this.options.filterMode,
      element,
      instance: this,
    });
  }

  #applySort(sortedVisibleItems: GridLanesItem[]): void {
    const fragment = document.createDocumentFragment();

    for (const item of sortedVisibleItems) {
      item.show();
      fragment.append(item.element);
    }

    const visibleSet = new Set(sortedVisibleItems);
    for (const item of this.items.values()) {
      if (!visibleSet.has(item)) {
        item.hide();
        fragment.append(item.element);
      }
    }

    this.element.append(fragment);
  }

  filter(
    category: GridLanesFilterArg = this.lastFilter,
    sortOptions: GridLanesSortOptions | null = this.lastSort,
  ): void {
    let nextCategory = category;
    if (!nextCategory || nextCategory.length === 0) {
      nextCategory = ALL_ITEMS;
    }

    const allItems = this.#getAllItems();

    const visible =
      nextCategory === ALL_ITEMS
        ? allItems
        : allItems.filter((item) => this.#doesPassFilter(nextCategory, item.element));

    const sortedVisible = sorter(visible, sortOptions);
    this.sortedItems = sortedVisible;

    this.#applyMutation(() => {
      this.#applySort(sortedVisible);
    });

    this.lastFilter = nextCategory;
    this.lastSort = sortOptions;
    if (typeof nextCategory === 'string') {
      this.group = nextCategory;
    }
  }

  sort(sortOptions: GridLanesSortOptions | null = this.lastSort): void {
    const sortedVisible = sorter(this.#getVisibleItems(), sortOptions);
    this.sortedItems = sortedVisible;

    this.#applyMutation(() => {
      this.#applySort(sortedVisible);
    });

    this.lastSort = sortOptions;
  }

  getItemByElement(element: HTMLElement): GridLanesItem | undefined {
    return this.items.get(element);
  }

  destroy(): void {
    // TODO: skip any current view transitions

    // for (const item of this.items.values()) {
    //   // TODO: cleanup each item
    // }

    this.items.clear();
    this.sortedItems.length = 0;

    if (this.element) {
      this.element.style.removeProperty('--shuffle-grid-lanes-speed');
      this.element.style.removeProperty('--shuffle-grid-lanes-easing');

      // @ts-expect-error instead of creating a complicated union type for when
      // a shuffle instance is destroyed, just ignore it.
      this.element = null;
    } else {
      console.error('shoudl have had an element in destroy()');
    }
  }
}

export default GridLanes;
