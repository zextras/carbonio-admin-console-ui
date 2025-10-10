# Carbonio Admin UI COS

Admin module for Zextras Carbonio Admin Panel

## Prerequisites

- Node.js (compatible with the browserslist configuration)
- pnpm 10.15.0 or higher

## Installation

Since this project is part of a monorepo, install dependencies from the root directory:

```bash
# From the monorepo root
pnpm install
```

If you need to reset the entire project (clear cache and reinstall):

```bash
# From the monorepo root
pnpm reset
```

## Available Scripts

### Development

#### `start`

Starts the development server with hot-reload enabled using the SDK watch mode.

```bash
# From apps/admin-ui-console directory
 npm run start -- -h <hostname> -p <port>
```

This command watches for file changes and automatically rebuilds the application during development.

#### `pnpm type-check`

Runs TypeScript type checking without emitting files. Useful for validating your TypeScript code.

```bash
pnpm type-check

# From monorepo root (checks all packages)
pnpm type-check
```

#### `pnpm lint`

Runs ESLint to check code quality and style consistency across `.js`, `.jsx`, `.ts`, and `.tsx` files.

```bash
pnpm lint

# From monorepo root (lints all packages)
pnpm lint
```

### Testing

#### `pnpm test`

Runs the test suite once using Vitest.

```bash
pnpm test

# From monorepo root (runs all tests)
pnpm test
```

#### `pnpm test:watch`

Runs tests in watch mode with a browser interface, automatically opening the Vitest UI.

```bash
pnpm test:watch
```

This is ideal for TDD (Test-Driven Development) as it re-runs tests on file changes and provides an interactive browser interface.

#### `pnpm test:ci`

Runs tests with coverage reporting, designed for CI/CD pipelines.

```bash
pnpm test:ci

# From monorepo root (runs CI tests for all packages)
pnpm test:ci
```

### Building & Deployment

#### `pnpm build`

Builds the application for production using the SDK build command.

```bash
pnpm build

# From monorepo root (builds all packages)
pnpm build
```

#### `pnpm deploy`

Deploys the built application using the SDK deploy command.

```bash
npm run deploy -- -h <hostname>
```

## Monorepo Commands

When working in the monorepo, you can run commands for all packages:

```bash
# From monorepo root
pnpm build          # Build all packages
pnpm test           # Test all packages
pnpm lint           # Lint all packages
pnpm type-check     # Type-check all packages
```
