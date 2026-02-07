# AI Agent Guidelines

## Project Structure

This is a **Yarn workspaces monorepo** with two primary workspaces:

- **`apps/website/`** — Docusaurus documentation site
- **`packages/shuffle/`** — Main library (published as `shufflejs` on npm)

It uses [Turbo](https://turbo.build/) for orchestration (see [`turbo.json`](turbo.json)).

## Common Development Commands

Run these from the **root directory**:

```bash
# Install all dependencies (do this first)
yarn install

# Run tests across all workspaces
yarn test

# Build all packages
yarn build

# Watch for changes, rebuild, and run dev server
yarn watch

# Lint and format code
yarn lint
yarn format
```

## Running Tasks for Specific Workspaces

Use Turbo's `--filter` flag to run tasks for a specific workspace:

```bash
# Run tests only for the shufflejs package
yarn turbo run test --filter=shufflejs

# Build only the website docs
yarn turbo run build --filter=shuffle-docs

# Run lint for a specific package
yarn turbo run lint --filter=shufflejs
```

See [`turbo.json`](turbo.json) for available tasks across workspaces.

## When in Doubt

Refer to [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full contributor guide, including detailed release procedures and best practices.
