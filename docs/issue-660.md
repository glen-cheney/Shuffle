# Shuffle Grid Lanes + View Transitions Implementation Plan

> Tracking issue: https://github.com/glen-cheney/Shuffle/issues/660

## Background

Shuffle currently does layout with JavaScript: it measures items, calculates column positions, and applies absolute positioning via CSS transforms. Grid-lanes (`display: grid-lanes`) is a new CSS feature that gives the browser native masonry layout — the browser handles column sizing, item placement, and reflow. View Transitions (`document.startViewTransition()`) provide animated transitions between DOM states without manual position tracking.

The goal is a new entry point (separate from the current `shuffle.ts`) that delegates layout entirely to CSS and uses view transitions for animation. Shuffle retains ownership of filtering, sorting, events, and the public API surface.

## Architecture decision: new entry point, not a rewrite

Create a new file `packages/shuffle/src/shuffle-lanes.ts` rather than modifying `shuffle.ts`. Reasons:

1. Grid-lanes requires Safari Technology Preview 234+ and has no other browser support yet. The existing entry point must continue to work everywhere.
2. The internal architecture is fundamentally different — no column calculation, no position tracking, no `_layout()` / `_shrink()` cycle.
3. Users can opt in via `import Shuffle from 'shufflejs/grid-lanes'` (or a subpath export).
4. Once grid-lanes reaches Baseline, the main entry point could re-export `GridLanes` with a deprecation notice.

Implementation note: `GridLanes` is a standalone class (does not extend `Shuffle`). Shared logic (filter matching, group parsing, and sort orchestration) must be extracted into a shared core to avoid duplication and feature drift.

## ✅ Phase 0: Core logic extraction (#680)

Before implementing the new class, extract the "brain" of Shuffle into a new directory `packages/shuffle/src/core/`. This ensures that bug fixes or improvements to filtering/sorting logic automatically apply to both the legacy and lanes-based implementations.

1.  **`core/filter.ts`**: Extract the matching engine (checking if a `string[]` of groups satisfies a filter criteria). **Group parsing remains internal to each class** since the strategies (tokens vs JSON/delimiters) are fundamentally different.
2.  **`core/sorter.ts`**: Refactor the existing sorter into a generic utility that can operate on any collection of objects containing an `element: HTMLElement` property. `src/sorter.ts` should no longer be needed.
3.  **`core/constants.ts` & `core/types.ts`**: Move shared strings and TypeScript definitions.

### Phase 0 validation checkpoint

- [x] Core filtering/sorting logic is extracted into `src/core/`
- [x] No new lint errors or warnings introduced
- [x] Existing tests pass without modification
- [x] Moved constants and types are not re-exported from `src/types.ts`

## ✅ Phase 1: Core class scaffold (#682)

Create a new `GridLanes` class with a clean, grid-lanes-specific options interface. Refer to `shuffle-to-grid-lanes-mapping.js` for the full breakdown. The constructor should:

1. Accept `element` and `options` (same signature as `Shuffle`).
2. Validate that the container's computed `display` is `grid` or `grid-lanes`. If it is anything else, throw a `TypeError`.
3. Query `itemSelector` to find items.
4. Maintain a primary **`Map<HTMLElement, GridLanesItem>`** for all items. This provides O(1) lookup for `getItemByElement` and centralized lifecycle management.
5. Assign each item a unique string ID (e.g., `shuffle-item-{id}`) from a module-level monotonic counter. This ID serves as the `view-transition-name`.
6. Cache each item's `defaultOrder` (monotonic counter) on the `GridLanesItem` instance. Do NOT write `data-default-order` to the DOM.
7. Initialize items with `shuffle-item` + `shuffle-item--visible` classes.
8. Set `isInitialized = false` during construction. After the first filter/sort update completes, set `isInitialized = true`. While `isInitialized` is false, bypass `startViewTransition` entirely and apply DOM mutations synchronously.

Options that map to CSS and are therefore NOT accepted in the TypeScript interface for `GridLanes`:

- `columnWidth` → user sets `grid-template-columns` in CSS
- `gutterWidth` → user sets `gap` in CSS
- `sizer` → replaced by `minmax()` / `fr` units
- `columnThreshold` → browser handles it
- `useTransforms` / `roundTransforms` → no JS positioning
- `isCentered` → user sets `justify-content` in CSS
- `isRTL` → user sets `direction` in CSS
- `buffer` → user sets `flow-tolerance` in CSS (final spec name, confirmed in CSS Grid Level 3 WD January 2026; `item-tolerance` is obsolete)

For plain JavaScript users, unknown/legacy options are ignored at runtime for migration tolerance.

Options that `GridLanes` DOES accept:

- `itemSelector` — required to find items
- `group` — initial filter group
- `filterMode` — "any" vs "all"
- `initialSort` — sort on init
- `speed` — maps to view transition duration via CSS custom property
- `easing` — maps to view transition timing function
- `staggerAmount` / `staggerAmountMax` — applied as incremental `animation-delay` per item (see Phase 3)

`delimiter` is intentionally dropped. `data-groups` uses whitespace-separated tokens only (see Phase 2). There is no JSON fallback.

### Phase 1 validation checkpoint

