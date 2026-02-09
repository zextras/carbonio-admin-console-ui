# Carbonio Admin UI Monorepo

A monorepo containing Carbonio Admin Console UI and related packages, managed with pnpm workspaces and Turborepo.

## Overview

This monorepo houses the administrative interface for Zextras Carbonio, organized into modular applications and shared packages.

## Prerequisites

- **Node.js** - Version >=22.14.0 (enforced by package.json engines field)
- **pnpm** - Version 10.15.0 (enforced by packageManager field)

## Getting Started

### Initial Setup

Clone the repository and install all dependencies:

```bash
# Install dependencies across all workspaces
pnpm install
```

### Full Reset

If you encounter dependency issues or need a clean slate:

```bash
pnpm reset
```

This command will:

- Remove all `node_modules` directories
- Delete `pnpm-lock.yaml`
- Clear Turbo cache
- Prune the pnpm store
- Reinstall all dependencies

## Development Server

### Starting the Dev Server

To start the development server, run:

```bash
pnpm dev
```

The dev server will start on `http://localhost:3000/carbonioAdmin/`.

### Configuring Proxy Target

By default, the dev server proxies API requests to `https://localhost:6071`. To change the proxy target, set the `VITE_TARGET` environment variable:

```bash
# Use a custom hostname
VITE_TARGET=myserver pnpm dev

# The proxy target will be set to: https://myserver:6071
```

All proxy endpoints (`/service`, `/services`, `/zx`, `/logout`, `/carbonioAdmin/static`, `/static/login`) will forward requests to the configured target.

## Available Scripts

All scripts use Turborepo for efficient task orchestration across workspaces.

### Building

#### `pnpm build`

Builds all applications in the correct order, respecting dependencies.

```bash
pnpm build
```

This command:

- Builds the shell application (admin-ui-bootstrap)
- Builds all admin modules
- Generates the unified package structure in `/dist/` directory
- Creates import maps and component manifests

### Deployment

#### `pnpm run deploy <hostname>`

Deploys the unified package to a remote host.

```bash
pnpm run deploy <hostname>
```

This script:

- Runs `pnpm build`
- Creates .deb packages using Docker and YAP
- Uploads the package to the remote host
- Installs the package via apt

### Testing

#### `pnpm test`

Runs the test suite across all packages once.

```bash
pnpm test
```

#### `pnpm test:ci`

Runs tests with coverage reporting, optimized for CI/CD pipelines.

```bash
pnpm test:ci
```

### Code Quality

#### `pnpm type-check`

Runs TypeScript type checking across all packages without emitting files.

```bash
pnpm type-check
```

#### `pnpm lint`

Runs ESLint across all packages to enforce code quality standards.

```bash
pnpm lint
```

#### `pnpm lint:fix`

Automatically fixes ESLint issues where possible.

```bash
pnpm lint:fix
```

#### `pnpm type-lint`

Combines type-checking and linting for comprehensive code quality checks.

```bash
pnpm type-lint
```

### Working with Individual Apps

You can test, or run scripts for specific apps:

```bash
# Run tests for a specific app
pnpm --filter @zextras/admin-ui-domains test
```

## Workspace Management

### Understanding Workspaces

This monorepo uses pnpm workspaces to manage multiple packages:

- **`apps/*`** - Standalone applications (12 admin modules)
- **`packages/*`** - Shared packages used across apps

### Workspace Dependencies

Packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@zextras/admin-ui-bootstrap": "workspace:*",
    "@zextras/ui-components": "workspace:*"
  }
}
```

This ensures you're always using the local version during development.

### Adding Dependencies

```bash
# Add a dependency to a specific workspace
pnpm add <package> --filter <appname>

# Add a dev dependency to root
pnpm add -D <package> -w

