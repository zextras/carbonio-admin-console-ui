# Carbonio Admin UI Monorepo

A monorepo containing the Carbonio Admin Console UI and related packages, managed with pnpm workspaces and Turborepo.

## Overview

This monorepo houses the administrative interface for Zextras Carbonio, organized into applications and shared packages.

## Prerequisites

- **Node.js** - Version compatible with browserslist requirements
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

## Available Scripts

All scripts use Turborepo for efficient task orchestration across workspaces.

### Building

#### `pnpm build`

Builds all applications and packages in the correct order, respecting dependencies.

```bash
pnpm build
```

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

### Working Across Multiple Packages

When making changes that affect multiple packages:

```bash
# Build all packages (from root)
pnpm build

# Type-check everything
pnpm type-check

# Run all tests
pnpm test
```

## Workspace Management

### Understanding Workspaces

This monorepo uses pnpm workspaces to manage multiple packages:

- **`apps/*`** - Standalone applications (e.g., admin-ui-console)
- **`packages/*`** - Shared packages used across apps

### Workspace Dependencies

Packages reference each other using the `workspace:*` protocol:

```json
{
	"dependencies": {
		"@zextras/admin-ui-bootstrap": "workspace:*",
		"admin-ui-sdk": "workspace:*"
	}
}
```

This ensures you're always using the local version during development.

### Adding Dependencies

```bash
# Add a dependency to a specific workspace
pnpm add <package> --filter <appname>

# Add a dev dependency to the root
pnpm add -D <package> -w

# Add a dependency to all workspaces
pnpm add <package> -r
```
