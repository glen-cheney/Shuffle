# Contributing

## Submitting Issues

All bug reports and issues **require** a [reduced test case](https://css-tricks.com/reduced-test-cases/).

Want to start a CodePen with a shuffle template? Use this: [http://codepen.io/pen?template=qrjOpX](http://codepen.io/pen?template=qrjOpX)

Take a look at the GitHub [contributing guide](https://guides.github.com/activities/contributing-to-open-source/index.html). For demo links, please use things like [CodePen](http://codepen.io/), [JSFiddle](https://jsfiddle.net/), or [JS Bin](https://jsbin.com/) to create reduced test cases. For more best practices when contributing, check out [html5boilerplate's guide](https://github.com/h5bp/html5-boilerplate/blob/master/CONTRIBUTING.md).

Without a reduced test case, your issue may be closed.

## Releasing a new version

- Update `changelog.md`.
- Run tests (`yarn test` from the root).
- Commit changes.
- `cd packages/shuffle`
- `npm version major|minor|patch`.
- `npm publish`
- `git push && git push --tags`
- Create a [new release](https://github.com/glen-cheney/Shuffle/releases/new) on GitHub.

## Running locally

- Clone the project.
- Install dependencies with `yarn`.
- Run `yarn watch` to rebuild, start the server, and watch for changes.
- go to `http://localhost:3000/Shuffle/` to see it.
