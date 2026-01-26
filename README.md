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

#### `pnpm build:unified`

Builds the unified admin console package for production deployment. This creates a single artifact containing all modules.

```bash
pnpm build:unified
```

This script:

- Builds the shell application (admin-ui-bootstrap)
- Builds all admin modules
- Generates the unified package structure in `package/` directory
- Creates import maps and component manifests

### Deployment

#### `pnpm deploy <hostname>`

Deploys the unified package to a remote host.

```bash
pnpm deploy kc-dev3-prymta1.demo.zextras.io
```

This script:

- Runs `pnpm build:unified`
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

You can build, test, or run scripts for specific apps:

```bash
# Build a specific app
pnpm --filter @zextras/admin-ui-domains build

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

## Build Scripts

Build scripts are located in `/scripts` at the repository root:

- **scripts/build-unified/index.ts** - Unified build orchestrator
- **scripts/build-shell.ts** - Shell (bootstrap) builder
- **scripts/build-app.ts** - Individual app builder
- **scripts/deploy.ts** - Deployment automation
- **scripts/reset.ts** - Full workspace reset
- **scripts/utils.ts** - Shared utilities

All build scripts use `tsx` for TypeScript execution:

```bash
pnpm exec tsx scripts/build-unified/index.ts
```

## Architecture

### Module System

The admin console uses a micro-frontend architecture:

1. **Shell** (`admin-ui-bootstrap`) - Provides the runtime environment, routing, and shared state
2. **Modules** (other apps) - Independent features loaded dynamically by the shell
3. **Shared Dependencies** - Vendored common libraries (React, styled-components, etc.) loaded once

### Import Maps

The build system generates import maps to resolve module dependencies:

```json
{
  "imports": {
    "@zextras/admin-ui-domains": "/static/iris/carbonio-admin-ui-domains/{commit}/app-view.mjs",
    "react": "/static/iris/shared-dependencies/{commit}/index.mjs"
  }
}
```
