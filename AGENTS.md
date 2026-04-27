# AI Agent Guidelines

## Project Structure

This is a **Yarn workspaces monorepo** with two primary workspaces:

- **`apps/website/`** — Docusaurus documentation site
- **`packages/shuffle/`** — Main library (published as `shufflejs` on npm)

It uses [Turbo](https://turbo.build/) for orchestration (see [`turbo.json`](turbo.json)).

## Common Development Commands

Always run commands from the **root directory**:

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

**Note:** Never run commands from a nested directory.

## After Completing Work

After finishing a task, always run type-check and linting to ensure code quality:

```bash
# Type-check all workspaces
yarn type-check

# Run linting across the project
yarn lint

# Run tests to verify your changes don't break anything
yarn test
```

These validation steps help catch errors early and maintain consistent code standards across the monorepo.

## When in Doubt

Refer to [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full contributor guide, including detailed release procedures and best practices.
