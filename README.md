# Carbonio Admin UI Monorepo

Carbonio Admin Console UI is the web-based administrative interface for [Zextras Carbonio](https://www.zextras.com/carbonio/), providing domain management, backup, storage, MTA configuration, and other administrative capabilities through a micro-frontend architecture.

It is organized as a monorepo of 12 admin modules and shared packages, managed with pnpm workspaces and Turborepo.

## Quick Start

### Prerequisites

- **Node.js** >= 22.14.0
- **pnpm** 10.15.0

### Building

```bash
# Install dependencies
pnpm install

# Build all applications
pnpm build

# Start the dev server
pnpm dev
```

To build the distributable packages (deb/rpm) using [YAP](https://github.com/m0rf30/yap) in a container:

```bash
make build                         # Build JS apps and package for Ubuntu 22.04
make build TARGET=ubuntu-noble     # Build for Ubuntu 24.04
make build TARGET=rocky-9          # Build for Rocky Linux 9
```

Other available `make` targets (run `make help` for the full list):

| Target            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `make install`    | Install all dependencies                             |
| `make build-dev`  | Build JS apps in development mode, without packaging |
| `make test`       | Run tests                                            |
| `make lint`       | Run ESLint and TypeScript type checks                |
| `make clean`      | Remove build artifacts and cache                     |
| `make reset`      | Full clean reinstall                                 |
| `make deploy`     | Deploy to `TEST_HOST` defined in `.env`              |
| `make deploy-dev` | Deploy development build to `TEST_HOST`              |

## Installation

This package is distributed as part of the [Carbonio platform](https://zextras.com/carbonio). To install:

### Ubuntu (Jammy/Noble)

```bash
apt-get install carbonio-admin-console-ui
```

### Rocky Linux (8/9)

```bash
yum install carbonio-admin-console-ui
```

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

```bash
pnpm build      # Build all applications in dependency order
pnpm build:dev  # Build in development mode (no cache)
```

`pnpm build`:

- Builds the shell application (admin-ui-bootstrap)
- Builds all admin modules
- Generates the unified package structure in `/dist/` directory
- Creates import maps and component manifests

### Deployment

```bash
pnpm run deploy <hostname>      # Build and deploy to a remote host
pnpm run deploy:dev <hostname>  # Deploy development build
```

The deploy script:

- Runs `pnpm build`
- Creates .deb packages using YAP
- Uploads the package to the remote host
- Installs the package via apt

### Testing

```bash
pnpm test     # Run tests once across all packages
pnpm test:ci  # Run tests with coverage reporting (CI mode)
```

### Code Quality

```bash
pnpm type-check  # TypeScript type checking
pnpm lint        # Run ESLint
pnpm lint:fix    # Auto-fix ESLint issues
pnpm type-lint   # Type check + lint combined
```

### Working with Individual Apps

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
    "@zextras/ui-shared": "workspace:*",
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
1. **Modules** (other apps) - Independent features loaded dynamically by the shell
1. **Shared Dependencies** - Vendored common libraries (React, tanstack-query , etc.) loaded once as a singleton

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

```text
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

```text
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

```text
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

```text
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
pnpm reset
```

This cleans all caches and reinstalls dependencies from scratch.

### Build Failures

If builds fail unexpectedly:

1. **Clear Turbo cache:**

   ```bash
   rm -rf .turbo
   ```

1. **Clean and reinstall:**

   ```bash
   pnpm reset
   ```

1. **Check Node.js version:**

   ```bash
   node --version  # Should be >=22.14.0
   ```

### Test Timeout Issues

If tests timeout or hang:

1. **Use timeout command:**

   ```bash
   timeout 120 pnpm test
   ```

1. **Check for `test.only` or `it.only`:**

   - Never remove `.only` from tests
   - These indicate tests currently under development

1. **Verify browser availability:**

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

1. **Clean and reinstall:**

   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

1. **Check TypeScript paths in tsconfig.json**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for information on how to contribute to this project.

## License

This project is licensed under the GNU Affero General Public License v3.0 - see the [LICENSE.md](LICENSE.md) file for details.

This project follows the [REUSE specification](https://reuse.software/) for license management. The full license text is also available at `LICENSES/AGPL-3.0-only.txt`.
