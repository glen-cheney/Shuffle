---
sidebar_position: 3
---

# Migration from classic Shuffle

This guide is for developers moving from the classic `shufflejs` entry point to `shufflejs/grid-lanes`.

The public API surface (`filter`, `sort`, `add`, `remove`, `update`, `layout`, `enable`, `disable`, `destroy`, `resetItems`, `getItemByElement`) and the event names (`shuffle:layout`, `shuffle:removed`) are unchanged. Most migrations are a change to your import, your CSS, and your HTML attributes.

## 1. Update your import

**Before:**

```js
import Shuffle from 'shufflejs';
```

**After:**

```js
import GridLanes from 'shufflejs/grid-lanes';
import 'shufflejs/grid-lanes.css';
```

The CSS import is required. It controls item visibility and view-transition animations.

## 2. Replace CSS layout options with real CSS

Classic Shuffle accepted JavaScript options to control layout geometry. In Grid Lanes, layout is fully CSS-owned.

| Classic option    | Replacement                                        |
| ----------------- | -------------------------------------------------- |
| `columnWidth`     | `grid-template-columns` in your CSS                |
| `gutterWidth`     | `gap` in your CSS                                  |
| `sizer`           | `minmax()` / `fr` units in `grid-template-columns` |
| `buffer`          | `flow-tolerance` CSS property on the container     |
| `columnThreshold` | No replacement — the browser handles column sizing |
| `isCentered`      | `justify-content: center` in your CSS              |
| `isRTL`           | `direction: rtl` in your CSS                       |
| `useTransforms`   | Not applicable — no JS positioning                 |
| `roundTransforms` | Not applicable — no JS positioning                 |

**Before:**

```js
new Shuffle(container, {
  itemSelector: '.picture-item',
  columnWidth: 260,
  gutterWidth: 20,
  speed: 400,
});
```

**After:**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  align-items: start;
}

@supports (display: grid-lanes) {
  .grid {
    display: grid-lanes;
  }
}
```

```js
new GridLanes(container, {
  itemSelector: '.picture-item',
  speed: 400,
});
```

Legacy options (`columnWidth`, `gutterWidth`, etc.) are silently ignored at runtime in Grid Lanes.

## 3. Update `data-groups` format

Classic Shuffle supports JSON arrays and custom delimiters:

```html
<!-- classic: JSON array -->
<div data-groups='["nature", "city"]'>…</div>

<!-- classic: comma delimiter -->
<div data-groups="nature,city">…</div>
```

Grid Lanes uses **whitespace-separated tokens only**:

```html
<div data-groups="nature city">…</div>
```

The `delimiter` option is not supported.

## 4. Remove CSS transitions on items

Classic Shuffle adds `transition: opacity …, transform …` to `.shuffle-item`. If you have custom CSS that also applies CSS transitions to your items, **remove them**. CSS transitions on items conflict with view transitions and cause a snap-back artifact at the end of each animation.

## 5. DOM mutation timing

Classic Shuffle mutates the DOM synchronously when `filter()` or `sort()` is called. Grid Lanes schedules the update in a microtask.

**Before:**

```js
shuffle.filter('nature');
// DOM is already updated here in classic Shuffle
doSomethingWithDOM();
```

**After:**

```js
grid.filter('nature');
// Wait for the layout event
grid.once('shuffle:layout', () => {
  doSomethingWithDOM();
});
```

## 6. Visibility: `display: none` instead of `visibility: hidden`

Classic Shuffle hides items with `visibility: hidden` (items remain in layout flow). Grid Lanes uses `display: none`, which removes items from layout flow and the accessibility tree.

## 7. No `resize` handling

Classic Shuffle listens to window resize events and recalculates column widths. Grid Lanes has no resize listener because the browser reflows the grid instantly on resize.