# Add a dependency to all workspaces
pnpm add <package> -r
```

## Architecture

### Module System

The admin console uses a micro-frontend architecture:

1. **Shell** (`admin-ui-bootstrap`) - Provides the runtime environment, routing, and shared state
2. **Modules** (other apps) - Independent features loaded dynamically by the shell
3. **Shared Dependencies** - Vendored common libraries (React, tanstack-query , etc.) loaded once as a singleton

### Import Maps

The build system generates import maps to resolve module dependencies:

```json
{
  "imports": {
    "react": "/static/iris/shared-dependencies/{commit}/index.mjs"
  }
}
```

This enables:

- Shared dependency vendoring (React, tanstack-query, loaded once)
- Version stability through commit-based URLs
- Independent module deployment

### Module Loading Order

Modules are loaded based on their `priority` value defined in each app's `package.json`:

- **Shell (priority: -1)** - Always loads first
- **Admin modules (priority: 3)** - Load in parallel after shell

## Workspace Structure

### Applications (apps/)

The monorepo contains 12 applications organized as:

```
apps/
├── admin-ui-bootstrap/      # Shell application (priority: -1)
├── admin-ui-dashboard/      # Dashboard overview (priority: 3)
├── admin-ui-domains/        # Domain management (priority: 3)
├── admin-ui-backup/         # Backup management (priority: 3)
├── admin-ui-cos/            # Cloud object storage (priority: 3)
├── admin-ui-legalhold/      # Legal hold management (priority: 3)
├── admin-ui-mta/            # Mail transfer agent (priority: 3)
├── admin-ui-notifications/  # Notifications management (priority: 3)
├── admin-ui-operations/     # Operations console (priority: 3)
├── admin-ui-privacy/        # Privacy management (priority: 3)
├── admin-ui-storage/        # Storage management (priority: 3)
└── admin-ui-subscription/   # Subscription management (priority: 3)
```

### Packages (packages/)

```
packages/
├── ui-components/    # @zextras/ui-components - Shared UI component library
└── test-utils/       # admin-ui-test-utils - Testing utilities and mocks
```

## Testing Guide

### Testing Framework

This monorepo uses **Vitest** with **@vitest/browser** for browser-based testing:

- **Unit tests** - Test pure functions, hooks, and utilities in Node.js
- **Browser tests** - Test React components with real DOM using Playwright
- **MSW** - Mock Service Worker for API mocking

### Running Tests

#### Local Development

```bash
# Run tests once across all packages
pnpm test

# Run tests in watch mode with browser preview
cd apps/admin-ui-domains
pnpm test:watch
```

The `test:watch` command opens a browser with the Vitest UI for interactive testing.

#### CI Environment

```bash
# Run tests with coverage reporting
pnpm test:ci
```

## Development Guidelines

### Commit Message Format

Follow the **commitizen** convention:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat` - New features (use sparingly, only for user-visible changes)
- `fix` - Bug fixes
- `chore` - Maintenance tasks
- `docs` - Documentation changes
- `style` - Formatting changes
- `test` - Test additions/modifications
- `refactor` - Code restructuring (use sparingly, only for >6 files)

**Scope Format:**

- Root changes: `[root]`
- Monorepo app: `[app-name]`
- Specific file: `(filename)` after type

**Examples:**

```
feat[admin-ui-domains](domain-list): add pagination controls
fix[admin-ui-bootstrap](auth): resolve token refresh race condition
chore[root](pnpm-lock): update @types/react to 19.2.11
```

**Content Rules:**

- Keep title under 50 characters
- Wrap body at 72 characters
- Stay factual and humble
- Focus on what changed, not why

## Troubleshooting

### Dependency Issues

If you encounter dependency-related errors:

```bash
# Run full reset
pnpm reset
```

This cleans all caches and reinstalls dependencies from scratch.

### Build Failures

If builds fail unexpectedly:

1. **Clear Turbo cache:**

   ```bash
   rm -rf .turbo
   ```

2. **Clean build outputs:**

   ```bash
   pnpm --filter @zextras/admin-ui-bootstrap clean
   ```

3. **Check Node.js version:**
   ```bash
   node --version  # Should be >=22.14.0
   ```

### Test Timeout Issues

If tests timeout or hang:

1. **Use timeout command:**

   ```bash
   timeout 120 pnpm test
   ```

2. **Check for `test.only` or `it.only`:**

   - Never remove `.only` from tests
   - These indicate tests currently under development

3. **Verify browser availability:**
   ```bash
   pnpm exec playwright install chromium
   ```

### Module Resolution Problems

If imports fail to resolve:

1. **Verify workspace protocol:**

   ```json
   {
     "dependencies": {
       "@zextras/ui-components": "workspace:*"
     }
   }
   ```

2. **Clean and reinstall:**

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

3. **Check TypeScript paths in tsconfig.json**

## License

This project is licensed under **AGPL-3.0-only**.

### License Files

- **Main License:** `LICENSES/AGPL-3.0-only.txt`
- **REUSE Compliance:** This project follows the REUSE specification for license management
