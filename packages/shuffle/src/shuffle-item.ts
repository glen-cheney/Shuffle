import { Point } from './point';
import { Classes } from './classes';
import { InlineCssStyles, ShuffleItemCss } from './types';

let id = 0;

export class ShuffleItem {
  id: number;
  element: HTMLElement;
  isRTL: boolean;
  isVisible: boolean;
  isHidden: boolean;
  scale: number = 1;
  point: Point = new Point();

  // Static properties
  static Css: ShuffleItemCss;
  static Scale: Record<string, number>;

  constructor(element: HTMLElement, isRTL?: boolean) {
    id += 1;
    this.id = id;
    this.element = element;

    /**
     * Set correct direction of item
     */
    this.isRTL = Boolean(isRTL);

    /**
     * Used to separate items for layout and shrink.
     */
    this.isVisible = true;

    /**
     * Used to determine if a transition will happen. By the time the _layout
     * and _shrink methods get the ShuffleItem instances, the `isVisible` value
     * has already been changed by the separation methods, so this property is
     * needed to know if the item was visible/hidden before the shrink/layout.
     */
    this.isHidden = false;
  }

  show() {
    this.isVisible = true;
    this.element.classList.remove(Classes.HIDDEN);
    this.element.classList.add(Classes.VISIBLE);
    this.element.removeAttribute('aria-hidden');
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove(Classes.VISIBLE);
    this.element.classList.add(Classes.HIDDEN);
    this.element.setAttribute('aria-hidden', 'true');
  }

  init() {
    this.addClasses([Classes.SHUFFLE_ITEM, Classes.VISIBLE]);
    this.applyCss(ShuffleItem.Css.INITIAL);
    this.applyCss(this.isRTL ? ShuffleItem.Css.DIRECTION.rtl : ShuffleItem.Css.DIRECTION.ltr);
    this.scale = ShuffleItem.Scale.VISIBLE;
    this.point = new Point();
  }

  addClasses(classes: string[]) {
    for (const className of classes) {
      this.element.classList.add(className);
    }
  }

  removeClasses(classes: string[]) {
    for (const className of classes) {
      this.element.classList.remove(className);
    }
  }

  applyCss(obj: InlineCssStyles) {
    for (const [key, value] of Object.entries(obj)) {
      // @ts-expect-error shrug
      this.element.style[key] = String(value);
    }
  }

  dispose() {
    this.removeClasses([Classes.HIDDEN, Classes.VISIBLE, Classes.SHUFFLE_ITEM]);

    this.element.removeAttribute('style');
    // @ts-expect-error nullifying for garbage collection
    this.element = null;
  }
}

ShuffleItem.Css = {
  INITIAL: {
    position: 'absolute',
    top: 0,
    visibility: 'visible',
    willChange: 'transform',
  },
  DIRECTION: {
    ltr: {
      left: 0,
    },
    rtl: {
      right: 0,
    },
  },
  VISIBLE: {
    before: {
      opacity: 1,
      visibility: 'visible',
    },
    after: {
      transitionDelay: '',
    },
  },
  HIDDEN: {
    before: {
      opacity: 0,
    },
    after: {
      visibility: 'hidden',
      transitionDelay: '',
    },
  },
};

ShuffleItem.Scale = {
  VISIBLE: 1,
  HIDDEN: 0.001,
};
