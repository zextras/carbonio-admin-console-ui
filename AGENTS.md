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
- Use `type` for component Props and State (more constrained, prevents accidental extension)
- Use `interface` for public API definitions where consumers may need declaration merging
- Use `Array<SomeType>` instead of `SomeType[]` for array types
- Example: `type Items = Array<Item>` not `type Items = Item[]`
- Avoid empty interface `{}` and `Object` — they accept any non-nullish value; use `Record<string, never>` for truly empty objects

### Function Definitions
- Use arrow functions for React components, directly exported with a named export
- Use regular function declarations for all other (non-component) logic
- **Never use IIFEs** (Immediately Invoked Function Expressions) — extract to a variable or a named function instead
- Example:
  ```typescript
  // Component
  export const MyComponent = ({ title }: MyComponentProps) => {
    return <div>{title}</div>;
  };

  // Logic
  function calculateTotal(items: Array<Item>): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }
  ```

### React Compiler
- This project uses the **React Compiler** (babel plugin)
- **Do not use `useMemo` or `useCallback`** — the compiler handles memoization automatically
- Writing manual memoization hooks is redundant and linters will flag them

### React Components
- Use named exports only, no default exports
- Do not use `FC` — use arrow function consts with an explicit props type, directly exported
- Return type is inferred; do not annotate it explicitly
- Example: `export const ComponentName = ({ title }: ComponentNameProps) => { ... };`

#### Typing Component Props
- `children?: React.ReactNode` — accepts everything React can render (preferred over `JSX.Element`)
- `style?: React.CSSProperties` — for style props
- Function props: `onClick: () => void` or `onChange: (id: number) => void`
- Event handler props: `onChange?: React.ChangeEventHandler<HTMLInputElement>`
- State setter as prop: `setState: React.Dispatch<React.SetStateAction<number>>`
- Component as prop: `view: React.ComponentType<SomeProps>`
- Optional props use `?:` suffix (e.g. `disabled?: boolean`)

#### Hooks Typing
- `useState`: type inference works for simple values; use explicit generic for nullable state:
  ```typescript
  const [user, setUser] = useState<User | null>(null);
  ```
- `useRef` for DOM elements: `useRef<HTMLDivElement>(null)` — be specific with element type
- `useRef` for mutable values: `useRef<number | null>(null)`
- `useReducer`: use discriminated unions for action types:
  ```typescript
  type Action = { type: 'increment'; payload: number } | { type: 'reset' };
  ```
- Custom hooks returning arrays: use `as const` to get tuple types instead of union arrays
- **Do not use `useMemo` or `useCallback`** — the React Compiler handles memoization

#### Context
- Create context with `null` default when there's no meaningful default:
  ```typescript
  const UserContext = createContext<User | null>(null);
  ```
- Provide a custom hook that throws if context is missing (prefer runtime checks over type assertions):
  ```typescript
  function useUser(): User {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error('useUser must be used within <UserProvider>');
    return ctx;
  }
  ```

#### Forms & Events
- Prefer inline handlers — TypeScript infers event types automatically:
  ```typescript
  <input onChange={(e) => { /* e is typed */ }} />
  ```
- For extracted handlers, use: `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`, `React.KeyboardEvent<HTMLInputElement>`, etc.
- `React.ReactNode` is the return value of a component; `React.JSX.Element` is the return value of `React.createElement`

#### Refs (React 19+)
- `ref` is a regular prop — no `forwardRef` needed
- Inherit all native element props (including ref): `React.ComponentPropsWithRef<'input'>`
- Or explicit ref typing: `ref?: React.Ref<HTMLDivElement>`

#### Component Patterns
- **Extract props from existing component:** `type Props = React.ComponentProps<typeof Button>`
- **Wrap/mirror HTML elements:** extend `React.ComponentPropsWithoutRef<'button'>`
- **Generic components:**
  ```typescript
  const List = <T,>({ items, renderItem }: { items: Array<T>; renderItem: (item: T) => React.ReactNode }) => { ... };
  ```
- **Conditional props** (one or the other, not both): use `never` — `{ foo: string; bar?: never } | { bar: string; foo?: never }`
- **Discriminated unions** for props that vary by type: `{ type: 'button'; onClick: () => void } | { type: 'link'; href: string }`

### Testing
- Always add timeout instruction when running tests: `testTimeout: 10_000` (default) or `20_000` for CI
- **Never** remove `.test.only` or `it.only` - they are intentional
- Use Vitest globals (no need to import describe, it, expect, etc.)
- Browser tests use `.browser.test.tsx` extension and run in Playwright
- Unit tests use `.test.ts`/`.test.tsx` and run in jsdom
- Use `admin-ui-test-utils` for shared test utilities
- Full browser-test conventions (setup, locators, interactions, TanStack Form, MSW) are documented in `docs/browser-test-conventions.md`
- **Never use `getByTestId`** in browser tests — it couples tests to implementation details invisible to users. Prefer user-facing selectors in this priority order:
  1. `getByRole` (e.g. `getByRole('button', { name: 'Save' })`)
  2. `getByLabelText` (e.g. `getByLabelText('Domain Name')`)
  3. `getByText` / `getByPlaceholder` (visible text content)
  4. For icon-only buttons without `aria-label`: locate the rendered icon via its visible attribute (e.g. `page.getByTestId('icon: CloseOutline')`)
- **`page.locator` does not exist** in Vitest browser mode — the `page` object from `vitest/browser` is NOT a Playwright Page. Use `page.getByRole`, `page.getByText`, `page.getByTestId`, or `userEvent` for all interactions instead.

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