Checkpoint goal: Validate that the `GridLanes` scaffold and initialization rules are implemented correctly before moving to filtering/sorting.

Pass criteria checklist:

- [x] Core filtering/sorting logic is extracted into `src/core/` and used by both entry points.
- [x] Constructing with an invalid container display throws a `TypeError`.
- [x] Items are stored in a `Map<HTMLElement, GridLanesItem>` for O(1) access.
- [x] Each item has metadata (`id`, `defaultOrder`) stored on its `GridLanesItem` instance.
- [x] Each item gets `view-transition-class: shuffle-item` and correct visibility classes.
- [x] `isInitialized` remains `false` until the first synchronous render completes.
- [x] Passing legacy/unknown options does not throw and does not change behavior unexpectedly.

Required validation evidence checklist:

- [x] Unit test: invalid container display throws.
- [x] Unit test: initialization assigns classes and unique transition metadata.
- [x] Unit test: metadata storage uses `GridLanesItem` properties (no DOM attribute writes).
- [x] Unit or integration test: first render path bypasses view transitions.

## ✅ Phase 2: Filtering and sorting (#684)

Port the filtering and sorting logic from the existing `Shuffle` class. The demo's `applyFilters()` and `applySorting()` are simplified versions of what Shuffle does. Key differences from the current implementation:

### `data-groups` format

`GridLanes` uses **whitespace-separated tokens** as the only authoring format for `data-groups`:

```html
<div data-groups="nature city featured">...</div>
```

Group names must not contain spaces — they are identifiers, not display labels. JSON array strings and custom `delimiter` are not supported. If the attribute is missing or empty, the item belongs to no groups. If parsing yields an empty list, the item is treated as having no groups (fail-soft per item — do not throw).

### Concurrency and Interruption policy

All updates are last-write-wins, matching core Shuffle. If `filter()`, `sort()`, or `update()` is called while a view transition is active, the new call overwrites the pending state.

**Interruption**: If a transition is in flight, `this.#activeTransition.skipTransition()` must be called. To prevent "zombie" items or race conditions, any items pending physical removal must be **synchronously flushed** immediately after skipping the transition. This ensures that concurrent calls (like `resetItems`) see a consistent DOM state.

### Hiding items

With grid layout, hidden items MUST leave the flow. Use `display: none` via the `.shuffle-item--hidden` class. This is the single biggest architectural difference.

The show/hide functions:

```typescript
function showItem(item: GridLanesItem): void {
  item.element.classList.remove('shuffle-item--hidden');
  item.element.classList.add('shuffle-item--visible');
  item.element.removeAttribute('aria-hidden');
  item.element.style.viewTransitionName = item.id;
}

function hideItem(item: GridLanesItem): void {
  item.element.classList.remove('shuffle-item--visible');
  item.element.classList.add('shuffle-item--hidden');
  item.element.setAttribute('aria-hidden', 'true');
  item.element.style.viewTransitionName = 'none';
}
```

Critical: `hideItem` sets `view-transition-name: "none"` so the element doesn't exist in the "new" snapshot. The old snapshot (captured before the callback) still animates out via `::view-transition-old(*):only-child`. Without this, a `display:none` element with a named view-transition-name can flash visible for one frame when the pseudo-element layer is torn down.

**`remove()` is different from `hideItem()`.** Items being removed must keep their real `view-transition-name` inside the update callback so the browser captures a "before" snapshot and plays `::view-transition-old(:only-child)` for the exit animation. `remove()` must NOT call `hideItem()` or zero out the transition name before the callback runs. Physical DOM removal and Map cleanup happen after `ViewTransition.finished` resolves (or during a synchronous interruption flush).

### Sorting

Sorting reorders the DOM. Use `container.append(...sortedElements)` inside the view transition callback. The browser animates position changes via `::view-transition-group()`.

Default sort order is restored using the `defaultOrder` property on each `GridLanesItem`.

### Unified update

All state changes (filter, sort, or both) go through a single internal update path that wraps DOM mutations in `document.startViewTransition()`. The returned `ViewTransition` object is stored in `#activeTransition`.

```typescript
#update(): void {
  // Cancel any in-flight transition (last-write-wins).
  if (this.#activeTransition) {
    this.#activeTransition.skipTransition();
    this.#flushRemovals(); // Synchronous cleanup of interrupted removals
  }

  if (document.startViewTransition && this.isInitialized) {
    this.#activeTransition = document.startViewTransition(() => {
        this.#doUpdate();
        this.#flushRemovals();
    });
    this.#activeTransition.finished.finally(() => {
      this.#activeTransition = null;
      this.#movementFinished();
    });
  } else {
    this.#doUpdate();
    this.#flushRemovals();
    queueMicrotask(() => this.#movementFinished());
  }
}
```

`#movementFinished()` clears `#activeTransition`, sets `isTransitioning = false`, and emits `shuffle:layout`, mirroring the same-named method in core Shuffle.

### Phase 2 validation checkpoint

Checkpoint goal: Validate filtering, sorting, hiding, and update concurrency behavior before implementing animation-specific CSS concerns.

Pass criteria checklist:

