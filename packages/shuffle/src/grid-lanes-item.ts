import { Classes } from './core/constants';

export class GridLanesItem {
  id: string;
  defaultOrder: number;
  element: HTMLElement;
  isVisible: boolean;

  constructor(element: HTMLElement, id: string, defaultOrder: number) {
    this.id = id;
    this.defaultOrder = defaultOrder;
    this.element = element;
    this.isVisible = true;
  }

  init(): void {
    this.element.classList.add(Classes.SHUFFLE_ITEM, Classes.VISIBLE);
    this.element.style.setProperty('view-transition-name', this.id);
    this.element.style.setProperty('view-transition-class', Classes.SHUFFLE_ITEM);
  }

  show(): void {
    this.isVisible = true;
    this.element.classList.remove(Classes.HIDDEN);
    this.element.classList.add(Classes.VISIBLE);
    this.element.removeAttribute('aria-hidden');
  }

  hide(): void {
    this.isVisible = false;
    this.element.classList.remove(Classes.VISIBLE);
    this.element.classList.add(Classes.HIDDEN);
    this.element.setAttribute('aria-hidden', 'true');
  }
}
