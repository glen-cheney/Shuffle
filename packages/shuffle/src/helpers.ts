import { ShuffleItem } from './shuffle-item';
import type { FilterSet, QueueItem } from './types';

/**
 * Toggles the visible and hidden class names.
 * @param Object with visible and hidden arrays.
 */
export function toggleFilterClasses({ visible, hidden }: FilterSet): void {
  for (const item of visible) {
    item.show();
  }

  for (const item of hidden) {
    item.hide();
  }
}

/**
 * Set the initial css for each item
 * @param items Set to initialize.
 */
export function initItems(items: ShuffleItem[]): void {
  for (const item of items) {
    item.init();
  }
}

/**
 * Remove element reference and styles.
 * @param items Set to dispose.
 */
export function disposeItems(items: ShuffleItem[]): void {
  for (const item of items) {
    item.dispose();
  }
}

/**
 * Change a property or execute a function which will not have a transition
 * @param elements DOM elements that won't be transitioned.
 * @param callback A function which will be called while transition is set to 0ms.
 */
export function skipTransitions(elements: HTMLElement[], callback: () => void): void {
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
  // oxlint-disable-next-line no-unused-expressions
  elements[0].offsetWidth;

  // Put the duration back
  for (let i = 0; i < elements.length; i += 1) {
    elements[i].style.transitionDuration = data[i].duration;
    elements[i].style.transitionDelay = data[i].delay;
  }
}

/**
 * Apply styles without a transition.
 * Array of transition objects.
 */
export function styleImmediately(objects: QueueItem[]): void {
  if (objects.length > 0) {
    const elements = objects.map((obj) => obj.item.element);

    skipTransitions(elements, () => {
      for (const obj of objects) {
        obj.item.applyCss(obj.styles);
        obj.callback();
      }
    });
  }
}
export function applyHiddenState(item: ShuffleItem): void {
  item.scale = ShuffleItem.Scale.HIDDEN;
  item.isHidden = true;
  item.applyCss(ShuffleItem.Css.HIDDEN.before);
  item.applyCss(ShuffleItem.Css.HIDDEN.after);
}
export function arrayUnique<Item>(items: Item[]): Item[] {
  return [...new Set(items)];
}
