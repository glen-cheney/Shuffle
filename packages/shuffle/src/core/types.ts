interface JqueryLike {
  [index: number]: HTMLElement;
  length: number;
  jquery: string;
}

export interface SortableElement {
  element: HTMLElement;
}

export type ElementOption = Element | HTMLElement | string | JqueryLike;

export type FilterModeOptions = 'any' | 'all';

export type FilterFunction<Instance = unknown> = (
  this: HTMLElement,
  element: HTMLElement,
  shuffle: Instance,
) => boolean;
export type FilterArg<Instance = unknown> = string | string[] | FilterFunction<Instance>;

export interface SortOptions<Item extends SortableElement = SortableElement> {
  // Use array.reverse() to reverse the results of your sort.
  reverse?: boolean;

  // Sorting function which gives you the element each shuffle item is using by default.
  // oxlint-disable-next-line typescript/no-explicit-any
  by?: ((element: HTMLElement) => any) | null;

  // Custom sort function.
  compare?: ((itemA: Item, itemB: Item) => number) | null;

  // If true, this will skip the sorting and return a randomized order in the array.
  randomize?: boolean;

  // Determines which property of the item is passed to the `by` function.
  key?: keyof Item;
}

export interface FilterSet<Item> {
  visible: Item[];
  hidden: Item[];
}