- [x] `data-groups` parsing accepts whitespace-separated tokens only.
- [x] Interruption policy synchronously flushes pending removals via `skipTransition()`.
- [x] Missing or empty `data-groups` is treated as no groups.
- [x] Malformed `data-groups` values fail-soft.
- [x] `filter()` supports `'all'`, single token, token arrays, and predicate functions.
- [x] `filterMode: 'any'` and `filterMode: 'all'` produce correct visibility sets for multi-token filters.
- [x] Hidden items leave layout flow via `display: none` (`shuffle-item--hidden`) and set `aria-hidden="true"`.
- [x] Hidden items set `view-transition-name: none`; shown items restore their assigned transition name.
- [x] Sorting reorders DOM via bulk append in the committed sorted order.
- [x] Default sort restores original encounter order using `GridLanesItem.defaultOrder`.
- [x] Update flow is last-write-wins: while one transition is active, newer `filter()/sort()/update()` calls overwrite pending state and only the latest state commits.
- [x] Exactly one `shuffle:layout` event fires per committed state (not per API call).
- [x] Non-view-transition fallback path still applies the same final filter/sort state and emits `shuffle:layout` asynchronously via microtask.

Required validation evidence checklist:

- [x] Unit tests: `data-groups` token parsing and fail-soft malformed handling.
- [x] Unit tests: filter mode matrix (`any`/`all`) and predicate filtering behavior.
- [x] Unit tests: default-sort restoration after one or more prior sorts.
- [x] Integration test: hidden item semantics (`display: none`, `aria-hidden`, `view-transition-name: none`) and restoration on show.
- [x] Integration test: rapid successive update calls prove last-write-wins and one `shuffle:layout` per committed state.
- [x] Integration test: no-VT fallback path commits expected DOM order/visibility and still emits asynchronous `shuffle:layout`.

## ✅ Phase 3: View transition animations

### Required CSS

`GridLanes` should ship a minimal CSS file with these rules. CSS is required via explicit import (no auto-injection). The block below is the authoritative shipped CSS — use it verbatim.

```css
/* Scoped to shuffle items only — avoids colliding with other named
   view transitions on the same page (view-transition-class: shuffle-item
   is set on each item by GridLanes at init time). */
::view-transition-group(.shuffle-item) {
  animation-duration: var(--shuffle-speed, 0.3s);
  animation-timing-function: var(--shuffle-easing, cubic-bezier(0.4, 0, 0.2, 1));
  animation-delay: min(
    calc(var(--shuffle-index, 0) * var(--shuffle-stagger-amount, 15ms)),
    var(--shuffle-stagger-max, 150ms)
  );
}

::view-transition-image-pair(.shuffle-item) {
  isolation: auto;
  mix-blend-mode: normal;
}

::view-transition-new(.shuffle-item):only-child {
  animation: vt-reveal var(--shuffle-speed, 0.3s) var(--shuffle-easing, cubic-bezier(0.4, 0, 0.2, 1)) both;
}

::view-transition-old(.shuffle-item):only-child {
  animation: vt-conceal var(--shuffle-speed, 0.3s) var(--shuffle-easing, cubic-bezier(0.4, 0, 0.2, 1)) both;
}

@keyframes vt-reveal {
  from {
    opacity: 0;
    transform: scale(0.001);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes vt-conceal {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.001);
  }
}
```

### Lessons learned during prototyping (critical)

These were discovered through debugging in Chrome and Firefox:

1. **No CSS transitions on items.** The old Shuffle uses `transition: opacity 250ms, transform 250ms` on `.shuffle-item`. This CANNOT coexist with view transitions. Two animation systems on the same elements fight: the CSS transition starts mid-callback, the view transition captures a partially-animated snapshot, and when the view transition ends the CSS transition re-enables and causes a snap-back. Remove all CSS transitions on shuffle items. View Transitions handle all animation; the fallback is instant show/hide.

2. **`animation-fill-mode: both` is mandatory** on `::view-transition-old` and `::view-transition-new` animations. Without it, the default `fill-mode: none` means the conceal animation's final state (opacity 0) is not held — the pseudo-element snaps back to opacity 1 for one frame before removal, causing a flash.

3. **`isolation: auto` on `::view-transition-image-pair(.shuffle-item)`** prevents the browser's default crossfade compositing from interfering with custom opacity animations.

4. **Hidden items must set `view-transition-name: "none"`** — not just `display: none`. A `display:none` element with a named `view-transition-name` still participates in the transition and causes flash artifacts.

### Stagger Strategy

Since `sibling-index()` is not yet universally supported, `GridLanes` will manually manage stagger:

1. Inside `#doUpdate()`, iterate through visible items and set a `--shuffle-index` CSS custom property on each element.
2. The CSS consumes `--shuffle-index` to calculate `animation-delay`.
3. This avoids physical DOM re-ordering for stagger alone and ensures compatibility.

```typescript
// Inside #doUpdate()
let visibleCount = 0;
for (const item of this.#items.values()) {
  if (item.isVisible) {
    item.element.style.setProperty('--shuffle-index', String(visibleCount++));
  }
}
```

```css
/* CSS consumes the JS-provided index */
::view-transition-group(.shuffle-item) {
  animation-delay: min(
    calc(var(--shuffle-index, 0) * var(--shuffle-stagger-amount, 15ms)),
    var(--shuffle-stagger-max, 150ms)
  );
}
```

