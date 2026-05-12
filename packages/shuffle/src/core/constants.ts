import type { FilterModeOptions } from './types';

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

export const EventType = {
  LAYOUT: 'shuffle:layout',
  REMOVED: 'shuffle:removed',
} as const;
