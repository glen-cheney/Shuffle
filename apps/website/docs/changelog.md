---
sidebar_position: 15
---

# Changelog (abbreviated)

For a more detailed changelog, visit [the latest releases](https://github.com/glen-cheney/Shuffle/releases) on GitHub.

- `v6.1.1` 2024-07-07 - Update `"exports"` field in package.json to include `"types"`.
- `v6.1.0` 2022-07-07 - Add `sideEffects: false` and [exports-map](https://webpack.js.org/guides/package-exports/) to the `package.json`.
- `v6.0.0` 2022-02-14 - Drop IE 11, remove misspelled `delimeter` option, remove `matches-selector` package.
- `v5.4.1` 2021-05-29 - Add `sortedItems` property. Fix `getComputedStyle` bug for Chrome on Windows.
- `v5.3.0` 2021-03-23 - Add `isRTL` option.
- `v5.2.3` 2019-08-29 - Add missing inherited methods from `TinyEmitter` to TypeScript definitions.
- `v5.2.2` 2019-06-03 - Update TypeScript definitions.
- `v5.2.1` 2018-12-01 - Change \`index.d.ts\` to use \`export default Shuffle\` ([#214](https://github.com/glen-cheney/Shuffle/issues/214#issuecomment-441409237)). Upgrade dev dependencies.
- `v5.2.0` 2018-08-19 - Lazily test whether the browser's `getComputedStyle` includes padding. This allows the bundled file to be imported in node for server side rendering.
- `v5.1.2` 2018-03-26 - Fix misspelled `delimiter` option. Both "delimiter" and "delimeter" will continue to work for v5.
- `v5.1.1` 2018-03-02 - Fix new item animation when there is an active filter.
- `v5.1.0` 2018-02-20 - Add `compare` option to sorter. Add `es` build to package and `"module"` field to `package.json`.
- `v5.0.3` 2017-10-30 - Fix rounding error.
- `v5.0.2` 2017-09-23 - Update type definitions. Upgrade dev dependencies.
- `v5.0.1` 2017-07-18 - Add `roundTransforms` option.
- `v5.0.0` 2017-07-18 - Change global export from `shuffle` to `Shuffle`. Remove bower support. Expect ES6 environment. Make Shuffle instances Event Emitters instead of dispatching `CustomEvent`.
- `v4.2.0` 2017-05-10 - Replace `webpack` build with `rollup`. Replace `jshint` and `jscs` with `eslint`. Add `filterMode` option.
- `v4.1.1` 2017-03-21 - the `before` styles for a `ShuffleItem` were not applied if the item didn’t move.
- `v4.1.0` 2017-01-30 - Use webpack-2 to bundle Shuffle.
- `v4.0.2` 2016-09-15 - Update `custom-event-polyfill` dependency.
- `v4.0.1` 2016-07-30 - Fix `delimiter` option.
- `v4.0.0` 2016-04-20 - Rewrite in ES6 with babel. Remove jQuery and Modernizr dependencies. Remove support for IE&lt;11. Docs improvements. Switch to gulp build system with webpack.
- `v3.1.0` 2015-03-23 - Allow zero speed option ([#64](https://github.com/glen-cheney/Shuffle/issues/64)) and cancel previous animations instead of ignoring new ones ([#69](https://github.com/glen-cheney/Shuffle/issues/69)). Handle non-integer columns better ([#46](https://github.com/glen-cheney/Shuffle/issues/46))
- `v3.0.4` 2015-02-16 - Publish to NPM.
- `v3.0.2` 2015-01-21 - Remove from jQuery plugins directory.
- `v3.0.1` 2014-12-29 - Add CommonJS support.
- `v3.0.0` 2014-10-06 - Refactored with improvements, added unit tests, more documentation. Removed some triggered events.
- `v2.1.2` 2014-06-01 - Use `window.jQuery` instead of `window.$` to work better with noConflict. Fixed [#25](https://github.com/glen-cheney/Shuffle/issues/25).
- `v2.1.1` 2014-04-16 - Fix items with zero opacity overlapping visible ones in IE&lt;10.
- `v2.1.0` 2014-04-12 - Register with bower as `shufflejs`.
- 2014-04-10 - Add AMD support.
- 2014-04-08 - Separate Modernizr into its own file and custom Shuffle build.
- 2014-03-08 - Add Bootstrap 3 demo. Fixed issue with percentage width items.
- 2013-10-04 - Moved some Shuffle instance properties to constants. Converted from 4 to 2 space indentation. Added events enum and pulled out some strings to constants.
- 2013-08-30 - Added animate-in demo.
- `v2.0.0` 2013-07-05 - Shuffle 2.0 with masonry, adding and removing, and more.
- 2012-11-03 - Replaced layout system with [masonry](http://masonry.desandro.com/). Items can now be different sizes! Added additional examples.
- 2012-10-24 - Better handling of grid item dimensions. Added a minimal markup page.
- 2012-09-20 - Added `destroy` method
- 2012-09-18 - Added sorting ability and made plugin responsive. Updated to Modernizr 2.6.2
- 2012-07-21 - Rewrote plugin in more object oriented structure. Added custom events. Updated to Modernizr 2.6.1
- 2012-07-03 - Removed dependency on the css file and now apply the css with javascript
