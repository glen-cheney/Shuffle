---
sidebar_position: 1
---

# Getting started

Grid Lanes is a separate entry point from the classic Shuffle. It delegates layout entirely to the browser's native CSS grid (and `grid-lanes` masonry layout when available), and animates filtering and sorting using the [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API).

:::note Browser support
Browsers started implementing `display: grid-lanes` in 2026 (see [caniuse](https://caniuse.com/css-grid-lanes)). In unsupported browsers, you can use `display: grid`, but the grid will have equal-height rows. View Transitions are supported in every browser that supports `grid-lanes`.
:::

## What does Shuffle do?

Now that the browser handles layout, Shuffle provides:

- **Filtering:** tracks which items belong to the active group(s) and toggles `display: none` on items that do not match.
- **Sorting:** reorders items in the DOM so the browser renders them in the right order. Supports sorting by a data attribute, a custom comparator, or random order.
- **Animated transitions:** wraps each filter and sort update in a [View Transition](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) so items animate between their old and new positions, and hidden items fade out while revealed items fade in.
- **Item lifecycle:** manages the `.shuffle-item` class and state tracking so you can add or remove items after initialization.
- **Events:** emits `shuffle:layout` after each update and `shuffle:removed` after removed items have finished transitioning out.

## Install

```shell
npm install shufflejs
```

## Import

Grid Lanes ships as a separate subpath export. You must import **both** the JavaScript and the CSS:

```js
import GridLanes from 'shufflejs/grid-lanes';
import 'shufflejs/grid-lanes.css';
```

The CSS controls item visibility and view-transition animations. Without it, hidden items will not be removed from layout flow and the `::view-transition-*` properties will not be set.

## HTML

Add a container with items inside. Each item can have a `data-groups` attribute with whitespace-separated group tokens:

```html
<div class="grid" id="photo-grid">
  <figure class="picture-item" data-groups="nature city">
    <img src="central-park.jpg" alt="Central Park" />
  </figure>
  <figure class="picture-item" data-groups="nature">
    <img src="forest.jpg" alt="Forest" />
  </figure>
  <figure class="picture-item" data-groups="city">
    <img src="skyline.jpg" alt="City skyline" />
  </figure>
</div>
```

:::tip Group names
Group names are identifiers and must not contain spaces.
:::

## CSS

Layout is entirely CSS-owned. `GridLanes` does not set column widths or gaps. Add your own grid styles:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
  align-items: start;
}

@supports (display: grid-lanes) {
  .grid {
    display: grid-lanes;
  }
}
```

## JavaScript

```js
import GridLanes from 'shufflejs/grid-lanes';
import 'shufflejs/grid-lanes.css';

const grid = new GridLanes(document.getElementById('photo-grid'), {
  itemSelector: '.picture-item',
});

// Filter to a group
grid.filter('nature');

// Show all items
grid.filter('all');

// Sort by a data attribute
grid.sort({
  by: (element) => element.dataset.dateCreated,
});

// Restore original order
grid.sort(null);
```

## How updates work

`filter()` and `sort()` schedule a DOM update via a microtask. The DOM is **not** mutated synchronously. If you need to read the result (e.g. item visibility or order), wait for the `shuffle:layout` event:

```js
grid.filter('nature');

grid.once('shuffle:layout', () => {
  // DOM is now in its final state for this filter.
});
```

## Accessibility

Hidden items are set to `display: none`, which removes them from the keyboard tab order and the accessibility tree. Applications that manage focus after filtering should listen to `shuffle:layout` and move focus as needed.

`GridLanes` never writes `tabindex` to items. Tab order follows DOM order.