### `prefers-reduced-motion`

The shipped CSS must honor `prefers-reduced-motion: reduce`. Add a media query that collapses all durations and delays to near-zero so view transitions fire (and JavaScript callbacks settle) without visible animation:

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(.shuffle-item) {
    animation-duration: 0.001ms;
    animation-delay: 0ms;
  }
  ::view-transition-new(.shuffle-item):only-child,
  ::view-transition-old(.shuffle-item):only-child {
    animation-duration: 0.001ms;
  }
}
```

Using `0.001ms` instead of `0` ensures the animation event still fires so `ViewTransition.finished` resolves. No JS branching is needed — this is handled entirely in CSS.

### Speed and easing customization

The `speed` and `easing` options should override the CSS defaults through CSS custom properties. Set `--shuffle-speed` and `--shuffle-easing` on the container element from JS, and reference them in the shipped CSS (for example `animation-duration: var(--shuffle-speed, 0.3s)`).

### Phase 3 validation checkpoint

Checkpoint goal: Validate that the view-transition animation layer is stable, artifact-free, configurable, and accessible.

Pass criteria checklist:

- [x] Shipped CSS includes the required `::view-transition-group(.shuffle-item)`, `::view-transition-image-pair(.shuffle-item)`, `::view-transition-new(.shuffle-item):only-child`, and `::view-transition-old(.shuffle-item):only-child` rules.
- [x] Enter and exit keyframes match plan semantics (`vt-reveal` and `vt-conceal`) and both use `animation-fill-mode: both` through shorthand.
- [x] `::view-transition-image-pair(.shuffle-item)` sets `isolation: auto` and `mix-blend-mode: normal`.
- [x] No conflicting CSS transitions are applied to shuffle items during this mode.
- [x] Speed and easing options are written to container CSS custom properties and actually affect transition timing.
- [x] Stagger variables are written to container CSS custom properties and consumed by the manual `--shuffle-index` strategy.
- [x] `prefers-reduced-motion: reduce` collapses durations/delays to near-zero values while preserving transition lifecycle completion.
- [x] Hide/show/remove flows do not exhibit one-frame flash, snap-back, or ghosting artifacts.

Required validation evidence checklist:

- [x] Unit test: speed/easing option writes expected container custom property values.
- [x] Unit test: stagger options write expected container custom property values.
- [ ] Integration test: computed transition rules confirm required pseudo-element selectors are active when CSS is imported.
- [x] Integration test: manual `--shuffle-index` path correctly staggers visible items.
- [ ] Integration test: reduced-motion path completes updates with effectively no visible animation.
- [ ] Visual regression test: repeated filter/sort/hide/show cycles show no flash/snap artifacts.

## ✅ Phase 4: GridLanesItem class

`GridLanes` uses a distinct internal item class `GridLanesItem` — it does NOT reuse or extend `ShuffleItem` from core Shuffle. The classes have compatible public surfaces for sort comparators (`compare(a, b)`, `by(element)`, `key`) but different internals.

`GridLanesItem` fields:

- `id: string` — unique string ID (e.g., `shuffle-item-{id}`)
- `element: HTMLElement`
- `defaultOrder: number` — original encounter index
- `isVisible: boolean` — true when item passes the current filter
- `isHidden: boolean` — convenience inverse of `isVisible`

`GridLanesItem` methods:

- `show()` — sets `display` back to `''` and restores real `view-transition-name`
- `hide()` — sets `display: none` and sets `view-transition-name: "none"`
- `dispose()` — removes item classes and inline styles owned by the library

Fields intentionally absent: `point`, `scale`, `applyCss()`, `Css` static — CSS grid and view transitions handle all of that.

`GridLanesItem` lives in its own file (`grid-lanes-item.ts`) and is not exported in the public API.

### Phase 4 validation checkpoint

Checkpoint goal: Validate that `GridLanesItem` is a minimal, lanes-specific abstraction with clean ownership of item-level state and styles.

Pass criteria checklist:

- [x] `GridLanesItem` is implemented as a distinct class and does not extend or reuse `ShuffleItem` internals.
- [x] `GridLanesItem` includes required fields (`id`, `element`, `isVisible`, `isHidden`, `defaultOrder`) and no position/transform-era fields.
- [x] `show()` restores display participation and restores the assigned real `view-transition-name`.
- [x] `hide()` sets `display: none` and `view-transition-name: none`.
- [x] `dispose()` removes only library-owned item classes and inline styles.
- [x] Sort comparator integration remains compatible with expected sort contract surfaces.

Required validation evidence checklist:

- [x] Unit test: `show()` and `hide()` toggle item visibility state and transition-name semantics correctly.
- [x] Unit test: `dispose()` removes only library-owned item-level mutations.
- [x] Unit test: `isVisible` and `isHidden` stay logically consistent across filter transitions.
- [x] Unit test: sort comparators can consume `GridLanesItem` instances without an adapter.
- [x] Type-level check: `GridLanesItem` public shape excludes legacy absolute-position fields.

## ✅ Phase 5: Public API compatibility

`GridLanes` should expose the same public methods as Shuffle where they make sense:

| Method                   | Status        | Notes                                                                   |
| ------------------------ | ------------- | ----------------------------------------------------------------------- |
| `filter(category)`       | Keep          | Same API, different internal animation mechanism                        |
| `sort(sortOptions)`      | Keep          | DOM reordering inside `startViewTransition()`                           |
| `layout()`               | Keep as no-op | Browser handles layout; method remains for API compatibility and events |
| `update()`               | Keep          | Recalculate filter/sort state                                           |
| `add(newItems)`          | Keep          | Append to DOM, assign `view-transition-name`, apply current filter/sort |
| `remove(elements)`       | Keep          | Remove from DOM inside `startViewTransition()` for animated removal     |
| `enable()` / `disable()` | Keep          | Toggle whether filter/sort/transitions are active                       |
| `destroy()`              | Keep          | Clean up styles, classes, event listeners                               |
| `resetItems()`           | Keep          | Re-query `itemSelector`, reassign `view-transition-name`s               |
| `getItemByElement()`     | Keep          | Lookup via primary Map                                                  |

Events (`LAYOUT`, `REMOVED`) should still fire. `LAYOUT` is always asynchronous:

- With view transitions: fire after `ViewTransition.finished` resolves (or rejects — always fire via `.then(() => ...).catch(() => ...)`). This mirrors `#movementFinished()` in core Shuffle.
- Without view transitions: run updates synchronously, then queue `LAYOUT` in a microtask (`queueMicrotask`).

