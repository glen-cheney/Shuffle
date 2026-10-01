import { FilterMode } from './constants';
import type { FilterArg, FilterModeOptions } from './types';

function matchesGroups(groups: string[], category: string | string[], mode: FilterModeOptions): boolean {
  function testCategory(categoryName: string): boolean {
    return groups.includes(categoryName);
  }

  if (Array.isArray(category)) {
    if (mode === FilterMode.ANY) {
      return category.some(testCategory);
    }
    return category.every(testCategory);
  }

  return groups.includes(category);
}

export function matchesFilter<Instance>(
  groups: string[],
  category: FilterArg<Instance>,
  options: {
    filterMode: FilterModeOptions;
    element: HTMLElement;
    instance: Instance;
  },
): boolean {
  if (typeof category === 'function') {
    return category.call(options.element, options.element, options.instance);
  }

  return matchesGroups(groups, category, options.filterMode);
}
