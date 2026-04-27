# AGENTS.md

This file provides guidance for agentic coding assistants working in this repository.

## Development Commands

### Root Level (Turborepo)
- `pnpm install` - Install all dependencies across workspaces
- `pnpm build` - Build all packages in dependency order
- `pnpm build:dev` - Development build without caching
- `pnpm test` - Run tests across all packages
- `pnpm test:ci` - Run tests with coverage for CI
- `pnpm type-check` - TypeScript type checking across all packages
- `pnpm lint` - ESLint across all packages
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm type-lint` - Type check + lint combined
- `pnpm reset` - Full clean reinstall (removes node_modules, lock file, cache)

### App/Package Specific
- `pnpm build` - SDK build (within app directory)
- `pnpm deploy` - Build and deploy (within app directory)
- `pnpm test` - Vitest run (within app directory)
- `pnpm test:watch` - Vitest with browser preview and watching (within app directory)
- `pnpm test:ci` - Vitest with coverage for CI (within app directory)

### Running a Single Test
- `pnpm vitest run <test-file>` - Run specific test file from root
- `pnpm vitest run <test-file> --reporter=verbose` - Run with verbose output
- `HEADED=true vitest run <test-file>` - Run with visible browser window
- Example: `pnpm vitest run apps/admin-ui-dashboard/src/views/dashboard/tests/license-banner.browser.test.tsx`
- From within an app: `vitest run <relative-path-to-test-file>`

### Package Management
- `pnpm add <package> --filter <appname>` - Add to specific workspace
- `pnpm add -D <package> -w` - Add dev dependency to root
- `pnpm add <package> -r` - Add to all workspaces

## Code Style Guidelines

### File Header
Every source file must include the SPDX license header (auto-enforced by eslint):
```typescript
/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
```
Year is auto-updated by eslint. The header is required in all files except:
- Icons (`**/icons/**/*.[jt]sx`)
- Configuration files (`**/*.config.*`)
- Templates and mocks
- Node modules, dist, build, coverage directories

### Imports
- Imports are auto-sorted by `eslint-plugin-simple-import-sort`
- External imports first, then internal, then type imports
- Use named exports, avoid default exports in React components

### TypeScript Types
- Use `type` annotation instead of `interface` for all type definitions
- Use `Array<SomeType>` instead of `SomeType[]` for array types
- Example: `type Items = Array<Item>` not `type Items = Item[]`

### Function Definitions
- Use arrow functions only when returning JSX
- Use regular function declaration otherwise
- Example:
  ```typescript
  // Arrow for JSX return
  const MyComponent: FC = () => <div>...</div>;

  // Function for logic
  function calculateTotal(items: Array<Item>): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
  ```

### React Components
- Use named exports only, no default exports
- Type components with `FC` from 'react': `const ComponentName: FC = () => {}`

### Testing
- Always add timeout instruction when running tests: `testTimeout: 10_000` (default) or `20_000` for CI
- **Never** remove `.test.only` or `it.only` - they are intentional
- Use Vitest globals (no need to import describe, it, expect, etc.)
- Browser tests use `.browser.test.tsx` extension and run in Playwright
- Unit tests use `.test.ts`/`.test.tsx` and run in jsdom
- Use `admin-ui-test-utils` for shared test utilities

### State Management
- Global state: Zustand stores in `store/` directories
- Server state: TanStack React Query with proper query keys
- Example query key pattern:
  ```typescript
  const accountQueryKeys = {
    all: ['account'] as const,
    info: () => [...accountQueryKeys.all, 'info'] as const,
  } as const;
  ```

### API Calls
- Use `soapFetch` for SOAP API calls
- Service files contain API request functions
- React Query hooks wrap service functions with caching and refetching
- Error handling: use snackbar feedback for user-facing errors

### Formatting (Prettier)
- Print width: 100
- Single quotes: true
- Trailing commas: all

### ESLint Rules
Key enforced rules:
- `simple-import-sort/imports` - Auto-sorted imports
- `unused-imports/no-unused-imports` - No unused imports
- `react-hooks/rules-of-hooks` - Proper hooks usage
- `@typescript-eslint/no-explicit-any` - Warn, avoid `any`
- `no-console` - Error (allow `console.error` only)

### Naming Conventions
- Components: PascalCase (`MyComponent`)
- Functions: camelCase (`calculateTotal`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Types: PascalCase (`UserProfile`)
- Hooks: camelCase with `use` prefix (`useUserData`)

### Error Handling
- User-facing errors: show snackbar via `useSnackbar()`
- API errors: check `data?.status`, `data?.error`, `err?.message`
- Provide fallback messages from i18n

### Workspace Structure
- `apps/*` - 12 admin modules (bootstrap, domains, backup, etc.)
- `packages/*` - Shared packages (ui-components, sdk, test-utils)
- Apps import TypeScript source directly from `@zextras/ui-components` (no build needed)
- Workspace dependencies use `workspace:*` protocol

### Priority Notes
When multiple skills apply, use this order:
1. Process skills first (brainstorming, debugging)
2. Implementation skills second (frontend-design, etc.)