`REMOVED` fires after items are physically removed from the DOM, using the `this.once(EventType.LAYOUT, handleLayout)` pattern from core Shuffle — the removal callback is registered before `#update()` starts, and DOM removal + event emission happen when `LAYOUT` fires.

Tab order policy: `GridLanes` uses `display: none` for hidden items (unlike Shuffle v7's `visibility: hidden`). This removes items from the keyboard tab order and accessibility tree entirely. Document this as a behavior change. Applications that require focus management after filtering should listen to `shuffle:layout` or `shuffle:removed`.

`enable()` and `disable()` toggle `isEnabled`. `disable()` also calls `this.#activeTransition?.skipTransition()` to abort any in-flight animation immediately (mirroring `#cancelMovement()` in core Shuffle). `#activeTransition` is set to `null` after `#movementFinished()` runs.

`destroy()` removes only library-owned styles. Specifically: remove `--shuffle-speed`, `--shuffle-easing`, `--shuffle-stagger-amount`, `--shuffle-stagger-max` custom properties from the container, and remove item-level inline styles (`view-transition-name`, `view-transition-class`, `display`). Never call `element.removeAttribute('style')` on the container — that would destroy user CSS.

`resetItems()`: re-query `itemSelector`. Surviving elements keep their existing metadata in the Map. Only newly discovered elements get new names and counter values. `resetItems()` reconciles — it does not reseed.

### Phase 5 validation checkpoint

Checkpoint goal: Validate public API compatibility and lifecycle semantics so existing Shuffle usage patterns continue to behave predictably.

Pass criteria checklist:

- [x] Public methods are present with compatible signatures: `filter`, `sort`, `layout`, `update`, `add`, `remove`, `enable`, `disable`, `destroy`, `resetItems`, `getItemByElement`.
- [x] Decision: Does window resize trigger a View Transition? **No** — `GridLanes` has no `ResizeObserver` or resize listener. The browser reflows the grid-lanes layout natively and instantly on resize; no view transition is triggered. This is the correct behavior: animated reflow on resize would feel laggy and is unnecessary since the browser owns layout geometry.
- [x] `layout()` behaves as a no-op for geometry while still participating in expected lifecycle/event behavior.
- [x] `LAYOUT` always fires asynchronously.
- [x] With view transitions enabled, `LAYOUT` fires after `ViewTransition.finished` settles (resolve or reject).
- [x] Without view transitions, updates apply synchronously but `LAYOUT` still emits in a microtask.
- [x] `REMOVED` fires only after physical DOM removal completes.
- [x] `disable()` stops new behavior and aborts in-flight transitions via `skipTransition()`.
- [x] `enable()` resumes normal filter/sort/update behavior.
- [x] `destroy()` strips only library-owned styles/classes/listeners and does not remove user-owned container inline styles wholesale.
- [x] `add()` flow prevents flash of unfiltered content by hiding new items before the first update.
- [x] `resetItems()` reconciles item state: survivors keep existing metadata and only newly discovered elements get minted values.
- [ ] Hidden-item tab order behavior change (`display: none`) is documented as part of API behavior expectations.

Required validation evidence checklist:

- [x] API surface test: method presence and callable signatures.
- [x] Integration test: `LAYOUT` async timing with VT enabled and disabled.
- [x] Integration test: `REMOVED` fires after DOM removal and after layout completion.
- [x] Integration test: `disable()` aborts active transition and `enable()` restores behavior.
- [x] Unit/integration test: `destroy()` strips only library-owned styles/classes and preserves user-owned `style` content.
- [x] Integration test: `resetItems()` preserves existing metadata for survivors.

## ✅ Phase 6: CSS shipped with the package

Ship a minimal CSS file at `packages/shuffle/src/shuffle-lanes.css` containing:

1. The `.shuffle-item--visible` and `.shuffle-item--hidden` class definitions
2. The `::view-transition-*` animation rules including the stagger block
3. The `@media (prefers-reduced-motion: reduce)` override block (see Phase 3)
4. A recommended grid-lanes container example in a comment

Do NOT include `display: grid-lanes` or `grid-template-columns` — those belong in the user's CSS. `GridLanes` is opinionated about animation, not layout.

The package should expose both subpaths:

- `shufflejs/grid-lanes` → JS entry point
- `shufflejs/grid-lanes.css` → required stylesheet

### Phase 6 validation checkpoint

Checkpoint goal: Validate that the package ships a correct, minimal stylesheet contract and exposes it cleanly to consumers.

Pass criteria checklist:

- [x] `packages/shuffle/src/shuffle-lanes.css` exists and is included in the build output.
- [x] CSS includes `.shuffle-item--visible` and `.shuffle-item--hidden` class definitions.
- [x] CSS includes required `::view-transition-*` rules and the stagger `@supports` block.
- [x] CSS includes the `@media (prefers-reduced-motion: reduce)` override block.
- [x] CSS includes a recommended grid-lanes container example comment for authors.
- [x] CSS does not set `display: grid-lanes`, `display: grid`, `grid-template-columns`, or `gap` for user containers.
- [x] CSS remains scoped to library-owned item classes and view-transition selectors to avoid broad global collisions.
- [x] Package exports include `shufflejs/grid-lanes.css` and `shufflejs/grid-lanes` subpaths.
- [x] Consumer import of `shufflejs/grid-lanes.css` works without custom post-build copy hacks.

Required validation evidence checklist:

- [x] Build artifact check: emitted `dist/shuffle-lanes.css` exists after package build.
- [x] Static content check: emitted CSS contains required sections and omits layout-ownership rules.
- [x] Package export check: `package.json` exports resolve for both JS and CSS subpaths.
- [ ] Consumer smoke test: importing `shufflejs/grid-lanes.css` in a sample app applies hide/show/view-transition styles.
- [ ] Bundler behavior check: CSS is retained in production build when imported.

## Phase 7: Progressive enhancement strategy

```css
/* User's CSS */
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

Three tiers of experience:

1. **Grid-lanes + view transitions** (Safari TP 234+, Chrome when grid-lanes ships): Full masonry layout with animated filtering/sorting.
2. **Grid + view transitions** (Chrome 111+, Firefox 133+, Safari 18+): Standard grid (no masonry) with animated filtering/sorting. Items are equal-row-height but transitions work.
3. **Grid only** (older browsers): Standard grid with instant filtering/sorting. No animation.

`GridLanes` handles tiers 1-2 identically in JS — the CSS `@supports` block handles the layout difference. Tier 3 is the `else` branch of the `if (document.startViewTransition)` check.

### Phase 7 validation checkpoint

Checkpoint goal: Validate progressive enhancement across browser capability tiers without branching complexity or behavioral regressions.

Pass criteria checklist:

- [ ] User CSS baseline uses `display: grid` with explicit column/gap definitions.
- [ ] User CSS enhancement layer switches to `display: grid-lanes` inside `@supports (display: grid-lanes)`.
- [ ] Tier 1 behavior is correct: grid-lanes layout plus view-transition animations where both features are available.
- [ ] Tier 2 behavior is correct: standard grid layout plus view-transition animations where grid-lanes is unavailable.
- [ ] Tier 3 behavior is correct: standard grid layout with instant updates when view transitions are unavailable.
- [ ] JS logic does not add extra layout branching beyond view-transition capability checks.
- [ ] Filter/sort/add/remove semantics remain consistent across all tiers (only layout/animation capabilities vary).
- [ ] No tier breaks API/event expectations established in earlier phases.

Required validation evidence checklist:

- [ ] Browser integration test: Tier 1 environment confirms lanes layout and animated updates.
- [ ] Browser integration test: Tier 2 environment confirms grid fallback with animated updates.
- [ ] Browser integration test: Tier 3 environment confirms grid fallback with no animation and correct final DOM state.
- [ ] Cross-tier parity test: same sequence of API calls yields matching visibility/order outcomes.
- [ ] Documentation example test: published CSS snippet works as written without additional hidden requirements.

## Phase 8: Testing

### Unit tests

- Filter by single group, multiple groups, "all", custom function
- Sort by `by`, `compare`, `randomize`, `reverse`
- Default sort restores original DOM order after other sorts
- `add()` assigns `view-transition-name` and respects current filter/sort
- `remove()` cleans up WeakMap entries
- `destroy()` removes all inline styles and classes

### Integration tests (browser)

- Verify `display: grid-lanes` is applied when supported (Safari TP)
- Verify `display: grid` fallback in other browsers
- Verify no flash/snap artifacts during filter transitions
- Verify items animate to correct positions after filtering
- Verify sort + filter combined
- Verify browsers without `sibling-index()` support keep VT animation but skip stagger
- Verify `view-transition-name` is `"none"` on hidden items and restored on show
- Verify `aria-hidden` is toggled correctly
- Verify tab order follows DOM order (no library-managed `tabindex`)

### Visual regression tests

- Compare filtering animation in Chrome (view transitions, no grid-lanes) vs Safari TP (both)
- Compare instant fallback in browsers without view transition support

### Phase 8 validation checkpoint

Checkpoint goal: Validate that automated and browser-level test coverage is sufficient to prevent behavioral and visual regressions.

Pass criteria checklist:

- [ ] Unit tests cover filter combinations (single, multi, all, predicate) and filter modes.
- [ ] Unit tests cover sort paths (`by`, `compare`, `randomize`, `reverse`) and default-order restoration.
- [ ] Unit tests cover `add()`, `remove()`, and `destroy()` semantics specific to transition metadata and cleanup.
- [ ] Integration tests validate grid-lanes support path and grid fallback path.
- [ ] Integration tests validate transition correctness for filter/sort combinations.
- [ ] Integration tests validate stagger fallback behavior when `sibling-index()` is unsupported.
- [ ] Integration tests validate hidden/show transition-name behavior and `aria-hidden` toggling.
- [ ] Integration tests validate tab-order behavior under `display: none` semantics.
- [ ] Visual regression suite cover supported animated and non-animated fallback paths.
- [ ] CI runs the suite and fails on regressions.

Required validation evidence checklist:

- [ ] Test run artifacts show passing unit and integration suites.
- [ ] Browser-matrix run includes at least one engine with VT support and one without.
- [ ] Visual snapshots/baselines updated and reviewed for intended changes only.
- [ ] A regression test exists for each previously identified artifact class (flash, snap-back, ghosting).

## Phase 9: Documentation and migration

### New docs page

- Explain the CSS-first approach: user writes `grid-template-columns`, `gap`, `flow-tolerance` in their CSS
- Show the `@supports` progressive enhancement pattern
- Document which Shuffle options are replaced by CSS properties (link to `shuffle-to-grid-lanes-mapping.js`)
- Explain that `layout()` is a no-op — the browser re-layouts automatically on DOM changes
- Document keyboard/focus behavior: tab order follows DOM order; `GridLanes` does not manage `tabindex`

### Migration guide from Shuffle v7

- Replace `columnWidth` / `sizer` / `gutterWidth` options with CSS `grid-template-columns` + `gap`
- Remove any custom `speed` / `easing` CSS overrides on `.shuffle-item` (view transitions handle it)
- Add `@supports (display: grid-lanes)` block to CSS
- Change import from `shufflejs` to `shufflejs/grid-lanes`
- `buffer` option → `flow-tolerance` CSS property on the container

### Phase 9 validation checkpoint

Checkpoint goal: Validate that documentation and migration guidance are complete, accurate, and actionable for existing Shuffle users.

Pass criteria checklist:

- [ ] Docs clearly separate CSS-owned layout responsibilities from JS-owned behavior.
- [ ] Docs include a working progressive enhancement snippet with `@supports (display: grid-lanes)`.
- [ ] Docs describe which legacy options are replaced by CSS and reference the mapping companion file.
- [ ] Docs explain `layout()` no-op semantics in grid-lanes mode.
- [ ] Docs call out accessibility and tab-order behavior changes from `display: none` hiding.
- [ ] Migration guide provides explicit before/after import changes (`shufflejs` to `shufflejs/grid-lanes`).
- [ ] Migration guide provides explicit replacement guidance for removed options (`columnWidth`, `gutterWidth`, `sizer`, `buffer`).
- [ ] Docs state that `shufflejs/grid-lanes.css` import is required.
- [ ] Examples are copy-pasteable and reflect the final API/options contract.

## Phase 10: Concrete interfaces and config

This section provides the exact TypeScript types, expected item HTML contract, and build config changes an implementing agent needs.

### `GridLanesOptions` TypeScript interface

```typescript
import type { FilterArg, FilterModeOptions, SortOptions } from './core/types';

export interface GridLanesOptions {
  /**
   * CSS selector used to find grid items inside the container.
   * @default '*'
   */
  itemSelector?: string;

  /**
   * Initial filter group. Pass `'all'` or omit to show all items.
   * @default 'all'
   */
  group?: string;

  /**
   * Controls how array filters behave. 'any' = item passes if it belongs to
   * at least one of the given groups. 'all' = item must belong to every group.
   * @default 'any'
   */
  filterMode?: FilterModeOptions;

  /**
   * Sort to apply on initialization.
   * @default null
   */
  initialSort?: SortOptions | null;

  /**
   * Transition duration in milliseconds. Written to `--shuffle-speed` on the
   * container element and consumed by the shipped CSS.
   * @default 300
   */
  speed?: number;

  /**
   * CSS easing function. Written to `--shuffle-easing` on the container.
   * @default 'cubic-bezier(0.4, 0, 0.2, 1)'
   */
  easing?: string;

  /**
   * Per-item stagger delay in milliseconds. Written to
   * `--shuffle-stagger-amount` and consumed by the shipped CSS.
   * Falls back gracefully to zero delay if manual indexing is skipped.
   * @default 15
   */
  staggerAmount?: number;

  /**
   * Maximum stagger delay in milliseconds. Written to
   * `--shuffle-stagger-max`.
   * @default 150
   */
  staggerAmountMax?: number;
}
```

Options intentionally absent from this interface (all handled in user CSS): `columnWidth`, `gutterWidth`, `sizer`, `columnThreshold`, `useTransforms`, `roundTransforms`, `isCentered`, `isRTL`, `buffer`. Plain JS callers passing these will have them silently ignored at runtime.

### Expected item HTML contract

Each grid item element must have:

| Attribute / property                                                                               | Set by              | Value                                                                                                                                     |
| -------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `data-groups`                                                                                      | Author HTML         | Whitespace-separated tokens, e.g. `data-groups="nature city featured"`. Group names must not contain spaces. Absent or empty = no groups. |
| `class="shuffle-item shuffle-item--visible"`                                                       | `GridLanes` at init | Do not set manually                                                                                                                       |
| `style="view-transition-name: shuffle-{instanceId}-{itemId}; view-transition-class: shuffle-item"` | `GridLanes` at init | Do not set manually                                                                                                                       |

`GridLanes` reads `element.dataset.groups` (key `FILTER_ATTRIBUTE_KEY = 'groups'`) to determine group membership, matching the existing `Shuffle` behaviour.

Column and height spans are purely CSS — authors add modifier classes (e.g. `picture-item--col-2`) themselves; `GridLanes` does not read or set them.

### Shared utilities to extract from `shuffle.ts`

Extract into `packages/shuffle/src/core/` for use by both `Shuffle` and `GridLanes`:

- **Matching Engine**: `matchesCategory(groups: string[], category: FilterArg, mode: FilterModeOptions)` and generic filtering orchestration.
- **Generic Sorter**: A `sorter` utility that accepts any collection of objects with an `element: HTMLElement` property. Default sort order is provided via a parameter (not read from the DOM).
- **Group Parsing**: **Not shared.** `GridLanes` implements whitespace-separated token parsing; `Shuffle` retains its JSON/delimiter parsing logic.

### `tsdown.config.ts` changes

```typescript
import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig([
  {
    entry: './src/shuffle.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    sourcemap: true,
    dts: true,
  },
  {
    entry: './src/shuffle-lanes.ts',
    format: 'esm',
    target: ['node24', 'es2024'],
    outDir: './dist',
    sourcemap: true,
    dts: true,
    copy: [{ from: './src/shuffle-lanes.css', to: './dist' }],
  },
]);

export default config;
```

### `package.json` exports diff

```json
"exports": {
  ".": {
    "types": "./dist/shuffle.d.mts",
    "default": "./dist/shuffle.mjs"
  },
  "./grid-lanes": {
    "types": "./dist/shuffle-lanes.d.mts",
    "default": "./dist/shuffle-lanes.mjs"
  },
  "./grid-lanes.css": "./dist/shuffle-lanes.css",
  "./package.json": "./package.json"
},
```

Also update `"sideEffects"` from `false` to an array so bundlers know the CSS has side effects:

```json
"sideEffects": ["./dist/shuffle-lanes.css"]
```

### Source files an implementing agent must read

| File                                | Why                                           |
| ----------------------------------- | --------------------------------------------- |
| `packages/shuffle/src/shuffle.ts`   | Filter/sort logic to extract into shared core |
| `packages/shuffle/src/sorter.ts`    | Adapt for generic HTMLElement-based sorting   |
| `packages/shuffle/src/types.ts`     | Shared type definitions                       |
| `packages/shuffle/src/constants.ts` | Shared constants                              |

### Phase 10 validation checkpoint

Checkpoint goal: Validate type contracts, build outputs, and package export wiring so the feature is consumable without manual workarounds.

Pass criteria checklist:

- [ ] `GridLanesOptions` in source matches the documented interface and defaults.
- [ ] Runtime behavior tolerates unknown/legacy options for plain JS callers without throwing.
- [ ] Item HTML contract assumptions (`data-groups`, class/style ownership) match implementation.
- [ ] Shared utility extraction is complete and used by both Shuffle and GridLanes where intended.
- [ ] `tsdown.config.ts` includes the new `shuffle-lanes` entry and copies CSS to `dist`.
- [ ] Package `exports` includes `./grid-lanes` and `./grid-lanes.css` with correct paths.
- [ ] `sideEffects` includes emitted CSS so bundlers do not tree-shake required styles.
- [ ] Generated `.d.mts` output is present for the grid-lanes entry.
- [ ] A consumer can install and import both subpaths without local package patching.

Required validation evidence checklist:

- [ ] Typecheck and build pass from repository root.
- [ ] Built package artifact inspection confirms JS, types, and CSS files are emitted as documented.
- [ ] Consumer smoke test resolves `shufflejs/grid-lanes` and `shufflejs/grid-lanes.css` via package exports.
- [ ] Production bundle check confirms the CSS asset is retained when imported.

### Implementation Notes

- **Storage**: Use a **`Map<HTMLElement, GridLanesItem>`** as the primary store for O(1) lookups.
- **Interruption**: Always `skipTransition()` and flush physical DOM changes if a new update starts.
- **Accessibility**: Documentation must note that `display: none` on hidden items correctly removes them from the tab order.
- **Shared utilities**: Extract group parsing and filter matching from `shuffle.ts` into `src/core/`.
