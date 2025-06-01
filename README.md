# [Shuffle][homepage] ![Build Status][actions-img] [![Dependabot Status][dependabot-img]][dependabot-url] [![NPM version][npm-img]][npm-url]

Categorize, sort, and filter a responsive grid of items.

```bash
npm install shufflejs
```

## Docs and Demos

[All found here][homepage]

### Usage (with ES6)

```js
import Shuffle from 'shufflejs';

const shuffleInstance = new Shuffle(document.getElementById('grid'), {
  itemSelector: '.js-item',
  sizer: '.js-shuffle-sizer',
});
```

## Inspiration

This project was inspired by [Isotope](http://isotope.metafizzy.co/) and [Packery](http://packery.metafizzy.co/).

[homepage]: https://shuffle.js.org
[actions-img]: https://github.com/glen-cheney/Shuffle/actions/workflows/build.yml/badge.svg?branch=main
[npm-url]: https://www.npmjs.com/package/shufflejs
[npm-img]: https://img.shields.io/npm/v/shufflejs.svg
[dependabot-url]: https://docs.github.com/en/code-security/supply-chain-security/managing-vulnerabilities-in-your-projects-dependencies/configuring-dependabot-security-updates
[dependabot-img]: https://img.shields.io/badge/Dependabot-enabled-blue.svg
