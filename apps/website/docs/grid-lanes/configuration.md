---
sidebar_position: 2
---

# Configuration

Here are the options you can pass to `GridLanes`. No options _need_ to be specified, but `itemSelector` should be set.

Options that control layout — column widths, gutters, centering, RTL, buffer — are intentionally absent. Those belong in your CSS. See [Getting started](./getting-started.md#css) for the recommended container setup.

## Options

### `itemSelector` [string]

Default: `'*'`

CSS selector used to identify grid items inside the container. This should almost always be set.

```js
new GridLanes(container, { itemSelector: '.picture-item' });
```

### `group` [string | string\[\]]

Default: `'all'`

Initial filter group applied on construction. Pass `'all'` or omit to show all items.

```js
new GridLanes(container, { itemSelector: '.picture-item', group: 'nature' });
```

### `filterMode` [string]

Default: `'any'`

Controls how array filters behave.

- `'any'` — item passes if it belongs to **at least one** of the given groups.
- `'all'` — item passes only if it belongs to **every** group in the array.

```js
new GridLanes(container, { itemSelector: '.picture-item', filterMode: 'all' });
```

### `initialSort` [SortOptions | null]

Default: `null`

Sort to apply on initialization. It is the same object accepted by `sort()`. See [Sorting](./configuration.md#sorting-object) below.

### `speed` [number]

Default: `250`

Transition duration in milliseconds. Written to `--shuffle-speed` on the container element and consumed by the shipped CSS.

```js
new GridLanes(container, { itemSelector: '.picture-item', speed: 400 });
```

### `easing` [string]

Default: `'cubic-bezier(0.4, 0.0, 0.2, 1)'`

CSS easing function for view transitions. Written to `--shuffle-easing` on the container.

```js
new GridLanes(container, { itemSelector: '.picture-item', easing: 'ease-in-out' });
```

### `staggerAmount` [number]

Default: `15`

Per-item animation delay offset in milliseconds. Each visible item gets an incremental delay based on its position in the sorted order. Written to `--shuffle-stagger-amount`.

### `staggerAmountMax` [number]

Default: `150`

Maximum total stagger delay in milliseconds. The per-item delay is capped at this value. Written to `--shuffle-stagger-max`.

## Sorting object

`sort()` and `initialSort` accept an object with the following properties:

### `by` [(element: HTMLElement) => unknown]

A function that receives the item's element and returns a value to sort by. Returning `undefined` reverts to original DOM order.

```js
grid.sort({
  by: (element) => element.dataset.dateCreated,
});
```

### `compare` [(a: GridLanesItem, b: GridLanesItem) => number]

A custom comparator function. Receives two `GridLanesItem` objects (each with an `.element` property). Return negative to sort `a` before `b`, positive for the reverse.

```js
grid.sort({
  compare: (a, b) => a.element.dataset.title.localeCompare(b.element.dataset.title),
});
```

### `reverse` [boolean]

Reverses the result of the `by` sort. Has no effect when used without `by`.

### `randomize` [boolean]

Randomizes item order.

```js
grid.sort({ randomize: true });
```

## API methods

### `filter(category?)`

Filters all items to the given category. `category` can be:

- A string: `grid.filter('nature')`
- An array of strings: `grid.filter(['nature', 'city'])`
- A predicate function: `grid.filter((element) => element.dataset.featured === 'true')`
- `'all'` or no argument: show all items

### `sort(sortObject?)`

Sorts the currently visible items. Pass `null` or an empty object to restore original DOM order.

### `update()`

Re-applies the current filter and sort. Useful after programmatically changing item `data-groups`.

### `layout()`

No-op in Grid Lanes mode. The browser handles geometry automatically. This method exists for API compatibility — it emits `shuffle:layout` via a microtask but does not trigger any layout recalculation.

### `add(newItems)`

Appends new items to the grid and applies the current filter and sort. `newItems` is an array of elements. New elements must be children of the container before calling `add()`.

### `remove(elements)`

Animates and removes one or more elements from the grid.

### `enable(runUpdate?)`

Re-enables the instance after `disable()`. If `runUpdate` is `true` (default), re-applies the current filter and sort immediately.

### `disable()`

Disables filter/sort/transition updates and aborts any in-flight transition.

### `resetItems()`

Re-queries `itemSelector`. Existing items keep their metadata; newly discovered elements are initialized. Use after dynamically adding items to the DOM without calling `add()`.

### `getItemByElement(element)`

Returns the internal `GridLanesItem` for an element, or `undefined` if it is not tracked.

### `destroy()`

Removes all library-owned styles, classes, and event listeners. Does not remove the container's user-authored inline styles.

## Events

Listen with `.on(eventName, handler)` and stop listening with `.off(eventName, handler)`. Use `.once(eventName, handler)` for one-time listeners.

### `shuffle:layout`

Fires after each committed filter or sort update. Always fires asynchronously — after `ViewTransition.finished` when view transitions are available, or in a microtask otherwise.

```js
grid.on('shuffle:layout', ({ shuffle }) => {
  console.log('Layout complete', shuffle.sortedItems.length, 'visible items');
});
```

### `shuffle:removed`

Fires after removed items are physically removed from the DOM, immediately after the accompanying `shuffle:layout` event.

```js
grid.on('shuffle:removed', ({ collection }) => {
  console.log('Removed', collection.length, 'items');
});
```
